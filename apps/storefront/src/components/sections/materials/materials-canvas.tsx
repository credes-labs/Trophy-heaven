"use client"

/**
 * One shared canvas. Each specimen is a <View track={slot}> drawn into the
 * empty div above its name. Textures and geometry are procedural.
 *
 * drei 10 ignores `track` on a <View> that renders outside the canvas (that
 * path always tracks the div it creates itself). These views live inside the
 * canvas so `track` is the slot.
 *
 * The canvas is fixed to the viewport. drei positions each view from the
 * slot's screen rect minus the canvas offset, and that offset is only
 * refreshed on resize. An in-flow canvas moves on scroll while the offset
 * stays put, so the specimens slide off their names.
 */

import { useEffect, useMemo, useRef, useState, type JSX, type RefObject } from "react"
import { createPortal } from "react-dom"
import * as THREE from "three"
import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, Float, Lightformer, PerspectiveCamera, Shadow, View } from "@react-three/drei"
import { MATERIALS, type MaterialKind } from "./copy"
import { canvasTexture, drawPebbles, linenTexture, rng, roundedBox, useDisposable, woodTexture } from "@/lib/three/procedural"

/** Braided jute rope, used on the side of the rolled rug. */
function juteSideTexture() {
  return canvasTexture(512, (ctx, s) => {
    const random = rng(5)
    ctx.fillStyle = "#a8895a"
    ctx.fillRect(0, 0, s, s)
    ctx.lineCap = "round"
    for (let row = 0; row < s; row += 32) {
      const dir = (row / 32) % 2 ? 1 : -1
      for (let x = -32; x < s + 32; x += 14) {
        ctx.strokeStyle = random() > 0.5 ? "#c9ae7c" : "#b6985f"
        ctx.lineWidth = 8
        ctx.beginPath()
        ctx.moveTo(x, row + 2)
        ctx.lineTo(x + dir * 20, row + 30)
        ctx.stroke()
        ctx.strokeStyle = "rgba(60,42,20,0.35)"
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.moveTo(x + 4, row + 2)
        ctx.lineTo(x + 4 + dir * 20, row + 30)
        ctx.stroke()
      }
    }
  })
}

/** Coiled-rope spiral for the end of the rolled rug. */
function juteCapTexture() {
  return canvasTexture(512, (ctx, s) => {
    const random = rng(9)
    const turns = 14
    const maxT = Math.PI * 2 * turns
    const c = s / 2
    ctx.fillStyle = "#5e4a28"
    ctx.fillRect(0, 0, s, s)
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.strokeStyle = "#bfa371"
    ctx.lineWidth = 16
    ctx.beginPath()
    for (let t = 0.2; t <= maxT; t += 0.04) {
      const rad = (t / maxT) * c * 1.02
      const px = c + Math.cos(t) * rad
      const py = c + Math.sin(t) * rad
      if (t === 0.2) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.stroke()
    ctx.globalAlpha = 0.22
    ctx.lineWidth = 2
    for (let i = 0; i < 500; i++) {
      ctx.strokeStyle = random() > 0.5 ? "#f0dcae" : "#4a3920"
      const a = random() * 6.28
      const d = random() * c * 0.98
      ctx.beginPath()
      ctx.moveTo(c + Math.cos(a) * d, c + Math.sin(a) * d)
      ctx.lineTo(c + Math.cos(a + 0.9) * (d + 7), c + Math.sin(a + 0.9) * (d + 7))
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  })
}

/** Squared-off pillow, UV-mapped flat so the weave stays straight. */
function cushionGeometry() {
  const geometry = new THREE.SphereGeometry(1, 96, 64)
  const position = geometry.attributes.position as THREE.BufferAttribute
  const uv = geometry.attributes.uv as THREE.BufferAttribute
  const vertex = new THREE.Vector3()
  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i)
    const x = Math.sign(vertex.x) * Math.pow(Math.abs(vertex.x), 0.5) * 0.85
    const y = Math.sign(vertex.y) * Math.pow(Math.abs(vertex.y), 0.5) * 0.6
    const z = Math.sign(vertex.z) * Math.pow(Math.abs(vertex.z), 0.7) * 0.27
    position.setXYZ(i, x, y, z)
    uv.setXY(i, x / 1.7 + 0.5, y / 1.2 + 0.5)
  }
  geometry.computeVertexNormals()
  return geometry
}

/** Slab with half-round reeds on the front face. */
function flutedPanel(w: number, h: number, d: number, pitch: number, amp: number) {
  const geometry = new THREE.BoxGeometry(w, h, d, Math.round(w / pitch) * 24, 1, 1)
  const position = geometry.attributes.position as THREE.BufferAttribute
  const normal = geometry.attributes.normal as THREE.BufferAttribute
  for (let i = 0; i < position.count; i++) {
    if (position.getZ(i) > d / 2 - 1e-5) {
      const f = ((((position.getX(i) + w / 2) / pitch) % 1) + 1) % 1
      position.setZ(i, d / 2 + amp * Math.sin(Math.PI * f))
      if (normal.getZ(i) > 0.9) {
        const slope = ((amp * Math.PI) / pitch) * Math.cos(Math.PI * f)
        const length = Math.sqrt(slope * slope + 1)
        normal.setXYZ(i, -slope / length, 0, 1 / length)
      }
    }
  }
  return geometry
}

