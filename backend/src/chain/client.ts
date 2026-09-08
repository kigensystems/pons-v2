// Chain adapter. Everything the application needs from RPC goes through ChainReader so tests can
// substitute a fake and so a provider change stays inside this file.
import { createPublicClient, http, webSocket, decodeErrorResult, BaseError, ContractFunctionRevertedError, CallExecutionError, HttpRequestError, type Address, type Hex, type PublicClient } from 'viem'
import { robinhood, robinhoodTestnet } from 'viem/chains'
import { verifySiweMessage } from 'viem/siwe'
import { erc20Abi, factoryAbi, PHASES } from './abi.ts'
import type { Config } from '../config.ts'
import type { FetchedBlock, FetchedReceipt, FetchedTransaction } from './verify.ts'

export type LaunchConfig = { id: number; supply: bigint; curveFeeBps: bigint; phantomQuote: bigint; graduationThreshold: bigint; poolFee: number; tickSpacing: number; enabled: boolean; expectedEconomicsEth: Hex }
export type LaunchSettings = { blockNumber: bigint; blockHash: Hex; observedAt: number; launchFeeWei: bigint; launchEnabled: boolean; maxCreatorTaxBps: number; configs: LaunchConfig[] }
export type Simulation = { ok: true; gas: bigint; maxFeePerGas: bigint; maxPriorityFeePerGas: bigint } | { ok: false; code: string; reason: string }
// An ERC-20 the factory accepts as a launch's quote asset. Amounts are raw integers in the asset's own decimals.
export type PairToken = { address: Address; symbol: string; name: string; decimals: number; phantomQuote: bigint; graduationThreshold: bigint }
export type PairTokens = { blockNumber: bigint; observedAt: number; items: PairToken[] }
export type LaunchedToken = { exists: boolean; phase: number; phaseName: string; curve: Address; deployer: Address; creatorFeeRecipient: Address; pairToken: Address; creatorTaxBps: number; buybackEnabled: boolean; graduationThreshold: bigint }

export type ChainReader = {
  chainId: number
  latestBlock(): Promise<FetchedBlock>
  blockByNumber(number: bigint): Promise<FetchedBlock | null>
  launchSettings(): Promise<LaunchSettings>
  // Every pair asset the factory approves right now, named. ETH is not in the list; it is the zero address.
  pairTokens(): Promise<PairTokens>
  // The economics pin for a config and pair at a block; what launchToken must carry as expectedEconomics.
  launchEconomics(launchConfigId: bigint, pairToken: Address, blockNumber: bigint): Promise<Hex>
  canLaunch(account: Address, blockNumber: bigint): Promise<boolean>
  simulate(tx: { account: Address; to: Address; data: Hex; value: bigint }): Promise<Simulation>
  balance(account: Address): Promise<bigint>
  transaction(hash: Hex): Promise<FetchedTransaction | null>
  receipt(hash: Hex): Promise<FetchedReceipt | null>
  launchedToken(token: Address): Promise<LaunchedToken>
  verifySiwe(message: string, signature: Hex): Promise<boolean>
  // Streams every factory log as it is mined; returns the unsubscribe. A no-op without a WebSocket URL.
  watchFactory(onLog: (log: FactoryLog) => void): () => void
}
export type FactoryLog = { topic: Hex; blockNumber: bigint }

