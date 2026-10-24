import Link from "next/link"
import { HERO_CTA, HERO_CTA_HREF, HERO_CTA_SECONDARY, HERO_CTA_SECONDARY_HREF } from "./constants"

const pillClass =
  "inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 font-outfit text-[12px] leading-none font-medium tracking-[0.14em] text-[#131111] uppercase transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[#F2F1EF]"

const textClass =
  "font-outfit text-[12px] leading-none font-medium tracking-[0.14em] text-[#F4F1EA] uppercase underline underline-offset-[0.2em] transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[#F2F1EF]"

/** One white pill, matching the reference, plus the second existing action as a text link. */
export function HeroCta() {
  return (
    <div className="flex flex-col items-start gap-3">
      <Link href={HERO_CTA_SECONDARY_HREF} className={pillClass}>
        {HERO_CTA_SECONDARY}
      </Link>
      <Link href={HERO_CTA_HREF} className={textClass}>
        {HERO_CTA}
      </Link>
    </div>
  )
}
