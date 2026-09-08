import assert from 'node:assert/strict'
import test, { type TestContext } from 'node:test'
import { CHANNEL_URLS, STATIC_SECONDS, createMonitorChannels } from '../src/monitorChannels.ts'

class FakeVideo {
  src = ''
  preload = ''
  muted = true
  paused = true
  ended = false
  seeking = false
  readyState = 2
  mediaTime = 0
  duration = 12
  videoWidth = 768
  videoHeight = 432
  onended: (() => void) | null = null
  onerror: (() => void) | null = null
  playCalls = 0
  pauseCalls = 0
  loadCalls = 0
  nextPlay: Promise<void> | undefined
  get currentTime() { return this.mediaTime }
  set currentTime(value: number) { this.mediaTime = value; this.ended = false }
  play() {
    this.playCalls++
    const result = this.nextPlay ?? Promise.resolve()
    this.nextPlay = undefined
    return result.then(() => { this.paused = false })
  }
  pause() { this.paused = true; this.pauseCalls++ }
  load() { this.loadCalls++ }
  removeAttribute(name: string) { if (name === 'src') this.src = '' }
  finish() { this.ended = true; this.paused = true; this.onended?.() }
}

class FakeCanvas {
  width = 0
  height = 0
  context = {
    fillStyle: '', textAlign: '', font: '', imageSmoothingEnabled: true,
    fillRect() {}, fillText() {}, drawImage() {}, putImageData() {},
    measureText: () => ({ width: 100 }), beginPath() {}, roundRect() {}, fill() {}, stroke() {}, strokeRect() {}, save() {}, restore() {}, translate() {}, moveTo() {}, lineTo() {}, arc() {}, closePath() {}, lineWidth: 1, strokeStyle: '', globalAlpha: 1, textBaseline: '', shadowColor: '', shadowBlur: 0, lineJoin: '', lineCap: '',
    createImageData: (width: number, height: number) => ({ data: new Uint8ClampedArray(width * height * 4) }),
    createRadialGradient: () => ({ addColorStop() {} }),
  }
  getContext() { return this.context }
}

class FakeAudioNode {
  frequency = { value: 0 }
  Q = { value: 0 }
  gain = { setValueAtTime() {}, linearRampToValueAtTime() {} }
  buffer: unknown
  onended: (() => void) | null = null
  stopTimes: (number | undefined)[] = []
  startCalls = 0
  disconnectCalls = 0
  connect(node: FakeAudioNode) { return node }
  disconnect() { this.disconnectCalls++ }
  start() { this.startCalls++ }
  stop(time?: number) { this.stopTimes.push(time) }
}

function setup(t: TestContext) {
  const videos: FakeVideo[] = []
  const audioContexts: FakeAudioContext[] = []
  const diagnostics = { dataset: {} as Record<string, string> }
  let invalidations = 0
  let blocked = 0
  class FakeAudioContext {
    state = 'suspended'
    sampleRate = 48000
    currentTime = 42
    destination = new FakeAudioNode()
    sources: FakeAudioNode[] = []
    nextResume: Promise<void> | undefined
    constructor() { audioContexts.push(this) }
    resume() {
      return (this.nextResume ?? Promise.resolve()).then(() => { this.state = 'running' })
    }
    close() { this.state = 'closed'; return Promise.resolve() }
    createBuffer(_channels: number, length: number) { return { getChannelData: () => new Float32Array(length) } }
    createBufferSource() { const source = new FakeAudioNode(); this.sources.push(source); return source }
    createBiquadFilter() { return new FakeAudioNode() }
    createGain() { return new FakeAudioNode() }
  }
  const globals = {
    document: { createElement(name: string) {
      if (name === 'video') { const video = new FakeVideo(); videos.push(video); return video }
      return new FakeCanvas()
    } },
    Image: class { onload: (() => void) | null = null; src = ''; naturalWidth = 768; naturalHeight = 432 },
    AudioContext: FakeAudioContext,
  }
  const originals = Object.keys(globals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)] as const)
  for (const [key, value] of Object.entries(globals)) Object.defineProperty(globalThis, key, { value, configurable: true })
  const monitor = createMonitorChannels(() => invalidations++, () => blocked++, diagnostics as unknown as HTMLElement)
  t.after(() => {
    monitor.dispose()
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor)
      else Reflect.deleteProperty(globalThis, key)
    }
  })
  return { monitor, videos, audioContexts, diagnostics: diagnostics.dataset, get blocked() { return blocked }, get invalidations() { return invalidations } }
}

