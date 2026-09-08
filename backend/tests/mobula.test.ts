import { test } from 'node:test'
import assert from 'node:assert/strict'
import { openDatabase } from '../src/db.ts'
import { createMobula } from '../src/market/mobula.ts'
import { TOKEN } from './fixtures.ts'

function fakeFetch(script: Array<{ status: number; body?: unknown }>) {
  const calls: string[] = []
  const fetchImpl = (async (input: string | URL | Request, init?: RequestInit) => {
    calls.push(String(input) + '|' + ((init?.headers as Record<string, string>)?.Authorization ?? ''))
    const step = script.shift() ?? { status: 500 }
    return new Response(step.body === undefined ? null : JSON.stringify(step.body), { status: step.status, headers: { 'Content-Type': 'application/json' } })
  }) as typeof fetch
  return { fetchImpl, calls }
}

test('details are normalized, cached for the TTL and refreshed after it', async () => {
  let clock = 1000
  const { fetchImpl, calls } = fakeFetch([
    { status: 200, body: { data: { price: 0.5, market_cap: 1000, volume: 20, price_change_24h: -3.5, liquidity: 12, lastUpdated: 1_788_000_000_000 } } },
    { status: 200, body: { data: { price: 0.75 } } },
  ])
  const market = createMobula(openDatabase(':memory:'), { apiKey: 'secret', baseUrl: 'https://api.example', chainId: 4663, fetch: fetchImpl, now: () => clock, detailsTtlSeconds: 60 })
  const first = await market.details(TOKEN)
  assert.equal(first.status, 'ok')
  assert.deepEqual(first.payload, { priceUsd: 0.5, marketCapUsd: 1000, volume24hUsd: 20, priceChange24hPct: -3.5, liquidityUsd: 12 })
  assert.equal(first.observedAt, 1_788_000_000)
  assert.equal(first.retrievedAt, 1000)
  assert.match(calls[0]!, /\/api\/2\/token\/details\?chainId=4663&address=0x1111.*\|secret$/)
  clock = 1030
  assert.equal((await market.details(TOKEN)).payload?.priceUsd, 0.5)
  assert.equal(calls.length, 1)
  clock = 1100
  const refreshed = await market.details(TOKEN)
  assert.equal(refreshed.payload?.priceUsd, 0.75)
  assert.equal(refreshed.payload?.marketCapUsd, null)
  assert.equal(calls.length, 2)
})

test('rate limits retry with backoff, failures keep the last payload as stale, and a missing key reports unavailable', async () => {
  let clock = 1000
  const { fetchImpl, calls } = fakeFetch([{ status: 429 }, { status: 200, body: { data: { price: 1 } } }, { status: 500 }, { status: 500 }, { status: 500 }, { status: 404 }])
  const db = openDatabase(':memory:')
  const market = createMobula(db, { apiKey: 'secret', baseUrl: 'https://api.example', chainId: 4663, fetch: fetchImpl, now: () => clock, detailsTtlSeconds: 1 })
  const ok = await market.details(TOKEN)
  assert.equal(ok.status, 'ok')
  assert.equal(calls.length, 2)
  clock = 1010
  const stale = await market.details(TOKEN)
  assert.equal(stale.status, 'stale')
  assert.equal(stale.payload?.priceUsd, 1)
  assert.equal(stale.error, 'Mobula responded 500')
  clock = 1020
  const unsupported = await market.details(TOKEN)
  assert.equal(unsupported.status, 'unsupported')
  assert.equal(market.cachedDetails(TOKEN)?.status, 'unsupported')
  const unconfigured = createMobula(db, { apiKey: null, baseUrl: 'https://api.example', chainId: 4663, fetch: fetchImpl })
  assert.equal(unconfigured.enabled, false)
  assert.equal((await unconfigured.details(TOKEN)).status, 'unavailable')
})

test('concurrent callers share one upstream request and candles are bounded by period', async () => {
  const { fetchImpl, calls } = fakeFetch([{ status: 200, body: { data: [{ time: 1_788_000_000_000, open: 1, close: 2, high: 3, low: 0.5, volume: 9 }] } }])
  const market = createMobula(openDatabase(':memory:'), { apiKey: 'secret', baseUrl: 'https://api.example', chainId: 4663, fetch: fetchImpl })
  const [a, b] = await Promise.all([market.candles(TOKEN, '1h', 1_787_990_000, 1_788_001_000), market.candles(TOKEN, '1h', 1_787_990_000, 1_788_001_000)])
  assert.equal(calls.length, 1)
  assert.match(calls[0]!, /period=1h&from=1787990000000&to=1788001000000/)
  assert.deepEqual(a.payload, [{ time: 1_788_000_000, open: 1, close: 2, high: 3, low: 0.5, volume: 9 }])
  assert.deepEqual(a, b)
  await assert.rejects(market.candles(TOKEN, '2h', 0, 1), /period/)
})
