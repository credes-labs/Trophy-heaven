"use client"

import { SiteNav, SiteNavMobile } from "./site-nav/site-nav"
import type { NavCategory } from "./site-nav/constants"

/**
 * Inner-page header: no bar, just ink wordmark and links pinned over the page.
 * The sticky layer is zero-height so content starts under it; pages clear it
 * with `--site-header-h` (applied to `#main` in globals.css via `data-site-header`).
 * Only links, buttons, menus, and the mobile dialog take clicks so the empty
 * strip doesn't block content beneath.
 */
export function SiteHeader({ categories }: { categories?: NavCategory[] }) {
  return (
    <div data-site-header className="sticky top-0 z-40 h-0">
      <div className="pointer-events-none px-5 py-3 sm:px-6 lg:px-10 lg:py-4 [&_a]:pointer-events-auto [&_button]:pointer-events-auto [&_[role=dialog]]:pointer-events-auto [&_[role=menu]]:pointer-events-auto">
        <div className="mx-auto hidden max-w-[1440px] lg:block">
          <header>
            <SiteNav categories={categories} tone="ink" />
          </header>
        </div>
        <div className="lg:hidden">
          <SiteNavMobile categories={categories} tone="ink" />
        </div>
      </div>
    </div>
  )
}
