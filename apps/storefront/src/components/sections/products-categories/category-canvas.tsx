"use client"

/**
 * One shared canvas for the category stage. Each slot div gets a
 * <View track={slot}>; when the active category puts a different piece in a
 * slot, the old piece sinks out while the new one eases in, so a slot can
 * briefly hold more than one piece.
 *
 * Fixed to the viewport for the same reason as the materials canvas: drei
 * only refreshes the canvas offset on resize, so an in-flow canvas drifts on
 * scroll.
 */

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react"
import { createPortal } from "react-dom"
import * as THREE from "three"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Environment, PerspectiveCamera, Shadow, View } from "@react-three/drei"
import type { FurnitureKind } from "./constants"
import { FURNITURE, retainFurniture, uploadFurnitureTextures } from "./furniture-models"

const CAMERA_Y = 0.85
const CAMERA_Z = 4.7
const BASE_YAW = -0.62
const SWAY_SPEED = 0.7
const SWAY_YAW = 0.26
/** Seconds for a full enter / exit. */
const ENTER = 0.8
const EXIT = 0.42
/** Slots never hold more than this many pieces while sweeping across categories. */
const MAX_PIECES = 3

const KINDS = Object.keys(FURNITURE) as FurnitureKind[]

const easeOutCubic = (x: number) => 1 - (1 - x) ** 3

type Entry = {
  id: number
  kind: FurnitureKind
  leaving: boolean
  /** Which way the piece is offset while not fully in: +1 above, -1 below. */
  side: 1 | -1
  delay: number
}

type SlotState = { kind: FurnitureKind; nextId: number; entries: Entry[] }

function swapEntries(
  state: SlotState,
  kind: FurnitureKind,
  index: number,
  direction: 1 | -1,
  reduced: boolean,
): SlotState {
  if (reduced) {
    return {
      kind,
      nextId: state.nextId + 1,
      entries: [{ id: state.nextId, kind, leaving: false, side: direction, delay: 0 }],
    }
  }
  const revive = state.entries.findLast((e) => e.leaving && e.kind === kind)
  // A revived piece keeps its side and simply comes back the way it left.
  const entries = state.entries.map((e): Entry => {
    if (e === revive) return { ...e, leaving: false, delay: index * 0.05 }
    return e.leaving ? e : { ...e, leaving: true, side: direction === 1 ? -1 : 1 }
  })
  let nextId = state.nextId
  if (!revive) {
    entries.push({ id: nextId++, kind, leaving: false, side: direction, delay: 0.16 + index * 0.07 })
  }
  while (entries.length > MAX_PIECES) {
    const oldest = entries.findIndex((e) => e.leaving)
    if (oldest < 0) break
    entries.splice(oldest, 1)
  }
  return { kind, nextId, entries }
}

function Piece({
  entry,
  index,
  reduced,
  onExited,
}: {
  entry: Entry
  index: number
  reduced: boolean
  onExited: (id: number) => void
}) {
  const { Model, scale, height, footprint } = FURNITURE[entry.kind]
  const group = useRef<THREE.Group>(null)
  const shadow = useRef<THREE.Group>(null)
  const progress = useRef(reduced ? 1 : 0)
  const wait = useRef(entry.delay)
  const phase = useRef(entry.leaving)
  const exited = useRef(false)
  const floor = (-height * scale) / 2

  useFrame((state, delta) => {
    const node = group.current
    if (!node) return
    // Clamp so a resumed frameloop doesn't skip the animation.
    const dt = Math.min(delta, 0.1)
    if (phase.current !== entry.leaving) {
      phase.current = entry.leaving
      wait.current = entry.leaving ? index * 0.04 : entry.delay
      exited.current = false
    }

    if (reduced) progress.current = 1
    else if (wait.current > 0) wait.current -= dt
    else if (entry.leaving) progress.current = Math.max(0, progress.current - dt / EXIT)
    else progress.current = Math.min(1, progress.current + dt / ENTER)

    if (entry.leaving && progress.current === 0 && !exited.current) {
      exited.current = true
      onExited(entry.id)
    }

    // One curve both ways: eases out on enter, eases in on exit, and stays
    // continuous when a leaving piece is revived mid-exit.
    const p = easeOutCubic(progress.current)
    const away = (1 - p) * entry.side
    const sway = reduced ? 0 : Math.sin(state.clock.elapsedTime * SWAY_SPEED + index * 1.7) * SWAY_YAW
    node.scale.setScalar(Math.max(0.0001, scale * p))
    node.position.y = floor + away * 0.4
    node.rotation.y = BASE_YAW + sway + away * 0.8
    shadow.current?.scale.setScalar(Math.max(0.0001, p))
  })

  return (
    <>
      <group ref={group} position={[0, floor, 0]} rotation={[0, BASE_YAW, 0]} scale={reduced ? scale : 0.0001}>
        <Model />
      </group>
      <group ref={shadow} position={[0, floor + 0.002, 0]} scale={reduced ? 1 : 0.0001}>
        <Shadow
          scale={[footprint[0] * scale * 1.1, footprint[1] * scale * 1.1, 1]}
          color="#1a1816"
          opacity={0.3}
        />
      </group>
    </>
  )
}

function Slot({
  kind,
  index,
  direction,
  reduced,
}: {
  kind: FurnitureKind
  index: number
  direction: 1 | -1
  reduced: boolean
}) {
  const [state, setState] = useState<SlotState>(() => ({
    kind,
    nextId: 1,
    entries: [{ id: 0, kind, leaving: false, side: direction, delay: index * 0.08 }],
  }))
  if (state.kind !== kind) setState(swapEntries(state, kind, index, direction, reduced))

  const onExited = (id: number) =>
    setState((s) => ({ ...s, entries: s.entries.filter((e) => e.id !== id || !e.leaving) }))

  return state.entries.map((entry) => (
    <Piece key={entry.id} entry={entry} index={index} reduced={reduced} onExited={onExited} />
  ))
}

