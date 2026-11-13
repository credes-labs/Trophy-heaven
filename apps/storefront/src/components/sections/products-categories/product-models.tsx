"use client"

import type { JSX } from "react"
import * as THREE from "three"
import { canvasTexture, roundedBox, woodTexture, rng } from "@/lib/three/procedural"
import type { ProductKind } from "./constants"

type Vec3 = [number, number, number]
const cache = new Map<string, { dispose(): void }>()
let holders = 0
let timer: ReturnType<typeof setTimeout> | undefined

function shared<T extends { dispose(): void }>(key: string, make: () => T): T {
  let value = cache.get(key) as T | undefined
  if (!value) {
    value = make()
    cache.set(key, value)
  }
  return value
}

export function retainProducts() {
  holders++
  clearTimeout(timer)
  return () => {
    holders--
    timer = setTimeout(() => {
      if (holders > 0) return
      cache.forEach((item) => item.dispose())
      cache.clear()
      bounds.clear()
    }, 0)
  }
}

export function uploadProductTextures(gl: THREE.WebGLRenderer) {
  cache.forEach((item) => {
    if (item instanceof THREE.Texture) gl.initTexture(item)
  })
}

type Finish = "gold" | "brass" | "bronze" | "patina" | "walnut" | "marble" | "black" | "glass"
function finish(id: Finish) {
  return shared(`material:${id}`, () => {
    if (id === "glass")
      return new THREE.MeshPhysicalMaterial({
        color: "#c7d8cf",
        transparent: true,
        opacity: 0.3,
        roughness: 0.08,
        metalness: 0.15,
        clearcoat: 1,
        side: THREE.DoubleSide,
      })
    if (id === "walnut")
      return new THREE.MeshPhysicalMaterial({
        map: shared("wood", () => woodTexture("#52291c", "#241008", "#8b5432", 71)),
        roughness: 0.38,
        clearcoat: 0.5,
      })
    if (id === "marble" || id === "black") {
      const dark = id === "black"
      const map = shared(`stone:${id}`, () =>
        canvasTexture(512, (ctx, s) => {
          ctx.fillStyle = dark ? "#191917" : "#dcd4c3"
          ctx.fillRect(0, 0, s, s)
          const random = rng(91)
          for (let i = 0; i < 28; i++) {
            ctx.beginPath()
            const y = random() * s
            ctx.moveTo(-10, y)
            ctx.bezierCurveTo(s * 0.3, y + random() * 100, s * 0.6, y - 120, s + 10, y + 100)
            ctx.strokeStyle = dark ? "rgba(220,209,183,.28)" : "rgba(103,87,67,.25)"
            ctx.lineWidth = 0.6 + random() * 2
            ctx.stroke()
          }
        })
      )
      return new THREE.MeshPhysicalMaterial({ map, roughness: 0.27, clearcoat: 0.65 })
    }
    const patina = id === "patina" || id === "bronze"
    const map = patina
      ? shared(`cast:${id}`, () =>
          canvasTexture(256, (ctx, s) => {
            const random = rng(41)
            ctx.fillStyle = id === "patina" ? "#415a4a" : "#58452b"
            ctx.fillRect(0, 0, s, s)
            for (let i = 0; i < 8000; i++) {
              ctx.fillStyle = i % 3 === 0 ? "#a98a50" : id === "patina" ? "#263e36" : "#302b20"
              ctx.globalAlpha = 0.15 + random() * 0.35
              ctx.fillRect(random() * s, random() * s, 1 + random() * 4, 1 + random() * 3)
            }
          })
        )
      : undefined
    return new THREE.MeshStandardMaterial({
      color: patina ? "#ffffff" : id === "gold" ? "#e7b943" : "#b99a58",
      map,
      metalness: patina ? 0.78 : 1,
      roughness: patina ? 0.46 : id === "gold" ? 0.17 : 0.3,
    })
  })
}

function Box({
  size,
  at,
  material,
  rotation,
}: {
  size: Vec3
  at: Vec3
  material: Finish
  rotation?: Vec3
}) {
  const geometry = shared(`box:${size}`, () => roundedBox(...size, Math.min(...size) * 0.12))
  return <mesh geometry={geometry} material={finish(material)} position={at} rotation={rotation} />
}

function Cylinder({
  top,
  bottom = top,
  height,
  at,
  material,
  sides = 64,
  rotation,
}: {
  top: number
  bottom?: number
  height: number
  at: Vec3
  material: Finish
  sides?: number
  rotation?: Vec3
}) {
  const geometry = shared(
    `cylinder:${top}:${bottom}:${height}:${sides}`,
    () => new THREE.CylinderGeometry(top, bottom, height, sides)
  )
  return (
    <mesh
      geometry={geometry}
      material={finish(material)}
      position={at}
      rotation={rotation ?? (sides === 6 ? [0, Math.PI / 6, 0] : undefined)}
    />
  )
}

