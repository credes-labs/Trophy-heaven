import type { HttpTypes } from "@medusajs/types"
import { variantInStock } from "@/lib/product-filters"
import type { PlaqueVariant } from "./plaque"

/** Medusa variants → the minimal size/price shape both studio modes share. */
export function toPlaqueVariants(product: HttpTypes.StoreProduct | null | undefined): PlaqueVariant[] {
  const sizeOptionId = product?.options?.find((o) => /size/i.test(o.title ?? ""))?.id
  return (product?.variants ?? []).map((v) => ({
    id: v.id,
    sizeLabel:
      v.options?.find((o) => o.option_id === sizeOptionId)?.value ?? v.options?.[0]?.value ?? v.title ?? "",
    amount: v.calculated_price?.calculated_amount ?? null,
    currency: v.calculated_price?.currency_code ?? "inr",
    inStock: variantInStock(v),
  }))
}