const flush = async () => { for (let i = 0; i < 5; i++) await Promise.resolve() }

test('only the first clip trims its bottom strip, with full canvas coverage and no stretching', async t => {
  const { monitor, videos } = setup(t)
  const pictures: unknown[][] = []
  t.mock.method((monitor.texture.image as FakeCanvas).context, 'drawImage', (...args: unknown[]) => pictures.push(args))
  monitor.setActive(true)
  await flush()
  for (const [index, video] of videos.entries()) {
    monitor.update(1 / 30)
    const [sx, sy, sw, sh, dx, dy, dw, dh] = pictures.find(args => args[0] === video)!.slice(1) as number[]
    assert.equal(sx, 0)
    assert.equal(sy, 0)
    assert.equal(sw, video.videoWidth)
    assert.equal(sh, index === 0 ? 426 : video.videoHeight, 'Later clips retain their complete source frame.')
    assert.ok(Math.abs(dw / sw - dh / sh) < 1e-10, 'Horizontal and vertical scaling must match.')
    assert.ok(dx <= 0 && dy <= 0 && dx + dw >= 640 && dy + dh >= 480, 'The picture must fill the canvas without blank edges.')
    video.finish()
    monitor.update(STATIC_SECONDS + 0.001)
    await flush()
  }
})

test('cycles all four supplied clips in order and wraps, with a bounded static interval', async t => {
  const { monitor, videos, diagnostics } = setup(t)
  assert.equal(STATIC_SECONDS, 0.24)
  assert.deepEqual(videos.map(video => video.src), CHANNEL_URLS)
  monitor.setActive(true)
  await flush()
  monitor.update(1 / 30)
  for (let index = 0; index < 4; index++) {
    assert.equal(diagnostics.channel, String(index + 1))
    assert.equal(diagnostics.channelPhase, 'video')
    videos[index].finish()
    assert.equal(diagnostics.channel, String((index + 1) % 4 + 1))
    assert.equal(diagnostics.channelPhase, 'static')
    monitor.update(STATIC_SECONDS - 0.001)
    assert.equal(diagnostics.channelPhase, 'static')
    monitor.update(0.002)
    await flush()
    assert.equal(diagnostics.channelPhase, 'video')
    assert.equal(videos[(index + 1) % 4].paused, false)
  }
  assert.equal(diagnostics.channel, '1')
})

test('only the first channel downloads with the page; each later one is fetched once the one before it plays, or when it becomes current after a failure', async t => {
  const { monitor, videos } = setup(t)
  assert.deepEqual(videos.map(video => video.preload), ['auto', 'none', 'none', 'none'])
  assert.deepEqual(videos.map(video => video.loadCalls), [0, 0, 0, 0], 'Setting src is the fetch; load() would open and abort a request despite preload none.')
  monitor.setActive(true)
  await flush()
  assert.deepEqual(videos.map(video => video.preload), ['auto', 'auto', 'none', 'none'])
  assert.equal(videos[1].loadCalls, 1)
  monitor.update(1 / 30)
  videos[0].finish()
  monitor.update(STATIC_SECONDS + 0.001)
  await flush()
  assert.deepEqual(videos.map(video => video.preload), ['auto', 'auto', 'auto', 'none'])
  assert.equal(videos[1].loadCalls, 1, 'A warmed channel is not reloaded when it becomes current.')
  monitor.update(1 / 30)
  videos[2].onerror?.()
  videos[1].finish()
  assert.deepEqual(videos.map(video => video.preload), ['auto', 'auto', 'auto', 'auto'], 'The channel after a failed one is fetched as soon as it becomes current.')
  assert.equal(videos[3].loadCalls, 1)
})

