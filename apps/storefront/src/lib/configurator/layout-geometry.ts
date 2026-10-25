import { CANVAS_SIZE } from "@/lib/design-2d"
import type { PlaqueConfig } from "./plaque"
import { faceDims, plateRect, plateTextWidth } from "./shapes"

/** Fraction of the 2D canvas the whole plaque face may occupy. */
const FIT = 0.95

/** Share of the plate height the engraving may use (mirrors engraving.drawLayout). */
export const PLATE_TEXT_HEIGHT = 0.86

export type Rect = { x: number; y: number; width: number; height: number }

/**
 * Maps the plaque (scene units, origin bottom-centre, y up) onto the 800px 2D
 * canvas (y down). The engraving safe area is exactly the plate's text box, so
 * a PNG of the safe area drops onto the 3D plate without re-fitting.
 */
export function plaqueCanvasLayout(config: Pick<PlaqueConfig, "form" | "pshape">) {
  const { w, h } = faceDims(config.form)
  const scale = (CANVAS_SIZE * FIT) / Math.max(w, h)
  const originX = CANVAS_SIZE / 2
  const originY = CANVAS_SIZE / 2 + (h * scale) / 2
  const rect = plateRect(config.form, w, h, config.pshape)
  const plate: Rect = {
    x: originX - (rect.width * scale) / 2,
    y: originY - (rect.cy + rect.height / 2) * scale,
    width: rect.width * scale,
    height: rect.height * scale,
  }
  const ratio = plateTextWidth(config.pshape)
  const safeArea: Rect = {
    x: Math.round(originX - (plate.width * ratio) / 2),
    y: Math.round(plate.y + (plate.height * (1 - PLATE_TEXT_HEIGHT)) / 2),
    width: Math.round(plate.width * ratio),
    height: Math.round(plate.height * PLATE_TEXT_HEIGHT),
  }
  return { w, h, scale, originX, originY, plate, safeArea }
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
