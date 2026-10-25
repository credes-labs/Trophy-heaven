"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { ContactShadows, Environment, Lightformer, OrbitControls, Shadow } from "@react-three/drei"
import { linenTexture, useDisposable } from "@/lib/three/procedural"
import { SIZES, type PlaqueConfig } from "@/lib/configurator/plaque"
import { DEPTH, DeskStand, PlaqueBody, disposeWoodTextures } from "./plaque-model"

const FOV = 30
const PLINTH_Y = 0.06
const TARGET = new THREE.Vector3(0, 1.2, 0)
/** Initial camera direction from the target: slightly above eye level. */
const VIEW_DIR = new THREE.Vector3(0.18, 0.3, 1).normalize()
const SIZE_SCALE: Record<(typeof SIZES)[number]["id"], number> = { m: 1, l: 1.12 }

export type StageView = { yaw: number; reset: number }

type Controls = { target: THREE.Vector3; minDistance: number; maxDistance: number; update(): void }

/** Distance at which the tallest/widest configuration fits this aspect. */
function fitDistance(aspect: number) {
  const tan = Math.tan(THREE.MathUtils.degToRad(FOV / 2))
  const byHeight = 2.7 / (2 * tan * 0.82)
  const byWidth = 2.3 / (2 * tan * aspect * 0.82)
  return Math.max(byHeight, byWidth)
}

function CameraRig({ reset }: { reset: number }) {
  const camera = useThree((s) => s.camera)
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height))
  const controls = useThree((s) => s.controls) as unknown as Controls | null
  const invalidate = useThree((s) => s.invalidate)
  const distance = fitDistance(aspect)

  useEffect(() => {
    camera.position.copy(TARGET).addScaledVector(VIEW_DIR, distance)
    camera.lookAt(TARGET)
    if (controls) {
      controls.target.copy(TARGET)
      controls.minDistance = distance * 0.62
      controls.maxDistance = distance * 1.3
      controls.update()
    }
    invalidate()
  }, [camera, controls, distance, reset, invalidate])

  return null
}

/** Settles the piece after an option change and adds a slow idle sway. */
function Turntable({
  config,
  yaw,
  reduced,
  children,
}: {
  config: PlaqueConfig
  yaw: number
  reduced: boolean
  children: React.ReactNode
}) {
  const group = useRef<THREE.Group>(null)
  const kick = useRef(0)
  const clock = useRef(0)
  const key = `${config.form}|${config.wood}|${config.plate}|${config.mount}|${config.size}`
  const invalidate = useThree((s) => s.invalidate)
  const scale = SIZE_SCALE[config.size]

  useEffect(() => {
    kick.current = reduced ? 0 : 1
    invalidate()
  }, [key, reduced, invalidate])

  useEffect(() => invalidate(), [yaw, invalidate])

  useFrame((_, dt) => {
    const g = group.current
    if (!g) return
    const step = Math.min(dt, 0.05)
    if (reduced) {
      g.rotation.y = yaw
      g.scale.setScalar(scale)
      g.position.y = 0
      return
    }
    clock.current += step
    kick.current = THREE.MathUtils.damp(kick.current, 0, 3.2, step)
    const sway = Math.sin(clock.current * 0.45) * 0.16
    const settle = Math.sin(kick.current * Math.PI) * 0.35
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, yaw + sway + settle, 4, step)
    const s = THREE.MathUtils.damp(g.scale.x, scale * (1 - kick.current * 0.05), 6, step)
    g.scale.setScalar(s)
    g.position.y = config.mount === "wall" ? Math.sin(clock.current * 1.1) * 0.025 : 0
  })

  return <group ref={group}>{children}</group>
}

function Plinth() {
  const map = useDisposable(() => {
    const texture = linenTexture("#e3dccb", 41, false)
    texture.repeat.set(6, 6)
    return texture
  })
  return (
    <mesh position={[0, PLINTH_Y / 2, 0]}>
      <cylinderGeometry args={[1.85, 1.9, PLINTH_Y, 96]} />
      <meshStandardMaterial map={map} roughness={0.95} color="#f4efe4" />
    </mesh>
  )
}

function Lights() {
  return (
    <>
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3.5} position={[0, 5, 2]} scale={[10, 4, 1]} rotation-x={Math.PI / 2} />
        <Lightformer
          form="rect"
          intensity={2.4}
          position={[-5, 2, 2]}
          scale={[6, 5, 1]}
          rotation-y={Math.PI / 2}
          color="#ffe6c8"
        />
        <Lightformer form="rect" intensity={1.8} position={[5, 1, 2]} scale={[6, 5, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer form="rect" intensity={1} position={[0, 1, 6]} scale={[8, 4, 1]} rotation-y={Math.PI} />
        <Lightformer form="ring" intensity={2.5} position={[0, 2, -5]} scale={6} />
      </Environment>
      <directionalLight position={[2.5, 5, 4]} intensity={1.05} color="#fff6ea" />
      <hemisphereLight args={["#ffffff", "#b8aea0", 0.4]} />
    </>
  )
}

export default function PlaqueScene({
  config,
  view,
  reduced,
  active,
}: {
  config: PlaqueConfig
  view: StageView
  reduced: boolean
  active: boolean
}) {
  useEffect(() => () => disposeWoodTextures(), [])
  const desk = config.mount === "desk"

  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={active && !reduced ? "always" : "demand"}
      camera={{ fov: FOV, near: 0.1, far: 60, position: [0, 2, 8] }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0)
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.05
      }}
      aria-hidden
    >
      <Lights />
      <Plinth />
      <Shadow position={[0, 0.002, 0]} scale={[4.6, 4.6, 1]} color="#5a4a36" opacity={0.18} />
      <group position={[0, PLINTH_Y, 0]}>
        <Turntable config={config} yaw={view.yaw} reduced={reduced}>
          {desk ? <DeskStand wood={config.wood} /> : null}
          <group
            position={desk ? [0, 0.16, -0.02] : [0, 0.34, 0]}
            rotation={desk ? [-0.13, 0, 0] : [0, 0, 0]}
          >
            <group position={[0, 0, desk ? DEPTH / 2 - 0.02 : 0]}>
              <PlaqueBody config={config} />
            </group>
          </group>
        </Turntable>
        <ContactShadows
          // A one-shot shadow (reduced motion) must re-bake when the piece changes.
          key={reduced ? `${config.form}|${config.mount}|${config.size}` : "live"}
          position={[0, 0.002, 0]}
          scale={4}
          resolution={512}
          blur={2.6}
          opacity={0.5}
          far={3}
          color="#2b1d10"
          frames={reduced ? 1 : Infinity}
        />
      </group>
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.7}
        zoomSpeed={0.6}
        minPolarAngle={0.55}
        maxPolarAngle={Math.PI / 2 - 0.08}
      />
      <CameraRig reset={view.reset} />
    </Canvas>
  )
}
