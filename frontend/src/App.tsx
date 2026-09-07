import { lazy, Suspense, useEffect, useState } from 'react'
import SceneErrorBoundary from './SceneErrorBoundary'

const MacintoshScene = lazy(() => import('./MacintoshScene'))

function App() {
  const [paused, setPaused] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [hidden, setHidden] = useState(() => document.hidden)

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotion = () => setPaused(preference.matches)
    const updateVisibility = () => setHidden(document.hidden)
    preference.addEventListener('change', updateMotion)
    document.addEventListener('visibilitychange', updateVisibility)
    return () => {
      preference.removeEventListener('change', updateMotion)
      document.removeEventListener('visibilitychange', updateVisibility)
    }
  }, [])

  return (
    <main className="opening" data-motion={paused || hidden ? 'paused' : 'playing'}>
      <div className="room" aria-hidden="true">
        <div className="window-light" />
        <div className="window-frame" />
        <div className="desk" />
        <div className="room-haze room-haze--back" />
        <div className="mist mist--back" />
      </div>

      <header className="masthead">
        <span className="working-name">Pons companion<span className="name-note">Working title</span></span>
        <span className="edition">Opening study <span className="edition-number">01</span></span>
      </header>

      <div className="scene-object">
        <SceneErrorBoundary>
          <Suspense fallback={<img className="macintosh" src="/images/macintosh-render.png" alt="Classic Macintosh with keyboard and mouse" width="1536" height="1024" />}>
            <MacintoshScene active={!paused && !hidden} onToggleAtmosphere={() => setPaused((value) => !value)} />
          </Suspense>
        </SceneErrorBoundary>
      </div>

      <div className="foreground-haze" aria-hidden="true" />
      <div className="mist mist--front" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />

      <section className="intro" aria-labelledby="scene-title">
        <p className="eyebrow"><span className="signal" /> A companion to Pons</p>
        <h1 id="scene-title">A familiar feeling.<br /><em>A new window.</em></h1>
        <p className="intro-description">An independent companion to the Pons launchpad.<br className="desktop-break" /> A world of its own, beginning here.</p>
      </section>

      <footer className="scene-footer">
        <div className="scene-note">
          <span className="scene-index">001 — THE OPENING</span>
          <span className="scene-caption">Somewhere between then and what’s next.</span>
        </div>
      </footer>
    </main>
  )
}

export default App
