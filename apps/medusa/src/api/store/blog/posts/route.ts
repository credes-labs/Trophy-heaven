import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BLOG } from "../../../../modules/blog"
import type BlogService from "../../../../modules/blog/service"

/** GET /store/blog/posts — published posts with pagination + filters. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const limit = Math.min(Number(req.query.limit) || 12, 50)
  const offset = Math.max(Number(req.query.offset) || 0, 0)
  const category = typeof req.query.category === "string" ? req.query.category : undefined
  const q = typeof req.query.q === "string" ? req.query.q : undefined
  const tag = typeof req.query.tag === "string" ? req.query.tag : undefined

  const service = req.scope.resolve<BlogService>(BLOG)
  const result = await service.listPublished({ limit, offset, category, q, tag })
  res.json(result)
}

/** POST /store/blog/posts — storefront is read-only; creation is admin-only. */
export async function POST(_req: MedusaRequest, res: MedusaResponse) {
  res.setHeader("Allow", "GET")
  return res.status(405).json({
    error: {
      code: "METHOD_NOT_ALLOWED",
      message: "Creating posts via the store API is not allowed. Use the admin blog routes.",
    },
  })
}
