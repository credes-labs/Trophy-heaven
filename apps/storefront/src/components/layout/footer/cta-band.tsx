import { CtaButton } from "./cta-button"
import { FOOTER_BODY, FOOTER_HEADLINE } from "./constants"
import { FooterOrbit } from "./footer-orbit"

/** CTA band — revolving pieces on the left, line and CTA on the right. */
export function CtaBand() {
  return (
    <section
      aria-labelledby="footer-cta-heading"
      className="relative flex w-full flex-col gap-6 px-[clamp(1.25rem,2.78vw,2.5em)] pt-[clamp(2rem,2.92vw,2.625em)] lg:block lg:h-[27em] lg:p-0"
    >
      <h2 id="footer-cta-heading" className="sr-only">
        {FOOTER_HEADLINE}
      </h2>

      <div className="pointer-events-none h-[15rem] sm:h-[20rem] lg:absolute lg:top-[1.5em] lg:left-[1em] lg:h-[21em] lg:w-[49em]">
        <FooterOrbit />
      </div>

      <div className="hidden max-w-[34.75em] flex-col items-start gap-[1.5em] lg:absolute lg:top-1/2 lg:left-[52.75em] lg:flex lg:w-[34.75em] lg:-translate-y-1/2">
        <p className="m-0 font-outfit text-[clamp(1.125rem,4vw,1.75em)] leading-[1.4] font-normal tracking-[-0.03em] text-[#6B635C] lg:text-[1.75em]">
          {FOOTER_BODY}
        </p>
        <CtaButton />
      </div>
    </section>
  )
}
