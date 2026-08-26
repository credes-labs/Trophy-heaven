import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { REVIEWS } from "../../../../../modules/reviews"
import type ReviewsService from "../../../../../modules/reviews/service"
import { getActorId } from "../../../../../lib/auth-context"

/** POST /store/reviews/:id/helpful — increment helpful count (signed-in only). */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const customerId = getActorId(req)
  if (!customerId) {
    return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Sign in required." } })
  }
  const service = req.scope.resolve<ReviewsService>(REVIEWS)
  try {
    const review = await service.markHelpful(req.params.id)
    res.json({ helpful_count: review.helpful_count })
  } catch {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Review not found." } })
  }
}
