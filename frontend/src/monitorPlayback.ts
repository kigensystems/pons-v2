// Play order is the user's priority, not file order: channel 4 opens, then 2, 3, 1.
export const CHANNEL_URLS = [4, 2, 3, 1].map((channel) => `/videos/channels/channel-0${channel}.mp4`)
export const STATIC_SECONDS = 0.24
const STALL_SECONDS = 8

/** Renderer-independent CRT playback, optionally drawn directly into a DOM canvas. */
export function createMonitorPlayback(invalidate: () => void, soundBlocked: () => void, diagnostics?: HTMLElement, surface = document.createElement('canvas')) {
  surface.width = 640
  surface.height = 480
  const ctx = surface.getContext('2d')!
  let frameVersion = 0
  const snow = document.createElement('canvas')
  snow.width = 160
  snow.height = 120
  const snowContext = snow.getContext('2d')!
  const noise = snowContext.createImageData(160, 120)
  const edge = ctx.createRadialGradient(320, 240, 150, 320, 240, 400)
  edge.addColorStop(0, '#00000000')
  edge.addColorStop(1, '#000000a0')
  let disposed = false
  let active = false
  let audible = false
  let channel = 0
  let phase: 'waiting' | 'video' | 'static' | 'unavailable' = 'waiting'
  let elapsed = 0
  let stalled = 0
  let lastMediaTime = -1
  let starting = false
  let playAttempt = 0
  let audioAttempt = 0
  let audio: AudioContext | undefined
  let burst: AudioBufferSourceNode | undefined
  const failed = new Set<number>()
  // The only mark on the picture: a small 1-bit speaker in the corner, the Sound control panel's
  // icon, crossed while the sound is off, ringed with its waves for a moment once it comes on.
  // Sizes are screen pixels; `scale` converts them to canvas units so the glyph stays legible
  // however small the CRT is drawn.
  let scale = 0.4
  let wavesShownAt = -1
  let poster: HTMLImageElement | undefined
  const drawSpeaker = (u: number, kind: 'off' | 'on' | 'play', alpha: number) => {
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.translate(640 - 36 * u, 38 * u)
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    // Icons of the period were white with a black outline, which also reads on bright footage.
    const outline = (draw: () => void, fill: boolean) => {
      ctx.strokeStyle = '#0b0f0c'
      ctx.lineWidth = (fill ? 3.2 : 5) * u
      draw()
      ctx.stroke()
      ctx.strokeStyle = '#eef1e4'
      ctx.fillStyle = '#eef1e4'
      ctx.lineWidth = 1.8 * u
      draw()
      if (fill) ctx.fill()
      else ctx.stroke()
    }
    if (kind === 'play') {
      outline(() => { ctx.beginPath(); ctx.moveTo(-7 * u, -9 * u); ctx.lineTo(9 * u, 0); ctx.lineTo(-7 * u, 9 * u); ctx.closePath() }, true)
    } else {
      outline(() => { ctx.beginPath(); ctx.moveTo(-12 * u, -4 * u); ctx.lineTo(-7 * u, -4 * u); ctx.lineTo(-1 * u, -10 * u); ctx.lineTo(-1 * u, 10 * u); ctx.lineTo(-7 * u, 4 * u); ctx.lineTo(-12 * u, 4 * u); ctx.closePath() }, true)
      if (kind === 'off') outline(() => { ctx.beginPath(); ctx.moveTo(4 * u, -4.5 * u); ctx.lineTo(12 * u, 4.5 * u); ctx.moveTo(12 * u, -4.5 * u); ctx.lineTo(4 * u, 4.5 * u) }, false)
      else outline(() => { ctx.beginPath(); ctx.arc(0, 0, 6 * u, -0.85, 0.85); ctx.moveTo(10.5 * u, -8 * u); ctx.arc(0, 0, 10.5 * u, -0.85, 0.85) }, false)
    }
    ctx.restore()
  }
  const drawOsd = () => {
    const u = Math.min(1 / scale, 4)
    if (!active) drawSpeaker(u, 'play', 1)
    else if (!audible) drawSpeaker(u, 'off', 1)
    else if (wavesShownAt >= 0) {
      const age = Date.now() - wavesShownAt
      if (age > 2400) { wavesShownAt = -1; return }
      drawSpeaker(u, 'on', Math.min(1, (2400 - age) / 600))
    }
  }
  const redrawStill = () => {
    if (disposed) return
    if (phase === 'video' && lastMediaTime >= 0) drawPicture(videos[channel], videos[channel].videoWidth, videos[channel].videoHeight)
    else if (phase === 'waiting' && lastMediaTime < 0 && poster) drawPicture(poster, poster.naturalWidth, poster.naturalHeight)
    else return
    invalidate()
  }

  const report = () => {
    if (!diagnostics) return
    diagnostics.dataset.channel = String(channel + 1)
    diagnostics.dataset.channelPhase = phase
    diagnostics.dataset.channelTime = videos[channel].currentTime.toFixed(2)
    diagnostics.dataset.tvSound = audible ? 'on' : 'off'
    diagnostics.dataset.tvAudioContext = audio?.state ?? 'uninitialized'
    diagnostics.dataset.channelMedia = JSON.stringify(videos.map((video, index) => ({ time: video.currentTime, duration: video.duration, paused: video.paused, ended: video.ended, seeking: video.seeking, ready: video.readyState, failed: failed.has(index), error: video.error?.message })))
  }
  const finishFrame = () => {
    ctx.fillStyle = '#00000020'
    for (let y = 0; y < 480; y += 3) ctx.fillRect(0, y, 640, 1)
    ctx.fillStyle = edge
    ctx.fillRect(0, 0, 640, 480)
    frameVersion++
  }
  const drawPicture = (image: CanvasImageSource, width: number, height: number) => {
    // Fill the CRT edge to edge; center-crop widescreen footage without
    // stretching faces. The poster uses the same framing as the live video.
    const cover = Math.max(640 / width, 480 / height)
    ctx.fillStyle = '#020504'
    ctx.fillRect(0, 0, 640, 480)
    ctx.drawImage(image, (640 - width * cover) / 2, (480 - height * cover) / 2, width * cover, height * cover)
    drawOsd()
    finishFrame()
  }
  const drawMessage = () => {
    ctx.fillStyle = '#040b09'
    ctx.fillRect(0, 0, 640, 480)
    ctx.fillStyle = '#c4dfcb'
    ctx.textAlign = 'center'
    ctx.font = '24px monospace'
    ctx.fillText('NO SIGNAL', 320, 244)
    finishFrame()
  }
  const stopBurst = () => {
    burst?.stop()
    burst?.disconnect()
    burst = undefined
  }
  const playStatic = () => {
    if (!audible || audio?.state !== 'running') return
    stopBurst()
    const count = Math.floor(audio.sampleRate * STATIC_SECONDS)
    const buffer = audio.createBuffer(1, count, audio.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < count; i++) data[i] = Math.random() * 2 - 1
    const source = audio.createBufferSource()
    const filter = audio.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 2300
    filter.Q.value = 0.65
    const gain = audio.createGain()
    const now = audio.currentTime
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.16, now + 0.012)
    gain.gain.setValueAtTime(0.16, now + STATIC_SECONDS - 0.04)
    gain.gain.linearRampToValueAtTime(0, now + STATIC_SECONDS)
    source.buffer = buffer
    source.connect(filter).connect(gain).connect(audio.destination)
    source.onended = () => {
      source.disconnect(); filter.disconnect(); gain.disconnect()
      if (burst === source) burst = undefined
    }
    burst = source
    source.start()
    source.stop(now + STATIC_SECONDS)
  }
  const advance = () => {
    videos[channel].pause()
    playAttempt++
    starting = false
    const next = Array.from({ length: videos.length }, (_, i) => (channel + i + 1) % videos.length).find((i) => !failed.has(i))
    if (next === undefined) {
      phase = 'unavailable'
      stopBurst()
      drawMessage()
    } else {
      channel = next
      videos[channel].currentTime = 0
      phase = 'static'
      elapsed = stalled = 0
      lastMediaTime = -1
      if (active) playStatic()
    }
    report()
    invalidate()
  }
  const videos = CHANNEL_URLS.map((url, index) => {
    const video = document.createElement('video')
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    video.volume = 0.55
    video.onended = () => { if (!disposed && index === channel && phase === 'video') advance() }
    video.onerror = () => {
      if (disposed) return
      failed.add(index)
      if (index === channel) advance()
    }
    video.src = url
    video.load()
    return video
  })
  drawMessage()
  const posterImage = new Image()
  posterImage.onload = () => {
    if (disposed) return
    poster = posterImage
    redrawStill()
  }
  posterImage.src = '/videos/channels/channel-poster.jpg'

  const startVideo = () => {
    if (starting || !active || disposed || phase === 'unavailable') return
    const video = videos[channel]
    video.muted = !audible
    const attempt = ++playAttempt
    starting = true
    void video.play().then(() => {
      if (disposed || !active || attempt !== playAttempt) {
        if (disposed || !active || video !== videos[channel]) video.pause()
        return
      }
      starting = false
    }).catch((error: unknown) => {
      if (disposed || attempt !== playAttempt) return
      starting = false
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        // Keep the visual loop available when an audible play is rejected.
        audible = false
        videos.forEach((item) => { item.muted = true })
        stopBurst()
        soundBlocked()
      } else if (!(error instanceof DOMException && error.name === 'AbortError')) {
        failed.add(channel)
        advance()
      }
    })
  }

  const updateFrame = (delta: number) => {
    if (!active || disposed || phase === 'unavailable') return
    elapsed += delta
    if (phase === 'static') {
      if (elapsed < STATIC_SECONDS) {
        for (let i = 0; i < noise.data.length; i += 4) {
          const value = 25 + Math.random() * 175
          noise.data[i] = noise.data[i + 1] = noise.data[i + 2] = value
          noise.data[i + 3] = 255
        }
        snowContext.putImageData(noise, 0, 0)
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(snow, 0, 0, 640, 480)
        ctx.imageSmoothingEnabled = true
        ctx.fillStyle = '#00000055'
        ctx.fillRect(0, (elapsed * 1900) % 480, 640, 28)
        finishFrame()
        report()
        return
      }
      phase = 'waiting'
      drawMessage() // A slow/broken clip never produces sustained flashing snow.
    }
    const video = videos[channel]
    // Some decoders retain HAVE_CURRENT_DATA at the final sample without
    // delivering `ended`. Reaching the media boundary is also completion.
    if (phase === 'video' && (video.ended || (Number.isFinite(video.duration) && video.duration > 0 && video.currentTime >= video.duration - 0.035))) {
      advance()
      return
    }
    if (video.readyState >= 2 && !video.seeking) {
      if (video.paused && !video.ended) startVideo()
      if (video.currentTime !== lastMediaTime) {
        lastMediaTime = video.currentTime
        stalled = 0
        phase = 'video'
        drawPicture(video, video.videoWidth, video.videoHeight)
      } else stalled += delta
    } else stalled += delta
    if (stalled >= STALL_SECONDS) { failed.add(channel); advance() }
    report()
  }

  return {
    surface,
    setActive(value: boolean) {
      active = value && !disposed
      if (!active) {
        playAttempt++
        starting = false
        videos.forEach((video) => video.pause())
        stopBurst()
      } else if (phase === 'video' || phase === 'waiting') startVideo()
      redrawStill()
      report()
    },
    setScale(value: number) {
      scale = value
      redrawStill()
    },
    async setSound(value: boolean) {
      const attempt = ++audioAttempt
      audible = false
      videos.forEach((video) => { video.muted = true })
      stopBurst()
      if (value && !disposed) {
        try {
          audio ??= new AudioContext()
          await audio.resume()
          if (disposed || attempt !== audioAttempt) return
          if (audio.state !== 'running') throw new Error('Audio is suspended')
          audible = true
          videos[channel].muted = false
          wavesShownAt = Date.now()
          if (phase === 'static' && elapsed < STATIC_SECONDS) playStatic()
        } catch {
          if (!disposed && attempt === audioAttempt) soundBlocked()
        }
      }
      redrawStill()
      report()
    },
    update(delta: number) {
      const previousFrame = frameVersion
      updateFrame(delta)
      return frameVersion !== previousFrame
    },
    dispose() {
      if (disposed) return
      disposed = true
      active = false
      playAttempt++
      audioAttempt++
      stopBurst()
      void audio?.close().catch(() => {})
      posterImage.onload = null
      videos.forEach((video) => {
        video.onended = video.onerror = null
        video.pause()
        video.removeAttribute('src')
        video.load()
      })
    },
  }
}