function Ring({
  radius,
  tube,
  at,
  material,
  rotation,
  scale,
}: {
  radius: number
  tube: number
  at: Vec3
  material: Finish
  rotation?: Vec3
  scale?: Vec3
}) {
  const geometry = shared(
    `ring:${radius}:${tube}`,
    () => new THREE.TorusGeometry(radius, tube, 16, 96)
  )
  return (
    <mesh
      geometry={geometry}
      material={finish(material)}
      position={at}
      rotation={rotation}
      scale={scale}
    />
  )
}

function Sweep({ points, radius, material }: { points: Vec3[]; radius: number; material: Finish }) {
  const geometry = shared(
    `sweep:${points}:${radius}`,
    () =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(points.map((v) => new THREE.Vector3(...v))),
        48,
        radius,
        12,
        false
      )
  )
  const cap = shared(`cap:${radius}`, () => new THREE.SphereGeometry(radius, 16, 12))
  return (
    <group>
      <mesh geometry={geometry} material={finish(material)} />
      <mesh geometry={cap} material={finish(material)} position={points[0]} />
      <mesh geometry={cap} material={finish(material)} position={points[points.length - 1]} />
    </group>
  )
}

/** The tray lip, thin stem and tapered six-sided foot of the photographed pair. */
function TrayTable({ height, radius }: { height: number; radius: number }) {
  return (
    <group>
      <Cylinder
        top={0.1}
        bottom={0.24}
        height={height * 0.42}
        at={[0, height * 0.21, 0]}
        material="brass"
        sides={6}
      />
      <Cylinder top={0.028} height={height * 0.6} at={[0, height * 0.7, 0]} material="brass" />
      <Cylinder top={radius} height={0.025} at={[0, height, 0]} material="brass" />
      <Ring
        radius={radius}
        tube={0.014}
        at={[0, height + 0.016, 0]}
        material="brass"
        rotation={[Math.PI / 2, 0, 0]}
      />
    </group>
  )
}
function NestingTables() {
  return (
    <group>
      <group position={[-0.28, 0, -0.12]}>
        <TrayTable height={1.15} radius={0.52} />
      </group>
      <group position={[0.42, 0, 0.3]}>
        <TrayTable height={0.82} radius={0.39} />
      </group>
    </group>
  )
}

function OctagonTable() {
  return (
    <group>
      <Cylinder top={0.94} height={0.07} at={[0, 0.65, 0]} material="marble" sides={8} />
      <Cylinder top={0.92} height={0.022} at={[0, 0.604, 0]} material="brass" sides={8} />
      {[-1, 1].flatMap((x) =>
        [-1, 1].map((z) => (
          <Box
            key={`${x}:${z}`}
            size={[0.036, 0.6, 0.036]}
            at={[x * 0.58, 0.3, z * 0.58]}
            material="brass"
          />
        ))
      )}
      <Box size={[1.2, 0.028, 0.028]} at={[0, 0.12, 0]} material="brass" />
      <Box size={[0.028, 0.028, 1.2]} at={[0, 0.12, 0]} material="brass" />
    </group>
  )
}

function HexTable({ height, radius }: { height: number; radius: number }) {
  return (
    <group>
      <Cylinder top={radius} height={0.018} at={[0, height, 0]} material="glass" sides={6} />
      {[0, height].map((y) => (
        <group key={y}>
          {Array.from({ length: 6 }, (_, i) => {
            const angle = (i * Math.PI) / 3
            return (
              <Box
                key={i}
                size={[radius, 0.018, 0.018]}
                at={[
                  Math.cos(angle + Math.PI / 6) * radius * Math.cos(Math.PI / 6),
                  y,
                  Math.sin(angle + Math.PI / 6) * radius * Math.cos(Math.PI / 6),
                ]}
                rotation={[0, -angle - Math.PI / 6 - Math.PI / 2, 0]}
                material="brass"
              />
            )
          })}
        </group>
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <Box
          key={i}
          size={[0.022, height, 0.022]}
          at={[
            Math.cos((i * Math.PI) / 3) * radius,
            height / 2,
            Math.sin((i * Math.PI) / 3) * radius,
          ]}
          material="brass"
        />
      ))}
    </group>
  )
}
function HexTables() {
  return (
    <group>
      <group position={[-0.28, 0, -0.22]}>
        <HexTable height={0.9} radius={0.55} />
      </group>
      <group position={[0.48, 0, 0.25]}>
        <HexTable height={0.65} radius={0.42} />
      </group>
    </group>
  )
}

