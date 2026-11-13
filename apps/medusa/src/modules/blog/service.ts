import { MedusaService } from "@medusajs/framework/utils"
import { BlogCategory, BlogPost } from "./models/blog-post"

type ListPublishedOpts = {
  limit?: number
  offset?: number
  category?: string
  q?: string
  tag?: string
}

type CreatePostInput = {
  title: string
  slug: string
  content_md: string
  excerpt?: string | null
  cover_image_url?: string | null
  author_name?: string
  author_avatar_url?: string | null
  category_id?: string | null
  tags?: string[]
  seo_title?: string | null
  seo_description?: string | null
  read_time_minutes?: number
  status?: "draft" | "published" | "archived"
}

type UpdatePostInput = Partial<CreatePostInput> & { id: string }

class BlogService extends MedusaService({
  BlogPost,
  BlogCategory,
}) {
  async listPublished(opts: ListPublishedOpts = {}) {
    const limit = opts.limit ?? 12
    const offset = opts.offset ?? 0

    const filters: Record<string, unknown> = { status: "published" }

    if (opts.category) {
      const cats = await this.listBlogCategories({ slug: opts.category })
      if (!cats.length) {
        return { posts: [], count: 0, limit, offset }
      }
      filters.category_id = cats[0].id
    }

    if (opts.q) {
      filters.$or = [
        { title: { $ilike: `%${opts.q}%` } },
        { excerpt: { $ilike: `%${opts.q}%` } },
      ]
    }

    let [posts, count] = await this.listAndCountBlogPosts(filters, {
      take: limit,
      skip: offset,
      order: { published_at: "DESC" },
    })

    if (opts.tag) {
      posts = posts.filter((p) => {
        const tags = (p.tags as unknown as string[] | null) ?? []
        return tags.includes(opts.tag!)
      })
      count = posts.length
    }

    return { posts, count, limit, offset }
  }

  async getBySlug(slug: string) {
    const [post] = await this.listBlogPosts({ slug, status: "published" }, { take: 1 })
    return post ?? null
  }

  async createPost(data: CreatePostInput) {
    const existing = await this.listBlogPosts({ slug: data.slug }, { take: 1 })
    if (existing.length) {
      const err = new Error("A post with this slug already exists.") as Error & { code?: string }
      err.code = "CONFLICT"
      throw err
    }

    return this.createBlogPosts({
      title: data.title,
      slug: data.slug,
      content_md: data.content_md,
      excerpt: data.excerpt ?? null,
      cover_image_url: data.cover_image_url ?? null,
      author_name: data.author_name ?? "Trophy Heaven",
      author_avatar_url: data.author_avatar_url ?? null,
      category_id: data.category_id ?? null,
      tags: (data.tags ?? []) as unknown as Record<string, unknown>,
      seo_title: data.seo_title ?? null,
      seo_description: data.seo_description ?? null,
      read_time_minutes: data.read_time_minutes ?? 5,
      status: data.status ?? "draft",
      published_at: data.status === "published" ? new Date() : null,
      view_count: 0,
    })
  }

  async updatePost(data: UpdatePostInput) {
    const { id, ...rest } = data
    if (rest.slug) {
      const existing = await this.listBlogPosts({ slug: rest.slug }, { take: 1 })
      if (existing.length && existing[0].id !== id) {
        const err = new Error("A post with this slug already exists.") as Error & { code?: string }
        err.code = "CONFLICT"
        throw err
      }
    }
    const { tags, ...other } = rest
    return this.updateBlogPosts({
      id,
      ...other,
      ...(tags !== undefined
        ? { tags: tags as unknown as Record<string, unknown> }
        : {}),
    })
  }

  async publish(id: string) {
    return this.updateBlogPosts({
      id,
      status: "published",
      published_at: new Date(),
    })
  }

  async listCategories() {
    return this.listBlogCategories({}, { order: { name: "ASC" } })
  }

  async createCategory(data: {
    name: string
    slug: string
    description?: string | null
  }) {
    const existing = await this.listBlogCategories({ slug: data.slug }, { take: 1 })
    if (existing.length) {
      const err = new Error("A category with this slug already exists.") as Error & { code?: string }
      err.code = "CONFLICT"
      throw err
    }
    return this.createBlogCategories({
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
    })
  }
}

export default BlogService