const RPC_CONCURRENCY = 16

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
  // Provider throughput is the limit under a burst (Alchemy answers 429 above its plan's cap; pay-as-you-go allows 10,000 CU/s).
  // Reads leave through a gate of RPC_CONCURRENCY at a time so a hundred simultaneous creators queue
  // instead of all colliding, and a 429 backs off 500 ms, 1 s, 2 s, 4 s before it is given up.
  const client: PublicClient = createPublicClient({ chain, transport: http(config.rpcUrl, { timeout: 10_000, retryCount: 4, retryDelay: 500 }) })
  const limited = gate(RPC_CONCURRENCY)
  const factory = { address: config.factory, abi: factoryAbi } as const
  const SETTINGS_TTL_MS = 10_000
  const SETTINGS_STALE_MS = 60_000
  let settingsCache: { value: LaunchSettings; at: number } | null = null
  let settingsInflight: Promise<LaunchSettings> | null = null
  const PAIRS_TTL_MS = 10 * 60_000
  const PAIRS_STALE_MS = 6 * 60 * 60_000
  let pairsCache: { value: PairTokens; at: number } | null = null
  let pairsInflight: Promise<PairTokens> | null = null
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

  // The factory publishes no list of pair assets, only a switch per address and an event when it moves.
  // Folding every PairTokenApprovalUpdated since deployment gives the approved set (58 events on
  // mainnet in September 2026, one request on Alchemy); each survivor is then named and priced.
  async function readPairTokens(): Promise<PairTokens> {
    const block = await client.getBlock({ blockTag: 'latest' })
    const blockNumber = block.number
    const logs = await client.getLogs({ address: config.factory, event: factoryAbi.find(f => f.type === 'event' && f.name === 'PairTokenApprovalUpdated')!, fromBlock: 0n, toBlock: blockNumber })
    const approved = new Map<string, Address>()
    for (const log of logs) {
      const address = log.args.pairToken!
      if (log.args.approved) approved.set(address.toLowerCase(), address); else approved.delete(address.toLowerCase())
    }
    const items = await Promise.all([...approved.values()].map(async address => {
      const token = { address, abi: erc20Abi } as const
      const [economics, symbol, name] = await Promise.all([
        limited(() => client.readContract({ ...factory, functionName: 'pairTokenEconomics', args: [address], blockNumber })),
        limited(() => client.readContract({ ...token, functionName: 'symbol', blockNumber })).catch(() => ''),
        limited(() => client.readContract({ ...token, functionName: 'name', blockNumber })).catch(() => ''),
      ])
      const [phantomQuote, graduationThreshold, decimals] = economics
      return { address, symbol: symbol || address.slice(0, 8), name: name || '', decimals, phantomQuote, graduationThreshold }
    }))
    items.sort((a, b) => a.symbol.localeCompare(b.symbol))
    return { blockNumber, observedAt: Number(block.timestamp), items }
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
    // Approvals move rarely, so the list serves for ten minutes and a failed refresh keeps a copy up to six hours old.
    pairTokens() {
      const age = pairsCache ? Date.now() - pairsCache.at : Infinity
      if (pairsCache && age < PAIRS_TTL_MS) return Promise.resolve(pairsCache.value)
      if (pairsInflight) return pairsInflight
      pairsInflight = readPairTokens()
        .then(value => { pairsCache = { value, at: Date.now() }; return value })
        .catch(error => { if (pairsCache && age < PAIRS_STALE_MS) return pairsCache.value; throw error })
        .finally(() => { pairsInflight = null })
      return pairsInflight
    },
    launchEconomics(launchConfigId, pairToken, blockNumber) { return limited(() => client.readContract({ ...factory, functionName: 'previewLaunchEconomics', args: [launchConfigId, pairToken], blockNumber })) },
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
    watchFactory(onLog) {
      if (!config.rpcWsUrl) return () => {}
      // The socket reconnects on its own; a dropped subscription only means the feed falls back to its
      // polling cadence until the next log arrives.
      const socket = createPublicClient({ chain, transport: webSocket(config.rpcWsUrl, { reconnect: { attempts: Number.POSITIVE_INFINITY, delay: 2000 }, keepAlive: true, timeout: 10_000 }) })
      return socket.watchEvent({
        address: config.factory,
        onLogs: logs => { for (const log of logs) if (log.topics[0] && log.blockNumber !== null) onLog({ topic: log.topics[0], blockNumber: log.blockNumber }) },
        onError: error => console.error('factory watch', error.message.replace(/wss?:\/\/\S+/g, '[endpoint]').slice(0, 160)),
      })
    },
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
