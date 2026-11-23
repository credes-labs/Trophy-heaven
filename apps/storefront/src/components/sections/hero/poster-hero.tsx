import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"
import { SiteNavPoster } from "@/components/layout/site-nav/site-nav"
import type { NavCategory } from "@/components/layout/site-nav/constants"
import { Wordmark } from "@/components/brand/wordmark"
import { HERO_FEATURES, HERO_TROPHIES } from "./constants"

const featureClass =
  "text-[10px] leading-none font-normal tracking-[0.04em] text-[#1A1A1A]/70 uppercase transition-colors hover:text-[#1A1A1A] focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#1A1A1A]"

export type PosterTrophy = {
  src: string
  width: number
  intrinsicHeight: number
  /** Height as a share of the stage, e.g. "78%". */
  height: string
}

/**
 * The landing-page poster hero: the primary nav in tiny caps with the emblem, a
 * full-width stacked TROPHY HEAVEN wordmark (logo maroon, as on the brand artwork), cut-out trophies standing in front of it, a caps
 * label row, the page title + copy bottom-left and an outlined CTA box.
 */
export function PosterHero({
  id,
  categories,
  title,
  showTitle = true,
  lead,
  body,
  cta = { label: "All products", href: "/shop" },
  trophies = HERO_TROPHIES,
  home = false,
  children,
}: {
  id?: string
  /** Top-level categories for the nav's catalog menu (same source as the site header). */
  categories?: NavCategory[]
  /** The page's h1. Hidden visually when `showTitle` is false (homepage). */
  title: string
  showTitle?: boolean
  /** Bold first line under the stage; defaults to the title. */
  lead?: string
  body?: ReactNode
  cta?: { label: string; href: string } | null
  trophies?: readonly PosterTrophy[]
  /** Homepage: marks the hero for the mobile overlay header and leaves room for it. */
  home?: boolean
  /** Optional extra row under the copy (e.g. filter chips). */
  children?: ReactNode
}) {
  const leadText = lead
  return (
    <section
      id={id}
      data-poster-hero
      data-home-hero={home ? "" : undefined}
      className="relative isolate w-full scroll-mt-[7rem] overflow-x-clip bg-white text-[#1A1A1A]"
    >
      <div className="mx-auto max-w-[1600px] px-4 pt-3 lg:px-6 lg:pt-4">
        <div className="hidden lg:block">
          <SiteNavPoster categories={categories} />
        </div>
        {home ? <div aria-hidden className="h-16 lg:hidden" /> : null}

        <div className="relative">
          <Wordmark
            title={null}
            className="relative z-0 w-full pt-[2vw] text-maroon select-none lg:pt-[1vw]"
          />

          <ul className="relative z-0 m-0 mt-[2.2vw] hidden list-none grid-cols-12 gap-x-4 p-0 lg:grid">
            {HERO_FEATURES.map((item) => (
              <li key={item.label} className={item.col}>
                <Link href={item.href} className={featureClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Trophies stand in front of "VEN" (right of the ligature, which stays visible), like objects in front of a sign. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-[46vw] z-10 flex h-[60vw] items-end justify-center gap-[1.5vw] lg:top-[min(20vw,320px)] lg:h-[min(32vw,512px)] lg:justify-end lg:gap-[1.4vw] lg:pr-[4vw]"
          >
            {trophies.map((t) => (
              <div key={t.src} className="relative flex items-end" style={{ height: t.height }}>
                <Image
                  src={t.src}
                  alt=""
                  width={t.width}
                  height={t.intrinsicHeight}
                  preload
                  sizes="(min-width: 1024px) 18vw, 34vw"
                  className="relative z-10 h-full w-auto object-contain drop-shadow-[0_10px_14px_rgba(26,26,26,0.10)]"
                />
                <span className="absolute -bottom-[0.6vw] left-1/2 z-0 h-[1.4vw] w-[110%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(26,26,26,0.22),transparent)] blur-[2px]" />
              </div>
            ))}
          </div>

          <div className="relative lg:h-[min(14vw,224px)]">
            <div aria-hidden className="h-[70vw] lg:hidden" />
            <div className="relative z-20 flex flex-col gap-5 pb-6 lg:absolute lg:inset-x-0 lg:bottom-0 lg:flex-row lg:items-end lg:justify-between lg:pb-4">
              <div className="max-w-[26rem]">
                {showTitle ? (
                  <h1 className="m-0 text-[clamp(1.5rem,2.3vw,2.25rem)] leading-[1.05] font-medium tracking-[-0.03em] text-[#1A1A1A]">
                    {title}
                  </h1>
                ) : (
                  <h1 className="sr-only">{title}</h1>
                )}
                {leadText || body ? (
                  <p
                    className={`m-0 text-[12px] leading-snug text-[#1A1A1A]/70 ${showTitle ? "mt-2 text-[13px]" : ""}`}
                  >
                    {leadText ? (
                      <span className="block font-semibold text-[#1A1A1A]">{leadText}</span>
                    ) : null}
                    {body}
                  </p>
                ) : null}
                {children ? <div className="mt-4">{children}</div> : null}
              </div>
              {cta ? (
                <Link
                  href={cta.href}
                  className="flex h-14 w-full shrink-0 items-center justify-center border border-[#1A1A1A]/35 text-[11px] font-medium tracking-[0.06em] text-[#1A1A1A] uppercase transition-colors hover:bg-[#1A1A1A] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A1A1A] lg:h-[clamp(3.5rem,5.6vw,5.5rem)] lg:w-[clamp(14rem,22vw,22rem)]"
                >
                  {cta.label}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
