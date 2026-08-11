import { describe, it, expect } from "vitest"
import { Design2DState, Text2DObject, Image2DObject } from "./design-state-2d.js"

const validText: unknown = {
  type: "text",
  id: "obj_text_1",
  text: "Champion 2026",
  fontFamily: "Inter",
  fontSize: 48,
  fill: "#1a1a1a",
  textAlign: "center",
  left: 100,
  top: 200,
}

const validImage: unknown = {
  type: "image",
  id: "obj_img_1",
  src: "https://cdn.example.com/logos/acme.png",
  originalFormat: "png",
  left: 50,
  top: 60,
}

const validState: unknown = {
  version: 1,
  canvas: { width: 800, height: 800, background: "#ffffff" },
  baseImageUrl: "https://cdn.example.com/bases/cup.png",
  materialOverlay: "gold",
  engravingSafeArea: { x: 100, y: 500, width: 600, height: 150 },
  objects: [validText, validImage],
}

describe("Design2DState", () => {
  it("parses a valid 2D design state and applies defaults", () => {
    const parsed = Design2DState.parse(validState)
    expect(parsed.version).toBe(1)
    expect(parsed.objects).toHaveLength(2)
    const text = parsed.objects[0] as { fontWeight: string; angle: number }
    expect(text.fontWeight).toBe("normal") // default applied
    expect(text.angle).toBe(0)
  })

  it("round-trips losslessly: parse -> stringify -> parse deep-equals", () => {
    const first = Design2DState.parse(validState)
    const roundTripped = Design2DState.parse(JSON.parse(JSON.stringify(first)))
    expect(roundTripped).toEqual(first)
  })

  it("rejects an object with an unknown discriminator type", () => {
    const bad = { ...(validState as object), objects: [{ ...(validText as object), type: "video" }] }
    expect(Design2DState.safeParse(bad).success).toBe(false)
  })

  it("rejects a wrong version literal", () => {
    const bad = { ...(validState as object), version: 2 }
    expect(Design2DState.safeParse(bad).success).toBe(false)
  })

  it("Text2DObject requires a positive fontSize", () => {
    expect(Text2DObject.safeParse({ ...(validText as object), fontSize: -1 }).success).toBe(false)
  })

  it("Image2DObject requires a valid URL src", () => {
    expect(Image2DObject.safeParse({ ...(validImage as object), src: "not-a-url" }).success).toBe(
      false
    )
  })
})
