import { describe, it, expect } from "vitest"
import {
  buildDesign3DState,
  editorValuesFromState,
  validateDesign3D,
  material2DTo3D,
  material3DTo2D,
  type Editor3DValues,
} from "./design-3d"

const values: Editor3DValues = {
  baseModelId: "classic-cup",
  material: "polished_gold",
  environment: "studio",
  engravingText: "Champion 2026",
  engravingFont: "Cinzel",
  logoUrl: null,
  lod: "auto",
}

describe("buildDesign3DState", () => {
  it("produces a schema-shaped 3D state with engraving", () => {
    const state = buildDesign3DState(values)
    expect(state.version).toBe(1)
    expect(state.material).toBe("polished_gold")
    expect(state.engraving?.text).toBe("Champion 2026")
    expect(state.logo).toBeNull()
  })

  it("round-trips through editorValuesFromState losslessly", () => {
    const state = buildDesign3DState(values)
    const back = editorValuesFromState(state)
    expect(back).toMatchObject({
      baseModelId: "classic-cup",
      material: "polished_gold",
      engravingText: "Champion 2026",
    })
  })
})

describe("validateDesign3D", () => {
  it("passes for a valid state", () => {
    expect(validateDesign3D(buildDesign3DState(values))).toHaveLength(0)
  })
  it("flags overly long engraving", () => {
    const state = buildDesign3DState({ ...values, engravingText: "x".repeat(80) })
    expect(validateDesign3D(state).some((e) => e.includes("characters"))).toBe(true)
  })
})

describe("2D<->3D material sync", () => {
  it("maps 2D materials to 3D and back", () => {
    expect(material2DTo3D("gold")).toBe("polished_gold")
    expect(material3DTo2D("polished_gold")).toBe("gold")
    expect(material3DTo2D(material2DTo3D("rose_gold"))).toBe("rose_gold")
  })
})
