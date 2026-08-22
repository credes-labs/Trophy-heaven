"use client"

import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RangeSlider } from "@/components/ui/range-slider"
import {
  CATEGORY_CONFIG,
  PRICE_RANGE,
  SHOP_MATERIALS,
  SHOP_SORT_OPTIONS,
  type CategoryKey,
} from "@/lib/category-config"
import { cn } from "@/lib/utils"

export type SubcategoryOption = {
  /** Medusa category handle (used in the URL) */
  handle: string
  name: string
  id: string
}

export type ShopFilters = {
  category: CategoryKey | null
  /** Child category handle within the selected parent category */
  subcategory: string | null
  material: string | null
  sort: string
  minPrice: number
  maxPrice: number
  inStock: boolean
  customizable: boolean
}

export type FilterSidebarProps = {
  filters: ShopFilters
  categoryCounts?: Partial<Record<CategoryKey, number>>
  materialCounts?: Record<string, number>
  /** Child categories of each parent key (for nested subcategory checkboxes) */
  subcategories?: Partial<Record<CategoryKey, SubcategoryOption[]>>
  onChange: (patch: Partial<ShopFilters>) => void
  onClear: () => void
  className?: string
  showSort?: boolean
}

function FilterToggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-2 text-sm">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors",
          checked ? "bg-accent" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-card shadow transition-transform",
            checked ? "translate-x-4.5" : "translate-x-0.5"
          )}
        />
      </button>
    </label>
  )
}

export function FilterSidebar({
  filters,
  categoryCounts,
  materialCounts,
  subcategories,
  onChange,
  onClear,
  className,
  showSort = true,
}: FilterSidebarProps) {
  const hasActive =
    filters.category != null ||
    filters.subcategory != null ||
    filters.material != null ||
    filters.minPrice > PRICE_RANGE.min ||
    filters.maxPrice < PRICE_RANGE.max ||
    filters.inStock ||
    filters.customizable ||
    (filters.sort !== "newest" && filters.sort !== "")

  // Local slider state; committed to filters after a 300ms debounce.
  const [range, setRange] = useState<[number, number]>([filters.minPrice, filters.maxPrice])
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)
  useEffect(() => {
    setRange([filters.minPrice, filters.maxPrice])
  }, [filters.minPrice, filters.maxPrice])
  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }, [])

  function commitRange(next: [number, number]) {
    setRange(next)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onChange({ minPrice: next[0], maxPrice: next[1] })
    }, 300)
  }

  return (
    <aside className={cn("space-y-8", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Filters
        </h2>
        {hasActive && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-accent hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold">Category</h3>
        <ul className="space-y-2">
          {(Object.keys(CATEGORY_CONFIG) as CategoryKey[]).map((key) => {
            const cat = CATEGORY_CONFIG[key]
            const count = categoryCounts?.[key]
            const children = subcategories?.[key] ?? []
            const isSelected = filters.category === key
            return (
              <li key={key}>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-border accent-accent"
                    checked={isSelected}
                    onChange={() =>
                      onChange({
                        category: isSelected ? null : key,
                        subcategory: null,
                      })
                    }
                  />
                  <span className="flex-1">{cat.label}</span>
                  {typeof count === "number" && (
                    <span className="text-xs text-muted-foreground">{count}</span>
                  )}
                </label>
                {isSelected && children.length > 0 && (
                  <ul className="mt-2 space-y-2 border-l border-border pl-6">
                    {children.map((child) => (
                      <li key={child.id}>
                        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                          <input
                            type="checkbox"
                            className="size-4 rounded border-border accent-accent"
                            checked={filters.subcategory === child.handle}
                            onChange={() =>
                              onChange({
                                subcategory:
                                  filters.subcategory === child.handle ? null : child.handle,
                              })
                            }
                          />
                          <span className="flex-1">{child.name}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold">Price</h3>
        <RangeSlider
          value={range}
          onChange={commitRange}
          min={PRICE_RANGE.min}
          max={PRICE_RANGE.max}
          step={100}
          minGap={500}
          formatValue={(v) => `₹${v.toLocaleString("en-IN")}`}
          ariaLabelMin="Minimum price"
          ariaLabelMax="Maximum price"
        />
        <div className="mt-3 flex items-center gap-2">
          <Input
            type="number"
            inputSize="sm"
            min={PRICE_RANGE.min}
            max={filters.maxPrice}
            value={filters.minPrice}
            aria-label="Minimum price"
            onChange={(e) =>
              onChange({ minPrice: Math.max(PRICE_RANGE.min, Number(e.target.value) || 0) })
            }
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            inputSize="sm"
            min={filters.minPrice}
            max={PRICE_RANGE.max}
            value={filters.maxPrice}
            aria-label="Maximum price"
            onChange={(e) =>
              onChange({
                maxPrice: Math.min(PRICE_RANGE.max, Number(e.target.value) || PRICE_RANGE.max),
              })
            }
          />
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          ₹{PRICE_RANGE.min.toLocaleString("en-IN")} — ₹{PRICE_RANGE.max.toLocaleString("en-IN")}
        </p>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold">Material</h3>
        <ul className="space-y-2">
          {SHOP_MATERIALS.map((mat) => {
            const count = materialCounts?.[mat]
            return (
              <li key={mat}>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-border accent-accent"
                    checked={filters.material === mat}
                    onChange={() =>
                      onChange({ material: filters.material === mat ? null : mat })
                    }
                  />
                  <span className="flex-1">{mat}</span>
                  {typeof count === "number" && (
                    <span className="text-xs text-muted-foreground">{count}</span>
                  )}
                </label>
              </li>
            )
          })}
        </ul>
      </div>

      {/*
        Rating filter (4★+/3★+) intentionally skipped: the store API exposes no
        rating field on products, and /store/reviews only aggregates per
        product_id — there is no bulk summary to filter a listing by without
        one request per product. See .cursor/plans/pages/02-shop.md §Filters.
      */}

      <div className="space-y-3">
        <FilterToggle
          label="In stock only"
          checked={filters.inStock}
          onChange={(next) => onChange({ inStock: next })}
        />
        <FilterToggle
          label="Customizable only"
          checked={filters.customizable}
          onChange={(next) => onChange({ customizable: next })}
        />
      </div>

      {showSort && (
        <div>
          <h3 className="mb-3 text-sm font-semibold">Sort</h3>
          <select
            className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm"
            value={filters.sort}
            onChange={(e) => onChange({ sort: e.target.value })}
            aria-label="Sort products"
          >
            {SHOP_SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {hasActive && (
        <Button variant="outline" size="sm" className="w-full" onClick={onClear}>
          Clear all filters
        </Button>
      )}
    </aside>
  )
}
