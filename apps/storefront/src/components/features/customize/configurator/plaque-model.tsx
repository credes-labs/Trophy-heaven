"use client"

import { useEffect, useMemo } from "react"
import * as THREE from "three"
import { useThree } from "@react-three/fiber"
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js"
import { canvasTexture, roundedBox, useDisposable, woodTexture } from "@/lib/three/procedural"
import { rng } from "@/lib/three/draw"
import {
  engravingLines,
  getFinish,
  getFont,
  getPlate,
  getWood,
  inkFor,
  monogram,
  type BorderId,
  type EdgeId,
  type FormId,
  type PlaqueConfig,
  type PlateShapeId,
  type WoodId,
} from "@/lib/configurator/plaque"
import {
  emblem,
  faceDims,
  formOutline,
  insetOutline,
  plateOutline,
  plateRect,
  plateTextWidth,
  type Point,
} from "@/lib/configurator/shapes"
import {
  ENGRAVING_H,
  ENGRAVING_W,
  drawEmblem,
  drawEngraving,
  drawLayout,
  loadEngravingFonts,
  resolveFontFamily,
} from "@/lib/configurator/engraving"

export const DEPTH = 0.14

const EDGE_PROFILES: Record<EdgeId, { size: number; segments: number }> = {
  rounded: { size: 0.022, segments: 4 },
  chamfer: { size: 0.03, segments: 1 },
  square: { size: 0.004, segments: 1 },
}

/** Front face z for an edge profile (the bevel adds depth in front of the extrusion). */
export function faceZ(edge: EdgeId) {
  return DEPTH / 2 + EDGE_PROFILES[edge].size
}

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

/** A geometry rebuilt when its inputs change and disposed when replaced. */
function useGeometry<T extends THREE.BufferGeometry>(make: () => T, deps: readonly unknown[]): T {
  const geometry = useMemo(make, deps)
  useEffect(() => () => geometry.dispose(), [geometry])
  return geometry
}

const toShape = (points: Point[]) => new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)))

function useFaceGeometry(form: FormId, edge: EdgeId) {
  return useGeometry(() => {
    const { w, h } = faceDims(form)
    const profile = EDGE_PROFILES[edge]
    const extruded = new THREE.ExtrudeGeometry(toShape(formOutline(form, w, h)), {
      depth: DEPTH,
      bevelEnabled: true,
      bevelThickness: profile.size,
      bevelSize: profile.size,
      bevelSegments: profile.segments,
      curveSegments: 8,
    })
    extruded.translate(0, 0, -DEPTH / 2)
    if (edge !== "rounded") return extruded
    // Extrusions come out flat-shaded; welding shared side-wall vertices smooths the curves.
    const smooth = mergeVertices(extruded, 1e-4)
    smooth.computeVertexNormals()
    extruded.dispose()
    return smooth
  }, [form, edge])
}

/** Flat inlay ring(s) following the face outline. */
function useBorderGeometry(form: FormId, border: BorderId) {
  return useGeometry(() => {
    if (border === "none") return new THREE.BufferGeometry()
    const { w, h } = faceDims(form)
    const outline = formOutline(form, w, h)
    const ring = (margin: number, width: number) => {
      const shape = toShape(insetOutline(outline, w, h, margin))
      shape.holes.push(new THREE.Path(insetOutline(outline, w, h, margin + width).reverse().map(([x, y]) => new THREE.Vector2(x, y))))
      return new THREE.ShapeGeometry(shape, 8)
    }
    const rings = border === "double" ? [ring(0.07, 0.008), ring(0.095, 0.004)] : [ring(0.075, 0.008)]
    if (rings.length === 1) return rings[0]
    const merged = new THREE.BufferGeometry()
    const positions = rings.flatMap((g) => Array.from((g.toNonIndexed().attributes.position as THREE.BufferAttribute).array))
    merged.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
    merged.computeVertexNormals()
    rings.forEach((g) => g.dispose())
    return merged
  }, [form, border])
}

function usePlateGeometry(shape: PlateShapeId, width: number, height: number) {
  return useGeometry(() => {
    const geometry = new THREE.ExtrudeGeometry(toShape(plateOutline(shape, width, height)), {
      depth: 0.012,
      bevelEnabled: true,
      bevelThickness: 0.006,
      bevelSize: 0.006,
      bevelSegments: 2,
      curveSegments: 12,
    })
    geometry.translate(0, 0, -0.012)
    return geometry
  }, [shape, width, height])
}

function useCanvasTexture(width: number, height: number) {
  return useDisposable(() => {
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const t = new THREE.CanvasTexture(canvas)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    return t
  })
}

