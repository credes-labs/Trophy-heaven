import Link from "next/link"

import { HERO_CTA } from "./constants"

/** Pill CTA — Frame 2147239202. Sits bottom-right, separate from the copy. */
export function HeroCta() {
  return (
    <Link
      href="/shop"
      className="inline-flex h-[52px] shrink-0 items-center justify-center gap-3 rounded-full bg-white py-4 pr-[26px] pl-6 font-outfit text-[16px] leading-5 font-normal tracking-wide text-[#131111] uppercase transition-opacity hover:opacity-90"
    >
      <span className="size-2 shrink-0 rounded-full bg-[#131111]" aria-hidden />
      {HERO_CTA}
    </Link>
  )
}
