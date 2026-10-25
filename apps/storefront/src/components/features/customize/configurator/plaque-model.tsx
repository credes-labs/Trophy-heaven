"use client"

import { useEffect, useMemo } from "react"
import * as THREE from "three"
import { useThree } from "@react-three/fiber"
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js"
import { canvasTexture, roundedBox, useDisposable, woodTexture } from "@/lib/three/procedural"
import { rng } from "@/lib/three/draw"
import {
  engravingLines,
  getFont,
  getPlate,
  getWood,
  type FormId,
  type PlaqueConfig,
  type WoodId,
} from "@/lib/configurator/plaque"
import { PLAQUE_W, emblem, formOutline, plateRect } from "@/lib/configurator/shapes"
import {
  ENGRAVING_H,
  ENGRAVING_W,
  drawEngraving,
  loadEngravingFonts,
  resolveFontFamily,
} from "@/lib/configurator/engraving"

export const DEPTH = 0.14
const BEVEL = 0.022
const FACE_Z = DEPTH / 2 + BEVEL

/** One grain texture per species, shared by face, stand and swatch-matching. */
const woodCache = new Map<WoodId, THREE.Texture>()

export function getWoodTexture(id: WoodId) {
  let texture = woodCache.get(id)
  if (!texture) {
    const spec = getWood(id)
    texture = woodTexture(spec.grain[0], spec.grain[1], spec.grain[2], spec.seed)
    texture.repeat.set(0.55, 0.55)
    woodCache.set(id, texture)
  }
  return texture
}

export function disposeWoodTextures() {
  for (const texture of woodCache.values()) texture.dispose()
  woodCache.clear()
}

/** Horizontal hairlines for a brushed-metal roughness map. */
function brushedTexture() {
  return canvasTexture(
    256,
    (ctx, s) => {
      const random = rng(3)
      ctx.fillStyle = "#9a9a9a"
      ctx.fillRect(0, 0, s, s)
      for (let y = 0; y < s; y++) {
        ctx.globalAlpha = 0.08 + random() * 0.22
        ctx.fillStyle = random() > 0.5 ? "#ffffff" : "#3a3a3a"
        ctx.fillRect(0, y, s, 1)
      }
      ctx.globalAlpha = 1
    },
    false,
  )
}

function useFaceGeometry(form: FormId) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape(formOutline(form).map(([x, y]) => new THREE.Vector2(x, y)))
    const extruded = new THREE.ExtrudeGeometry(shape, {
      depth: DEPTH,
      bevelEnabled: true,
      bevelThickness: BEVEL,
      bevelSize: BEVEL,
      bevelSegments: 4,
      curveSegments: 8,
    })
    extruded.translate(0, 0, -DEPTH / 2)
    // Extrusions come out flat-shaded; welding shared side-wall vertices smooths the curves.
    const smooth = mergeVertices(extruded, 1e-4)
    smooth.computeVertexNormals()
    extruded.dispose()
    return smooth
  }, [form])
  useEffect(() => () => geometry.dispose(), [geometry])
  return geometry
}

/** Engraving canvas → texture, redrawn when the copy, font or plate changes. */
function useEngravingTexture(config: PlaqueConfig) {
  const invalidate = useThree((s) => s.invalidate)
  const texture = useDisposable(() => {
    const canvas = document.createElement("canvas")
    canvas.width = ENGRAVING_W
    canvas.height = ENGRAVING_H
    const t = new THREE.CanvasTexture(canvas)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    return t
  })
  const { title, name, detail } = engravingLines(config)
  const font = getFont(config.font)
  const ink = getPlate(config.plate).ink

  useEffect(() => {
    let cancelled = false
    const family = resolveFontFamily(font.cssVar)
    const draw = () => {
      if (cancelled) return
      const ctx = (texture.image as HTMLCanvasElement).getContext("2d")
      if (!ctx) return
      drawEngraving(ctx, { title, name, detail }, font, family, ink)
      texture.needsUpdate = true
      invalidate()
    }
    draw()
    void loadEngravingFonts(font, family).then(draw)
    return () => {
      cancelled = true
    }
  }, [texture, title, name, detail, font, ink, invalidate])

  return texture
}

