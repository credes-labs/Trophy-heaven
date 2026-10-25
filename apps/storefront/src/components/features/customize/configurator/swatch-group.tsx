"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export type SwatchOption<Id extends string> = {
  id: Id
  label: string
  visual: ReactNode
  /** Extra line under the label (e.g. a price). */
  note?: string
}

/**
 * One option group as a native radio group: arrow keys move the selection,
 * the swatch is the visual, the ring marks the choice.
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
      <legend className="flex w-full items-baseline gap-[0.6em] p-0 font-outfit">
        <span className="text-[0.75em] font-medium tracking-[0.14em] text-[#131111] uppercase">{legend}</span>
        <span aria-hidden className="text-[0.75em] text-[#131111]/30">
          |
        </span>
        <span className="text-[0.875em] tracking-[-0.01em] text-[#6B635C]">{current?.label}</span>
      </legend>
      <div className="mt-[0.9em] flex flex-wrap gap-x-[0.9em] gap-y-[0.75em]">
        {options.map((option) => {
          const checked = option.id === value
          return (
            <label key={option.id} className="group relative flex w-[4.25em] cursor-pointer flex-col items-center gap-[0.45em]">
              <input
                type="radio"
                name={name}
                value={option.id}
                checked={checked}
                onChange={() => onChange(option.id)}
                className="peer sr-only"
              />
              <span
                className={cn(
                  "flex size-[3.25em] items-center justify-center overflow-hidden rounded-full ring-offset-[3px] ring-offset-[#FBFBF7] transition-[box-shadow,transform] duration-200 motion-reduce:transition-none",
                  "group-hover:scale-[1.04] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-[6px] peer-focus-visible:outline-[#131111]",
                  checked ? "ring-[1.5px] ring-[#131111]" : "ring-1 ring-[#131111]/12"
                )}
              >
                {option.visual}
              </span>
              <span
                className={cn(
                  "text-center font-outfit text-[0.6875em] leading-[1.25] tracking-[-0.01em]",
                  checked ? "text-[#131111]" : "text-[#6B635C]"
                )}
              >
                {option.label}
                {option.note ? <span className="block tabular-nums">{option.note}</span> : null}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
