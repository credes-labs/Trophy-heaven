import { CtaBand } from "./cta-band"
import { FooterNav } from "./footer-nav"

/**
 * Figma CTA & Footer (1440 artboard). From `lg` up, `1em` = `min(1rem, 100vw / 90)`
 * so every Figma px/16 value scales with viewport. Below `lg` the block keeps
 * the document rem, stacks the copy, and scrolls the polaroids.
 */
export function Footer() {
  return (
    <footer className="overflow-x-clip bg-[#F2F1EF] pb-20 font-outfit text-[#131111] md:pb-0 lg:[font-size:min(1rem,calc(100vw/90))]">
      <div className="mx-auto flex w-full max-w-[90em] flex-col items-center gap-[2rem] lg:gap-[2.625em]">
        <CtaBand />
        <FooterNav />
      </div>
    </footer>
  )
}
