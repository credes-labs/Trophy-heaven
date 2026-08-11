import { describe, it, expect } from "vitest"
import { buildDesign2DState, validateDesign2D, DEFAULT_SAFE_AREA } from "./design-2d"

const textInSafeArea = {
  type: "i-text",
  id: "t1",
  text: "Champion 2026",
  fontFamily: "Cinzel",
  fontSize: 48,
  fill: "#1a1a1a",
  left: DEFAULT_SAFE_AREA.x + 20,
  top: DEFAULT_SAFE_AREA.y + 20,
}

describe("buildDesign2DState", () => {
  it("produces a schema-shaped state with material + safe area", () => {
    const state = buildDesign2DState([textInSafeArea], { material: "gold" })
    expect(state.version).toBe(1)
    expect(state.materialOverlay).toBe("gold")
    expect(state.objects).toHaveLength(1)
    expect(state.objects[0]).toMatchObject({ type: "text", text: "Champion 2026" })
  })

  it("maps images to image objects", () => {
    const state = buildDesign2DState(
      [{ type: "image", id: "i1", src: "data:image/png;base64,AAAA", left: 200, top: 400 }],
      { material: null }
    )
    expect(state.objects[0].type).toBe("image")
  })
})

describe("validateDesign2D", () => {
  it("passes for text inside the safe area", () => {
    const state = buildDesign2DState([textInSafeArea], { material: "silver" })
    expect(validateDesign2D(state)).toHaveLength(0)
  })

  it("flags text outside the safe area", () => {
    const state = buildDesign2DState(
      [{ ...textInSafeArea, left: 5, top: 5 }],
      { material: null }
    )
    expect(validateDesign2D(state).some((e) => e.includes("safe area"))).toBe(true)
  })

  it("flags low-DPI logos", () => {
    const state = buildDesign2DState([textInSafeArea], { material: null })
    const errors = validateDesign2D(state, [{ naturalWidth: 100, displayWidthInches: 2 }])
    expect(errors.some((e) => e.includes("DPI"))).toBe(true)
  })

  it("flags overly long text", () => {
    const state = buildDesign2DState(
      [{ ...textInSafeArea, text: "x".repeat(200) }],
      { material: null }
    )
    expect(validateDesign2D(state).some((e) => e.includes("characters"))).toBe(true)
  })
})
