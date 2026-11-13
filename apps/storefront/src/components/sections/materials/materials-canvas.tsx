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
import { canvasTexture, rng, roundedBox, useDisposable, woodTexture } from "@/lib/three/procedural"

/** Honed white marble with soft grey veins. */
function marbleTexture() {
  return canvasTexture(512, (ctx, s) => {
    ctx.fillStyle = "#d8d1c6"
    ctx.fillRect(0, 0, s, s)
    const random = rng(17)
    for (let v = 0; v < 9; v++) {
      ctx.strokeStyle = v % 3 === 0 ? "rgba(60,55,50,0.75)" : "rgba(110,102,94,0.55)"
      ctx.lineWidth = 1 + random() * 3
      ctx.beginPath()
      let x = random() * s
      let y = 0
      ctx.moveTo(x, y)
      while (y < s) {
        x += (random() - 0.5) * 60
        y += 20 + random() * 40
        ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
  })
}

const DARK_WOOD = ["#3f2214", "#1d0d05", "#8a4a28"] as const

/** Five-point star outline for the gilt specimen. */
function starShape(outer: number, inner: number) {
  const shape = new THREE.Shape()
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = Math.PI / 2 + (i * Math.PI) / 5
    if (i === 0) shape.moveTo(r * Math.cos(a), r * Math.sin(a))
    else shape.lineTo(r * Math.cos(a), r * Math.sin(a))
  }
  shape.closePath()
  return shape
}

/** Faceted crystal obelisk, the classic engraved corporate award. */
function Crystal() {
  return (
    <mesh rotation={[0.1, 0.4, 0.06]}>
      <cylinderGeometry args={[0.32, 0.5, 1.7, 6, 1]} />
      {/* No transmission: the canvas is transparent, so there is nothing to refract. */}
      <meshPhysicalMaterial
        color="#9fb8c6"
        metalness={0.35}
        roughness={0.02}
        clearcoat={1}
        clearcoatRoughness={0}
        envMapIntensity={2.4}
        transparent
        opacity={0.88}
        flatShading
      />
    </mesh>
  )
}

/** Two-handled cup turned in cast brass. */
function Brass() {
  const pts = useMemo(
    () =>
      [
        [0, -0.85],
        [0.3, -0.85],
        [0.3, -0.75],
        [0.12, -0.68],
        [0.07, -0.3],
        [0.12, -0.24],
        [0.07, -0.18],
        [0.1, -0.1],
        [0.36, 0.1],
        [0.46, 0.5],
        [0.5, 0.82],
        [0.47, 0.82],
        [0.43, 0.52],
        [0.32, 0.14],
      ].map(([x, y]) => new THREE.Vector2(x, y)),
    [],
  )
  const metal = (
    <meshStandardMaterial color="#c29a45" metalness={1} roughness={0.28} envMapIntensity={1.5} side={THREE.DoubleSide} />
  )
  return (
    <group scale={0.95} rotation={[0.12, 0, 0.1]}>
      <mesh>
        <latheGeometry args={[pts, 64]} />
        {metal}
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.47, 0.45, 0]} rotation={[0, 0, -side * (Math.PI / 2)]}>
          <torusGeometry args={[0.2, 0.035, 16, 32, Math.PI]} />
          {metal}
        </mesh>
      ))}
    </group>
  )
}

/** Octagonal walnut plinth with an engraving plate on its face. */
function Walnut() {
  const map = useDisposable(() => woodTexture(DARK_WOOD[0], DARK_WOOD[1], DARK_WOOD[2], 7))
  return (
    <group rotation={[0.25, 0.3, 0]}>
      <mesh position={[0, -0.2, 0]} rotation={[0, Math.PI / 8, 0]}>
        <cylinderGeometry args={[0.62, 0.7, 0.75, 8]} />
        <meshPhysicalMaterial map={map} roughness={0.42} clearcoat={0.6} clearcoatRoughness={0.3} flatShading />
      </mesh>
      <mesh position={[0, 0.25, 0]} rotation={[0, Math.PI / 8, 0]}>
        <cylinderGeometry args={[0.48, 0.55, 0.15, 8]} />
        <meshPhysicalMaterial map={map} roughness={0.42} clearcoat={0.6} clearcoatRoughness={0.3} flatShading />
      </mesh>
      <mesh position={[0, -0.2, 0.62]}>
        <boxGeometry args={[0.5, 0.26, 0.02]} />
        <meshStandardMaterial color="#c29a45" metalness={1} roughness={0.3} />
      </mesh>
    </group>
  )
}

/** Stepped marble base, as under a statuette. */
function Marble() {
  const map = useDisposable(marbleTexture)
  return (
    <group rotation={[0.3, 0.5, 0]}>
      <mesh position={[0, -0.25, 0]}>
        <boxGeometry args={[1.25, 0.4, 1.25]} />
        <meshPhysicalMaterial map={map} roughness={0.5} clearcoat={0.25} envMapIntensity={0.6} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.85, 0.34, 0.85]} />
        <meshPhysicalMaterial map={map} roughness={0.5} clearcoat={0.25} envMapIntensity={0.6} />
      </mesh>
    </group>
  )
}

/** Clear acrylic award slab with flame-polished edges. */
function Acrylic() {
  const geo = useDisposable(() => roundedBox(1.05, 1.5, 0.16, 0.06))
  return (
    <mesh geometry={geo} dispose={null} rotation={[-0.08, 0.5, 0.04]}>
      <meshPhysicalMaterial
        color="#b4cbd8"
        metalness={0.2}
        roughness={0.06}
        clearcoat={1}
        clearcoatRoughness={0.05}
        envMapIntensity={2}
        transparent
        opacity={0.8}
      />
    </mesh>
  )
}

/** Gilded star, as on top of a column trophy. */
function Gilt() {
  const geometry = useDisposable(() => {
    const g = new THREE.ExtrudeGeometry(starShape(0.8, 0.34), {
      depth: 0.18,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.04,
      bevelSegments: 3,
    })
    g.center()
    return g
  })
  return (
    <mesh geometry={geometry} dispose={null} rotation={[0.1, 0, 0.08]}>
      <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.18} envMapIntensity={1.7} />
    </mesh>
  )
}

const SPECIMENS: Record<MaterialKind, () => JSX.Element> = {
  crystal: Crystal,
  brass: Brass,
  walnut: Walnut,
  marble: Marble,
  acrylic: Acrylic,
  gilt: Gilt,
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
