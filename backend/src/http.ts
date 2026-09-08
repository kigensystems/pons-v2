// Minimal HTTP plumbing over node:http: routing, JSON bodies with size caps, cookies, rate limits.
import type { IncomingMessage, ServerResponse } from 'node:http'
import { createHmac, timingSafeEqual } from 'node:crypto'

export class HttpError extends Error {
  status: number
  code: string
  details: unknown
  constructor(status: number, message: string, code = 'error', details?: unknown) { super(message); this.status = status; this.code = code; this.details = details }
}

export type Ctx = {
  req: IncomingMessage
  res: ServerResponse
  method: string
  url: URL
  params: Record<string, string>
  ip: string
  cookies: Record<string, string>
}
export type Handler = (ctx: Ctx) => Promise<unknown> | unknown
type Route = { method: string; pattern: RegExp; keys: string[]; handler: Handler }

export class Router {
  private routes: Route[] = []
  add(method: string, path: string, handler: Handler) {
    const keys: string[] = []
    const pattern = new RegExp('^' + path.replace(/:([a-zA-Z]+)/g, (_, key) => { keys.push(key); return '([^/]+)' }) + '/?$')
    this.routes.push({ method, pattern, keys, handler })
    return this
  }
  match(method: string, pathname: string): { handler: Handler; params: Record<string, string> } | 'method' | null {
    let pathMatched = false
    for (const route of this.routes) {
      const found = route.pattern.exec(pathname)
      if (!found) continue
      pathMatched = true
      if (route.method !== method) continue
      const params: Record<string, string> = {}
      route.keys.forEach((key, i) => { params[key] = decodeURIComponent(found[i + 1]!) })
      return { handler: route.handler, params }
    }
    return pathMatched ? 'method' : null
  }
}

export function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {}
  for (const part of header?.split(';') ?? []) {
    const index = part.indexOf('=')
    if (index < 0) continue
    out[part.slice(0, index).trim()] = decodeURIComponent(part.slice(index + 1).trim())
  }
  return out
}

export async function readBody(req: IncomingMessage, limit: number): Promise<Buffer> {
  const declared = Number(req.headers['content-length'] ?? 0)
  if (declared > limit) throw new HttpError(413, `Body exceeds ${limit} bytes`, 'too_large')
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req) {
    size += (chunk as Buffer).length
    if (size > limit) throw new HttpError(413, `Body exceeds ${limit} bytes`, 'too_large')
    chunks.push(chunk as Buffer)
  }
  return Buffer.concat(chunks)
}

export async function readJson<T = Record<string, unknown>>(req: IncomingMessage, limit = 64 * 1024): Promise<T> {
  const type = req.headers['content-type'] ?? ''
  if (!type.startsWith('application/json')) throw new HttpError(415, 'Expected application/json', 'unsupported_media')
  const body = await readBody(req, limit)
  if (body.length === 0) return {} as T
  try { return JSON.parse(body.toString('utf8')) as T } catch { throw new HttpError(400, 'Malformed JSON', 'bad_json') }
}

export function sendJson(res: ServerResponse, status: number, value: unknown, headers: Record<string, string> = {}) {
  const body = JSON.stringify(value, (_key, v) => typeof v === 'bigint' ? v.toString() : v)
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers })
  res.end(body)
}

// Fixed-window limiter keyed by caller and bucket. In-memory: adequate for one process; a
// multi-instance deployment needs a shared store.
export class RateLimiter {
  private hits = new Map<string, { count: number; reset: number }>()
  private limit: number
  private windowMs: number
  constructor(limit: number, windowMs: number) { this.limit = limit; this.windowMs = windowMs }
  check(key: string) {
    const now = Date.now()
    const entry = this.hits.get(key)
    if (!entry || entry.reset <= now) { this.hits.set(key, { count: 1, reset: now + this.windowMs }); return }
    if (++entry.count > this.limit) throw new HttpError(429, 'Too many requests', 'rate_limited')
  }
  sweep() { const now = Date.now(); for (const [key, entry] of this.hits) if (entry.reset <= now) this.hits.delete(key) }
}

// The key rate limits are counted against. Behind the Netlify proxy (PLUM_TRUST_PROXY=1) the browser's
// address arrives in x-nf-client-connection-ip, the header Netlify commits to; X-Forwarded-For is the
// fallback for other proxies. Without a proxy header every viewer would share the proxy's address and
// one limit, so /api/health echoes this key for the post-deploy check. A request that did not carry the
// proxy signature (only /api/health gets that far) is keyed on its socket address, since its headers are its own.
export function clientIp(req: IncomingMessage, trustHeaders = true): string {
  if (trustHeaders && process.env.PLUM_TRUST_PROXY === '1') {
    for (const name of ['x-nf-client-connection-ip', 'true-client-ip', 'x-forwarded-for']) {
      const raw = req.headers[name]
      const first = (Array.isArray(raw) ? raw[0] : raw)?.split(',')[0]?.trim()
      if (first) return first
    }
  }
  return req.socket.remoteAddress ?? 'unknown'
}

// Netlify signs every proxied request with a JWS (HMAC SHA-256 over the base64url header and payload,
// iss "netlify", short exp) in x-nf-sign when the redirect names a secret. A request without a valid,
// unexpired signature did not come through the site's proxy.
export function verifyProxySignature(header: string | string[] | undefined, secret: string, now = Date.now()): boolean {
  const token = Array.isArray(header) ? header[0] : header
  if (!token || token.length > 2048) return false
  const parts = token.split('.')
  if (parts.length !== 3) return false
  const [head, payload, signature] = parts as [string, string, string]
  const expected = createHmac('sha256', secret).update(`${head}.${payload}`).digest()
  let given: Buffer
  try { given = Buffer.from(signature, 'base64url') } catch { return false }
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return false
  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { iss?: unknown; exp?: unknown }
    return claims.iss === 'netlify' && typeof claims.exp === 'number' && claims.exp * 1000 > now
  } catch { return false }
}
