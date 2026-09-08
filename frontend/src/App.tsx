import { useCallback, useEffect, useState } from 'react'
import LoadingScreen from './LoadingScreen'
import ImageTelevision from './ImageTelevision'
import ImageGrounding from './ImageGrounding'
import './openingNavigation.css'

function App() {
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(true)
  // The boot screen stays up for at least this long on the first visit of a session, so the lockup
  // reads as an opening rather than a flash. Reduced motion and later visits skip the hold.
  const [held, setHeld] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches || sessionStorage.getItem('plum-booted') === '1')
  const [imageError, setImageError] = useState(false)
  const [paused, setPaused] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [hidden, setHidden] = useState(() => document.hidden)
  const [sound, setSound] = useState(false)
  const handleSoundBlocked = useCallback(() => setSound(false), [])
  // The screen is the only control. Paused (reduced motion), a click plays with sound; playing, it toggles the sound.
  const switchTv = useCallback(() => {
    if (paused) { setPaused(false); setSound(true) } else setSound((value) => !value)
  }, [paused])
  const switchLabel = paused ? 'Play the TV with sound' : sound ? 'Mute the TV' : 'Unmute the TV'
  const dismissLoading = useCallback(() => { setLoading(false); sessionStorage.setItem('plum-booted', '1') }, [])

  useEffect(() => {
    if (held) return
    const timeout = window.setTimeout(() => setHeld(true), 1800)
    return () => window.clearTimeout(timeout)
  }, [held])

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
    {loading && <LoadingScreen progress={progress} complete={progress === 100 && held} onExited={dismissLoading} />}
    <main className="opening" inert={loading} aria-busy={loading} data-motion="paused">
      <div className="room" aria-hidden="true">
        <div className="window-light" />
        <div className="window-frame" />
        <div className="desk" />
        <div className="room-haze room-haze--back" />
        <div className="mist mist--back" />
      </div>

      <header className="masthead">
        <span className="working-name"><img className="plum-mark" src="/images/plum-mark.png" alt="" width="256" height="256" decoding="async" />Plum</span>
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
          <ImageTelevision active={!paused && !hidden && !loading} sound={sound} onSoundBlocked={handleSoundBlocked} onSwitch={switchTv} switchLabel={switchLabel} />
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
        <h1 id="scene-title">A familiar feeling.{' '}<br /><em>A new window.</em></h1>
        {/* The only way in. A keycap in the Macintosh's plastic and the word in the headline's voice. */}
        <a className="enter-cue" href="/explore">
          <span className="enter-cue-key" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M19 5v6a3 3 0 0 1-3 3H7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M10 10l-4 4 4 4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
          <span className="enter-cue-label">Enter</span>
        </a>
      </section>
    </main>
    </>
  )
}

export default App
