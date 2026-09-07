import { useEffect } from 'react'

type Props = { progress: number; complete: boolean; onExited: () => void }

export default function LoadingScreen({ progress, complete, onExited }: Props) {
  useEffect(() => {
    if (!complete) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timeout = window.setTimeout(onExited, reducedMotion ? 0 : 650)
    return () => window.clearTimeout(timeout)
  }, [complete, onExited])

  return (
    <div className="loading-screen" data-complete={complete}>
      <div className="loading-crt">
        <div className="loading-title" aria-hidden="true">Pons companion</div>
        <div className="loading-copy">
          <p role="status">{complete ? 'Welcome.' : 'Loading your companion...'}</p>
          <p>Opening study 01</p>
        </div>
        <div
          className="loading-bar"
          role="progressbar"
          aria-label="Preparing the opening scene"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          aria-valuetext={complete ? 'Scene ready' : 'Loading the opening scene'}
        >
          {Array.from({ length: 21 }, (_, index) => (
            <span key={index} data-filled={index < Math.floor(progress * 21 / 100)} />
          ))}
        </div>
        <p className="loading-footer">A companion to Pons. <span>A world of its own.</span></p>
      </div>
    </div>
  )
}
