import { CtaButton } from "./cta-button"
import { FOOTER_BODY, FOOTER_HEADLINE } from "./constants"
import { PolaroidStrip } from "./polaroid-strip"

/** CTA band — Frame 2147239268 (1440×574). */
export function CtaBand() {
  return (
    <section
      aria-labelledby="footer-cta-heading"
      className="relative w-full lg:h-[35.875em]"
    >
      <div className="flex flex-col gap-6 px-[clamp(1.25rem,2.78vw,2.5em)] pt-[clamp(2rem,2.92vw,2.625em)] lg:block lg:h-full lg:p-0">
        <div className="lg:absolute lg:top-[2.625em] lg:left-[2.5em] lg:w-[27em]">
          <h2
            id="footer-cta-heading"
            className="m-0 font-outfit text-balance text-[clamp(2rem,8vw,3.375em)] leading-[1.24] font-normal tracking-[-0.04em] text-[#131111] lg:text-[3.375em]"
          >
            {FOOTER_HEADLINE}
          </h2>
        </div>

        <div className="flex max-w-[34.75em] flex-col items-start gap-[1.5em] lg:absolute lg:top-[2.625em] lg:left-[52.75em] lg:w-[34.75em]">
          <p className="m-0 font-outfit text-[clamp(1.125rem,4vw,1.75em)] leading-[1.4] font-normal tracking-[-0.03em] text-[#6B635C] lg:text-[1.75em]">
            {FOOTER_BODY}
          </p>
          <CtaButton />
        </div>
      </div>

      <div className="pointer-events-none lg:absolute lg:inset-x-0 lg:top-[15.875em] lg:h-[20em]">
        <PolaroidStrip />
      </div>
    </section>
  )
}
