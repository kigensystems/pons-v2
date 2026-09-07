import { test } from 'node:test'
import assert from 'node:assert/strict'
import { demoQuote } from '../src/launch/launchModel.ts'

test('ETH purchases include the creation fee without rounding away a small buy', () => {
  assert.equal(demoQuote(2.5, 0.1, 'ETH').total, '0.1005 ETH')
  assert.equal(demoQuote(2.5, 0.00000001, 'ETH').total, '0.00050001 ETH')
  assert.equal(demoQuote(2.5, 0, 'ETH').totalFee, 3.5)
})

test('non-ETH buys retain both currencies in the total instead of silently omitting the buy', () => {
  assert.equal(demoQuote(0, 25, 'USDG').total, '0.0005 ETH + 25 USDG')
  assert.equal(demoQuote(0, 0.000001, 'cbBTC').total, '0.0005 ETH + 0.000001 cbBTC')
  assert.equal(demoQuote(0, 0, 'USDG').total, '0.0005 ETH')
})

test('unusable numeric inputs stay finite and fees remain within the illustrative bounds', () => {
  for (const value of [NaN, Infinity, -Infinity, -5]) {
    const quote = demoQuote(value, value, 'ETH')
    assert.equal(quote.total, '0.0005 ETH')
    assert.equal(quote.tax, 0)
    assert.equal(quote.totalFee, 1)
  }
  assert.equal(demoQuote(15, 0, 'ETH').totalFee, 11)
})