test('pause freezes channel time and static progress; resume preserves the selected channel', async t => {
  const { monitor, videos, diagnostics } = setup(t)
  monitor.setActive(true)
  await flush()
  monitor.update(0.03)
  videos[0].finish()
  monitor.update(0.1)
  monitor.setActive(false)
  assert.ok(videos.every(video => video.paused))
  monitor.update(100)
  assert.equal(diagnostics.channel, '2')
  assert.equal(diagnostics.channelPhase, 'static')
  monitor.setActive(true)
  monitor.update(0.1)
  assert.equal(diagnostics.channelPhase, 'static')
  monitor.update(0.05)
  await flush()
  assert.equal(diagnostics.channelPhase, 'video')
  videos[1].currentTime = 2.5
  monitor.update(0.03)
  monitor.setActive(false)
  monitor.update(100)
  monitor.setActive(true)
  await flush()
  assert.equal(videos[1].currentTime, 2.5)
  assert.equal(videos[1].paused, false)
})

test('failed media are skipped and all failures settle on a still no-signal state', t => {
  const { monitor, videos, diagnostics } = setup(t)
  monitor.setActive(true)
  videos[1].onerror?.()
  videos[0].onerror?.()
  assert.equal(diagnostics.channel, '3')
  videos[2].onerror?.()
  assert.equal(diagnostics.channel, '4')
  videos[3].onerror?.()
  assert.equal(diagnostics.channelPhase, 'unavailable')
  const version = monitor.texture.version
  monitor.update(100)
  assert.equal(monitor.texture.version, version)
  assert.ok(videos.every(video => video.paused))
})

test('a slow channel leaves static after 240ms and eventually skips after its stall timeout', t => {
  const { monitor, videos, diagnostics } = setup(t)
  videos.forEach(video => { video.readyState = 0 })
  monitor.setActive(true)
  videos[0].onerror?.()
  monitor.update(STATIC_SECONDS + 0.01)
  assert.equal(diagnostics.channelPhase, 'waiting')
  monitor.update(7)
  assert.equal(diagnostics.channel, '2')
  monitor.update(1)
  assert.equal(diagnostics.channel, '3')
})

test('audible playback rejection falls back to muted playback without skipping the clip', async t => {
  const harness = setup(t)
  const { monitor, videos, diagnostics } = harness
  await monitor.setSound(true)
  videos[0].nextPlay = Promise.reject(new DOMException('Gesture required', 'NotAllowedError'))
  monitor.setActive(true)
  await flush()
  assert.equal(harness.blocked, 1)
  assert.ok(videos.every(video => video.muted))
  monitor.update(0.03)
  await flush()
  assert.equal(videos[0].paused, false)
  assert.equal(diagnostics.channel, '1')
})

test('audio starts only after opt-in, static has a scheduled end, and pause immediately stops it', async t => {
  const { monitor, videos, audioContexts } = setup(t)
  assert.equal(audioContexts.length, 0)
  assert.ok(videos.every(video => video.muted))
  monitor.setActive(true)
  await flush()
  monitor.update(0.03)
  await monitor.setSound(true)
  assert.equal(videos[0].muted, false)
  videos[0].finish()
  const context = audioContexts[0]
  assert.equal(context.sources.length, 1)
  const source = context.sources[0]
  assert.equal(source.startCalls, 1)
  assert.deepEqual(source.stopTimes, [context.currentTime + STATIC_SECONDS])
  monitor.setActive(false)
  assert.deepEqual(source.stopTimes, [context.currentTime + STATIC_SECONDS, undefined])
  await monitor.setSound(false)
  assert.ok(videos.every(video => video.muted))
})

test('a pending audio unlock cannot override a newer mute request', async t => {
  const { monitor, videos, diagnostics } = setup(t)
  const unlock = monitor.setSound(true)
  await monitor.setSound(false)
  await unlock
  assert.equal(diagnostics.tvSound, 'off')
  assert.ok(videos.every(video => video.muted))
})

