import { useCallback, useEffect, useRef, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { api, type Launch, type PonsCoins, type Spotlight } from './api'
import { wagmiConfig } from './appkit'
import ExploreMonitor from './ExploreMonitor'
import LaunchForm from './LaunchForm'
import TokenGrid, { type Source } from './TokenGrid'
import { PaperHeader, PaperFooter } from './PaperChrome'
import { useSession } from './useSession'
import { arrangeCoins, coinFromLaunch, coinFromPons, type Sort } from './launchModel'
import './launch.css'

const REFRESH_MS = 15_000
const clockTime = (stamp: number) => new Date(stamp < 1e12 ? stamp * 1000 : stamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
const queryClient = new QueryClient()

export default function ExplorePage() {
  return <WagmiProvider config={wagmiConfig}><QueryClientProvider client={queryClient}><ExploreDesk /></QueryClientProvider></WagmiProvider>
}

function ExploreDesk() {
  const wallet = useSession()
  const [launches, setLaunches] = useState<Launch[]>([])
  const [pons, setPons] = useState<PonsCoins | null>(null)
  const [ponsError, setPonsError] = useState<string | null>(null)
  const [spotlight, setSpotlight] = useState<Spotlight | null>(null)
  const [spotlightError, setSpotlightError] = useState<string | null>(null)
  const [source, setSource] = useState<Source>('pons')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sort, setSort] = useState<Sort>('newest')
  const [onlyMine, setOnlyMine] = useState(false)
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [notice, setNotice] = useState('')
  // When the last successful read of each collection landed in this browser; a failed refresh keeps the cards and says so.
  const [lastGood, setLastGood] = useState<{ pons: number | null; plum: number | null }>({ pons: null, plum: null })
  // The creation desk is a top-layer dialog, so it closes while the wallet picker is open and
  // reopens once the sign-in it asked for lands.
  const reopenDesk = useRef(false)

  useEffect(() => { document.title = 'Explore — Plum' }, [])
  useEffect(() => { if (wallet.session && reopenDesk.current) { reopenDesk.current = false; setCreating(true) } }, [wallet.session])

  // The registry, the Pons feed and the spotlight are read together; any one can fail without darkening the others.
  const load = useCallback(async () => {
    const [page, feed, latest] = await Promise.allSettled([api.launches({ limit: 60 }), api.ponsCoins(), api.spotlight()])
    const reason = (failure: unknown, fallback: string) => failure instanceof Error ? failure.message : fallback
    if (page.status === 'fulfilled') { setLaunches(page.value.items); setError(null); setLastGood(previous => ({ ...previous, plum: Date.now() })) } else setError(reason(page.reason, 'The registry is unavailable.'))
    if (feed.status === 'fulfilled') { setPons(feed.value); setPonsError(feed.value.status === 'error' || feed.value.status === 'unavailable' ? feed.value.error : null); if (feed.value.status === 'ok') setLastGood(previous => ({ ...previous, pons: Date.now() })) } else setPonsError(reason(feed.reason, 'The Pons feed is unavailable.'))
    if (latest.status === 'fulfilled') { setSpotlight(latest.value); setSpotlightError(null) } else setSpotlightError(reason(latest.reason, 'The launch service could not be reached.'))
    setLoading(false)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => { if (!document.hidden) void load() }, REFRESH_MS)
    void (async () => { await load() })()
    return () => clearInterval(timer)
  }, [load])

  const coins = source === 'pons' ? (pons?.items ?? []).map(coinFromPons) : launches.map(coinFromLaunch)
  const migratedPlum = arrangeCoins(launches.map(coinFromLaunch), 'newest').length
  const mine = wallet.session ? arrangeCoins(coins, 'newest').filter(coin => coin.creator?.toLowerCase() === wallet.session!.address.toLowerCase()).length : 0
  const collectionError = source === 'pons' ? ponsError : error
  // Old cards stay on a failed refresh, labelled with when they were last read: the server's read for a stale feed, this browser's for a lost request.
  const ponsStale = Boolean(pons?.items.length) && (pons!.status !== 'ok' || Boolean(ponsError))
  const staleSince = source === 'pons' ? (ponsError && lastGood.pons ? lastGood.pons : pons?.retrievedAt ?? null) : lastGood.plum
  const staleNote = `Showing the last good read${staleSince ? ` from ${clockTime(staleSince)}` : ''}`

  return (
    <div className="pad">
      <PaperHeader page="explore" wallet={{ address: wallet.session?.address ?? wallet.address, signedIn: Boolean(wallet.session), connecting: wallet.connecting, onConnect: () => void wallet.connect(), onDisconnect: () => void wallet.disconnect() }} onCreate={() => setCreating(true)} />
      <main id="paper-main">
        <section className="pad-hero" aria-labelledby="pad-hero-title">
          <div className="pad-hero-copy">
            <p className="pad-kicker"><span className="pad-dot" /> The discovery desk</p>
            <h1 id="pad-hero-title">A new window on what’s next.</h1>
            <p className="pad-hero-sub">Explore what is launching on Pons, or start a coin of your own through Plum.</p>
            <div className="pad-hero-actions">
              <button type="button" className="pad-btn pad-btn--dark" onClick={() => setCreating(true)}>Create a coin</button>
              <a className="pad-link" href="/about">About us</a>
            </div>
          </div>
          <ExploreMonitor spotlight={spotlight} error={spotlightError} />
          {!loading && <p className="pad-hero-status" role="status">{[pons?.items.length ? `${pons.items.length} migrated on Pons` : null, error ? null : `${migratedPlum} migrated through Plum`, wallet.session && mine ? `${mine} made by you` : null].filter(Boolean).join(' · ') || 'The collection is out of reach.'}</p>}
        </section>

        <div className="pad-stripe-rule" aria-hidden="true" />

        <section className="pad-explore" aria-labelledby="pad-explore-title">
          <div className="pad-explore-head">
            <h2 id="pad-explore-title">The collection<span className="pad-period">.</span></h2>
            <label className="pad-search"><span className="pad-sr-only">Search coins by name, ticker or address</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.5" /><path d="m16 16 5 5" stroke="currentColor" strokeWidth="1.5" /></svg><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Find something interesting" /></label>
          </div>
          {wallet.error && <p className="pad-notice" data-tone="bad" role="alert">{wallet.error} <button type="button" onClick={() => void wallet.connect()}>Connect</button></p>}
          {wallet.configError && !wallet.config && !error && <p className="pad-notice" data-tone="bad" role="alert">Launch settings are unavailable: {wallet.configError}</p>}
          <div className="pad-sources" role="group" aria-label="Collection">
            {(['pons', 'plum'] as Source[]).map(value => (
              <button key={value} type="button" className="pad-source" aria-pressed={source === value} onClick={() => setSource(value)}>{value === 'pons' ? 'Pons coins' : 'Plum coins'}</button>
            ))}
          </div>
          <div className="pad-collection-tools">
            <div className="pad-filters" role="group" aria-label="Sort and filter coins">
              {(['newest', 'marketcap'] as Sort[]).map(value => (
                <button key={value} type="button" className="pad-chip" aria-pressed={sort === value} onClick={() => setSort(value)}>{value === 'newest' ? 'Newest' : 'Market cap'}</button>
              ))}
              {wallet.session && <button type="button" className="pad-chip" aria-pressed={onlyMine} onClick={() => setOnlyMine(value => !value)}>Made by you</button>}
            </div>
            <p className="pad-sample-note" role="status"><span className="pad-dot" /> {source === 'pons' ? (ponsStale ? staleNote : 'Migrated on Pons · Robinhood Chain') : (error && launches.length ? staleNote : 'Made through Plum · Robinhood Chain')}</p>
          </div>
          <p className="pad-sr-only" role="status">{notice}</p>
          {notice && <p className="pad-notice">{notice} <button type="button" onClick={() => setNotice('')}>Dismiss</button></p>}
          <TokenGrid coins={coins} source={source} sort={sort} mine={onlyMine} loading={loading} error={collectionError} search={search} viewer={wallet.session?.address ?? null} onReset={() => { setSearch(''); setOnlyMine(false) }} onRetry={() => { setLoading(true); void load() }} />
        </section>

      </main>
      <PaperFooter />
      {creating && <LaunchForm session={wallet.session} config={wallet.config} connecting={wallet.connecting} connected={Boolean(wallet.address)} onConnect={() => { reopenDesk.current = true; setCreating(false); void wallet.connect() }} onClose={() => setCreating(false)} onLaunched={intent => {
        setNotice(`${intent.tokenParams.name} launched. It appears under Plum coins once it leaves its curve; until then the desk's Blockscout link is the place to watch it.`)
        setSearch(''); setOnlyMine(false)
        void load()
      }} />}
    </div>
  )
}
