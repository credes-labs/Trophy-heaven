"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { SiteNav, SiteNavMobile } from "./site-nav/site-nav"
import type { NavCategory } from "./site-nav/constants"

/**
 * Inner-page header: transparent over the paper page at the top, frosted paper
 * bar once scrolled. The blur sits on a sibling layer, not the wrapper, because
 * `backdrop-filter` on an ancestor would trap the mobile menu's `fixed` overlay.
 */
export function SiteHeader({ categories }: { categories?: NavCategory[] }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div className="sticky top-0 z-40 px-5 py-3 sm:px-6 lg:px-10 lg:py-4">
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 -z-10 border-b transition-[background-color,border-color,box-shadow] duration-300",
          scrolled
            ? "border-[#131111]/10 bg-[#FBFBF7]/85 shadow-[0_8px_24px_rgba(19,17,17,0.06)] backdrop-blur-md"
            : "border-transparent bg-transparent"
        )}
      />
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
