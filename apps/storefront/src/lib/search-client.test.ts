import { describe, expect, it } from "vitest"
import { facetValueLabel } from "./search-client"

describe("facetValueLabel", () => {
  it("uses the catalog customization labels", () => {
    expect(facetValueLabel("customization_level", "none")).toBe("Standard product")
    expect(facetValueLabel("customization_level", "text_only")).toBe("Text engraving")
  })

  it("uses the price tier map and title-cases materials", () => {
    expect(facetValueLabel("price_tier", "5000_15000")).toBe("₹5,000–₹15,000")
    expect(facetValueLabel("material", "brass")).toBe("Brass")
    expect(facetValueLabel("material", "oak")).toBe("Oak")
  })

  it("leaves category names as indexed", () => {
    expect(facetValueLabel("category", "Corporate Awards")).toBe("Corporate Awards")
  })
})
