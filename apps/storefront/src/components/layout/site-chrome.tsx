"use client"

import { useEffect, useState, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { SiteNavMobile } from "./site-nav/site-nav"

function HomeMobileHeader() {
  const [overHero, setOverHero] = useState(true)
  useEffect(() => {
    const hero = document.querySelector("[data-home-hero]")
    if (!hero) return
    const observer = new IntersectionObserver(
      ([entry]) => setOverHero(entry?.isIntersecting ?? false),
      { rootMargin: "-80px 0px 0px" }
    )
    observer.observe(hero)
    return () => observer.disconnect()
  }, [])
  return (
    <div
      data-home-mobile-header
      className={`fixed inset-x-0 top-0 z-40 px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-4 transition-colors lg:hidden ${
        overHero ? "bg-transparent" : "bg-white/90 backdrop-blur-sm"
      }`}
    >
      <SiteNavMobile tone="ink" />
    </div>
  )
}

/** Full-viewport app screens that render without any site chrome. */
const BARE_ROUTES = new Set(["/customize"])
/** The 2D layout editor shares the studio's fullscreen shell. */
const BARE_PATTERN = /^\/customize\/[^/]+\/2d$/

/**
 * Vercel's background ISR refresh renders the root route as `/index`, while the
 * browser sees `/`. Treating both as home keeps the server and client headers
 * identical (otherwise React throws hydration error #418 on the homepage).
 */
export function isHomePath(pathname: string | null) {
  return pathname === "/" || pathname === "/index"
}

export function isBareRoute(pathname: string | null) {
  return pathname != null && (BARE_ROUTES.has(pathname) || BARE_PATTERN.test(pathname))
}

/**
 * Homepage keeps its desktop poster nav and gets a persistent mobile overlay.
 * The inner-page header and announcement strip stay off `/`.
 */
export function SiteChrome({
  announcement,
  header,
}: {
  announcement: ReactNode
  header: ReactNode
}) {
  const pathname = usePathname()
  const isHome = isHomePath(pathname)
  const hidden = isHome || isBareRoute(pathname)

  return (
    <>
      {hidden ? null : announcement}
      {hidden ? null : header}
      {isHome ? <HomeMobileHeader /> : null}
    </>
  )
}

/** Footer: everywhere except bare app screens. */
export function ChromeGate({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return isBareRoute(pathname) ? null : <>{children}</>
}
