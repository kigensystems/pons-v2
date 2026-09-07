// Wallet session state for Explore: restores an existing cookie session, connects and signs in on
// demand, and drops the session when the wallet's account or chain changes.
import { useCallback, useEffect, useState } from 'react'
import { api, type LaunchConfigResponse, type Session } from './api'
import { connectAndSignIn, currentAccount, hasWallet, watchWallet, WalletError } from './wallet'

export type SessionState = {
  session: Session | null
  config: LaunchConfigResponse | null
  configError: string | null
  connecting: boolean
  error: string | null
  walletAvailable: boolean
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  refreshConfig: () => Promise<void>
}

export function useSession(): SessionState {
  const [session, setSession] = useState<Session | null>(null)
  const [config, setConfig] = useState<LaunchConfigResponse | null>(null)
  const [configError, setConfigError] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [walletAvailable] = useState(() => hasWallet())

  const refreshConfig = useCallback(async () => {
    try { setConfig(await api.launchConfig()); setConfigError(null) } catch (failure) { setConfigError(failure instanceof Error ? failure.message : 'Launch settings are unavailable.') }
  }, [])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const [existing, account] = await Promise.all([api.session().catch(() => null), currentAccount()])
      if (cancelled) return
      // Only trust a stored session when the wallet still exposes the same account.
      if (existing && account && account.toLowerCase() === existing.address.toLowerCase()) setSession(existing)
      else if (existing) await api.logout().catch(() => {})
      await refreshConfig()
    })()
    return () => { cancelled = true }
  }, [refreshConfig])

  useEffect(() => watchWallet(() => {
    setSession(null)
    setError('Your wallet changed. Connect again to continue.')
    void api.logout().catch(() => {})
    void refreshConfig()
  }), [refreshConfig])

  const connect = useCallback(async () => {
    if (!config) { setError(configError ?? 'Launch settings are still loading.'); return }
    setConnecting(true); setError(null)
    try {
      setSession(await connectAndSignIn(config.chainId))
      void refreshConfig()
    } catch (failure) {
      setError(failure instanceof WalletError || failure instanceof Error ? failure.message : 'The wallet connection failed.')
    } finally { setConnecting(false) }
  }, [config, configError, refreshConfig])

  const disconnect = useCallback(async () => {
    setSession(null); setError(null)
    await api.logout().catch(() => {})
    void refreshConfig()
  }, [refreshConfig])

  return { session, config, configError, connecting, error, walletAvailable, connect, disconnect, refreshConfig }
}
