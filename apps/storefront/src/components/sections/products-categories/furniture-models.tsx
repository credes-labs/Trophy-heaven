"use client"

/**
 * Procedural furniture modelled on the catalog photography. Every piece stands
 * on y = 0 and is centred on x/z; units are roughly metres.
 *
 * Textures, materials and geometries live in a module cache keyed by their
 * parameters, so swapping pieces never redraws a canvas texture. The cache is
 * disposed when the last canvas holding it releases it.
 */

import { useMemo, type JSX } from "react"
import * as THREE from "three"
import {
  canvasTexture,
  drawPebbles,
  linenTexture,
  roundedBox,
  woodTexture,
} from "@/lib/three/procedural"
import type { FurnitureKind } from "./constants"

type Vec3 = readonly [number, number, number]

const UP = new THREE.Vector3(0, 1, 0)

const cache = new Map<string, { dispose(): void }>()
let holders = 0
let disposeTimer: ReturnType<typeof setTimeout> | undefined

function shared<T extends { dispose(): void }>(key: string, make: () => T): T {
  let value = cache.get(key) as T | undefined
  if (!value) {
    value = make()
    cache.set(key, value)
  }
  return value
}

/** Keep the cache alive; the returned release disposes it once nobody holds it. */
export function retainFurniture() {
  holders++
  clearTimeout(disposeTimer)
  return () => {
    holders--
    // Deferred so a StrictMode unmount/remount doesn't throw the cache away.
    disposeTimer = setTimeout(() => {
      if (holders > 0) return
      cache.forEach((value) => value.dispose())
      cache.clear()
    }, 0)
  }
}

/** Upload every cached texture now instead of on its first draw. */
export function uploadFurnitureTextures(gl: THREE.WebGLRenderer) {
  cache.forEach((value) => {
    if (value instanceof THREE.Texture) gl.initTexture(value)
  })
}

function woodMap(colors: readonly [string, string, string], seed: number) {
  return shared(`wood-map:${colors}:${seed}`, () => woodTexture(colors[0], colors[1], colors[2], seed))
}

function woodMaterial(colors: readonly [string, string, string], seed: number) {
  const map = woodMap(colors, seed)
  return shared(
    `wood:${colors}:${seed}`,
    () =>
      new THREE.MeshPhysicalMaterial({
        map,
        roughness: 0.42,
        clearcoat: 0.55,
        clearcoatRoughness: 0.3,
      }),
  )
}

function brassMaterial() {
  return shared(
    "brass",
    () => new THREE.MeshStandardMaterial({ color: "#c49a4a", metalness: 1, roughness: 0.28 }),
  )
}

function linenMaterial(base: string, seed: number) {
  const map = shared(`linen-map:${base}:${seed}`, () => {
    const texture = linenTexture(base, seed, false)
    texture.repeat.set(2, 2)
    return texture
  })
  const bump = shared(`linen-bump:${seed}`, () => {
    const texture = linenTexture("#808080", seed, true)
    texture.repeat.set(2, 2)
    return texture
  })
  return shared(
    `linen:${base}:${seed}`,
    () => new THREE.MeshStandardMaterial({ map, bumpMap: bump, bumpScale: 1.2, roughness: 0.95 }),
  )
}

function boucleMaterial(base: string, light: string, dark: string, seed: number) {
  const map = shared(`boucle-map:${base}:${light}:${dark}:${seed}`, () => {
    const texture = canvasTexture(512, (ctx, s) => drawPebbles(ctx, s, seed, base, light, dark))
    texture.repeat.set(1.5, 1.5)
    return texture
  })
  const bump = shared(`boucle-bump:${seed}`, () => {
    const texture = canvasTexture(
      512,
      (ctx, s) => drawPebbles(ctx, s, seed, "#7a7a7a", "#ffffff", "#303030"),
      false,
    )
    texture.repeat.set(1.5, 1.5)
    return texture
  })
  return shared(
    `boucle:${base}:${light}:${dark}:${seed}`,
    () => new THREE.MeshStandardMaterial({ map, bumpMap: bump, bumpScale: 2.4, roughness: 1 }),
  )
}

