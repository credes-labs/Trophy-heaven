"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"

/**
 * Homepage keeps its own overlay nav in the hero, so the sticky header stays
 * off `/`. The announcement bar is shown on every route including home.
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

  return (
    <>
      {announcement}
      {isHome ? null : header}
    </>
  )
}
