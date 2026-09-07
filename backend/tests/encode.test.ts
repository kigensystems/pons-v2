import { test } from 'node:test'
import assert from 'node:assert/strict'
import { decodeFunctionData, toFunctionSelector, zeroAddress } from 'viem'
import { factoryAbi } from '../src/chain/abi.ts'
import { EMPTY_SOCIALS, encodeLaunchToken, transactionHashOfTerms, type TokenParams } from '../src/chain/encode.ts'
import { ECONOMICS, FACTORY, creator } from './fixtures.ts'

const params: TokenParams = {
  name: 'Plum Test', symbol: 'PLUMT', logo: 'https://plum.example/api/uploads/abc.png', description: 'A test',
  socials: { ...EMPTY_SOCIALS, website: 'https://plum.example' }, creatorFeeRecipient: creator.address, creatorTaxBps: 250, buybackEnabled: false,
  expectedEconomics: ECONOMICS, salt: '0x' + '11'.repeat(32) as `0x${string}`,
}

test('launchToken calldata uses the published three-argument tuple ABI and round-trips', () => {
  const tx = encodeLaunchToken({ chainId: 4663, factory: FACTORY, params, launchConfigId: 0n, pairToken: zeroAddress, launchFee: 500_000_000_000_000n })
  const selector = toFunctionSelector('launchToken((string,string,string,string,(string,string,string,string,string),address,uint16,bool,bytes32,bytes32),uint256,address)')
  assert.equal(tx.data.slice(0, 10), selector)
  assert.equal(tx.to, FACTORY)
  assert.equal(tx.value, 500_000_000_000_000n)
  const decoded = decodeFunctionData({ abi: factoryAbi, data: tx.data })
  assert.equal(decoded.functionName, 'launchToken')
  const [tuple, configId, pair] = decoded.args
  assert.deepEqual(tuple, params)
  assert.equal(configId, 0n)
  assert.equal(pair, zeroAddress)
})

test('terms hash changes with any of chain, target, calldata or value', () => {
  const base = encodeLaunchToken({ chainId: 4663, factory: FACTORY, params, launchConfigId: 0n, pairToken: zeroAddress, launchFee: 1n })
  const hash = transactionHashOfTerms(base)
  assert.equal(transactionHashOfTerms({ ...base }), hash)
  assert.notEqual(transactionHashOfTerms({ ...base, chainId: 46630 }), hash)
  assert.notEqual(transactionHashOfTerms({ ...base, value: 2n }), hash)
  assert.notEqual(transactionHashOfTerms({ ...base, to: creator.address }), hash)
  const other = encodeLaunchToken({ chainId: 4663, factory: FACTORY, params: { ...params, salt: '0x' + '22'.repeat(32) as `0x${string}` }, launchConfigId: 0n, pairToken: zeroAddress, launchFee: 1n })
  assert.notEqual(transactionHashOfTerms(other), hash)
})

test('encoding refuses pair tokens, bad salts and out-of-range creator tax', () => {
  assert.throws(() => encodeLaunchToken({ chainId: 4663, factory: FACTORY, params, launchConfigId: 0n, pairToken: creator.address, launchFee: 1n }), /native ETH/)
  assert.throws(() => encodeLaunchToken({ chainId: 4663, factory: FACTORY, params: { ...params, salt: '0x1234' }, launchConfigId: 0n, pairToken: zeroAddress, launchFee: 1n }), /salt/)
  assert.throws(() => encodeLaunchToken({ chainId: 4663, factory: FACTORY, params: { ...params, creatorTaxBps: 70_000 }, launchConfigId: 0n, pairToken: zeroAddress, launchFee: 1n }), /creatorTaxBps/)
})
