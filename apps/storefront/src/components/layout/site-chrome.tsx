"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"

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

  return (
    <>
      {isHome ? null : announcement}
      {isHome ? null : header}
    </>
  )
}
