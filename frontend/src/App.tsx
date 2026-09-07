import { useCallback, useState } from 'react'
import LoadingScreen from './LoadingScreen'

function App() {
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const dismissLoading = useCallback(() => setLoading(false), [])

  return (
    <>
    {loading && <LoadingScreen progress={progress} complete={progress === 100} onExited={dismissLoading} />}
    <main className="opening" inert={loading} aria-busy={loading} data-motion="paused">
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

      <div className="scene-object scene-object--still">
        <img
          className="macintosh macintosh--still"
          src="/images/macintosh-render.png"
          alt="Warm ivory Macintosh with a dark curved screen, keyboard, and mouse"
          width="1536"
          height="1024"
          fetchPriority="high"
          hidden={imageError}
          onLoad={() => setProgress(100)}
          onError={() => { setImageError(true); dismissLoading() }}
        />
        {imageError && <div className="model-status">
          <p role="status">The Macintosh image could not load.</p>
          <button className="motion-button" type="button" onClick={() => window.location.reload()}>Reload image</button>
        </div>}
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
    </>
  )
}

export default App
