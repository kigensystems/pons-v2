// The Pons feed lists Mobula's coins for the factory once per TTL, marks Plum's own, keeps the last
// list as stale on failure, and the spotlight confirms the newest graduation against the factory.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { openDatabase } from '../src/db.ts'
import { createMobula } from '../src/market/mobula.ts'
import { createPons } from '../src/pons.ts'
import { fakeChain, FACTORY } from './fixtures.ts'

const A = '0x6ee1d6327800516e6098301b00b68ad19f84391c'
const B = '0x5f67e41ece11b53b20f522e5a33be84c3dd3975c'
const C = '0x93fd3026f214097e608cee45c84db58f9c68e290'
const graduated = (deployer: `0x${string}`) => ({ exists: true, phase: 2, phaseName: 'PoolCreated', curve: FACTORY, deployer, creatorFeeRecipient: deployer, pairToken: FACTORY, creatorTaxBps: 0, buybackEnabled: false, graduationThreshold: 1n })
const coin = (address: string, symbol: string, createdAt: string, extra: Record<string, unknown> = {}) => ({ address, name: symbol.toLowerCase(), symbol, logo: `https://cdn.example/${symbol}.webp`, bonded: false, bonded_at: null, createdAt,
  preBondingFactory: FACTORY.toLowerCase(), deployer: '0x08267cc0881190f3ad29f226bd0e09f45282f80e', marketCap: 1000, liquidity: 500, volume_24h: 20, price_change_24h: -3.5, bondingPercentage: 42.5, holdersCount: 7, price: 0.5, ...extra })

function feed(script: Array<{ status: number; body?: unknown }>) {
  const calls: string[] = []
  const fetchImpl = (async (input: string | URL | Request) => {
    calls.push(String(input))
    const step = script.shift() ?? { status: 500 }
    return new Response(step.body === undefined ? null : JSON.stringify(step.body), { status: step.status, headers: { 'Content-Type': 'application/json' } })
  }) as typeof fetch
  return { fetchImpl, calls }
}

test('coins are the graduated ones newest first, other factories and spam dropped, Plum launches marked, logos remembered', async () => {
  let clock = 1000
  const db = openDatabase(':memory:')
  const chain = fakeChain()
  const { fetchImpl, calls } = feed([
    { status: 200, body: {
      new: { data: [coin(C, 'NEW', '2026-09-08T00:03:45.000Z', { logo: null, marketCap: 0 }), coin('0x0000000000000000000000000000000000000001', 'OTHER', '2026-09-08T00:05:00.000Z', { preBondingFactory: '0x0c37a24f5d23a486fa692d1500881d698b1f77a4' })] },
      bonding: { data: [coin(B, 'MID', '2026-09-07T23:55:08.000Z'), coin('0x0000000000000000000000000000000000000002', 'SPAM', '2026-09-08T00:06:00.000Z', { is_spam: true })] },
      bonded: { data: [coin(A, 'LEAD', '2026-09-07T22:07:38.000Z', { bonded: true, bonded_at: '2026-09-07T23:57:29.007Z', bondingPercentage: 0 }), coin(B, 'MID', '2026-09-07T23:55:08.000Z'), coin(C, 'EARLY', '2026-09-07T20:00:00.000Z', { bonded: true, bonded_at: '2026-09-07T21:00:00.000Z' })] },
    } },
    { status: 200, body: { bonded: { data: [coin(A, 'LEAD', '2026-09-07T22:07:38.000Z', { bonded: true, bonded_at: '2026-09-07T23:57:29.007Z', logo: null })] } } },
  ])
  const market = createMobula(db, { apiKey: 'secret', baseUrl: 'https://api.example', chainId: 4663, fetch: fetchImpl, now: () => clock })
  const pons = createPons(db, chain, market, FACTORY, { now: () => clock, ttlSeconds: 30 })

  const first = await pons.coins()
  assert.equal(first.status, 'ok')
  assert.deepEqual(first.items.map(c => c.symbol), ['LEAD', 'EARLY'], 'only graduated coins, newest graduation first')
  assert.match(calls[0]!, /\/api\/2\/pulse\?chainId=evm%3A4663&poolTypes=pons-v2&assetMode=true&limit=100$/)
  const lead = first.items[0]!
  assert.equal(lead.token.toLowerCase(), A)
  assert.equal(lead.bonded, true)
  assert.equal(lead.graduatedAt, Date.parse('2026-09-07T23:57:29.007Z') / 1000 | 0)
  assert.equal(lead.launchedAt, Date.parse('2026-09-07T22:07:38.000Z') / 1000)
  assert.equal(lead.madeWithPlum, false)
  assert.equal(lead.priceChange24hPct, -3.5)
  assert.equal(lead.holders, 7)
  assert.match(lead.explorer ?? '', /blockscout\.com\/token\/0x6ee1/i)
  assert.match(lead.chart ?? '', /dexscreener\.com\/robinhood\/0x6ee1/i)
  assert.equal(lead.logo, 'https://cdn.example/LEAD.webp')

  clock = 1020
  assert.equal((await pons.coins()).items.length, 2)
  assert.equal(calls.length, 1)

  db.exec('PRAGMA foreign_keys = OFF')
  db.exec(`INSERT INTO launches (chain_id, token, curve, factory, creator, creator_fee_recipient, intent_id, tx_hash, log_index, block_number, block_hash, block_time, launch_config_id, pair_token, name, symbol, logo, description, creator_tax_bps, buyback_enabled, confirmation_state, created_at, updated_at)
    VALUES (4663, '${A}', '0x2', '${FACTORY.toLowerCase()}', '0x3', '0x3', 'i1', '0x4', 0, 1, '0x5', 1, 0, '0x0', 'lead', 'LEAD', '', '', 0, 0, 'confirmed', 1, 1)`)
  clock = 1040
  const second = await pons.coins()
  assert.equal(second.items.length, 1)
  assert.equal(second.items[0]!.madeWithPlum, true)
  assert.equal(second.items[0]!.logo, 'https://cdn.example/LEAD.webp', 'a logo Mobula stops sending is remembered')
  assert.equal(calls.length, 2)
})

