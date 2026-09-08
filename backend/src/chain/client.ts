// Chain adapter. Everything the application needs from RPC goes through ChainReader so tests can
// substitute a fake and so a provider change stays inside this file.
import { createPublicClient, http, decodeErrorResult, BaseError, ContractFunctionRevertedError, CallExecutionError, HttpRequestError, type Address, type Hex, type PublicClient } from 'viem'
import { robinhood, robinhoodTestnet } from 'viem/chains'
import { verifySiweMessage } from 'viem/siwe'
import { factoryAbi, PHASES } from './abi.ts'
import type { Config } from '../config.ts'
import type { FetchedBlock, FetchedReceipt, FetchedTransaction } from './verify.ts'

export type LaunchConfig = { id: number; supply: bigint; curveFeeBps: bigint; phantomQuote: bigint; graduationThreshold: bigint; poolFee: number; tickSpacing: number; enabled: boolean; expectedEconomicsEth: Hex }
export type LaunchSettings = { blockNumber: bigint; blockHash: Hex; observedAt: number; launchFeeWei: bigint; launchEnabled: boolean; maxCreatorTaxBps: number; configs: LaunchConfig[] }
export type Simulation = { ok: true; gas: bigint; maxFeePerGas: bigint; maxPriorityFeePerGas: bigint } | { ok: false; code: string; reason: string }
export type LaunchedToken = { exists: boolean; phase: number; phaseName: string; curve: Address; deployer: Address; creatorFeeRecipient: Address; pairToken: Address; creatorTaxBps: number; buybackEnabled: boolean; graduationThreshold: bigint }

export type ChainReader = {
  chainId: number
  latestBlock(): Promise<FetchedBlock>
  blockByNumber(number: bigint): Promise<FetchedBlock | null>
  launchSettings(): Promise<LaunchSettings>
  canLaunch(account: Address, blockNumber: bigint): Promise<boolean>
  simulate(tx: { account: Address; to: Address; data: Hex; value: bigint }): Promise<Simulation>
  balance(account: Address): Promise<bigint>
  transaction(hash: Hex): Promise<FetchedTransaction | null>
  receipt(hash: Hex): Promise<FetchedReceipt | null>
  launchedToken(token: Address): Promise<LaunchedToken>
  verifySiwe(message: string, signature: Hex): Promise<boolean>
}

const RPC_CONCURRENCY = 8

// Runs at most `limit` operations at a time; the rest wait their turn in order. The wait happens
// before the operation starts, so the transport's own timeout covers only the request itself.
export function gate(limit: number): <T>(run: () => Promise<T>) => Promise<T> {
  let active = 0
  const waiting: (() => void)[] = []
  return async run => {
    // A finishing operation hands its slot straight to the next in line, so the count never overshoots.
    if (active >= limit) await new Promise<void>(resolve => waiting.push(resolve))
    else active++
    try { return await run() } finally { const next = waiting.shift(); if (next) next(); else active-- }
  }
}

