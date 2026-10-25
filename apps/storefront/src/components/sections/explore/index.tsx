"use client"

import { useMemo, useState } from "react"

import {
  EXPLORE_PRODUCTS,
  type ExploreFilterId,
  type ExploreSortId,
} from "./constants"
import { ExploreFilters } from "./explore-filters"
import { ExploreGrid } from "./explore-grid"
import { ExploreHeader } from "./explore-header"
import { ExploreHero } from "./explore-hero"
import { ExploreToolbar } from "./explore-toolbar"

function matchesPrice(amount: number, option: string) {
  if (option === "Under ₹50,000") return amount < 50_000
  if (option === "₹50,000 – ₹1,00,000") return amount >= 50_000 && amount <= 100_000
  return amount > 100_000
}

function matchesRating(rating: number, option: string) {
  if (option === "4.8 & up") return rating >= 4.8
  return rating >= 4.5
}

export function ExploreSection() {
  const [openFilter, setOpenFilter] = useState<ExploreFilterId | null>(null)
  const [sortOpen, setSortOpen] = useState(false)
  const [sort, setSort] = useState<ExploreSortId>("featured")
  const [selected, setSelected] = useState<Partial<Record<ExploreFilterId, string>>>({})
  const [sheetOpen, setSheetOpen] = useState(false)

  const products = useMemo(() => {
    const filtered = EXPLORE_PRODUCTS.filter((item) => {
      if (selected.category && item.category !== selected.category) return false
      if (selected.color && item.color !== selected.color) return false
      if (selected.brand && item.brand !== selected.brand) return false
      if (selected.price && !matchesPrice(item.amount, selected.price)) return false
      if (selected.rating && !matchesRating(item.rating, selected.rating)) return false
      return true
    })

    const ordered = [...filtered]
    if (sort === "price-asc") ordered.sort((a, b) => a.amount - b.amount)
    if (sort === "price-desc") ordered.sort((a, b) => b.amount - a.amount)
    if (sort === "rating") ordered.sort((a, b) => b.rating - a.rating)
    return ordered
  }, [selected, sort])

  const filterProps = {
    openId: openFilter,
    selected,
    onToggle: (id: ExploreFilterId) => setOpenFilter((current) => (current === id ? null : id)),
    onSelect: (id: ExploreFilterId, value: string) => {
      setSelected((current) => ({
        ...current,
        [id]: current[id] === value ? undefined : value,
      }))
    },
    onClear: () => {
      setSelected({})
      setOpenFilter(null)
    },
  }

  return (
    <section
      id="explore"
      aria-labelledby="explore-heading"
      className="overflow-x-clip bg-[#F2F1EF] font-outfit text-[#131111] lg:[font-size:min(1rem,calc(100vw/90))]"
    >
      <div className="mx-auto w-full max-w-[90em] px-[clamp(1.25rem,2.78vw,2.5em)] pt-[clamp(2.5rem,4.44vw,4em)] pb-[clamp(3rem,6vw,5.5em)]">
        <ExploreHeader />
        <div className="mt-[2.625em] h-[0.125em] w-full bg-[#D6D6D6]" aria-hidden />
        <ExploreHero />
        <ExploreToolbar
          sort={sort}
          sortOpen={sortOpen}
          onToggleSort={() => setSortOpen((open) => !open)}
          onSort={(id) => {
            setSort(id)
            setSortOpen(false)
          }}
          onOpenFilters={() => setSheetOpen(true)}
          filterCount={Object.values(selected).filter(Boolean).length}
        />

        <div className="mt-[2.5em] flex flex-col gap-[2.5em] lg:flex-row lg:items-start lg:gap-[3.25em]">
          <div className="hidden lg:sticky lg:top-24 lg:block lg:w-[22.125em] lg:shrink-0 lg:self-start">
            <ExploreFilters {...filterProps} />
          </div>
          <div className="min-w-0 flex-1">
            <ExploreGrid products={products} />
          </div>
        </div>
      </div>

      {sheetOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <button
            type="button"
            className="absolute inset-0 border-0 bg-[#131111]/40"
            aria-label="Close filters"
            onClick={() => setSheetOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85svh] overflow-y-auto rounded-t-[1em] bg-[#F2F1EF] px-[1.25em] pt-[1em] pb-[max(1.5em,env(safe-area-inset-bottom))]">
            <div className="mb-[1em] flex items-center justify-between">
              <p className="m-0 font-outfit text-[1.25em] uppercase tracking-wide">Filters</p>
              <button
                type="button"
                className="min-h-11 border-0 bg-transparent px-2 font-outfit text-[1em] uppercase"
                onClick={() => setSheetOpen(false)}
              >
                Done
              </button>
            </div>
            <ExploreFilters {...filterProps} />
          </div>
        </div>
      ) : null}
    </section>
  )
}
