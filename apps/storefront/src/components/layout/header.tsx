import { listCategories } from "@/lib/data/catalog"
import { HeaderClient } from "./header-client"

export { Logo } from "./logo"

export async function Header() {
  let topCategories: { id: string; name: string; handle: string }[] = []
  try {
    const categories = await listCategories()
    topCategories = categories
      .filter((c) => !c.parent_category_id)
      .map((c) => ({ id: c.id, name: c.name, handle: c.handle }))
  } catch {
    // graceful degradation when backend is unavailable
  }

  return <HeaderClient categories={topCategories} />
}
