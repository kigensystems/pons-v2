// Display helpers for launch terms and registry cards. Amounts stay integers until they are shown.
import { formatEther } from 'viem'
import type { Intent, IntentStatus, Launch, PonsCoin, Simulation } from './api'

export function formatEth(wei: string | bigint, maxFraction = 6): string {
  const value = formatEther(BigInt(wei))
  const [whole, fraction = ''] = value.split('.')
  const trimmed = fraction.slice(0, maxFraction).replace(/0+$/, '')
  return trimmed ? `${whole}.${trimmed}` : whole!
}

export const formatBps = (bps: number) => `${(bps / 100).toFixed(2)}%`

export const shortAddress = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`

export function formatUsd(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—'
  const abs = Math.abs(value)
  const scaled = abs >= 1e9 ? [value / 1e9, 'B'] : abs >= 1e6 ? [value / 1e6, 'M'] : abs >= 1e3 ? [value / 1e3, 'K'] : [value, '']
  const [n, suffix] = scaled as [number, string]
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: suffix ? 1 : 2 })}${suffix}`
}

export function formatChange(pct: number | null | undefined): string {
  if (pct === null || pct === undefined || !Number.isFinite(pct)) return '—'
  const sign = pct < 0 ? '−' : '+'
  return `${sign}${Math.abs(pct).toFixed(1)}%`
}

export function relativeAge(unixSeconds: number, nowSeconds = Date.now() / 1000): string {
  const delta = Math.max(0, Math.floor(nowSeconds - unixSeconds))
  if (delta < 60) return 'now'
  if (delta < 3600) return `${Math.floor(delta / 60)}m`
  if (delta < 86400) return `${Math.floor(delta / 3600)}h`
  return `${Math.floor(delta / 86400)}d`
}

// Gas allowance the wallet may spend at the estimated fee cap, in wei.
export function gasAllowanceWei(simulation: Simulation | null): bigint | null {
  if (!simulation || !simulation.ok) return null
  return BigInt(simulation.gas) * BigInt(simulation.maxFeePerGas)
}

// What a failed simulation should say. A short balance names the numbers; anything else keeps the API's reason.
export function describeSimulationFailure(simulation: Simulation): string {
  if (simulation.ok) return ''
  if (simulation.code === 'insufficient_funds' && simulation.balanceWei !== null && simulation.requiredWei) {
    return `Your wallet holds ${formatEth(simulation.balanceWei)} ETH on Robinhood Chain; this launch needs about ${formatEth(simulation.requiredWei, 4)} ETH including gas${simulation.shortfallWei ? `, ${formatEth(simulation.shortfallWei, 4)} ETH more` : ''}.`
  }
  return `Simulation failed: ${simulation.reason}`
}

export function describeIntent(status: IntentStatus, failure: string | null): { label: string; detail: string; tone: 'quiet' | 'active' | 'good' | 'bad' } {
  switch (status) {
    case 'prepared': return { label: 'Ready to sign', detail: 'Review the terms, then confirm in your wallet.', tone: 'quiet' }
    case 'submitted': return { label: 'Waiting for the network', detail: 'Your transaction was sent. We check every few seconds.', tone: 'active' }
    case 'included': return { label: 'Launched', detail: 'The token exists onchain. Confirmations are still settling.', tone: 'good' }
    case 'confirmed': return { label: 'Confirmed', detail: 'The launch is settled and listed in Explore.', tone: 'good' }
    case 'reverted': return { label: 'Reverted', detail: failure ?? 'The network rejected the transaction.', tone: 'bad' }
    case 'rejected': return { label: 'Not accepted', detail: failure ?? 'The transaction did not match the prepared launch.', tone: 'bad' }
    case 'expired': return { label: 'Expired', detail: 'This quote lapsed before signing. Prepare a fresh one.', tone: 'bad' }
    case 'unresolved': return { label: 'Not found', detail: failure ?? 'The transaction never appeared on the network.', tone: 'bad' }
  }
}

export const isSettled = (intent: Intent) => !['prepared', 'submitted'].includes(intent.status)

// One card shape for both collections: Plum's registry rows and the Pons feed. Explore lists coins
// that have left their curve, so the phase mostly matters for hiding the rest.
export type Coin = {
  token: `0x${string}`; name: string; symbol: string; logo: string | null; description: string
  creator: string | null; since: number | null; explorer: string | null; chart: string | null
  phase: 'curve' | 'graduating' | 'graduated'; marketCapUsd: number | null; priceChange24hPct: number | null; marketNote: string; madeWithPlum: boolean; hue: number
}

const CHARTS: Record<number, string> = { 4663: 'https://dexscreener.com/robinhood' }

export function coinFromLaunch(launch: Launch, index: number): Coin {
  const market = launch.market?.payload ?? null
  const phase = launch.protocol?.graduated ? 'graduated' : launch.protocol?.phase === 1 ? 'graduating' : 'curve'
  return {
    token: launch.token, name: launch.name, symbol: launch.symbol, logo: launch.logo || null, description: launch.description,
    creator: launch.creator, since: launch.blockTime, explorer: launch.explorer?.token ?? null, chart: phase === 'graduated' && CHARTS[launch.chainId] ? `${CHARTS[launch.chainId]}/${launch.token}` : null,
    phase, marketCapUsd: market?.marketCapUsd ?? null, priceChange24hPct: market?.priceChange24hPct ?? null,
    marketNote: launch.market ? { ok: '', stale: 'stale', error: 'unavailable', unavailable: 'no market data', unsupported: 'not indexed yet' }[launch.market.status] : 'no market data',
    madeWithPlum: true, hue: (index * 67 + launch.blockNumber) % 360,
  }
}

export function coinFromPons(coin: PonsCoin, index: number): Coin {
  return {
    token: coin.token, name: coin.name, symbol: coin.symbol, logo: coin.logo, description: coin.description,
    creator: coin.deployer, since: coin.graduatedAt ?? coin.launchedAt, explorer: coin.explorer, chart: coin.chart,
    phase: coin.bonded ? 'graduated' : (coin.bondingPct ?? 0) >= 100 ? 'graduating' : 'curve',
    // Mobula reports 0 for a coin nobody has traded yet; the card shows a dash rather than a false zero.
    marketCapUsd: coin.marketCapUsd || null, priceChange24hPct: coin.marketCapUsd ? coin.priceChange24hPct : null, marketNote: coin.marketCapUsd === null ? 'no market data' : '',
    madeWithPlum: coin.madeWithPlum, hue: (index * 67 + (coin.launchedAt ?? 0)) % 360,
  }
}

export type Sort = 'newest' | 'marketcap'

// Explore shows only coins that have left their curve; the rest stay on Pons until they do.
export function arrangeCoins(coins: Coin[], sort: Sort): Coin[] {
  const shown = coins.filter(coin => coin.phase === 'graduated')
  return sort === 'marketcap' ? shown.sort((a, b) => (b.marketCapUsd ?? -1) - (a.marketCapUsd ?? -1)) : shown.sort((a, b) => (b.since ?? 0) - (a.since ?? 0))
}
