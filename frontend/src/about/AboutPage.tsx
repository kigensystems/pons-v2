import { useEffect } from 'react'
import { PaperHeader, PaperFooter } from '../launch/PaperChrome'
import { AboutGrain } from './AboutGrain'
import '../launch/launch.css'
import './about.css'

// Bracketed lines are the founders' to fill.

export default function AboutPage() {
  useEffect(() => { document.title = 'About us — Plum' }, [])

  return <div className="pad about">
    <PaperHeader page="about" />
    <main id="paper-main">
      <figure className="about-photo">
        <img src="/images/about-banner.jpg" alt="Three people in suits behind two beige computers on a wooden desk; one screen shows the Plum mark, the other reads A familiar feeling" width="1800" height="600" />
        <img className="about-photo-bloom" src="/images/about-banner.jpg" alt="" aria-hidden="true" width="1800" height="600" />
        <AboutGrain />
      </figure>

      <section className="about-intro" aria-labelledby="about-title">
        <h1 id="about-title">Pons is winning.<br />The edges are sharp.</h1>
        <p className="about-sub">Plum is a second window on Pons launches.<br />What you’ll pay. What you’ve earned. Who’s real.</p>
      </section>

      <div className="pad-stripe-rule" aria-hidden="true" />

      <section id="numbers" className="about-section" aria-labelledby="about-numbers-title">
        <h2 id="about-numbers-title">Fees cut vs Pons v2.</h2>
        <p className="about-lede">A Pons coin today can cost 0.5% to the bot, 1% to Pons and 2% to the creator, each way. About 7% on a round trip, and nobody shows it stacked. Through Plum:</p>
        <ul className="about-figures">
          <li><h3>Creator tax cap</h3><strong><s><span className="pad-sr-only">Pons v2 </span>10%</s> 3%</strong><span>The rate sits on the coin where you can read it.</span></li>
          <li><h3>Transfer tax</h3><strong>−50%</strong><span>Half what the same launch pays on Pons.</span></li>
          <li><h3>Protocol fee</h3><strong>−35%</strong><span>Less taken on every trade.</span></li>
        </ul>
      </section>

      <section className="about-section" aria-labelledby="about-why-title">
        <h2 id="about-why-title">Nobody asked for another launchpad.</h2>
        <div className="about-columns">
          <p>They asked for the one they already use to stop hiding things. Fee math nobody shows stacked. Rewards that say there’s nothing to claim. A site too slow to check mid-trade. Launches you can’t trade in the same breath.</p>
          <p>Every launch through Plum is a Pons v2 launch on Robinhood Chain, routed through us, with lower fees and the numbers in the open. No token of our own, nothing to sell you. Stock pairs if you want them; they aren’t the point.</p>
        </div>
      </section>

      <section className="about-section" aria-labelledby="about-rules-title">
        <h2 id="about-rules-title">Three rules.</h2>
        <ul className="about-list about-list--3">
          <li><strong>Show the chain, not the guess.</strong> If an indexer is behind, we say so. Zero means zero, never “still loading”.</li>
          <li><strong>Say the cost before the click.</strong> Gas, platform fee, holder share. One line, in the asset you’re paying with.</li>
          <li><strong>Unverified means unverified.</strong> A famous name proves nothing until the account proves it’s theirs.</li>
        </ul>
      </section>

      <section className="about-section" aria-labelledby="about-desk-title">
        <h2 id="about-desk-title">On the desk.</h2>
        <ul className="about-list about-list--4 about-desk">
          <li><strong>Now</strong><span>Explore.</span><span>Launch through Plum, with the fees above.</span></li>
          <li><strong>Next</strong><span>Fee truth: claimable, pending, claimed.</span><span>Gas before you sign.</span><span>Why a trade failed, in the chain’s words.</span></li>
          <li><strong>Then</strong><span>Who holds it: top wallets and clusters.</span><span>Launch and buy in one breath.</span><span>A truth chip for terminals.</span></li>
          <li><strong>Later</strong><span>Float squeeze radar for stock pairs.</span><span>Dividend mode terminals can read.</span><span>A fair lane, if you want one.</span></li>
        </ul>
      </section>

      <section className="about-signoff" aria-labelledby="about-signoff-title">
        <h2 id="about-signoff-title">See it <em>clearly</em>.</h2>
        <a className="pad-btn pad-btn--dark" href="/explore">Open Explore</a>
        <p className="about-signature">[Name] and [Name] · Plum, [City] · September 2026</p>
      </section>

      <p className="about-fine">Launches through Plum are real and on Robinhood Chain. Market figures come from an indexer and may lag; we say so when they do. Plum is independent and not affiliated with Pons or Robinhood.</p>
    </main>
    <PaperFooter />
  </div>
}
