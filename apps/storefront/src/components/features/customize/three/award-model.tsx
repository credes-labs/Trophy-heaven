"use client"

import { useEffect, useMemo, useState, type DependencyList } from "react"
import * as THREE from "three"
import { woodTexture, canvasTexture, roundedBox } from "@/lib/three/procedural"
import {
  engravingLines,
  getFont,
  getPlate,
  getWood,
  inkFor,
  type PlaqueConfig,
} from "@/lib/configurator/plaque"
import type { AwardId } from "@/lib/configurator/studio-pieces"

function useDisposable<T extends { dispose(): void }>(
  make: () => T,
  dependencies: DependencyList
): T {
  const value = useMemo(make, dependencies)
  useEffect(() => () => value.dispose(), [value])
  return value
}

type V3 = [number, number, number]

function Block({ size, at, material }: { size: V3; at: V3; material: THREE.Material }) {
  const key = size.join(":")
  const geometry = useDisposable(() => roundedBox(...size, Math.min(...size) * 0.08), [key])
  return <mesh geometry={geometry} position={at} material={material} />
}

function Orb({ at, scale, material }: { at: V3; scale: V3; material: THREE.Material }) {
  return (
    <mesh position={at} scale={scale} material={material}>
      <sphereGeometry args={[1, 40, 32]} />
    </mesh>
  )
}

function Limb({
  points,
  radius,
  material,
}: {
  points: V3[]
  radius: number
  material: THREE.Material
}) {
  const key = points.join(":")
  const geometry = useDisposable(
    () =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))),
        48,
        radius,
        16,
        false
      ),
    [key, radius]
  )
  return (
    <group>
      <mesh geometry={geometry} material={material} />
      {[points[0], points[points.length - 1]].map((p, i) => (
        <Orb key={i} at={p} scale={[radius, radius, radius]} material={material} />
      ))}
    </group>
  )
}

function useLettering(config: PlaqueConfig, image: string | null) {
  const [fontReady, setFontReady] = useState(0)
  useEffect(() => {
    let alive = true
    void document.fonts.ready.then(() => {
      if (alive) setFontReady(1)
    })
    return () => {
      alive = false
    }
  }, [])
  const texture = useDisposable(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 1120
    canvas.height = 400
    const ctx = canvas.getContext("2d")!
    const font = getFont(config.font)
    const family =
      getComputedStyle(document.documentElement).getPropertyValue(font.cssVar).trim() || "Georgia"
    const lines = engravingLines(config)
    ctx.fillStyle = inkFor(config)
    ctx.textAlign = config.align === "left" ? "left" : "center"
    ctx.textBaseline = "middle"
    for (const [key, y, size] of [
      ["title", 0.2, 0.11],
      ["name", 0.5, 0.24],
      ["detail", 0.82, 0.1],
    ] as const) {
      const text = font.caps || key === "title" ? lines[key].toUpperCase() : lines[key]
      let px = 400 * size
      ctx.font = `${key === "name" ? font.style : "normal"} ${font.weight} ${px}px ${family}`
      if (ctx.measureText(text).width > 1100) {
        px *= 1100 / ctx.measureText(text).width
        ctx.font = `${key === "name" ? font.style : "normal"} ${font.weight} ${px}px ${family}`
      }
      ctx.fillText(text, config.align === "left" ? 8 : 560, y * 400)
    }
    const result = new THREE.CanvasTexture(canvas)
    result.colorSpace = THREE.SRGBColorSpace
    return result
  }, [
    config.title,
    config.name,
    config.detail,
    config.font,
    config.fill,
    config.plate,
    config.align,
    fontReady,
  ])
  const [custom, setCustom] = useState<{ source: string; texture: THREE.Texture } | null>(null)
  useEffect(() => {
    if (!image) return
    let alive = true
    const loaded = new THREE.TextureLoader().load(image, (map) => {
      map.colorSpace = THREE.SRGBColorSpace
      if (alive) setCustom({ source: image, texture: map })
    })
    return () => {
      alive = false
      loaded.dispose()
    }
  }, [image])
  return image && custom?.source === image ? custom.texture : texture
}

/* ── Sculpting helpers ─────────────────────────────────────────────────── */

