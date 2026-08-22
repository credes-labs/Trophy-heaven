import { listProducts } from "@/lib/data/catalog"
import { HeroSection } from "@/components/sections/hero-section"
import { CategoryShowcase } from "@/components/sections/category-showcase"
import { FeaturedProducts } from "@/components/sections/featured-products"
import { CraftsmanshipStory } from "@/components/sections/craftsmanship-story"
import { BrandValues } from "@/components/sections/brand-values"
import { BestsellersCarousel } from "@/components/sections/bestsellers-carousel"
import { Testimonials } from "@/components/sections/testimonials"
import { Newsletter } from "@/components/sections/newsletter"

export const revalidate = 300

export default async function HomePage() {
  let products: Awaited<ReturnType<typeof listProducts>>["products"] = []
  let bestsellers: Awaited<ReturnType<typeof listProducts>>["products"] = []
  try {
    products = (await listProducts({ limit: 8 })).products
    // Bestsellers rail reuses the catalog helper; newest-first until sales
    // ordering exists upstream (see .cursor/plans/pages/01-landing.md §7).
    bestsellers = (await listProducts({ limit: 10, order: "-created_at" })).products
  } catch {
    // Backend unavailable at build — render the shell; ISR fills in later.
  }

  return (
    <>
      <HeroSection />
      <CategoryShowcase />
      <FeaturedProducts products={products} />
      <CraftsmanshipStory />
      <BrandValues />
      <BestsellersCarousel products={bestsellers} />
      <Testimonials />
      <Newsletter />
    </>
  )
}
