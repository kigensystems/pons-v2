import { test } from 'node:test'
import assert from 'node:assert/strict'
import { arrangeCoins, coinFromLaunch, coinFromPons, describeIntent, formatBps, formatChange, formatEth, formatUsd, gasAllowanceWei, relativeAge, shortAddress } from '../src/launch/launchModel.ts'
import type { Launch, PonsCoin } from '../src/launch/api.ts'

test('wei amounts format from integers without floating-point drift', () => {
  assert.equal(formatEth('500000000000000'), '0.0005')
  assert.equal(formatEth(500_000_000_000_000n + 10_000_000_000_000n), '0.00051')
  assert.equal(formatEth('1000000000000000000'), '1')
  assert.equal(formatEth('1234567890123456789', 4), '1.2345')
  assert.equal(formatEth('0'), '0')
  assert.equal(formatBps(250), '2.50%')
  assert.equal(formatBps(0), '0.00%')
})

test('gas allowance multiplies the estimate by the fee cap and is absent when simulation failed', () => {
  assert.equal(gasAllowanceWei({ ok: true, gas: '3000000', maxFeePerGas: '400000000', balanceWei: '1', requiredWei: '1' }), 1_200_000_000_000_000n)
  assert.equal(gasAllowanceWei({ ok: false, code: 'x', reason: 'y', balanceWei: null }), null)
  assert.equal(gasAllowanceWei(null), null)
})

test('display helpers handle missing market data and ages', () => {
  assert.equal(formatUsd(null), '—')
  assert.equal(formatUsd(1_234_567), '$1.2M')
  assert.equal(formatUsd(980), '$980')
  assert.equal(formatChange(null), '—')
  assert.equal(formatChange(-3.456), '−3.5%')
  assert.equal(formatChange(12), '+12.0%')
  assert.equal(relativeAge(1000, 1030), 'now')
  assert.equal(relativeAge(1000, 1000 + 5 * 60), '5m')
  assert.equal(relativeAge(1000, 1000 + 3 * 3600), '3h')
  assert.equal(relativeAge(1000, 1000 + 2 * 86400), '2d')
  assert.equal(shortAddress('0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e'), '0x7eD5…EC7e')
})

test('intent and launch states map to honest labels', () => {
  assert.equal(describeIntent('prepared', null).label, 'Ready to sign')
  assert.equal(describeIntent('rejected', 'Transaction target is not the prepared factory').detail, 'Transaction target is not the prepared factory')
  assert.equal(describeIntent('unresolved', null).tone, 'bad')
})

test('registry rows and Pons feed coins map to one card shape, and Explore keeps only graduated ones', () => {
  const launch = { chainId: 4663, token: '0x1111111111111111111111111111111111111111', name: 'Plum', symbol: 'PLUM', logo: '', description: '', creator: '0xabc', pairToken: '0x0000000000000000000000000000000000000000', blockNumber: 10, blockTime: 1000,
    confirmationState: 'confirmed', explorer: { token: 'https://x/token/1', transaction: '' }, protocol: { phase: 0, phaseName: 'NotGraduated', graduated: false, onCurve: true }, protocolError: null, market: null } as unknown as Launch
  const plum = coinFromLaunch(launch, 0)
  assert.equal(plum.phase, 'curve')
  assert.equal(plum.logo, null)
  assert.equal(plum.chart, null)
  assert.equal(plum.marketNote, 'no market data')
  assert.equal(plum.madeWithPlum, true)
  const graduatedPlum = coinFromLaunch({ ...launch, protocol: { phase: 2, phaseName: 'PoolCreated', graduated: true, onCurve: false }, market: { status: 'ok', payload: { priceUsd: 1, marketCapUsd: 5, volume24hUsd: 0, priceChange24hPct: 2 }, observedAt: 1, retrievedAt: 1, error: null } }, 0)
  assert.equal(graduatedPlum.phase, 'graduated')
  assert.equal(graduatedPlum.chart, 'https://dexscreener.com/robinhood/0x1111111111111111111111111111111111111111')
  assert.equal(graduatedPlum.marketCapUsd, 5)

  const feed = { chainId: 4663, token: '0x6ee1D6327800516E6098301b00B68aD19F84391c', name: 'LEAD INDEX', symbol: 'LEAD', logo: 'https://cdn/l.webp', deployer: '0xdef', description: '', launchedAt: 900, graduatedAt: 950, bonded: true, bondingPct: 0,
    priceUsd: 1, marketCapUsd: 53_626, liquidityUsd: 1, volume24hUsd: 1, priceChange24hPct: -3.5, holders: 4, madeWithPlum: false, explorer: 'https://x/token/6', chart: 'https://dexscreener.com/robinhood/0x6ee1' } as PonsCoin
  const pons = coinFromPons(feed, 1)
  assert.equal(pons.phase, 'graduated')
  assert.equal(pons.since, 950, 'age counts from graduation')
  assert.equal(pons.chart, feed.chart)
  assert.equal(pons.marketNote, '')
  const curve = coinFromPons({ ...feed, bonded: false, graduatedAt: null, bondingPct: 82.5 }, 1)
  assert.equal(curve.phase, 'curve')
  assert.equal(curve.since, 900)
  assert.equal(coinFromPons({ ...feed, marketCapUsd: 0 }, 1).marketCapUsd, null)
  assert.equal(coinFromPons({ ...feed, marketCapUsd: null }, 1).marketNote, 'no market data')

  const older = { ...pons, token: '0x2222222222222222222222222222222222222222' as const, since: 800, marketCapUsd: 99_000 }
  assert.deepEqual(arrangeCoins([older, curve, pons], 'newest').map(c => c.since), [950, 800])
  assert.deepEqual(arrangeCoins([pons, curve, older], 'marketcap').map(c => c.marketCapUsd), [99_000, 53_626])
})
