import { listCategories } from "@/lib/data/catalog"
import { PosterHero } from "./poster-hero"
import { HERO_TAGLINE } from "./constants"

/** Homepage poster hero. Nav categories come from the same source as the site header. */
export async function HeroSection() {
  let categories: { name: string; handle: string }[] = []
  try {
    categories = (await listCategories())
      .filter((c) => !c.parent_category_id)
      .map((c) => ({ name: c.name, handle: c.handle }))
  } catch {
    // graceful degradation when the backend is unavailable
  }
  return (
    <PosterHero
      home
      categories={categories}
      title="Trophy Heaven — custom trophies, awards and engraved plaques"
      showTitle={false}
      lead={HERO_TAGLINE.lead}
      body={HERO_TAGLINE.rest}
    />
  )
}
