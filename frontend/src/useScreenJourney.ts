import { useEffect, useRef, useState } from 'react'
import { screenTransition, smoothstep } from './screenTransition'

export default function useScreenJourney(ready: boolean, imageError: boolean) {
  const journeyRef = useRef<HTMLDivElement>(null)
  const worldRef = useRef<HTMLDivElement>(null)
  const artworkRef = useRef<HTMLDivElement>(null)
  const portalRef = useRef<HTMLDivElement>(null)
  const [entered, setEntered] = useState(false)
  const [tvVisible, setTvVisible] = useState(true)

  useEffect(() => {
    const journey = journeyRef.current!
    const world = worldRef.current!
    const artwork = artworkRef.current!
    const portal = portalRef.current!
    let frame = 0
    let arrived = false
    let distance = 1
    let bounds = { left: 0, top: 0, width: 1, height: 1 }
    let viewport = { width: 1, height: 1 }

    const draw = () => {
      frame = 0
      if (document.hidden) return
      const scroll = Math.max(0, window.scrollY)
      const p = ready ? Math.min(1, scroll / distance) : 0
      const next = p >= 1
      if (next && arrived) return
      const visual = screenTransition(p, viewport, bounds)
      // Deliberate scrolling always controls the camera. Motion preferences still
      // pause the TV in App; the explicit Explore links bypass the zoom entirely.
      world.style.transform = imageError ? 'none' : visual.transform
      journey.style.setProperty('--journey-copy', String(imageError ? 1 - smoothstep(p) : visual.copy))
      journey.style.setProperty('--journey-room', String(1 - smoothstep((p - .5) / .5)))
      portal.style.transform = next ? 'none' : `translate3d(0, ${scroll - distance}px, 0)`
      portal.style.clipPath = next ? 'none' : imageError ? `inset(0 0 calc(100% - ${viewport.height}px) 0)` : visual.clip
      portal.style.opacity = String(imageError ? smoothstep(p) : visual.reveal)
      // Only the visible page is exposed to keyboard and assistive technology.
      portal.inert = !next
      journey.querySelector<HTMLElement>('.opening')!.inert = !ready || next || p > .22
      journey.dataset.entered = String(next)
      setTvVisible(p < .62)
      if (next !== arrived) {
        arrived = next
        setEntered(next)
        document.title = next ? 'Explore — Plum' : 'Plum — a new window'
        // Scrolling is one history entry. Reloading/sharing at Explore opens its direct route.
        window.history.replaceState(window.history.state, '', next ? '/explore' : '/')
      }
    }
    const schedule = () => { if (!frame && !document.hidden) frame = requestAnimationFrame(draw) }
    const measure = () => {
      // Measure untransformed layout; never feed the previous zoom back into itself.
      viewport = { width: journey.clientWidth, height: world.clientHeight }
      bounds = { left: artwork.offsetLeft, top: artwork.offsetTop, width: artwork.clientWidth, height: artwork.clientHeight }
      distance = Math.round(viewport.height * (imageError ? .45 : 1.35))
      journey.style.setProperty('--journey-distance', `${distance}px`)
      schedule()
    }
    const visibility = () => {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0 }
      else schedule()
    }
    const observer = new ResizeObserver(measure)
    observer.observe(world)
    observer.observe(artwork)
    window.addEventListener('scroll', schedule, { passive: true })
    document.addEventListener('visibilitychange', visibility)
    measure()
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('scroll', schedule)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [ready, imageError])

  return { journeyRef, worldRef, artworkRef, portalRef, entered, tvVisible }
}
