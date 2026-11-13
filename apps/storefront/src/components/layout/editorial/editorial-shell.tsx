import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/** Inner-page canvas matching shop / about / footer (Outfit + cream + fluid em). */
export function EditorialShell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "under-site-header overflow-x-clip bg-[#F2F1EF] font-outfit text-[#131111] lg:[font-size:min(1rem,calc(100vw/90))]",
        className
      )}
    >
      {children}
    </div>
  )
}

export function EditorialFrame({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[90em] px-[clamp(1.25rem,2.78vw,2.5em)] pt-[clamp(2.5rem,6vw,5em)] pb-[clamp(3.5rem,8vw,7em)]",
        className
      )}
    >
      {children}
    </div>
  )
}