/** Engraving canvas → texture: the three lines, or the applied 2D layout. */
function useEngravingTexture(config: PlaqueConfig, layoutImage: string | null) {
  const invalidate = useThree((s) => s.invalidate)
  const texture = useCanvasTexture(ENGRAVING_W, ENGRAVING_H)
  const { title, name, detail } = engravingLines(config)
  const font = getFont(config.font)
  const ink = inkFor(config)
  const widthRatio = plateTextWidth(config.pshape)
  const align = config.align
  const custom = config.face === "custom" ? layoutImage : null

  useEffect(() => {
    let cancelled = false
    const ctx = (texture.image as HTMLCanvasElement).getContext("2d")
    if (!ctx) return
    const commit = () => {
      texture.needsUpdate = true
      invalidate()
    }
    if (custom) {
      const image = new Image()
      image.onload = () => {
        if (cancelled) return
        drawLayout(ctx, image, widthRatio)
        commit()
      }
      image.src = custom
    } else {
      const family = resolveFontFamily(font.cssVar)
      const draw = () => {
        if (cancelled) return
        drawEngraving(ctx, { title, name, detail }, font, family, ink, { align, widthRatio })
        commit()
      }
      draw()
      void loadEngravingFonts(font, family).then(draw)
    }
    return () => {
      cancelled = true
    }
  }, [texture, title, name, detail, font, ink, align, widthRatio, custom, invalidate])

  return texture
}

function useEmblemTexture(config: PlaqueConfig) {
  const invalidate = useThree((s) => s.invalidate)
  const texture = useCanvasTexture(256, 256)
  const kind = config.emblem
  const ink = inkFor(config)
  const initials = monogram(config)

  useEffect(() => {
    if (kind === "none") return
    const ctx = (texture.image as HTMLCanvasElement).getContext("2d")
    if (!ctx) return
    const family = resolveFontFamily("--font-playfair")
    const draw = () => {
      drawEmblem(ctx, kind, ink, initials, family)
      texture.needsUpdate = true
      invalidate()
    }
    draw()
    if (kind === "monogram") void document.fonts?.load(`italic 500 64px ${family}`).then(draw, () => undefined)
  }, [texture, kind, ink, initials, invalidate])

  return texture
}

/** The plaque face, inlay, plate, engraving, emblem and pins (no stand). */
export function PlaqueBody({ config, layoutImage }: { config: PlaqueConfig; layoutImage: string | null }) {
  const { w, h } = faceDims(config.form)
  const front = faceZ(config.edge)
  const face = useFaceGeometry(config.form, config.edge)
  const border = useBorderGeometry(config.form, config.border)
  const finish = getFinish(config.finish)
  const plate = getPlate(config.plate)
  const map = getWoodTexture(config.wood)
  const engraving = useEngravingTexture(config, layoutImage)
  const emblemMap = useEmblemTexture(config)
  const brushed = useDisposable(() => brushedTexture())
  const rect = plateRect(config.form, w, h)
  const plateGeo = usePlateGeometry(config.pshape, rect.width, rect.height)
  const mark = emblem(config.form, w, h)
  const pinX = rect.width / 2 - 0.045
  const pinY = rect.height / 2 - 0.045
  const plateZ = front + 0.002
  const plateFront = plateZ + 0.006
  const metalInk = config.fill === "gold" || (config.fill === "natural" && config.plate === "black")
  const plateMaterial = (
    <meshStandardMaterial
      color={plate.color}
      metalness={plate.metalness}
      roughness={plate.roughness}
      roughnessMap={plate.brushed ? brushed : null}
      envMapIntensity={1.3}
    />
  )

  return (
    <group>
      <mesh geometry={face} dispose={null}>
        <meshPhysicalMaterial
          map={map}
          roughness={finish.roughness}
          clearcoat={finish.clearcoat}
          clearcoatRoughness={0.25}
        />
      </mesh>

      {config.border !== "none" ? (
        <mesh geometry={border} dispose={null} position={[0, 0, front + 0.001]}>
          <meshStandardMaterial
            color={plate.color}
            metalness={plate.metalness}
            roughness={plate.roughness}
            side={THREE.DoubleSide}
            polygonOffset
            polygonOffsetFactor={-1}
          />
        </mesh>
      ) : null}

      <mesh geometry={plateGeo} dispose={null} position={[0, rect.cy, plateZ]}>
        {plateMaterial}
      </mesh>
      <mesh position={[0, rect.cy, plateFront + 0.0008]}>
        <planeGeometry args={[rect.width * 0.96, rect.height * 0.96]} />
        <meshStandardMaterial
          map={engraving}
          transparent
          depthWrite={false}
          metalness={metalInk ? 0.9 : 0.15}
          roughness={metalInk ? 0.3 : 0.75}
          polygonOffset
          polygonOffsetFactor={-2}
        />
      </mesh>
      {config.pshape === "rect"
        ? [
            [-pinX, -pinY],
            [pinX, -pinY],
            [-pinX, pinY],
            [pinX, pinY],
          ].map(([x, y]) => (
            <mesh key={`${x}:${y}`} position={[x, rect.cy + y, plateFront + 0.003]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.014, 0.016, 0.01, 20]} />
              <meshStandardMaterial color={plate.color} metalness={1} roughness={0.25} />
            </mesh>
          ))
        : null}

      {config.emblem !== "none" ? (
        <group position={[0, mark.cy, front + 0.008]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[mark.r, mark.r, 0.016, 64]} />
            {plateMaterial}
          </mesh>
          <mesh position={[0, 0, 0.0085]}>
            <circleGeometry args={[mark.r * 0.92, 48]} />
            <meshStandardMaterial
              map={emblemMap}
              transparent
              depthWrite={false}
              metalness={metalInk ? 0.9 : 0.3}
              roughness={0.4}
              polygonOffset
              polygonOffsetFactor={-2}
            />
          </mesh>
        </group>
      ) : null}
    </group>
  )
}

