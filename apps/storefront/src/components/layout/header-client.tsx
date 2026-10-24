"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { Search, User, Heart, Menu, X } from "lucide-react"
import { Logo } from "./logo"
import { MegaMenu } from "./mega-menu"
import { CartButton } from "@/components/features/cart/cart-button"
import { cn } from "@/lib/utils"
import { hrefForCategoryHandle } from "@/lib/category-config"

const NAV_LINKS = [
  { label: "Shop", href: "/shop", hasMegaMenu: true },
  { label: "Trophies", href: "/trophies" },
  { label: "Furniture", href: "/furniture" },
  { label: "Artwork", href: "/artwork" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
]

type Category = { id: string; name: string; handle: string }

export function HeaderClient({ categories }: { categories: Category[] }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  const megaMenuTimeout = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  const openMegaMenu = useCallback(() => {
    if (megaMenuTimeout.current) clearTimeout(megaMenuTimeout.current)
    setMegaMenuOpen(true)
  }, [])

  const closeMegaMenu = useCallback(() => {
    megaMenuTimeout.current = setTimeout(() => setMegaMenuOpen(false), 200)
  }, [])

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full border-b bg-card/80 backdrop-blur-lg transition-all duration-300",
          scrolled && "border-border/60 bg-card/95 shadow-sm"
        )}
      >
        <div
          className={cn(
            "mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 transition-all duration-300",
            scrolled ? "py-2.5" : "py-4"
          )}
        >
          {/* Mobile: hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="flex h-11 w-11 items-center justify-center rounded-md hover:bg-muted md:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>

          {/* Desktop: Logo */}
          <div className="hidden md:block">
            <Logo />
          </div>

          {/* Mobile: Logo (icon only) */}
          <div className="md:hidden">
            <Logo iconOnly />
          </div>

          {/* Desktop navigation */}
          <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <div
                key={link.href}
                onMouseEnter={link.hasMegaMenu ? openMegaMenu : undefined}
                onMouseLeave={link.hasMegaMenu ? closeMegaMenu : undefined}
                className="relative"
              >
                <Link
                  href={link.href}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-[#6B635C] transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </div>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <Link
              href="/search"
              aria-label="Search"
              className="flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Search className="h-5 w-5" aria-hidden />
            </Link>
            <Link
              href="/account"
              aria-label="Account"
              className="hidden h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:flex"
            >
              <User className="h-5 w-5" aria-hidden />
            </Link>
            <Link
              href="/account/wishlist"
              aria-label="Wishlist"
              className="relative hidden h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:flex"
            >
              <Heart className="h-5 w-5" aria-hidden />
            </Link>
            <CartButton />
          </div>
        </div>

        {/* Mega menu dropdown */}
        {megaMenuOpen && (
          <div
            onMouseEnter={openMegaMenu}
            onMouseLeave={closeMegaMenu}
          >
            <MegaMenu categories={categories} />
          </div>
        )}
      </header>

      {/* Mobile sheet */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <aside className="absolute inset-y-0 left-0 flex w-full max-w-sm flex-col bg-card shadow-xl animate-slide-in-left">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <Logo />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="flex h-11 w-11 items-center justify-center rounded-md hover:bg-muted"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-5 py-6" aria-label="Mobile navigation">
              <ul className="space-y-1">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-md px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              {categories.length > 0 && (
                <div className="mt-6 border-t pt-6">
                  <p className="px-3 text-xs font-semibold uppercase tracking-wider text-[#6B635C]">
                    Categories
                  </p>
                  <ul className="mt-3 space-y-1">
                    {categories.map((cat) => (
                      <li key={cat.id}>
                        <Link
                          href={hrefForCategoryHandle(cat.handle)}
                          onClick={() => setMobileOpen(false)}
                          className="block rounded-md px-3 py-2.5 text-sm text-[#6B635C] transition-colors hover:bg-muted hover:text-foreground"
                        >
                          {cat.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </nav>
            <div className="border-t px-5 py-4">
              <div className="flex gap-3">
                <Link
                  href="/account"
                  onClick={() => setMobileOpen(false)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <User className="h-4 w-4" aria-hidden />
                  Account
                </Link>
                <Link
                  href="/account/wishlist"
                  onClick={() => setMobileOpen(false)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <Heart className="h-4 w-4" aria-hidden />
                  Wishlist
                </Link>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
