"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { HttpTypes } from "@medusajs/types"
import { Package, Palette, MapPin } from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"
import { medusa } from "@/lib/medusa"
import { designApi, type DesignRecord } from "@/lib/design-client"
import { formatMoney } from "@/lib/format"
import { EditorialCtaLink } from "@/components/layout/editorial/editorial-cta"
import { EditorialEyebrow } from "@/components/layout/editorial/editorial-eyebrow"
import { EditorialWatermark } from "@/components/layout/editorial/editorial-watermark"
import { Skeleton } from "@/components/ui/skeleton"

const textLink =
  "font-outfit text-[0.875em] tracking-[-0.02em] text-[#131111] uppercase underline underline-offset-[0.15em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"

function orderLabel(order: HttpTypes.StoreOrder) {
  return order.display_id != null ? `#TH-${order.display_id}` : order.id.slice(0, 12)
}

function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

export default function AccountDashboardPage() {
  const customer = useAuthStore((s) => s.customer)
  const [orders, setOrders] = useState<HttpTypes.StoreOrder[]>([])
  const [designs, setDesigns] = useState<DesignRecord[]>([])
  const [designCount, setDesignCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!customer) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const [orderRes, designRes] = await Promise.allSettled([
        medusa.store.order.list({ limit: 3, fields: "*items,*summary" }),
        designApi.list(),
      ])
      if (cancelled) return
      if (orderRes.status === "fulfilled") setOrders(orderRes.value.orders ?? [])
      if (designRes.status === "fulfilled") {
        setDesignCount(designRes.value.count ?? designRes.value.designs.length)
        setDesigns(designRes.value.designs.slice(0, 3))
      }
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [customer])

  if (!customer) return null

  const firstName = customer.first_name?.trim() ?? ""
  const addressCount = customer.addresses?.length ?? 0

  const stats = [
    {
      href: "/account/orders",
      label: "Recent orders",
      value: loading ? "—" : String(orders.length),
      action: "View all",
      icon: Package,
    },
    {
      href: "/account/designs",
      label: "Saved designs",
      value: loading ? "—" : String(designCount),
      action: "View all",
      icon: Palette,
    },
    {
      href: "/account/addresses",
      label: "Addresses",
      value: String(addressCount),
      action: "Manage",
      icon: MapPin,
    },
  ] as const

  return (
    <div>
      <header className="relative overflow-hidden">
        <EditorialWatermark>account</EditorialWatermark>
        <EditorialEyebrow>Account</EditorialEyebrow>
        <h1 className="relative m-0 mt-[1em] font-outfit text-[clamp(2.25rem,4vw,3em)] leading-[1.1] font-normal tracking-[-0.04em] text-balance text-[#131111]">
          {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
        </h1>
        <p className="relative mt-[1em] m-0 max-w-[28em] font-outfit text-[1.125em] leading-[1.4] tracking-[-0.02em] text-[#131111]/70">
          Manage orders, designs, and account preferences.
        </p>
      </header>

      <ul className="mt-[2.5em] m-0 grid list-none gap-[1.5em] border-y border-[#CDCDCD] p-0 sm:grid-cols-3">
        {stats.map((stat) => (
          <li key={stat.href} className="py-[1.25em] sm:px-[1em] sm:first:pl-0">
            <p className="m-0 flex items-center gap-[0.5em] font-outfit text-[0.75em] tracking-[-0.02em] text-[#131111] uppercase">
              <stat.icon className="size-[1em] text-gold" aria-hidden />
              {stat.label}
            </p>
            <p className="mt-[0.35em] m-0 font-outfit text-[2em] leading-none font-light tracking-[-0.04em] text-[#131111] tabular-nums">
              {stat.value}
            </p>
            <Link href={stat.href} className={`mt-[0.75em] inline-block ${textLink}`}>
              {stat.action}
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-[3em]">
        <div className="flex flex-wrap items-baseline justify-between gap-[1em]">
          <h2 className="m-0 font-outfit text-[1.5em] leading-[1.25] font-light tracking-[-0.02em] text-balance text-[#131111]">
            Recent orders
          </h2>
          <Link href="/account/orders" className={textLink}>
            View all
          </Link>
        </div>
        {loading ? (
          <div className="mt-[1.5em] space-y-[0.75em]">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-[0.125em] bg-[#D9D9D9]" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-[1.5em]">
            <p className="m-0 max-w-[28em] font-outfit text-[1em] leading-[1.4] tracking-[-0.02em] text-[#6B635C]">
              No orders yet. Start with something handmade.
            </p>
            <div className="mt-[1.75em]">
              <EditorialCtaLink href="/shop">Browse shop</EditorialCtaLink>
            </div>
          </div>
        ) : (
          <ul className="mt-[1em] m-0 list-none p-0">
            {orders.map((order) => (
              <li key={order.id} className="border-b border-[#CDCDCD]">
                <Link
                  href={`/account/orders/${order.id}`}
                  className="flex flex-wrap items-baseline justify-between gap-x-[1.5em] gap-y-[0.35em] py-[1.15em] no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"
                >
                  <div>
                    <p className="m-0 font-outfit text-[1em] tracking-[-0.02em] text-[#131111]">
                      {orderLabel(order)}
                    </p>
                    <p className="mt-[0.2em] m-0 font-outfit text-[0.875em] tracking-[-0.02em] text-[#6B635C]">
                      {formatDate(order.created_at)} · {order.items?.length ?? 0} items ·{" "}
                      {order.fulfillment_status || order.status}
                    </p>
                  </div>
                  <p className="m-0 font-outfit text-[1em] tracking-[-0.02em] text-[#131111] tabular-nums">
                    {formatMoney(order.total ?? 0, order.currency_code)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-[3em]">
        <div className="flex flex-wrap items-baseline justify-between gap-[1em]">
          <h2 className="m-0 font-outfit text-[1.5em] leading-[1.25] font-light tracking-[-0.02em] text-balance text-[#131111]">
            Saved designs
          </h2>
          <Link href="/account/designs" className={textLink}>
            View all
          </Link>
        </div>
        {loading ? (
          <div className="mt-[1.5em] grid gap-[1.5em] sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] w-full rounded-[0.125em] bg-[#D9D9D9]" />
            ))}
          </div>
        ) : designs.length === 0 ? (
          <p className="mt-[1.5em] m-0 max-w-[28em] font-outfit text-[1em] leading-[1.4] tracking-[-0.02em] text-[#6B635C]">
            No saved designs yet. Customize a product to get started.
          </p>
        ) : (
          <ul className="mt-[1.5em] m-0 grid list-none gap-[1.5em] p-0 sm:grid-cols-3">
            {designs.map((design) => (
              <li key={design.id}>
                <div className="aspect-[4/3] overflow-hidden rounded-[0.125em] bg-[#D9D9D9]">
                  {design.preview_url ? (
                    // Raw <img> used intentionally (dynamic backend URLs; Next/Image domain config not required here).
                    <img src={design.preview_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center font-outfit text-[0.875em] text-[#6B635C]">
                      No preview
                    </div>
                  )}
                </div>
                <p className="mt-[0.75em] m-0 truncate font-outfit text-[1em] tracking-[-0.02em] text-[#131111]">
                  {design.name}
                </p>
                <p className="mt-[0.2em] m-0 font-outfit text-[0.75em] tracking-[-0.02em] text-[#6B635C] uppercase">
                  {design.mode}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
