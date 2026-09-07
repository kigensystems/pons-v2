import { useEffect, useState } from 'react'
import LaunchForm, { type LaunchedToken } from './LaunchForm'
import TokenGrid, { type Filter } from './TokenGrid'
import './launch.css'

const SAMPLE_WALLET = '0x5AMP…1E01'

export default function LaunchPage() {
  const [wallet, setWallet] = useState<string | null>(null)
  const [launched, setLaunched] = useState<LaunchedToken[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    document.title = 'Pons companion — launchpad'
  }, [])

  return (
    <div className="pad">
      <header className="pad-bar">
        <a className="pad-brand" href="/launch"><span className="pad-stripes" aria-hidden="true" />Pons companion</a>
        <nav className="pad-nav" aria-label="Primary">
          <a href="/launch" aria-current="page">Explore</a>
          <a href="#ledger">Ledger</a>
          <a href="/">Opening</a>
        </nav>
        <button type="button" className="pad-btn" onClick={() => setCreating(true)}>+ Create</button>
        <button
          type="button"
          className="pad-btn pad-btn--dark"
          onClick={() => setWallet((value) => (value ? null : SAMPLE_WALLET))}
          title="Sample only. No wallet provider is wired yet."
        >
          {wallet ? wallet : 'Connect'}
        </button>
      </header>

      <section className="pad-hero" aria-labelledby="pad-hero-title">
        <div className="pad-hero-copy">
          <p className="pad-kicker">pons v2 · Robinhood Chain · sample build</p>
          <h1 id="pad-hero-title">Launch a coin.<br />See every fee <em>first.</em></h1>
          <p className="pad-hero-sub">The fee math, the gas, and the graduation line, shown before you sign. Read from the chain, not a spreadsheet.</p>
          <div className="pad-hero-actions">
            <button type="button" className="pad-btn pad-btn--dark" onClick={() => setCreating(true)}>Launch a coin →</button>
            <a className="pad-link" href="#ledger">How it works →</a>
          </div>
        </div>
        <img className="pad-hero-mac" src="/images/macintosh-render.png" alt="" width="1536" height="1024" />
        <dl className="pad-stats" aria-label="Sample statistics">
          <Stat label="Coins launched here" value={String(launched.length)} note="sample session" />
          <Stat label="Graduated" value="0" note="none yet" />
          <Stat label="Fees shown first" value="100%" note="every launch" />
          <Stat label="Gas quoted in" value="ETH" note="before you sign" />
        </dl>
      </section>

      <div className="pad-stripe-rule" aria-hidden="true" />

      <section className="pad-explore" aria-labelledby="pad-explore-title">
        <div className="pad-explore-head">
          <h2 id="pad-explore-title">Coins on Pons <span className="pad-count">placeholder rows · no market data</span></h2>
          <div className="pad-filters" role="group" aria-label="Filter">
            {(['all', 'graduated', 'curve', 'stocks'] as Filter[]).map((value) => (
              <button key={value} type="button" className="pad-chip" aria-pressed={filter === value} onClick={() => setFilter(value)}>
                {{ all: 'All', graduated: 'Graduated', curve: 'On the curve', stocks: 'Stocks' }[value]}
              </button>
            ))}
          </div>
        </div>
        <TokenGrid launched={launched} filter={filter} />
      </section>

      <section className="pad-ledger" id="ledger" aria-labelledby="pad-ledger-title">
        <h2 id="pad-ledger-title">How it works</h2>
        <ol>
          <li>Fill in the launch form. The quote shows launch fee, trade fee, creator tax, and graduation before you sign.</li>
          <li>Pons deploys the coin. Liquidity is locked. Trading starts on the curve.</li>
          <li>Creator fees appear here as claimable, pending, or claimed, with transaction links.</li>
        </ol>
        <p className="pad-fine">Sample copy. Steps two and three are not built.</p>
      </section>

      <footer className="pad-footer">
        <span><span className="pad-stripes" aria-hidden="true" />Pons companion · working title</span>
        <span>Copyright (c) 2026. Not affiliated with Pons or Robinhood.</span>
      </footer>

      {creating && (
        <LaunchForm
          wallet={wallet}
          onConnect={() => setWallet(SAMPLE_WALLET)}
          onClose={() => setCreating(false)}
          onLaunch={(token) => {
            setLaunched((list) => [token, ...list])
            setCreating(false)
          }}
        />
      )}
    </div>
  )
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="pad-stat">
      <dt>{label}</dt>
      <dd>{value}<small>{note}</small></dd>
    </div>
  )
}