test('dispose cancels pending play and releases video sources, handlers, audio, and texture', async t => {
  const { monitor, videos, audioContexts } = setup(t)
  let resolvePlay!: () => void
  videos[0].nextPlay = new Promise<void>(resolve => { resolvePlay = resolve })
  let textureDisposals = 0
  monitor.texture.addEventListener('dispose', () => textureDisposals++)
  await monitor.setSound(true)
  monitor.setActive(true)
  monitor.dispose()
  resolvePlay()
  await flush()
  assert.ok(videos.every(video => video.paused && video.src === '' && !video.onended && !video.onerror))
  assert.equal(audioContexts[0].state, 'closed')
  assert.equal(textureDisposals, 1)
  monitor.setActive(true)
  monitor.update(100)
  assert.ok(videos.every(video => video.paused))
})

test('pause prevents late play promises from reviving hidden or reduced-motion media', async t => {
  const { monitor, videos } = setup(t)
  let resolvePlay!: () => void
  videos[0].nextPlay = new Promise<void>(resolve => { resolvePlay = resolve })
  monitor.setActive(true)
  monitor.setActive(false)
  resolvePlay()
  await flush()
  assert.ok(videos.every(video => video.paused))
})

test('late completion from a failed channel cannot start it over the next channel', async t => {
  const { monitor, videos, diagnostics } = setup(t)
  let resolvePlay!: () => void
  videos[0].nextPlay = new Promise<void>(resolve => { resolvePlay = resolve })
  monitor.setActive(true)
  videos[0].onerror?.()
  monitor.update(0.25)
  await flush()
  resolvePlay()
  await flush()
  assert.equal(diagnostics.channel, '2')
  assert.equal(videos[0].paused, true)
  assert.equal(videos[1].paused, false)
})

test('unsupported playback is skipped, while an aborted play can retry the same clip', async t => {
  const { monitor, videos, diagnostics } = setup(t)
  videos[0].nextPlay = Promise.reject(new DOMException('Aborted by media load', 'AbortError'))
  monitor.setActive(true)
  await flush()
  assert.equal(diagnostics.channel, '1')
  videos[0].nextPlay = Promise.reject(new DOMException('Cannot decode source', 'NotSupportedError'))
  monitor.update(0.03)
  await flush()
  assert.equal(diagnostics.channel, '2')
  assert.equal(diagnostics.channelPhase, 'static')
  monitor.update(0.25)
  await flush()
  assert.equal(videos[1].paused, false)
})

test('an ended clip advances even when its ended event was missed or delayed', async t => {
  const { monitor, videos, diagnostics } = setup(t)
  monitor.setActive(true)
  await flush()
  monitor.update(0.03)
  videos[0].currentTime = 12
  videos[0].ended = true
  videos[0].paused = true
  monitor.update(0.03)
  assert.equal(diagnostics.channel, '2')
  assert.equal(diagnostics.channelPhase, 'static')
  videos[0].onended?.()
  assert.equal(diagnostics.channel, '2', 'A delayed ended event must not advance twice.')
})

test('Chrome final-frame stalls advance at duration even when ended remains false', async t => {
  const { monitor, videos, diagnostics } = setup(t)
  videos.forEach((video, index) => { video.duration = index % 2 === 0 ? 12 : 10 })
  monitor.setActive(true)
  await flush()
  monitor.update(0.03)
  for (let index = 0; index < 4; index++) {
    const video = videos[index]
    video.currentTime = video.duration
    video.ended = false
    video.readyState = 2
    monitor.update(0.03)
    assert.equal(diagnostics.channel, String((index + 1) % 4 + 1))
    assert.equal(diagnostics.channelPhase, 'static')
    monitor.update(0.25)
    await flush()
    assert.equal(diagnostics.channelPhase, 'video')
  }
  assert.equal(diagnostics.channel, '1', 'Completed channels remain playable on the next cycle.')
  assert.equal(videos[0].paused, false)
})
