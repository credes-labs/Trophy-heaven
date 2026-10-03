import type { ReactNode } from "react"
import { EditorialEyebrow } from "@/components/layout/editorial/editorial-eyebrow"
import { EditorialFrame } from "@/components/layout/editorial/editorial-shell"
import { EditorialWatermark } from "@/components/layout/editorial/editorial-watermark"

/** Lightweight editorial page hero used by scaffolded routes. */
export function SimplePageHero({
  eyebrow,
  watermark,
  title,
  body,
  children,
}: {
  eyebrow: string
  watermark?: string
  title: string
  body: string
  children?: ReactNode
}) {
  return (
    <section className="relative overflow-hidden border-b border-[#131111]/10">
      <EditorialFrame className="pb-[clamp(2.5rem,6vw,5em)]">
        <div className="relative z-10 max-w-[36em]">
          {watermark ? <EditorialWatermark>{watermark}</EditorialWatermark> : null}
          <EditorialEyebrow>{eyebrow}</EditorialEyebrow>
          <h1 className="relative m-0 mt-[1em] font-outfit text-[clamp(2.25rem,5vw,3.75em)] leading-[1.1] font-normal tracking-[-0.04em] text-[#131111]">
            {title}
          </h1>
          <p className="mt-[1.5em] m-0 font-outfit text-[1.125em] leading-[1.4] tracking-[-0.02em] text-[#131111]/70">
            {body}
          </p>
          {children ? <div className="mt-[2em]">{children}</div> : null}
        </div>
      </EditorialFrame>
    </section>
  )
}
