"use client"

import Link from "next/link"
import { HeroWordmark } from "@/components/sections/hero/hero-wordmark"
import { useCartStore } from "@/stores/cart-store"
import { cn } from "@/lib/utils"

export type StudioMode = "3d" | "2d"

const MODES: { id: StudioMode; short: string; rest: string }[] = [
  { id: "3d", short: "3D", rest: " Preview" },
  { id: "2d", short: "2D", rest: " Layout" },
]

function ModeLabel({ mode }: { mode: (typeof MODES)[number] }) {
  return (
    <>
      {mode.short}
      <span className="sr-only sm:not-sr-only">{mode.rest}</span>
    </>
  )
}

/**
 * Overlay bar shared by both studio modes: wordmark home link, the 3D / 2D mode
 * switch (links, so each mode keeps its own URL) and the cart.
 */
export function StudioTopBar({
  mode,
  hrefs,
  onNavigate,
  className,
}: {
  mode: StudioMode
  /** Omit a mode to hide the switch (products without a 3D studio). */
  hrefs: Partial<Record<StudioMode, string>>
  /** Lets a mode hand its state over before leaving (may preventDefault and navigate itself). */
  onNavigate?: (mode: StudioMode, event: React.MouseEvent<HTMLAnchorElement>) => void
  className?: string
}) {
  const cartCount = useCartStore((s) => s.itemCount())
  const setDrawerOpen = useCartStore((s) => s.setDrawerOpen)
  const showSwitch = Boolean(hrefs["3d"] && hrefs["2d"])

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 px-[1em] pt-[0.5em] sm:px-[1.25em] sm:pt-[0.75em]",
        className,
      )}
    >
      <HeroWordmark className="pointer-events-auto h-9 w-[5.5rem] shrink-0 [&_img]:brightness-0 focus-visible:outline-[#131111] lg:h-10 lg:w-[6.25rem]" />
      {showSwitch ? (
        <nav
          aria-label="Studio mode"
          className="pointer-events-auto flex rounded-full border border-[#131111]/15 bg-[#FBFBF7]/85 p-[0.2em] backdrop-blur-sm"
        >
          {MODES.map((m) =>
            m.id === mode ? (
              <span
                key={m.id}
                aria-current="page"
                className="rounded-full bg-[#131111] px-[0.9em] py-[0.45em] font-outfit text-[11px] leading-none font-medium tracking-[0.1em] whitespace-nowrap text-[#F2F1EF] uppercase sm:text-[12px]"
              >
                <ModeLabel mode={m} />
              </span>
            ) : (
              <Link
                key={m.id}
                href={hrefs[m.id]!}
                onClick={onNavigate ? (event) => onNavigate(m.id, event) : undefined}
                className="rounded-full px-[0.9em] py-[0.45em] font-outfit text-[11px] leading-none font-medium tracking-[0.1em] whitespace-nowrap text-[#131111] uppercase transition-colors hover:bg-[#131111]/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111] sm:text-[12px]"
              >
                <ModeLabel mode={m} />
              </Link>
            ),
          )}
        </nav>
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
