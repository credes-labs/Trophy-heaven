import Link from "next/link"
import { BrandLockup, Emblem } from "@/components/brand/emblem"
import { BRAND } from "@/lib/brand-facts"

/** Trophy Heaven logo: emblem + wordmark lockup, or the emblem alone. */
export function Logo({ iconOnly = false }: { iconOnly?: boolean }) {
  if (iconOnly) {
    return (
      <Link href="/" aria-label={`${BRAND.name} home`} className="inline-flex text-maroon">
        <Emblem className="w-9" />
      </Link>
    )
  }
  return <BrandLockup className="text-[1rem] text-maroon" />
}
