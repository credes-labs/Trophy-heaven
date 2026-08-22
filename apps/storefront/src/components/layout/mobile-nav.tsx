"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, LayoutGrid, Search, ShoppingBag, User } from "lucide-react"
import { useCartStore } from "@/stores/cart-store"
import { cn } from "@/lib/utils"

const NAV_ITEMS: {
  label: string
  href: string
  icon: typeof Home
  showBadge?: boolean
}[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Shop", href: "/shop", icon: LayoutGrid },
  { label: "Search", href: "/search", icon: Search },
  { label: "Cart", href: "/cart", icon: ShoppingBag, showBadge: true },
  { label: "Account", href: "/account", icon: User },
]

export function MobileNav() {
  const pathname = usePathname()
  const count = useCartStore((s) => s.itemCount())

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-card/90 backdrop-blur-lg md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex h-16 items-center justify-around px-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 px-3 py-1 transition-colors",
                isActive ? "text-accent" : "text-muted-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="relative">
                <Icon className="h-5 w-5" aria-hidden />
                {item.showBadge && count > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "text-[10px] font-medium leading-none transition-opacity",
                  isActive ? "opacity-100" : "opacity-0"
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
