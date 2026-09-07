import { useCallback, useEffect, useState } from 'react'
import LoadingScreen from './LoadingScreen'
import ImageTelevision from './ImageTelevision'
import ImageGrounding from './ImageGrounding'

function App() {
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [paused, setPaused] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [hidden, setHidden] = useState(() => document.hidden)
  const [sound, setSound] = useState(false)
  const handleSoundBlocked = useCallback(() => setSound(false), [])
  const dismissLoading = useCallback(() => setLoading(false), [])

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
        {!imageError && <ImageGrounding />}
        <img
          className="macintosh macintosh--still"
          src="/images/macintosh-render.png"
          alt="Warm ivory Macintosh with keyboard and mouse"
          width="1536"
          height="1024"
          fetchPriority="high"
          hidden={imageError}
          onLoad={() => setProgress(100)}
          onError={() => { setImageError(true); dismissLoading() }}
        />
        {!imageError && <>
          <ImageTelevision active={!paused && !hidden && !loading} sound={sound} onSoundBlocked={handleSoundBlocked} />
        </>}
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
        <div className="tv-controls">
          <button className="tv-sound" type="button" disabled={imageError} aria-pressed={!paused} onClick={() => setPaused((value) => !value)}>
            {paused ? 'Play TV' : 'Pause TV'}
          </button>
          <button className="tv-sound" type="button" disabled={imageError} aria-pressed={sound} onClick={() => setSound((value) => !value)}>
            TV sound {sound ? 'on' : 'off'}
          </button>
        </div>
      </footer>
    </main>
    </>
  )
}

export default App