/** Piecewise-smooth interpolation through (t, value) stops, t in [0, 1]. */
function profile(stops: [number, number][]) {
  return (t: number) => {
    if (t <= stops[0][0]) return stops[0][1]
    for (let i = 1; i < stops.length; i++) {
      const [t1, v1] = stops[i]
      const [t0, v0] = stops[i - 1]
      if (t <= t1) {
        const k = (t - t0) / (t1 - t0)
        const e = k * k * (3 - 2 * k)
        return v0 + (v1 - v0) * e
      }
    }
    return stops[stops.length - 1][1]
  }
}

/**
 * Sweeps an elliptical cross-section along a spine. The section's width axis
 * stays in the XY plane and its depth axis faces the viewer, so S-curves read as
 * a sculpted ribbon; `twist` turns the section along the length. UVs: u runs
 * along the spine, v around the section.
 */
function sweep(
  spine: V3[],
  radius: (t: number) => number,
  {
    squash = 1,
    twist = 0,
    length = 160,
    around = 40,
  }: {
    squash?: number | ((t: number) => number)
    twist?: number
    length?: number
    around?: number
  } = {}
) {
  const curve = new THREE.CatmullRomCurve3(
    spine.map((p) => new THREE.Vector3(...p)),
    false,
    "centripetal"
  )
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const zAxis = new THREE.Vector3(0, 0, 1)
  for (let i = 0; i <= length; i++) {
    const t = i / length
    const point = curve.getPointAt(t)
    const tangent = curve.getTangentAt(t).normalize()
    const depth = zAxis
      .clone()
      .sub(tangent.clone().multiplyScalar(zAxis.dot(tangent)))
      .normalize()
    const width = new THREE.Vector3().crossVectors(depth, tangent).normalize()
    const r = radius(t)
    const turn = twist * t * t
    const depthScale = typeof squash === "number" ? squash : squash(t)
    for (let j = 0; j <= around; j++) {
      const a = (j / around) * Math.PI * 2 + turn
      const x = Math.cos(a) * r
      const z = Math.sin(a) * r * depthScale
      positions.push(
        point.x + width.x * x + depth.x * z,
        point.y + width.y * x + depth.y * z,
        point.z + width.z * x + depth.z * z
      )
      uvs.push(t, j / around)
    }
  }
  for (let i = 0; i < length; i++) {
    for (let j = 0; j < around; j++) {
      const a = i * (around + 1) + j
      const b = a + around + 1
      indices.push(a, b, a + 1, b, b + 1, a + 1)
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

/** Revolved form from [radius, height] stops, smoothly resampled. */
function lathe(stops: [number, number][], segments = 72) {
  const curve = new THREE.SplineCurve(stops.map(([r, y]) => new THREE.Vector2(r, y)))
  return new THREE.LatheGeometry(curve.getPoints(96), segments)
}

/* ── Achievement statuette: standing figure, arms folded on a sword ──────── */

function AchievementFigure({ metal }: { metal: THREE.Material }) {
  const torso = useDisposable(
    () =>
      lathe([
        [0.0, 1.25],
        [0.075, 1.262],
        [0.104, 1.31],
        [0.112, 1.37],
        [0.097, 1.455],
        [0.112, 1.545],
        [0.148, 1.645],
        [0.172, 1.722],
        [0.155, 1.772],
        [0.095, 1.797],
        [0.034, 1.808],
        [0.029, 1.84],
        [0.0, 1.846],
      ]),
    []
  )
  const leg = useDisposable(
    () =>
      lathe(
        [
          [0.0, 0.902],
          [0.05, 0.905],
          [0.054, 0.925],
          [0.04, 0.965],
          [0.05, 1.075],
          [0.043, 1.17],
          [0.06, 1.3],
          [0.066, 1.37],
          [0.0, 1.39],
        ],
        48
      ),
    []
  )
  const blade = useDisposable(() => new THREE.CylinderGeometry(0.017, 0.011, 0.6, 24), [])
  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh
            geometry={leg}
            position={[side * 0.05, 0, 0]}
            scale={[1, 1, 0.78]}
            material={metal}
          />
          <Orb at={[side * 0.05, 0.922, 0.035]} scale={[0.048, 0.024, 0.075]} material={metal} />
          <Limb
            points={[
              [side * 0.148, 1.735, 0],
              [side * 0.168, 1.665, 0.012],
              [side * 0.158, 1.588, 0.04],
              [side * 0.095, 1.585, 0.088],
              [side * 0.028, 1.6, 0.11],
            ]}
            radius={0.034}
            material={metal}
          />
        </group>
      ))}
      <mesh geometry={torso} scale={[1, 1, 0.6]} material={metal} />
      {/* Clasped hands, sword hilt above them, blade down to the feet. */}
      <Orb at={[0, 1.6, 0.112]} scale={[0.05, 0.046, 0.042]} material={metal} />
      <mesh position={[0, 1.655, 0.112]} material={metal}>
        <cylinderGeometry args={[0.012, 0.014, 0.07, 20]} />
      </mesh>
      <Orb at={[0, 1.695, 0.112]} scale={[0.02, 0.02, 0.02]} material={metal} />
      <mesh geometry={blade} position={[0, 1.27, 0.098]} rotation-x={-0.035} material={metal} />
      <Orb at={[0, 1.897, 0.004]} scale={[0.058, 0.082, 0.064]} material={metal} />
    </group>
  )
}

