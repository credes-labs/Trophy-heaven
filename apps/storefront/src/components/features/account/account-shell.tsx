"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"
import { cn } from "@/lib/utils"

const AUTH_PATHS = new Set([
  "/account/login",
  "/account/register",
  "/account/forgot-password",
  "/account/reset-password",
])

const NAV = [
  { href: "/account", label: "Dashboard", exact: true },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/designs", label: "Designs" },
  { href: "/account/wishlist", label: "Wishlist" },
  { href: "/account/coupons", label: "Coupons" },
  { href: "/account/settings", label: "Settings" },
  { href: "/account/corporate", label: "Corporate" },
] as const

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

const navLinkClass =
  "font-outfit text-[0.875em] leading-[1.25em] font-normal tracking-[-0.02em] uppercase no-underline"

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

  if (!customer) {
    return (
      <div className="overflow-x-clip bg-[#F2F1EF] font-outfit text-[#131111] lg:[font-size:min(1rem,calc(100vw/90))]">
        <div className="mx-auto w-full max-w-[90em] px-[clamp(1.25rem,2.78vw,2.5em)] pt-[clamp(2.5rem,6vw,5em)] pb-[clamp(3.5rem,8vw,7em)]">
          <div className="flex gap-[3em]">
            <div className="hidden w-[12em] shrink-0 space-y-[0.75em] lg:block">
              <div className="h-[2.5em] w-full rounded-[0.125em] bg-[#D9D9D9]" />
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[1.25em] w-[8em] rounded-[0.125em] bg-[#D9D9D9]" />
              ))}
            </div>
            <div className="min-w-0 flex-1 space-y-[1em]">
              <div className="h-[2em] w-[12em] rounded-[0.125em] bg-[#D9D9D9]" />
              <div className="h-[12em] w-full rounded-[0.125em] bg-[#D9D9D9]" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const displayName =
    [customer.first_name, customer.last_name].filter(Boolean).join(" ") || "Account"

  async function handleLogout() {
    await logout()
    router.push("/account/login")
  }

  return (
    <div className="overflow-x-clip bg-[#F2F1EF] font-outfit text-[#131111] lg:[font-size:min(1rem,calc(100vw/90))]">
      <div className="mx-auto w-full max-w-[90em] px-[clamp(1.25rem,2.78vw,2.5em)] pt-[clamp(2rem,5vw,4em)] pb-[clamp(3.5rem,8vw,7em)]">
        <div className="mb-[2em] lg:hidden">
          <p className="m-0 font-outfit text-[1.5em] leading-[1.25] font-light tracking-[-0.02em] text-[#131111]">
            {displayName}
          </p>
          <p className="mt-[0.25em] m-0 font-outfit text-[0.875em] tracking-[-0.02em] text-[#6B635C]">
            {customer.email}
          </p>
          <nav
            className="-mx-[clamp(1.25rem,2.78vw,2.5em)] mt-[1.25em] flex gap-x-[1.5em] overflow-x-auto px-[clamp(1.25rem,2.78vw,2.5em)] pb-[0.25em] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Account sections"
          >
            {NAV.map((item) => {
              const active = isActive(pathname, item.href, "exact" in item ? item.exact : false)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    navLinkClass,
                    "shrink-0",
                    active
                      ? "text-[#131111] underline underline-offset-[0.2em]"
                      : "text-[#6B635C] hover:text-[#131111]"
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
            <button
              type="button"
              onClick={() => void handleLogout()}
              className={cn(
                navLinkClass,
                "shrink-0 cursor-pointer border-0 bg-transparent p-0 text-[#6B635C] hover:text-[#131111]"
              )}
            >
              Logout
            </button>
          </nav>
        </div>

        <div className="flex gap-[clamp(2em,5vw,4em)]">
          <aside className="hidden w-[14em] shrink-0 lg:block">
            <div className="sticky top-24">
              <p className="m-0 font-outfit text-[1.25em] leading-[1.25] font-light tracking-[-0.02em] text-[#131111]">
                {displayName}
              </p>
              <p className="mt-[0.35em] m-0 truncate font-outfit text-[0.875em] tracking-[-0.02em] text-[#6B635C]">
                {customer.email}
              </p>
              <nav className="mt-[2em] flex flex-col gap-[0.75em]" aria-label="Account sections">
                {NAV.map((item) => {
                  const active = isActive(pathname, item.href, "exact" in item ? item.exact : false)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        navLinkClass,
                        active
                          ? "text-[#131111] underline underline-offset-[0.2em]"
                          : "text-[#6B635C] hover:text-[#131111]"
                      )}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
              <div className="mt-[1.75em] border-t border-[#CDCDCD] pt-[1.25em]">
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className={cn(
                    navLinkClass,
                    "cursor-pointer border-0 bg-transparent p-0 text-[#6B635C] hover:text-[#131111]"
                  )}
                >
                  Logout
                </button>
              </div>
            </div>
          </aside>

          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  )
}
