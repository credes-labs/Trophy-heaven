import { BRAND } from "@/lib/brand-facts"
import { cn } from "@/lib/utils"
import {
  WORDMARK_HEAVEN,
  WORDMARK_LIGATURE,
  WORDMARK_METRICS as M,
  WORDMARK_TROPHY,
} from "./wordmark-paths"

/** Word space for the one-line layout, in the paths' units (cap height 480). */
const LINE_GAP = 150

function frame(layout: "stacked" | "line") {
  if (layout === "line") {
    const heavenX = M.trophy.width + LINE_GAP
    const top = Math.min(M.trophy.top, M.heaven.top)
    const bottom = Math.max(M.trophy.bottom, M.heaven.bottom)
    return {
      heaven: { x: heavenX, y: 0 },
      viewBox: `0 ${top} ${heavenX + M.heaven.width} ${bottom - top}`,
    }
  }
  const { x, y } = M.stackedOffset
  const left = Math.min(0, x)
  const right = Math.max(M.trophy.width, x + M.heaven.width)
  return {
    heaven: { x, y },
    viewBox: `${left} ${M.trophy.top} ${right - left} ${y + M.heaven.bottom - M.trophy.top}`,
  }
}

/**
 * The TROPHY HEAVEN wordmark as drawn on the brand artwork: Trajan-style capitals
 * (Cinzel outlines fitted to the artwork letter by letter) with the looped A-V
 * ligature in HEAVEN and the ™. `stacked` is the logo arrangement; `line` sets
 * both words on one baseline. Fills with currentColor; size it by width.
 */
export function Wordmark({
  layout = "stacked",
  className,
  title = BRAND.name,
}: {
  layout?: "stacked" | "line"
  className?: string
  /** Accessible name; pass null when a parent link already names it. */
  title?: string | null
}) {
  const { heaven, viewBox } = frame(layout)
  return (
    <svg
      viewBox={viewBox}
      className={cn("block h-auto", className)}
      fill="currentColor"
      role={title ? "img" : undefined}
      aria-label={title ?? undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <path d={WORDMARK_TROPHY} />
      <g transform={`translate(${heaven.x} ${heaven.y})`}>
        <path d={WORDMARK_HEAVEN} />
        <path d={WORDMARK_LIGATURE} fillRule="evenodd" />
      </g>
    </svg>
  )
}
