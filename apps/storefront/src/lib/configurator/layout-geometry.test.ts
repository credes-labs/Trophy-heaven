import { describe, expect, it } from "vitest"
import { CANVAS_SIZE } from "@/lib/design-2d"
import { artworkClipPath, plaqueCanvasLayout, remapRect } from "./layout-geometry"
import { FORMS, PLATE_SHAPES } from "./plaque"

describe("plaqueCanvasLayout", () => {
  it("keeps plate artwork inside the plate, and wood artwork across the face", () => {
    for (const form of FORMS) {
      for (const shape of PLATE_SHAPES) {
        const { face, plate, safeArea } = plaqueCanvasLayout({ form: form.id, pshape: shape.id })
        expect(safeArea.width).toBeGreaterThan(100)
        expect(safeArea.x + safeArea.width).toBeLessThanOrEqual(CANVAS_SIZE)
        if (shape.id === "none") {
          expect(safeArea.width).toBeGreaterThan(plate.width)
          expect(safeArea.x).toBeGreaterThanOrEqual(Math.floor(face.x))
          expect(safeArea.y).toBeGreaterThanOrEqual(Math.floor(face.y))
        } else {
          expect(safeArea.x).toBeGreaterThanOrEqual(Math.floor(plate.x))
          expect(safeArea.y).toBeGreaterThanOrEqual(Math.floor(plate.y))
          expect(safeArea.x + safeArea.width).toBeLessThanOrEqual(Math.ceil(plate.x + plate.width))
          expect(safeArea.y + safeArea.height).toBeLessThanOrEqual(Math.ceil(plate.y + plate.height))
        }
      }
    }
  })

  it("gives On the wood a larger field than the plate, clipped to the timber", () => {
    const plate = plaqueCanvasLayout({ form: "arch", pshape: "rect", art: "plate" })
    const wood = plaqueCanvasLayout({ form: "arch", pshape: "rect", art: "wood" })
    expect(wood.safeArea.width).toBeGreaterThan(plate.safeArea.width)
    expect(wood.safeArea.height).toBeGreaterThan(plate.plate.height)
    expect(wood.onWood).toBe(true)
    expect(artworkClipPath({ form: "arch", pshape: "rect", art: "wood" }).startsWith("M")).toBe(true)
    expect(artworkClipPath({ form: "arch", pshape: "rect", art: "wood" }).length).toBeGreaterThan(
      artworkClipPath({ form: "arch", pshape: "rect", art: "plate" }).length
    )
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