type FormSpec = {
  form: "rect" | "ring"
  intensity: number
  position: [number, number, number]
  scale: [number, number, number]
  color?: string
}

const LIGHTFORMERS: FormSpec[] = [
  { form: "rect", intensity: 4, position: [0, 5, 2], scale: [10, 4, 1] },
  { form: "rect", intensity: 2.5, position: [-5, 1, 1], scale: [6, 5, 1], color: "#ffe6c8" },
  { form: "rect", intensity: 2, position: [5, 0, 2], scale: [6, 5, 1] },
  { form: "rect", intensity: 1, position: [0, 0, 6], scale: [8, 4, 1] },
  { form: "ring", intensity: 3, position: [0, 0, -5], scale: [6, 6, 6] },
]

/**
 * The studio lighting every slot shares, rendered once into a cube map. Same
 * lightformers drei's <Environment> would capture, but one capture (and one
 * PMREM pass) for all views instead of one per view.
 */
function useStudioEnvironment() {
  const gl = useThree((s) => s.gl)
  const [texture, setTexture] = useState<THREE.Texture | null>(null)

  useLayoutEffect(() => {
    const target = new THREE.WebGLCubeRenderTarget(256)
    target.texture.type = THREE.HalfFloatType
    const scene = new THREE.Scene()
    const disposables: { dispose(): void }[] = []
    for (const spec of LIGHTFORMERS) {
      const geometry =
        spec.form === "ring" ? new THREE.RingGeometry(0.25, 0.5, 64) : new THREE.PlaneGeometry(1, 1)
      const material = new THREE.MeshBasicMaterial({ toneMapped: false, side: THREE.DoubleSide })
      material.color.set(spec.color ?? "white").multiplyScalar(spec.intensity)
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(...spec.position)
      mesh.scale.set(...spec.scale)
      mesh.lookAt(0, 0, 0)
      scene.add(mesh)
      disposables.push(geometry, material)
    }
    const camera = new THREE.CubeCamera(1, 1000, target)
    const autoClear = gl.autoClear
    gl.autoClear = true
    camera.update(gl, scene)
    gl.autoClear = autoClear
    disposables.forEach((d) => d.dispose())
    setTexture(target.texture)
    return () => target.dispose()
  }, [gl])

  return texture
}

function SlotLights({ environment }: { environment: THREE.Texture }) {
  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[0, CAMERA_Y, CAMERA_Z]}
        rotation={[-Math.atan(CAMERA_Y / CAMERA_Z), 0, 0]}
        fov={30}
      />
      <Environment map={environment} />
      <directionalLight position={[3, 4, 5]} intensity={1.1} />
      <hemisphereLight args={["#ffffff", "#b8aea0", 0.35]} />
    </>
  )
}

/**
 * Builds and compiles every model once, one per idle slot, behind the camera
 * (frustum-culled, never drawn). Afterwards a category switch only mounts
 * cached resources with already-linked shader programs.
 */
function Prewarm() {
  const [step, setStep] = useState(0)
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)

  useEffect(() => {
    if (step >= KINDS.length) return
    let cancelled = false
    let idle: number | undefined
    void gl.compileAsync(scene, camera).then(() => {
      if (cancelled) return
      uploadFurnitureTextures(gl)
      const next = () => setStep((s) => s + 1)
      idle = window.requestIdleCallback
        ? window.requestIdleCallback(next, { timeout: 500 })
        : window.setTimeout(next, 50)
    })
    return () => {
      cancelled = true
      if (idle === undefined) return
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle)
      else window.clearTimeout(idle)
    }
  }, [step, gl, scene, camera])

  const kind = KINDS[step]
  if (!kind) return null
  const { Model } = FURNITURE[kind]
  return (
    <group position={[0, 0, CAMERA_Z + 40]}>
      <Model key={kind} />
    </group>
  )
}

function trackRef(slot: RefObject<HTMLDivElement | null>): RefObject<HTMLElement> {
  return slot as unknown as RefObject<HTMLElement>
}

function Stage({
  layout,
  slots,
  pieces,
  direction,
  reduced,
}: {
  layout: "desktop" | "mobile"
  slots: readonly RefObject<HTMLDivElement | null>[]
  pieces: readonly FurnitureKind[]
  direction: 1 | -1
  reduced: boolean
}) {
  const environment = useStudioEnvironment()
  if (!environment) return null

  return slots.map((slot, index) => {
    const kind = pieces[index]
    if (!kind) return null
    return (
      <View key={`${layout}-${index}`} track={trackRef(slot)} index={index + 1}>
        <SlotLights environment={environment} />
        <Slot kind={kind} index={index} direction={direction} reduced={reduced} />
        {index === 0 ? <Prewarm /> : null}
      </View>
    )
  })
}

export function CategoryCanvas({
  layout,
  slots,
  pieces,
  direction,
  reduced,
  running,
}: {
  layout: "desktop" | "mobile"
  slots: readonly RefObject<HTMLDivElement | null>[]
  pieces: readonly FurnitureKind[]
  direction: 1 | -1
  reduced: boolean
  running: boolean
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  useEffect(() => retainFurniture(), [])
  if (!mounted) return null

  return createPortal(
    <Canvas
      frameloop={running ? "always" : "never"}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 30 }}
      aria-hidden
    >
      <View.Port />
      <Stage layout={layout} slots={slots} pieces={pieces} direction={direction} reduced={reduced} />
    </Canvas>,
    document.body,
  )
}
