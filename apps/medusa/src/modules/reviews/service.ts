import { MedusaService } from "@medusajs/framework/utils"
import { ProductReview } from "./models/product-review"

type CreateReviewInput = {
  product_id: string
  customer_id: string
  rating: number
  title?: string | null
  body?: string | null
  images?: string[]
  order_id?: string | null
  is_verified_purchase?: boolean
}

type ListApprovedOpts = {
  productId: string
  limit?: number
  offset?: number
  sort?: "newest" | "highest" | "lowest" | "helpful"
  rating?: number
}

class ReviewsService extends MedusaService({
  ProductReview,
}) {
  async create(data: CreateReviewInput) {
    if (data.rating < 1 || data.rating > 5) {
      const err = new Error("Rating must be between 1 and 5.") as Error & { code?: string }
      err.code = "VALIDATION_ERROR"
      throw err
    }
    return this.createProductReviews({
      product_id: data.product_id,
      customer_id: data.customer_id,
      rating: data.rating,
      title: data.title ?? null,
      body: data.body ?? null,
      images: (data.images ?? []) as unknown as Record<string, unknown>,
      order_id: data.order_id ?? null,
      is_verified_purchase: data.is_verified_purchase ?? false,
      status: "pending",
      helpful_count: 0,
    })
  }

  async listApproved(opts: ListApprovedOpts) {
    const limit = opts.limit ?? 20
    const offset = opts.offset ?? 0
    const filters: Record<string, unknown> = {
      product_id: opts.productId,
      status: "approved",
    }
    if (opts.rating) {
      filters.rating = opts.rating
    }

    const orderMap = {
      newest: { created_at: "DESC" as const },
      highest: { rating: "DESC" as const },
      lowest: { rating: "ASC" as const },
      helpful: { helpful_count: "DESC" as const },
    }
    const order = orderMap[opts.sort ?? "newest"]

    const [reviews, count] = await this.listAndCountProductReviews(filters, {
      take: limit,
      skip: offset,
      order,
    })
    return { reviews, count, limit, offset }
  }

  async aggregate(productId: string) {
    const reviews = await this.listProductReviews({
      product_id: productId,
      status: "approved",
    })
    const distribution: Record<"1" | "2" | "3" | "4" | "5", number> = {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
    }
    let sum = 0
    for (const r of reviews) {
      const key = String(Math.round(r.rating)) as keyof typeof distribution
      if (key in distribution) {
        distribution[key] += 1
      }
      sum += r.rating
    }
    const average_rating = reviews.length ? Math.round((sum / reviews.length) * 10) / 10 : 0
    return { average_rating, distribution, count: reviews.length }
  }

  async markHelpful(id: string) {
    const review = await this.retrieveProductReview(id)
    return this.updateProductReviews({
      id,
      helpful_count: (review.helpful_count ?? 0) + 1,
    })
  }

  async approve(id: string) {
    return this.updateProductReviews({ id, status: "approved" })
  }

  async reject(id: string) {
    return this.updateProductReviews({ id, status: "rejected" })
  }
}

export default ReviewsService
