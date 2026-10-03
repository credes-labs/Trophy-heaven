import { ChevronDown } from "lucide-react"

import {
  EXPLORE_FILTER_LABEL,
  EXPLORE_SORT_LABEL,
  EXPLORE_SORTS,
  type ExploreSortId,
} from "./constants"

type Props = {
  sort: ExploreSortId
  sortOpen: boolean
  onToggleSort: () => void
  onSort: (id: ExploreSortId) => void
  onOpenFilters?: () => void
  filterCount?: number
}

export function ExploreToolbar({
  sort,
  sortOpen,
  onToggleSort,
  onSort,
  onOpenFilters,
  filterCount = 0,
}: Props) {
  const active = EXPLORE_SORTS.find((item) => item.id === sort)

  return (
    <div className="mt-[2.6875em] flex items-center justify-between gap-4">
      <button
        type="button"
        className="m-0 min-h-11 cursor-pointer border-0 bg-transparent p-0 font-outfit text-[1.5em] leading-[1.25em] font-normal tracking-[-0.02em] text-[#131111] uppercase lg:pointer-events-none"
        onClick={onOpenFilters}
      >
        {EXPLORE_FILTER_LABEL}
        {filterCount > 0 ? ` (${filterCount})` : ""}
      </button>

      <div className="relative">
        <button
          type="button"
          aria-expanded={sortOpen}
          aria-haspopup="listbox"
          className="flex min-h-11 cursor-pointer items-center gap-[0.75em] border-0 bg-transparent p-0 font-outfit text-[1.5em] leading-[1.25em] font-normal tracking-[-0.02em] text-[#131111] uppercase"
          onClick={onToggleSort}
        >
          {EXPLORE_SORT_LABEL}
          <ChevronDown
            aria-hidden
            className={`size-[1.75em] text-[#9C9C9C] transition-transform duration-300 motion-reduce:transition-none ${sortOpen ? "rotate-180" : ""}`}
            strokeWidth={1.5}
          />
        </button>
        {sortOpen ? (
          <ul
            role="listbox"
            aria-label="Sort products"
            className="absolute top-[2.25em] right-0 z-20 min-w-[14em] rounded-[0.125em] bg-[#F2F1EF] py-[0.5em] shadow-[0_12px_40px_rgba(19,17,17,0.12)]"
          >
            {EXPLORE_SORTS.map((item) => (
              <li key={item.id} role="option" aria-selected={item.id === sort}>
                <button
                  type="button"
                  className={`block w-full cursor-pointer border-0 bg-transparent px-[1em] py-[0.5em] text-left font-outfit text-[1em] leading-[1.4] tracking-[-0.02em] ${
                    item.id === sort ? "text-[#131111]" : "text-[rgba(19,17,17,0.6)]"
                  }`}
                  onClick={() => onSort(item.id)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <span className="sr-only">Sorted by {active?.label}</span>
      </div>
    </div>
  )
}
