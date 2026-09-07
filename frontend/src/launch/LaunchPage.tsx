import { useCallback, useEffect, useState } from 'react'
import { api, type Launch } from './api'
import LaunchForm from './LaunchForm'
import TokenGrid, { type Filter } from './TokenGrid'
import { PaperHeader, PaperFooter } from './PaperChrome'
import { useSession } from './useSession'
import './launch.css'

const REFRESH_MS = 30_000

export default function ExplorePage() {
  const wallet = useSession()
  const [launches, setLaunches] = useState<Launch[]>([])
  const [stats, setStats] = useState({ total: 0, confirmed: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => { document.title = 'Explore — Plum' }, [])

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
      <PaperHeader page="explore" wallet={{ address: wallet.session?.address ?? null, connecting: wallet.connecting, available: wallet.walletAvailable, onConnect: () => void wallet.connect(), onDisconnect: () => void wallet.disconnect() }} onCreate={() => setCreating(true)} />
      <main id="paper-main">
        <section className="pad-hero" aria-labelledby="pad-hero-title">
          <div className="pad-hero-copy">
            <p className="pad-kicker"><span className="pad-dot" /> The discovery desk <span className="pad-issue">No. 001</span></p>
            <h1 id="pad-hero-title">A new window<br /><em>on what’s next.</em></h1>
            <p className="pad-hero-sub">A place for curious people and early ideas.<br />Explore the coins launched through Plum, or start one of your own.</p>
            <div className="pad-hero-actions">
              <button type="button" className="pad-btn pad-btn--dark" onClick={() => setCreating(true)}>Create a coin <span aria-hidden="true">↗</span></button>
              <a className="pad-link" href="/about">A little about us <span aria-hidden="true">↗</span></a>
            </div>
          </div>
          <figure className="pad-hero-figure">
            <span className="pad-plate-label">PERSONAL COMPUTING / NEW POSSIBILITIES</span>
            <img className="pad-hero-mac" src="/images/macintosh-render.png" alt="An ivory Macintosh, keyboard and mouse" width="1536" height="1024" />
            <figcaption><span>A familiar feeling.</span><span>From the Plum desktop ↗</span></figcaption>
          </figure>
          <dl className="pad-stats" aria-label="Collection statistics">
            <Stat number="01" label="In the collection" value={String(stats.total).padStart(2, '0')} note={stats.confirmed === stats.total ? 'confirmed' : `${stats.confirmed} confirmed`} />
            <Stat number="02" label="Graduated" value={String(graduated).padStart(2, '0')} note="from protocol state" />
            <Stat number="03" label="On the curve" value={String(onCurve).padStart(2, '0')} note="from protocol state" />
            <Stat number="04" label="Made by you" value={String(mine).padStart(2, '0')} note={wallet.session ? 'this wallet' : 'connect to see'} />
          </dl>
        </section>

        <div className="pad-stripe-rule" aria-hidden="true" />

        <section className="pad-explore" aria-labelledby="pad-explore-title">
          <div className="pad-explore-head">
            <div><p className="pad-kicker">The collection</p><h2 id="pad-explore-title">Explore the possibilities<span className="pad-period">.</span></h2></div>
            <label className="pad-search"><span className="pad-sr-only">Search coins by name, ticker or address</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.5" /><path d="m16 16 5 5" stroke="currentColor" strokeWidth="1.5" /></svg><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Find something interesting" /></label>
          </div>
          {wallet.error && <p className="pad-notice" data-tone="bad" role="alert">{wallet.error} <button type="button" onClick={() => void wallet.connect()}>Connect</button></p>}
          {wallet.configError && !wallet.config && <p className="pad-notice" data-tone="bad" role="alert">Launch settings are unavailable: {wallet.configError}</p>}
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
          <div className="pad-collection-end"><span>End of this edition</span><span>More possibilities ahead.</span></div>
        </section>

        <aside className="pad-invitation">
          <div><p className="pad-kicker">Something on your mind?</p><h2>Every idea starts <em>somewhere.</em></h2></div>
          <button type="button" className="pad-btn" onClick={() => setCreating(true)}>Try the creation desk <span aria-hidden="true">↗</span></button>
        </aside>
      </main>
      <PaperFooter />
      {creating && <LaunchForm session={wallet.session} config={wallet.config} connecting={wallet.connecting} walletAvailable={wallet.walletAvailable} onConnect={() => void wallet.connect()} onClose={() => setCreating(false)} onLaunched={intent => {
        setNotice(`${intent.tokenParams.name} launched. It is now in the collection.`)
        setSearch(''); setFilter('all')
        void load()
      }} />}
    </div>
  )
}

function Stat({ number, label, value, note }: { number: string; label: string; value: string; note: string }) {
  return <div className="pad-stat"><dt><span>{number}</span>{label}</dt><dd>{value}<small>{note}</small></dd></div>
}
