import { Suspense } from "react"
import { HeroSection } from "@/components/sections/hero-section"
import { AboutSection } from "@/components/sections/about-section"
import { ProductsCategoriesSection } from "@/components/sections/products-categories-section"
import { ExploreSection } from "@/components/sections/explore-section"
import { DisciplinesSection } from "@/components/sections/disciplines"
import { CustomizerSection } from "@/components/sections/customizer"
import { ProcessSection } from "@/components/sections/process"
import { RecentWorkSection } from "@/components/sections/recent-work"
import { CorporateBandSection } from "@/components/sections/corporate-band"
import { MaterialsSection } from "@/components/sections/materials"
import { VoicesSection } from "@/components/sections/voices"
import { JournalRailSection } from "@/components/sections/journal-rail"
import { SignupSection } from "@/components/sections/signup"

/** ISR: refresh the homepage every five minutes. */
export const revalidate = 300

/**
 * Desktop narrative order (document order).
 * Mobile commerce-first via flex `order-*` below `lg`.
 */
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <div className="flex flex-col">
        <div className="order-1 lg:order-none">
          <Suspense fallback={null}>
            <DisciplinesSection />
          </Suspense>
        </div>
        <div className="order-2 lg:order-none">
          <CustomizerSection />
        </div>
        <div className="order-5 lg:order-none">
          <ProcessSection />
        </div>
        <div className="order-3 lg:order-none">
          <Suspense fallback={null}>
            <RecentWorkSection />
          </Suspense>
        </div>
        <div className="order-4 lg:order-none">
          <CorporateBandSection />
        </div>
        <div className="order-6 lg:order-none">
          <AboutSection />
        </div>
        <div className="order-7 lg:order-none">
          <MaterialsSection />
        </div>
        <div className="order-8 lg:order-none">
          <ProductsCategoriesSection />
        </div>
        <div className="order-9 lg:order-none">
          <ExploreSection />
        </div>
        <div className="order-10 lg:order-none">
          <VoicesSection />
        </div>
        <div className="order-11 lg:order-none">
          <Suspense fallback={null}>
            <JournalRailSection />
          </Suspense>
        </div>
        <div className="order-12 lg:order-none">
          <SignupSection />
        </div>
      </div>
    </>
  )
}
