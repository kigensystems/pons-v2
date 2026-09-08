import { useEffect, useRef } from 'react'

// Fine gaussian grain over the About hero, screen-blended so it lives in the darks.
// One tile at device resolution, redrawn at a fresh offset at a film-like rate.

const DPR_CAP = 2
const GRAIN_TILE = 256
const GRAIN_AMP = 80
const GRAIN_FPS = 24

function makeGrain(w: number, h: number, amp: number) {
  const data = new ImageData(w, h)
  const px = data.data
  for (let i = 0; i < px.length; i += 4) {
    // sum of three uniforms ≈ gaussian, σ ≈ 0.29
    const g = (Math.random() + Math.random() + Math.random()) / 3 - 0.5
    const v = Math.max(0, Math.min(255, Math.round(g * amp + amp * 0.12)))
    px[i] = v; px[i + 1] = v; px[i + 2] = v; px[i + 3] = 255
  }
  return data
}

export function AboutGrain() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    // One fine tile at device resolution, drawn at a fresh offset each frame.
    // Low amplitude at a film-like rate reads as grain rather than strobe.
    const tile = document.createElement('canvas')
    tile.width = GRAIN_TILE; tile.height = GRAIN_TILE
    tile.getContext('2d')!.putImageData(makeGrain(GRAIN_TILE, GRAIN_TILE, GRAIN_AMP), 0, 0)
    const pattern = ctx.createPattern(tile, 'repeat')!
    let timer = 0, visible = true
    const draw = () => {
      const x = Math.floor(Math.random() * GRAIN_TILE), y = Math.floor(Math.random() * GRAIN_TILE)
      ctx.save(); ctx.translate(-x, -y); ctx.fillStyle = pattern; ctx.fillRect(x, y, c.width, c.height); ctx.restore()
    }
    const size = () => {
      const r = c.getBoundingClientRect(), dpr = Math.min(DPR_CAP, devicePixelRatio || 1)
      c.width = Math.max(1, Math.round(r.width * dpr)); c.height = Math.max(1, Math.round(r.height * dpr))
      draw()
    }
    const start = () => { if (!reduced && visible && document.visibilityState === 'visible' && !timer) timer = window.setInterval(draw, 1000 / GRAIN_FPS) }
    const stop = () => { clearInterval(timer); timer = 0 }
    const ro = new ResizeObserver(size)
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); else stop() })
    const onVis = () => document.visibilityState === 'visible' ? start() : stop()
    ro.observe(c); io.observe(c); document.addEventListener('visibilitychange', onVis)
    start()
    return () => { stop(); ro.disconnect(); io.disconnect(); document.removeEventListener('visibilitychange', onVis) }
  }, [])
  return <canvas ref={ref} className="about-grain" aria-hidden="true" />
}
