"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { HttpTypes } from "@medusajs/types"
import { medusa } from "@/lib/medusa"
import { useCartStore } from "@/stores/cart-store"
import { formatMoney } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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

const FILTERS = [
  { id: "all", label: "All" },
  { id: "not_fulfilled", label: "Processing" },
  { id: "shipped", label: "Shipped" },
  { id: "fulfilled", label: "Delivered" },
] as const

export default function OrdersPage() {
  const [orders, setOrders] = useState<HttpTypes.StoreOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all")
  const [reorderingId, setReorderingId] = useState<string | null>(null)
  const [reorderError, setReorderError] = useState<string | null>(null)
  const addItem = useCartStore((s) => s.addItem)

  async function reorder(order: HttpTypes.StoreOrder) {
    setReorderError(null)
    const lines = (order.items ?? []).filter(
      (item): item is typeof item & { variant_id: string } => Boolean(item.variant_id)
    )
    if (lines.length === 0) {
      setReorderError("None of the items from this order are available to reorder.")
      return
    }
    setReorderingId(order.id)
    try {
      for (const item of lines) {
        await addItem(item.variant_id, item.quantity ?? 1, item.metadata ?? undefined)
      }
    } catch {
      setReorderError("Some items could not be added — they may be out of stock.")
    } finally {
      setReorderingId(null)
    }
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const { orders: list } = await medusa.store.order.list({
          limit: 50,
          fields: "*items,*summary",
        })
        if (!cancelled) setOrders(list ?? [])
      } catch (e) {
        if (!cancelled) {
          setOrders([])
          setError((e as Error).message || "Could not load orders")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = orders.filter((order) => {
    const label = orderLabel(order).toLowerCase()
    const matchesQuery = !query || label.includes(query.toLowerCase()) || order.id.includes(query)
    const matchesFilter =
      filter === "all" ||
      order.fulfillment_status === filter ||
      (filter === "not_fulfilled" &&
        (order.fulfillment_status === "not_fulfilled" || order.fulfillment_status === "partially_fulfilled"))
    return matchesQuery && matchesFilter
  })

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Orders</h1>
        <p className="mt-1 text-muted-foreground">Track purchases and reorder favorites.</p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search orders…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="sm:max-w-xs"
          aria-label="Search orders"
        />
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                filter === f.id
                  ? "bg-gold/20 text-walnut"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {reorderError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {reorderError}
        </p>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-start gap-4 py-12">
            <p className="text-muted-foreground">
              {error
                ? "Orders will appear here once available."
                : query || filter !== "all"
                  ? "No orders match your filters."
                  : "You haven’t placed an order yet."}
            </p>
            <Link href="/shop" className={cn(buttonVariants())}>
              Start shopping
            </Link>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {filtered.map((order) => (
            <li key={order.id}>
              <Card>
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{orderLabel(order)}</p>
                      <Badge variant="gold">{order.fulfillment_status || order.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDate(order.created_at)} · {order.items?.length ?? 0} items ·{" "}
                      {formatMoney(order.total ?? 0, order.currency_code)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/account/orders/${order.id}`}
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                    >
                      View details
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={reorderingId === order.id}
                      disabled={reorderingId !== null}
                      onClick={() => void reorder(order)}
                    >
                      Reorder
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
