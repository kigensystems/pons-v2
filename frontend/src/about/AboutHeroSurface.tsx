import { useEffect, useRef } from 'react'

// Post-processing for the About hero, done in 2D canvas so the copy stays HTML.
// Image: a soft diffusion pass plus a warm bloom of the highlights on its own layer so it can breathe.
// Surface: fine gaussian grain over the whole hero, screen-blended so it lives in the darks.

const DPR_CAP = 2
const BLOOM_PAD = 0.12
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

function drawImage(canvas: HTMLCanvasElement, bloom: HTMLCanvasElement, img: HTMLImageElement, cssW: number, cssH: number, dpr: number) {
  const w = Math.round(cssW * dpr), h = Math.round(cssH * dpr)
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, w, h)
  ctx.filter = 'brightness(.8) saturate(.68) sepia(.1)'
  ctx.drawImage(img, 0, 0, w, h)
  // Diffusion: a blurred copy laid over at low alpha softens edges without losing them.
  ctx.globalAlpha = 0.32
  ctx.filter = `brightness(.8) saturate(.68) sepia(.1) blur(${(2.2 * dpr).toFixed(1)}px)`
  ctx.drawImage(img, 0, 0, w, h)
  ctx.globalAlpha = 1
  ctx.filter = 'none'
  // Bloom: the brighter parts, blurred wide, tinted warm, clipped to the image alpha.
  // The bloom canvas overhangs the image by BLOOM_PAD so the blur is not cut flat at the edges.
  const mx = Math.round(w * BLOOM_PAD), my = Math.round(h * BLOOM_PAD), bw = w + 2 * mx, bh = h + 2 * my
  bloom.width = bw; bloom.height = bh
  const glow = document.createElement('canvas')
  glow.width = bw; glow.height = bh
  const g = glow.getContext('2d')!
  g.filter = `brightness(.8) contrast(3) blur(${Math.round(18 * dpr)}px)`
  g.drawImage(img, mx, my, w, h)
  const b = bloom.getContext('2d')!
  b.clearRect(0, 0, bw, bh)
  b.drawImage(glow, 0, 0)
  b.globalCompositeOperation = 'multiply'
  b.fillStyle = '#ffd9ae'
  b.fillRect(0, 0, bw, bh)
  b.globalCompositeOperation = 'destination-in'
  b.drawImage(glow, 0, 0)
  b.globalCompositeOperation = 'source-over'
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
      b.style.opacity = String(0.58 + 0.08 * f)
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
