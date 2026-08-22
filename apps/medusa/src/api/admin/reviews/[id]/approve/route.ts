import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { REVIEWS } from "../../../../../modules/reviews"
import type ReviewsService from "../../../../../modules/reviews/service"

/** POST /admin/reviews/:id/approve */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ReviewsService>(REVIEWS)
  const existing = await service.retrieveProductReview(req.params.id).catch(() => null)
  if (!existing) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Review not found." } })
  }
  const review = await service.approve(req.params.id)
  res.json({ review })
}
