import { model } from "@medusajs/framework/utils"

export const WishlistItem = model.define("wishlist_item", {
  id: model.id({ prefix: "wish" }).primaryKey(),
  customer_id: model.text(),
  product_id: model.text(),
  variant_id: model.text().nullable(),
  added_at: model.dateTime(),
})
