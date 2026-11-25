import Link from "next/link"

import { FOOTER_CTA_HREF, FOOTER_CTA_LABEL } from "./constants"

/** Pill CTA — Frame 2147239262. Sits under the body copy, right column. */
export function CtaButton() {
  return (
    <Link
      href={FOOTER_CTA_HREF}
      className="inline-flex h-[3.875em] w-[19.5em] max-w-full shrink-0 items-center justify-center gap-[1.25em] rounded-full bg-maroon py-[0.625em] pr-[0.625em] pl-[0.5em] font-outfit text-[1em] leading-[1.25em] font-light tracking-[-0.02em] text-[#F6EFE4] uppercase transition-colors hover:bg-[#8A2D25]"
    >
      <span className="size-[0.5em] shrink-0 rounded-full bg-gold-soft" aria-hidden />
      {FOOTER_CTA_LABEL}
    </Link>
  )
}
