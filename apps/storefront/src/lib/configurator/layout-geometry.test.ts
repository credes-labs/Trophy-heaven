import { describe, expect, it } from "vitest"
import { CANVAS_SIZE } from "@/lib/design-2d"
import { plaqueCanvasLayout, remapRect } from "./layout-geometry"
import { FORMS, PLATE_SHAPES } from "./plaque"

describe("plaqueCanvasLayout", () => {
  it("keeps the engraving safe area inside the plate and the canvas for every form and plate shape", () => {
    for (const form of FORMS) {
      for (const shape of PLATE_SHAPES) {
        const { plate, safeArea } = plaqueCanvasLayout({ form: form.id, pshape: shape.id })
        expect(safeArea.width).toBeGreaterThan(100)
        expect(safeArea.x).toBeGreaterThanOrEqual(Math.floor(plate.x))
        expect(safeArea.y).toBeGreaterThanOrEqual(Math.floor(plate.y))
        expect(safeArea.x + safeArea.width).toBeLessThanOrEqual(Math.ceil(plate.x + plate.width))
        expect(safeArea.y + safeArea.height).toBeLessThanOrEqual(Math.ceil(plate.y + plate.height))
        expect(safeArea.x + safeArea.width).toBeLessThanOrEqual(CANVAS_SIZE)
      }
    }
  })

  it("centres the plate horizontally", () => {
    const { plate } = plaqueCanvasLayout({ form: "arch", pshape: "rect" })
    expect(plate.x + plate.width / 2).toBeCloseTo(CANVAS_SIZE / 2)
  })
})

describe("remapRect", () => {
  it("maps centre to centre with a uniform scale", () => {
    const from = { x: 100, y: 100, width: 200, height: 100 }
    const to = { x: 0, y: 0, width: 100, height: 100 }
    const map = remapRect(from, to)
    expect(map.scale).toBe(0.5)
    expect(map.point(200, 150)).toEqual({ x: 50, y: 50 })
    expect(map.point(100, 150)).toEqual({ x: 0, y: 50 })
  })

  it("is the identity for equal rects", () => {
    const rect = { x: 10, y: 20, width: 30, height: 40 }
    const map = remapRect(rect, rect)
    expect(map.scale).toBe(1)
    expect(map.point(15, 25)).toEqual({ x: 15, y: 25 })
  })
})
