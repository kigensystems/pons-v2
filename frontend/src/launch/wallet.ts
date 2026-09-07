// Browser wallet access through the injected EIP-1193 provider and viem. The wallet keeps every key;
// this module asks it to switch chains, sign the sign-in message and send the reviewed transaction.
import { createWalletClient, custom, UserRejectedRequestError, type Chain, type EIP1193Provider, type Hex, type WalletClient } from 'viem'
import { robinhood, robinhoodTestnet } from 'viem/chains'
import { api, type Session } from './api'

declare global { interface Window { ethereum?: EIP1193Provider } }

export class WalletError extends Error {
  code: 'no_wallet' | 'rejected' | 'wrong_chain' | 'failed'
  constructor(code: WalletError['code'], message: string) { super(message); this.code = code }
}

export function chainFor(chainId: number): Chain {
  if (chainId === robinhood.id) return robinhood
  if (chainId === robinhoodTestnet.id) return robinhoodTestnet
  throw new WalletError('wrong_chain', `Unsupported chain ${chainId}`)
}

export const hasWallet = () => typeof window !== 'undefined' && Boolean(window.ethereum)

function provider(): EIP1193Provider {
  if (!window.ethereum) throw new WalletError('no_wallet', 'No browser wallet was found. Install one, then reload.')
  return window.ethereum
}

function client(chain: Chain): WalletClient {
  return createWalletClient({ chain, transport: custom(provider()) })
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

async function ensureChain(wallet: WalletClient, chain: Chain) {
  const current = await wallet.getChainId()
  if (current === chain.id) return
  try {
    await wallet.switchChain({ id: chain.id })
  } catch (error) {
    const code = (error as { code?: number; cause?: { code?: number } } | null)?.code ?? (error as { cause?: { code?: number } } | null)?.cause?.code
    if (code !== 4902 && !/unrecognized|not added|4902/i.test(String((error as Error)?.message))) throw error
    await wallet.addChain({ chain })
    await wallet.switchChain({ id: chain.id })
  }
  if ((await wallet.getChainId()) !== chain.id) throw new WalletError('wrong_chain', `Switch your wallet to ${chain.name} to continue.`)
}

// Connects, moves the wallet to the Plum chain, and signs in. Returns the server session.
export async function connectAndSignIn(chainId: number): Promise<Session> {
  const chain = chainFor(chainId)
  try {
    const wallet = client(chain)
    const [address] = await wallet.requestAddresses()
    if (!address) throw new WalletError('failed', 'The wallet returned no account.')
    await ensureChain(wallet, chain)
    const { message } = await api.challenge(address, chain.id)
    const signature = await wallet.signMessage({ account: address, message })
    return await api.verify(message, signature)
  } catch (error) {
    throw translate(error, 'The wallet connection failed.')
  }
}

export async function currentAccount(): Promise<`0x${string}` | null> {
  if (!hasWallet()) return null
  try {
    const accounts = await provider().request({ method: 'eth_accounts' })
    return accounts[0] ?? null
  } catch { return null }
}

export async function sendPreparedTransaction(session: Session, tx: { chainId: number; to: `0x${string}`; data: Hex; value: string }, gas?: string): Promise<Hex> {
  const chain = chainFor(tx.chainId)
  try {
    const wallet = client(chain)
    const [account] = await wallet.getAddresses()
    if (!account || account.toLowerCase() !== session.address.toLowerCase()) throw new WalletError('failed', 'The wallet account changed. Sign in again.')
    await ensureChain(wallet, chain)
    return await wallet.sendTransaction({ account, chain, to: tx.to, data: tx.data, value: BigInt(tx.value), gas: gas ? BigInt(gas) : undefined })
  } catch (error) {
    throw translate(error, 'The transaction could not be sent.')
  }
}

// Fires when the wallet's account or chain changes so the app can drop its session and prepared intents.
export function watchWallet(onChange: () => void): () => void {
  if (!hasWallet()) return () => {}
  const p = provider()
  const handler = () => onChange()
  p.on('accountsChanged', handler)
  p.on('chainChanged', handler)
  return () => { p.removeListener('accountsChanged', handler); p.removeListener('chainChanged', handler) }
}
