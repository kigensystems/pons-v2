import { useEffect, useRef, useState } from 'react'
import {
  ACESFilmicToneMapping,
  Box3,
  CanvasTexture,
  Color,
  DirectionalLight,
  Group,
  HemisphereLight,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  PlaneGeometry,
  RenderPipeline,
  Raycaster,
  Scene,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGPURenderer,
} from 'three/webgpu'
import type { Material, Texture } from 'three/webgpu'
import { pass, vec4 } from 'three/tsl'
import { bloom } from 'three/addons/tsl/display/BloomNode.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { fitCameraToPoints, getScreenFrame } from './sceneFraming'

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

type ViewState = { yaw: number; pitch: number; focused: boolean }
type SceneAction = { type: 'rotate'; yaw: number; pitch: number } | { type: 'focus' } | { type: 'reset' }
const TURN_LIMIT = Math.PI / 5
const TILT_LIMIT = Math.PI / 15

export default function MacintoshScene({ active, onToggleAtmosphere }: { active: boolean; onToggleAtmosphere: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const activeRef = useRef(active)
  const toggleAtmosphereRef = useRef(onToggleAtmosphere)
  const controllerRef = useRef<((playing: boolean) => void) | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [view, setView] = useState<ViewState>({ yaw: 0, pitch: 0, focused: false })

  useEffect(() => {
    activeRef.current = active
    toggleAtmosphereRef.current = onToggleAtmosphere
    controllerRef.current?.(active)
  }, [active, onToggleAtmosphere])

  useEffect(() => {
    let cancelled = false
    let cleanup = () => {}

    async function initialize() {
      // Let StrictMode clean up its first effect before claiming the canvas.
      await Promise.resolve()
      const canvas = canvasRef.current
      if (cancelled || !canvas) return

      const forceWebGL = new URLSearchParams(location.search).get('renderer') === 'webgl'
      const renderer = new WebGPURenderer({ canvas, alpha: true, antialias: true, forceWebGL })
      const scene = new Scene()
      const camera = new PerspectiveCamera(35.5, 1.5, 0.05, 60)
      const baseCamera = new Vector3(2.7, 2.45, 5.3)
      const lookAt = new Vector3(0, 0.86, 0)
      const overviewNormal = new Vector3()
      const baseYaw = Math.atan2(2.5, 5.8)
      const baseElevation = Math.atan2(1.35, Math.hypot(2.5, 5.8))
      const worldUp = new Vector3(0, 1, 0)
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
      let dirty = true
      let viewDirty = false
      let resizeObserver: ResizeObserver | undefined
      let pipeline: RenderPipeline | undefined
      let disposePost = () => {}
      let disposeEnvironment = () => {}
      let ready = false
      let cleaned = false
      let initialized = false
      let measurementStart = 0
      let measuredFrames = 0
      let totalFrames = 0
      const pointer = { x: 0, y: 0 }
      const currentView: ViewState = { yaw: 0, pitch: 0, focused: false }
      let screenMaterial: MeshStandardMaterial | undefined
      let stage: Group | undefined
      let screenMesh: Mesh | undefined
      let overviewPoints: Vector3[] = []
      const raycaster = new Raycaster()
      let drag: { id: number; x: number; y: number; yaw: number; pitch: number; moved: boolean; screen: boolean; focused: boolean } | null = null

      const cancelDrag = () => {
        const id = drag?.id
        drag = null
        if (id !== undefined && canvas.hasPointerCapture(id)) canvas.releasePointerCapture(id)
        canvas.style.cursor = currentView.focused ? 'zoom-out' : 'grab'
      }

      const fitView = () => {
        if (!stage || !screenMesh) return
        stage.updateWorldMatrix(true, true)
        const screen = getScreenFrame(screenMesh)
        const yaw = baseYaw + currentView.yaw
        const elevation = baseElevation + currentView.pitch
        overviewNormal.set(Math.sin(yaw) * Math.cos(elevation), Math.sin(elevation), Math.cos(yaw) * Math.cos(elevation))
        const fitted = currentView.focused
          ? fitCameraToPoints(screen.points, screen.center, screen.normal, screen.up, camera.fov, camera.aspect, 0.46)
          : fitCameraToPoints(overviewPoints, stage.position, overviewNormal, worldUp, camera.fov, camera.aspect, 0.96)
        baseCamera.copy(fitted.position)
        lookAt.copy(fitted.target)
        camera.position.copy(baseCamera)
        camera.up.copy(fitted.up)
        camera.lookAt(lookAt)
        camera.updateMatrixWorld()
        if (import.meta.env.DEV) {
          canvas.dataset.view = currentView.focused ? 'monitor' : 'computer'
          canvas.dataset.rotation = JSON.stringify([currentView.yaw, currentView.pitch])
          canvas.dataset.modelMatrix = JSON.stringify(stage.matrixWorld.elements)
          canvas.dataset.camera = JSON.stringify(camera.position.toArray())
          canvas.dataset.screenBounds = JSON.stringify(screen.points.map((p) => p.clone().project(camera).toArray()))
        }
      }

      const fail = (error: unknown) => {
        cleanup()
        if (!cancelled) {
          console.error('Macintosh scene could not render:', error)
          setState('error')
        }
      }

      const draw = (timestamp: number) => {
        try {
          pipeline!.render()
          dirty = false
          totalFrames++
          if (import.meta.env.DEV) {
            canvas.dataset.frames = String(totalFrames)
            if (activeRef.current) {
              measuredFrames++
              if (timestamp - measurementStart >= 2000) {
                canvas.dataset.fps = (measuredFrames * 1000 / (timestamp - measurementStart)).toFixed(1)
                measurementStart = timestamp
                measuredFrames = 0
              }
            }
          }
        } catch (error) { fail(error) }
      }

      const renderFrame = (timestamp: number) => {
        frame = 0
        if (cancelled || cleaned || document.hidden) return
        // Both ambient and direct input draws share the same 30-fps ceiling.
        if (timestamp - lastFrame >= 1000 / 30 && (activeRef.current || dirty)) {
          if (viewDirty) { fitView(); viewDirty = false }
          if (activeRef.current) {
            ambientTime += Math.min((timestamp - lastTimestamp) / 1000, 0.05)
            lastTimestamp = timestamp
            if (!currentView.focused && !drag) {
              camera.position.x += (baseCamera.x + pointer.x * 0.1 - camera.position.x) * 0.08
              camera.position.y += (baseCamera.y - pointer.y * 0.06 - camera.position.y) * 0.08
              camera.lookAt(lookAt)
            }
            if (screenMaterial) screenMaterial.emissiveIntensity = 1.15 + Math.sin(ambientTime * 0.8) * 0.025
          }
          lastFrame = timestamp - ((timestamp - lastFrame) % (1000 / 30))
          draw(timestamp)
        }
        if (!cleaned && (activeRef.current || dirty)) frame = requestAnimationFrame(renderFrame)
      }

      const invalidate = () => {
        dirty = true
        if (ready && !cleaned && !document.hidden && !frame) frame = requestAnimationFrame(renderFrame)
      }

      const resize = () => {
        const width = canvas.parentElement!.clientWidth
        const height = canvas.parentElement!.clientHeight
        if (width < 1 || height < 1) return
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth <= 540 ? 1.25 : 1.5, 4096 / Math.max(width, height)))
        renderer.setSize(width, height, false)
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        fitView()
        if (import.meta.env.DEV) canvas.dataset.pixelRatio = String(renderer.getPixelRatio())
        invalidate()
      }

      const syncView = () => {
        if (!stage) return
        viewDirty = true
        setView({ ...currentView })
        invalidate()
      }

      const act = (action: SceneAction) => {
        if (!ready || cleaned) return
        if (action.type === 'rotate') {
          if (currentView.focused) return
          currentView.yaw = MathUtils.clamp(currentView.yaw + action.yaw, -TURN_LIMIT, TURN_LIMIT)
          currentView.pitch = MathUtils.clamp(currentView.pitch + action.pitch, -TILT_LIMIT, TILT_LIMIT)
        } else if (action.type === 'focus') {
          cancelDrag()
          currentView.focused = !currentView.focused
        } else {
          cancelDrag()
          currentView.yaw = 0
          currentView.pitch = 0
          currentView.focused = false
          pointer.x = pointer.y = 0
        }
        // Deliberate actions render even when the atmosphere is paused. Camera
        // changes are immediate, including for reduced motion; no idle loop.
        syncView()
      }

      const hitTest = (event: PointerEvent) => {
        if (!stage) return undefined
        const rect = canvas.getBoundingClientRect()
        camera.updateMatrixWorld()
        raycaster.setFromCamera(new Vector2((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1), camera)
        return raycaster.intersectObject(stage, true)[0]?.object
      }
      const pointerDown = (event: PointerEvent) => {
        if (!ready || drag || !event.isPrimary || event.button !== 0) return
        canvas.dataset.input = 'pointer'
        canvas.focus({ preventScroll: true })
        const hit = hitTest(event)
        drag = { id: event.pointerId, x: event.clientX, y: event.clientY, yaw: currentView.yaw, pitch: currentView.pitch, moved: false, screen: hit === screenMesh, focused: currentView.focused }
        canvas.setPointerCapture(event.pointerId)
        canvas.style.cursor = 'grabbing'
      }
      const pointerMove = (event: PointerEvent) => {
        if (!ready || cleaned) return
        if (drag?.id === event.pointerId) {
          const dx = event.clientX - drag.x
          const dy = event.clientY - drag.y
          if (Math.hypot(dx, dy) > 5) drag.moved = true
          if (drag.moved && !currentView.focused) {
            currentView.yaw = MathUtils.clamp(drag.yaw - dx * 0.005, -TURN_LIMIT, TURN_LIMIT)
            currentView.pitch = MathUtils.clamp(drag.pitch + dy * 0.003, -TILT_LIMIT, TILT_LIMIT)
            syncView()
          }
        } else {
          const hit = hitTest(event)
          canvas.style.cursor = currentView.focused ? 'zoom-out' : hit === screenMesh ? 'zoom-in' : 'grab'
        }
      }
      const pointerUp = (event: PointerEvent) => {
        if (drag?.id !== event.pointerId) return
        const selectScreen = !drag.moved && (drag.focused || (drag.screen && hitTest(event) === screenMesh))
        cancelDrag()
        if (selectScreen) act({ type: 'focus' })
      }
      const resetView = () => act({ type: 'reset' })
      const moveAtmospherePointer = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse' || !activeRef.current || currentView.focused || drag) return
        pointer.x = event.clientX / window.innerWidth - 0.5
        pointer.y = event.clientY / window.innerHeight - 0.5
      }
      const keyDown = (event: KeyboardEvent) => {
        canvas.dataset.input = 'keyboard'
        const rotation: Record<string, [number, number]> = {
          ArrowLeft: [-Math.PI / 18, 0], ArrowRight: [Math.PI / 18, 0],
          ArrowUp: [0, Math.PI / 36], ArrowDown: [0, -Math.PI / 36],
        }
        if (rotation[event.key]) {
          event.preventDefault()
          const [yaw, pitch] = rotation[event.key]
          act({ type: 'rotate', yaw, pitch })
        } else if (event.key === 'Enter') {
          event.preventDefault(); act({ type: 'focus' })
        } else if (event.key === 'Escape' || event.key === 'Home') {
          event.preventDefault(); act({ type: 'reset' })
        } else if (event.code === 'Space') {
          event.preventDefault()
          if (!event.repeat) toggleAtmosphereRef.current()
        }
      }
      // Clear pointer modality on exit so Tab re-entry can show keyboard focus.
      const clearInputModality = () => { delete canvas.dataset.input }
      const visibilityChanged = () => {
        if (document.hidden) { cancelDrag(); cancelAnimationFrame(frame); frame = 0 }
        else { lastTimestamp = performance.now(); invalidate() }
      }

      cleanup = () => {
        if (cleaned) return
        cleaned = true
        ready = false
        cancelAnimationFrame(frame)
        resizeObserver?.disconnect()
        window.removeEventListener('pointermove', moveAtmospherePointer)
        document.removeEventListener('visibilitychange', visibilityChanged)
        canvas.removeEventListener('pointerdown', pointerDown)
        canvas.removeEventListener('pointermove', pointerMove)
        canvas.removeEventListener('pointerup', pointerUp)
        canvas.removeEventListener('pointercancel', cancelDrag)
        canvas.removeEventListener('lostpointercapture', cancelDrag)
        canvas.removeEventListener('keydown', keyDown)
        canvas.removeEventListener('blur', clearInputModality)
        canvas.removeEventListener('dblclick', resetView)
        cancelDrag()
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
        renderer.onDeviceLost = () => { if (!cancelled && !cleaned) fail(new Error('Graphics device lost')) }
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
        model.position.copy(center).negate()
        stage = new Group()
        stage.scale.setScalar(2.25 / size.y)
        stage.position.y = 1.125
        stage.add(model)
        scene.add(stage)
        // Fit the actual assembly, avoiding the empty upper corners of a box
        // that also spans the keyboard and cables. Refit only on input/resize.
        stage.updateWorldMatrix(true, true)
        model.traverse((object) => {
          if (!(object instanceof Mesh)) return
          const positions = object.geometry.getAttribute('position')
          for (let i = 0; i < positions.count; i++) overviewPoints.push(new Vector3().fromBufferAttribute(positions, i).applyMatrix4(object.matrixWorld))
        })
        await document.fonts.ready
        if (cancelled || cleaned) { cleanup(); return }
        const screenTexture = makeScreenTexture()
        model.traverse((object) => {
          if (!(object instanceof Mesh)) return
          object.castShadow = true
          object.receiveShadow = true
          if (object.name === 'Screen') {
            screenMesh = object
            // Content drives emission only; dark glass and its coat reflect
            // the softboxes independently, within the same model draw.
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
              material.color.set('#fff5e7')
              material.roughness = 0.82
              material.metalness = 0.25
            }
          }
        })
        if (!screenMesh) { screenTexture.dispose(); throw new Error('The model has no Screen mesh') }
        fitView()
        const scenePass = pass(scene, camera)
        const color = scenePass.getTextureNode('output')
        const glow = bloom(color, 0.34, 0.5, 0.95)
        glow.setResolutionScale(0.35)
        pipeline = new RenderPipeline(renderer)
        pipeline.outputNode = vec4(color.rgb.add(glow.rgb), color.a.max(glow.r.mul(0.3)))
        disposePost = () => { pipeline?.dispose(); glow.dispose(); scenePass.dispose() }
        ready = true
        canvas.dataset.model = 'macintosh-512k'
        setState('ready')
        setView({ ...currentView })
        resizeObserver = new ResizeObserver(resize)
        resizeObserver.observe(canvas.parentElement!)
        window.addEventListener('pointermove', moveAtmospherePointer, { passive: true })
        document.addEventListener('visibilitychange', visibilityChanged)
        canvas.addEventListener('pointerdown', pointerDown)
        canvas.addEventListener('pointermove', pointerMove)
        canvas.addEventListener('pointerup', pointerUp)
        canvas.addEventListener('pointercancel', cancelDrag)
        canvas.addEventListener('lostpointercapture', cancelDrag)
        canvas.addEventListener('keydown', keyDown)
        canvas.addEventListener('blur', clearInputModality)
        canvas.addEventListener('dblclick', resetView)
        controllerRef.current = (playing) => {
          cancelAnimationFrame(frame)
          frame = 0
          canvas.dataset.motion = playing ? 'playing' : 'paused'
          lastTimestamp = measurementStart = performance.now()
          measuredFrames = 0
          if (playing || dirty) invalidate()
        }
        controllerRef.current(activeRef.current)
      } catch (error) { fail(error) }
    }

    void initialize()
    return () => { cancelled = true; cleanup() }
  }, [])

  return (
    <div className="live-macintosh" data-state={state} data-view={view.focused ? 'monitor' : 'computer'}>
      <div className="scene-viewport">
        {state !== 'ready' && <img className="macintosh scene-fallback" src="/images/macintosh-render.png" alt="Classic Macintosh with keyboard and mouse" width="1536" height="1024" />}
        <canvas ref={canvasRef} className="macintosh-canvas" role="group" tabIndex={state === 'ready' ? 0 : -1} aria-hidden={state !== 'ready'} aria-label="Explore the Macintosh in 3D" aria-describedby="computer-help" />
        {state === 'loading' && <span className="model-status" role="status">Loading the Macintosh…</span>}
        {state === 'error' && <div className="model-status"><p role="status">Showing the still preview. The 3D scene could not load.</p><button className="motion-button" type="button" onClick={() => location.reload()}>Reload 3D scene</button></div>}
      </div>
      <p id="computer-help" className="sr-only">Drag or use arrow keys to move your viewpoint around the stationary computer. Select the monitor or press Enter to focus; select again to return. Double-click, Escape, or Home resets the view. Space pauses or resumes the atmosphere.</p>
      {state === 'ready' && <span className="sr-only" role="status">{view.focused ? 'Monitor view. Select again to return.' : 'Computer view.'} Atmosphere {active ? 'playing' : 'paused'}.</span>}
    </div>
  )
}
