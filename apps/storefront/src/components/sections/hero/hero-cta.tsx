import { PillCta } from "@/components/sections/_editorial"
import { HERO_CTA, HERO_CTA_HREF, HERO_CTA_SECONDARY, HERO_CTA_SECONDARY_HREF } from "./constants"

/** Dual CTAs — primary design studio, secondary shop. Full-width on mobile. */
export function HeroCta() {
  return (
    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
      <PillCta href={HERO_CTA_SECONDARY_HREF} variant="light">
        {HERO_CTA_SECONDARY}
      </PillCta>
      <PillCta
        href={HERO_CTA_HREF}
        variant="light"
        className="bg-transparent text-[#FCFBF8] ring-1 ring-[#FCFBF8]/40 hover:bg-white/10 [&_span]:bg-[#FCFBF8]"
      >
        {HERO_CTA}
      </PillCta>
    </div>
  )
}