/** Leather panel bent around the vertical axis, like a chair back. */
function bentPanel(w: number, h: number, d: number, r: number, k: number) {
  const geometry = roundedBox(w, h, d, r)
  const position = geometry.attributes.position as THREE.BufferAttribute
  const normal = geometry.attributes.normal as THREE.BufferAttribute
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i)
    position.setZ(i, position.getZ(i) - k * x * x)
    const theta = Math.atan(2 * k * x)
    const c = Math.cos(theta)
    const s = Math.sin(theta)
    const nx = normal.getX(i)
    const nz = normal.getZ(i)
    normal.setX(i, nx * c + nz * s)
    normal.setZ(i, -nx * s + nz * c)
  }
  return geometry
}

const DARK_WOOD = ["#3f2214", "#1d0d05", "#8a4a28"] as const

function WalnutFinish({ map }: { map: THREE.Texture }) {
  return <meshPhysicalMaterial map={map} roughness={0.42} clearcoat={0.6} clearcoatRoughness={0.3} />
}

/** Dark, glossy chair-arm rail. */
function Walnut() {
  const radius = 0.16
  const map = useDisposable(() => {
    const texture = woodTexture(DARK_WOOD[0], DARK_WOOD[1], DARK_WOOD[2], 7)
    texture.center.set(0.5, 0.5)
    texture.rotation = Math.PI / 2
    return texture
  })
  const curve = useMemo(() => {
    const point = (x: number, y: number) => new THREE.Vector3(x, y, 0)
    return new THREE.CatmullRomCurve3([
      point(-0.85, -0.55),
      point(-0.6, -0.05),
      point(-0.05, 0.3),
      point(0.55, 0.28),
      point(0.85, -0.2),
    ])
  }, [])
  const ends = useMemo(() => [curve.getPoint(0), curve.getPoint(1)], [curve])

  return (
    <group rotation={[0.2, 0, 0.08]}>
      <mesh>
        <tubeGeometry args={[curve, 140, radius, 32, false]} />
        <WalnutFinish map={map} />
      </mesh>
      {ends.map((pt, i) => (
        <mesh key={i} position={pt}>
          <sphereGeometry args={[radius, 32, 24]} />
          <WalnutFinish map={map} />
        </mesh>
      ))}
    </group>
  )
}

/** Tapered leg with a cast brass cap. */
function Brass() {
  const pts = useMemo(
    () =>
      [
        [0, -0.85],
        [0.2, -0.85],
        [0.225, -0.8],
        [0.26, 0.12],
        [0.3, 0.16],
        [0.3, 0.24],
        [0.26, 0.28],
        [0, 0.28],
      ].map(([x, y]) => new THREE.Vector2(x, y)),
    [],
  )
  const map = useDisposable(() => woodTexture(DARK_WOOD[0], DARK_WOOD[1], DARK_WOOD[2], 7))
  return (
    <group scale={0.9} rotation={[0.12, 0, 0.3]}>
      <mesh>
        <latheGeometry args={[pts, 64]} />
        <meshStandardMaterial
          color="#c29a45"
          metalness={1}
          roughness={0.28}
          envMapIntensity={1.5}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0.63, 0]}>
        <cylinderGeometry args={[0.34, 0.27, 0.7, 48]} />
        <meshPhysicalMaterial map={map} roughness={0.42} clearcoat={0.6} clearcoatRoughness={0.3} />
      </mesh>
    </group>
  )
}

/** Upholstery cushion in washed linen. */
function Linen() {
  const geo = useDisposable(cushionGeometry)
  const map = useDisposable(() => {
    const texture = linenTexture("#9a806a", 31, false)
    texture.repeat.set(7, 5)
    return texture
  })
  const bump = useDisposable(() => {
    const texture = linenTexture("#808080", 31, true)
    texture.repeat.set(7, 5)
    return texture
  })
  return (
    <mesh geometry={geo} dispose={null} rotation={[-0.3, 0.3, 0.05]}>
      <meshPhysicalMaterial
        map={map}
        bumpMap={bump}
        bumpScale={2}
        roughness={1}
        sheen={1}
        sheenRoughness={0.55}
        sheenColor="#e8d8c4"
      />
    </mesh>
  )
}

