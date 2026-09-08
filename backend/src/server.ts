// Plum launch API. Run from backend/: npm run dev (reads ../.env). Credentials stay in this process.
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { ConfigError, loadConfig, type Config } from './config.ts'
import { openDatabase } from './db.ts'
import { HttpError, RateLimiter, clientIp, parseCookies, sendJson, type Router } from './http.ts'
import { createChainReader, type ChainReader } from './chain/client.ts'
import { createAuth } from './auth.ts'
import { createUploads, localImageStore } from './uploads.ts'
import { createIntents } from './intents.ts'
import { createLaunches } from './launches.ts'
import { createPons } from './pons.ts'
import { createMobula } from './market/mobula.ts'
import { buildRouter, type Services } from './routes.ts'

export function createServices(config: Config, options: { chain?: ChainReader; dbPath?: string; fetch?: typeof fetch } = {}): Services & { db: ReturnType<typeof openDatabase>; market: ReturnType<typeof createMobula> } {
  const db = openDatabase(options.dbPath ?? config.dbPath)
  const chain = options.chain ?? createChainReader(config)
  const auth = createAuth(db, config, chain)
  const uploads = createUploads(db, localImageStore(config.uploadDir), config.publicUrl)
  const intents = createIntents(db, config, chain, uploads)
  const market = createMobula(db, { apiKey: config.mobulaApiKey, baseUrl: config.mobulaBaseUrl, chainId: config.chainId, fetch: options.fetch })
  const launches = createLaunches(db, chain, market)
  const pons = createPons(db, chain, market, config.factory)
  return { config, chain, auth, uploads, intents, launches, pons, db, market }
}

export function createHandler(router: Router) {
  // Explore reads five routes on load and three every half minute, plus a 3 s poll while a launch settles;
  // this cap is for abuse, generous enough that a shared address (an office, a bad proxy) still browses.
  const global = new RateLimiter(1200, 60_000)
  setInterval(() => global.sweep(), 60_000).unref()
  return async (req: IncomingMessage, res: ServerResponse) => {
    const started = Date.now()
    const url = new URL(req.url ?? '/', 'http://localhost')
    const method = req.method ?? 'GET'
    const ip = clientIp(req)
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Referrer-Policy', 'no-referrer')
    try {
      global.check(ip)
      const match = router.match(method, url.pathname)
      if (match === null) throw new HttpError(404, 'No such route', 'not_found')
      if (match === 'method') throw new HttpError(405, 'Method not allowed', 'method_not_allowed')
      const result = await match.handler({ req, res, method, url, params: match.params, ip, cookies: parseCookies(req.headers.cookie) })
      if (!res.headersSent && result !== undefined) sendJson(res, res.statusCode === 200 ? 200 : res.statusCode, result)
      else if (!res.headersSent) res.end()
    } catch (error) {
      if (error instanceof HttpError) {
        sendJson(res, error.status, { error: { code: error.code, message: error.message, details: error.details } })
      } else {
        console.error(`${method} ${url.pathname} failed`, error instanceof Error ? error.message.replace(/https?:\/\/\S+/g, '[endpoint]').slice(0, 300) : error)
        sendJson(res, 502, { error: { code: 'upstream', message: 'The launch service could not complete that request. Try again shortly.' } })
      }
    } finally {
      if (process.env.PLUM_LOG_REQUESTS === '1') console.log(`${method} ${url.pathname} ${res.statusCode} ${Date.now() - started}ms`)
    }
  }
}

if (import.meta.main) {
  let config: Config
  try { config = loadConfig() } catch (error) {
    if (error instanceof ConfigError) { console.error(`Configuration error: ${error.message}`); process.exit(1) }
    throw error
  }
  const services = createServices(config)
  const stop = services.intents.startWorker(config.reconcileIntervalMs)
  const server = createServer(createHandler(buildRouter(services)))
  server.listen(config.port, config.host, () => {
    console.log(`Plum API listening on http://${config.host}:${config.port} for chain ${config.chainId}; market data ${services.market.enabled ? 'enabled' : 'disabled (no MOBULA_API_KEY)'}`)
  })
  const shutdown = () => { stop(); server.close(); services.db.close(); process.exit(0) }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}
