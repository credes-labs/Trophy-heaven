import { HeroSection } from "@/components/sections/hero-section"
import { AboutSection } from "@/components/sections/about-section"
import { ProductsCategoriesSection } from "@/components/sections/products-categories-section"
import { ExploreSection } from "@/components/sections/explore-section"

/** ISR: refresh the homepage every five minutes. */
export const revalidate = 300

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ProductsCategoriesSection />
      <ExploreSection />
    </>
  )
}
