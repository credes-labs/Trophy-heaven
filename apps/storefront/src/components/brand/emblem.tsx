import Link from "next/link"
import { BRAND } from "@/lib/brand-facts"
import { cn } from "@/lib/utils"

/**
 * Trophy Heaven emblem (winged "T" over a diamond), traced from the supplied logo
 * artwork (public/images/trophy heaven logo.jpeg) and made symmetric. Fills with
 * currentColor; the standalone file is public/brand/trophy-heaven-emblem.svg.
 */
export const EMBLEM_VIEWBOX = "0 0 2115 1113"
export const EMBLEM_PATH =
  "M0 0L1057 15L2114 0L2050 138L1201 138L1057 293L913 138L64 138Z" +
  "M116 248L783 248L891 617L1057 486L1223 617L1331 248L1998 248L1953 346L1469 484L1081 1112L1221 628L1057 767L893 628L1033 1112L645 484L161 346Z"

export function Emblem({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox={EMBLEM_VIEWBOX}
      className={cn("block h-auto", className)}
      fill="currentColor"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path d={EMBLEM_PATH} />
    </svg>
  )
}

/**
 * Logo lockup: emblem beside a stacked TROPHY / HEAVEN in the brand serif.
 * `stacked` puts the emblem above the words, as on the brand artwork.
 */
export function BrandLockup({
  className,
  stacked = false,
  href = "/",
}: {
  className?: string
  stacked?: boolean
  href?: string | null
}) {
  const inner = (
    <>
      <Emblem className={stacked ? "w-[2.4em]" : "w-[2.15em] shrink-0"} />
      <span
        aria-hidden
        className={cn(
          "font-brand tracking-[0.02em] uppercase",
          stacked ? "text-center text-[1.35em]" : "text-[0.98em]",
          // after the size: tailwind-merge drops a leading-* that precedes a text-* size
          "leading-[0.95]"
        )}
      >
        <span className="block">Trophy</span>
        <span className="block">Heaven</span>
      </span>
    </>
  )
  const layout = cn(
    "inline-flex items-center no-underline",
    stacked ? "flex-col gap-[0.45em]" : "gap-[0.55em]",
    className
  )
  if (href === null) {
    return (
      <span className={layout} role="img" aria-label={BRAND.name}>
        {inner}
      </span>
    )
  }
  return (
    <Link href={href} aria-label={`${BRAND.name} home`} className={layout}>
      {inner}
    </Link>
  )
}
