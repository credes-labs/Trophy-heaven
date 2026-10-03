import { HeroStudioImage } from "./hero-background"
import { HeroCopy } from "./hero-copy"
import { HeroCrest } from "./hero-crest"
import { HeroCta } from "./hero-cta"
import { HeroNav, HeroNavMobile } from "./hero-nav"
import { HeroProducts } from "./hero-products"
import { HERO_HEADLINE } from "./constants"

export function HeroSection() {
  return (
    <section className="relative isolate min-h-[88svh] w-full overflow-x-clip bg-[#1C1612] lg:min-h-[874px]">
      <h1 className="sr-only">{HERO_HEADLINE}</h1>
      <HeroStudioImage />
      <HeroCrest />
      <div className="relative z-10 mx-auto flex min-h-[88svh] max-w-[1440px] flex-col px-5 py-5 lg:min-h-[874px] lg:px-10 lg:py-7">
        <div className="hidden lg:block">
          <HeroNav />
        </div>
        <div className="lg:hidden">
          <HeroNavMobile />
        </div>

        <div className="flex max-w-[521px] flex-1 items-center py-10 lg:py-0">
          <HeroCopy />
        </div>

        <div className="flex flex-col items-stretch justify-between gap-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:items-start lg:flex-row lg:items-end">
          <HeroProducts />
          <HeroCta />
        </div>
      </div>
    </section>
  )
}