/** Tapered round leg from `a` (foot) to `b`, with an optional brass ferrule at the foot. */
function Leg({
  a,
  b,
  r0,
  r1,
  wood,
  brass,
}: {
  a: Vec3
  b: Vec3
  r0: number
  r1: number
  wood: THREE.Material
  brass?: THREE.Material
}) {
  const shape = useMemo(() => {
    const start = new THREE.Vector3(...a)
    const end = new THREE.Vector3(...b)
    const dir = end.clone().sub(start)
    const length = dir.length()
    dir.normalize()
    return {
      length,
      quaternion: new THREE.Quaternion().setFromUnitVectors(UP, dir),
      mid: start.clone().lerp(end, 0.5),
      cap: start.clone().addScaledVector(dir, 0.035),
    }
    // Leg endpoints are static for the life of a model.
  }, [])
  const rod = shared(`rod:${r1}:${r0}:${shape.length}`, () => new THREE.CylinderGeometry(r1, r0, shape.length, 20))
  const ferrule = shared(`ferrule:${r0}`, () => new THREE.CylinderGeometry(r0 * 1.12, r0 * 1.05, 0.07, 20))

  return (
    <>
      <mesh geometry={rod} material={wood} position={shape.mid} quaternion={shape.quaternion} />
      {brass ? (
        <mesh geometry={ferrule} material={brass} position={shape.cap} quaternion={shape.quaternion} />
      ) : null}
    </>
  )
}

/** Swept round rail through `points`, closed with spheres at both ends. */
function Rail({ points, r, material }: { points: Vec3[]; r: number; material: THREE.Material }) {
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))),
    // Rail points are static for the life of a model.
    [],
  )
  const tube = shared(`rail:${points.join("|")}:${r}`, () => new THREE.TubeGeometry(curve, 72, r, 16, false))
  const end = shared(`sphere:${r}`, () => new THREE.SphereGeometry(r, 16, 12))
  return (
    <>
      <mesh geometry={tube} material={material} />
      <mesh geometry={end} material={material} position={curve.getPoint(0)} />
      <mesh geometry={end} material={material} position={curve.getPoint(1)} />
    </>
  )
}

function Block({
  size,
  r,
  material,
  position,
  rotation,
}: {
  size: Vec3
  r: number
  material: THREE.Material
  position: Vec3
  rotation?: Vec3
}) {
  const geometry = shared(`box:${size}:${r}`, () => roundedBox(size[0], size[1], size[2], r))
  return <mesh geometry={geometry} material={material} position={position} rotation={rotation} />
}

const SIDES = [-1, 1] as const

/** Sculpted walnut lounge chair; arms sweep up into the back posts. */
function LoungeChair() {
  const wood = woodMaterial(["#5b3320", "#2b150a", "#8d5a3a"], 11)
  const brass = brassMaterial()
  const fabric = linenMaterial("#c9bfae", 4)

  return (
    <group>
      {SIDES.map((s) => (
        <group key={s}>
          <Leg a={[s * 0.68, 0, 0.6]} b={[s * 0.62, 0.46, 0.46]} r0={0.026} r1={0.042} wood={wood} brass={brass} />
          <Leg a={[s * 0.68, 0, -0.62]} b={[s * 0.62, 0.36, -0.4]} r0={0.026} r1={0.04} wood={wood} brass={brass} />
          <Rail
            points={[
              [s * 0.62, 0.44, 0.47],
              [s * 0.63, 0.62, 0.42],
              [s * 0.64, 0.66, 0.18],
              [s * 0.63, 0.7, -0.15],
              [s * 0.6, 0.92, -0.46],
              [s * 0.56, 1.22, -0.64],
            ]}
            r={0.036}
            material={wood}
          />
          <Rail
            points={[
              [s * 0.62, 0.4, 0.48],
              [s * 0.62, 0.37, 0],
              [s * 0.62, 0.35, -0.42],
            ]}
            r={0.03}
            material={wood}
          />
        </group>
      ))}
      <Block size={[1.24, 0.07, 0.05]} r={0.02} material={wood} position={[0, 0.4, 0.48]} />
      <Block size={[1.24, 0.07, 0.05]} r={0.02} material={wood} position={[0, 0.35, -0.42]} />
      <Rail
        points={[
          [-0.56, 1.2, -0.64],
          [0, 1.24, -0.7],
          [0.56, 1.2, -0.64],
        ]}
        r={0.026}
        material={wood}
      />
      <Block size={[1.16, 0.2, 0.96]} r={0.09} material={fabric} position={[0, 0.5, 0.03]} rotation={[-0.08, 0, 0]} />
      <Block size={[1.06, 0.66, 0.2]} r={0.09} material={fabric} position={[0, 0.88, -0.44]} rotation={[-0.34, 0, 0]} />
    </group>
  )
}

