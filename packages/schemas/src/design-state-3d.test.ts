import { describe, it, expect } from "vitest"
import { Design3DState } from "./design-state-3d.js"

const validState: unknown = {
  version: 1,
  baseModelId: "cup",
  material: "polished_gold",
  engraving: {
    text: "Champion 2026",
    fontFamily: "Inter",
    surfaceAnchor: "front_plate",
  },
  logo: null,
  camera: { position: [0, 1, 3], target: [0, 0, 0] },
}

describe("Design3DState", () => {
  it("parses a valid 3D design state and applies defaults", () => {
    const parsed = Design3DState.parse(validState)
    expect(parsed.lod).toBe("auto")
    expect(parsed.environment).toBe("studio")
    expect(parsed.engraving?.method).toBe("texture")
  })

  it("round-trips losslessly", () => {
    const first = Design3DState.parse(validState)
    const roundTripped = Design3DState.parse(JSON.parse(JSON.stringify(first)))
    expect(roundTripped).toEqual(first)
  })

  it("rejects an unknown material", () => {
    const bad = { ...(validState as object), material: "plastic" }
    expect(Design3DState.safeParse(bad).success).toBe(false)
  })

  it("rejects a malformed camera tuple", () => {
    const bad = { ...(validState as object), camera: { position: [0, 1], target: [0, 0, 0] } }
    expect(Design3DState.safeParse(bad).success).toBe(false)
  })
})
