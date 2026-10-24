"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { HttpTypes } from "@medusajs/types"
import { medusa } from "@/lib/medusa"
import { useCartStore } from "@/stores/cart-store"
import { formatMoney } from "@/lib/format"
import { EditorialCtaLink, editorialFieldClass } from "@/components/layout/editorial/editorial-cta"
import { EditorialEyebrow } from "@/components/layout/editorial/editorial-eyebrow"
import { EditorialWatermark } from "@/components/layout/editorial/editorial-watermark"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111] focus-visible:!outline-solid"
const textBtn =
  "cursor-pointer border-0 bg-transparent p-0 font-outfit text-[0.875em] tracking-[-0.02em] uppercase underline underline-offset-[0.15em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111] disabled:opacity-50"

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
    <div>
      <header className="relative overflow-hidden">
        <EditorialWatermark>orders</EditorialWatermark>
        <EditorialEyebrow>Account</EditorialEyebrow>
        <h1 className="relative m-0 mt-[1em] font-outfit text-[clamp(2.25rem,4vw,3em)] leading-[1.1] font-normal tracking-[-0.04em] text-balance text-[#131111]">
          Orders
        </h1>
        <p className="relative mt-[1em] m-0 max-w-[28em] font-outfit text-[1.125em] leading-[1.4] tracking-[-0.02em] text-[#131111]/70">
          Track purchases and reorder favorites.
        </p>
      </header>

      <div className="mt-[2em] flex flex-col gap-[1.25em] sm:flex-row sm:items-end sm:justify-between">
        <input
          placeholder="Search orders"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={cn(editorialFieldClass, "mt-0 sm:max-w-[16em] placeholder:text-[#6B635C]", focusRing)}
          aria-label="Search orders"
        />
        <div className="flex flex-wrap gap-x-[1.25em] gap-y-[0.5em]">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "cursor-pointer border-0 bg-transparent p-0 font-outfit text-[0.875em] tracking-[-0.02em] uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]",
                filter === f.id
                  ? "text-[#131111] underline underline-offset-[0.2em]"
                  : "text-[#6B635C] hover:text-[#131111]"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {reorderError ? (
        <p className="mt-[1.5em] m-0 font-outfit text-[0.875em] leading-[1.4] text-[#8A2D25]" role="alert">
          {reorderError}
        </p>
      ) : null}

      {loading ? (
        <div className="mt-[2em] space-y-[0.75em]">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-[0.125em] bg-[#D9D9D9]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-[2.5em]">
          <p className="m-0 max-w-[28em] font-outfit text-[1em] leading-[1.4] tracking-[-0.02em] text-[#6B635C]">
            {error
              ? "Orders will appear here once available."
              : query || filter !== "all"
                ? "No orders match your filters."
                : "You haven’t placed an order yet."}
          </p>
          <div className="mt-[1.75em]">
            <EditorialCtaLink href="/shop">Start shopping</EditorialCtaLink>
          </div>
        </div>
      ) : (
        <ul className="mt-[1.5em] m-0 list-none p-0">
          {filtered.map((order) => (
            <li key={order.id} className="border-b border-[#CDCDCD] py-[1.25em]">
              <div className="flex flex-col gap-[0.85em] sm:flex-row sm:items-baseline sm:justify-between">
                <div>
                  <p className="m-0 font-outfit text-[1em] tracking-[-0.02em] text-[#131111]">
                    {orderLabel(order)}
                    <span className="ml-[0.75em] font-outfit text-[0.75em] tracking-[-0.02em] text-[#6B635C] uppercase">
                      {order.fulfillment_status || order.status}
                    </span>
                  </p>
                  <p className="mt-[0.35em] m-0 font-outfit text-[0.875em] tracking-[-0.02em] text-[#6B635C]">
                    {formatDate(order.created_at)} · {order.items?.length ?? 0} items ·{" "}
                    <span className="tabular-nums text-[#131111]">
                      {formatMoney(order.total ?? 0, order.currency_code)}
                    </span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-x-[1.25em] gap-y-[0.5em]">
                  <Link href={`/account/orders/${order.id}`} className={`${textBtn} text-[#131111]`}>
                    View details
                  </Link>
                  <button
                    type="button"
                    disabled={reorderingId !== null}
                    onClick={() => void reorder(order)}
                    className={`${textBtn} text-[#131111]`}
                  >
                    {reorderingId === order.id ? "Reordering" : "Reorder"}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
