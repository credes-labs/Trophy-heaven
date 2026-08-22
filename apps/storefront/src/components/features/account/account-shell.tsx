"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  MapPin,
  Palette,
  Heart,
  Ticket,
  Settings,
  Building2,
  LogOut,
} from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { motion } from "motion/react"
import { pageTransition } from "@/lib/animations"

const AUTH_PATHS = new Set([
  "/account/login",
  "/account/register",
  "/account/forgot-password",
  "/account/reset-password",
])

const NAV = [
  { href: "/account", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/designs", label: "Designs", icon: Palette },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/coupons", label: "Coupons", icon: Ticket },
  { href: "/account/settings", label: "Settings", icon: Settings },
  { href: "/account/corporate", label: "Corporate", icon: Building2 },
] as const

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { customer, loading, loadCustomer, logout } = useAuthStore()

  const isAuthPage = AUTH_PATHS.has(pathname)

  useEffect(() => {
    if (!isAuthPage) void loadCustomer()
  }, [isAuthPage, loadCustomer])

  useEffect(() => {
    if (isAuthPage || loading) return
    if (!customer) router.replace("/account/login")
  }, [isAuthPage, loading, customer, router])

  if (isAuthPage) return <>{children}</>

  if (loading || !customer) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex gap-8">
          <div className="hidden w-56 shrink-0 space-y-3 lg:block">
            <Skeleton className="h-16 w-full" />
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
          <div className="min-w-0 flex-1 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    )
  }

  const displayName =
    [customer.first_name, customer.last_name].filter(Boolean).join(" ") || "Account"
  const initials =
    `${customer.first_name?.[0] ?? ""}${customer.last_name?.[0] ?? ""}`.toUpperCase() ||
    customer.email?.[0]?.toUpperCase() ||
    "LC"

  async function handleLogout() {
    await logout()
    router.push("/account/login")
  }

  return (
    <div className="min-h-[60vh] bg-gradient-to-b from-cream/40 to-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        {/* Mobile header + tabs */}
        <div className="mb-6 lg:hidden">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/20 font-serif text-sm font-semibold text-walnut">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate font-serif text-lg font-semibold">{displayName}</p>
              <p className="truncate text-sm text-muted-foreground">{customer.email}</p>
            </div>
          </div>
          <nav
            className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Account sections"
          >
            {NAV.map((item) => {
              const active = isActive(pathname, item.href, "exact" in item ? item.exact : false)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-gold/20 text-walnut"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                  {item.label}
                </Link>
              )
            })}
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden />
              Logout
            </button>
          </nav>
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-24 rounded-lg border border-border bg-card p-4 shadow-sm">
              <div className="mb-5 flex items-center gap-3 border-b border-border pb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/20 font-serif text-sm font-semibold text-walnut">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium leading-tight">{displayName}</p>
                  <p className="truncate text-xs text-muted-foreground">{customer.email}</p>
                </div>
              </div>
              <nav className="space-y-0.5" aria-label="Account sections">
                {NAV.map((item) => {
                  const active = isActive(pathname, item.href, "exact" in item ? item.exact : false)
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-gold/15 text-walnut"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
              <div className="mt-4 border-t border-border pt-3">
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" aria-hidden />
                  Logout
                </button>
              </div>
            </div>
          </aside>

          <motion.div
            key={pathname}
            className="min-w-0 flex-1"
            variants={pageTransition}
            initial="initial"
            animate="animate"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