/** Straight walnut frame, flat arms with brass caps, chunky bouclé cushions. */
function Armchair() {
  const wood = woodMaterial(["#4a2716", "#22100a", "#7c4a2c"], 17)
  const brass = brassMaterial()
  const fabric = boucleMaterial("#8b8072", "#b3a898", "#5f564b", 23)

  return (
    <group>
      {SIDES.map((s) => (
        <group key={s}>
          <Leg a={[s * 0.5, 0, 0.42]} b={[s * 0.5, 0.71, 0.42]} r0={0.024} r1={0.036} wood={wood} brass={brass} />
          <Leg a={[s * 0.5, 0, -0.4]} b={[s * 0.5, 0.38, -0.37]} r0={0.024} r1={0.034} wood={wood} brass={brass} />
          <Leg a={[s * 0.5, 0.36, -0.37]} b={[s * 0.48, 1.08, -0.58]} r0={0.033} r1={0.03} wood={wood} />
          <Block size={[0.09, 0.05, 0.94]} r={0.02} material={wood} position={[s * 0.5, 0.735, -0.02]} />
          <Block size={[0.1, 0.056, 0.05]} r={0.012} material={brass} position={[s * 0.5, 0.735, 0.47]} />
          <Block size={[0.05, 0.08, 0.84]} r={0.015} material={wood} position={[s * 0.5, 0.33, 0.01]} />
        </group>
      ))}
      <Block size={[1, 0.08, 0.05]} r={0.015} material={wood} position={[0, 0.33, 0.42]} />
      <Block size={[1, 0.08, 0.05]} r={0.015} material={wood} position={[0, 0.33, -0.38]} />
      <Block size={[0.96, 0.05, 0.04]} r={0.012} material={wood} position={[0, 1.02, -0.56]} rotation={[-0.28, 0, 0]} />
      <Block size={[0.94, 0.24, 0.86]} r={0.1} material={fabric} position={[0, 0.48, 0.02]} />
      <Block size={[0.92, 0.6, 0.22]} r={0.1} material={fabric} position={[0, 0.86, -0.44]} rotation={[-0.22, 0, 0]} />
    </group>
  )
}

/** Half-round pedestal: flat face toward -x, round face toward +x. */
function pedestalGeometry(r: number, h: number) {
  const shape = new THREE.Shape()
  shape.moveTo(0, -r)
  shape.absarc(0, 0, r, -Math.PI / 2, Math.PI / 2, false)
  shape.lineTo(0, -r)
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: h,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 3,
    curveSegments: 40,
  })
  geometry.rotateX(-Math.PI / 2)
  geometry.scale(1.5, 1, 3)
  return geometry
}

/** Oval oak top on two half-round pedestals, round under-shelf and a brass fin. */
function CoffeeTable() {
  const wood = woodMaterial(["#9a6a3a", "#5c3a1c", "#c79a62"], 29)
  const brass = brassMaterial()
  const top = shared("coffee-top", () => {
    const geometry = new THREE.CylinderGeometry(1, 1, 0.08, 96)
    geometry.scale(0.95, 1, 0.55)
    return geometry
  })
  const pedestal = shared("coffee-pedestal", () => pedestalGeometry(0.16, 0.55))
  const shelf = shared("coffee-shelf", () => new THREE.CylinderGeometry(0.4, 0.4, 0.045, 72))

  return (
    <group>
      <mesh geometry={top} material={wood} position={[0, 0.6, 0]} />
      <mesh geometry={pedestal} material={wood} position={[0.5, 0, 0]} />
      <mesh geometry={pedestal} material={wood} position={[-0.5, 0, 0]} rotation={[0, Math.PI, 0]} />
      <mesh geometry={shelf} material={wood} position={[0, 0.22, 0]} />
      <Block size={[0.04, 0.55, 0.44]} r={0.012} material={wood} position={[-0.04, 0.28, 0.02]} />
      <Block size={[0.012, 0.6, 0.46]} r={0.004} material={brass} position={[-0.012, 0.29, 0.03]} />
    </group>
  )
}

