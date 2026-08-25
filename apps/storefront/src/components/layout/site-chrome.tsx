"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"

/**
 * The Figma home hero includes its own overlay nav, so the global announcement
 * bar and sticky header stay off `/` to avoid a double chrome.
 */
export function SiteChrome({
  announcement,
  header,
}: {
  announcement: ReactNode
  header: ReactNode
}) {
  const pathname = usePathname()
  if (pathname === "/") return null

  return (
    <>
      {announcement}
      {header}
    </>
  )
}
