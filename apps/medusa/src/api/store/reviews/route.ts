import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { z } from "zod"
import { REVIEWS } from "../../../modules/reviews"
import type ReviewsService from "../../../modules/reviews/service"
import { getActorId } from "../../../lib/auth-context"
import { isSameNonNullId } from "../../../lib/design-ownership"

const CreateSchema = z.object({
  product_id: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(160).nullable().optional(),
  body: z.string().max(5000).nullable().optional(),
  images: z.array(z.string().url()).max(6).optional(),
  order_id: z.string().nullable().optional(),
})

/** GET /store/reviews?product_id= — approved reviews + aggregate. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const productId = typeof req.query.product_id === "string" ? req.query.product_id : null
  if (!productId) {
    return res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "product_id query parameter is required." },
    })
  }

  const limit = Math.min(Number(req.query.limit) || 20, 50)
  const offset = Math.max(Number(req.query.offset) || 0, 0)
  const sortRaw = typeof req.query.sort === "string" ? req.query.sort : "newest"
  const sort = (["newest", "highest", "lowest", "helpful"] as const).includes(
    sortRaw as "newest"
  )
    ? (sortRaw as "newest" | "highest" | "lowest" | "helpful")
    : "newest"
  const rating = req.query.rating ? Number(req.query.rating) : undefined

  const service = req.scope.resolve<ReviewsService>(REVIEWS)
  const [{ reviews, count }, aggregate] = await Promise.all([
    service.listApproved({ productId, limit, offset, sort, rating }),
    service.aggregate(productId),
  ])

  res.json({
    reviews,
    count,
    average_rating: aggregate.average_rating,
    distribution: aggregate.distribution,
  })
}

/** POST /store/reviews — submit a review (auth required). */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const customerId = getActorId(req)
  if (!customerId) {
    return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Sign in required." } })
  }

  const parsed = CreateSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid review payload.",
        details: parsed.error.issues.map((i) => ({ path: i.path.join("."), issue: i.message })),
      },
    })
  }

  const service = req.scope.resolve<ReviewsService>(REVIEWS)
  const existing = await service.listProductReviews(
    { customer_id: customerId, product_id: parsed.data.product_id },
    { take: 1 }
  )
  if (existing.length) {
    return res.status(409).json({
      error: { code: "CONFLICT", message: "You have already reviewed this product." },
    })
  }

  let isVerified = false
  if (parsed.data.order_id) {
    const orderModule = req.scope.resolve(Modules.ORDER)
    const order = await orderModule
      .retrieveOrder(parsed.data.order_id, { relations: ["items"] })
      .catch(() => null)
    if (
      order &&
      isSameNonNullId(order.customer_id, customerId) &&
      (order.items ?? []).some((item) => item.product_id === parsed.data.product_id)
    ) {
      isVerified = true
    }
  }

  try {
    const review = await service.create({
      ...parsed.data,
      customer_id: customerId,
      is_verified_purchase: isVerified,
      order_id: isVerified ? parsed.data.order_id : null,
    })
    res.status(201).json({ review })
  } catch (e) {
    const err = e as Error & { code?: string }
    if (err.code === "VALIDATION_ERROR") {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: err.message } })
    }
    throw e
  }
}
