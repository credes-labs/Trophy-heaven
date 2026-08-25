import { ChevronDown } from "lucide-react"

import {
  EXPLORE_CLEAR_LABEL,
  EXPLORE_FILTERS,
  FILTER_OPTIONS,
  type ExploreFilterId,
} from "./constants"

type Props = {
  openId: ExploreFilterId | null
  selected: Partial<Record<ExploreFilterId, string>>
  onToggle: (id: ExploreFilterId) => void
  onSelect: (id: ExploreFilterId, value: string) => void
  onClear: () => void
}

export function ExploreFilters({ openId, selected, onToggle, onSelect, onClear }: Props) {
  const hasFilters = Object.values(selected).some(Boolean)

  return (
    <div className="flex w-full flex-col gap-[2.625em] lg:w-[22.125em] lg:shrink-0">
      <div className="flex flex-col">
        {EXPLORE_FILTERS.map((filter) => {
          const open = openId === filter.id
          const value = selected[filter.id]

          return (
            <div key={filter.id} className="border-b border-[#CDCDCD]">
              <button
                type="button"
                aria-expanded={open}
                className="flex w-full cursor-pointer items-center justify-between gap-[1em] border-0 bg-transparent py-[1em] text-left"
                onClick={() => onToggle(filter.id)}
              >
                <span className="font-outfit text-[1.5em] leading-[1.25em] font-light tracking-[-0.02em] text-[#131111] uppercase">
                  {value ?? filter.label}
                </span>
                <ChevronDown
                  aria-hidden
                  className={`size-[1.75em] shrink-0 text-[#C2C2C2] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                  strokeWidth={1.5}
                />
              </button>
              <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
                  open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <ul className="m-0 flex list-none flex-col gap-[0.5em] px-0 pt-0 pb-[1em]">
                    {FILTER_OPTIONS[filter.id].map((option) => {
                      const active = value === option
                      return (
                        <li key={option}>
                          <button
                            type="button"
                            className={`cursor-pointer border-0 bg-transparent p-0 font-outfit text-[1em] leading-[1.4] tracking-[-0.02em] ${
                              active ? "text-[#131111]" : "text-[rgba(19,17,17,0.6)]"
                            }`}
                            onClick={() => onSelect(filter.id, option)}
                          >
                            {option}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <button
        type="button"
        disabled={!hasFilters}
        onClick={onClear}
        className="inline-flex h-[3.875em] w-full cursor-pointer items-center justify-center gap-[1.25em] rounded-full border-0 bg-[#131111] px-[0.5em] font-outfit text-[1em] leading-[1.25em] font-light tracking-[-0.02em] text-[#F2F1EF] uppercase transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-40"
      >
        <span className="size-[0.5em] shrink-0 rounded-full bg-[#F2F1EF]" aria-hidden />
        {EXPLORE_CLEAR_LABEL}
      </button>
    </div>
  )
}
