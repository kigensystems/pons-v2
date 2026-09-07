import { useEffect, useRef, useState } from 'react'
import {
  ACESFilmicToneMapping,
  Box3,
  CanvasTexture,
  Color,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  PlaneGeometry,
  RenderPipeline,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGPURenderer,
} from 'three/webgpu'
import type { Material, Texture } from 'three/webgpu'
import { pass, vec4 } from 'three/tsl'
import { bloom } from 'three/addons/tsl/display/BloomNode.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

// Baked once at startup: broad studio reflections without extra per-frame lights.
function makeStudioEnvironment() {
  const studio = new Scene()
  studio.background = new Color('#17151e')
  const softbox = (position: Vector3, width: number, height: number, color: string, intensity: number) => {
    const panel = new Mesh(new PlaneGeometry(width, height), new MeshBasicMaterial({
      color: new Color(color).multiplyScalar(intensity),
    }))
    panel.position.copy(position)
    panel.lookAt(0, 1, 0)
    studio.add(panel)
  }
  softbox(new Vector3(-3.8, 4, 5), 4, 5, '#fff0d9', 5)
  softbox(new Vector3(-3, 1.6, 6), 2.4, 2.8, '#e9edff', 6)
  softbox(new Vector3(4, 2.5, -2), 3, 5, '#b5a7ff', 3.5)
  softbox(new Vector3(0, 6, 0), 4, 3, '#fff2e2', 2)
  return studio
}

function makeScreenTexture() {
  const screen = document.createElement('canvas')
  screen.width = 768
  screen.height = 576
  const ctx = screen.getContext('2d')!
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, 768, 576)
  const light = ctx.createRadialGradient(384, 280, 60, 384, 280, 430)
  light.addColorStop(0, '#102724')
  light.addColorStop(1, '#000000')
  ctx.fillStyle = light
  ctx.fillRect(0, 0, 768, 576)
  ctx.strokeStyle = '#bbe4ce'
  ctx.lineWidth = 3
  ctx.strokeRect(359, 122, 50, 60)
  ctx.strokeRect(365, 128, 38, 36)
  ctx.beginPath()
  ctx.moveTo(375, 138); ctx.lineTo(375, 144)
  ctx.moveTo(393, 138); ctx.lineTo(393, 144)
  ctx.moveTo(374, 151); ctx.lineTo(379, 156); ctx.lineTo(389, 156); ctx.lineTo(394, 151)
  ctx.moveTo(366, 174); ctx.lineTo(372, 174)
  ctx.moveTo(390, 174); ctx.lineTo(402, 174)
  ctx.stroke()
  ctx.shadowColor = '#b8ffe4'
  ctx.shadowBlur = 12
  ctx.fillStyle = '#d6f6df'
  ctx.textAlign = 'center'
  ctx.font = 'italic 132px "Instrument Serif", Georgia, serif'
  ctx.fillText('hello.', 384, 332)
  ctx.shadowBlur = 4
  ctx.font = '16px "Courier New", monospace'
  ctx.fillText('a new beginning_', 384, 408)
  ctx.shadowBlur = 0
  ctx.fillStyle = '#06181522'
  for (let y = 0; y < 576; y += 3) ctx.fillRect(0, y, 768, 1)
  const texture = new CanvasTexture(screen)
  texture.colorSpace = SRGBColorSpace
  texture.flipY = false
  return texture
}

function disposeObject(object: Group | Scene) {
  const materials = new Set<Material>()
  const textures = new Set<Texture>()
  object.traverse((child) => {
    if (!(child instanceof Mesh)) return
    child.geometry.dispose()
    for (const material of Array.isArray(child.material) ? child.material : [child.material]) {
      materials.add(material)
      for (const value of Object.values(material)) {
        if (value && typeof value === 'object' && 'isTexture' in value) textures.add(value as Texture)
      }
    }
  })
  textures.forEach((texture) => texture.dispose())
  materials.forEach((material) => material.dispose())
}

