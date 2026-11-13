"use client"

import { useEffect, useRef, useState } from "react"
import { HeroWordmark } from "@/components/sections/hero/hero-wordmark"
import { useCartStore } from "@/stores/cart-store"
import { cn } from "@/lib/utils"

export type StudioMode = "3d" | "2d"

const MODES: { id: StudioMode; label: string }[] = [
  { id: "3d", label: "3D preview" },
  { id: "2d", label: "2D design" },
]

function CubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[1.15em]" aria-hidden>
      <path d="M12 3.4 19.5 7.5v9L12 20.6 4.5 16.5v-9L12 3.4Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 12.2 19.5 7.7M12 12.2 4.5 7.7M12 12.2v8.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

function PlaqueIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[1.15em]" aria-hidden>
      <path d="M7 19.5V9.2C7 6.2 9 4.2 12 4.2s5 2 5 5v10.3H7Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9" y="10.2" width="6" height="4.2" rx="0.4" fill="currentColor" />
    </svg>
  )
}

/**
 * Overlay for the studio stage: wordmark, icon-only 2D/3D switch, and cart.
 * Both modes share one design, so the switch never leaves this screen.
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
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const cartCount = mounted ? storeCount : 0
  const refs = useRef<Partial<Record<StudioMode, HTMLButtonElement | null>>>({})

  function onKey(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (!onModeChange || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return
    e.preventDefault()
    const next: StudioMode = mode === "3d" ? "2d" : "3d"
    onModeChange(next)
    refs.current[next]?.focus()
  }

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 px-3 pt-2 sm:px-4 sm:pt-3",
        className,
      )}
    >
      <HeroWordmark className="pointer-events-auto h-8 shrink-0 text-[#131111] focus-visible:outline-[#131111] lg:h-9 [&_span]:text-[0.95rem] lg:[&_span]:text-[1.05rem]" />
      {onModeChange ? (
        <div
          role="radiogroup"
          aria-label="Preview"
          className="pointer-events-auto absolute top-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-[#131111]/12 bg-white/90 p-1 sm:top-3"
        >
          {MODES.map((m) => {
            const active = m.id === mode
            return (
              <button
                key={m.id}
                ref={(el) => {
                  refs.current[m.id] = el
                }}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={m.label}
                title={m.label}
                tabIndex={active ? 0 : -1}
                onClick={() => (active ? undefined : onModeChange(m.id))}
                onKeyDown={onKey}
                className={cn(
                  "flex size-8 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]",
                  active ? "bg-[#131111]/10 text-[#131111]" : "text-[#6B635C] hover:bg-[#131111]/5 hover:text-[#131111]"
                )}
              >
                {m.id === "3d" ? <CubeIcon /> : <PlaqueIcon />}
              </button>
            )
          })}
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        aria-label={`Open cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
        className="pointer-events-auto shrink-0 font-outfit text-[12px] leading-none font-medium tracking-[0.14em] text-[#131111] uppercase transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#131111]"
      >
        Cart ({cartCount})
      </button>
    </div>
  )
}
