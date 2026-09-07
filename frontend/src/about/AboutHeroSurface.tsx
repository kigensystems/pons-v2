import { useEffect, useRef } from 'react'

// Post-processing for the About hero, done in 2D canvas so the copy stays HTML.
// Image: per-channel vertical split that grows with distance from the row centre,
// plus a warm bloom of the highlights on its own layer so it can breathe.
// Surface: gaussian grain over the whole hero, screen-blended so it lives in the darks.
// Lens: an SVG displacement map that curves the whole hero like a tube.

const DPR_CAP = 2
const GRAIN_FRAMES = 6
const GRAIN_FPS = 9
const LENS_SIZE = 96

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

function channelLayer(img: HTMLImageElement, w: number, h: number, color: string) {
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  const ctx = c.getContext('2d')!
  ctx.drawImage(img, 0, 0, w, h)
  ctx.globalCompositeOperation = 'multiply'
  ctx.fillStyle = color
  ctx.fillRect(0, 0, w, h)
  ctx.globalCompositeOperation = 'destination-in'
  ctx.drawImage(img, 0, 0, w, h)
  return c
}

function drawImage(canvas: HTMLCanvasElement, bloom: HTMLCanvasElement, img: HTMLImageElement, cssW: number, cssH: number, dpr: number) {
  const w = Math.round(cssW * dpr), h = Math.round(cssH * dpr)
  canvas.width = w; canvas.height = h; bloom.width = w; bloom.height = h
  const ctx = canvas.getContext('2d')!
  const layers = [channelLayer(img, w, h, '#f00'), channelLayer(img, w, h, '#0f0'), channelLayer(img, w, h, '#00f')]
  ctx.clearRect(0, 0, w, h)
  ctx.filter = 'brightness(.82) saturate(.7) sepia(.08)'
  ctx.globalCompositeOperation = 'lighter'
  // Vertical-only fringe. Strips let the split grow with distance² from the centre row.
  const strips = 18, sh = h / strips, cy = h / 2
  for (let s = 0; s < strips; s++) {
    const y = s * sh
    const d = (y + sh / 2 - cy) / cy
    const off = (0.45 + 2.6 * d * d) * dpr
    ctx.drawImage(layers[0], 0, y, w, sh, 0, y - off, w, sh)
    ctx.drawImage(layers[1], 0, y, w, sh, 0, y, w, sh)
    ctx.drawImage(layers[2], 0, y, w, sh, 0, y + off, w, sh)
  }
  ctx.filter = 'none'
  ctx.globalCompositeOperation = 'source-over'
  // Bloom: keep only the bright parts, blur them wide, tint warm.
  const glow = document.createElement('canvas')
  glow.width = w; glow.height = h
  const g = glow.getContext('2d')!
  g.filter = `brightness(.72) contrast(5) blur(${Math.round(14 * dpr)}px)`
  g.drawImage(img, 0, 0, w, h)
  const b = bloom.getContext('2d')!
  b.clearRect(0, 0, w, h)
  b.drawImage(glow, 0, 0)
  b.globalCompositeOperation = 'multiply'
  b.fillStyle = '#ffd5a3'
  b.fillRect(0, 0, w, h)
  b.globalCompositeOperation = 'destination-in'
  b.drawImage(glow, 0, 0)
  b.globalCompositeOperation = 'source-over'
}

function lensMap(strength: number) {
  const c = document.createElement('canvas')
  c.width = LENS_SIZE; c.height = LENS_SIZE
  const ctx = c.getContext('2d')!
  const data = ctx.createImageData(LENS_SIZE, LENS_SIZE)
  for (let y = 0; y < LENS_SIZE; y++) for (let x = 0; x < LENS_SIZE; x++) {
    const u = (x + 0.5) / LENS_SIZE - 0.5, v = (y + 0.5) / LENS_SIZE - 0.5
    const r2 = u * u + v * v
    const i = (y * LENS_SIZE + x) * 4
    data.data[i] = Math.round(128 + 127 * Math.max(-1, Math.min(1, -u * r2 * strength)))
    data.data[i + 1] = Math.round(128 + 127 * Math.max(-1, Math.min(1, -v * r2 * strength)))
    data.data[i + 2] = 0; data.data[i + 3] = 255
  }
  ctx.putImageData(data, 0, 0)
  return c.toDataURL()
}

