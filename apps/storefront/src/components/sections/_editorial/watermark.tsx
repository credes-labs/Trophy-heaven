import { cn } from "@/lib/utils"

/**
 * Oversized backdrop word. Floor clamp keeps type readable (and non-overflowing)
 * at 320–360px viewports — plan mobile pass.
 */
export function SectionWatermark({
  children,
  className,
  tone = "ink",
}: {
  children: string
  className?: string
  /** ink = faint dark on cream; cream = faint light on dark film overlays */
  tone?: "ink" | "cream"
}) {
  return (
    <p
      aria-hidden
      className={cn(
        "pointer-events-none absolute font-outfit leading-[0.8] font-light tracking-[-0.08em] select-none",
        /* min 3rem so 320px phones don't get an unreadable speck; max capped */
        "text-[clamp(3rem,12vw,9rem)]",
        tone === "ink" ? "text-[#131111]/[0.06]" : "text-[#F2F1EF]/[0.18]",
        className
      )}
    >
      {children}
    </p>
  )
}

/** Film-overlay title (About feature watermark) with mobile-safe floor. */
export function FilmWatermark({
  children,
  className,
}: {
  children: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute right-0 bottom-0 left-0 translate-y-[8%] font-outfit text-[clamp(2rem,8.5vw,8.059em)] leading-[0.74] lg:translate-y-[18%] lg:whitespace-nowrap",
        className
      )}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 -top-[0.4em] -bottom-[0.15em] bg-gradient-to-t from-[#131111]/82 from-65% to-transparent"
      />
      <p className="relative m-0 text-center font-medium tracking-[-0.054em] text-balance text-[#F2F1EF]">
        {children}
      </p>
    </div>
  )
}
