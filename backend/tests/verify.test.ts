import { test } from 'node:test'
import assert from 'node:assert/strict'
import { keccak256, toHex, zeroAddress, type Hex } from 'viem'
import { encodeLaunchToken, EMPTY_SOCIALS } from '../src/chain/encode.ts'
import { verifyLaunchReceipt, TOKEN_LAUNCHED_TOPIC, type FetchedBlock, type FetchedReceipt, type FetchedTransaction } from '../src/chain/verify.ts'
import { CURVE, ECONOMICS, FACTORY, STRANGER, TOKEN, creator, launchedLog } from './fixtures.ts'

const tx0 = encodeLaunchToken({ chainId: 4663, factory: FACTORY, launchConfigId: 0n, pairToken: zeroAddress, launchFee: 5n, params: {
  name: 'A', symbol: 'A', logo: '', description: '', socials: EMPTY_SOCIALS, creatorFeeRecipient: creator.address, creatorTaxBps: 0, buybackEnabled: false, expectedEconomics: ECONOMICS, salt: ('0x' + 'ab'.repeat(32)) as Hex,
} })
const intent = { address: creator.address, chainId: 4663, target: FACTORY, calldata: tx0.data, valueWei: 5n }
const hash = keccak256(toHex('tx'))
const block: FetchedBlock = { number: 100n, hash: keccak256(toHex('block')), timestamp: 1_788_000_000n }
const tx: FetchedTransaction = { hash, from: creator.address, to: FACTORY, input: tx0.data, value: 5n, chainId: 4663, blockHash: block.hash, blockNumber: 100n }
const receipt: FetchedReceipt = { transactionHash: hash, status: 'success', blockHash: block.hash, blockNumber: 100n, to: FACTORY, from: creator.address, logs: [launchedLog({ deployer: creator.address })] }

test('a receipt matching the intent yields the token, curve and block identity', () => {
  const result = verifyLaunchReceipt({ factory: FACTORY, intent, tx, receipt, block })
  assert.ok(result.ok)
  assert.equal(result.token, TOKEN)
  assert.equal(result.curve, CURVE)
  assert.equal(result.logIndex, 3)
  assert.equal(result.blockHash, block.hash)
  assert.equal(result.blockTime, 1_788_000_000n)
  assert.equal(TOKEN_LAUNCHED_TOPIC, receipt.logs[0]!.topics[0])
})

test('forged or unrelated receipts are rejected with a specific code', () => {
  const cases: [string, Partial<FetchedTransaction>, Partial<FetchedReceipt>][] = [
    ['wrong_sender', { from: STRANGER }, { from: STRANGER, logs: [launchedLog({ deployer: STRANGER })] }],
    ['wrong_target', { to: STRANGER }, { to: STRANGER }],
    ['input_mismatch', { input: (tx0.data.slice(0, 20) + (tx0.data[20] === '0' ? '1' : '0') + tx0.data.slice(21)) as Hex }, {}],
    ['value_mismatch', { value: 6n }, {}],
    ['wrong_chain', { chainId: 46630 }, {}],
    ['reverted', {}, { status: 'reverted', logs: [] }],
    ['no_launch_event', {}, { logs: [] }],
    ['no_launch_event', {}, { logs: [launchedLog({ deployer: creator.address, address: STRANGER })] }],
    ['multiple_launch_events', {}, { logs: [launchedLog({ deployer: creator.address }), launchedLog({ deployer: creator.address, logIndex: 4 })] }],
    ['deployer_mismatch', {}, { logs: [launchedLog({ deployer: STRANGER })] }],
    ['hash_mismatch', {}, { transactionHash: keccak256(toHex('other')) }],
    ['block_mismatch', { blockHash: keccak256(toHex('stale')) }, {}],
  ]
  for (const [code, txPatch, receiptPatch] of cases) {
    const result = verifyLaunchReceipt({ factory: FACTORY, intent, tx: { ...tx, ...txPatch }, receipt: { ...receipt, ...receiptPatch }, block })
    assert.equal(result.ok, false, code)
    assert.equal((result as { code: string }).code, code)
  }
})

test('a block that no longer matches the receipt is reported as block_mismatch', () => {
  const result = verifyLaunchReceipt({ factory: FACTORY, intent, tx, receipt, block: { ...block, hash: keccak256(toHex('reorg')) } })
  assert.deepEqual(result.ok, false)
  assert.equal((result as { code: string }).code, 'block_mismatch')
})
