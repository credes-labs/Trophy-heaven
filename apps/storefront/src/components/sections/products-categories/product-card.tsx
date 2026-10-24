"use client"

import Image from "next/image"
import Link from "next/link"

import type { CatalogProduct } from "./constants"

type Props = {
  product: CatalogProduct
  pressed?: boolean
}

export function ProductCard({ product, pressed = false }: Props) {
  return (
    <Link
      href={product.href}
      className="group flex w-[20.125em] shrink-0 flex-col gap-[0.875em] text-[#131111] no-underline"
    >
      <div
        className="relative aspect-square w-full overflow-hidden rounded-[0.125em] bg-[#D9D9D9] transition-transform duration-500 ease-out"
        style={{ transform: pressed ? "scale(0.97)" : undefined }}
      >
        <Image
          src={product.image}
          alt={product.alt}
          fill
          sizes="20.125em"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
        />
      </div>
      <p className="m-0 min-h-[2.5em] font-outfit text-[1em] leading-[1.25em] font-light tracking-[-0.02em] text-[#131111] uppercase tabular-nums">
        / {product.name} — {product.status} {product.price}
      </p>
    </Link>
  )
}
