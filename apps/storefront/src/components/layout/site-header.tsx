"use client"

import { SiteNav, SiteNavMobile } from "./site-nav/site-nav"
import type { NavCategory } from "./site-nav/constants"

export function SiteHeader({ categories }: { categories?: NavCategory[] }) {
  return (
    <div className="sticky top-0 z-40 bg-[#1C1612] px-5 py-5 sm:px-6 lg:px-10 lg:py-7">
      <div className="mx-auto hidden max-w-[1440px] lg:block">
        <header>
          <SiteNav categories={categories} />
        </header>
      </div>
      <div className="lg:hidden">
        <SiteNavMobile categories={categories} />
      </div>
    </div>
  )
}
