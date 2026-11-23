"use client"

import { cn } from "@/lib/utils"
import type { CategoryAccent } from "@/lib/category-config"

export type SubcategoryNavProps = {
  items: string[]
  /** Kept for callers; the filters are monochrome to match the editorial design. */
  accent?: CategoryAccent
  active?: string | null
  onSelect: (value: string | null) => void
  className?: string
}

/** Slash-separated text filters, same treatment as the homepage "Selected Editions". */
export function SubcategoryNav({ items, active, onSelect, className }: SubcategoryNavProps) {
  const options = ["All", ...items]

  return (
    <nav
      aria-label="Subcategories"
      className={cn(
        "flex items-center overflow-x-auto pb-1 text-[15px] [-ms-overflow-style:none] [scrollbar-width:none] lg:text-[17px] [&::-webkit-scrollbar]:hidden",
        className
      )}
    >
      {options.map((item, i) => {
        const value = item === "All" ? null : item
        const isActive = item === "All" ? !active : active?.toLowerCase() === item.toLowerCase()
        return (
          <span key={item} className="flex shrink-0 items-center">
            {i > 0 ? (
              <span aria-hidden className="px-1.5 text-[#1A1A1A]/35">
                /
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => onSelect(value)}
              aria-pressed={isActive}
              className={cn(
                "transition-colors focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#1A1A1A]",
                isActive ? "text-[#1A1A1A]" : "text-[#1A1A1A]/70 hover:text-[#1A1A1A]"
              )}
            >
              {item === "All" ? "All Pieces" : item}
            </button>
          </span>
        )
      })}
    </nav>
  )
}
