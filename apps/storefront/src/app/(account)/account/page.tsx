"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { HttpTypes } from "@medusajs/types"
import { ArrowRight, Package, Palette, MapPin } from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"
import { medusa } from "@/lib/medusa"
import { designApi, type DesignRecord } from "@/lib/design-client"
import { formatMoney } from "@/lib/format"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

function orderLabel(order: HttpTypes.StoreOrder) {
  return order.display_id != null ? `#LC-${order.display_id}` : order.id.slice(0, 12)
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

  const firstName = customer.first_name || "there"
  const addressCount = customer.addresses?.length ?? 0

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage orders, designs, and account preferences.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Package className="h-4 w-4 text-gold" aria-hidden />
              Recent orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-serif text-2xl font-semibold">
              {loading ? "—" : orders.length}
            </p>
            <Link
              href="/account/orders"
              className="mt-2 inline-flex items-center gap-1 text-sm text-accent hover:underline"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Palette className="h-4 w-4 text-gold" aria-hidden />
              Saved designs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-serif text-2xl font-semibold">
              {loading ? "—" : designCount}
            </p>
            <Link
              href="/account/designs"
              className="mt-2 inline-flex items-center gap-1 text-sm text-accent hover:underline"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <MapPin className="h-4 w-4 text-gold" aria-hidden />
              Addresses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-serif text-2xl font-semibold">{addressCount}</p>
            <Link
              href="/account/addresses"
              className="mt-2 inline-flex items-center gap-1 text-sm text-accent hover:underline"
            >
              Manage <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold">Recent orders</h2>
          <Link
            href="/account/orders"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            View all
          </Link>
        </div>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-start gap-3 py-8">
              <p className="text-muted-foreground">No orders yet. Start with something handmade.</p>
              <Link href="/shop" className={cn(buttonVariants())}>
                Browse shop
              </Link>
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-3">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/account/orders/${order.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{orderLabel(order)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.created_at)} · {order.items?.length ?? 0} items
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="gold">{order.fulfillment_status || order.status}</Badge>
                    <span className="font-medium">
                      {formatMoney(order.total ?? 0, order.currency_code)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold">Saved designs</h2>
          <Link href="/account/designs" className="text-sm text-accent hover:underline">
            View all
          </Link>
        </div>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] w-full" />
            ))}
          </div>
        ) : designs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-muted-foreground">
              No saved designs yet. Customize a product to get started.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {designs.map((design) => (
              <Card key={design.id} className="overflow-hidden">
                <div className="aspect-[4/3] bg-muted">
                  {design.preview_url ? (
                    // Raw <img> used intentionally (dynamic backend URLs; Next/Image domain config not required here).
                    <img
                      src={design.preview_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      No preview
                    </div>
                  )}
                </div>
                <CardContent className="space-y-1 p-4">
                  <p className="truncate font-medium">{design.name}</p>
                  <Badge variant="outline">{design.mode.toUpperCase()}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
