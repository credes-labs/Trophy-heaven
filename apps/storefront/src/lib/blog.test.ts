import { describe, expect, it } from "vitest"
import { journalCoverSrc } from "./blog"

describe("journalCoverSrc", () => {
  it("keeps an uploaded cover after localizing the origin", () => {
    expect(
      journalCoverSrc({
        slug: "any",
        cover_image_url: "http://localhost:3000/images/blog/blog-materials.webp",
      })
    ).toBe("/images/blog/blog-materials.webp")
  })

  it("picks a stable workshop fallback when Medusa has no cover", () => {
    const a = journalCoverSrc({ slug: "full-verify-post", cover_image_url: null })
    const b = journalCoverSrc({ slug: "full-verify-post", cover_image_url: null })
    expect(a).toMatch(/^\/images\/blog\/blog-/)
    expect(a).toBe(b)
  })
})
