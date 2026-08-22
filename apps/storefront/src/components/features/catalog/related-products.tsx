"use client"

import Link from "next/link"
import type { HttpTypes } from "@medusajs/types"
import { ProductCard } from "@/components/features/catalog/product-card"

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
    <section className="mt-16">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="font-serif text-2xl font-semibold">You may also like</h2>
        {categoryHref && (
          <Link href={categoryHref} className="text-sm text-accent hover:underline">
            {categoryLabel ? `View all in ${categoryLabel}` : "View all"}
          </Link>
        )}
      </div>
      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory md:mx-0 md:px-0">
        {products.map((p) => (
          <div key={p.id} className="w-[min(70vw,240px)] shrink-0 snap-start md:w-[calc(25%-0.75rem)]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  )
}
