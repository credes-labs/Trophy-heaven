import {
  CanvasTexture,
  CircleGeometry,
  Color,
  Fog,
  Group,
  LinearMipmapLinearFilter,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  SRGBColorSpace,
  TextureLoader,
  Vector3,
  WebGLRenderer,
  type Texture,
} from "three"

export type OrbitItem = { src: string }

type OrbitOptions = {
  items: readonly OrbitItem[]
  /** Seconds for one full revolution. */
  period: number
  background: string
  onReady: () => void
}

/** Source cutouts are 451×553; the object sits in the lower part of the frame. */
const CARD_ASPECT = 451 / 553
const CARD_HEIGHT = 1.6
const CARD_WIDTH = CARD_HEIGHT * CARD_ASPECT
const FOOT_INSET = CARD_HEIGHT * 0.04
const FOV = 28
const CAMERA_TILT = (11 * Math.PI) / 180

function shadowTexture() {
  const size = 128
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, "rgba(19,17,17,0.34)")
  g.addColorStop(0.45, "rgba(19,17,17,0.14)")
  g.addColorStop(1, "rgba(19,17,17,0)")
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

/**
 * Five photo cutouts on a tilted ring. Cards billboard toward the camera so a
 * flat photograph never shows edge-on; depth comes from perspective, sort
 * order, floor shadows, and fog into the footer paper.
 */
export function mountOrbit(container: HTMLElement, options: OrbitOptions) {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = SRGBColorSpace
  renderer.setClearColor(0x000000, 0)
  renderer.domElement.style.display = "block"
  renderer.domElement.style.width = "100%"
  renderer.domElement.style.height = "100%"
  container.appendChild(renderer.domElement)

  const scene = new Scene()
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 100)
  const ring = new Group()
  scene.add(ring)

  const anisotropy = renderer.capabilities.getMaxAnisotropy()
  const loader = new TextureLoader()
  const shadowMap = shadowTexture()
  const disposables: { dispose: () => void }[] = [shadowMap]

  const cardGeometry = new PlaneGeometry(CARD_WIDTH, CARD_HEIGHT)
  const shadowGeometry = new CircleGeometry(CARD_WIDTH * 0.42, 48)
  disposables.push(cardGeometry, shadowGeometry)

  const cards: { card: Mesh; shadow: Mesh; phase: number }[] = []
  let radius = 2.6

  const pending = options.items.map(
    (item) =>
      new Promise<Texture>((resolve, reject) => loader.load(item.src, resolve, undefined, reject))
  )

  options.items.forEach((_, index) => {
    const material = new MeshBasicMaterial({
      transparent: true,
      depthWrite: false,
      alphaTest: 0.01,
      opacity: 0,
    })
    const card = new Mesh(cardGeometry, material)
    card.position.y = CARD_HEIGHT / 2 - FOOT_INSET

    const shadow = new Mesh(
      shadowGeometry,
      new MeshBasicMaterial({ map: shadowMap, transparent: true, depthWrite: false, opacity: 0 })
    )
    shadow.rotation.x = -Math.PI / 2
    shadow.position.y = 0.002
    shadow.renderOrder = -1

    ring.add(card, shadow)
    disposables.push(material, shadow.material as MeshBasicMaterial)
    cards.push({ card, shadow, phase: (index / options.items.length) * Math.PI * 2 })
  })

  const fog = new Fog(new Color(options.background), 1, 100)
  scene.fog = fog

  const target = new Vector3(0, CARD_HEIGHT * 0.22, 0)

  function layout() {
    const width = container.clientWidth
    const height = container.clientHeight
    if (!width || !height) return
    const aspect = width / height
    const t = Math.tan((FOV * Math.PI) / 360)

    // Ring radius as a share of camera distance. Narrow frames pull the camera
    // back until the side cards clear the frame edge, so pieces never pile up.
    const halfWidth = t * aspect
    const k = Math.min(0.46, Math.max(0.16, 0.66 * halfWidth))
    const byHeight = CARD_HEIGHT / (1.4 * t * (1 - k))
    const byWidth = (CARD_WIDTH * 0.55) / Math.max(0.04, 0.94 * halfWidth - k)
    const distance = Math.max(byHeight, byWidth)
    radius = k * distance

    camera.aspect = aspect
    camera.position.set(0, target.y + Math.sin(CAMERA_TILT) * distance, Math.cos(CAMERA_TILT) * distance)
    camera.lookAt(target)
    camera.updateProjectionMatrix()

    // Back of the ring melts into the paper; the front stays crisp.
    fog.near = distance - radius * 0.2
    fog.far = distance + radius * 2.4

    renderer.setSize(width, height, false)
  }

  let angle = 0
  let last = performance.now()
  let running = false
  let frame = 0
  let revealed = 0

  function place(time: number) {
    cards.forEach(({ card, shadow, phase }, index) => {
      const a = angle + phase
      const x = Math.sin(a) * radius
      const z = Math.cos(a) * radius
      const bob = Math.sin(time * 0.0011 + index * 1.3) * 0.025

      card.position.set(x, CARD_HEIGHT / 2 - FOOT_INSET + bob, z)
      card.quaternion.copy(camera.quaternion)

      shadow.position.set(x, 0.002, z + CARD_WIDTH * 0.04)
      const lift = 1 - bob * 4
      shadow.scale.set(lift, lift * 0.62, lift)

      const cardMaterial = card.material as MeshBasicMaterial
      const shadowMaterial = shadow.material as MeshBasicMaterial
      cardMaterial.opacity = revealed
      shadowMaterial.opacity = revealed * (0.55 + 0.45 * ((z / radius + 1) / 2))
    })
  }

  function render(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    angle += (dt / options.period) * Math.PI * 2
    revealed = Math.min(1, revealed + dt * 2.2)
    place(now)
    renderer.render(scene, camera)
    if (running) frame = requestAnimationFrame(render)
  }

  layout()

  let disposed = false
  let ready = false
  let wanted = false
  Promise.all(pending)
    .then((textures) => {
      if (disposed) {
        textures.forEach((texture) => texture.dispose())
        return
      }
      textures.forEach((texture, index) => {
        texture.colorSpace = SRGBColorSpace
        texture.anisotropy = anisotropy
        texture.minFilter = LinearMipmapLinearFilter
        texture.generateMipmaps = true
        const material = cards[index]!.card.material as MeshBasicMaterial
        material.map = texture
        material.needsUpdate = true
        disposables.push(texture)
      })
      ready = true
      options.onReady()
      if (wanted) start()
    })
    .catch(() => {
      // Leave the static fallback in place.
    })

  const resize = new ResizeObserver(() => {
    layout()
    if (!running) renderer.render(scene, camera)
  })
  resize.observe(container)

  function start() {
    wanted = true
    if (running || disposed || !ready) return
    running = true
    last = performance.now()
    frame = requestAnimationFrame(render)
  }

  function stop() {
    wanted = false
    running = false
    cancelAnimationFrame(frame)
  }

  return {
    start,
    stop,
    dispose() {
      disposed = true
      stop()
      resize.disconnect()
      disposables.forEach((item) => item.dispose())
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
