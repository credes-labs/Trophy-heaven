"use client"

import Image from "next/image"
import Link from "next/link"
import { ChevronDown, LayoutGrid, List } from "lucide-react"
import { CATEGORY_CONFIG, SHOP_SORT_OPTIONS, type CategoryKey } from "@/lib/category-config"
import { cn } from "@/lib/utils"
import { SHOP_FILTER_LABEL, SHOP_HIDE_FILTERS_LABEL, SHOP_RECENT_HEADING } from "./constants"

export function ShopListingBreadcrumb({
  category,
}: {
  category: CategoryKey | null
}) {
  const label = category ? CATEGORY_CONFIG[category].label : "Shop"
  return (
    <nav aria-label="Breadcrumb">
      <ol className="m-0 flex list-none flex-wrap items-center gap-[0.5em] p-0 font-outfit text-[0.875em] leading-[1.4] tracking-[-0.02em] text-[#6B635C]">
        <li>
          <Link href="/" className="text-inherit no-underline transition-opacity hover:text-[#131111]">
            Home
          </Link>
        </li>
        <li aria-hidden>/</li>
        <li>
          <Link
            href="/shop"
            className={cn(
              "text-inherit no-underline transition-opacity hover:text-[#131111]",
              !category && "pointer-events-none text-[#131111]"
            )}
            aria-current={!category ? "page" : undefined}
          >
            Shop
          </Link>
        </li>
        {category ? (
          <>
            <li aria-hidden>/</li>
            <li className="text-[#131111]" aria-current="page">
              {label}
            </li>
          </>
        ) : null}
      </ol>
    </nav>
  )
}

export function ShopFilterBanner({ category }: { category: CategoryKey | null }) {
  const cfg = category ? CATEGORY_CONFIG[category] : null
  return (
    <div className="relative mb-[1.5em] aspect-[1360/280] w-full overflow-hidden rounded-[0.125em] bg-[#D9D9D9]">
      <Image
        src={cfg?.imageSrc ?? "/images/hero/hero-workshop.webp"}
        alt={cfg?.imageAlt ?? "Trophy workshop bench with brass tools in warm light"}
        fill
        sizes="(min-width: 1024px) 85em, 100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#131111]/70 via-[#131111]/35 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end px-[clamp(1.25rem,3vw,2.5em)] py-[clamp(1.25rem,3vw,2em)]">
        <p className="m-0 font-outfit text-[0.875em] tracking-[0.14em] text-[#F2F1EF]/80 uppercase">
          {cfg?.label ?? "Collection"}
        </p>
        <h1 className="mt-[0.35em] m-0 max-w-[18em] font-outfit text-[clamp(1.5rem,3.5vw,2.25em)] leading-[1.15] font-normal tracking-[-0.03em] text-[#F2F1EF] text-balance">
          {cfg?.headline ?? "The collection"}
        </h1>
        <p className="mt-[0.5em] m-0 max-w-[32em] font-outfit text-[0.9375em] leading-[1.45] font-light tracking-[-0.02em] text-[#F2F1EF]/80 text-pretty">
          {cfg?.description ?? "Handcrafted trophies, awards, and engraved plaques."}
        </p>
      </div>
    </div>
  )
}

type ShopToolbarProps = {
  filtersOpen: boolean
  onToggleFilters: () => void
  layout: "grid" | "list"
  onLayout: (next: "grid" | "list") => void
  sort: string
  sortOpen: boolean
  onToggleSort: () => void
  onSort: (value: string) => void
  showingFrom: number
  showingTo: number
  total: number
}

