import type { ReactNode } from "react"
import { EditorialEyebrow } from "@/components/layout/editorial/editorial-eyebrow"
import { EditorialFrame, EditorialShell } from "@/components/layout/editorial/editorial-shell"
import { EditorialWatermark } from "@/components/layout/editorial/editorial-watermark"

export function AuthFrame({
  watermark,
  eyebrow,
  title,
  lede,
  children,
}: {
  watermark: string
  eyebrow: string
  title: string
  lede: string
  children: ReactNode
}) {
  return (
    <EditorialShell>
      <section className="relative overflow-hidden">
        <EditorialFrame>
          <div className="relative max-w-[32em]">
            <EditorialWatermark>{watermark}</EditorialWatermark>
            <EditorialEyebrow>{eyebrow}</EditorialEyebrow>
            <h1 className="relative m-0 mt-[1em] font-outfit text-[clamp(2.25rem,5vw,3.75em)] leading-[1.1] font-normal tracking-[-0.04em] text-[#131111]">
              {title}
            </h1>
            <p className="relative mt-[1.5em] m-0 font-outfit text-[1.125em] leading-[1.4] tracking-[-0.02em] text-[#131111]/70">
              {lede}
            </p>
            <div className="relative mt-[2.5em]">{children}</div>
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
