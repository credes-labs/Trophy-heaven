"use client"

import Link from "next/link"
import Image from "next/image"
import { Trophy, Armchair, Palette, Gift, Sparkles, LayoutGrid } from "lucide-react"
import { hrefForCategoryHandle } from "@/lib/category-config"

type Category = { id: string; name: string; handle: string }

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  trophies: <Trophy className="h-4 w-4" />,
  furniture: <Armchair className="h-4 w-4" />,
  artwork: <Palette className="h-4 w-4" />,
  "gift-sets": <Gift className="h-4 w-4" />,
  "home-decor": <Sparkles className="h-4 w-4" />,
}

const TROPHY_SUBCATEGORIES = [
  { label: "Sports Trophies", href: "/categories/trophies/sports" },
  { label: "Corporate Awards", href: "/categories/trophies/corporate" },
  { label: "Academic Awards", href: "/categories/trophies/academic" },
  { label: "Memorial", href: "/categories/trophies/memorial" },
  { label: "Crystal", href: "/categories/trophies/crystal" },
]

const FURNITURE_SUBCATEGORIES = [
  { label: "Tables", href: "/categories/furniture/tables" },
]

const FEATURED_PRODUCTS = [
  {
    name: "Brass Nesting Tables",
    price: "₹54,400",
    image: "/images/catalog/table-brass-nesting-1.jpg",
    href: "/products/brass-nesting-tables",
  },
  {
    name: "Achievement Statuette",
    price: "₹15,300",
    image: "/images/catalog/trophy-achievement-statuette.jpg",
    href: "/products/achievement-statuette",
  },
]

export function MegaMenu({ categories }: { categories: Category[] }) {
  return (
    <>
      <div className="absolute inset-x-0 top-full h-screen bg-black/20" aria-hidden />
      <div className="absolute inset-x-0 top-full border-b bg-card shadow-lg animate-fade-in">
        <div className="mx-auto grid max-w-7xl grid-cols-4 gap-8 px-6 py-8">
          {/* Col 1: Categories */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-balance text-[#6B635C]">
              Categories
            </h3>
            <ul className="mt-4 space-y-1">
              {categories.length > 0
                ? categories.map((cat) => (
                    <li key={cat.id}>
                      <Link
                        href={hrefForCategoryHandle(cat.handle)}
                        className="flex items-center gap-2.5 rounded-md px-2 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                      >
                        <span className="text-muted-foreground" aria-hidden>
                          {CATEGORY_ICONS[cat.handle] ?? <LayoutGrid className="h-4 w-4" />}
                        </span>
                        {cat.name}
                      </Link>
                    </li>
                  ))
                : ["Trophies", "Furniture", "Artwork", "Home Decor", "Gift Sets"].map((name) => {
                    const handle = name.toLowerCase().replace(/ /g, "-")
                    return (
                      <li key={handle}>
                        <Link
                          href={hrefForCategoryHandle(handle)}
                          className="flex items-center gap-2.5 rounded-md px-2 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                        >
                          <span className="text-muted-foreground" aria-hidden>
                            {CATEGORY_ICONS[handle] ?? <LayoutGrid className="h-4 w-4" />}
                          </span>
                          {name}
                        </Link>
                      </li>
                    )
                  })}
              <li>
                <Link
                  href="/shop"
                  className="mt-2 inline-flex items-center gap-1 px-2 text-sm font-medium text-gold-dark transition-colors hover:text-gold-dark/80"
                >
                  View all →
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Trophies */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-balance text-[#6B635C]">
              Trophies
            </h3>
            <ul className="mt-4 space-y-1">
              {TROPHY_SUBCATEGORIES.map((sub) => (
                <li key={sub.href}>
                  <Link
                    href={sub.href}
                    className="block rounded-md px-2 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    {sub.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Furniture */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-balance text-[#6B635C]">
              Furniture
            </h3>
            <ul className="mt-4 space-y-1">
              {FURNITURE_SUBCATEGORIES.map((sub) => (
                <li key={sub.href}>
                  <Link
                    href={sub.href}
                    className="block rounded-md px-2 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    {sub.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Featured */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-balance text-[#6B635C]">
              Featured
            </h3>
            <div className="mt-4 space-y-4">
              {FEATURED_PRODUCTS.map((product) => (
                <Link
                  key={product.href}
                  href={product.href}
                  className="group flex gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-sm font-medium text-foreground">{product.name}</p>
                    <p className="text-sm text-gold-dark">{product.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
