// Chain adapter. Everything the application needs from RPC goes through ChainReader so tests can
// substitute a fake and so a provider change stays inside this file.
import { createPublicClient, http, decodeErrorResult, BaseError, ContractFunctionRevertedError, CallExecutionError, type Address, type Hex, type PublicClient } from 'viem'
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

export function createChainReader(config: Config): ChainReader {
  const chain = config.chainId === robinhood.id ? robinhood : robinhoodTestnet
  const client: PublicClient = createPublicClient({ chain, transport: http(config.rpcUrl, { timeout: 15_000, retryCount: 2 }) })
  const factory = { address: config.factory, abi: factoryAbi } as const
  let settingsCache: { value: LaunchSettings; until: number } | null = null

  const toBlock = (b: { number: bigint | null; hash: Hex | null; timestamp: bigint }): FetchedBlock => ({ number: b.number!, hash: b.hash!, timestamp: b.timestamp })

  return {
    chainId: config.chainId,
    async latestBlock() { return toBlock(await client.getBlock({ blockTag: 'latest' })) },
    async blockByNumber(number) {
      try { return toBlock(await client.getBlock({ blockNumber: number })) } catch (error) {
        if (error instanceof BaseError && /not found|could not be found/i.test(error.shortMessage)) return null
        throw error
      }
    },
    async launchSettings() {
      if (settingsCache && settingsCache.until > Date.now()) return settingsCache.value
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
      const value: LaunchSettings = { blockNumber, blockHash: block.hash, observedAt: Number(block.timestamp), launchFeeWei, launchEnabled, maxCreatorTaxBps: Number(maxTax), configs }
      settingsCache = { value, until: Date.now() + 10_000 }
      return value
    },
    canLaunch(account, blockNumber) { return client.readContract({ ...factory, functionName: 'canLaunch', args: [account], blockNumber }) },
    async simulate(tx) {
      try {
        const [gas, fees] = await Promise.all([
          client.estimateGas({ account: tx.account, to: tx.to, data: tx.data, value: tx.value }),
          client.estimateFeesPerGas(),
        ])
        return { ok: true, gas, maxFeePerGas: fees.maxFeePerGas, maxPriorityFeePerGas: fees.maxPriorityFeePerGas }
      } catch (error) {
        return { ok: false, ...describeRevert(error) }
      }
    },
    balance(account) { return client.getBalance({ address: account }) },
    async transaction(hash) {
      try {
        const tx = await client.getTransaction({ hash })
        return { hash: tx.hash, from: tx.from, to: tx.to ?? null, input: tx.input, value: tx.value, chainId: tx.chainId, blockHash: tx.blockHash, blockNumber: tx.blockNumber }
      } catch (error) {
        if (error instanceof BaseError && /not.*found/i.test(error.shortMessage)) return null
        throw error
      }
    },
    async receipt(hash) {
      try {
        const r = await client.getTransactionReceipt({ hash })
        return { transactionHash: r.transactionHash, status: r.status, blockHash: r.blockHash, blockNumber: r.blockNumber, to: r.to ?? null, from: r.from,
          logs: r.logs.map(log => ({ address: log.address, topics: log.topics, data: log.data, logIndex: log.logIndex })) }
      } catch (error) {
        if (error instanceof BaseError && /not.*found/i.test(error.shortMessage)) return null
        throw error
      }
    },
    async launchedToken(token) {
      const t = await client.readContract({ ...factory, functionName: 'getLaunchedToken', args: [token] })
      return { exists: t.exists, phase: t.phase, phaseName: PHASES[t.phase] ?? `phase-${t.phase}`, curve: t.curve, deployer: t.deployer, creatorFeeRecipient: t.creatorFeeRecipient,
        pairToken: t.pairToken, creatorTaxBps: t.creatorTaxBps, buybackEnabled: t.buybackEnabled, graduationThreshold: t.graduationThreshold }
    },
    verifySiwe(message, signature) { return verifySiweMessage(client, { message, signature }) },
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
    if (/insufficient funds/i.test(error.shortMessage)) return { code: 'insufficient_funds', reason: 'Wallet balance cannot cover value plus gas' }
    return { code: 'simulation_failed', reason: error.shortMessage.replace(/https?:\/\/\S+/g, '[endpoint]') }
  }
  return { code: 'simulation_failed', reason: 'Simulation failed' }
}
