// Sign-In with Ethereum (EIP-4361) sessions. The wallet signs a server-issued nonce bound to our
// domain and chain; the session is an opaque random token in an HttpOnly cookie, stored hashed.
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { getAddress, isAddress, isHex, type Address, type Hex } from 'viem'
import { createSiweMessage, generateSiweNonce, parseSiweMessage } from 'viem/siwe'
import { HttpError, type Ctx } from './http.ts'
import { now, type Db } from './db.ts'
import type { Config } from './config.ts'
import type { ChainReader } from './chain/client.ts'

export const SESSION_COOKIE = 'plum_session'
const NONCE_TTL_SECONDS = 5 * 60

export type Session = { address: Address; chainId: number; expiresAt: number }

const hash = (value: string) => createHash('sha256').update(value).digest('hex')

export function createAuth(db: Db, config: Config, chain: ChainReader) {
  const origin = new URL(config.origin)
  const domain = origin.host
  const secure = origin.protocol === 'https:'

  const insertNonce = db.prepare('INSERT INTO auth_nonces (nonce, address, chain_id, expires_at) VALUES (?, ?, ?, ?)')
  const selectNonce = db.prepare('SELECT address, chain_id, expires_at FROM auth_nonces WHERE nonce = ?')
  const deleteNonce = db.prepare('DELETE FROM auth_nonces WHERE nonce = ?')
  const insertSession = db.prepare('INSERT INTO sessions (token_hash, address, chain_id, created_at, expires_at) VALUES (?, ?, ?, ?, ?)')
  const selectSession = db.prepare('SELECT address, chain_id, expires_at FROM sessions WHERE token_hash = ?')
  const deleteSession = db.prepare('DELETE FROM sessions WHERE token_hash = ?')
  const sweep = db.prepare('DELETE FROM auth_nonces WHERE expires_at < ?; ')
  const sweepSessions = db.prepare('DELETE FROM sessions WHERE expires_at < ?')

  function cookie(value: string, maxAge: number) {
    return `${SESSION_COOKIE}=${value}; Path=/api; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? '; Secure' : ''}`
  }

  return {
    challenge(input: { address?: unknown; chainId?: unknown }): { message: string; expiresAt: number } {
      if (typeof input.address !== 'string' || !isAddress(input.address)) throw new HttpError(400, 'address must be an EVM address', 'bad_address')
      if (input.chainId !== config.chainId) throw new HttpError(400, `chainId must be ${config.chainId}`, 'wrong_chain')
      const address = getAddress(input.address)
      const nonce = generateSiweNonce()
      const issuedAt = new Date()
      const expirationTime = new Date(issuedAt.getTime() + NONCE_TTL_SECONDS * 1000)
      sweep.run(now())
      insertNonce.run(nonce, address, config.chainId, Math.floor(expirationTime.getTime() / 1000))
      const message = createSiweMessage({
        address, chainId: config.chainId, domain, nonce, uri: `${config.origin}/explore`, version: '1', issuedAt, expirationTime,
        statement: 'Sign in to Plum to prepare a launch. This signature costs nothing and sends no transaction.',
      })
      return { message, expiresAt: Math.floor(expirationTime.getTime() / 1000) }
    },

    async verify(input: { message?: unknown; signature?: unknown }): Promise<{ session: Session; setCookie: string }> {
      if (typeof input.message !== 'string' || input.message.length > 4096) throw new HttpError(400, 'message is required', 'bad_message')
      if (typeof input.signature !== 'string' || !isHex(input.signature)) throw new HttpError(400, 'signature must be hex', 'bad_signature')
      const parsed = parseSiweMessage(input.message)
      if (!parsed.address || !parsed.nonce || parsed.domain !== domain || parsed.chainId !== config.chainId) {
        throw new HttpError(400, 'Message is not a Plum sign-in for this domain and chain', 'bad_message')
      }
      const record = selectNonce.get(parsed.nonce) as { address: string; chain_id: number; expires_at: number } | undefined
      if (!record || record.expires_at < now() || getAddress(record.address) !== getAddress(parsed.address)) {
        throw new HttpError(401, 'Sign-in challenge is unknown, expired or for another wallet', 'bad_nonce')
      }
      deleteNonce.run(parsed.nonce)
      if (parsed.expirationTime && parsed.expirationTime.getTime() < Date.now()) throw new HttpError(401, 'Sign-in message expired', 'expired')
      let valid = false
      try { valid = await chain.verifySiwe(input.message, input.signature as Hex) } catch { valid = false }
      if (!valid) throw new HttpError(401, 'Signature did not verify for this wallet', 'bad_signature')

      const token = randomBytes(32).toString('base64url')
      const expiresAt = now() + config.sessionTtlSeconds
      sweepSessions.run(now())
      insertSession.run(hash(token), getAddress(parsed.address), config.chainId, now(), expiresAt)
      return { session: { address: getAddress(parsed.address), chainId: config.chainId, expiresAt }, setCookie: cookie(token, config.sessionTtlSeconds) }
    },

    read(ctx: Ctx): Session | null {
      const token = ctx.cookies[SESSION_COOKIE]
      if (!token || token.length > 128) return null
      const record = selectSession.get(hash(token)) as { address: string; chain_id: number; expires_at: number } | undefined
      if (!record || record.expires_at < now()) return null
      return { address: record.address as Address, chainId: record.chain_id, expiresAt: record.expires_at }
    },

    require(ctx: Ctx): Session {
      const session = this.read(ctx)
      if (!session) throw new HttpError(401, 'Sign in with your wallet first', 'unauthenticated')
      return session
    },

    logout(ctx: Ctx): string {
      const token = ctx.cookies[SESSION_COOKIE]
      if (token) deleteSession.run(hash(token))
      return cookie('', 0)
    },
  }
}

// Constant-time comparison for opaque secrets (idempotency keys, tokens).
export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}
