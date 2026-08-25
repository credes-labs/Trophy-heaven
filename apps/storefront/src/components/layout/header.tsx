import { listCategories } from "@/lib/data/catalog"
import { SiteHeader } from "./site-header"

export { Logo } from "./logo"

export async function Header() {
  let topCategories: { name: string; handle: string }[] = []
  try {
    const categories = await listCategories()
    topCategories = categories
      .filter((c) => !c.parent_category_id)
      .map((c) => ({ name: c.name, handle: c.handle }))
  } catch {
    // graceful degradation when backend is unavailable
  }

  return <SiteHeader categories={topCategories} />
}