/* ── Ascent figure: twisting ribbon body, open ring, raised arm ──────────── */

function AscentFigure({ metal, textured }: { metal: THREE.Material; textured: THREE.Material }) {
  const body = useDisposable(
    () =>
      sweep(
        [
          [0.05, 0.682, 0],
          [0.0, 0.8, 0],
          [-0.07, 0.98, 0],
          [-0.035, 1.2, 0],
          [0.05, 1.4, 0],
          [0.035, 1.6, 0],
        ],
        profile([
          [0, 0.2],
          [0.06, 0.16],
          [0.22, 0.092],
          [0.44, 0.104],
          [0.64, 0.084],
          [0.86, 0.1],
          [1, 0.09],
        ]),
        // Round flared hem at the foot, flattening into a twisting ribbon above it.
        {
          squash: profile([
            [0, 0.92],
            [0.2, 0.62],
            [1, 0.66],
          ]),
          twist: Math.PI * 1.2,
        }
      ),
    []
  )
  return (
    <group>
      <mesh geometry={body} material={textured} />
      {/* Open ring in the chest. */}
      <mesh position={[0.02, 1.71, 0]} scale={[0.94, 1.06, 1]} material={metal}>
        <torusGeometry args={[0.112, 0.045, 32, 120]} />
      </mesh>
      {/* Raised arm from the left of the ring up to the head. */}
      <Limb
        points={[
          [-0.08, 1.79, 0],
          [-0.15, 1.9, -0.01],
          [-0.12, 2.02, -0.01],
          [-0.05, 2.075, -0.01],
        ]}
        radius={0.032}
        material={metal}
      />
      {/* Other arm from the right of the ring down to the hip. */}
      <Limb
        points={[
          [0.12, 1.77, 0],
          [0.19, 1.66, 0.01],
          [0.16, 1.54, 0.03],
          [0.09, 1.49, 0.045],
        ]}
        radius={0.032}
        material={metal}
      />
      {/* Neck and head. */}
      <Limb
        points={[
          [0.015, 1.84, 0],
          [0.005, 1.92, 0],
          [0.0, 1.97, 0],
        ]}
        radius={0.03}
        material={metal}
      />
      <Orb at={[0.0, 2.055, 0]} scale={[0.064, 0.098, 0.07]} material={metal} />
    </group>
  )
}

