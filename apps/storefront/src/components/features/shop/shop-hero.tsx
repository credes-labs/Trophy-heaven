"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import type { HttpTypes } from "@medusajs/types"
import { localizeImageUrl } from "@/lib/images"
import { SHOP_FEATURED_FALLBACK } from "./constants"

type Featured = {
  title: string
  href: string
  image: string
  alt: string
}

function featuredFromProducts(products: HttpTypes.StoreProduct[]): Featured[] {
  const fromCatalog = products
    .map((product) => {
      const src = product.thumbnail ?? product.images?.[0]?.url
      if (!src || !product.handle) return null
      return {
        title: product.title,
        href: `/products/${product.handle}`,
        image: localizeImageUrl(src),
        alt: product.title,
      }
    })
    .filter((item): item is Featured => item != null)
    .slice(0, 2)

  if (fromCatalog.length >= 2) return fromCatalog
  if (fromCatalog.length === 1) {
    const pad = SHOP_FEATURED_FALLBACK.find((item) => item.href !== fromCatalog[0].href)
    return pad ? [fromCatalog[0], pad] : fromCatalog
  }
  return [...SHOP_FEATURED_FALLBACK]
}

export function ShopHero({ products }: { products: HttpTypes.StoreProduct[] }) {
  const slides = featuredFromProducts(products)
  const [index, setIndex] = useState(0)
  const slide = slides[index] ?? slides[0]
  if (!slide) return null

  const prev = () => setIndex((i) => (i + slides.length - 1) % slides.length)
  const next = () => setIndex((i) => (i + 1) % slides.length)

  return (
    <section className="relative overflow-hidden border-b border-[#131111]/10">
      <div className="mx-auto grid w-full max-w-[90em] items-center gap-[2.5em] px-[clamp(1.25rem,2.78vw,2.5em)] pt-[max(clamp(2.5rem,6vw,5em),calc(var(--site-header-h)+1.5rem))] pb-[clamp(2.5rem,6vw,5em)] lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:gap-16 lg:min-h-[32em]">
        <div className="relative z-10 max-w-[28em]">
          <p
            aria-hidden
            className="pointer-events-none absolute -top-8 left-0 font-outfit text-[clamp(4rem,14vw,11rem)] leading-[0.8] font-light tracking-[-0.08em] text-[#131111]/[0.06] select-none"
          >
            legacy
          </p>
          <h1 className="relative m-0 font-outfit text-[clamp(2.25rem,5vw,3.75em)] leading-[1.1] font-normal tracking-[-0.04em] text-[#131111] text-balance">
            {slide.title}
          </h1>
          <Link
            href={slide.href}
            className="mt-[1.75em] inline-flex items-center gap-[0.75em] font-outfit text-[1em] leading-[1.25em] font-normal tracking-[-0.02em] text-[#131111] uppercase no-underline transition-opacity hover:opacity-70"
          >
            Shop this product
            <span aria-hidden className="text-[1.25em] leading-none">
              →
            </span>
          </Link>
        </div>

        <div className="w-full">
          <div className="relative aspect-[5/4] w-full overflow-hidden lg:aspect-[6/5]">
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              priority
              sizes="(min-width: 1440px) 50em, (min-width: 1024px) 58vw, 100vw"
              className="object-cover"
            />
          </div>
          {slides.length > 1 ? (
            <div className="mt-[0.85em] flex items-center justify-end gap-[0.65em] font-outfit text-[0.8125em] tracking-[0.12em] text-[#6B635C] uppercase">
              <button
                type="button"
                aria-label="Previous featured piece"
                onClick={prev}
                className="cursor-pointer border-0 bg-transparent p-0 text-[1.25em] leading-none text-[#6B635C] hover:text-[#131111]"
              >
                ‹
              </button>
              <span>
                <span className="text-[#131111]">{String(index + 1).padStart(2, "0")}</span>
                <span aria-hidden> / </span>
                {String(slides.length).padStart(2, "0")}
              </span>
              <button
                type="button"
                aria-label="Next featured piece"
                onClick={next}
                className="cursor-pointer border-0 bg-transparent p-0 text-[1.25em] leading-none text-[#6B635C] hover:text-[#131111]"
              >
                ›
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