export function AboutLens({ id }: { id: string }) {
  const ref = useRef<SVGFEImageElement>(null)
  useEffect(() => { ref.current?.setAttribute('href', lensMap(4)) }, [])
  return <svg className="about-lens-defs" aria-hidden="true" focusable="false" width="0" height="0">
    <filter id={id} x="0" y="0" width="1" height="1" colorInterpolationFilters="sRGB">
      <feImage ref={ref} result="map" x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" />
      <feDisplacementMap in="SourceGraphic" in2="map" scale="30" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </svg>
}

export function AboutComputer({ src, alt }: { src: string; alt: string }) {
  const host = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const bloom = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const img = imgRef.current, el = host.current, c = canvas.current, b = bloom.current
    if (!img || !el || !c || !b) return
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0, visible = true
    const render = () => {
      const r = el.getBoundingClientRect()
      if (!r.width || !img.naturalWidth) return
      const dpr = Math.min(DPR_CAP, devicePixelRatio || 1)
      drawImage(c, b, img, r.width, r.width * img.naturalHeight / img.naturalWidth, dpr)
      el.dataset.ready = ''
    }
    // Bloom breathes: three slow sines, as on a tube that never quite settles.
    const breathe = (t: number) => {
      const x = t / 1000
      const f = (Math.sin(5.3 * x * 0.5) + Math.sin(11.7 * x * 0.5 + 1.2 * Math.sin(2.1 * x * 0.5)) + Math.sin(23.9 * x * 0.5 + 0.65 * Math.cos(7.1 * x * 0.5))) / 3
      b.style.opacity = String(0.62 + 0.14 * f)
      raf = requestAnimationFrame(breathe)
    }
    const start = () => { if (!reduced && visible && document.visibilityState === 'visible' && !raf) raf = requestAnimationFrame(breathe) }
    const stop = () => { cancelAnimationFrame(raf); raf = 0 }
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); else stop() })
    const ro = new ResizeObserver(render)
    const onVis = () => document.visibilityState === 'visible' ? start() : stop()
    if (img.complete && img.naturalWidth) render(); else img.addEventListener('load', render, { once: true })
    ro.observe(el); io.observe(el); document.addEventListener('visibilitychange', onVis)
    start()
    return () => { stop(); ro.disconnect(); io.disconnect(); document.removeEventListener('visibilitychange', onVis) }
  }, [])

  return <div className="about-computer-surface" ref={host}>
    <img ref={imgRef} src={src} alt={alt} width="1536" height="1024" />
    <canvas ref={canvas} aria-hidden="true" />
    <canvas ref={bloom} aria-hidden="true" className="about-computer-bloom" />
  </div>
}

export function AboutGrain() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    let frames: ImageData[] = [], frame = 0, timer = 0, visible = true
    const build = () => {
      const r = c.getBoundingClientRect()
      const scale = Math.min(1, Math.sqrt(900_000 / (r.width * r.height || 1)))
      c.width = Math.max(1, Math.round(r.width * scale)); c.height = Math.max(1, Math.round(r.height * scale))
      frames = Array.from({ length: reduced ? 1 : GRAIN_FRAMES }, () => makeGrain(c.width, c.height, 150))
      ctx.putImageData(frames[0], 0, 0)
    }
    const tick = () => { frame = (frame + 1) % frames.length; ctx.putImageData(frames[frame], 0, 0) }
    const start = () => { if (!reduced && visible && document.visibilityState === 'visible' && !timer) timer = window.setInterval(tick, 1000 / GRAIN_FPS) }
    const stop = () => { clearInterval(timer); timer = 0 }
    const ro = new ResizeObserver(build)
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); else stop() })
    const onVis = () => document.visibilityState === 'visible' ? start() : stop()
    ro.observe(c); io.observe(c); document.addEventListener('visibilitychange', onVis)
    start()
    return () => { stop(); ro.disconnect(); io.disconnect(); document.removeEventListener('visibilitychange', onVis) }
  }, [])
  return <canvas ref={ref} className="about-grain" aria-hidden="true" />
}
