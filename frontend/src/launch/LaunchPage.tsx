import { useEffect } from 'react'
import LaunchForm from './LaunchForm'
import './launch.css'

export default function LaunchPage() {
  useEffect(() => {
    document.title = 'Pons companion — launch desk'
  }, [])

  return (
    <div className="launch">
      <header className="launch-masthead">
        <a className="launch-brand" href="/">
          <span className="launch-brand-stripes" aria-hidden="true" />
          Pons companion
        </a>
        <nav className="launch-nav" aria-label="Primary">
          <a href="/">Opening</a>
          <a href="/launch" aria-current="page">Launch desk</a>
          <a href="#ledger">Ledger</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className="launch-nav-cta" href="#deploy">☎ Deploy a token</a>
      </header>

      <section className="launch-hero" aria-labelledby="launch-hero-title">
        <div className="launch-hero-copy">
          <p className="launch-eyebrow">A companion to Pons · Robinhood Chain</p>
          <h1 id="launch-hero-title">Infrastructure for the people who actually launch on Pons.</h1>
          <p className="launch-hero-lede">
            Every fee shown before you click. Every number read from the chain. No spreadsheet, no guesswork, no DM to support.
          </p>
        </div>
        <figure className="launch-hero-figure">
          <img src="/images/macintosh-render.png" alt="Classic Macintosh with keyboard and mouse" width="1536" height="1024" />
          <figcaption>Pons companion, Launch Desk. Version 0.1. Sample build.</figcaption>
        </figure>
      </section>

      <div className="launch-stripes" aria-hidden="true" />

      <section className="launch-about" aria-labelledby="launch-about-title">
        <h2 id="launch-about-title">Serious about launching. Not another bonding curve.</h2>
        <div className="launch-columns">
          <div>
            <p>
              Pons is the busiest launchpad on Robinhood Chain, and the people who use it most have the same three complaints: gas
              sticker shock, creator fees that vanish into an indexer, and fee math nobody can explain before they press launch.
            </p>
            <p>
              Pons companion sits beside Pons, not against it. It reads the same contracts and shows you the truth on chain:
              what you will pay, what holders will receive, what the protocol keeps, and when your fees are actually claimable.
            </p>
          </div>
          <div>
            <p>
              The launch desk below is the first piece. Fill it in like a form from 1984, and the receipt on the right updates
              as you type. Nothing is sent anywhere until you connect a wallet, and the wallet step is not wired yet.
            </p>
            <p>
              Coming after this: a fee truth panel for live tokens, a holder concentration strip on every token page, and a
              gas quote in the asset you are paying with. Controls and clarity on top of Pons, not a rival pad.
            </p>
          </div>
        </div>
      </section>

      <LaunchForm />

      <section className="launch-ledger" id="ledger" aria-labelledby="launch-ledger-title">
        <div className="launch-stripes" aria-hidden="true" />
        <h2 id="launch-ledger-title">What the ledger will show</h2>
        <ul className="launch-ledger-list">
          <li><strong>Claimable, pending, claimed.</strong> Three numbers with transaction links, never a bare zero.</li>
          <li><strong>Effective tax.</strong> One figure that includes the platform share and any holder split.</li>
          <li><strong>Trade failures with a reason.</strong> No liquidity, wrong pool, paused, wrong quote. Chain says, not UI says.</li>
          <li><strong>Holder risk.</strong> Top holders, clustered wallets, time to first sell.</li>
        </ul>
        <p className="launch-fineprint">Sample roadmap. No metric above is measured yet.</p>
      </section>

      <footer className="launch-footer" id="contact">
        <div className="launch-footer-brand">
          <span className="launch-brand-stripes" aria-hidden="true" />
          <strong>Pons companion</strong>
          <span>An independent companion to the Pons launchpad. Working title.</span>
        </div>
        <div className="launch-footer-meta">
          <span>Copyright (c) Pons companion, 2026.</span>
          <span>Not affiliated with Pons or Robinhood.</span>
        </div>
      </footer>
    </div>
  )
}
