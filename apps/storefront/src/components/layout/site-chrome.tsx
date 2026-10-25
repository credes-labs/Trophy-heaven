"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"

/** Full-viewport app screens that render without any site chrome. */
const BARE_ROUTES = new Set(["/customize"])
/** The 2D layout editor shares the studio's fullscreen shell. */
const BARE_PATTERN = /^\/customize\/[^/]+\/2d$/

export function isBareRoute(pathname: string | null) {
  return pathname != null && (BARE_ROUTES.has(pathname) || BARE_PATTERN.test(pathname))
}

/**
 * Homepage is a full-bleed poster with its own overlay nav, so the sticky
 * header and the announcement strip stay off `/`.
 */
export function SiteChrome({
  announcement,
  header,
}: {
  announcement: ReactNode
  header: ReactNode
}) {
  const pathname = usePathname()
  const isHome = pathname === "/"
  const hidden = isHome || isBareRoute(pathname)

  return (
    <>
      {hidden ? null : announcement}
      {hidden ? null : header}
    </>
  )
}

/** Footer / mobile tab bar: everywhere except bare app screens. */
export function ChromeGate({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return isBareRoute(pathname) ? null : <>{children}</>
}
