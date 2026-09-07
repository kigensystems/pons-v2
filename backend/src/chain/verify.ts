// Pure receipt verification against a stored intent. The caller fetches the transaction, receipt and
// block; this decides membership. Anything that does not match the intent exactly is rejected.
import { decodeEventLog, isAddressEqual, toEventSelector, type Address, type Hex } from 'viem'
import { factoryAbi } from './abi.ts'

export const TOKEN_LAUNCHED_TOPIC = toEventSelector('TokenLaunched(address,address,address,address,uint256,uint256)')

export type IntentTerms = { address: Address; chainId: number; target: Address; calldata: Hex; valueWei: bigint }
export type FetchedTransaction = { hash: Hex; from: Address; to: Address | null; input: Hex; value: bigint; chainId?: number; blockHash: Hex | null; blockNumber: bigint | null }
export type FetchedLog = { address: Address; topics: readonly Hex[]; data: Hex; logIndex: number }
export type FetchedReceipt = { transactionHash: Hex; status: 'success' | 'reverted'; blockHash: Hex; blockNumber: bigint; to: Address | null; from: Address; logs: readonly FetchedLog[] }
export type FetchedBlock = { number: bigint; hash: Hex; timestamp: bigint }

export type VerifiedLaunch = { ok: true; token: Address; curve: Address; deployer: Address; pairToken: Address; launchConfigId: bigint; logIndex: number; blockNumber: bigint; blockHash: Hex; blockTime: bigint }
export type RejectedLaunch = { ok: false; code: string; reason: string }

export function verifyLaunchReceipt(input: { factory: Address; intent: IntentTerms; tx: FetchedTransaction; receipt: FetchedReceipt; block: FetchedBlock }): VerifiedLaunch | RejectedLaunch {
  const { factory, intent, tx, receipt, block } = input
  const reject = (code: string, reason: string): RejectedLaunch => ({ ok: false, code, reason })

  if (receipt.transactionHash.toLowerCase() !== tx.hash.toLowerCase()) return reject('hash_mismatch', 'Receipt and transaction hashes differ')
  if (tx.chainId !== undefined && tx.chainId !== intent.chainId) return reject('wrong_chain', `Transaction chain ${tx.chainId} is not ${intent.chainId}`)
  if (!isAddressEqual(tx.from, intent.address)) return reject('wrong_sender', 'Transaction was not sent by the intent wallet')
  if (!tx.to || !isAddressEqual(tx.to, intent.target)) return reject('wrong_target', 'Transaction target is not the prepared factory')
  if (tx.input.toLowerCase() !== intent.calldata.toLowerCase()) return reject('input_mismatch', 'Transaction input differs from the prepared calldata')
  if (tx.value !== intent.valueWei) return reject('value_mismatch', 'Transaction value differs from the prepared value')
  if (receipt.status !== 'success') return reject('reverted', 'Transaction reverted')
  if (!tx.blockHash || tx.blockHash.toLowerCase() !== receipt.blockHash.toLowerCase()) return reject('block_mismatch', 'Transaction and receipt block hashes differ')
  if (block.hash.toLowerCase() !== receipt.blockHash.toLowerCase() || block.number !== receipt.blockNumber) return reject('block_mismatch', 'Canonical block does not match the receipt')

  const launched = receipt.logs.filter(log => isAddressEqual(log.address, factory) && log.topics[0]?.toLowerCase() === TOKEN_LAUNCHED_TOPIC)
  if (launched.length === 0) return reject('no_launch_event', 'No TokenLaunched event from the factory')
  if (launched.length > 1) return reject('multiple_launch_events', 'More than one TokenLaunched event in the receipt')
  const log = launched[0]!
  let args: { token: Address; curve: Address; deployer: Address; pairToken: Address; launchConfigId: bigint }
  try {
    const decoded = decodeEventLog({ abi: factoryAbi, eventName: 'TokenLaunched', topics: log.topics as [Hex, ...Hex[]], data: log.data })
    args = decoded.args
  } catch {
    return reject('undecodable_event', 'TokenLaunched event could not be decoded')
  }
  if (!isAddressEqual(args.deployer, intent.address)) return reject('deployer_mismatch', 'Event deployer is not the intent wallet')

  return { ok: true, token: args.token, curve: args.curve, deployer: args.deployer, pairToken: args.pairToken, launchConfigId: args.launchConfigId,
    logIndex: log.logIndex, blockNumber: receipt.blockNumber, blockHash: receipt.blockHash, blockTime: block.timestamp }
}
