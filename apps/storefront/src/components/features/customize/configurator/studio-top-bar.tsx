"use client"

import { useEffect, useRef, useState } from "react"
import { Box, PenLine } from "lucide-react"
import { HeroWordmark } from "@/components/sections/hero/hero-wordmark"
import { useCartStore } from "@/stores/cart-store"
import { cn } from "@/lib/utils"

export type StudioMode = "3d" | "2d"

const MODES: { id: StudioMode; label: string; hint: string; Icon: typeof Box }[] = [
  { id: "3d", label: "3D Preview", hint: "Shape & materials", Icon: Box },
  { id: "2d", label: "2D Design", hint: "Add photo & text", Icon: PenLine },
]

/**
 * Overlay bar for the studio: wordmark home link, the primary 3D / 2D mode
 * switch (both modes share one state, so switching never leaves the page) and
 * the cart. On small screens the switch drops to its own full-width row.
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
        "pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-wrap items-center justify-between gap-x-3 gap-y-[0.5em] px-[1em] pt-[0.5em] sm:px-[1.25em] sm:pt-[0.75em]",
        className,
      )}
    >
      <HeroWordmark className="pointer-events-auto h-9 w-[5.5rem] shrink-0 [&_img]:brightness-0 focus-visible:outline-[#131111] lg:h-10 lg:w-[6.25rem]" />
      {onModeChange ? (
        <div
          role="radiogroup"
          aria-label="Studio mode"
          className="pointer-events-auto order-last flex w-full rounded-full border border-[#131111]/15 bg-[#FBFBF7]/92 p-[4px] shadow-[0_10px_30px_-18px_rgba(19,17,17,0.55)] backdrop-blur-sm md:absolute md:top-[0.75em] md:left-1/2 md:order-none md:w-auto md:-translate-x-1/2"
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
                tabIndex={active ? 0 : -1}
                onClick={() => (active ? undefined : onModeChange(m.id))}
                onKeyDown={onKey}
                className={cn(
                  "flex min-w-0 flex-1 items-center justify-center gap-[0.55em] rounded-full px-[1.1em] py-[0.5em] font-outfit whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111] md:flex-none md:px-[1.4em]",
                  active ? "bg-[#131111] text-[#F2F1EF]" : "text-[#131111] hover:bg-[#131111]/6",
                )}
              >
                <m.Icon className="size-[16px] shrink-0" strokeWidth={1.6} aria-hidden />
                <span className="flex flex-col items-start leading-[1.1]">
                  <span className="text-[13px] font-medium tracking-[0.02em] lg:text-[14px]">{m.label}</span>
                  <span className={cn("text-[11px] tracking-[0.01em]", active ? "text-[#F2F1EF]/75" : "text-[#6B635C]")}>
                    {m.hint}
                  </span>
                </span>
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