export function createChainReader(config: Config): ChainReader {
  const chain = config.chainId === robinhood.id ? robinhood : robinhoodTestnet
  // Provider throughput is the limit under a burst (Alchemy answers 429 above its plan's CU/s cap).
  // Reads leave through a gate of RPC_CONCURRENCY at a time so a hundred simultaneous creators queue
  // instead of all colliding, and a 429 backs off 500 ms, 1 s, 2 s, 4 s before it is given up.
  const client: PublicClient = createPublicClient({ chain, transport: http(config.rpcUrl, { timeout: 10_000, retryCount: 4, retryDelay: 500 }) })
  const limited = gate(RPC_CONCURRENCY)
  const factory = { address: config.factory, abi: factoryAbi } as const
  const SETTINGS_TTL_MS = 10_000
  const SETTINGS_STALE_MS = 60_000
  let settingsCache: { value: LaunchSettings; at: number } | null = null
  let settingsInflight: Promise<LaunchSettings> | null = null
  let feeCache: { value: { maxFeePerGas: bigint; maxPriorityFeePerGas: bigint }; until: number } | null = null
  let feeInflight: Promise<{ maxFeePerGas: bigint; maxPriorityFeePerGas: bigint }> | null = null

  // Fee estimate shared by every simulation for ten seconds: two RPC calls per burst, not per intent.
  function fees() {
    if (feeCache && feeCache.until > Date.now()) return Promise.resolve(feeCache.value)
    if (feeInflight) return feeInflight
    feeInflight = limited(() => client.estimateFeesPerGas()).then(value => { feeCache = { value, until: Date.now() + SETTINGS_TTL_MS }; return value }).finally(() => { feeInflight = null })
    return feeInflight
  }

  async function readSettings(): Promise<LaunchSettings> {
    const block = await client.getBlock({ blockTag: 'latest' })
    const blockNumber = block.number
    const [launchFeeWei, launchEnabled, maxTax, count] = await Promise.all([
      client.readContract({ ...factory, functionName: 'launchFee', blockNumber }),
      client.readContract({ ...factory, functionName: 'launchEnabled', blockNumber }),
      client.readContract({ ...factory, functionName: 'maxCreatorTaxBps', blockNumber }),
      client.readContract({ ...factory, functionName: 'launchConfigCount', blockNumber }),
    ])
    const ids = Array.from({ length: Number(count) }, (_, i) => BigInt(i))
    const configs = await Promise.all(ids.map(async id => {
      const [c, economics] = await Promise.all([
        client.readContract({ ...factory, functionName: 'getLaunchConfig', args: [id], blockNumber }),
        client.readContract({ ...factory, functionName: 'previewLaunchEconomics', args: [id, '0x0000000000000000000000000000000000000000'], blockNumber }),
      ])
      return { id: Number(id), supply: c.supply, curveFeeBps: c.curveFeeBps, phantomQuote: c.phantomQuote, graduationThreshold: c.graduationThreshold,
        poolFee: c.poolFee, tickSpacing: c.tickSpacing, enabled: c.enabled, expectedEconomicsEth: economics }
    }))
    return { blockNumber, blockHash: block.hash, observedAt: Number(block.timestamp), launchFeeWei, launchEnabled, maxCreatorTaxBps: Number(maxTax), configs }
  }

  const toBlock = (b: { number: bigint | null; hash: Hex | null; timestamp: bigint }): FetchedBlock => ({ number: b.number!, hash: b.hash!, timestamp: b.timestamp })

  return {
    chainId: config.chainId,
    async latestBlock() { return toBlock(await limited(() => client.getBlock({ blockTag: 'latest' }))) },
    async blockByNumber(number) {
      try { return toBlock(await limited(() => client.getBlock({ blockNumber: number }))) } catch (error) {
        if (error instanceof BaseError && /not found|could not be found/i.test(error.shortMessage)) return null
        throw error
      }
    },
    // One settings read serves every caller for ten seconds; concurrent misses share a single read,
    // and a failed read falls back to a value up to a minute old rather than failing the page.
    launchSettings() {
      const age = settingsCache ? Date.now() - settingsCache.at : Infinity
      if (settingsCache && age < SETTINGS_TTL_MS) return Promise.resolve(settingsCache.value)
      if (settingsInflight) return settingsInflight
      settingsInflight = limited(readSettings)
        .then(value => { settingsCache = { value, at: Date.now() }; return value })
        .catch(error => { if (settingsCache && age < SETTINGS_STALE_MS) return settingsCache.value; throw error })
        .finally(() => { settingsInflight = null })
      return settingsInflight
    },
    canLaunch(account, blockNumber) { return limited(() => client.readContract({ ...factory, functionName: 'canLaunch', args: [account], blockNumber })) },
    async simulate(tx) {
      try {
        const [gas, fee] = await Promise.all([
          limited(() => client.estimateGas({ account: tx.account, to: tx.to, data: tx.data, value: tx.value })),
          fees(),
        ])
        return { ok: true, gas, maxFeePerGas: fee.maxFeePerGas, maxPriorityFeePerGas: fee.maxPriorityFeePerGas }
      } catch (error) {
        return { ok: false, ...describeRevert(error) }
      }
    },
    balance(account) { return limited(() => client.getBalance({ address: account })) },
    async transaction(hash) {
      try {
        const tx = await limited(() => client.getTransaction({ hash }))
        return { hash: tx.hash, from: tx.from, to: tx.to ?? null, input: tx.input, value: tx.value, chainId: tx.chainId, blockHash: tx.blockHash, blockNumber: tx.blockNumber }
      } catch (error) {
        if (error instanceof BaseError && /not.*found/i.test(error.shortMessage)) return null
        throw error
      }
    },
    async receipt(hash) {
      try {
        const r = await limited(() => client.getTransactionReceipt({ hash }))
        return { transactionHash: r.transactionHash, status: r.status, blockHash: r.blockHash, blockNumber: r.blockNumber, to: r.to ?? null, from: r.from,
          logs: r.logs.map(log => ({ address: log.address, topics: log.topics, data: log.data, logIndex: log.logIndex })) }
      } catch (error) {
        if (error instanceof BaseError && /not.*found/i.test(error.shortMessage)) return null
        throw error
      }
    },
    async launchedToken(token) {
      const t = await limited(() => client.readContract({ ...factory, functionName: 'getLaunchedToken', args: [token] }))
      return { exists: t.exists, phase: t.phase, phaseName: PHASES[t.phase] ?? `phase-${t.phase}`, curve: t.curve, deployer: t.deployer, creatorFeeRecipient: t.creatorFeeRecipient,
        pairToken: t.pairToken, creatorTaxBps: t.creatorTaxBps, buybackEnabled: t.buybackEnabled, graduationThreshold: t.graduationThreshold }
    },
    verifySiwe(message, signature) { return limited(() => verifySiweMessage(client, { message, signature })) },
  }
}

