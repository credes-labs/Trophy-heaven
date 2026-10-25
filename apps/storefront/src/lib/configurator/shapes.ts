import type { FormId } from "./plaque"

/** Plaque face proportions (8 × 10 in), in scene units. */
export const PLAQUE_W = 1.6
export const PLAQUE_H = 2

type Point = [number, number]

function arc(out: Point[], cx: number, cy: number, r: number, from: number, to: number, steps: number) {
  for (let i = 0; i <= steps; i++) {
    const a = from + ((to - from) * i) / steps
    out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r])
  }
}

/**
 * Counter-clockwise outline of a plaque face, origin at the bottom centre, y up.
 * Shared by the WebGL extrusion and the SVG fallback so both read the same.
 */
export function formOutline(form: FormId, w = PLAQUE_W, h = PLAQUE_H, steps = 24): Point[] {
  const half = w / 2
  const foot = w * 0.04
  const pts: Point[] = []
  arc(pts, -half + foot, foot, foot, Math.PI, Math.PI * 1.5, 4)
  arc(pts, half - foot, foot, foot, -Math.PI / 2, 0, 4)

  if (form === "classic") {
    const r = w * 0.06
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
  // Arcs share end points; triangulation dislikes zero-length edges.
  return pts.filter(([x, y], i) => {
    const [px, py] = pts[i === 0 ? pts.length - 1 : i - 1]
    return Math.hypot(x - px, y - py) > 1e-6
  })
}

/** SVG path for an outline, flipped into a y-down viewBox of the given height. */
export function outlinePath(points: Point[], height: number, offsetX = 0): string {
  return (
    points
      .map(([x, y], i) => `${i ? "L" : "M"}${(x + offsetX).toFixed(3)} ${(height - y).toFixed(3)}`)
      .join(" ") + " Z"
  )
}

/** Plate rectangle on the face (centre y, width, height), above the bottom margin. */
export function plateRect(w = PLAQUE_W, h = PLAQUE_H) {
  return { cy: h * 0.36, width: w * 0.72, height: w * 0.4 }
}

/** Emblem roundel centre + radius, in the upper field of the face. */
export function emblem(form: FormId, w = PLAQUE_W, h = PLAQUE_H) {
  return { cy: form === "classic" ? h * 0.74 : h * 0.72, r: w * 0.1 }
}
