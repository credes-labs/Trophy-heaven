import { Suspense } from "react"
import { HeroSection } from "@/components/sections/hero-section"
import { HomeCategories } from "@/components/sections/editions/categories"
import { SelectedEditions } from "@/components/sections/editions/selected-editions"
import { EDITION_PRODUCTS, type LiveEdition } from "@/components/sections/editions/constants"
import { getProductsByHandles } from "@/lib/data/catalog"
import { productPrice } from "@/lib/product-filters"
import { AboutSection } from "@/components/sections/about-section"
import { ProductsCategoriesSection } from "@/components/sections/products-categories-section"
import { RecentWorkSection } from "@/components/sections/recent-work"
import { MaterialsSection } from "@/components/sections/materials"
import { SignupSection } from "@/components/sections/signup"

/** ISR: refresh the homepage every five minutes. */
export const revalidate = 300

/**
 * Editorial top (white poster hero → categories → selected editions), then the
 * story sections. Explore is no longer on the homepage: Selected Editions is
 * the same filterable product grid in the reference layout.
 */
export default async function HomePage() {
  const found = await getProductsByHandles(EDITION_PRODUCTS.map((p) => p.id))
  const live: Record<string, LiveEdition> | null = found
    ? Object.fromEntries(
        [...found].map(([handle, p]) => [handle, { title: p.title ?? "", amount: productPrice(p) }])
      )
    : null
  return (
    <>
      <HeroSection />
      <HomeCategories />
      <SelectedEditions live={live} />
      <Suspense fallback={null}>
        <RecentWorkSection />
      </Suspense>
      <AboutSection />
      <MaterialsSection />
      <ProductsCategoriesSection />
      <SignupSection />
    </>
  )
}
