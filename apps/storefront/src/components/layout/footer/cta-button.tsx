import Link from "next/link"

import { FOOTER_CTA_HREF, FOOTER_CTA_LABEL } from "./constants"

/** Pill CTA — Frame 2147239262. Sits under the body copy, right column. */
export function CtaButton() {
  return (
    <Link
      href={FOOTER_CTA_HREF}
      className="inline-flex h-[3.875em] w-[19.5em] max-w-full shrink-0 items-center justify-center gap-[1.25em] rounded-full bg-[#131111] py-[0.625em] pr-[0.625em] pl-[0.5em] font-outfit text-[1em] leading-[1.25em] font-light tracking-[-0.02em] text-[#F2F1EF] uppercase transition-opacity hover:opacity-90"
    >
      <span className="size-[0.5em] shrink-0 rounded-full bg-white" aria-hidden />
      {FOOTER_CTA_LABEL}
    </Link>
  )
}
