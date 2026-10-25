import { CANVAS_SIZE } from "@/lib/design-2d"
import { artworkOnWood, type PlaqueConfig } from "./plaque"
import { faceDims, formOutline, plateOutline, plateRect, plateTextWidth, type Point } from "./shapes"

/** Fraction of the 2D canvas the whole plaque face may occupy. */
const FIT = 0.95

/** Share of the plate height the engraving may use (mirrors engraving.drawLayout). */
export const PLATE_TEXT_HEIGHT = 0.86

/** Margin inside the wooden face for artwork placed "On the wood". Shared with the 3D decal. */
export const FACE_ART_INSET = 0.04

export type Rect = { x: number; y: number; width: number; height: number }

export type PlaqueLayoutInput = Pick<PlaqueConfig, "form" | "pshape"> & { art?: PlaqueConfig["art"] }

/**
 * Maps the plaque (scene units, origin bottom-centre, y up) onto the 800px 2D
 * canvas (y down). Plate artwork uses the plate's text box. Wood artwork uses
 * the face, so a PNG of that area drops onto the timber without re-fitting.
 */
function insetRect(rect: Rect, margin: number): Rect {
  return {
    x: Math.round(rect.x + rect.width * margin),
    y: Math.round(rect.y + rect.height * margin),
    width: Math.round(rect.width * (1 - margin * 2)),
    height: Math.round(rect.height * (1 - margin * 2)),
  }
}

function canvasPath(points: Point[], originX: number, originY: number, scale: number) {
  return (
    points
      .map(([x, y], i) => `${i ? "L" : "M"}${(originX + x * scale).toFixed(2)} ${(originY - y * scale).toFixed(2)}`)
      .join(" ") + "Z"
  )
}

export function plaqueCanvasLayout(config: PlaqueLayoutInput) {
  const { w, h } = faceDims(config.form)
  const scale = (CANVAS_SIZE * FIT) / Math.max(w, h)
  const originX = CANVAS_SIZE / 2
  const originY = CANVAS_SIZE / 2 + (h * scale) / 2
  const rect = plateRect(config.form, w, h, config.pshape)
  const face: Rect = {
    x: originX - (w * scale) / 2,
    y: originY - h * scale,
    width: w * scale,
    height: h * scale,
  }
  const plate: Rect = {
    x: originX - (rect.width * scale) / 2,
    y: originY - (rect.cy + rect.height / 2) * scale,
    width: rect.width * scale,
    height: rect.height * scale,
  }
  const onWood = artworkOnWood(config)
  const ratio = plateTextWidth(config.pshape)
  const safeArea: Rect = onWood
    ? insetRect(face, FACE_ART_INSET)
    : {
        x: Math.round(originX - (plate.width * ratio) / 2),
        y: Math.round(plate.y + (plate.height * (1 - PLATE_TEXT_HEIGHT)) / 2),
        width: Math.round(plate.width * ratio),
        height: Math.round(plate.height * PLATE_TEXT_HEIGHT),
      }
  return { w, h, scale, originX, originY, face, plate, safeArea, onWood }
}

/** SVG/CSS path, in 2D-canvas pixels, that clips artwork to the wood or to the plate. */
export function artworkClipPath(config: PlaqueLayoutInput) {
  const { w, h, scale, originX, originY } = plaqueCanvasLayout(config)
  if (artworkOnWood(config)) return canvasPath(formOutline(config.form, w, h), originX, originY, scale)
  const rect = plateRect(config.form, w, h, config.pshape)
  const placed = plateOutline(config.pshape, rect.width, rect.height).map(([x, y]) => [x, y + rect.cy] as Point)
  return canvasPath(placed, originX, originY, scale)
}

/** Uniform scale + translation that carries content from one safe area to another (centres aligned). */
export function remapRect(from: Rect, to: Rect) {
  const s = Math.min(to.width / from.width, to.height / from.height)
  const fromCx = from.x + from.width / 2
  const fromCy = from.y + from.height / 2
  const toCx = to.x + to.width / 2
  const toCy = to.y + to.height / 2
  return {
    scale: s,
    point: (x: number, y: number) => ({ x: toCx + (x - fromCx) * s, y: toCy + (y - fromCy) * s }),
  }
}
