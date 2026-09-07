import { useEffect, useState } from 'react'

function App() {
  const [paused, setPaused] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [hidden, setHidden] = useState(() => document.hidden)
  const [imageFailed, setImageFailed] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

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

      <div className="scene-object" data-loaded={imageLoaded}>
        <img
          className="macintosh"
          src="/images/macintosh-render.png"
          alt="A classic beige Macintosh, with its original-style keyboard and mouse, in warm evening light."
          width="1536"
          height="1024"
          fetchPriority="high"
          draggable="false"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageFailed(true)}
          hidden={imageFailed}
        />
        {imageLoaded && !imageFailed && (
          <div className="crt" aria-hidden="true">
            <div className="crt-glow" />
            <div className="crt-content">
              <svg className="happy-mac" viewBox="0 0 32 40" fill="none">
                <path d="M4 2h24v34H4z M7 5h18v21H7z M7 31h3 M19 31h6 M10 36v3h12v-3" />
                <path d="M12 12v3 M20 12v3 M12 19h2v2h4v-2h2" />
              </svg>
              <span className="crt-greeting">hello.</span>
              <span className="crt-caption">a new beginning<span className="cursor">_</span></span>
            </div>
            <div className="crt-scanlines" />
          </div>
        )}
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
        <div className="scene-controls">
          {imageFailed && <span className="asset-error" role="status">Macintosh artwork could not load. Refresh to retry.</span>}
          <button
            className="motion-button"
            type="button"
            onClick={() => setPaused(!paused)}
            aria-label={paused ? 'Resume atmosphere' : 'Pause atmosphere'}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              {paused ? <path d="m3 1 7 5-7 5Z" fill="currentColor" /> : <path d="M3 1v10M9 1v10" stroke="currentColor" strokeWidth="2" />}
            </svg>
            <span>{paused ? 'Resume atmosphere' : 'Pause atmosphere'}</span>
          </button>
        </div>
      </footer>
    </main>
  )
}

export default App
