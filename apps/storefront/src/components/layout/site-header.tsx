"use client"

import { SiteNav, SiteNavMobile } from "./site-nav/site-nav"
import type { NavCategory } from "./site-nav/constants"

/** Inner-page header: no bar, just ink wordmark and links pinned over the light page. */
export function SiteHeader({ categories }: { categories?: NavCategory[] }) {
  return (
    <div className="sticky top-0 z-40 px-5 py-3 sm:px-6 lg:px-10 lg:py-4">
      <div className="mx-auto hidden max-w-[1440px] lg:block">
        <header>
          <SiteNav categories={categories} tone="ink" />
        </header>
      </div>
      <div className="lg:hidden">
        <SiteNavMobile categories={categories} tone="ink" />
      </div>
    </div>
  )
}
