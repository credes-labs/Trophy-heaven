"use client"

import Image from "next/image"
import Link from "next/link"
import type { HttpTypes } from "@medusajs/types"
import { formatMoney } from "@/lib/format"
import { localizeImageUrl } from "@/lib/images"
import { cheapestPricedVariant, productPrice } from "@/lib/product-filters"

function productImage(product: HttpTypes.StoreProduct): { src: string; alt: string } | null {
  const src = product.thumbnail ?? product.images?.[0]?.url
  if (!src) return null
  return {
    src: localizeImageUrl(src),
    alt: product.title,
  }
}

function productCurrency(product: HttpTypes.StoreProduct): string {
  return cheapestPricedVariant(product)?.calculated_price?.currency_code ?? "inr"
}

export function EditorialProductCard({
  product,
  layout = "grid",
  index: _index = 0,
}: {
  product: HttpTypes.StoreProduct
  layout?: "grid" | "list"
  index?: number
}) {
  const href = `/products/${product.handle}`
  const image = productImage(product)
  const amount = productPrice(product)
  const price =
    amount == null ? "—" : formatMoney(amount, productCurrency(product))
  const category = product.categories?.[0]?.name ?? "Collection"

  if (layout === "list") {
    return (
      <Link
        href={href}
        className="group flex gap-[1.25em] text-[#131111] no-underline"
      >
        <div className="relative h-[7.5em] w-[6em] shrink-0 overflow-hidden rounded-[0.125em] bg-[#D9D9D9] sm:h-[9.5em] sm:w-[7.5em]">
          {image ? (
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="120px"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          ) : null}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <p className="m-0 font-outfit text-[0.875em] leading-[1.4] font-light tracking-[-0.03em] text-[#6B635C]">
            {category}
          </p>
          <h3 className="mt-[0.35em] m-0 font-outfit text-[1.25em] leading-[1.25em] font-normal tracking-[-0.02em] text-[#131111] text-balance uppercase">
            {product.title}
          </h3>
          <p className="mt-[0.5em] m-0 font-outfit text-[0.875em] leading-[1.25em] font-normal tracking-[-0.02em] text-[#6B635C] uppercase tabular-nums">
            {price}
          </p>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className="group flex flex-col text-[#131111] no-underline"
    >
      <div className="relative aspect-[302/374] w-full overflow-hidden rounded-[0.125em] bg-[#D9D9D9]">
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 1024px) 19em, (min-width: 640px) 45vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : null}
      </div>
      <div className="mt-[1em] flex flex-col gap-[0.35em]">
        <p className="m-0 font-outfit text-[0.75em] leading-[1.4] font-normal tracking-[0.08em] text-gold-dark uppercase">
          {category}
        </p>
        <h3 className="m-0 font-outfit text-[1em] leading-[1.35] font-normal tracking-[0.06em] text-[#131111] text-balance uppercase">
          {product.title}
        </h3>
        <p className="m-0 font-outfit text-[0.9375em] leading-[1.25em] font-normal tracking-[-0.02em] text-[#131111] tabular-nums">
          {price}
        </p>
      </div>
    </Link>
  )
}
