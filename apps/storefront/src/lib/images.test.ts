import { describe, expect, it } from "vitest"
import { localizeImageUrl } from "./images"

describe("localizeImageUrl", () => {
  it("strips the storefront origin and remaps legacy JPEG/PNG paths to WebP", () => {
    expect(localizeImageUrl("http://localhost:3000/images/catalog/trophy-figure-award.jpg")).toBe(
      "/images/catalog/trophy-figure-award.webp"
    )
    expect(localizeImageUrl("/images/catalog/plaque-studio.png")).toBe("/images/catalog/plaque-studio.webp")
    expect(localizeImageUrl("/images/hero/hero-workshop.png?v=2")).toBe("/images/hero/hero-workshop.webp?v=2")
  })

  it("leaves campaign units, the share card, external URLs and empty values alone", () => {
    expect(localizeImageUrl("/images/campaign/make-the-achievement-worth-remembering.jpg")).toBe(
      "/images/campaign/make-the-achievement-worth-remembering.jpg"
    )
    expect(localizeImageUrl("/images/og/og-default.jpg")).toBe("/images/og/og-default.jpg")
    expect(localizeImageUrl("https://res.cloudinary.com/x/catalog/a.jpg")).toBe("https://res.cloudinary.com/x/catalog/a.jpg")
    expect(localizeImageUrl(null)).toBeNull()
  })
})