/** Plinth-top desk stand with a routed groove the plaque sits in. */
export function DeskStand({ wood, width }: { wood: WoodId; width: number }) {
  const map = getWoodTexture(wood)
  const geometry = useGeometry(() => roundedBox(width + 0.34, 0.2, 0.62, 0.035), [width])
  return (
    <mesh geometry={geometry} dispose={null} position={[0, 0.1, 0]}>
      <meshPhysicalMaterial map={map} roughness={0.55} clearcoat={0.3} clearcoatRoughness={0.35} />
    </mesh>
  )
}

const BRASS = { color: "#b8955a", metalness: 1, roughness: 0.3 }

/** Three-leg brass easel; the plaque rests on the front ledge. */
export function Easel({ width, height, lean }: { width: number; height: number; lean: number }) {
  const legLength = height + 0.55
  const legX = width * 0.32
  const topY = legLength * Math.cos(lean)
  const topZ = -0.1 - legLength * Math.sin(lean)
  const backAngle = 0.38
  const backLength = topY / Math.cos(backAngle)
  return (
    <group>
      {[-legX, legX].map((x) => (
        <mesh key={x} position={[x, (legLength / 2) * Math.cos(lean), -0.1 - (legLength / 2) * Math.sin(lean)]} rotation={[-lean, 0, 0]}>
          <cylinderGeometry args={[0.018, 0.022, legLength, 16]} />
          <meshStandardMaterial {...BRASS} />
        </mesh>
      ))}
      <mesh position={[0, topY / 2, topZ - (backLength / 2) * Math.sin(backAngle)]} rotation={[backAngle, 0, 0]}>
        <cylinderGeometry args={[0.016, 0.02, backLength, 16]} />
        <meshStandardMaterial {...BRASS} />
      </mesh>
      <mesh position={[0, 0.2, 0.02]}>
        <boxGeometry args={[width * 0.9, 0.035, 0.14]} />
        <meshStandardMaterial {...BRASS} />
      </mesh>
      <mesh position={[0, 0.235, 0.085]}>
        <boxGeometry args={[width * 0.9, 0.04, 0.014]} />
        <meshStandardMaterial {...BRASS} />
      </mesh>
    </group>
  )
}

/** Open presentation case: midnight leather shell, champagne velvet lining. */
export function PresentationBox({ width, height }: { width: number; height: number }) {
  const boxW = width + 0.5
  const base = useGeometry(() => roundedBox(boxW, 0.22, 1.05, 0.04), [boxW])
  const lid = useGeometry(() => roundedBox(boxW, height * 0.92, 0.09, 0.04), [boxW, height])
  const leather = <meshPhysicalMaterial color="#191d26" roughness={0.62} clearcoat={0.4} clearcoatRoughness={0.5} />
  const velvet = <meshStandardMaterial color="#e0d8c3" roughness={1} />
  return (
    <group>
      <mesh geometry={base} dispose={null} position={[0, 0.11, -0.05]}>
        {leather}
      </mesh>
      <mesh position={[0, 0.2205, -0.05]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[boxW - 0.12, 0.93]} />
        {velvet}
      </mesh>
      <group position={[0, 0.2, -0.56]} rotation={[-0.22, 0, 0]}>
        <mesh geometry={lid} dispose={null} position={[0, (height * 0.92) / 2, 0]}>
          {leather}
        </mesh>
        <mesh position={[0, (height * 0.92) / 2, 0.0455]}>
          <planeGeometry args={[boxW - 0.12, height * 0.92 - 0.12]} />
          {velvet}
        </mesh>
      </group>
      <mesh position={[0, 0.226, 0.38]}>
        <boxGeometry args={[boxW - 0.3, 0.014, 0.012]} />
        <meshStandardMaterial {...BRASS} />
      </mesh>
    </group>
  )
}