/** Ellipsoids blend the polished figure's torso, shoulders, head and limbs. */
function Ellipsoid({ at, scale, rotation }: { at: Vec3; scale: Vec3; rotation?: Vec3 }) {
  const sphere = shared("sphere", () => new THREE.SphereGeometry(1, 32, 24))
  return (
    <mesh
      geometry={sphere}
      material={finish("gold")}
      position={at}
      scale={scale}
      rotation={rotation}
    />
  )
}

function Statuette() {
  return (
    <group>
      <Box size={[0.7, 0.08, 0.56]} at={[0, 0.04, 0]} material="walnut" />
      <Box size={[0.62, 0.045, 0.5]} at={[0, 0.1, 0]} material="gold" />
      <Box size={[0.52, 0.32, 0.43]} at={[0, 0.285, 0]} material="black" />
      <Cylinder top={0.18} height={0.24} at={[0, 0.565, 0]} material="gold" />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Ellipsoid at={[s * 0.075, 0.93, 0]} scale={[0.063, 0.26, 0.065]} />
          <Ellipsoid at={[s * 0.075, 0.72, 0.04]} scale={[0.072, 0.045, 0.11]} />
          <Sweep
            points={[
              [s * 0.15, 1.38, 0],
              [s * 0.15, 1.22, 0.06],
              [s * 0.045, 1.29, 0.15],
            ]}
            radius={0.045}
            material="gold"
          />
        </group>
      ))}
      <Ellipsoid at={[0, 1.25, 0]} scale={[0.115, 0.2, 0.07]} />
      <Ellipsoid at={[0, 1.37, 0]} scale={[0.17, 0.065, 0.075]} />
      <Ellipsoid at={[0, 1.08, 0]} scale={[0.11, 0.1, 0.07]} />
      <Ellipsoid at={[0, 1.43, 0]} scale={[0.045, 0.09, 0.045]} />
      <Ellipsoid at={[0, 1.55, 0]} scale={[0.075, 0.105, 0.072]} />
      <Cylinder top={0.028} bottom={0.045} height={0.16} at={[0, 1.25, 0.15]} material="gold" />
    </group>
  )
}

function FigureAward() {
  const body = shared("figure-body", () => {
    const shape = new THREE.Shape()
    shape.moveTo(-0.17, 0)
    shape.bezierCurveTo(0.15, 0.2, -0.2, 0.55, -0.06, 0.86)
    shape.bezierCurveTo(0.02, 1.02, 0.17, 0.9, 0.1, 0.65)
    shape.bezierCurveTo(-0.02, 0.4, 0.18, 0.2, 0.13, 0)
    shape.closePath()
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.075,
      bevelEnabled: true,
      bevelSegments: 4,
      bevelSize: 0.035,
      bevelThickness: 0.035,
      curveSegments: 40,
    })
  })
  return (
    <group>
      <Cylinder
        top={0.32}
        bottom={0.37}
        height={0.08}
        at={[0, 0.04, 0]}
        sides={8}
        material="walnut"
      />
      <Cylinder
        top={0.27}
        bottom={0.3}
        height={0.42}
        at={[0, 0.29, 0]}
        sides={8}
        material="walnut"
      />
      <Cylinder top={0.29} height={0.035} at={[0, 0.515, 0]} sides={8} material="gold" />
      <mesh geometry={body} material={finish("gold")} position={[0, 0.54, -0.04]} />
      <Ring radius={0.19} tube={0.045} at={[0, 1.4, 0]} material="gold" scale={[1, 1.07, 0.8]} />
      <Ellipsoid at={[0, 1.69, 0]} scale={[0.065, 0.12, 0.06]} />
      <Ellipsoid at={[0, 1.56, 0]} scale={[0.035, 0.06, 0.035]} />
    </group>
  )
}

function Plaque() {
  const outline = shared("plaque-arch", () => {
    const shape = new THREE.Shape()
    shape.moveTo(-0.43, 0)
    shape.lineTo(0.43, 0)
    shape.lineTo(0.43, 0.8)
    shape.absarc(0, 0.8, 0.43, 0, Math.PI, false)
    shape.closePath()
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.1,
      bevelEnabled: true,
      bevelSize: 0.018,
      bevelThickness: 0.015,
      bevelSegments: 3,
      curveSegments: 48,
    })
  })
  const inscription = shared("plaque-lettering", () =>
    canvasTexture(512, (ctx, s) => {
      ctx.fillStyle = "#c9ab64"
      ctx.fillRect(0, 0, s, s)
      ctx.strokeStyle = "#7c632d"
      ctx.lineWidth = 2
      ctx.strokeRect(20, 20, s - 40, s - 40)
      ctx.fillStyle = "#4a3719"
      ctx.textAlign = "center"
      ctx.font = "24px Georgia"
      ctx.fillText("LEGACY CRAFTS", s / 2, 155)
      ctx.font = "italic 42px Georgia"
      ctx.fillText("Excellence", s / 2, 240)
      ctx.font = "22px Georgia"
      ctx.fillText("Crafted with intention", s / 2, 310)
    })
  )
  const plate = shared(
    "plaque-lettering-material",
    () => new THREE.MeshStandardMaterial({ map: inscription, metalness: 0.7, roughness: 0.4 })
  )
  const plane = shared("plate-plane", () => new THREE.PlaneGeometry(0.64, 0.39))
  return (
    <group>
      <Box size={[1.02, 0.09, 0.35]} at={[0, 0.045, 0]} material="walnut" />
      <mesh geometry={outline} material={finish("walnut")} position={[0, 0.1, -0.05]} />
      <Box size={[0.66, 0.41, 0.018]} at={[0, 0.56, 0.074]} material="brass" />
      <mesh geometry={plane} material={plate} position={[0, 0.56, 0.085]} />
      <Cylinder
        top={0.085}
        height={0.018}
        at={[0, 0.98, 0.07]}
        material="gold"
        rotation={[Math.PI / 2, 0, 0]}
      />
      <Ring radius={0.07} tube={0.009} at={[0, 0.98, 0.085]} material="brass" />
    </group>
  )
}

