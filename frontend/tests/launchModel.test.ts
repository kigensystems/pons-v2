import { test } from 'node:test'
import assert from 'node:assert/strict'
import { describeIntent, formatBps, formatChange, formatEth, formatUsd, gasAllowanceWei, launchBadge, relativeAge, shortAddress } from '../src/launch/launchModel.ts'
import type { Launch } from '../src/launch/api.ts'

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
  const base = { confirmationState: 'confirmed', protocol: { phase: 0, phaseName: 'NotGraduated', graduated: false, onCurve: true } } as Launch
  assert.equal(launchBadge(base), 'On the curve')
  assert.equal(launchBadge({ ...base, confirmationState: 'included' }), 'Confirming')
  assert.equal(launchBadge({ ...base, protocol: { phase: 2, phaseName: 'PoolCreated', graduated: true, onCurve: false } }), 'Graduated')
  assert.equal(launchBadge({ ...base, protocol: null }), 'On the curve')
})