/** Stadium-shaped walnut top on four splayed, brass-tipped legs. */
function DiningTable() {
  const wood = woodMaterial(["#5a3220", "#2a140a", "#8c5636"], 31)
  const brass = brassMaterial()
  const top = shared("dining-top", () => {
    const half = 0.5
    const r = 0.5
    const shape = new THREE.Shape()
    shape.moveTo(-half, -r)
    shape.lineTo(half, -r)
    shape.absarc(half, 0, r, -Math.PI / 2, Math.PI / 2, false)
    shape.lineTo(-half, r)
    shape.absarc(-half, 0, r, Math.PI / 2, (3 * Math.PI) / 2, false)
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.04,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.02,
      bevelSegments: 4,
      curveSegments: 48,
    })
    geometry.rotateX(-Math.PI / 2)
    return geometry
  })
  const topMap = shared("dining-top-map", () => {
    const map = wood.map!.clone()
    map.repeat.set(0.6, 0.6)
    map.needsUpdate = true
    return map
  })
  const wood2 = shared("dining-top-wood", () => {
    const material = wood.clone()
    material.map = topMap
    return material
  })

  return (
    <group>
      <mesh geometry={top} material={wood2} position={[0, 0.72, 0]} />
      <Block size={[1.3, 0.07, 0.66]} r={0.02} material={wood} position={[0, 0.685, 0]} />
      {SIDES.flatMap((sx) =>
        SIDES.map((sz) => (
          <Leg
            key={`${sx}${sz}`}
            a={[sx * 0.74, 0, sz * 0.38]}
            b={[sx * 0.62, 0.7, sz * 0.3]}
            r0={0.022}
            r1={0.04}
            wood={wood}
            brass={brass}
          />
        )),
      )}
    </group>
  )
}

function flutedGlassBump() {
  return canvasTexture(
    256,
    (ctx, s) => {
      const gradient = ctx.createLinearGradient(0, 0, s / 16, 0)
      gradient.addColorStop(0, "#202020")
      gradient.addColorStop(0.5, "#f0f0f0")
      gradient.addColorStop(1, "#202020")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, s, s)
    },
    false,
  )
}

/** Round fluted-glass top in a brass band, three walnut plank legs, brass Y stretcher. */
function SideTable() {
  const wood = woodMaterial(["#4f2716", "#230f07", "#82462a"], 37)
  const brass = brassMaterial()
  const bump = shared("fluted-bump", flutedGlassBump)
  const glass = shared(
    "fluted-glass",
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#d9c39a",
        roughness: 0.08,
        metalness: 0,
        clearcoat: 1,
        transparent: true,
        opacity: 0.62,
        bumpMap: bump,
        bumpScale: 3,
      }),
  )
  const top = shared("side-top", () => new THREE.CylinderGeometry(0.42, 0.42, 0.06, 96))
  const band = shared("side-band", () => new THREE.TorusGeometry(0.421, 0.012, 12, 120))
  const hub = shared("side-hub", () => new THREE.CylinderGeometry(0.03, 0.03, 0.04, 20))
  const angles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((a) => a + Math.PI / 6)

  return (
    <group>
      <mesh geometry={top} material={glass} position={[0, 0.63, 0]} />
      <mesh geometry={band} material={brass} position={[0, 0.605, 0]} rotation={[Math.PI / 2, 0, 0]} />
      {angles.map((a) => {
        const sin = Math.sin(a)
        const cos = Math.cos(a)
        const yaw = a - Math.PI / 2
        return (
          <group key={a}>
            <Block size={[0.15, 0.58, 0.055]} r={0.014} material={wood} position={[sin * 0.22, 0.3, cos * 0.22]} rotation={[0, yaw, 0]} />
            <Block size={[0.16, 0.03, 0.065]} r={0.008} material={brass} position={[sin * 0.22, 0.015, cos * 0.22]} rotation={[0, yaw, 0]} />
            <Block size={[0.2, 0.024, 0.024]} r={0.008} material={brass} position={[sin * 0.1, 0.1, cos * 0.1]} rotation={[0, yaw, 0]} />
            <Block size={[0.05, 0.08, 0.03]} r={0.008} material={brass} position={[sin * 0.425, 0.625, cos * 0.425]} rotation={[0, yaw + Math.PI / 2, 0]} />
          </group>
        )
      })}
      <mesh geometry={hub} material={brass} position={[0, 0.1, 0]} />
    </group>
  )
}

