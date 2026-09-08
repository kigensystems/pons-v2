// Shared fakes: an in-memory ChainReader whose behaviour each test scripts, plus receipt builders.
import { encodeAbiParameters, encodeEventTopics, getAddress, keccak256, toHex, zeroAddress, type Address, type Hex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { verifyMessage } from 'viem'
import { factoryAbi } from '../src/chain/abi.ts'
import type { ChainReader, LaunchSettings, LaunchedToken, PairToken, Simulation } from '../src/chain/client.ts'
import type { FetchedBlock, FetchedReceipt, FetchedTransaction } from '../src/chain/verify.ts'
import type { Config } from '../src/config.ts'
import { loadConfig } from '../src/config.ts'

export const FACTORY: Address = '0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e'
export const CREATOR_KEY: Hex = '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'
export const creator = privateKeyToAccount(CREATOR_KEY)
export const STRANGER: Address = '0x000000000000000000000000000000000000dEaD'
export const TOKEN: Address = '0x1111111111111111111111111111111111111111'
export const CURVE: Address = '0x2222222222222222222222222222222222222222'
export const ECONOMICS: Hex = '0xa9fc75d4203a33fe660e8fa32c74c3aa41c1fda4bf23d3a39b6bc22a1f8b1ca7'
// NVIDIA's Robinhood token as the factory listed it on September 8, 2026, with its own economics pin.
export const NVDA: PairToken = { address: getAddress('0xd0601ce157db5bdc3162bbac2a2c8af5320d9eec'), symbol: 'NVDA', name: 'NVIDIA • Robinhood Token', decimals: 18, phantomQuote: 16_640_000_000_000_000_000n, graduationThreshold: 41_600_000_000_000_000_000n }
export const NVDA_ECONOMICS: Hex = '0xca334db6301055305178e8e7c69b02407df457de6f5ef3be4e6bb19c1460e167'

export function testConfig(overrides: Partial<Config> = {}): Config {
  return { ...loadConfig({
    ROBINHOOD_RPC_URL: 'https://example.invalid/v2/key', SESSION_SECRET: 'x'.repeat(40), PLUM_ORIGIN: 'http://127.0.0.1:5173',
    PLUM_DB_PATH: ':memory:', PLUM_UPLOAD_DIR: '/nonexistent', PLUM_CONFIRMATIONS: '3', PLUM_INTENT_TTL_SECONDS: '600',
  }), ...overrides }
}

export const settings: LaunchSettings = {
  blockNumber: 56_821_996n, blockHash: '0x74d4bdded7ff7b1d98d4afb8c725c2a17664b21fa3e80ae290b2f62378bc6492', observedAt: 1_788_000_000,
  launchFeeWei: 500_000_000_000_000n, launchEnabled: true, maxCreatorTaxBps: 1000,
  configs: [{ id: 0, supply: 10n ** 27n, curveFeeBps: 100n, phantomQuote: 1_680_000_000_000_000_000n, graduationThreshold: 4_200_000_000_000_000_000n, poolFee: 0, tickSpacing: 200, enabled: true, expectedEconomicsEth: ECONOMICS }],
}

export type FakeChain = ChainReader & {
  settings: LaunchSettings
  eligible: Set<string>
  simulation: Simulation
  balances: Map<string, bigint>
  txs: Map<string, FetchedTransaction>
  receipts: Map<string, FetchedReceipt>
  blocks: Map<string, FetchedBlock>
  head: FetchedBlock
  tokens: Map<string, LaunchedToken>
  pairs: PairToken[]
  calls: string[]
}

export function fakeChain(chainId = 4663): FakeChain {
  const head: FetchedBlock = { number: 56_822_000n, hash: keccak256(toHex('head')), timestamp: 1_788_000_100n }
  const chain: FakeChain = {
    chainId, settings: structuredClone(settings), eligible: new Set([creator.address.toLowerCase()]),
    simulation: { ok: true, gas: 3_000_000n, maxFeePerGas: 400_000_000n, maxPriorityFeePerGas: 1n },
    balances: new Map([[creator.address.toLowerCase(), 10n ** 18n]]), txs: new Map(), receipts: new Map(), blocks: new Map(), head, tokens: new Map(), pairs: [structuredClone(NVDA)], calls: [],
    async latestBlock() { chain.calls.push('latestBlock'); return chain.head },
    async pairTokens() { chain.calls.push('pairs'); return { blockNumber: chain.settings.blockNumber, observedAt: chain.settings.observedAt, items: chain.pairs } },
    async launchEconomics(_id, pairToken) { chain.calls.push(`economics:${pairToken.slice(0, 8)}`); return pairToken === zeroAddress ? chain.settings.configs[0]!.expectedEconomicsEth : NVDA_ECONOMICS },
    async blockByNumber(number) { chain.calls.push(`block:${number}`); return chain.blocks.get(number.toString()) ?? null },
    async launchSettings() { chain.calls.push('settings'); return chain.settings },
    async canLaunch(account) { chain.calls.push('canLaunch'); return chain.eligible.has(account.toLowerCase()) },
    async simulate() { chain.calls.push('simulate'); return chain.simulation },
    async balance(account) { return chain.balances.get(account.toLowerCase()) ?? 0n },
    async transaction(hash) { chain.calls.push(`tx:${hash.slice(0, 10)}`); return chain.txs.get(hash.toLowerCase()) ?? null },
    async receipt(hash) { chain.calls.push(`receipt:${hash.slice(0, 10)}`); return chain.receipts.get(hash.toLowerCase()) ?? null },
    async launchedToken(token) {
      return chain.tokens.get(token.toLowerCase()) ?? { exists: false, phase: 0, phaseName: 'NotGraduated', curve: zeroAddress, deployer: zeroAddress, creatorFeeRecipient: zeroAddress, pairToken: zeroAddress, creatorTaxBps: 0, buybackEnabled: false, graduationThreshold: 0n }
    },
    // Offline EOA verification stands in for the RPC-backed ERC-6492 check.
    watchFactory() { return () => {} },
    async verifySiwe(message, signature) {
      const line = message.split('\n')[1] as Address
      return verifyMessage({ address: line, message, signature })
    },
  }
  return chain
}

export function launchedLog(args: { token?: Address; curve?: Address; deployer: Address; pairToken?: Address; launchConfigId?: bigint; logIndex?: number; address?: Address }) {
  const topics = encodeEventTopics({ abi: factoryAbi, eventName: 'TokenLaunched', args: { token: args.token ?? TOKEN, curve: args.curve ?? CURVE, deployer: args.deployer } })
  const data = encodeAbiParameters([{ type: 'address' }, { type: 'uint256' }, { type: 'uint256' }], [args.pairToken ?? zeroAddress, args.launchConfigId ?? 0n, 4_200_000_000_000_000_000n])
  return { address: args.address ?? FACTORY, topics: topics as Hex[], data, logIndex: args.logIndex ?? 3 }
}

// Places a mined transaction for the intent on the fake chain and returns its hash.
export function mine(chain: FakeChain, intent: { transaction: { to: string; data: string; value: string }; wallet: string }, options: {
  hash?: Hex; from?: Address; to?: Address; input?: Hex; value?: bigint; status?: 'success' | 'reverted'; logs?: ReturnType<typeof launchedLog>[]; blockNumber?: bigint; chainId?: number
} = {}): Hex {
  const hash = options.hash ?? keccak256(toHex(`tx-${chain.txs.size}`))
  const blockNumber = options.blockNumber ?? chain.head.number - 1n
  const block: FetchedBlock = chain.blocks.get(blockNumber.toString()) ?? { number: blockNumber, hash: keccak256(toHex(`block-${blockNumber}`)), timestamp: 1_788_000_090n }
  chain.blocks.set(blockNumber.toString(), block)
  const from = options.from ?? (intent.wallet as Address)
  chain.txs.set(hash, { hash, from, to: options.to ?? (intent.transaction.to as Address), input: options.input ?? (intent.transaction.data as Hex), value: options.value ?? BigInt(intent.transaction.value),
    chainId: options.chainId ?? chain.chainId, blockHash: block.hash, blockNumber })
  chain.receipts.set(hash, { transactionHash: hash, status: options.status ?? 'success', blockHash: block.hash, blockNumber, to: options.to ?? (intent.transaction.to as Address), from,
    logs: options.logs ?? [launchedLog({ deployer: from })] })
  return hash
}