/** Gilded achievement and open-ring figures, sculpted after the catalogue photographs. */
export function AwardModel({
  award,
  config,
  layoutImage,
}: {
  award: AwardId
  config: PlaqueConfig
  layoutImage: string | null
}) {
  const plate = getPlate(config.plate)
  const wood = getWood(config.wood)
  // Cast figures are polished: the chosen metal sets colour and how mirror-like it reads.
  const figureRoughness = Math.min(plate.roughness * 0.5, 0.2)
  const metal = useDisposable(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: plate.color,
        metalness: plate.metalness,
        roughness: figureRoughness,
        clearcoat: 0.6,
        clearcoatRoughness: 0.08,
        envMapIntensity: 1.35,
      }),
    [config.plate]
  )
  const dots = useDisposable(
    () =>
      canvasTexture(
        512,
        (ctx, size) => {
          ctx.fillStyle = "#808080"
          ctx.fillRect(0, 0, size, size)
          // Diagonal hammered band: u runs along the body, v around it.
          for (let y = 0; y < size; y += 7) {
            for (let x = 0; x < size; x += 7) {
              const u = x / size
              const v = y / size
              const band = (v + u * 1.6) % 1
              if (u < 0.22 || u > 0.86 || band < 0.08 || band > 0.4) continue
              ctx.beginPath()
              ctx.arc(x + ((y / 7) % 2) * 3.5, y, 2.4, 0, Math.PI * 2)
              ctx.fillStyle = "#e8e8e8"
              ctx.fill()
            }
          }
        },
        false
      ),
    []
  )
  const textured = useDisposable(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: plate.color,
        metalness: plate.metalness,
        roughness: figureRoughness,
        clearcoat: 0.6,
        clearcoatRoughness: 0.08,
        envMapIntensity: 1.35,
        bumpMap: dots,
        bumpScale: 1.4,
      }),
    [config.plate, dots]
  )
  const woodMap = useDisposable(() => woodTexture(...wood.grain, wood.seed), [config.wood])
  const timber = useDisposable(
    () =>
      new THREE.MeshPhysicalMaterial({
        map: woodMap,
        roughness: config.finish === "gloss" ? 0.25 : 0.55,
        clearcoat: config.finish === "oil" ? 0 : 0.6,
      }),
    [woodMap, config.finish]
  )
  const stoneMap = useDisposable(
    () =>
      canvasTexture(512, (ctx, s) => {
        ctx.fillStyle = "#141614"
        ctx.fillRect(0, 0, s, s)
        for (let i = 0; i < 9; i++) {
          const y = i * 65
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.bezierCurveTo(150, y + 10, 210, y - 60, s, y + 140)
          ctx.strokeStyle = "rgba(210,202,177,.4)"
          ctx.lineWidth = 1
          ctx.stroke()
        }
      }),
    []
  )
  const stone = useDisposable(
    () => new THREE.MeshPhysicalMaterial({ map: stoneMap, roughness: 0.26, clearcoat: 0.65 }),
    [stoneMap]
  )
  const nameplate = useDisposable(
    () => new THREE.MeshStandardMaterial({ color: plate.color, metalness: 0.55, roughness: 0.5 }),
    [config.plate]
  )
  const lettering = useLettering(config, layoutImage)
  const isAchievement = award === "achievement"
  const plateWidth = isAchievement ? 0.56 : 0.32
  const plateHeight = plateWidth / 2.5
  const plateAt: V3 = isAchievement ? [0, 0.39, 0.269] : [0, 0.365, 0.425 + 0.009]
  return (
    <group>
      {isAchievement ? (
        <>
          <Block size={[0.86, 0.1, 0.66]} at={[0, 0.05, 0]} material={timber} />
          <Block size={[0.77, 0.06, 0.59]} at={[0, 0.13, 0]} material={metal} />
          <Block size={[0.68, 0.46, 0.52]} at={[0, 0.39, 0]} material={stone} />
          <mesh position={[0, 0.76, 0]} material={metal}>
            <cylinderGeometry args={[0.2, 0.2, 0.28, 64]} />
          </mesh>
          <AchievementFigure metal={metal} />
        </>
      ) : (
        <>
          <mesh position={[0, 0.05, 0]} rotation-y={Math.PI / 8} material={timber}>
            <cylinderGeometry args={[0.46, 0.51, 0.1, 8]} />
          </mesh>
          <mesh position={[0, 0.365, 0]} rotation-y={Math.PI / 8} material={timber}>
            <cylinderGeometry args={[0.46, 0.46, 0.53, 8]} />
          </mesh>
          <mesh position={[0, 0.652, 0]} rotation-y={Math.PI / 8} material={metal}>
            <cylinderGeometry args={[0.45, 0.46, 0.045, 8]} />
          </mesh>
          <AscentFigure metal={metal} textured={textured} />
        </>
      )}
      <Block size={[plateWidth, plateHeight, 0.012]} at={plateAt} material={nameplate} />
      <mesh position={[plateAt[0], plateAt[1], plateAt[2] + 0.007]}>
        <planeGeometry args={[(plateWidth * 560) / 600, (plateHeight * 200) / 240]} />
        <meshBasicMaterial map={lettering} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}
