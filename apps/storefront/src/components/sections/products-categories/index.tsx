"use client"

import { useState } from "react"

import { CategoryStage } from "./category-stage"
import { CATALOG_EYEBROW, PRODUCTS_BY_TAB, type ProductTabId } from "./constants"
import { ProductRail } from "./product-rail"
import { ProductTabs } from "./product-tabs"

export function ProductsCategoriesSection() {
  const [tab, setTab] = useState<ProductTabId>("new-arrivals")
  const products = PRODUCTS_BY_TAB[tab]

  return (
    <section
      id="products"
      aria-labelledby="products-heading"
      className="scroll-mt-[7rem] overflow-x-clip bg-[#F2F1EF] font-outfit text-[#131111] lg:[font-size:min(1rem,calc(100vw/90))]"
    >
      <div className="mx-auto w-full max-w-[90em] px-[clamp(1.25rem,2.78vw,2.5em)] pt-[clamp(2.5rem,4.72vw,4.25em)] pb-[clamp(3rem,6vw,5em)]">
        <p
          id="products-heading"
          className="m-0 text-center font-outfit text-[1.5em] leading-[1.25em] font-normal tracking-[-0.02em] text-[#131111] uppercase"
        >
          {CATALOG_EYEBROW}
        </p>
        <ProductTabs active={tab} onChange={setTab} />
        <ProductRail products={products} />
        <CategoryStage />
      </div>
    </section>
  )
}
