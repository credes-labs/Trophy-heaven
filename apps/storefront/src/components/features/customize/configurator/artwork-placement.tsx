"use client"

import { useRef } from "react"
import { ARTWORKS, type ArtId } from "@/lib/configurator/plaque"
import { cn } from "@/lib/utils"

/** Two-way placement for an uploaded photo. Does not change the price. */
export function ArtworkPlacement({
  value,
  onChange,
}: {
  value: ArtId
  onChange: (value: ArtId) => void
}) {
  const refs = useRef<Partial<Record<ArtId, HTMLButtonElement | null>>>({})

  function onKey(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight" && e.key !== "ArrowUp" && e.key !== "ArrowDown") return
    e.preventDefault()
    const next: ArtId = value === "plate" ? "wood" : "plate"
    onChange(next)
    refs.current[next]?.focus()
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="m-0 font-outfit text-[0.6875em] font-medium tracking-[0.14em] text-[#131111] uppercase">Artwork</p>
      <div role="radiogroup" aria-label="Artwork placement" className="flex gap-2.5">
        {ARTWORKS.map((option) => {
          const on = option.id === value
          return (
            <button
              key={option.id}
              ref={(el) => {
                refs.current[option.id] = el
              }}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={on ? 0 : -1}
              title={option.label}
              onClick={() => onChange(option.id)}
              onKeyDown={onKey}
              className={cn(
                "h-[2.15em] min-w-0 flex-1 rounded-full border font-outfit text-[0.75em] tracking-[0.04em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]",
                on ? "border-[#131111] bg-[#131111]/8 text-[#131111]" : "border-[#131111]/20 text-[#6B635C] hover:text-[#131111]"
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
