import Image from "next/image"
import Link from "next/link"
import { HeroTopBar } from "./hero-top-bar"
import { HERO_FEATURES, HERO_TAGLINE, HERO_TROPHIES } from "./constants"

const featureClass =
  "text-[10px] leading-none font-normal tracking-[0.04em] text-[#1A1A1A]/70 uppercase transition-colors hover:text-[#1A1A1A] focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#1A1A1A]"

/**
 * White editorial poster: tiny caps nav, a full-bleed lowercase wordmark, and
 * cut-out trophies standing in front of it. Typography is Urbanist throughout.
 */
export function HeroSection() {
  return (
    <section
      data-home-hero
      className="relative isolate w-full overflow-x-clip bg-white text-[#1A1A1A]"
    >
      <div className="mx-auto max-w-[1600px] px-4 pt-3 lg:px-6 lg:pt-4">
        <div className="hidden lg:block">
          <HeroTopBar />
        </div>
        <div aria-hidden className="h-16 lg:hidden" />

        <div className="relative">
          <h1 className="relative z-0 m-0 pt-[1.5vw] text-center lg:pt-[0.6vw]">
            <span
              aria-hidden
              className="block font-medium leading-[0.8] tracking-[-0.06em] whitespace-nowrap text-[#2B2B2B] [font-size:16.4vw] lg:[font-size:min(17.2vw,276px)] select-none"
            >
              trophy heaven
            </span>
            <span className="sr-only">Trophy Heaven — custom trophies, awards and engraved plaques</span>
          </h1>

          <ul className="relative z-0 m-0 mt-[3.4vw] hidden list-none grid-cols-12 gap-x-4 p-0 lg:grid">
            {HERO_FEATURES.map((item) => (
              <li key={item.label} className={item.col}>
                <Link href={item.href} className={featureClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Trophies overlap the lower half of the wordmark, like objects in front of a sign. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-[5vw] z-10 flex h-[80vw] items-end justify-center gap-[1.5vw] lg:top-[5vw] lg:h-[min(36vw,580px)] lg:gap-[2.4vw]"
          >
            {HERO_TROPHIES.map((t) => (
              <div key={t.src} className="relative flex h-full items-end" style={{ height: t.height }}>
                <Image
                  src={t.src}
                  alt=""
                  width={t.width}
                  height={t.intrinsicHeight}
                  priority
                  sizes="(min-width: 1024px) 18vw, 34vw"
                  className="relative z-10 h-full w-auto object-contain drop-shadow-[0_10px_14px_rgba(26,26,26,0.10)]"
                />
                <span className="absolute -bottom-[0.6vw] left-1/2 z-0 h-[1.4vw] w-[110%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(26,26,26,0.22),transparent)] blur-[2px]" />
              </div>
            ))}
          </div>

          <div className="relative lg:h-[min(25vw,410px)]">
            <div aria-hidden className="h-[74vw] lg:hidden" />
            <div className="relative z-20 flex flex-col gap-5 pb-6 lg:absolute lg:inset-x-0 lg:bottom-0 lg:flex-row lg:items-end lg:justify-between lg:pb-4">
              <p className="m-0 max-w-[16rem] text-[12px] leading-snug text-[#1A1A1A]/70">
                <span className="block font-semibold text-[#1A1A1A]">{HERO_TAGLINE.lead}</span>
                {HERO_TAGLINE.rest}
              </p>
              <Link
                href="/shop"
                className="flex h-14 w-full items-center justify-center border border-[#1A1A1A]/35 text-[11px] font-medium tracking-[0.06em] text-[#1A1A1A] uppercase transition-colors hover:bg-[#1A1A1A] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A1A1A] lg:h-[clamp(3.5rem,5.6vw,5.5rem)] lg:w-[clamp(14rem,22vw,22rem)]"
              >
                All products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
