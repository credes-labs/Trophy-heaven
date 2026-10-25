import type { FormId, PlateShapeId } from "./plaque"

/** Plaque face proportions (8 × 10 in portrait), in scene units. */
export const PLAQUE_W = 1.6
export const PLAQUE_H = 2

/** Plate aspect — matches the engraving canvas (1024 × 576). */
export const PLATE_ASPECT = 576 / 1024

export type Point = [number, number]

/** Face width/height for a form; landscape turns the board on its side. */
export function faceDims(form: FormId): { w: number; h: number } {
  return form === "landscape" ? { w: PLAQUE_H, h: PLAQUE_W } : { w: PLAQUE_W, h: PLAQUE_H }
}

function arc(out: Point[], cx: number, cy: number, r: number, from: number, to: number, steps: number) {
  for (let i = 0; i <= steps; i++) {
    const a = from + ((to - from) * i) / steps
    out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r])
  }
}

function dedupe(pts: Point[]): Point[] {
  // Arcs share end points; triangulation dislikes zero-length edges.
  return pts.filter(([x, y], i) => {
    const [px, py] = pts[i === 0 ? pts.length - 1 : i - 1]
    return Math.hypot(x - px, y - py) > 1e-6
  })
}

/**
 * Counter-clockwise outline of a plaque face, origin at the bottom centre, y up.
 * Shared by the WebGL extrusion and the SVG fallback so both read the same.
 */
export function formOutline(form: FormId, w = PLAQUE_W, h = PLAQUE_H, steps = 24): Point[] {
  const half = w / 2
  const pts: Point[] = []

  if (form === "octagon") {
    const c = Math.min(w, h) * 0.2
    pts.push([-half + c, 0], [half - c, 0], [half, c], [half, h - c], [half - c, h], [-half + c, h], [-half, h - c], [-half, c])
    return pts
  }

  const foot = w * 0.04
  arc(pts, -half + foot, foot, foot, Math.PI, Math.PI * 1.5, 4)
  arc(pts, half - foot, foot, foot, -Math.PI / 2, 0, 4)

  if (form === "classic" || form === "landscape") {
    const r = Math.min(w, h) * 0.06
    arc(pts, half - r, h - r, r, 0, Math.PI / 2, 6)
    arc(pts, -half + r, h - r, r, Math.PI / 2, Math.PI, 6)
  } else if (form === "arch") {
    arc(pts, 0, h - half, half, 0, Math.PI, steps * 2)
  } else {
    // Pointed (drop) arch: two arcs meeting at the apex.
    const r = w * 0.62
    const theta = Math.acos((r - half) / r)
    const rise = r * Math.sin(theta)
    const spring = h - rise
    arc(pts, half - r, spring, r, 0, theta, steps)
    arc(pts, -half + r, spring, r, Math.PI - theta, Math.PI, steps)
  }
  return dedupe(pts)
}

/** The outline pulled in by `margin` on every side (scaled about the face centre). */
export function insetOutline(points: Point[], w: number, h: number, margin: number): Point[] {
  const sx = (w - margin * 2) / w
  const sy = (h - margin * 2) / h
  const cy = h / 2
  return points.map(([x, y]) => [x * sx, cy + (y - cy) * sy])
}

/** SVG path for an outline, flipped into a y-down viewBox of the given height. */
export function outlinePath(points: Point[], height: number, offsetX = 0, offsetY = 0): string {
  return (
    points
      .map(([x, y], i) => `${i ? "L" : "M"}${(x + offsetX).toFixed(3)} ${(height - y + offsetY).toFixed(3)}`)
      .join(" ") + " Z"
  )
}

/** Plate on the face (centre y, width, height), above the bottom margin. */
export function plateRect(form: FormId, w = PLAQUE_W, h = PLAQUE_H) {
  const width = w * (form === "landscape" ? 0.62 : 0.72)
  return { cy: h * (form === "landscape" ? 0.4 : 0.36), width, height: width * PLATE_ASPECT }
}

/** Counter-clockwise plate outline centred on the origin. */
export function plateOutline(shape: PlateShapeId, width: number, height: number): Point[] {
  const hw = width / 2
  const hh = height / 2
  const pts: Point[] = []
  if (shape === "oval") {
    for (let i = 0; i < 64; i++) {
      const a = (i / 64) * Math.PI * 2
      pts.push([Math.cos(a) * hw, Math.sin(a) * hh])
    }
    return pts
  }
  if (shape === "ribbon") {
    const notch = width * 0.07
    const wave = height * 0.06
    pts.push([-hw, -hh], [0, -hh + wave], [hw, -hh], [hw - notch, 0], [hw, hh], [0, hh + wave], [-hw, hh], [-hw + notch, 0])
    return pts
  }
  const r = height * 0.08
  arc(pts, hw - r, -hh + r, r, -Math.PI / 2, 0, 4)
  arc(pts, hw - r, hh - r, r, 0, Math.PI / 2, 4)
  arc(pts, -hw + r, hh - r, r, Math.PI / 2, Math.PI, 4)
  arc(pts, -hw + r, -hh + r, r, Math.PI, Math.PI * 1.5, 4)
  return dedupe(pts)
}

/** Share of the plate width engraving may use, so text stays clear of curved/notched ends. */
export function plateTextWidth(shape: PlateShapeId): number {
  return shape === "oval" ? 0.7 : shape === "ribbon" ? 0.76 : 0.86
}

/** Emblem roundel centre + radius, in the upper field of the face. */
export function emblem(form: FormId, w = PLAQUE_W, h = PLAQUE_H) {
  if (form === "landscape") return { cy: h * 0.8, r: w * 0.065 }
  return { cy: form === "classic" || form === "octagon" ? h * 0.74 : h * 0.72, r: w * 0.1 }
}
