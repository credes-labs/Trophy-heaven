import Link from "next/link"

const columns = [
  {
    title: "Shop",
    links: [
      { label: "Trophies", href: "/categories/trophies" },
      { label: "Furniture", href: "/categories/furniture" },
      { label: "Home Decor", href: "/categories/home-decor" },
      { label: "Gift Sets", href: "/categories/gift-sets" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Customization Guide", href: "/help/customization" },
      { label: "Shipping", href: "/help/shipping" },
      { label: "Returns", href: "/help/returns" },
      { label: "Contact", href: "/help/contact" },
    ],
  },
  {
    title: "Business",
    links: [
      { label: "Corporate & Bulk", href: "/corporate" },
      { label: "About", href: "/about" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <p className="font-serif text-lg font-semibold">Legacy Crafts</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Custom trophies, furniture, and home decor — designed exactly the way you want.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-semibold">{col.title}</p>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Legacy Crafts. All rights reserved.
      </div>
    </footer>
  )
}
