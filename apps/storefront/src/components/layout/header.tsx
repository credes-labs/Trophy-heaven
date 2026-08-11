import Link from "next/link"
import { listCategories } from "@/lib/data/catalog"
import { CartButton } from "@/components/features/cart/cart-button"

/**
 * Primary navigation. Renders the top-level category tree (RSC data fetch) with
 * the cart trigger and account link. Mobile nav collapses to a menu (progressive
 * enhancement — the links remain crawlable for SEO).
 */
export async function Header() {
  let topCategories: { id: string; name: string; handle: string }[] = []
  try {
    const categories = await listCategories()
    topCategories = categories
      .filter((c) => !c.parent_category_id)
      .map((c) => ({ id: c.id, name: c.name, handle: c.handle }))
  } catch {
    // Backend may be unavailable at build time; nav degrades gracefully.
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4">
        <Link href="/" className="font-serif text-xl font-semibold tracking-tight">
          Legacy Crafts
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
          {topCategories.map((c) => (
            <Link
              key={c.id}
              href={`/categories/${c.handle}`}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {c.name}
            </Link>
          ))}
          <Link
            href="/corporate"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Corporate
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/account"
            className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Account
          </Link>
          <CartButton />
        </div>
      </div>
    </header>
  )
}
