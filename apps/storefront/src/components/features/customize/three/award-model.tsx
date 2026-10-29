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

/** Gilded achievement and open-ring figures, modelled from the catalogue photographs. */
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
  const metal = useDisposable(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: plate.color,
        metalness: plate.metalness,
        roughness:
          config.finish === "gloss" ? 0.14 : config.finish === "oil" ? 0.42 : plate.roughness,
        clearcoat: 0.4,
      }),
    [config.plate, config.finish]
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
  const silhouette = useDisposable(() => {
    const s = new THREE.Shape()
    s.moveTo(-0.22, 0)
    s.bezierCurveTo(0.15, 0.19, -0.2, 0.57, -0.065, 1.08)
    s.bezierCurveTo(-0.01, 1.21, 0.18, 1.14, 0.13, 0.9)
    s.bezierCurveTo(0.025, 0.6, 0.19, 0.26, 0.15, 0)
    s.closePath()
    return new THREE.ExtrudeGeometry(s, {
      depth: 0.09,
      bevelSize: 0.035,
      bevelThickness: 0.035,
      bevelSegments: 5,
      curveSegments: 48,
    })
  }, [])
  const torso = useDisposable(
    () =>
      new THREE.LatheGeometry(
        [
          [0.08, 1.4],
          [0.125, 1.48],
          [0.105, 1.64],
          [0.15, 1.85],
          [0.19, 1.93],
          [0.13, 1.98],
          [0.045, 2.025],
        ].map(([x, y]) => new THREE.Vector2(x, y)),
        64
      ),
    []
  )
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
            <cylinderGeometry args={[0.22, 0.22, 0.28, 64]} />
          </mesh>
          <mesh geometry={torso} material={metal} scale={[1, 1, 0.65]} />
          {[-1, 1].map((s) => (
            <group key={s}>
              <Limb
                points={[
                  [s * 0.075, 0.95, 0.02],
                  [s * 0.075, 1.18, 0],
                  [s * 0.085, 1.48, 0],
                ]}
                radius={0.062}
                material={metal}
              />
              <Orb at={[s * 0.075, 0.935, 0.06]} scale={[0.075, 0.04, 0.12]} material={metal} />
              <Limb
                points={[
                  [s * 0.18, 1.93, 0],
                  [s * 0.19, 1.68, 0.04],
                  [s * 0.04, 1.74, 0.16],
                ]}
                radius={0.05}
                material={metal}
              />
            </group>
          ))}
          <Orb at={[0, 2.22, 0]} scale={[0.09, 0.14, 0.085]} material={metal} />
          <Orb at={[0, 2.055, 0]} scale={[0.045, 0.085, 0.045]} material={metal} />
          <mesh position={[0, 1.68, 0.16]} material={metal}>
            <cylinderGeometry args={[0.028, 0.042, 0.2, 32]} />
          </mesh>
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
          <mesh geometry={silhouette} position={[0, 0.69, -0.045]} material={metal} />
          <mesh position={[0, 1.97, 0]} scale={[1, 1.08, 0.8]} material={metal}>
            <torusGeometry args={[0.235, 0.052, 24, 96]} />
          </mesh>
          <Limb
            points={[
              [-0.2, 1.96, 0],
              [0, 2.21, 0],
              [0.21, 1.99, 0],
              [0.11, 1.66, 0],
            ]}
            radius={0.042}
            material={metal}
          />
          <Orb at={[0, 2.25, 0]} scale={[0.035, 0.08, 0.035]} material={metal} />
          <Orb at={[0, 2.39, 0]} scale={[0.075, 0.13, 0.068]} material={metal} />
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
