import assert from 'node:assert/strict'
import test from 'node:test'
import { createMonitorPlayback } from '../src/monitorPlayback.ts'

test('plays into a supplied DOM canvas using only 2D and ignores late callbacks after disposal', async t => {
  let drawings = 0
  let invalidations = 0
  const pictures: unknown[][] = []
  const context = {
    fillStyle: '', textAlign: '', font: '', imageSmoothingEnabled: true,
    fillRect() { drawings++ }, fillText() { drawings++ },
    drawImage(...args: unknown[]) { drawings++; pictures.push(args) }, putImageData() { drawings++ },
    measureText: () => ({ width: 100 }), beginPath() {}, roundRect() {}, fill() {}, stroke() {}, strokeRect() {}, save() {}, restore() {}, translate() {}, moveTo() {}, lineTo() {}, arc() {}, closePath() {}, lineWidth: 1, strokeStyle: '', globalAlpha: 1, textBaseline: '', shadowColor: '', shadowBlur: 0, lineJoin: '', lineCap: '',
    createImageData: (width: number, height: number) => ({ data: new Uint8ClampedArray(width * height * 4) }),
    createRadialGradient: () => ({ addColorStop() {} }),
  }
  const canvas = () => ({ width: 0, height: 0, getContext(kind: string) {
    assert.equal(kind, '2d', 'Playback must not request a GPU context.')
    return context
  } })
  const supplied = canvas()
  let auxiliaryCanvases = 0
  const videos: FakeVideo[] = []
  const posters: FakeImage[] = []
  let resolvePlay!: () => void
  const pendingPlay = new Promise<void>(resolve => { resolvePlay = resolve })
  class FakeVideo {
    src = ''
    muted = true
    paused = true
    currentTime = 0
    duration = 12
    readyState = 2
    videoWidth = 768
    videoHeight = 432
    onended: (() => void) | null = null
    onerror: (() => void) | null = null
    play() { return pendingPlay.then(() => { this.paused = false }) }
    pause() { this.paused = true }
    load() {}
    removeAttribute(name: string) { if (name === 'src') this.src = '' }
  }
  class FakeImage {
    src = ''
    naturalWidth = 768
    naturalHeight = 432
    onload: (() => void) | null = null
    constructor() { posters.push(this) }
  }
  const globals = {
    document: { createElement(kind: string) {
      if (kind === 'video') { const video = new FakeVideo(); videos.push(video); return video }
      assert.equal(kind, 'canvas')
      auxiliaryCanvases++
      return canvas()
    } },
    Image: FakeImage,
  }
  const originals = Object.keys(globals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)] as const)
  for (const [key, value] of Object.entries(globals)) Object.defineProperty(globalThis, key, { value, configurable: true })
  const monitor = createMonitorPlayback(() => invalidations++, () => assert.fail('Muted playback must not request sound'), undefined, supplied as unknown as HTMLCanvasElement)
  t.after(() => {
    monitor.dispose()
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor)
      else Reflect.deleteProperty(globalThis, key)
    }
  })
  assert.equal(monitor.surface, supplied)
  assert.equal(supplied.width, 640)
  assert.equal(supplied.height, 480)
  assert.equal(auxiliaryCanvases, 1, 'Only the small static-noise canvas is created.')
  assert.equal(videos.length, 4)
  const posterLoaded = posters[0].onload!
  const mediaError = videos[0].onerror!
  const mediaEnded = videos[0].onended!
  posterLoaded()
  const posterFraming = pictures.find(args => args[0] === posters[0])!.slice(1)
  assert.equal(invalidations, 1)
  monitor.setActive(true)
  assert.equal(invalidations, 2, 'Activation redraws the poster so its caption reflects the new state.')
  assert.equal(monitor.update(1 / 30), true, 'A decoded video frame is drawn into the supplied canvas.')
  assert.deepEqual(pictures.find(args => args[0] === videos[0])!.slice(1), posterFraming, 'The first clip must keep the poster framing when playback starts.')
  assert.equal(monitor.update(1 / 30), false, 'An unchanged media frame is not redrawn.')
  assert.equal(invalidations, 2, 'Frame updates do not recursively invalidate the animation loop.')
  monitor.dispose()
  const drawingsAtDisposal = drawings
  posterLoaded()
  mediaError()
  mediaEnded()
  resolvePlay()
  for (let i = 0; i < 5; i++) await Promise.resolve()
  monitor.setActive(true)
  assert.equal(monitor.update(100), false)
  assert.equal(drawings, drawingsAtDisposal)
  assert.equal(invalidations, 2)
  assert.ok(videos.every(video => video.paused && video.src === '' && !video.onerror && !video.onended))
  assert.equal(posters[0].onload, null)
})
