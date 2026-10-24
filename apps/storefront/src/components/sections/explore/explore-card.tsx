import Image from "next/image"
import Link from "next/link"

import type { ExploreProduct } from "./constants"

export function ExploreCard({ product, index }: { product: ExploreProduct; index: number }) {
  return (
    <Link
      href={product.href}
      className="group flex flex-col text-[#131111] no-underline motion-safe:animate-[slideUp_0.7s_cubic-bezier(0.16,1,0.3,1)_both]"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="relative aspect-[302/374] w-full overflow-hidden rounded-[0.125em] bg-[#D9D9D9]">
        <Image
          src={product.image}
          alt={product.alt}
          fill
          sizes="(min-width: 1024px) 19em, (min-width: 640px) 45vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>
      <div className="mt-[1em] flex items-start justify-between gap-[0.75em] font-outfit text-[1em] leading-[1.4] font-light tracking-[-0.03em] text-[rgba(19,17,17,0.6)]">
        <span>{product.category}</span>
        <span className="shrink-0 text-right">{product.reviewsLabel}</span>
      </div>
      <div className="mt-[0.5em] flex items-baseline justify-between gap-[0.75em]">
        <h3 className="m-0 font-outfit text-[1.5em] leading-[1.25em] font-normal tracking-[-0.02em] text-balance text-[#131111] uppercase">
          {product.name}
        </h3>
        <p className="m-0 shrink-0 font-outfit text-[1em] leading-[1.25em] font-normal tracking-[-0.02em] text-[rgba(19,17,17,0.6)] uppercase tabular-nums">
          {product.price}
        </p>
      </div>
    </Link>
  )
}
