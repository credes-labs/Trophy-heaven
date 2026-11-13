"use client"

import { cn } from "@/lib/utils"
import type { CategoryAccent } from "@/lib/category-config"

const ACTIVE: Record<CategoryAccent, string> = {
  trophy: "bg-trophy text-trophy-foreground border-trophy",
}

const INACTIVE: Record<CategoryAccent, string> = {
  trophy: "border-trophy/40 text-trophy hover:bg-trophy/10",
}

export type SubcategoryNavProps = {
  items: string[]
  accent: CategoryAccent
  active?: string | null
  onSelect: (value: string | null) => void
  className?: string
}

export function SubcategoryNav({
  items,
  accent,
  active,
  onSelect,
  className,
}: SubcategoryNavProps) {
  const pills = ["All", ...items]

  return (
    <nav
      aria-label="Subcategories"
      className={cn(
        "flex gap-2 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
    >
      {pills.map((item) => {
        const value = item === "All" ? null : item
        const isActive = item === "All" ? !active : active?.toLowerCase() === item.toLowerCase()
        return (
          <button
            key={item}
            type="button"
            onClick={() => onSelect(value)}
            className={cn(
              "shrink-0 snap-start rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              isActive ? ACTIVE[accent] : INACTIVE[accent]
            )}
          >
            {item}
          </button>
        )
      })}
    </nav>
  )
}