export function ShopToolbar({
  filtersOpen,
  onToggleFilters,
  layout,
  onLayout,
  sort,
  sortOpen,
  onToggleSort,
  onSort,
  showingFrom,
  showingTo,
  total,
}: ShopToolbarProps) {
  const active = SHOP_SORT_OPTIONS.find((o) => o.value === sort)

  return (
    <div className="mt-[1.75em] flex flex-wrap items-center gap-x-[1.25em] gap-y-[0.75em] border-b border-[#131111]/10 pb-[1em]">
      <button
        type="button"
        aria-pressed={filtersOpen}
        onClick={onToggleFilters}
        className="cursor-pointer border-0 bg-transparent p-0 font-outfit text-[1.25em] leading-[1.25em] font-normal tracking-[-0.02em] text-[#131111] uppercase"
      >
        {filtersOpen ? SHOP_HIDE_FILTERS_LABEL : SHOP_FILTER_LABEL}
      </button>

      <div className="flex items-center gap-[0.25em]">
        <button
          type="button"
          aria-label="Grid view"
          aria-pressed={layout === "grid"}
          onClick={() => onLayout("grid")}
          className={cn(
            "flex size-[2.25em] cursor-pointer items-center justify-center border-0 bg-transparent p-0",
            layout === "grid" ? "text-[#131111]" : "text-[#6B635C]"
          )}
        >
          <LayoutGrid className="size-[1.125em]" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          aria-label="List view"
          aria-pressed={layout === "list"}
          onClick={() => onLayout("list")}
          className={cn(
            "flex size-[2.25em] cursor-pointer items-center justify-center border-0 bg-transparent p-0",
            layout === "list" ? "text-[#131111]" : "text-[#6B635C]"
          )}
        >
          <List className="size-[1.125em]" strokeWidth={1.5} />
        </button>
      </div>

      <div className="relative ml-auto sm:ml-0">
        <button
          type="button"
          aria-expanded={sortOpen}
          aria-haspopup="listbox"
          className="flex cursor-pointer items-center gap-[0.5em] border-0 bg-transparent p-0 font-outfit text-[1em] leading-[1.25em] font-normal tracking-[-0.02em] text-[#131111] uppercase"
          onClick={onToggleSort}
        >
          {active?.label ?? "Newest"}
          <ChevronDown
            aria-hidden
            className={`size-[1.25em] text-[#6B635C] transition-transform duration-300 ${sortOpen ? "rotate-180" : ""}`}
            strokeWidth={1.5}
          />
        </button>
        {sortOpen ? (
          <ul
            role="listbox"
            aria-label="Sort products"
            className="absolute top-[2.25em] left-0 z-20 min-w-[14em] rounded-[0.125em] bg-[#F2F1EF] py-[0.5em] shadow-[0_12px_40px_rgba(19,17,17,0.12)]"
          >
            {SHOP_SORT_OPTIONS.map((item) => (
              <li key={item.value} role="option" aria-selected={item.value === sort}>
                <button
                  type="button"
                  className={`block w-full cursor-pointer border-0 bg-transparent px-[1em] py-[0.5em] text-left font-outfit text-[1em] leading-[1.4] tracking-[-0.02em] ${
                    item.value === sort ? "text-[#131111]" : "text-[#6B635C]"
                  }`}
                  onClick={() => onSort(item.value)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <p className="m-0 w-full font-outfit text-[0.8125em] tracking-[0.08em] text-[#6B635C] uppercase sm:ml-auto sm:w-auto">
        Showing {showingFrom}–{showingTo} of {total} results
      </p>
    </div>
  )
}

export function ShopModeToolbar({
  filtersOpen,
  onToggleFilters,
  layout,
  onLayout,
  sort,
  sortOpen,
  onToggleSort,
  onSort,
  showingFrom,
  showingTo,
  total,
}: ShopToolbarProps) {
  const active = SHOP_SORT_OPTIONS.find((o) => o.value === sort)

  return (
    <div
      className={cn(
        "relative flex min-h-[2.75em] items-center border-b border-[#131111]/10 pb-[1em] transition-[margin] duration-[560ms] ease-[cubic-bezier(0.25,0.82,0.25,1)] motion-reduce:duration-0",
        filtersOpen ? "mb-[1.75em]" : "mb-[2.5em]"
      )}
    >
      <button
        type="button"
        aria-pressed={filtersOpen}
        onClick={onToggleFilters}
        className="relative z-10 shrink-0 cursor-pointer border-0 bg-transparent p-0 font-outfit text-[1.25em] leading-[1.25em] font-normal tracking-[-0.02em] text-[#131111] uppercase"
      >
        {filtersOpen ? SHOP_HIDE_FILTERS_LABEL : SHOP_FILTER_LABEL}
      </button>

        <h2
        className={cn(
          "pointer-events-none absolute top-1/2 left-1/2 m-0 max-w-[calc(100%-8em)] -translate-x-1/2 -translate-y-1/2 text-center font-outfit text-[clamp(1.5rem,3.5vw,2.25em)] leading-[1.2] font-normal tracking-[-0.03em] text-[#131111] text-balance transition-opacity duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:duration-0",
          filtersOpen ? "opacity-0" : "opacity-100"
        )}
      >
        {SHOP_RECENT_HEADING}
      </h2>

      <div
        className={cn(
          "ml-auto grid min-w-0 transition-[grid-template-columns,opacity] duration-[560ms] ease-[cubic-bezier(0.25,0.82,0.25,1)] motion-reduce:duration-0",
          filtersOpen ? "grid-cols-[1fr] opacity-100" : "pointer-events-none grid-cols-[0fr] opacity-0"
        )}
        aria-hidden={!filtersOpen}
      >
        <div className="flex min-w-0 flex-wrap items-center gap-x-[1.25em] gap-y-[0.5em] overflow-hidden">
        <div className="flex items-center gap-[0.25em]">
          <button
            type="button"
            aria-label="Grid view"
            aria-pressed={layout === "grid"}
            tabIndex={filtersOpen ? 0 : -1}
            onClick={() => onLayout("grid")}
            className={cn(
              "flex size-[2.25em] cursor-pointer items-center justify-center border-0 bg-transparent p-0",
              layout === "grid" ? "text-[#131111]" : "text-[#6B635C]"
            )}
          >
            <LayoutGrid className="size-[1.125em]" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            aria-label="List view"
            aria-pressed={layout === "list"}
            tabIndex={filtersOpen ? 0 : -1}
            onClick={() => onLayout("list")}
            className={cn(
              "flex size-[2.25em] cursor-pointer items-center justify-center border-0 bg-transparent p-0",
              layout === "list" ? "text-[#131111]" : "text-[#6B635C]"
            )}
          >
            <List className="size-[1.125em]" strokeWidth={1.5} />
          </button>
        </div>

        <div className="relative">
          <button
            type="button"
            aria-expanded={sortOpen}
            aria-haspopup="listbox"
            tabIndex={filtersOpen ? 0 : -1}
            className="flex cursor-pointer items-center gap-[0.5em] border-0 bg-transparent p-0 font-outfit text-[1em] leading-[1.25em] font-normal tracking-[-0.02em] text-[#131111] uppercase"
            onClick={onToggleSort}
          >
            {active?.label ?? "Newest"}
            <ChevronDown
              aria-hidden
              className={`size-[1.25em] text-[#6B635C] transition-transform duration-300 ${sortOpen ? "rotate-180" : ""}`}
              strokeWidth={1.5}
            />
          </button>
          {sortOpen && filtersOpen ? (
            <ul
              role="listbox"
              aria-label="Sort products"
              className="absolute top-[2.25em] left-0 z-20 min-w-[14em] rounded-[0.125em] bg-[#F2F1EF] py-[0.5em] shadow-[0_12px_40px_rgba(19,17,17,0.12)]"
            >
              {SHOP_SORT_OPTIONS.map((item) => (
                <li key={item.value} role="option" aria-selected={item.value === sort}>
                  <button
                    type="button"
                    className={`block w-full cursor-pointer border-0 bg-transparent px-[1em] py-[0.5em] text-left font-outfit text-[1em] leading-[1.4] tracking-[-0.02em] ${
                      item.value === sort ? "text-[#131111]" : "text-[#6B635C]"
                    }`}
                    onClick={() => onSort(item.value)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <p className="m-0 font-outfit text-[0.8125em] tracking-[0.08em] text-[#6B635C] uppercase">
          Showing {showingFrom}–{showingTo} of {total} results
        </p>
        </div>
      </div>
    </div>
  )
}

export function ShopBrowseToolbar({
  onOpenFilters,
}: {
  onOpenFilters: () => void
}) {
  return (
    <div className="relative mb-[2.5em] flex flex-col items-center gap-[1em] sm:flex-row sm:justify-between">
      <button
        type="button"
        onClick={onOpenFilters}
        className="cursor-pointer border-0 bg-transparent p-0 font-outfit text-[1.25em] leading-[1.25em] font-normal tracking-[-0.02em] text-[#131111] uppercase sm:relative sm:z-10"
      >
        {SHOP_FILTER_LABEL}
      </button>
      <h2 className="m-0 text-center font-outfit text-[clamp(1.5rem,3.5vw,2.25em)] leading-[1.2] font-normal tracking-[-0.03em] text-[#131111] text-balance sm:absolute sm:left-1/2 sm:-translate-x-1/2">
        {SHOP_RECENT_HEADING}
      </h2>
      <span className="hidden w-[4.5em] sm:block" aria-hidden />
    </div>
  )
}
