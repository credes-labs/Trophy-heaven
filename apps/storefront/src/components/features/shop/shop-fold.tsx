"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/** Height fold driven by `.shop-fold` in globals.css. */
export function ShopFold({
  open,
  children,
  className,
}: {
  open: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn("shop-fold", open && "is-open", className)}
      aria-hidden={!open}
    >
      <div className="shop-fold-pane">{children}</div>
    </div>
  )
}