test('the spotlight is the newest factory-confirmed graduation; failures keep the last answer as stale; no key is unavailable', async () => {
  let clock = 1000
  const db = openDatabase(':memory:')
  const chain = fakeChain()
  const { fetchImpl } = feed([
    { status: 200, body: { bonded: { data: [
      coin(A, 'LEAD', '2026-09-07T22:07:38.000Z', { bonded: true, bonded_at: '2026-09-07T23:57:29.007Z' }),
      coin(B, 'OLD', '2026-09-07T23:55:08.000Z', { bonded: true, bonded_at: '2026-09-07T23:55:28.006Z' }),
    ] } } },
    { status: 503 }, { status: 503 }, { status: 503 },
    { status: 200, body: { nope: true } },
  ])
  const market = createMobula(db, { apiKey: 'secret', baseUrl: 'https://api.example', chainId: 4663, fetch: fetchImpl, now: () => clock })
  chain.tokens.set(B, graduated('0x08267CC0881190f3Ad29F226bD0e09F45282F80e'))
  const pons = createPons(db, chain, market, FACTORY, { now: () => clock, ttlSeconds: 30 })

  const first = await pons.spotlight()
  assert.equal(first.status, 'ok')
  assert.equal(first.payload?.symbol, 'OLD', 'LEAD is unknown to the fake factory and must not be shown')
  assert.equal(first.payload?.deployer, '0x08267CC0881190f3Ad29F226bD0e09F45282F80e')
  assert.equal(first.payload?.phaseName, 'PoolCreated')
  assert.equal(first.observedAt, Date.parse('2026-09-07T23:55:28.006Z') / 1000 | 0)
  assert.equal((await pons.spotlight()).payload?.symbol, 'OLD', 'served from the same snapshot')

  clock = 1040
  const stale = await pons.spotlight()
  assert.equal(stale.status, 'stale')
  assert.equal(stale.payload?.symbol, 'OLD')
  assert.equal(stale.error, 'Mobula responded 503')

  clock = 1080
  assert.equal((await pons.spotlight()).error, 'Unexpected Mobula shape')

  const silent = createPons(db, chain, createMobula(db, { apiKey: null, baseUrl: 'https://api.example', chainId: 4663 }), FACTORY)
  assert.equal((await silent.spotlight()).status, 'unavailable')
  assert.equal((await silent.coins()).items.length, 0)
})

test('a factory event reads the feed ahead of its TTL, with forced reads spaced out', async () => {
  let clock = 1000
  const db = openDatabase(':memory:')
  const chain = fakeChain()
  const bonded = (symbol: string) => ({ bonded: { data: [coin(A, symbol, '2026-09-07T22:07:38.000Z', { bonded: true, bonded_at: '2026-09-07T23:57:29.007Z' })] } })
  const { fetchImpl, calls } = feed([{ status: 200, body: bonded('ONE') }, { status: 200, body: bonded('TWO') }, { status: 200, body: bonded('THREE') }])
  const market = createMobula(db, { apiKey: 'secret', baseUrl: 'https://api.example', chainId: 4663, fetch: fetchImpl, now: () => clock })
  const pons = createPons(db, chain, market, FACTORY, { now: () => clock, ttlSeconds: 30 })
  assert.equal((await pons.coins()).items[0]!.symbol, 'ONE')
  clock = 1005
  assert.equal((await pons.coins()).items[0]!.symbol, 'ONE', 'inside the TTL the snapshot is reused')
  pons.nudge()
  assert.equal((await pons.coins()).items[0]!.symbol, 'TWO', 'a nudge reads again at once')
  clock = 1010
  pons.nudge()
  assert.equal((await pons.coins()).items[0]!.symbol, 'TWO', 'a second nudge within the spacing is ignored')
  clock = 1025
  pons.nudge()
  assert.equal((await pons.coins()).items[0]!.symbol, 'THREE')
  assert.equal(calls.length, 3)
})
