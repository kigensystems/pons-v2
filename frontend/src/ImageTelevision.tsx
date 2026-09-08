import { useEffect, useId, useRef } from 'react'
import { createMonitorPlayback } from './monitorPlayback'
import { deriveTvLighting } from './tvLighting'

type Props = { active: boolean; sound: boolean; onSoundBlocked: () => void; onSwitch: () => void; switchLabel: string }

// The inside of the original image's curved glass, in artwork coordinates.
const GLASS_PATH = 'M 596 138 C 691 137 824 146 912 154 Q 929 156 929 178 L 920 428 Q 919 445 901 446 C 801 446 655 434 588 423 Q 570 420 567 399 C 557 311 562 213 574 161 Q 578 138 596 138 Z'
// The screen must be the brightest thing in the room. Lift the footage hard and clip its top fifth to
// white before the halation blooms, so dim talking heads still read as emitted light.
const CRT_EXPOSURE = '0 .24 .48 .66 .8 .9 .96 .99 1 1 1'

/** Original pixels stay intact; registered shading and CRT light integrate the artwork. */
export default function ImageTelevision({ active, sound, onSoundBlocked, onSwitch, switchLabel }: Props) {
  const clipId = useId()
  const svgRef = useRef<SVGSVGElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cueRef = useRef<HTMLSpanElement>(null)
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
    let frame = 0
    let lastTime = 0
    let frames = 0
    let lastLightTime = 0
    let light = { color: [180, 190, 255], spill: 0 }
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
        spill: light.spill + (target.spill - light.spill) * blend,
      }
      const style = svgRef.current!.style
      style.setProperty('--tv-light', `rgb(${light.color.map(Math.round).join(' ')})`)
      style.setProperty('--tv-spill', String(light.spill))
    }
    const playing = () => activeRef.current && !document.hidden
    const draw = (time: number) => {
      frame = 0
      if (!playing()) return
      if (time - lastTime >= 1000 / 30) {
        if (playback.update(Math.min((time - lastTime) / 1000, 0.1))) {
          updateLight(time)
        }
        lastTime = time - ((time - lastTime) % (1000 / 30))
        if (import.meta.env.DEV) canvas.dataset.frames = String(++frames)
      }
      frame = requestAnimationFrame(draw)
    }
    const invalidate = () => {
      updateLight(performance.now(), !activeRef.current)
      if (playing() && !frame) frame = requestAnimationFrame(draw)
    }
    const playback = createMonitorPlayback(invalidate, onSoundBlocked, import.meta.env.DEV ? canvas : undefined, canvas)
    playbackRef.current = playback
    // The caption is sized in screen pixels; report how large one canvas unit is on screen.
    const svg = svgRef.current!
    const measure = () => playback.setScale(svg.getBoundingClientRect().width / 1536 * 0.585)
    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(svg)
    measure()
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
      resizeObserver.disconnect()
      cancelAnimationFrame(frame)
      playback.dispose()
      playbackRef.current = null
      syncRef.current = () => {}
    }
  }, [onSoundBlocked])

  return (
    <>
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
        <clipPath id={clipId}>
          <path d={GLASS_PATH} />
        </clipPath>
        <clipPath id={`${clipId}-keyboard`}>
          <path d="M 350 630 L 949 738 L 911 901 L 112 803 Z" />
        </clipPath>
        <filter id={`${clipId}-exposure`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feComponentTransfer result="exposed">
            <feFuncR type="table" tableValues={CRT_EXPOSURE} />
            <feFuncG type="table" tableValues={CRT_EXPOSURE} />
            <feFuncB type="table" tableValues={CRT_EXPOSURE} />
          </feComponentTransfer>
          <feComponentTransfer in="exposed" result="highlights">
            <feFuncR type="linear" slope="2" intercept="-1" />
            <feFuncG type="linear" slope="2" intercept="-1" />
            <feFuncB type="linear" slope="2" intercept="-1" />
          </feComponentTransfer>
          <feGaussianBlur in="highlights" stdDeviation="1.6" />
          <feComponentTransfer result="halation">
            <feFuncA type="linear" slope=".32" />
          </feComponentTransfer>
          <feBlend in="exposed" in2="halation" mode="screen" />
        </filter>
        {/* The source's bright key planes receive light; dark gaps and legends do not. */}
        <filter id={`${clipId}-key-planes`} colorInterpolationFilters="sRGB">
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR type="table" tableValues="0 0 0 0 .05 .2 .55 .85 1 1 1" />
            <feFuncG type="table" tableValues="0 0 0 0 .05 .2 .55 .85 1 1 1" />
            <feFuncB type="table" tableValues="0 0 0 0 .05 .2 .55 .85 1 1 1" />
          </feComponentTransfer>
        </filter>
        <mask id={`${clipId}-key-receiver`} maskUnits="userSpaceOnUse" x="112" y="630" width="840" height="271" style={{ maskType: 'luminance' }}>
          <image href="/images/macintosh-render.png" width="1536" height="1024" filter={`url(#${clipId}-key-planes)`} />
        </mask>
        <radialGradient id={`${clipId}-reflection`}>
          <stop offset="0" stopColor="var(--tv-light)" stopOpacity="1" />
          <stop offset=".45" stopColor="var(--tv-light)" stopOpacity=".65" />
          <stop offset="1" stopColor="var(--tv-light)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${clipId}-glass-shade`} r=".7">
          <stop offset=".45" stopColor="#080c10" stopOpacity="0" />
          <stop offset=".8" stopColor="#080c10" stopOpacity=".12" />
          <stop offset="1" stopColor="#080c10" stopOpacity=".55" />
        </radialGradient>
      </defs>
      {/* Shade the original alpha silhouette; the CRT and its light are added above it. */}
      <rect width="1536" height="1024" fill={`url(#${clipId}-room-shadow)`} mask={`url(#${clipId}-artwork)`} aria-hidden="true" />
      <g className="image-tv-reflection" clipPath={`url(#${clipId}-keyboard)`} mask={`url(#${clipId}-key-receiver)`}>
        <ellipse cx="632" cy="708" rx="230" ry="70" transform="rotate(10 632 708)" fill={`url(#${clipId}-reflection)`} />
      </g>
      <g className="image-tv-picture" clipPath={`url(#${clipId})`}>
        <g filter={`url(#${clipId}-exposure)`}>
          <foreignObject width="640" height="480" transform="matrix(.585 .031 -.025 .638 570 129)">
            <canvas ref={canvasRef} className="image-tv-canvas" width="640" height="480" role="img" aria-label="TV cycling four video channels with brief static between them" />
          </foreignObject>
        </g>
      </g>
      {/* Original bezel detail remains exposed; highlight diffusion stays inside the glass. */}
      <g clipPath={`url(#${clipId})`} aria-hidden="true">
        <rect x="560" y="135" width="375" height="315" fill={`url(#${clipId}-glass-shade)`} />
      </g>
      {/* The glass is the only control: it plays, unmutes, and mutes. The focus ring follows its curve. */}
      <path className="tv-glass-focus" d={GLASS_PATH} aria-hidden="true" />
      <foreignObject className="tv-switch-area" x="557" y="135" width="375" height="313">
        <button
          className="tv-switch"
          type="button"
          onClick={onSwitch}
          aria-label={switchLabel}
          onPointerMove={(event) => {
            const cue = cueRef.current
            if (!cue || event.pointerType !== 'mouse') return
            const box = svgRef.current!.getBoundingClientRect()
            cue.style.translate = `${event.clientX - box.left}px ${event.clientY - box.top}px`
            cue.dataset.visible = ''
          }}
          onPointerLeave={() => { delete cueRef.current?.dataset.visible }}
        />
      </foreignObject>
    </svg>
    {/* Follows the pointer over the glass; the screen face names the action, the way the Enter key does. */}
    <span ref={cueRef} className="tv-cue" aria-hidden="true">{switchLabel}</span>
    </>
  )
}
