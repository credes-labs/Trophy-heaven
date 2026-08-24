import { describe, expect, it } from "vitest"
import { collectionChildren, siteNavColumns } from "./constants"

describe("siteNavColumns", () => {
  it("puts live categories into the Collection flyout", () => {
    const { col1 } = siteNavColumns([
      { name: "Lighting", handle: "lighting" },
    ])
    const collection = col1.find((item) => item.id === "collection")
    expect(collection?.children?.some((child) => child.label === "Lighting")).toBe(true)
    expect(collection?.children?.some((child) => child.label === "Shop all")).toBe(true)
  })

  it("falls back to department links without categories", () => {
    const children = collectionChildren()
    expect(children.map((child) => child.label)).toContain("Furniture")
  })
})
