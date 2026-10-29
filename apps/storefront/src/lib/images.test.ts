import { describe, expect, it } from "vitest"
import { localizeImageUrl } from "./images"

describe("localizeImageUrl", () => {
  it("strips the storefront origin and remaps legacy JPEG/PNG paths to WebP", () => {
    expect(localizeImageUrl("http://localhost:3000/images/catalog/sculpture-black-totem.jpg")).toBe(
      "/images/catalog/sculpture-black-totem.webp"
    )
    expect(localizeImageUrl("/images/catalog/plaque-studio.png")).toBe("/images/catalog/plaque-studio.webp")
    expect(localizeImageUrl("/images/hero/chair.png?v=2")).toBe("/images/hero/chair.webp?v=2")
  })

  it("points removed duplicate explore photographs at their catalog copies", () => {
    expect(localizeImageUrl("http://localhost:3000/images/explore/nova-oak.jpg")).toBe(
      "/images/catalog/tables-coffee.webp"
    )
  })

  it("leaves campaign units, the share card, external URLs and empty values alone", () => {
    expect(localizeImageUrl("/images/campaign/furniture-for-every-space.jpg")).toBe(
      "/images/campaign/furniture-for-every-space.jpg"
    )
    expect(localizeImageUrl("/images/og/og-default.jpg")).toBe("/images/og/og-default.jpg")
    expect(localizeImageUrl("https://res.cloudinary.com/x/catalog/a.jpg")).toBe("https://res.cloudinary.com/x/catalog/a.jpg")
    expect(localizeImageUrl(null)).toBeNull()
  })
})
