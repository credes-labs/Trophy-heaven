import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * Fluid editorial section shell shared by homepage blocks.
 * From `lg` up, `1em` = `min(1rem, 100vw / 90)` so Figma px/16 values scale.
 */
export function SectionShell({
  children,
  className,
  id,
  "aria-labelledby": ariaLabelledBy,
  ink = false,
  tone,
}: {
  children: ReactNode
  className?: string
  id?: string
  "aria-labelledby"?: string
  /** Dark surface (hero-adjacent bands). Default cream. */
  ink?: boolean
  /** Coloured band: deep maroon or warm ivory. Overrides `ink`. */
  tone?: "maroon" | "ivory"
}) {
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={cn(
        "overflow-x-clip font-outfit lg:[font-size:min(1rem,calc(100vw/90))]",
        tone === "maroon"
          ? "bg-maroon-deep text-[#F6EFE4] [--eyebrow-color:var(--color-gold-soft)]"
          : tone === "ivory"
            ? "bg-ivory text-[#131111]"
            : ink
              ? "bg-[#131111] text-[#F2F1EF] [--eyebrow-color:var(--color-gold-soft)]"
              : "bg-white text-[#131111]",
        className
      )}
    >
      <div className="mx-auto w-full max-w-[90em] px-[clamp(1.25rem,2.78vw,2.5em)] pt-[clamp(2.5rem,4.72vw,4.25em)] pb-[clamp(2.5rem,6vw,5.5em)]">
        {children}
      </div>
    </section>
  )
}
