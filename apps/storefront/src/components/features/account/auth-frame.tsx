import type { ReactNode } from "react"
import TrophySheet from "@/components/features/account/trophy-sheet"
import { EditorialEyebrow } from "@/components/layout/editorial/editorial-eyebrow"
import { EditorialFrame, EditorialShell } from "@/components/layout/editorial/editorial-shell"
import { EditorialWatermark } from "@/components/layout/editorial/editorial-watermark"

export function AuthFrame({
  watermark,
  eyebrow,
  title,
  lede,
  illustration = false,
  children,
}: {
  watermark: string
  eyebrow: string
  title: string
  lede: string
  /** Show the trophy-cup technical sheet beside the form on wide screens. */
  illustration?: boolean
  children: ReactNode
}) {
  return (
    <EditorialShell>
      <section className="relative overflow-hidden">
        <EditorialFrame>
          <div
            className={
              illustration
                ? "grid items-start gap-[clamp(2.5em,5vw,5em)] xl:grid-cols-[minmax(0,32em)_minmax(0,1fr)]"
                : undefined
            }
          >
            <div className="relative max-w-[32em]">
              <EditorialWatermark>{watermark}</EditorialWatermark>
              <EditorialEyebrow>{eyebrow}</EditorialEyebrow>
              <h1 className="relative m-0 mt-[1em] font-outfit text-[clamp(2.25rem,5vw,3.75em)] leading-[1.1] font-normal tracking-[-0.04em] text-balance text-[#131111]">
                {title}
              </h1>
              <p className="relative mt-[1.5em] m-0 font-outfit text-[1.125em] leading-[1.4] tracking-[-0.02em] text-[#131111]/70">
                {lede}
              </p>
              <div className="relative mt-[2.5em]">{children}</div>
            </div>
            {illustration ? (
              <div className="hidden w-full xl:block">
                <TrophySheet
                  ink="#131111"
                  paper="#F2F1EF"
                  className="ml-auto w-full max-w-[44em]"
                />
              </div>
            ) : null}
          </div>
        </EditorialFrame>
      </section>
    </EditorialShell>
  )
}

export function AuthAlert({
  children,
  tone = "error",
}: {
  children: ReactNode
  tone?: "error" | "ok"
}) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={
        tone === "error"
          ? "mb-[1.5em] m-0 font-outfit text-[0.875em] leading-[1.4] text-[#8A2D25]"
          : "mb-[1.5em] m-0 font-outfit text-[0.875em] leading-[1.4] text-[#131111]"
      }
    >
      {children}
    </p>
  )
}
