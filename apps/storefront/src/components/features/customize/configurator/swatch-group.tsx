"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export type SwatchOption<Id extends string> = {
  id: Id
  label: string
  visual: ReactNode
  /** Extra detail shown next to the current choice (e.g. a price). */
  note?: string
}

/**
 * One option group as a native radio group: arrow keys move the selection, the
 * swatch is the visual, the ring marks the choice and the legend names it —
 * swatch labels stay accessible but aren't printed, which keeps groups one row tall.
 */
export function SwatchGroup<Id extends string>({
  legend,
  name,
  value,
  options,
  onChange,
}: {
  legend: string
  name: string
  value: Id
  options: readonly SwatchOption<Id>[]
  onChange: (id: Id) => void
}) {
  const current = options.find((o) => o.id === value)
  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="flex w-full items-baseline gap-[0.5em] p-0 font-outfit">
        <span className="text-[0.6875em] font-medium tracking-[0.14em] text-[#131111] uppercase">{legend}</span>
        <span aria-hidden className="text-[0.6875em] text-[#131111]/30">
          |
        </span>
        <span className="truncate text-[0.8125em] tracking-[-0.01em] text-[#6B635C]">
          {current?.label}
          {current?.note ? ` · ${current.note}` : null}
        </span>
      </legend>
      <div className="mt-3 flex flex-wrap gap-2.5">
        {options.map((option) => {
          const checked = option.id === value
          return (
            <label key={option.id} className="group relative flex cursor-pointer p-1" title={option.label}>
              <input
                type="radio"
                name={name}
                value={option.id}
                checked={checked}
                onChange={() => onChange(option.id)}
                className="peer sr-only"
              />
              <span className="sr-only">
                {option.label}
                {option.note ? `, ${option.note}` : null}
              </span>
              <span
                aria-hidden
                className={cn(
                  "flex size-[2.15em] items-center justify-center overflow-hidden rounded-full ring-offset-[2px] ring-offset-white transition-[box-shadow,transform] duration-200 motion-reduce:transition-none",
                  "group-hover:scale-[1.05] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-[4px] peer-focus-visible:outline-[#131111]",
                  checked ? "ring-[1.5px] ring-[#131111]" : "ring-1 ring-[#131111]/12"
                )}
              >
                {option.visual}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
