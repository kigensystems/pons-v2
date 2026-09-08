import { useCallback, useEffect, useRef, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { api, type Launch } from './api'
import { wagmiConfig } from './appkit'
import ExploreMonitor from './ExploreMonitor'
import LaunchForm from './LaunchForm'
import TokenGrid, { type Filter } from './TokenGrid'
import { PaperHeader, PaperFooter } from './PaperChrome'
import { useSession } from './useSession'
import './launch.css'

const REFRESH_MS = 30_000
const queryClient = new QueryClient()

export default function ExplorePage() {
  return <WagmiProvider config={wagmiConfig}><QueryClientProvider client={queryClient}><ExploreDesk /></QueryClientProvider></WagmiProvider>
}

function ExploreDesk() {
  const wallet = useSession()
  const [launches, setLaunches] = useState<Launch[]>([])
  const [stats, setStats] = useState({ total: 0, confirmed: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [notice, setNotice] = useState('')
  // The creation desk is a top-layer dialog, so it closes while the wallet picker is open and
  // reopens once the sign-in it asked for lands.
  const reopenDesk = useRef(false)

  useEffect(() => { document.title = 'Explore — Plum' }, [])
  useEffect(() => { if (wallet.session && reopenDesk.current) { reopenDesk.current = false; setCreating(true) } }, [wallet.session])

  const load = useCallback(async () => {
    try {
      const page = await api.launches({ limit: 60 })
      setLaunches(page.items); setStats(page.stats); setError(null)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'The registry is unavailable.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => { if (!document.hidden) void load() }, REFRESH_MS)
    void (async () => { await load() })()
    return () => clearInterval(timer)
  }, [load])

  const mine = wallet.session ? launches.filter(launch => launch.creator.toLowerCase() === wallet.session!.address.toLowerCase()).length : 0
  const onCurve = launches.filter(launch => launch.protocol?.onCurve).length
  const graduated = launches.filter(launch => launch.protocol?.graduated).length

  return (
    <div className="pad">
      <PaperHeader page="explore" wallet={{ address: wallet.session?.address ?? wallet.address, signedIn: Boolean(wallet.session), connecting: wallet.connecting, onConnect: () => void wallet.connect(), onDisconnect: () => void wallet.disconnect() }} onCreate={() => setCreating(true)} />
      <main id="paper-main">
        <section className="pad-hero" aria-labelledby="pad-hero-title">
          <div className="pad-hero-copy">
            <p className="pad-kicker"><span className="pad-dot" /> The discovery desk</p>
            <h1 id="pad-hero-title">A new window<br /><em>on what’s next.</em></h1>
            <p className="pad-hero-sub">Explore the coins launched through Plum, or start one of your own.</p>
            <div className="pad-hero-actions">
              <button type="button" className="pad-btn pad-btn--dark" onClick={() => setCreating(true)}>Create a coin</button>
              <a className="pad-link" href="/about">About us</a>
            </div>
          </div>
          <ExploreMonitor launch={launches[0] ?? null} loading={loading} error={error} />
          {!loading && !error && <p className="pad-hero-status" role="status">{stats.total === 0 ? 'No coins in the collection yet.' : [`${stats.total} in the collection`, `${stats.confirmed} confirmed`, `${graduated} graduated`, `${onCurve} on the curve`, wallet.session ? `${mine} made by you` : null].filter(Boolean).join(' · ')}</p>}
        </section>

        <div className="pad-stripe-rule" aria-hidden="true" />

        <section className="pad-explore" aria-labelledby="pad-explore-title">
          <div className="pad-explore-head">
            <h2 id="pad-explore-title">The collection<span className="pad-period">.</span></h2>
            <label className="pad-search"><span className="pad-sr-only">Search coins by name, ticker or address</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.5" /><path d="m16 16 5 5" stroke="currentColor" strokeWidth="1.5" /></svg><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Find something interesting" /></label>
          </div>
          {wallet.error && <p className="pad-notice" data-tone="bad" role="alert">{wallet.error} <button type="button" onClick={() => void wallet.connect()}>Connect</button></p>}
          {wallet.configError && !wallet.config && !error && <p className="pad-notice" data-tone="bad" role="alert">Launch settings are unavailable: {wallet.configError}</p>}
          <div className="pad-collection-tools">
            <div className="pad-filters" role="group" aria-label="Filter coins">
              {(['all', 'graduated', 'curve', 'mine'] as Filter[]).map(value => (
                <button key={value} type="button" className="pad-chip" aria-pressed={filter === value} onClick={() => setFilter(value)}>
                  {{ all: 'All coins', graduated: 'Graduated', curve: 'On the curve', mine: 'Made by you' }[value]}
                </button>
              ))}
            </div>
            <p className="pad-sample-note"><span className="pad-dot" /> {error && launches.length ? 'Showing the last good read' : 'Plum launches only · Robinhood Chain'}</p>
          </div>
          <p className="pad-sr-only" role="status">{notice}</p>
          <TokenGrid launches={launches} loading={loading} error={error} filter={filter} search={search} viewer={wallet.session?.address ?? null} onReset={() => { setSearch(''); setFilter('all') }} onRetry={() => { setLoading(true); void load() }} />
        </section>

      </main>
      <PaperFooter />
      {creating && <LaunchForm session={wallet.session} config={wallet.config} connecting={wallet.connecting} connected={Boolean(wallet.address)} onConnect={() => { reopenDesk.current = true; setCreating(false); void wallet.connect() }} onClose={() => setCreating(false)} onLaunched={intent => {
        setNotice(`${intent.tokenParams.name} launched. It is now in the collection.`)
        setSearch(''); setFilter('all')
        void load()
      }} />}
    </div>
  )
}
