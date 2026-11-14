import { describe, expect, it } from "vitest"
import { collectionChildren, siteNavLinks } from "./constants"

describe("siteNavLinks", () => {
  it("has no Collection item", () => {
    const links = siteNavLinks([{ name: "Lighting", handle: "lighting" }])
    expect(links.some((item) => item.id === "collection")).toBe(false)
    expect(links[0]?.id).toBe("shop")
  })
})

describe("collectionChildren", () => {
  it("falls back to department links without categories", () => {
    const children = collectionChildren()
    expect(children.map((child) => child.label)).toContain("Trophies")
  })
})