export default function MacintoshScene({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const activeRef = useRef(active)
  const controllerRef = useRef<((playing: boolean) => void) | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    activeRef.current = active
    controllerRef.current?.(active)
  }, [active])

  useEffect(() => {
    let cancelled = false
    let cleanup = () => {}

    async function initialize() {
      // Let StrictMode's initial effect cleanup run before claiming the canvas.
      await Promise.resolve()
      const canvas = canvasRef.current
      if (cancelled || !canvas) return

      const forceWebGL = import.meta.env.DEV && new URLSearchParams(location.search).get('renderer') === 'webgl'
      const renderer = new WebGPURenderer({ canvas, alpha: true, antialias: true, forceWebGL })
      const scene = new Scene()
      const camera = new PerspectiveCamera(35.5, 1.5, 0.1, 60)
      const baseCamera = new Vector3(2.7, 2.45, 5.3)
      const lookAt = new Vector3(0, 0.86, 0)
      camera.position.copy(baseCamera)
      camera.lookAt(lookAt)
      renderer.setClearColor(0x000000, 0)
      renderer.toneMapping = ACESFilmicToneMapping
      renderer.toneMappingExposure = 0.95
      renderer.shadowMap.enabled = true
      let frame = 0
      let lastFrame = 0
      let ambientTime = 0
      let lastTimestamp = 0
      let resizeObserver: ResizeObserver | undefined
      let pipeline: RenderPipeline | undefined
      let disposePost = () => {}
      let disposeEnvironment = () => {}
      let ready = false
      let cleaned = false
      let initialized = false
      let measurementStart = 0
      let measuredFrames = 0
      const pointer = { x: 0, y: 0 }
      let screenMaterial: MeshStandardMaterial | undefined

      const resize = () => {
        const width = canvas.parentElement!.clientWidth
        const height = canvas.parentElement!.clientHeight
        if (width < 1 || height < 1) return
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth <= 540 ? 1.25 : 1.5, 4096 / Math.max(width, height)))
        renderer.setSize(width, height, false)
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        if (ready && !activeRef.current) pipeline?.render()
      }

      const movePointer = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse' || !activeRef.current) return
        pointer.x = event.clientX / window.innerWidth - 0.5
        pointer.y = event.clientY / window.innerHeight - 0.5
      }

      const renderFrame = (timestamp: number) => {
        if (cancelled || !activeRef.current) return
        frame = requestAnimationFrame(renderFrame)
        // Ambient motion only: cap GPU work at 30 fps.
        if (timestamp - lastFrame < 1000 / 30) return
        ambientTime += Math.min((timestamp - lastTimestamp) / 1000, 0.05)
        lastTimestamp = timestamp
        lastFrame = timestamp - ((timestamp - lastFrame) % (1000 / 30))
        camera.position.x += (baseCamera.x + pointer.x * 0.16 - camera.position.x) * 0.045
        camera.position.y += (baseCamera.y - pointer.y * 0.09 - camera.position.y) * 0.045
        camera.lookAt(lookAt)
        if (screenMaterial) screenMaterial.emissiveIntensity = 1.15 + Math.sin(ambientTime * 0.8) * 0.025
        try {
          pipeline?.render()
          if (import.meta.env.DEV) {
            measuredFrames++
            if (timestamp - measurementStart >= 2000) {
              canvas.dataset.fps = (measuredFrames * 1000 / (timestamp - measurementStart)).toFixed(1)
              measurementStart = timestamp
              measuredFrames = 0
            }
          }
        } catch (error) {
          cancelAnimationFrame(frame)
          cleanup()
          console.error('Macintosh rendering stopped:', error)
          setState('error')
        }
      }

      cleanup = () => {
        if (cleaned) return
        cleaned = true
        cancelAnimationFrame(frame)
        resizeObserver?.disconnect()
        window.removeEventListener('pointermove', movePointer)
        controllerRef.current = null
        disposePost()
        disposeEnvironment()
        disposeObject(scene)
        if (initialized) renderer.dispose()
      }

      try {
        await renderer.init()
        initialized = true
        if (cancelled) { renderer.dispose(); return }
        renderer.onDeviceLost = () => {
          if (cancelled || cleaned) return
          ready = false
          cleanup()
          setState('error')
        }
        canvas.dataset.renderer = 'isWebGPUBackend' in renderer.backend ? 'webgpu' : 'webgl2'
        resize()

        const room = makeStudioEnvironment()
        const environmentGenerator = new PMREMGenerator(renderer)
        const environment = environmentGenerator.fromScene(room, 0.04, 0.1, 100, { size: 128 })
        scene.environment = environment.texture
        scene.environmentIntensity = 0.9
        disposeObject(room)
        environmentGenerator.dispose()
        disposeEnvironment = () => environment.dispose()

        const hemisphere = new HemisphereLight('#e0dcea', '#211923', 0.45)
        const warm = new DirectionalLight('#ffe7c5', 2.2)
        warm.position.set(-3.5, 5, 4)
        warm.castShadow = true
        warm.shadow.mapSize.set(1024, 1024)
        warm.shadow.camera.left = -4
        warm.shadow.camera.right = 4
        warm.shadow.camera.top = 4
        warm.shadow.camera.bottom = -4
        warm.shadow.normalBias = 0.025
        const rim = new DirectionalLight('#b7b0ff', 1.8)
        rim.position.set(4, 3, -3)
        scene.add(hemisphere, warm, rim)

        const gltf = await new GLTFLoader().loadAsync('/models/macintosh-512k.glb')
        if (cancelled || cleaned) { disposeObject(gltf.scene); cleanup(); return }
        const model = gltf.scene
        const box = new Box3().setFromObject(model)
        const center = box.getCenter(new Vector3())
        const size = box.getSize(new Vector3())
        model.position.set(-center.x, -box.min.y, -center.z)
        const stage = new Group()
        stage.scale.setScalar(2.25 / size.y)
        stage.add(model)
        scene.add(stage)
        await document.fonts.ready
        if (cancelled || cleaned) { cleanup(); return }
        const screenTexture = makeScreenTexture()
        model.traverse((object) => {
          if (!(object instanceof Mesh)) return
          object.castShadow = true
          object.receiveShadow = true
          if (object.name === 'Screen') {
            // The content drives emission only. Dark glass and its coat reflect
            // the softboxes independently; no glowing diffuse screen texture.
            screenMaterial = new MeshPhysicalMaterial({
              color: new Color('#080e12'),
              emissive: new Color('#c7ead9'),
              emissiveMap: screenTexture,
              emissiveIntensity: 1.15,
              roughness: 0.14,
              metalness: 0,
              clearcoat: 0.25,
              clearcoatRoughness: 0.12,
              envMapIntensity: 2,
            })
            const oldMaterials = Array.isArray(object.material) ? object.material : [object.material]
            oldMaterials.forEach((material) => material.dispose())
            object.material = screenMaterial
            object.castShadow = false
          } else {
            for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
              if (!(material instanceof MeshStandardMaterial)) continue
              // Preserve the purchased color, normal, and packed detail maps.
              material.color.set('#fff5e7')
              material.roughness = 0.82
              material.metalness = 0.25
            }
          }
        })
        const scenePass = pass(scene, camera)
        const color = scenePass.getTextureNode('output')
        const glow = bloom(color, 0.34, 0.5, 0.95)
        glow.setResolutionScale(0.35)
        pipeline = new RenderPipeline(renderer)
        pipeline.outputNode = vec4(color.rgb.add(glow.rgb), color.a.max(glow.r.mul(0.3)))
        disposePost = () => { pipeline?.dispose(); glow.dispose(); scenePass.dispose() }
        pipeline.render()
        ready = true
        canvas.dataset.model = 'macintosh-512k'
        setState('ready')
        resizeObserver = new ResizeObserver(resize)
        resizeObserver.observe(canvas.parentElement!)
        window.addEventListener('pointermove', movePointer, { passive: true })
        controllerRef.current = (playing) => {
          cancelAnimationFrame(frame)
          canvas.dataset.motion = playing ? 'playing' : 'paused'
          if (playing) {
            lastTimestamp = performance.now()
            measurementStart = lastTimestamp
            measuredFrames = 0
            frame = requestAnimationFrame(renderFrame)
          }
        }
        controllerRef.current(activeRef.current)
      } catch (error) {
        cleanup()
        if (!cancelled) {
          console.error('Macintosh scene could not start:', error)
          setState('error')
        }
      }
    }

    void initialize()
    return () => { cancelled = true; cleanup() }
  }, [])

  return (
    <div className="live-macintosh" data-state={state}>
      {state !== 'ready' && <img className="macintosh scene-fallback" src="/images/macintosh-render.png" alt="Classic Macintosh with keyboard and mouse" width="1536" height="1024" />}
      <canvas ref={canvasRef} className="macintosh-canvas" role="img" aria-hidden={state !== 'ready'} aria-label="A real 3D Macintosh 512K, with a glowing screen, keyboard and mouse" />
      {state === 'loading' && <span className="model-status" role="status">Loading the Macintosh…</span>}
      {state === 'error' && <span className="model-status" role="status">Showing the still preview. Refresh to retry 3D.</span>}
    </div>
  )
}
