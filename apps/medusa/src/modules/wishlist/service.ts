import { MedusaService } from "@medusajs/framework/utils"
import { WishlistItem } from "./models/wishlist-item"

class WishlistService extends MedusaService({
  WishlistItem,
}) {
  async listByCustomer(customerId: string) {
    const [items, count] = await this.listAndCountWishlistItems(
      { customer_id: customerId },
      { order: { added_at: "DESC" } }
    )
    return { items, count }
  }

  async add(customerId: string, productId: string, variantId?: string | null) {
    const existing = await this.listWishlistItems(
      {
        customer_id: customerId,
        product_id: productId,
        ...(variantId ? { variant_id: variantId } : {}),
      },
      { take: 1 }
    )
    if (existing.length) {
      const err = new Error("Product is already in the wishlist.") as Error & { code?: string }
      err.code = "CONFLICT"
      throw err
    }
    return this.createWishlistItems({
      customer_id: customerId,
      product_id: productId,
      variant_id: variantId ?? null,
      added_at: new Date(),
    })
  }

  async remove(id: string, customerId: string) {
    const item = await this.retrieveWishlistItem(id).catch(() => null)
    if (!item) {
      const err = new Error("Wishlist item not found.") as Error & { code?: string }
      err.code = "NOT_FOUND"
      throw err
    }
    if (item.customer_id !== customerId) {
      const err = new Error("Not allowed to remove this wishlist item.") as Error & {
        code?: string
      }
      err.code = "FORBIDDEN"
      throw err
    }
    await this.deleteWishlistItems(id)
    return item
  }

  async toggle(customerId: string, productId: string, variantId?: string | null) {
    const existing = await this.listWishlistItems(
      {
        customer_id: customerId,
        product_id: productId,
        ...(variantId ? { variant_id: variantId } : {}),
      },
      { take: 1 }
    )
    if (existing.length) {
      await this.deleteWishlistItems(existing[0].id)
      return { action: "removed" as const, item: existing[0] }
    }
    const item = await this.createWishlistItems({
      customer_id: customerId,
      product_id: productId,
      variant_id: variantId ?? null,
      added_at: new Date(),
    })
    return { action: "added" as const, item }
  }
}

export default WishlistService
