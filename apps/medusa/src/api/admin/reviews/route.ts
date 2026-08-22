import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { REVIEWS } from "../../../modules/reviews"
import type ReviewsService from "../../../modules/reviews/service"

/** GET /admin/reviews — list reviews (optional status filter). */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const limit = Math.min(Number(req.query.limit) || 50, 100)
  const offset = Math.max(Number(req.query.offset) || 0, 0)
  const status = typeof req.query.status === "string" ? req.query.status : undefined
  const productId = typeof req.query.product_id === "string" ? req.query.product_id : undefined

  const filters: Record<string, unknown> = {}
  if (status) filters.status = status
  if (productId) filters.product_id = productId

  const service = req.scope.resolve<ReviewsService>(REVIEWS)
  const [reviews, count] = await service.listAndCountProductReviews(filters, {
    take: limit,
    skip: offset,
    order: { created_at: "DESC" },
  })
  res.json({ reviews, count, limit, offset })
}
