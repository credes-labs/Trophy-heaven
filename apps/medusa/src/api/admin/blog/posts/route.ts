import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { BLOG } from "../../../../modules/blog"
import type BlogService from "../../../../modules/blog/service"

const CreateSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  content_md: z.string().min(1),
  excerpt: z.string().max(500).nullable().optional(),
  cover_image_url: z.string().url().nullable().optional(),
  author_name: z.string().max(120).optional(),
  author_avatar_url: z.string().url().nullable().optional(),
  category_id: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  seo_title: z.string().max(200).nullable().optional(),
  seo_description: z.string().max(500).nullable().optional(),
  read_time_minutes: z.number().int().positive().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
})

/** GET /admin/blog/posts — all posts (any status). */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const limit = Math.min(Number(req.query.limit) || 50, 100)
  const offset = Math.max(Number(req.query.offset) || 0, 0)
  const status = typeof req.query.status === "string" ? req.query.status : undefined

  const service = req.scope.resolve<BlogService>(BLOG)
  const filters: Record<string, unknown> = {}
  if (status) filters.status = status

  const [posts, count] = await service.listAndCountBlogPosts(filters, {
    take: limit,
    skip: offset,
    order: { updated_at: "DESC" },
  })
  res.json({ posts, count, limit, offset })
}

/** POST /admin/blog/posts — create a post. */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = CreateSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid blog post payload.",
        details: parsed.error.issues.map((i) => ({ path: i.path.join("."), issue: i.message })),
      },
    })
  }

  const service = req.scope.resolve<BlogService>(BLOG)
  try {
    const post = await service.createPost(parsed.data)
    res.status(201).json({ post })
  } catch (e) {
    const err = e as Error & { code?: string }
    if (err.code === "CONFLICT") {
      return res.status(409).json({ error: { code: "CONFLICT", message: err.message } })
    }
    throw e
  }
}
