import { useEffect, useId, useRef } from 'react'
import { createMonitorPlayback } from './monitorPlayback'
import { deriveTvLighting } from './tvLighting'

type Props = { active: boolean; sound: boolean; onSoundBlocked: () => void }

/** Original pixels stay intact; registered shading and CRT light integrate the artwork. */
export default function ImageTelevision({ active, sound, onSoundBlocked }: Props) {
  const clipId = useId()
  const svgRef = useRef<SVGSVGElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bloomRef = useRef<HTMLCanvasElement>(null)
  const playbackRef = useRef<ReturnType<typeof createMonitorPlayback> | null>(null)
  const activeRef = useRef(active)
  const syncRef = useRef(() => {})

  useEffect(() => {
    activeRef.current = active
    syncRef.current()
  }, [active])

  useEffect(() => { void playbackRef.current?.setSound(sound) }, [sound])

  useEffect(() => {
    const canvas = canvasRef.current!
    const bloomContext = bloomRef.current!.getContext('2d')!
    const updateBloom = () => bloomContext.drawImage(canvas, 0, 0, 160, 120)
    let frame = 0
    let lastTime = 0
    let frames = 0
    let lastLightTime = 0
    let light = { color: [180, 190, 255], glow: 0, spill: 0 }
    const sample = document.createElement('canvas')
    sample.width = 8
    sample.height = 6
    const sampleContext = sample.getContext('2d', { willReadFrequently: true })!
    const updateLight = (time: number, immediate = false) => {
      if (!immediate && time - lastLightTime < 200) return
      lastLightTime = time
      sampleContext.drawImage(canvas, 0, 0, 8, 6)
      const target = deriveTvLighting(sampleContext.getImageData(0, 0, 8, 6).data)
      // Five tiny samples per second; ease changes instead of flashing the room.
      const blend = immediate ? 1 : 0.25
      light = {
        color: light.color.map((value, index) => value + (target.color[index] - value) * blend),
        glow: light.glow + (target.glow - light.glow) * blend,
        spill: light.spill + (target.spill - light.spill) * blend,
      }
      const style = svgRef.current!.style
      style.setProperty('--tv-light', `rgb(${light.color.map(Math.round).join(' ')})`)
      style.setProperty('--tv-glow', String(light.glow))
      style.setProperty('--tv-spill', String(light.spill))
    }
    const playing = () => activeRef.current && !document.hidden
    const draw = (time: number) => {
      frame = 0
      if (!playing()) return
      if (time - lastTime >= 1000 / 30) {
        if (playback.update(Math.min((time - lastTime) / 1000, 0.1))) {
          updateBloom()
          updateLight(time)
        }
        lastTime = time - ((time - lastTime) % (1000 / 30))
        if (import.meta.env.DEV) canvas.dataset.frames = String(++frames)
      }
      frame = requestAnimationFrame(draw)
    }
    const invalidate = () => {
      updateBloom()
      updateLight(performance.now(), !activeRef.current)
      if (playing() && !frame) frame = requestAnimationFrame(draw)
    }
    const playback = createMonitorPlayback(invalidate, onSoundBlocked, import.meta.env.DEV ? canvas : undefined, canvas)
    playbackRef.current = playback
    const sync = () => {
      cancelAnimationFrame(frame)
      frame = 0
      lastTime = performance.now()
      playback.setActive(playing())
      invalidate()
    }
    syncRef.current = sync
    sync()
    return () => {
      cancelAnimationFrame(frame)
      playback.dispose()
      playbackRef.current = null
      syncRef.current = () => {}
    }
  }, [onSoundBlocked])

  return (
    <svg ref={svgRef} className="image-television" viewBox="0 0 1536 1024" aria-label="Television screen">
      <defs>
        <mask id={`${clipId}-artwork`} maskUnits="userSpaceOnUse" x="0" y="0" width="1536" height="1024" style={{ maskType: 'alpha' }}>
          <image href="/images/macintosh-render.png" width="1536" height="1024" />
        </mask>
        <linearGradient id={`${clipId}-room-shadow`} gradientUnits="userSpaceOnUse" x1="490" y1="170" x2="1190" y2="560">
          <stop offset="0" stopColor="#080e0c" stopOpacity="0" />
          <stop offset=".35" stopColor="#080e0c" stopOpacity=".12" />
          <stop offset=".7" stopColor="#080e0c" stopOpacity=".5" />
          <stop offset="1" stopColor="#080e0c" stopOpacity=".68" />
        </linearGradient>
        {/* Coordinates follow the inside of the original image's curved glass. */}
        <clipPath id={clipId}>
          <path d="M 596 138 C 691 137 824 146 912 154 Q 929 156 929 178 L 920 428 Q 919 445 901 446 C 801 446 655 434 588 423 Q 570 420 567 399 C 557 311 562 213 574 161 Q 578 138 596 138 Z" />
        </clipPath>
        <clipPath id={`${clipId}-keyboard`}>
          <path d="M 350 630 L 949 738 L 911 901 L 112 803 Z" />
        </clipPath>
        <filter id={`${clipId}-halo`} x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="20" />
        </filter>
        <filter id={`${clipId}-edge`} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter id={`${clipId}-phosphor`} x="-15%" y="-20%" width="130%" height="140%" colorInterpolationFilters="sRGB">
          <feComponentTransfer>
            <feFuncR type="linear" slope="2.2" intercept="-.4" />
            <feFuncG type="linear" slope="2.2" intercept="-.4" />
            <feFuncB type="linear" slope="2.2" intercept="-.4" />
          </feComponentTransfer>
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <radialGradient id={`${clipId}-reflection`}>
          <stop offset="0" stopColor="var(--tv-light)" stopOpacity="1" />
          <stop offset=".45" stopColor="var(--tv-light)" stopOpacity=".65" />
          <stop offset="1" stopColor="var(--tv-light)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${clipId}-bezel-reflection`}>
          <stop offset="0" stopColor="var(--tv-light)" stopOpacity="0" />
          <stop offset=".35" stopColor="var(--tv-light)" stopOpacity=".9" />
          <stop offset=".8" stopColor="var(--tv-light)" stopOpacity="1" />
          <stop offset="1" stopColor="var(--tv-light)" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${clipId}-glass-shade`} r=".7">
          <stop offset=".45" stopColor="#080c10" stopOpacity="0" />
          <stop offset=".8" stopColor="#080c10" stopOpacity=".12" />
          <stop offset="1" stopColor="#080c10" stopOpacity=".55" />
        </radialGradient>
        <radialGradient id={`${clipId}-glass-reflection`}>
          <stop offset="0" stopColor="#dfe9e5" stopOpacity=".16" />
          <stop offset=".4" stopColor="#dfe9e5" stopOpacity=".06" />
          <stop offset="1" stopColor="#dfe9e5" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Shade the original alpha silhouette; the CRT and its light are added above it. */}
      <rect width="1536" height="1024" fill={`url(#${clipId}-room-shadow)`} mask={`url(#${clipId}-artwork)`} aria-hidden="true" />
      <g className="image-tv-emission">
        <path d="M 596 143 L 917 161 L 909 435 L 580 412 Z" fill="var(--tv-light)" filter={`url(#${clipId}-halo)`} />
        {/* Light catches the inward-facing lower lip, not the whole front casing. */}
        <path d="M 573 428 Q 737 462 922 448" fill="none" stroke={`url(#${clipId}-bezel-reflection)`} strokeWidth="14" filter={`url(#${clipId}-edge)`} />
        <path d="M 930 187 Q 935 310 922 424" fill="none" stroke="var(--tv-light)" strokeOpacity=".45" strokeWidth="7" filter={`url(#${clipId}-edge)`} />
      </g>
      <g className="image-tv-reflection" clipPath={`url(#${clipId}-keyboard)`}>
        <ellipse cx="632" cy="708" rx="230" ry="70" transform="rotate(10 632 708)" fill={`url(#${clipId}-reflection)`} />
      </g>
      <g className="image-tv-picture" clipPath={`url(#${clipId})`}>
        <foreignObject width="640" height="480" transform="matrix(.585 .031 -.025 .638 570 129)">
          <canvas ref={canvasRef} className="image-tv-canvas" width="640" height="480" role="img" aria-label="TV cycling four video channels with brief static between them" />
        </foreignObject>
      </g>
      {/* Restrained room reflection and edge falloff give the moving picture glass depth. */}
      <g clipPath={`url(#${clipId})`} aria-hidden="true">
        <rect x="560" y="135" width="375" height="315" fill={`url(#${clipId}-glass-shade)`} />
        <ellipse cx="585" cy="178" rx="100" ry="185" transform="rotate(24 585 178)" fill={`url(#${clipId}-glass-reflection)`} />
      </g>
      {/* A small copy of the actual bright pixels blooms across the glass edge. */}
      <g className="image-tv-bloom" filter={`url(#${clipId}-phosphor)`} aria-hidden="true">
        <foreignObject width="640" height="480" transform="matrix(.585 .031 -.025 .638 570 129)">
          <canvas ref={bloomRef} className="image-tv-bloom-canvas" width="160" height="120" />
        </foreignObject>
      </g>
      <path className="image-tv-emission" d="M 596 143 C 690 142 823 151 911 159 Q 924 161 924 179 L 915 427 Q 914 440 901 441 C 801 441 655 429 589 418 Q 575 415 572 398 C 562 311 567 214 579 162 Q 583 143 596 143 Z" fill="none" stroke="var(--tv-light)" strokeWidth="6" filter={`url(#${clipId}-edge)`} />
    </svg>
  )
}
