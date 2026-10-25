"use client"

import { useEffect, useState } from "react"
import { HeroWordmark } from "@/components/sections/hero/hero-wordmark"
import { useCartStore } from "@/stores/cart-store"
import { cn } from "@/lib/utils"

export type StudioMode = "3d" | "2d"

const MODES: { id: StudioMode; short: string; rest: string }[] = [
  { id: "3d", short: "3D", rest: " Preview" },
  { id: "2d", short: "2D", rest: " Layout" },
]

/**
 * Overlay bar for the studio: wordmark home link, the 3D / 2D mode switch
 * (both modes share one state, so switching never leaves the page) and the cart.
 */
export function StudioTopBar({
  mode,
  onModeChange,
  className,
}: {
  mode: StudioMode
  /** Omit to hide the switch (products without a 3D studio). */
  onModeChange?: (mode: StudioMode) => void
  className?: string
}) {
  const storeCount = useCartStore((s) => s.itemCount())
  const setDrawerOpen = useCartStore((s) => s.setDrawerOpen)
  // The cart can load before this subtree hydrates; render the server's 0 until mounted.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const cartCount = mounted ? storeCount : 0

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 px-[1em] pt-[0.5em] sm:px-[1.25em] sm:pt-[0.75em]",
        className,
      )}
    >
      <HeroWordmark className="pointer-events-auto h-9 w-[5.5rem] shrink-0 [&_img]:brightness-0 focus-visible:outline-[#131111] lg:h-10 lg:w-[6.25rem]" />
      {onModeChange ? (
        <div
          role="group"
          aria-label="Studio mode"
          className="pointer-events-auto flex rounded-full border border-[#131111]/15 bg-[#FBFBF7]/85 p-[0.2em] backdrop-blur-sm"
        >
          {MODES.map((m) => {
            const active = m.id === mode
            return (
              <button
                key={m.id}
                type="button"
                aria-pressed={active}
                onClick={() => (active ? undefined : onModeChange(m.id))}
                className={cn(
                  "rounded-full px-[0.9em] py-[0.45em] font-outfit text-[11px] leading-none font-medium tracking-[0.1em] whitespace-nowrap uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111] sm:text-[12px]",
                  active ? "bg-[#131111] text-[#F2F1EF]" : "text-[#131111] hover:bg-[#131111]/5",
                )}
              >
                {m.short}
                <span className="sr-only sm:not-sr-only">{m.rest}</span>
              </button>
            )
          })}
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        aria-label={`Open cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
        className="pointer-events-auto shrink-0 font-outfit text-[12px] leading-none font-medium tracking-[0.14em] text-[#131111] uppercase transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#131111] lg:text-[13px]"
      >
        Cart ({cartCount})
      </button>
    </div>
  )
}
