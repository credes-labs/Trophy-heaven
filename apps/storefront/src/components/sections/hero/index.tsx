import { HeroStudioImage } from "./hero-background"
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
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-[#1C1612]/80 via-[#1C1612]/25 to-[#1C1612]/35"
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1440px] flex-col px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] lg:px-10 lg:pt-6 lg:pb-8">
        <div className="hidden lg:block">
          <HeroNav />
        </div>
        <div className="lg:hidden">
          <HeroNavMobile />
        </div>

        <div className="flex flex-1 items-end py-8 lg:items-center lg:py-6">
          <HeroHeadline />
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
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
