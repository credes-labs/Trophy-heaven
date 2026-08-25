"use client"

import Link from "next/link"
import type { HttpTypes } from "@medusajs/types"
import { EditorialProductCard } from "@/components/features/shop/editorial-product-card"

export function RelatedProducts({
  products,
  categoryLabel,
  categoryHref,
}: {
  products: HttpTypes.StoreProduct[]
  categoryLabel?: string
  categoryHref?: string
}) {
  if (!products.length) return null

  return (
    <section className="pdp-related">
      <div className="pdp-related-head">
        <h2 className="pdp-related-title">You may also like</h2>
        {categoryHref ? (
          <Link href={categoryHref} className="pdp-related-all">
            {categoryLabel ? `See all ${categoryLabel}` : "See all"}
          </Link>
        ) : null}
      </div>
      <div className="pdp-related-grid">
        {products.map((p, i) => (
          <EditorialProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </section>
  )
}
