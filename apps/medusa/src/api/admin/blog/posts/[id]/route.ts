import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { BLOG } from "../../../../../modules/blog"
import type BlogService from "../../../../../modules/blog/service"

const UpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).optional(),
  content_md: z.string().min(1).optional(),
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

/** GET /admin/blog/posts/:id */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<BlogService>(BLOG)
  const post = await service.retrieveBlogPost(req.params.id).catch(() => null)
  if (!post) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Post not found." } })
  }
  res.json({ post })
}

/** PUT /admin/blog/posts/:id */
export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  const parsed = UpdateSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid update payload.",
        details: parsed.error.issues.map((i) => ({ path: i.path.join("."), issue: i.message })),
      },
    })
  }

  const service = req.scope.resolve<BlogService>(BLOG)
  const existing = await service.retrieveBlogPost(req.params.id).catch(() => null)
  if (!existing) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Post not found." } })
  }

  try {
    const post = await service.updatePost({ id: req.params.id, ...parsed.data })
    res.json({ post })
  } catch (e) {
    const err = e as Error & { code?: string }
    if (err.code === "CONFLICT") {
      return res.status(409).json({ error: { code: "CONFLICT", message: err.message } })
    }
    throw e
  }
}

/** DELETE /admin/blog/posts/:id */
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<BlogService>(BLOG)
  const existing = await service.retrieveBlogPost(req.params.id).catch(() => null)
  if (!existing) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Post not found." } })
  }
  await service.deleteBlogPosts(req.params.id)
  res.status(204).send()
}