/** Tall walnut bookcase: brass posts and shelves, lit shelf undersides, two-door base. */
function Bookcase() {
  const wood = woodMaterial(["#5a2414", "#2a0f06", "#8f4a2c"], 41)
  const back = woodMaterial(["#3a150a", "#1c0904", "#6a3018"], 43)
  const brass = brassMaterial()
  const glow = shared(
    "shelf-glow",
    () => new THREE.MeshBasicMaterial({ color: "#ffd59a", toneMapped: false }),
  )
  const shelves = [1.06, 1.4, 1.74]

  return (
    <group>
      <Block size={[0.96, 1.86, 0.03]} r={0.01} material={back} position={[0, 1.0, -0.17]} />
      {SIDES.map((s) => (
        <group key={s}>
          <Block size={[0.04, 1.86, 0.36]} r={0.015} material={wood} position={[s * 0.48, 1.0, 0]} />
          <Leg a={[s * 0.5, 0.06, 0.18]} b={[s * 0.5, 1.93, 0.18]} r0={0.012} r1={0.012} wood={brass} />
          <Leg a={[s * 0.48, 0, 0.16]} b={[s * 0.48, 0.075, 0.16]} r0={0.012} r1={0.012} wood={brass} />
          <Leg a={[s * 0.48, 0, -0.16]} b={[s * 0.48, 0.075, -0.16]} r0={0.012} r1={0.012} wood={brass} />
          <Block size={[0.46, 0.56, 0.03]} r={0.01} material={wood} position={[s * 0.237, 0.38, 0.17]} />
          <Leg a={[s * 0.022, 0.24, 0.195]} b={[s * 0.022, 0.56, 0.195]} r0={0.007} r1={0.007} wood={brass} />
        </group>
      ))}
      <Block size={[1.04, 0.05, 0.4]} r={0.02} material={wood} position={[0, 1.955, 0]} />
      <Block size={[0.96, 0.04, 0.36]} r={0.012} material={wood} position={[0, 0.1, 0]} />
      <Block size={[0.96, 0.035, 0.36]} r={0.012} material={wood} position={[0, 0.675, 0]} />
      <Block size={[1.02, 0.025, 0.4]} r={0.008} material={brass} position={[0, 0.075, 0]} />
      {shelves.map((y) => (
        <group key={y}>
          <Block size={[0.96, 0.02, 0.34]} r={0.006} material={brass} position={[0, y, 0]} />
          <Block size={[0.88, 0.006, 0.02]} r={0.002} material={glow} position={[0, y - 0.014, 0.12]} />
        </group>
      ))}
      <Block size={[0.88, 0.006, 0.02]} r={0.002} material={glow} position={[0, 1.915, 0.12]} />
    </group>
  )
}

export const FURNITURE: Record<FurnitureKind, () => JSX.Element> = {
  lounge: LoungeChair,
  armchair: Armchair,
  coffee: CoffeeTable,
  dining: DiningTable,
  side: SideTable,
  shelf: Bookcase,
}

/** Unscaled extent of a piece spinning about its vertical axis. */
export type FurnitureBounds = {
  /** Largest distance of any vertex from the y axis. */
  radius: number
  bottom: number
  top: number
}

const bounds = new Map<FurnitureKind, FurnitureBounds>()

/** Measure a mounted model once per kind, from its vertices in `root`'s frame. */
export function furnitureBounds(kind: FurnitureKind, root: THREE.Group): FurnitureBounds {
  const known = bounds.get(kind)
  if (known) return known
  root.updateWorldMatrix(true, true)
  const toRoot = root.matrixWorld.clone().invert()
  const matrix = new THREE.Matrix4()
  const vertex = new THREE.Vector3()
  const result = { radius: 0, bottom: Infinity, top: -Infinity }
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    matrix.multiplyMatrices(toRoot, object.matrixWorld)
    const position = (object.geometry as THREE.BufferGeometry).attributes.position as THREE.BufferAttribute
    for (let i = 0; i < position.count; i++) {
      vertex.fromBufferAttribute(position, i).applyMatrix4(matrix)
      result.radius = Math.max(result.radius, Math.hypot(vertex.x, vertex.z))
      result.bottom = Math.min(result.bottom, vertex.y)
      result.top = Math.max(result.top, vertex.y)
    }
  })
  bounds.set(kind, result)
  return result
}
