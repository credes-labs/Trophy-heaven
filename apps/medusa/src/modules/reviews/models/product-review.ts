import { model } from "@medusajs/framework/utils"

export const ProductReview = model.define("product_review", {
  id: model.id({ prefix: "rev" }).primaryKey(),
  product_id: model.text(),
  customer_id: model.text(),
  order_id: model.text().nullable(),
  rating: model.number(),
  title: model.text().nullable(),
  body: model.text().nullable(),
  images: model.json().default([] as unknown as Record<string, unknown>),
  status: model.enum(["pending", "approved", "rejected"]).default("pending"),
  is_verified_purchase: model.boolean().default(false),
  helpful_count: model.number().default(0),
})