function LoopSculpture() {
  const geometry = shared("twisted-loop", () => {
    const points = Array.from({ length: 121 }, (_, i) => {
      const a = (i / 120) * Math.PI * 2
      return new THREE.Vector3(0.3 * Math.sin(a * 2), 0.76 + 0.58 * Math.cos(a), 0.17 * Math.sin(a))
    })
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points, true), 144, 0.145, 24, true)
  })
  return (
    <group>
      <Box size={[0.76, 0.085, 0.48]} at={[0, 0.0425, 0]} material="marble" />
      <mesh geometry={geometry} material={finish("patina")} />
    </group>
  )
}

function Sunburst() {
  const geometry = shared("sunburst-folds", () => {
    const positions: number[] = []
    for (let i = 0; i < 64; i++) {
      const a = (i / 64) * Math.PI * 2
      const b = ((i + 1) / 64) * Math.PI * 2
      positions.push(
        0,
        0,
        0.04,
        Math.cos(a) * 0.55,
        Math.sin(a) * 0.55,
        i % 2 ? -0.035 : 0.055,
        Math.cos(b) * 0.55,
        Math.sin(b) * 0.55,
        i % 2 ? 0.055 : -0.035
      )
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
    g.computeVertexNormals()
    return g
  })
  const bronze = shared("sunburst-material", () => {
    const m = finish("bronze").clone()
    m.side = THREE.DoubleSide
    return m
  })
  return (
    <group>
      <Box size={[0.62, 0.08, 0.4]} at={[0, 0.04, 0]} material="marble" />
      <Cylinder top={0.025} height={0.5} at={[0, 0.33, 0]} material="bronze" />
      <mesh geometry={geometry} material={bronze} position={[0, 1.08, 0]} scale={[0.88, 1.08, 1]} />
      <mesh
        geometry={geometry}
        material={bronze}
        position={[0, 1.08, -0.01]}
        rotation={[0, Math.PI, 0]}
        scale={[0.88, 1.08, 1]}
      />
    </group>
  )
}

function RingsSculpture() {
  return (
    <group>
      <Cylinder top={0.3} height={0.07} at={[0, 0.035, 0]} material="marble" />
      <Ring
        radius={0.46}
        tube={0.048}
        at={[0, 0.78, 0]}
        material="bronze"
        scale={[1, 1.35, 1]}
        rotation={[0, -0.3, -0.2]}
      />
      <Ring
        radius={0.3}
        tube={0.045}
        at={[-0.03, 0.76, 0.04]}
        material="brass"
        rotation={[0.25, 1.1, 0.15]}
      />
      {[-1, 1].map((s) => (
        <Ring
          key={s}
          radius={0.46 + s * 0.026}
          tube={0.009}
          at={[0, 0.78, 0]}
          material="brass"
          scale={[1, 1.35, 1]}
          rotation={[0, -0.3, -0.2]}
        />
      ))}
    </group>
  )
}

export const PRODUCT_MODELS: Record<ProductKind, () => JSX.Element> = {
  nesting: NestingTables,
  octagon: OctagonTable,
  hex: HexTables,
  statuette: Statuette,
  figure: FigureAward,
  plaque: Plaque,
  loop: LoopSculpture,
  sunburst: Sunburst,
  rings: RingsSculpture,
}

export type ProductBounds = { radius: number; bottom: number; top: number }
const bounds = new Map<ProductKind, ProductBounds>()
/** Vertex bounds enclose every yaw, keeping all models within their view slots. */
export function productBounds(kind: ProductKind, root: THREE.Group): ProductBounds {
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
    const position = object.geometry.attributes.position as THREE.BufferAttribute
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
