import { describe, expect, it } from "vitest"
import { categoryForPost, journalCoverSrc, type BlogPost } from "./blog"

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

describe("categoryForPost", () => {
  const news = { id: "cat_news", name: "News", slug: "news", description: null }
  it("resolves a category the API embedded as only an id", () => {
    const post = { category_id: "cat_news", category: { id: "cat_news" } } as unknown as BlogPost
    expect(categoryForPost(post, [news])?.slug).toBe("news")
  })
  it("keeps a fully embedded category and returns null without one", () => {
    expect(categoryForPost({ category: news } as unknown as BlogPost, [])?.name).toBe("News")
    expect(categoryForPost({ category_id: null } as unknown as BlogPost, [news])).toBeNull()
  })
})
