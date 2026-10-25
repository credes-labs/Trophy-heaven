import { HeroStudioImage } from "./hero-background"
import { HeroChair } from "./hero-chair"
import { HeroAside, HeroHeadline } from "./hero-copy"
import { HeroCta } from "./hero-cta"
import { HeroNav, HeroNavMobile } from "./hero-nav"
import { HeroProducts } from "./hero-products"

export function HeroSection() {
  return (
    <section className="relative isolate min-h-[100svh] w-full overflow-x-clip bg-[#1C1612]">
      <HeroStudioImage />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-[#1C1612]/72 via-transparent to-[#1C1612]/40"
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1440px] flex-col px-5 pt-5 pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:px-10 lg:pt-6 lg:pb-8">
        <div className="relative z-30 hidden lg:block">
          <HeroNav />
        </div>
        <div className="relative z-30 lg:hidden">
          <HeroNavMobile />
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-end py-4 lg:justify-center lg:py-6">
          <HeroHeadline />
          <HeroChair />
        </div>

        <div className="relative z-30 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <HeroProducts />
          <div className="flex max-w-[20rem] flex-col items-start gap-4 lg:ml-auto lg:items-start">
            <HeroAside />
            <HeroCta />
          </div>
        </div>
      </div>
    </section>
  )
}
