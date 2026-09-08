// Route table. Every write requires a same-origin request and a wallet session; responses never carry
// provider secrets or raw upstream errors.
import { zeroAddress } from 'viem'
import { HttpError, RateLimiter, Router, readBody, readJson, type Ctx } from './http.ts'
import type { Config } from './config.ts'
import type { ChainReader } from './chain/client.ts'
import type { createAuth } from './auth.ts'
import type { createUploads } from './uploads.ts'
import type { createIntents } from './intents.ts'
import type { createLaunches } from './launches.ts'
import type { createPons } from './pons.ts'
import { MAX_IMAGE_BYTES } from './uploads.ts'

export type Services = {
  config: Config
  chain: ChainReader
  auth: ReturnType<typeof createAuth>
  uploads: ReturnType<typeof createUploads>
  intents: ReturnType<typeof createIntents>
  launches: ReturnType<typeof createLaunches>
  pons: ReturnType<typeof createPons>
}

export function buildRouter(s: Services): Router {
  const router = new Router()
  const limits = { auth: new RateLimiter(60, 60_000), write: new RateLimiter(30, 60_000), upload: new RateLimiter(10, 60_000), market: new RateLimiter(60, 60_000) }
  setInterval(() => Object.values(limits).forEach(l => l.sweep()), 60_000).unref()

  function sameOrigin(ctx: Ctx) {
    const origin = ctx.req.headers.origin
    if (origin !== s.config.origin) throw new HttpError(403, 'Cross-origin write refused', 'bad_origin')
  }
  const header = (ctx: Ctx, name: string) => { const v = ctx.req.headers[name]; return (Array.isArray(v) ? v[0] : v) ?? '' }

  // client is the address rate limits count against; through the Netlify proxy it must be the caller's own.
  router.add('GET', '/api/health', ctx => ({ ok: true, chainId: s.config.chainId, factory: s.config.factory, client: ctx.ip }))

  router.add('POST', '/api/auth/challenge', async ctx => {
    sameOrigin(ctx); limits.auth.check(ctx.ip)
    return s.auth.challenge(await readJson(ctx.req))
  })
  router.add('POST', '/api/auth/verify', async ctx => {
    sameOrigin(ctx); limits.auth.check(ctx.ip)
    const { session, setCookie } = await s.auth.verify(await readJson(ctx.req))
    ctx.res.setHeader('Set-Cookie', setCookie)
    return { session }
  })
  router.add('GET', '/api/auth/session', ctx => ({ session: s.auth.read(ctx) }))
  router.add('POST', '/api/auth/logout', ctx => {
    sameOrigin(ctx)
    ctx.res.setHeader('Set-Cookie', s.auth.logout(ctx))
    return { ok: true }
  })

  router.add('POST', '/api/uploads', async ctx => {
    sameOrigin(ctx)
    const session = s.auth.require(ctx)
    limits.upload.check(session.address)
    // The bytes are validated by magic number; the declared type only has to not be JSON or a form.
    const type = header(ctx, 'content-type')
    if (type && !type.startsWith('image/') && !type.startsWith('application/octet-stream')) throw new HttpError(415, 'Send the image bytes with an image/* content type', 'unsupported_media')
    const bytes = await readBody(ctx.req, MAX_IMAGE_BYTES)
    return s.uploads.store(session.address, bytes)
  })
  router.add('GET', '/api/uploads/:id', async ctx => {
    const file = await s.uploads.read(ctx.params.id!)
    if (!file) throw new HttpError(404, 'Upload not found', 'not_found')
    ctx.res.writeHead(200, { 'Content-Type': file.contentType, 'Content-Length': file.bytes.length, 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' })
    ctx.res.end(file.bytes)
    return undefined
  })

  router.add('GET', '/api/launch-config', async ctx => {
    const chainId = Number(ctx.url.searchParams.get('chainId') ?? s.config.chainId)
    if (chainId !== s.config.chainId) throw new HttpError(404, `This server serves chain ${s.config.chainId}`, 'wrong_chain')
    const [settings, pairs] = await Promise.all([s.chain.launchSettings(), s.chain.pairTokens().catch(() => null)])
    const session = s.auth.read(ctx)
    const eligibility = session ? { wallet: session.address, canLaunch: await s.chain.canLaunch(session.address, settings.blockNumber) } : null
    // ETH first, then every approved ERC-20 pair; a failed pair read leaves ETH alone rather than failing the desk.
    const eth = settings.configs[0]
    const pairTokens = [
      { address: zeroAddress, symbol: 'ETH', name: 'Ether', decimals: 18, phantomQuote: eth?.phantomQuote ?? 0n, graduationThreshold: eth?.graduationThreshold ?? 0n },
      ...(pairs?.items ?? []),
    ]
    return { chainId, factory: s.config.factory, router: s.config.router, pairTokens, pairTokensObservedAt: pairs?.observedAt ?? null, initialBuy: 'unavailable', ...settings, eligibility }
  })

  router.add('POST', '/api/launch-intents', async ctx => {
    sameOrigin(ctx)
    const session = s.auth.require(ctx)
    limits.write.check(session.address)
    const { intent, created } = await s.intents.create(session.address, header(ctx, 'idempotency-key'), await readJson(ctx.req))
    ctx.res.statusCode = created ? 201 : 200
    return intent
  })
  router.add('GET', '/api/launch-intents/:id', ctx => s.intents.get(ctx.params.id!, s.auth.require(ctx).address))
  router.add('POST', '/api/launch-intents/:id/submission', async ctx => {
    sameOrigin(ctx)
    const session = s.auth.require(ctx)
    limits.write.check(session.address)
    return s.intents.submit(ctx.params.id!, session.address, await readJson(ctx.req))
  })

  router.add('GET', '/api/launches', ctx => s.launches.list({
    search: ctx.url.searchParams.get('search') ?? undefined, cursor: ctx.url.searchParams.get('cursor') ?? undefined, limit: ctx.url.searchParams.get('limit') ?? undefined,
  }))
  router.add('GET', '/api/pons/coins', () => s.pons.coins())
  router.add('GET', '/api/pons/spotlight', () => s.pons.spotlight())
  router.add('GET', '/api/launches/:chainId/:token', ctx => s.launches.get(Number(ctx.params.chainId), ctx.params.token!))
  // Each distinct candle window is a Mobula call; the window is quantized in launches.ts and the caller is metered.
  router.add('GET', '/api/launches/:chainId/:token/candles', ctx => { limits.market.check(ctx.ip); return s.launches.candles(Number(ctx.params.chainId), ctx.params.token!, {
    period: ctx.url.searchParams.get('period') ?? undefined, from: ctx.url.searchParams.get('from') ?? undefined, to: ctx.url.searchParams.get('to') ?? undefined,
  }) })

  return router
}
