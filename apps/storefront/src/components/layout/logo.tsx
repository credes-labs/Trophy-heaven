import Link from "next/link"
import { BRAND } from "@/lib/brand-facts"

/**
 * Interim Trophy Heaven mark: a "T" monogram plus the Playfair wordmark,
 * rendered as live text. Swap for the supplied logo files when they land.
 */
export function Logo({ iconOnly = false }: { iconOnly?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label={`${BRAND.name} home`}>
      <span
        aria-hidden
        className="grid h-8 w-8 place-items-center rounded-full border border-gold font-serif text-lg leading-none font-semibold text-gold"
      >
        T
      </span>
      {!iconOnly && (
        <span className="font-serif text-xl font-semibold tracking-tight text-foreground">
          {BRAND.name}
        </span>
      )}
    </Link>
  )
}
