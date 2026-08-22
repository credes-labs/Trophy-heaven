import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { BLOG } from "../../../../modules/blog"
import type BlogService from "../../../../modules/blog/service"

const CreateSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(120),
  description: z.string().max(500).nullable().optional(),
})

/** GET /admin/blog/categories */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<BlogService>(BLOG)
  const categories = await service.listCategories()
  res.json({ categories })
}

/** POST /admin/blog/categories */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = CreateSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid category payload.",
        details: parsed.error.issues.map((i) => ({ path: i.path.join("."), issue: i.message })),
      },
    })
  }

  const service = req.scope.resolve<BlogService>(BLOG)
  try {
    const category = await service.createCategory(parsed.data)
    res.status(201).json({ category })
  } catch (e) {
    const err = e as Error & { code?: string }
    if (err.code === "CONFLICT") {
      return res.status(409).json({ error: { code: "CONFLICT", message: err.message } })
    }
    throw e
  }
}
