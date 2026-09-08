import { useCallback, useEffect, useRef, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { api, type PonsCoins } from './api'
import { wagmiConfig } from './appkit'
import ExploreMonitor from './ExploreMonitor'
import LaunchForm from './LaunchForm'
import TokenGrid from './TokenGrid'
import { PaperFooter } from './PaperChrome'
import { useSession } from './useSession'
import { coinFromPons, shortAddress, type Sort } from './launchModel'
import './launch.css'

const REFRESH_MS = 15_000
const clockTime = (stamp: number) => new Date(stamp < 1e12 ? stamp * 1000 : stamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
const queryClient = new QueryClient()

export default function ExplorePage() {
  return <WagmiProvider config={wagmiConfig}><QueryClientProvider client={queryClient}><ExploreDesk /></QueryClientProvider></WagmiProvider>
}

function ExploreDesk() {
  const wallet = useSession()
  const [pons, setPons] = useState<PonsCoins | null>(null)
  const [ponsError, setPonsError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<Sort>('newest')
  const [onlyMine, setOnlyMine] = useState(false)
  const [creating, setCreating] = useState(false)
  const [notice, setNotice] = useState('')
  // When the last successful read landed in this browser; a failed refresh keeps the cards and says so.
  const [lastGood, setLastGood] = useState<number | null>(null)
  // The creation desk is a top-layer dialog, so it closes while the wallet picker is open and
  // reopens once the sign-in it asked for lands.
  const reopenDesk = useRef(false)

  useEffect(() => { document.title = 'Explore — Plum' }, [])
  // Arriving at /explore#paper-main (About's Explore Collection) lands on the collection; the target renders after load.
  useEffect(() => { if (window.location.hash === '#paper-main') document.getElementById('paper-main')?.scrollIntoView() }, [])
  useEffect(() => { if (wallet.session && reopenDesk.current) { reopenDesk.current = false; setCreating(true) } }, [wallet.session])

  // The collection is the Pons feed: every coin that has left its curve, Plum's own among them.
  const load = useCallback(async () => {
    try {
      const feed = await api.ponsCoins()
      setPons(feed); setPonsError(feed.status === 'error' || feed.status === 'unavailable' ? feed.error : null)
      if (feed.status === 'ok') setLastGood(Date.now())
    } catch (failure) { setPonsError(failure instanceof Error ? failure.message : 'The Pons feed is unavailable.') }
    setLoading(false)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => { if (!document.hidden) void load() }, REFRESH_MS)
    void (async () => { await load() })()
    return () => clearInterval(timer)
  }, [load])

  const coins = (pons?.items ?? []).map(coinFromPons)
  // Old cards stay on a failed refresh, labelled with when they were last read: the server's read for a stale feed, this browser's for a lost request.
  const ponsStale = Boolean(pons?.items.length) && (pons!.status !== 'ok' || Boolean(ponsError))
  const staleSince = ponsError && lastGood ? lastGood : pons?.retrievedAt ?? null

  return (
    <div className="pad pad--window">
      <a className="pad-skip" href="#paper-main">Skip to content</a>
      {/* The room after Enter: the opening's own dark room, the Macintosh, and its glass tuned to the fees channel. */}
      <section className="pad-window" aria-labelledby="pad-hero-title">
        <div className="room" aria-hidden="true">
          <div className="window-light" />
          <div className="window-frame" />
          <div className="desk" />
          <div className="room-haze room-haze--back" />
          <div className="mist mist--back" />
        </div>
        <header className="masthead">
          <a className="working-name" href="/" aria-label="Plum — opening"><img className="plum-mark" src="/images/plum-mark.png" alt="" width="256" height="256" decoding="async" />Plum</a>
          <a className="pad-window-about" href="/about">About us</a>
          {/* The wallet, always visible: who is connected, whether Plum holds a session for them, and the way out. */}
          <div className="pad-window-wallet">
            {wallet.session
              ? <>
                <span className="pad-window-wallet-address" title={wallet.session.address}>{shortAddress(wallet.session.address)}</span>
                <button type="button" className="pad-window-link" onClick={() => void wallet.disconnect()}>Sign out</button>
              </>
              : <>
                {wallet.address && <span className="pad-window-wallet-address" title={wallet.address}>{shortAddress(wallet.address)}</span>}
                {wallet.address && <button type="button" className="pad-window-link" onClick={() => void wallet.disconnect()} disabled={wallet.connecting}>Disconnect</button>}
                <button type="button" className="pad-window-link" onClick={() => void wallet.connect()} disabled={wallet.connecting} aria-busy={wallet.connecting}>{wallet.connecting ? 'Check your wallet…' : wallet.address ? 'Sign in' : 'Connect wallet'}</button>
              </>}
          </div>
        </header>
        <div className="pad-window-clip">
          <div className="pad-window-scene">
            <div className="pad-window-bloom" aria-hidden="true" />
            <img className="pad-window-mac" src="/images/macintosh-render.png" alt="Warm ivory Macintosh with keyboard and mouse" width="1536" height="1024" fetchPriority="high" decoding="async" />
            <ExploreMonitor config={wallet.config} error={wallet.configError} />
          </div>
        </div>
        <div className="foreground-haze" aria-hidden="true" />
        <div className="mist mist--front" aria-hidden="true" />
        <div className="grain" aria-hidden="true" />
        <div className="vignette" aria-hidden="true" />
        <div className="pad-window-copy">
          <h1 id="pad-hero-title">A second window<br />on Pons.</h1>
          <p className="pad-window-sub">Infrastructure built on Pons v2. Deeper liquidity for better fills, creator rewards capped, protocol fees cut hard. Same Pons. Better terms.</p>
          <button type="button" className="pad-keycap" onClick={() => setCreating(true)}>Create a coin</button>
        </div>
        {/* The one way down: an arrow at the foot of the window, pointing at the collection. */}
        <a className="pad-window-scroll" href="#paper-main" aria-label="Down to the collection">↓</a>
      </section>
      <main id="paper-main">
        <div className="pad-stripe-rule" aria-hidden="true" />

        <section className="pad-explore" aria-labelledby="pad-explore-title">
          <h2 id="pad-explore-title">The collection<span className="pad-period">.</span></h2>
          {wallet.error && <p className="pad-notice" data-tone="bad" role="alert">{wallet.error} <button type="button" onClick={() => void wallet.connect()}>Connect</button></p>}
          {wallet.configError && !wallet.config && <p className="pad-notice" data-tone="bad" role="alert">Launch settings are unavailable: {wallet.configError}</p>}
          <div className="pad-filters" role="group" aria-label="Sort and filter coins">
            {(['newest', 'marketcap'] as Sort[]).map(value => (
              <button key={value} type="button" className="pad-chip" aria-pressed={sort === value} onClick={() => setSort(value)}>{value === 'newest' ? 'Newest' : 'Market cap'}</button>
            ))}
            {wallet.session && <button type="button" className="pad-chip" aria-pressed={onlyMine} onClick={() => setOnlyMine(value => !value)}>Made by you</button>}
          </div>
          {ponsStale && <p className="pad-notice" role="status">Showing the last good read{staleSince ? ` from ${clockTime(staleSince)}` : ''}.</p>}
          <p className="pad-sr-only" role="status">{notice}</p>
          {notice && <p className="pad-notice">{notice} <button type="button" onClick={() => setNotice('')}>Dismiss</button></p>}
          <TokenGrid coins={coins} sort={sort} mine={onlyMine} loading={loading} error={ponsError} viewer={wallet.session?.address ?? null} onReset={() => setOnlyMine(false)} onRetry={() => { setLoading(true); void load() }} />
        </section>

      </main>
      <PaperFooter />
      {creating && <LaunchForm session={wallet.session} config={wallet.config} connecting={wallet.connecting} connected={Boolean(wallet.address)} onConnect={() => { reopenDesk.current = true; setCreating(false); void wallet.connect() }} onSwitch={() => { setCreating(false); void wallet.disconnect() }} onClose={() => setCreating(false)} onLaunched={intent => {
        setNotice(`${intent.tokenParams.name} launched. It appears in the collection once it leaves its curve; until then the desk's Blockscout link is the place to watch it.`)
        setOnlyMine(false)
        void load()
      }} />}
    </div>
  )
}
