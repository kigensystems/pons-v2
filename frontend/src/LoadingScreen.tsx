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
      <svg className="loading-filters" aria-hidden="true" width="0" height="0">
        <defs>
          <clipPath id="loading-glass" clipPathUnits="objectBoundingBox">
            <path d="M .065 .025 Q .5 -.015 .935 .025 Q .975 .028 .982 .085 Q 1.015 .5 .982 .915 Q .976 .975 .935 .978 Q .5 1.015 .065 .978 Q .023 .975 .018 .915 Q -.015 .5 .018 .085 Q .025 .028 .065 .025 Z" />
          </clipPath>
          <filter id="loading-phosphor" x="-10%" y="-15%" width="120%" height="130%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency=".008 .65" numOctaves="1" seed="12" result="signal" />
            <feDisplacementMap in="SourceGraphic" in2="signal" scale="1.35" xChannelSelector="R" yChannelSelector="G" />
            <feGaussianBlur stdDeviation=".3" />
          </filter>
          <filter id="loading-phosphor-small" x="-10%" y="-15%" width="120%" height="130%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency=".008 .65" numOctaves="1" seed="12" result="signal" />
            <feDisplacementMap in="SourceGraphic" in2="signal" scale=".5" xChannelSelector="R" yChannelSelector="G" />
            <feGaussianBlur stdDeviation=".15" />
          </filter>
        </defs>
      </svg>
      <div className="loading-crt">
        <div className="loading-content">
        <div className="loading-lockup"><img className="loading-mark" src="/images/loading-mark.png" alt="" width="320" height="320" /><span className="loading-title">Plum</span></div>
        <div className="loading-copy">
          <p>Plum, Website</p>
          <p role="status">{complete ? 'Welcome.' : 'Version 1.0'}</p>
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
        <p className="loading-footer">Copyright (c) Plum, 2026. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  )
}
