"use client"

/**
 * Procedural textures and geometry shared by the homepage WebGL sections.
 * Everything is drawn on a 2D canvas or built from primitives, so no assets ship.
 */

import { useEffect, useMemo } from "react"
import * as THREE from "three"
import { drawWood, rng } from "./draw"

export { rng }

export function canvasTexture(
  size: number,
  draw: (ctx: CanvasRenderingContext2D, s: number) => void,
  srgb = true,
) {
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = size
  draw(canvas.getContext("2d")!, size)
  const texture = new THREE.CanvasTexture(canvas)
  if (srgb) texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.anisotropy = 8
  return texture
}

export function woodTexture(base: string, dark: string, light: string, seed: number) {
  return canvasTexture(512, (ctx, s) => drawWood(ctx, s, base, dark, light, seed))
}

export function drawPebbles(
  ctx: CanvasRenderingContext2D,
  s: number,
  seed: number,
  base: string,
  inner: string,
  outer: string,
) {
  const random = rng(seed)
  ctx.fillStyle = base
  ctx.fillRect(0, 0, s, s)
  for (let i = 0; i < 2600; i++) {
    const x = random() * s
    const y = random() * s
    const rad = 3 + random() * 5
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, rad)
    gradient.addColorStop(0, inner)
    gradient.addColorStop(1, outer)
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x, y, rad, 0, Math.PI * 2)
    ctx.fill()
  }
}

/** Woven linen. `gray` gives the matching bump map. */
export function linenTexture(base: string, seed: number, gray: boolean) {
  return canvasTexture(
    256,
    (ctx, s) => {
      const random = rng(seed)
      const lo = gray ? "#000000" : "#3a2a1c"
      const hi = gray ? "#ffffff" : "#f3e6d2"
      ctx.fillStyle = base
      ctx.fillRect(0, 0, s, s)
      ctx.lineWidth = 1.2
      for (let i = 0; i < s; i += 2) {
        ctx.globalAlpha = 0.06 + random() * 0.16
        ctx.strokeStyle = random() > 0.5 ? lo : hi
        ctx.beginPath()
        ctx.moveTo(0, i + 0.5)
        ctx.lineTo(s, i + 0.5)
        ctx.stroke()
        ctx.globalAlpha = 0.06 + random() * 0.16
        ctx.strokeStyle = random() > 0.5 ? lo : hi
        ctx.beginPath()
        ctx.moveTo(i + 0.5, 0)
        ctx.lineTo(i + 0.5, s)
        ctx.stroke()
      }
      for (let i = 0; i < 170; i++) {
        const x = random() * s
        const y = random() * s
        const len = 12 + random() * 30
        const horiz = random() > 0.5
        ctx.globalAlpha = 0.1 + random() * 0.15
        ctx.strokeStyle = random() > 0.5 ? lo : hi
        ctx.lineWidth = 2 + random()
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(horiz ? x + len : x, horiz ? y : y + len)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    },
    !gray,
  )
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))

/** Box with rounded edges and analytic normals. */
export function roundedBox(w: number, h: number, d: number, r: number) {
  const step = r * 0.9
  const sx = Math.min(64, Math.ceil(w / step))
  const sy = Math.min(64, Math.ceil(h / step))
  const sz = Math.min(64, Math.ceil(d / step))
  const geometry = new THREE.BoxGeometry(w, h, d, sx, sy, sz)
  const position = geometry.attributes.position as THREE.BufferAttribute
  const normal = geometry.attributes.normal as THREE.BufferAttribute
  const vertex = new THREE.Vector3()
  const inner = new THREE.Vector3()
  const hx = w / 2 - r
  const hy = h / 2 - r
  const hz = d / 2 - r
  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i)
    inner.set(clamp(vertex.x, -hx, hx), clamp(vertex.y, -hy, hy), clamp(vertex.z, -hz, hz))
    vertex.sub(inner)
    if (vertex.lengthSq() > 0) vertex.normalize()
    normal.setXYZ(i, vertex.x, vertex.y, vertex.z)
    vertex.multiplyScalar(r).add(inner)
    position.setXYZ(i, vertex.x, vertex.y, vertex.z)
  }
  return geometry
}

/** Memo a texture or geometry and dispose it on unmount. */
export function useDisposable<T extends { dispose(): void }>(make: () => T): T {
  // Factory closes over nothing that changes; the object is created once.
  const obj = useMemo(make, [])
  useEffect(() => () => obj.dispose(), [obj])
  return obj
}
