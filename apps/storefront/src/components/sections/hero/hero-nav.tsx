"use client"

import { SiteNav, SiteNavMobile } from "@/components/layout/site-nav/site-nav"

/** Overlay header matching the Figma hero: wordmark | 2-col nav | search + cart. */
export function HeroNav() {
  return (
    <header className="relative z-20">
      <SiteNav />
    </header>
  )
}

export function HeroNavMobile() {
  return <SiteNavMobile />
}
