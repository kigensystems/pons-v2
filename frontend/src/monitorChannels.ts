import { CanvasTexture, LinearFilter, SRGBColorSpace } from 'three/webgpu'
import { createMonitorPlayback } from './monitorPlayback.ts'

export { CHANNEL_URLS, STATIC_SECONDS } from './monitorPlayback.ts'

/** Keep the 3D CRT adapter separate from browser-only channel playback. */
export function createMonitorChannels(invalidate: () => void, soundBlocked: () => void, diagnostics?: HTMLElement) {
  let texture: CanvasTexture | undefined
  const playback = createMonitorPlayback(() => {
    if (texture) texture.needsUpdate = true
    invalidate()
  }, soundBlocked, diagnostics)
  texture = new CanvasTexture(playback.surface)
  texture.colorSpace = SRGBColorSpace
  texture.flipY = false
  texture.generateMipmaps = false
  texture.minFilter = LinearFilter
  const crtTexture = texture
  let disposed = false
  return {
    texture: crtTexture,
    setActive: playback.setActive,
    setSound: playback.setSound,
    update(delta: number) {
      if (playback.update(delta)) crtTexture.needsUpdate = true
    },
    dispose() {
      if (disposed) return
      disposed = true
      playback.dispose()
      crtTexture.dispose()
    },
  }
}
