import { test } from 'node:test'
import assert from 'node:assert/strict'
import { openDatabase } from '../src/db.ts'
import { createAuth, SESSION_COOKIE } from '../src/auth.ts'
import { parseCookies, HttpError, type Ctx } from '../src/http.ts'
import { creator, fakeChain, testConfig, STRANGER } from './fixtures.ts'

const ctxWith = (cookie: string): Ctx => ({ cookies: parseCookies(cookie) } as unknown as Ctx)

test('a signed challenge creates a session; the nonce is single-use', async () => {
  const auth = createAuth(openDatabase(':memory:'), testConfig(), fakeChain())
  const { message } = auth.challenge({ address: creator.address, chainId: 4663 })
  assert.match(message, /^127\.0\.0\.1:5173 wants you to sign in/)
  assert.match(message, /Chain ID: 4663/)
  const signature = await creator.signMessage({ message })
  const { session, setCookie } = await auth.verify({ message, signature })
  assert.equal(session.address, creator.address)
  assert.match(setCookie, /HttpOnly; SameSite=Lax/)
  const cookie = setCookie.split(';')[0]!
  assert.equal(auth.read(ctxWith(cookie))?.address, creator.address)
  await assert.rejects(auth.verify({ message, signature }), (e: HttpError) => e.code === 'bad_nonce')
  const logoutCookie = auth.logout(ctxWith(cookie))
  assert.match(logoutCookie, new RegExp(`^${SESSION_COOKIE}=; `))
  assert.equal(auth.read(ctxWith(cookie)), null)
})

test('challenges for the wrong chain, another wallet\'s signature and foreign domains are refused', async () => {
  const auth = createAuth(openDatabase(':memory:'), testConfig(), fakeChain())
  assert.throws(() => auth.challenge({ address: creator.address, chainId: 1 }), (e: HttpError) => e.code === 'wrong_chain')
  assert.throws(() => auth.challenge({ address: 'nope', chainId: 4663 }), (e: HttpError) => e.code === 'bad_address')
  const { message } = auth.challenge({ address: STRANGER, chainId: 4663 })
  const signature = await creator.signMessage({ message })
  await assert.rejects(auth.verify({ message, signature }), (e: HttpError) => e.code === 'bad_signature')
  const foreign = auth.challenge({ address: creator.address, chainId: 4663 }).message.replace('127.0.0.1:5173', 'evil.example')
  await assert.rejects(auth.verify({ message: foreign, signature: await creator.signMessage({ message: foreign }) }), (e: HttpError) => e.code === 'bad_message')
  assert.equal(auth.read(ctxWith(`${SESSION_COOKIE}=forged`)), null)
})
