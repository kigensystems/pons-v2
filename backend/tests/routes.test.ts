// End-to-end over HTTP with the fake chain: sign-in, upload, intent, submission, registry.
import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { keccak256, toHex } from 'viem'
import { createHandler, createServices } from '../src/server.ts'
import { buildRouter } from '../src/routes.ts'
import { creator, fakeChain, mine, testConfig, TOKEN } from './fixtures.ts'

const config = testConfig({ uploadDir: `${process.env.TMPDIR ?? '/tmp'}/plum-test-uploads-${process.pid}`, mobulaApiKey: 'test-key' })
const chain = fakeChain()
const upstream: string[] = []
const services = createServices(config, { chain, dbPath: ':memory:', fetch: (async (url: string | URL) => { upstream.push(String(url)); return new Response(JSON.stringify({ data: String(url).includes('ohlcv') ? [] : { price: 2 } }), { status: 200 }) }) as typeof fetch })
const server = createServer(createHandler(buildRouter(services)))
await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`
after(() => { server.close(); services.db.close() })

let cookie = ''
async function api(path: string, init: RequestInit & { json?: unknown; raw?: Buffer; origin?: string | null } = {}) {
  const headers: Record<string, string> = { ...(init.headers as Record<string, string>) }
  if (init.origin !== null) headers.Origin = init.origin ?? config.origin
  if (cookie) headers.Cookie = cookie
  if (init.json !== undefined) headers['Content-Type'] = 'application/json'
  const response = await fetch(base + path, { ...init, headers, body: init.json !== undefined ? JSON.stringify(init.json) : init.raw ?? init.body })
  const setCookie = response.headers.get('set-cookie')
  if (setCookie) cookie = setCookie.split(';')[0]!
  const type = response.headers.get('content-type') ?? ''
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body: any = type.includes('json') ? await response.json() : await response.arrayBuffer()
  return { status: response.status, body, headers: response.headers }
}

test('health and launch-config are public; writes need same-origin and a session', async () => {
  assert.deepEqual((await api('/api/health')).body, { ok: true, chainId: 4663, factory: config.factory, client: '127.0.0.1' })
  const settings = await api('/api/launch-config')
  assert.equal(settings.status, 200)
  assert.equal(settings.body.launchFeeWei, '500000000000000')
  assert.equal(settings.body.configs[0].supply, '1000000000000000000000000000')
  assert.equal(settings.body.eligibility, null)
  assert.equal((await api('/api/launch-config?chainId=1')).status, 404)
  assert.equal((await api('/api/launch-intents', { method: 'POST', json: {}, origin: 'https://evil.example' })).status, 403)
  assert.equal((await api('/api/launch-intents', { method: 'POST', json: {}, origin: null })).status, 403)
  assert.equal((await api('/api/launch-intents', { method: 'POST', json: {} })).status, 401)
  assert.equal((await api('/api/auth/session')).body.session, null)
  assert.equal((await api('/api/nope')).status, 404)
  assert.equal((await api('/api/health', { method: 'DELETE' })).status, 405)
})

test('wallet sign-in, upload, intent, submission and registry listing work end to end', async () => {
  const challenge = await api('/api/auth/challenge', { method: 'POST', json: { address: creator.address, chainId: 4663 } })
  assert.equal(challenge.status, 200)
  const signature = await creator.signMessage({ message: challenge.body.message })
  const verified = await api('/api/auth/verify', { method: 'POST', json: { message: challenge.body.message, signature } })
  assert.equal(verified.status, 200)
  assert.equal(verified.body.session.address, creator.address)
  assert.equal((await api('/api/auth/session')).body.session.address, creator.address)
  assert.equal((await api('/api/launch-config')).body.eligibility.canLaunch, true)

  const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(8)])
  const upload = await api('/api/uploads', { method: 'POST', raw: png, headers: { 'Content-Type': 'image/png' } })
  assert.equal(upload.status, 200)
  const served = await api(`/api/uploads/${upload.body.id}`)
  assert.equal(served.status, 200)
  assert.equal(served.headers.get('content-type'), 'image/png')
  assert.equal((await api('/api/uploads', { method: 'POST', raw: Buffer.from('<svg/>'), headers: { 'Content-Type': 'image/svg+xml' } })).status, 415)

  const create = await api('/api/launch-intents', { method: 'POST', json: { name: 'Plum', symbol: 'PLUM', logoUploadId: upload.body.id, creatorTaxBps: 100 }, headers: { 'Idempotency-Key': 'route-1' } })
  assert.equal(create.status, 201)
  assert.equal(create.body.status, 'prepared')
  assert.equal(create.body.tokenParams.logo, `${config.publicUrl}/api/uploads/${upload.body.id}`)
  const replay = await api('/api/launch-intents', { method: 'POST', json: { name: 'Other', symbol: 'PLUM' }, headers: { 'Idempotency-Key': 'route-1' } })
  assert.equal(replay.status, 200)
  assert.equal(replay.body.id, create.body.id)
  assert.equal((await api('/api/launch-intents', { method: 'POST', json: { name: 'Plum', symbol: 'PLUM' } })).status, 400)

  assert.deepEqual((await api('/api/launches')).body.items, [])
  const bogus = await api(`/api/launch-intents/${create.body.id}/submission`, { method: 'POST', json: { transactionHash: keccak256(toHex('unknown')) } })
  assert.equal(bogus.body.status, 'submitted')
  const hash = mine(chain, create.body)
  const submitted = await api(`/api/launch-intents/${create.body.id}/submission`, { method: 'POST', json: { transactionHash: hash } })
  assert.equal(submitted.status, 200)
  assert.equal(submitted.body.status, 'included')
  assert.equal((await api(`/api/launch-intents/${create.body.id}`)).body.launch.token, TOKEN.toLowerCase())

  chain.tokens.set(TOKEN.toLowerCase(), { exists: true, phase: 0, phaseName: 'NotGraduated', curve: create.body.transaction.to, deployer: creator.address, creatorFeeRecipient: creator.address, pairToken: create.body.pairToken, creatorTaxBps: 100, buybackEnabled: false, graduationThreshold: 1n })
  const list = await api('/api/launches?search=plu')
  assert.equal(list.body.items.length, 1)
  assert.equal(list.body.items[0].token, TOKEN)
  assert.equal(list.body.items[0].symbol, 'PLUM')
  assert.equal(list.body.items[0].confirmationState, 'included')
  assert.equal(list.body.items[0].protocol.onCurve, true)
  assert.equal(list.body.items[0].market.status, 'ok')
  assert.equal(list.body.items[0].market.payload.priceUsd, 2)
  assert.deepEqual(list.body.stats, { total: 1, confirmed: 0 })
  assert.equal((await api('/api/launches?search=zzz')).body.items.length, 0)
  const detail = await api(`/api/launches/4663/${TOKEN}`)
  assert.equal(detail.status, 200)
  assert.match(detail.body.explorer.transaction, /blockscout\.com\/tx\/0x/)
  assert.equal((await api(`/api/launches/4663/${creator.address}`)).status, 404)
  assert.equal((await api(`/api/launches/4663/${TOKEN}/candles?period=2h`)).status, 400)
  assert.equal((await api(`/api/launches/4663/${TOKEN}/candles?period=1h&from=1&to=2`)).status, 400)
  // Candle windows snap to the period, so two nearby requests share one upstream chart.
  const t = 1_788_000_000
  assert.equal((await api(`/api/launches/4663/${TOKEN}/candles?period=1h&from=${t + 1}&to=${t + 7200}`)).status, 200)
  assert.equal((await api(`/api/launches/4663/${TOKEN}/candles?period=1h&from=${t + 999}&to=${t + 7777}`)).status, 200)
  const charts = upstream.filter(u => u.includes('ohlcv'))
  assert.equal(charts.length, 1)
  assert.match(charts[0]!, /from=1787832000000&to=1788048000000/)

  assert.equal((await api('/api/auth/logout', { method: 'POST', json: {} })).status, 200)
  assert.equal((await api('/api/auth/session')).body.session, null)
})
