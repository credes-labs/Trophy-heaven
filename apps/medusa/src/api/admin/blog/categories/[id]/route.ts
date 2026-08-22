import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { BLOG } from "../../../../../modules/blog"
import type BlogService from "../../../../../modules/blog/service"

const UpdateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  slug: z.string().min(1).max(120).optional(),
  description: z.string().max(500).nullable().optional(),
})

/** PUT /admin/blog/categories/:id */
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
  const existing = await service.retrieveBlogCategory(req.params.id).catch(() => null)
  if (!existing) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Category not found." } })
  }

  if (parsed.data.slug && parsed.data.slug !== existing.slug) {
    const clash = await service.listBlogCategories({ slug: parsed.data.slug }, { take: 1 })
    if (clash.length) {
      return res.status(409).json({
        error: { code: "CONFLICT", message: "A category with this slug already exists." },
      })
    }
  }

  const category = await service.updateBlogCategories({ id: req.params.id, ...parsed.data })
  res.json({ category })
}

/** DELETE /admin/blog/categories/:id */
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<BlogService>(BLOG)
  const existing = await service.retrieveBlogCategory(req.params.id).catch(() => null)
  if (!existing) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Category not found." } })
  }
  await service.deleteBlogCategories(req.params.id)
  res.status(204).send()
}