/** Fluted slat panel, like the wall behind the chair. */
function Teak() {
  const geo = useDisposable(() => flutedPanel(1.7, 1.25, 0.16, 0.17, 0.05))
  const map = useDisposable(() => woodTexture("#a8763c", "#7f5524", "#e0b87c", 21))
  return (
    <mesh geometry={geo} dispose={null} rotation={[-0.05, 0, 0.04]}>
      <meshStandardMaterial map={map} roughness={0.55} />
    </mesh>
  )
}

/** Curved back panel with a pebbled grain. */
function Leather() {
  const geo = useDisposable(() => bentPanel(1.5, 1.1, 0.12, 0.05, 0.28))
  const map = useDisposable(() => {
    const texture = canvasTexture(512, (ctx, s) => drawPebbles(ctx, s, 11, "#6a3d20", "#8a5a36", "#4a2812"))
    texture.repeat.set(2, 2)
    return texture
  })
  const bump = useDisposable(() => {
    const texture = canvasTexture(
      512,
      (ctx, s) => drawPebbles(ctx, s, 11, "#777777", "#cccccc", "#444444"),
      false,
    )
    texture.repeat.set(2, 2)
    return texture
  })
  return (
    <mesh geometry={geo} dispose={null} rotation={[-0.2, 0, 0.05]}>
      <meshStandardMaterial
        map={map}
        bumpMap={bump}
        bumpScale={3}
        roughness={0.5}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

/** Rolled floor rug: braided rope on the side, coiled spiral on the end. */
function Jute() {
  const side = useDisposable(() => {
    const texture = juteSideTexture()
    texture.repeat.set(4, 2)
    return texture
  })
  const cap = useDisposable(juteCapTexture)
  return (
    <group rotation={[0.45, 0, 0.12]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.42, 0.42, 1.5, 64, 1, false]} />
        <meshStandardMaterial attach="material-0" map={side} roughness={1} />
        <meshStandardMaterial attach="material-1" map={cap} roughness={1} />
        <meshStandardMaterial attach="material-2" map={cap} roughness={1} />
      </mesh>
    </group>
  )
}

const SPECIMENS: Record<MaterialKind, () => JSX.Element> = {
  walnut: Walnut,
  brass: Brass,
  linen: Linen,
  teak: Teak,
  leather: Leather,
  jute: Jute,
}

function Scene({
  kind,
  hovered,
  reduced,
}: {
  kind: MaterialKind
  hovered: boolean
  reduced: boolean
}) {
  const spin = useRef<THREE.Group>(null)
  const speed = useRef(0.45)
  const Specimen = SPECIMENS[kind]

  useFrame((_, dt) => {
    const group = spin.current
    if (!group || reduced) return
    speed.current = THREE.MathUtils.damp(speed.current, hovered ? 1.7 : 0.45, 4, dt)
    group.rotation.y += dt * speed.current
  })

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.5, 4.8]} fov={34} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={4} position={[0, 5, 2]} scale={[10, 4, 1]} rotation-x={Math.PI / 2} />
        <Lightformer
          form="rect"
          intensity={2.5}
          position={[-5, 1, 1]}
          scale={[6, 5, 1]}
          rotation-y={Math.PI / 2}
          color="#ffe6c8"
        />
        <Lightformer form="rect" intensity={2} position={[5, 0, 2]} scale={[6, 5, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer form="rect" intensity={1} position={[0, 0, 6]} scale={[8, 4, 1]} rotation-y={Math.PI} />
        <Lightformer form="ring" intensity={3} position={[0, 0, -5]} scale={6} />
      </Environment>
      <directionalLight position={[3, 4, 5]} intensity={1.1} />
      <hemisphereLight args={["#ffffff", "#b8aea0", 0.35]} />
      <Float speed={reduced ? 0 : 1.6} rotationIntensity={0} floatIntensity={0.9} floatingRange={[-0.08, 0.14]}>
        <group ref={spin}>
          <Specimen />
        </group>
      </Float>
      <Shadow position={[0, -1.25, 0]} scale={[2.2, 1.1, 1]} color="#1a1816" opacity={0.28} />
    </>
  )
}

function trackRef(slot: RefObject<HTMLDivElement | null>): RefObject<HTMLElement> {
  return slot as unknown as RefObject<HTMLElement>
}

export function MaterialsCanvas({
  container,
  slots,
  hovered,
  reduced,
}: {
  container: RefObject<HTMLDivElement | null>
  slots: RefObject<HTMLDivElement | null>[]
  hovered: MaterialKind | null
  reduced: boolean
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return createPortal(
    <Canvas
      eventSource={container as unknown as RefObject<HTMLElement>}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 30 }}
      aria-hidden
    >
      <View.Port />
      {MATERIALS.map((item, index) => {
        const slot = slots[index]
        if (!slot) return null
        return (
          <View key={item.kind} track={trackRef(slot)} index={index + 1}>
            <Scene kind={item.kind} hovered={hovered === item.kind} reduced={reduced} />
          </View>
        )
      })}
    </Canvas>,
    document.body,
  )
}