// Turns a viem estimate/call failure into a short, secret-free description. Named pons errors decode by
// selector; anything else keeps the raw revert data so the reason is still inspectable.
export function describeRevert(error: unknown): { code: string; reason: string } {
  if (error instanceof BaseError) {
    const reverted = error.walk(e => e instanceof ContractFunctionRevertedError) as ContractFunctionRevertedError | null
    if (reverted?.data?.errorName) return { code: reverted.data.errorName, reason: `Factory rejected the launch: ${reverted.data.errorName}` }
    const raw = (error.walk(e => e instanceof CallExecutionError) as CallExecutionError | null)?.cause
    const data = (raw as { data?: Hex } | undefined)?.data
    if (typeof data === 'string' && data.startsWith('0x') && data.length >= 10) {
      try {
        const decoded = decodeErrorResult({ abi: factoryAbi, data })
        return { code: decoded.errorName, reason: `Factory rejected the launch: ${decoded.errorName}` }
      } catch {
        return { code: 'revert', reason: `Reverted with data ${data.slice(0, 10)}` }
      }
    }
    // Geth says "insufficient funds"; Robinhood Chain's Nitro node says the cost "exceeds the balance".
    if (/insufficient funds|exceeds the balance/i.test(error.message)) return { code: 'insufficient_funds', reason: 'Wallet balance cannot cover the creation fee plus gas' }
    // A transport failure keeps its status so the record says whether the provider throttled or timed out.
    const status = error instanceof HttpRequestError ? error.status : undefined
    const reason = status === 429 ? 'The chain provider is busy; try again in a moment'
      : status ? `Chain provider responded ${status}`
      : error instanceof HttpRequestError ? `Chain provider unreachable (${error.details.slice(0, 80)}); try again in a moment`
      : error.shortMessage
    return { code: status === 429 ? 'provider_busy' : 'simulation_failed', reason: reason.replace(/https?:\/\/\S+/g, '[endpoint]') }
  }
  return { code: 'simulation_failed', reason: 'Simulation failed' }
}
