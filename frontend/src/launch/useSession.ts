// Wallet session state for Explore. AppKit owns the connection and Plum owns the sign-in: a stored
// cookie session is kept only while it matches the connected account and chain, a connection made
// from the Connect button is followed by the sign-in signature, and any account, chain or
// connection change drops the session.
import { useCallback, useEffect, useRef, useState } from 'react'
import { useAppKit } from '@reown/appkit/react'
import { useAccount } from 'wagmi'
import { api, type LaunchConfigResponse, type Session } from './api'
import { chainName, disconnectWallet, signIn, WalletError } from './wallet'

export type SessionState = {
  session: Session | null
  address: `0x${string}` | null
  config: LaunchConfigResponse | null
  configError: string | null
  connecting: boolean
  error: string | null
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  refreshConfig: () => Promise<void>
}

export function useSession(): SessionState {
  const account = useAccount()
  const { open } = useAppKit()
  const [session, setSession] = useState<Session | null>(null)
  // The cookie session read at load, waiting for the wallet to settle before it is trusted.
  const [stored, setStored] = useState<Session | null | undefined>(undefined)
  const [config, setConfig] = useState<LaunchConfigResponse | null>(null)
  const [configError, setConfigError] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const signInWanted = useRef(false)

  const refreshConfig = useCallback(async () => {
    try { setConfig(await api.launchConfig()); setConfigError(null) } catch (failure) { setConfigError(failure instanceof Error ? failure.message : 'Launch settings are unavailable.') }
  }, [])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const existing = await api.session().catch(() => null)
      if (!cancelled) setStored(existing)
      await refreshConfig()
    })()
    return () => { cancelled = true }
  }, [refreshConfig])

  // Reconcile the session with the wallet once it settles and whenever it changes.
  useEffect(() => {
    if (account.status === 'connecting' || account.status === 'reconnecting' || stored === undefined) return
    const candidate = stored ?? session
    if (!candidate) return
    const address = account.address?.toLowerCase()
    const problem = !address ? 'disconnected' : address !== candidate.address.toLowerCase() ? 'account' : account.chainId !== candidate.chainId ? 'chain' : null
    let cancelled = false
    void (async () => {
      if (!problem) { if (stored) { setStored(null); setSession(stored) } return }
      await api.logout().catch(() => {})
      if (cancelled) return
      setStored(null); setSession(null)
      if (stored) return
      setError(problem === 'account' ? 'Your wallet account changed. Sign in again to continue.' : problem === 'chain' ? `Your wallet left ${chainName(candidate.chainId)}. Switch back and sign in again.` : null)
      void refreshConfig()
    })()
    return () => { cancelled = true }
  }, [account.status, account.address, account.chainId, stored, session, refreshConfig])

  const doSignIn = useCallback(async () => {
    if (!config) { setError(configError ?? 'Launch settings are still loading.'); return }
    setConnecting(true); setError(null)
    try {
      setSession(await signIn(config.chainId))
      void refreshConfig()
    } catch (failure) {
      setError(failure instanceof WalletError || failure instanceof Error ? failure.message : 'The wallet sign-in failed.')
    } finally { setConnecting(false) }
  }, [config, configError, refreshConfig])

  // A connection made from the Connect button continues straight into the sign-in signature.
  useEffect(() => {
    if (!signInWanted.current || account.status !== 'connected' || session || !config) return
    signInWanted.current = false
    void doSignIn()
  }, [account.status, account.address, session, config, doSignIn])

  const connect = useCallback(async () => {
    if (account.status === 'connected') { await doSignIn(); return }
    signInWanted.current = true
    await open({ view: 'Connect' })
  }, [account.status, doSignIn, open])

  const disconnect = useCallback(async () => {
    setSession(null); setError(null)
    await api.logout().catch(() => {})
    await disconnectWallet()
    void refreshConfig()
  }, [refreshConfig])

  return { session, address: account.address ?? null, config, configError, connecting, error, connect, disconnect, refreshConfig }
}
