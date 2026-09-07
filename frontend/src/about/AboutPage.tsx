import { useEffect } from 'react'
import { PaperHeader, PaperFooter } from '../launch/PaperChrome'
import '../launch/launch.css'
import './about.css'

export default function AboutPage() {
  useEffect(() => { document.title = 'About us — Plum' }, [])

  return <div className="pad about">
    <PaperHeader page="about" />
    <main id="paper-main">
      <section className="about-intro" aria-labelledby="about-title">
        <div className="about-intro-copy"><p className="pad-kicker"><span className="pad-dot" /> A little about Plum</p>
          <h1 id="about-title">A familiar feeling.<br /><em>A new possibility.</em></h1>
          <p className="about-intro-sub">For the curious.<br />For the ones just getting started.<br />For the simple joy of finding something new.</p>
          <a href="#our-story" className="about-story-link">A note from the desk <span aria-hidden="true">↓</span></a>
        </div>
        <figure className="about-computer"><img src="/images/macintosh-render.png" alt="An ivory Macintosh with its keyboard and mouse in a softly lit green room" width="1536" height="1024" /><figcaption>PERSONAL COMPUTING / NEW POSSIBILITIES</figcaption></figure>
        <div className="about-hero-foot"><span>002 — ABOUT PLUM</span><span>Somewhere between then and what’s next.</span></div>
        <div className="about-atmosphere" aria-hidden="true" />
      </section>

      <section id="our-story" className="about-editorial" aria-labelledby="about-story">
        <div className="about-section-label"><span className="pad-kicker">01 / A note from the desk</span><span className="pad-kicker">Human curiosity. Personal computing.</span></div>
        <div className="about-columns">
          <div><h2 id="about-story">The internet should<br />still feel like <em>possibility.</em></h2><p className="about-lede">Remember when a computer felt like a doorway, and opening a new window meant finding a whole new world?</p></div>
          <div className="about-story-body"><p>That feeling is where we begin. Plum is an independent companion to the world of Pons: a place to discover coins, try an idea, and take a closer look.</p><p>We like things with a little character. Warm paper. A well-worn keyboard. Clear words and room to think. Familiar details that make somewhere new feel a little more like your own.</p><p>Explore is our first sketch of that place. A collection to browse, a creation desk to experiment with, and the beginnings of something we can shape with care.</p><a className="pad-link" href="/explore">Take a look around <span aria-hidden="true">↗</span></a></div>
        </div>
      </section>

      <div className="about-divider" aria-hidden="true"><span /><i /><span /></div>

      <section className="about-principles" aria-labelledby="about-principles-title">
        <div className="about-principles-heading"><p className="pad-kicker">02 / A few things we believe</p><h2 id="about-principles-title">A little character.<br /><em>A lot of intention.</em></h2><p>Some things are worth taking our time over.</p></div>
        <div className="about-principle-list">
          <article><span>01</span><div><h3>Curiosity comes first.</h3><p>A good place to explore leaves room for an unexpected discovery. Follow a thread, look closer, and make up your own mind.</p></div></article>
          <article><span>02</span><div><h3>Clarity is part of the craft.</h3><p>The small print deserves as much care as the headline. Examples should look like examples, and unknowns should stay visible.</p></div></article>
          <article><span>03</span><div><h3>The details make it personal.</h3><p>A tactile surface. A thoughtful interaction. A familiar typeface. Small things that add up to a place worth spending time in.</p></div></article>
        </div>
      </section>

      <aside className="about-edition"><span className="pad-kicker">A work in progress</span><p>You’re looking at an early edition of Plum. The coins and figures are examples. Try the creation desk, make a demo coin, and look around. There is no live trading or wallet connection yet.</p><span className="about-edition-number">No. 001</span></aside>
      <section className="about-signoff" aria-labelledby="about-signoff-title"><p className="pad-kicker">The next window is yours.</p><h2 id="about-signoff-title">Stay a little <em>curious.</em></h2><a className="pad-btn pad-btn--dark" href="/explore">Open Explore <span aria-hidden="true">↗</span></a></section>
    </main>
    <PaperFooter />
  </div>
}
