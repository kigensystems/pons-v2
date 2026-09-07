import { useEffect } from 'react'
import { PaperHeader, PaperFooter } from '../launch/PaperChrome'
import { AboutComputer, AboutGrain } from './AboutHeroSurface'
import '../launch/launch.css'
import './about.css'

export default function AboutPage() {
  useEffect(() => { document.title = 'About us — Plum' }, [])

  return <div className="pad about">
    <PaperHeader page="about" />
    <main id="paper-main">
      <section className="about-intro" aria-labelledby="about-title">
        <div className="about-tube">
          <div className="about-intro-copy"><p className="pad-kicker"><span className="pad-dot" /> About Plum</p>
            <h1 id="about-title">Pons is winning.<br /><em>The edges are sharp.</em></h1>
            <p className="about-intro-sub">Plum is a second window on Pons launches.<br />What you’ll pay. What you’ve earned. Who’s real.</p>
            <a href="#our-story" className="about-story-link">Why we made it <span aria-hidden="true">↓</span></a>
          </div>
          <figure className="about-computer"><AboutComputer src="/images/macintosh-render.png" alt="An ivory Macintosh with its keyboard and mouse in a softly lit green room" /><figcaption>A COMPANION / NOT A LAUNCHPAD</figcaption></figure>
          <div className="about-hero-foot"><span>002 — ABOUT PLUM</span><span>Reads the chain. Says it plainly.</span></div>
          <div className="about-atmosphere" aria-hidden="true" />
        </div>
        <AboutGrain />
      </section>

      <section id="our-story" className="about-editorial" aria-labelledby="about-story">
        <div className="about-section-label"><span className="pad-kicker">01 / Why Plum</span><span className="pad-kicker">On top of Pons. Not instead of it.</span></div>
        <div className="about-columns">
          <div><h2 id="about-story">Nobody asked for<br />another <em>launchpad.</em></h2><p className="about-lede">They asked for the one they already use to stop hiding things.</p></div>
          <div className="about-story-body"><p>Pons is the biggest pad on Robinhood chain, and people keep coming back to it. They also keep hitting the same walls. Gas that surprises you. Creator fees that read zero for a day. Coins that borrow a famous name and vanish.</p><p>Plum sits on top of all that. It doesn’t launch coins and it doesn’t hold your money. It reads the chain and tells you what it finds, in plain words, before you click.</p><p>Explore is the first piece: a place to browse what’s out there and try a demo coin.</p><a className="pad-link" href="/explore">Take a look around <span aria-hidden="true">↗</span></a></div>
        </div>
      </section>

      <div className="about-divider" aria-hidden="true"><span /><i /><span /></div>

      <section className="about-principles" aria-labelledby="about-principles-title">
        <div className="about-principles-heading"><p className="pad-kicker">02 / Three rules</p><h2 id="about-principles-title">Chain truth.<br /><em>Plain words.</em></h2><p>We don’t bend these.</p></div>
        <div className="about-principle-list">
          <article><span>01</span><div><h3>Show the chain, not the guess.</h3><p>If a number comes from an indexer that’s behind, we say so. Zero means zero, never “still loading”.</p></div></article>
          <article><span>02</span><div><h3>Say the cost before the click.</h3><p>Gas, platform fee, holder share. One line, in the asset you’re paying with, before you sign anything.</p></div></article>
          <article><span>03</span><div><h3>Unverified means unverified.</h3><p>A famous name on a coin proves nothing. Until an account proves it’s theirs, we say so where you can’t miss it.</p></div></article>
        </div>
      </section>

      <section className="about-desk" aria-labelledby="about-desk-title">
        <div className="about-section-label"><span className="pad-kicker">03 / On the desk</span><span className="pad-kicker">Nothing here is live yet.</span></div>
        <h2 id="about-desk-title">What we’re <em>building.</em></h2>
        <ul className="about-desk-list">
          <li><strong>Fee truth.</strong> Claimable, pending, claimed. With the transaction.</li>
          <li><strong>Gas before you sign.</strong> The real cost, shown in what you’re paying with.</li>
          <li><strong>Why a trade failed.</strong> The chain’s reason, not a spinner.</li>
          <li><strong>Who holds it.</strong> Top wallets and clusters, on every coin.</li>
        </ul>
      </section>

      <aside className="about-edition"><span className="pad-kicker">Early edition</span><p>The coins and figures on Explore are examples. There’s no live trading or wallet connection yet. Plum is independent and not affiliated with Pons or Robinhood.</p><span className="about-edition-number">No. 001</span></aside>
      <section className="about-signoff" aria-labelledby="about-signoff-title"><p className="pad-kicker">Look before you click.</p><h2 id="about-signoff-title">See it <em>clearly.</em></h2><a className="pad-btn pad-btn--dark" href="/explore">Open Explore <span aria-hidden="true">↗</span></a></section>
    </main>
    <PaperFooter />
  </div>
}
