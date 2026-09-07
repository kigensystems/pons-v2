// Wallet actions over the wagmi config that AppKit manages. The wallet keeps every key; this module
// asks it to switch chains, sign the sign-in message and send the reviewed transaction.
import { disconnect, getAccount, getChainId, sendTransaction, signMessage, switchChain } from '@wagmi/core'
import { UserRejectedRequestError, type Hex } from 'viem'
import { api, type Session } from './api'
import { networks, wagmiConfig, type ChainId } from './appkit'

export class WalletError extends Error {
  code: 'no_wallet' | 'rejected' | 'wrong_chain' | 'failed'
  constructor(code: WalletError['code'], message: string) { super(message); this.code = code }
}

export function chainName(chainId: number): string {
  return networks.find(network => network.id === chainId)?.name ?? `chain ${chainId}`
}

function isRejection(error: unknown): boolean {
  if (error instanceof UserRejectedRequestError) return true
  const code = (error as { code?: number; cause?: { code?: number } } | null)?.code ?? (error as { cause?: { code?: number } } | null)?.cause?.code
  return code === 4001
}

function translate(error: unknown, fallback: string): WalletError {
  if (error instanceof WalletError) return error
  if (isRejection(error)) return new WalletError('rejected', 'You cancelled the request in your wallet.')
  const message = error instanceof Error ? error.message.split('\n')[0]!.slice(0, 160) : fallback
  return new WalletError('failed', message || fallback)
}

async function ensureChain(chainId: number) {
  if (getChainId(wagmiConfig) !== chainId) await switchChain(wagmiConfig, { chainId: chainId as ChainId })
  if (getAccount(wagmiConfig).chainId !== chainId) throw new WalletError('wrong_chain', `Switch your wallet to ${chainName(chainId)} to continue.`)
}

export function connectedAddress(): `0x${string}` | null {
  return getAccount(wagmiConfig).address ?? null
}

// Signs the Plum sign-in message with the connected account. Returns the server session.
export async function signIn(chainId: number): Promise<Session> {
  try {
    const address = connectedAddress()
    if (!address) throw new WalletError('no_wallet', 'Connect a wallet first.')
    await ensureChain(chainId)
    const { message } = await api.challenge(address, chainId)
    const signature = await signMessage(wagmiConfig, { account: address, message })
    return await api.verify(message, signature)
  } catch (error) {
    throw translate(error, 'The wallet sign-in failed.')
  }
}

export async function sendPreparedTransaction(session: Session, tx: { chainId: number; to: `0x${string}`; data: Hex; value: string }, gas?: string): Promise<Hex> {
  try {
    const account = connectedAddress()
    if (!account || account.toLowerCase() !== session.address.toLowerCase()) throw new WalletError('failed', 'The wallet account changed. Sign in again.')
    await ensureChain(tx.chainId)
    return await sendTransaction(wagmiConfig, { account, chainId: tx.chainId as ChainId, to: tx.to, data: tx.data, value: BigInt(tx.value), gas: gas ? BigInt(gas) : undefined })
  } catch (error) {
    throw translate(error, 'The transaction could not be sent.')
  }
}

export async function disconnectWallet(): Promise<void> {
  try { await disconnect(wagmiConfig) } catch { /* already disconnected */ }
}
