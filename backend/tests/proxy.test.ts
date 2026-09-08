// The Netlify signed-proxy gate: with a secret set, only requests carrying a valid x-nf-sign pass.
import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { createHmac } from 'node:crypto'
import { createHandler, createServices } from '../src/server.ts'
import { buildRouter } from '../src/routes.ts'
import { verifyProxySignature } from '../src/http.ts'
import { fakeChain, testConfig } from './fixtures.ts'

const SECRET = 'netlify-shared-secret-for-tests'
const b64 = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url')
function sign(claims: object, secret = SECRET) {
  const body = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64(claims)}`
  return `${body}.${createHmac('sha256', secret).update(body).digest('base64url')}`
}
const fresh = () => ({ iss: 'netlify', exp: Math.floor(Date.now() / 1000) + 300, deploy_context: 'production', site_url: 'https://plum.example' })

test('verifyProxySignature accepts Netlify\'s JWS shape and rejects forgeries, expiry and other issuers', () => {
  assert.equal(verifyProxySignature(sign(fresh()), SECRET), true)
  assert.equal(verifyProxySignature(sign(fresh(), 'other'), SECRET), false)
  assert.equal(verifyProxySignature(sign({ ...fresh(), exp: Math.floor(Date.now() / 1000) - 1 }), SECRET), false)
  assert.equal(verifyProxySignature(sign({ ...fresh(), iss: 'someone' }), SECRET), false)
  assert.equal(verifyProxySignature(undefined, SECRET), false)
  assert.equal(verifyProxySignature('not.a.jws', SECRET), false)
  assert.equal(verifyProxySignature(sign(fresh()).slice(0, -2), SECRET), false)
})

const config = testConfig({ proxySecret: SECRET })
const services = createServices(config, { chain: fakeChain(), dbPath: ':memory:' })
const server = createServer(createHandler(buildRouter(services), { proxySecret: config.proxySecret }))
await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`
after(() => { server.close(); services.db.close() })

test('with a proxy secret, health stays open and everything else needs the signature', async () => {
  assert.equal((await fetch(`${base}/api/health`)).status, 200)
  const unsigned = await fetch(`${base}/api/launch-config`)
  assert.equal(unsigned.status, 403)
  assert.equal(((await unsigned.json()) as { error: { code: string } }).error.code, 'unsigned')
  assert.equal((await fetch(`${base}/api/launch-config`, { headers: { 'x-nf-sign': sign(fresh(), 'wrong') } })).status, 403)
  assert.equal((await fetch(`${base}/api/launch-config`, { headers: { 'x-nf-sign': sign(fresh()) } })).status, 200)
  assert.equal((await fetch(`${base}/api/pons/coins`, { headers: { 'x-nf-sign': sign(fresh()) } })).status, 200)
})
