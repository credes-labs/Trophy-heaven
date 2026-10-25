"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { ChevronDown } from "lucide-react"
import { RangeSlider } from "@/components/ui/range-slider"
import {
  CATEGORY_CONFIG,
  PRICE_RANGE,
  SHOP_MATERIALS,
  type CategoryKey,
} from "@/lib/category-config"
import { cn } from "@/lib/utils"
import { SHOP_CLEAR_LABEL } from "./constants"

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
}

type AccordionId = "category" | "price" | "material" | "availability"

function AccordionSection({
  id,
  label,
  openId,
  onToggle,
  summary,
  children,
}: {
  id: AccordionId
  label: string
  openId: AccordionId | null
  onToggle: (id: AccordionId) => void
  summary?: string | null
  children: ReactNode
}) {
  const open = openId === id
  return (
    <div className="border-b border-[#CDCDCD]">
      <button
        type="button"
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-[1em] border-0 bg-transparent py-[1em] text-left"
        onClick={() => onToggle(id)}
      >
        <span className="font-outfit text-[1.5em] leading-[1.25em] font-light tracking-[-0.02em] text-[#131111] uppercase">
          {summary ?? label}
        </span>
        <ChevronDown
          aria-hidden
          className={`size-[1.75em] shrink-0 text-[#6B635C] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          strokeWidth={1.5}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-0 pt-0 pb-[1em]">{children}</div>
        </div>
      </div>
    </div>
  )
}

function OptionButton({
  label,
  active,
  count,
  onClick,
}: {
  label: string
  active: boolean
  count?: number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full cursor-pointer items-center justify-between gap-2 border-0 bg-transparent p-0 text-left font-outfit text-[1em] leading-[1.4] tracking-[-0.02em]",
        active ? "text-[#131111]" : "text-[#6B635C]"
      )}
      onClick={onClick}
    >
      <span>{label}</span>
      {typeof count === "number" ? (
        <span className="text-[0.875em] text-[#6B635C]">({count})</span>
      ) : null}
    </button>
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
}: FilterSidebarProps) {
  const hasActive =
    filters.category != null ||
    filters.subcategory != null ||
    filters.material != null ||
    filters.minPrice > PRICE_RANGE.min ||
    filters.maxPrice < PRICE_RANGE.max ||
    filters.inStock ||
    filters.customizable

  const [openId, setOpenId] = useState<AccordionId | null>("category")
  const [range, setRange] = useState<[number, number]>([filters.minPrice, filters.maxPrice])
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    setRange([filters.minPrice, filters.maxPrice])
  }, [filters.minPrice, filters.maxPrice])
  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    },
    []
  )

  function commitRange(next: [number, number]) {
    setRange(next)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onChange({ minPrice: next[0], maxPrice: next[1] })
    }, 300)
  }

  function toggle(id: AccordionId) {
    setOpenId((current) => (current === id ? null : id))
  }

  const categorySummary = filters.category ? CATEGORY_CONFIG[filters.category].label : null
  const priceSummary =
    filters.minPrice > PRICE_RANGE.min || filters.maxPrice < PRICE_RANGE.max
      ? `₹${filters.minPrice.toLocaleString("en-IN")} – ₹${filters.maxPrice.toLocaleString("en-IN")}`
      : null

  return (
    <aside className={cn("flex w-full flex-col gap-[2em] pb-[0.5em] lg:w-[22.125em] lg:shrink-0", className)}>
      <div className="flex flex-col border-t border-[#CDCDCD]">
        <AccordionSection
          id="category"
          label="category"
          summary={categorySummary}
          openId={openId}
          onToggle={toggle}
        >
          <ul className="m-0 flex list-none flex-col gap-[0.5em] p-0">
            {(Object.keys(CATEGORY_CONFIG) as CategoryKey[]).map((key) => {
              const cat = CATEGORY_CONFIG[key]
              const children = subcategories?.[key] ?? []
              const isSelected = filters.category === key
              return (
                <li key={key}>
                  <OptionButton
                    label={cat.label}
                    active={isSelected}
                    count={categoryCounts?.[key]}
                    onClick={() =>
                      onChange({
                        category: isSelected ? null : key,
                        subcategory: null,
                      })
                    }
                  />
                  {isSelected && children.length > 0 ? (
                    <ul className="mt-[0.5em] ml-[0.75em] flex list-none flex-col gap-[0.35em] border-l border-[#CDCDCD] pl-[0.75em]">
                      {children.map((child) => (
                        <li key={child.id}>
                          <OptionButton
                            label={child.name}
                            active={filters.subcategory === child.handle}
                            onClick={() =>
                              onChange({
                                subcategory:
                                  filters.subcategory === child.handle ? null : child.handle,
                              })
                            }
                          />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </AccordionSection>

        <AccordionSection
          id="price"
          label="price"
          summary={priceSummary}
          openId={openId}
          onToggle={toggle}
        >
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
          <div className="mt-[0.75em] flex items-center gap-[0.5em]">
            <label className="sr-only" htmlFor="shop-min-price">
              Minimum price
            </label>
            <input
              id="shop-min-price"
              type="number"
              min={PRICE_RANGE.min}
              max={filters.maxPrice}
              value={filters.minPrice}
              onChange={(e) =>
                onChange({ minPrice: Math.max(PRICE_RANGE.min, Number(e.target.value) || 0) })
              }
              className="h-[2.5em] w-full rounded-[0.125em] border border-[#131111]/20 bg-transparent px-[0.75em] font-outfit text-[0.875em] text-[#131111] tabular-nums outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"
            />
            <span className="text-[#6B635C]">–</span>
            <label className="sr-only" htmlFor="shop-max-price">
              Maximum price
            </label>
            <input
              id="shop-max-price"
              type="number"
              min={filters.minPrice}
              max={PRICE_RANGE.max}
              value={filters.maxPrice}
              onChange={(e) =>
                onChange({
                  maxPrice: Math.min(PRICE_RANGE.max, Number(e.target.value) || PRICE_RANGE.max),
                })
              }
              className="h-[2.5em] w-full rounded-[0.125em] border border-[#131111]/20 bg-transparent px-[0.75em] font-outfit text-[0.875em] text-[#131111] tabular-nums outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"
            />
          </div>
        </AccordionSection>

        <AccordionSection
          id="material"
          label="material"
          summary={filters.material}
          openId={openId}
          onToggle={toggle}
        >
          <ul className="m-0 flex list-none flex-col gap-[0.5em] p-0">
            {SHOP_MATERIALS.map((mat) => (
              <li key={mat}>
                <OptionButton
                  label={mat}
                  active={filters.material === mat}
                  count={materialCounts?.[mat]}
                  onClick={() => onChange({ material: filters.material === mat ? null : mat })}
                />
              </li>
            ))}
          </ul>
        </AccordionSection>

        <AccordionSection
          id="availability"
          label="availability"
          summary={
            filters.inStock || filters.customizable
              ? [filters.inStock ? "In stock" : null, filters.customizable ? "Customizable" : null]
                  .filter(Boolean)
                  .join(" · ")
              : null
          }
          openId={openId}
          onToggle={toggle}
        >
          <ul className="m-0 flex list-none flex-col gap-[0.5em] p-0">
            <li>
              <OptionButton
                label="In stock only"
                active={filters.inStock}
                onClick={() => onChange({ inStock: !filters.inStock })}
              />
            </li>
            <li>
              <OptionButton
                label="Customizable only"
                active={filters.customizable}
                onClick={() => onChange({ customizable: !filters.customizable })}
              />
            </li>
          </ul>
        </AccordionSection>
      </div>

      <button
        type="button"
        disabled={!hasActive}
        onClick={onClear}
        className="inline-flex h-[3em] w-full cursor-pointer items-center justify-center rounded-full border-0 bg-[#131111] px-[1.5em] font-outfit text-[0.875em] leading-[1.25em] font-normal tracking-[0.08em] text-[#F2F1EF] uppercase transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-40"
      >
        {SHOP_CLEAR_LABEL}
      </button>
    </aside>
  )
}