/** The plaque face, plate, engraving, emblem and pins (no stand). */
export function PlaqueBody({ config }: { config: PlaqueConfig }) {
  const face = useFaceGeometry(config.form)
  const wood = getWood(config.wood)
  const plate = getPlate(config.plate)
  const map = getWoodTexture(config.wood)
  const engraving = useEngravingTexture(config)
  const brushed = useDisposable(() => {
    const t = brushedTexture()
    t.repeat.set(1, 1)
    return t
  })
  const rect = plateRect()
  const plateGeo = useDisposable(() => roundedBox(rect.width, rect.height, 0.024, 0.01))
  const mark = emblem(config.form)
  const pinX = rect.width / 2 - 0.045
  const pinY = rect.height / 2 - 0.045
  const plateZ = FACE_Z + 0.012
  const inkIsMetal = config.plate === "black"

  return (
    <group>
      <mesh geometry={face} dispose={null}>
        <meshPhysicalMaterial
          map={map}
          roughness={wood.roughness}
          clearcoat={wood.clearcoat}
          clearcoatRoughness={0.35}
        />
      </mesh>

      <mesh geometry={plateGeo} dispose={null} position={[0, rect.cy, plateZ]}>
        <meshStandardMaterial
          color={plate.color}
          metalness={plate.metalness}
          roughness={plate.roughness}
          roughnessMap={config.plate === "brass" ? brushed : null}
          envMapIntensity={1.3}
        />
      </mesh>
      <mesh position={[0, rect.cy, plateZ + 0.0125]}>
        <planeGeometry args={[rect.width * 0.96, rect.height * 0.96]} />
        <meshStandardMaterial
          map={engraving}
          transparent
          depthWrite={false}
          metalness={inkIsMetal ? 0.9 : 0.15}
          roughness={inkIsMetal ? 0.3 : 0.75}
          polygonOffset
          polygonOffsetFactor={-2}
        />
      </mesh>
      {[
        [-pinX, -pinY],
        [pinX, -pinY],
        [-pinX, pinY],
        [pinX, pinY],
      ].map(([x, y]) => (
        <mesh key={`${x}:${y}`} position={[x, rect.cy + y, plateZ + 0.014]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.014, 0.016, 0.01, 20]} />
          <meshStandardMaterial color={plate.color} metalness={1} roughness={0.25} />
        </mesh>
      ))}

      <group position={[0, mark.cy, FACE_Z + 0.008]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[mark.r, mark.r, 0.016, 64]} />
          <meshStandardMaterial color={plate.color} metalness={plate.metalness} roughness={plate.roughness} />
        </mesh>
        <mesh position={[0, 0, 0.009]}>
          <torusGeometry args={[mark.r * 0.74, 0.006, 12, 64]} />
          <meshStandardMaterial color={plate.ink} metalness={inkIsMetal ? 1 : 0.4} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0, 0.009]} rotation={[0, 0, Math.PI / 4]}>
          <torusGeometry args={[mark.r * 0.32, 0.009, 4, 4]} />
          <meshStandardMaterial color={plate.ink} metalness={inkIsMetal ? 1 : 0.4} roughness={0.35} />
        </mesh>
      </group>
    </group>
  )
}

/** Plinth-top desk stand with a routed groove the plaque sits in. */
export function DeskStand({ wood }: { wood: WoodId }) {
  const spec = getWood(wood)
  const map = getWoodTexture(wood)
  const geometry = useDisposable(() => roundedBox(PLAQUE_W + 0.34, 0.2, 0.62, 0.035))
  return (
    <mesh geometry={geometry} dispose={null} position={[0, 0.1, 0]}>
      <meshPhysicalMaterial map={map} roughness={spec.roughness} clearcoat={spec.clearcoat} clearcoatRoughness={0.35} />
    </mesh>
  )
}
