import type { HttpTypes } from "@medusajs/types"
import { formatMoney } from "./format"

/**
 * Standard shipping is free in India from this item total (Medusa: a ₹0 Standard
 * price with an `item_total >= 5000` rule, apps/medusa/src/scripts/free-shipping.ts).
 * Keep in step with the "Free shipping on orders above ₹5,000" copy.
 */
export const FREE_SHIPPING_MIN_INR = 5000

/**
 * Cart shipping line before and after a method is chosen: the real amount once
 * checkout set one; until then "Free" only when the order qualifies, otherwise
 * "At checkout" (shipping_total is 0 before a method exists, which is not free).
 */
export function cartShippingLabel(
  cart: Pick<HttpTypes.StoreCart, "shipping_total" | "item_subtotal" | "currency_code"> & {
    shipping_methods?: unknown[] | null
  } | null | undefined
): string {
  if (!cart) return "At checkout"
  const currency = cart.currency_code ?? "inr"
  if (cart.shipping_methods?.length) {
    const amount = cart.shipping_total ?? 0
    return amount <= 0 ? "Free" : formatMoney(amount, currency)
  }
  const qualifies = currency.toLowerCase() === "inr" && (cart.item_subtotal ?? 0) >= FREE_SHIPPING_MIN_INR
  return qualifies ? "Free" : "At checkout"
}
