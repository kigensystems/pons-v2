import { useEffect, useState } from 'react'
import LaunchForm, { type LaunchedToken } from './LaunchForm'
import TokenGrid, { type Filter } from './TokenGrid'
import { PaperHeader, PaperFooter } from './PaperChrome'
import './launch.css'

export default function ExplorePage({ active = true }: { active?: boolean }) {
  const [wallet, setWallet] = useState(false)
  const [launched, setLaunched] = useState<LaunchedToken[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => { if (active) document.title = 'Explore — Plum' }, [active])

  return (
    <div className="pad">
      <PaperHeader page="explore" wallet={wallet} onConnect={() => setWallet(value => !value)} onCreate={() => setCreating(true)} />
      <main id="paper-main">
        <section className="pad-hero" aria-labelledby="pad-hero-title">
          <div className="pad-hero-copy">
            <p className="pad-kicker"><span className="pad-dot" /> The discovery desk <span className="pad-issue">No. 001</span></p>
            <h1 id="pad-hero-title">A new window<br /><em>on what’s next.</em></h1>
            <p className="pad-hero-sub">A place for curious people and early ideas.<br />Explore the collection, or try a launch of your own.</p>
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
          <dl className="pad-stats" aria-label="Demo collection statistics">
            <Stat number="01" label="In the collection" value={String(10 + launched.length).padStart(2, '0')} note="sample coins" />
            <Stat number="02" label="Graduated" value="05" note="sample coins" />
            <Stat number="03" label="On the curve" value="05" note="sample coins" />
            <Stat number="04" label="Made by you" value={String(launched.length).padStart(2, '0')} note="this visit" />
          </dl>
        </section>

        <div className="pad-stripe-rule" aria-hidden="true" />

        <section className="pad-explore" aria-labelledby="pad-explore-title">
          <div className="pad-explore-head">
            <div><p className="pad-kicker">The collection</p><h2 id="pad-explore-title">Explore the possibilities<span className="pad-period">.</span></h2></div>
            <label className="pad-search"><span className="pad-sr-only">Search coins by name, ticker or address</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.5" /><path d="m16 16 5 5" stroke="currentColor" strokeWidth="1.5" /></svg><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Find something interesting" /></label>
          </div>
          <div className="pad-collection-tools">
            <div className="pad-filters" role="group" aria-label="Filter coins">
              {(['all', 'graduated', 'curve', 'stocks'] as Filter[]).map(value => (
                <button key={value} type="button" className="pad-chip" aria-pressed={filter === value} onClick={() => setFilter(value)}>
                  {{ all: 'All coins', graduated: 'Graduated', curve: 'On the curve', stocks: 'Stocks' }[value]}
                </button>
              ))}
            </div>
            <p className="pad-sample-note"><span className="pad-dot" /> Demo collection · No live market data</p>
          </div>
          <p className="pad-sr-only" role="status">{notice}</p>
          <TokenGrid launched={launched} filter={filter} search={search} onReset={() => { setSearch(''); setFilter('all') }} />
          <div className="pad-collection-end"><span>End of this edition</span><span>More possibilities ahead.</span></div>
        </section>

        <aside className="pad-invitation">
          <div><p className="pad-kicker">Something on your mind?</p><h2>Every idea starts <em>somewhere.</em></h2></div>
          <button type="button" className="pad-btn" onClick={() => setCreating(true)}>Try the creation desk <span aria-hidden="true">↗</span></button>
        </aside>
      </main>
      <PaperFooter />
      {creating && <LaunchForm wallet={wallet} onConnect={() => setWallet(true)} onClose={() => setCreating(false)} onLaunch={token => {
        setLaunched(list => [token, ...list]); setFilter('all'); setSearch(''); setCreating(false)
        setNotice(`${token.name} added to your demo collection. It will clear when you reload.`)
      }} />}
    </div>
  )
}

function Stat({ number, label, value, note }: { number: string; label: string; value: string; note: string }) {
  return <div className="pad-stat"><dt><span>{number}</span>{label}</dt><dd>{value}<small>{note}</small></dd></div>
}
