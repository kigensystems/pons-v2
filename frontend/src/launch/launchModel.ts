// Display helpers for launch terms and registry cards. Amounts stay integers until they are shown.
import { formatEther } from 'viem'
import type { Intent, IntentStatus, Launch, Simulation } from './api'

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

export function launchBadge(launch: Launch): string {
  if (launch.confirmationState === 'included') return 'Confirming'
  if (launch.protocol?.graduated) return 'Graduated'
  if (launch.protocol?.phase === 1) return 'Graduating'
  return 'On the curve'
}
