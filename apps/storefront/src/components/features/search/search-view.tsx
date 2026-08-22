"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { searchProducts, type SearchHit } from "@/lib/search-client"
import { formatMoney } from "@/lib/format"
import { track } from "@/lib/analytics"

const FACET_LABELS: Record<string, string> = {
  category: "Category",
  material: "Material",
  customization_level: "Customization",
  price_tier: "Price",
}

const PRICE_TIER_LABELS: Record<string, string> = {
  under_1000: "Under ₹1,000",
  "1000_5000": "₹1,000–₹5,000",
  "5000_15000": "₹5,000–₹15,000",
  "15000_plus": "₹15,000+",
}

export function SearchView() {
  const [q, setQ] = useState("")
  const [hits, setHits] = useState<SearchHit[]>([])
  const [facets, setFacets] = useState<Record<string, Record<string, number>>>({})
  const [selected, setSelected] = useState<Record<string, string[]>>({})
  const [available, setAvailable] = useState(true)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const run = useCallback(async () => {
    setLoading(true)
    try {
      const res = await searchProducts({ q, facets: selected, limit: 24 })
      setHits(res.hits)
      setFacets(res.facets)
      setAvailable(res.available)
      setTotal(res.estimatedTotalHits)
      if (q) track("search", { query: q, results: res.estimatedTotalHits })
    } finally {
      setLoading(false)
    }
  }, [q, selected])

  useEffect(() => {
    const t = setTimeout(run, 250)
    return () => clearTimeout(t)
  }, [run])

  function toggleFacet(attr: string, value: string) {
    setSelected((s) => {
      const cur = s[attr] ?? []
      return {
        ...s,
        [attr]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value],
      }
    })
  }

  return (
    <div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search trophies, awards, materials…"
        className="w-full rounded-lg border border-border bg-background px-4 py-3 text-base"
        aria-label="Search"
      />

      {!available && (
        <p className="mt-4 rounded-md bg-muted p-3 text-sm text-muted-foreground">
          Live search is offline. Browse the{" "}
          <Link href="/shop" className="text-accent hover:underline">
            catalog
          </Link>{" "}
          instead.
        </p>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-6">
          {Object.entries(facets).map(([attr, values]) => (
            <div key={attr}>
              <h3 className="mb-2 text-sm font-semibold">{FACET_LABELS[attr] ?? attr}</h3>
              <ul className="space-y-1">
                {Object.entries(values).map(([value, count]) => (
                  <li key={value}>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={(selected[attr] ?? []).includes(value)}
                        onChange={() => toggleFacet(attr, value)}
                      />
                      <span className="flex-1">
                        {attr === "price_tier" ? PRICE_TIER_LABELS[value] ?? value : value}
                      </span>
                      <span className="text-xs text-muted-foreground">{count}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>

        <div>
          <p className="mb-4 text-sm text-muted-foreground">
            {loading ? "Searching…" : `${total} result${total === 1 ? "" : "s"}`}
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {hits.map((hit) => (
              <Link
                key={hit.id}
                href={`/products/${hit.handle}`}
                className="group rounded-lg border border-border p-3 transition-colors hover:border-accent"
                onClick={() => track("select_item", { item_id: hit.id })}
              >
                {hit.thumbnail ? (
                  <img
                    src={hit.thumbnail}
                    alt={hit.title}
                    className="mb-2 aspect-square w-full rounded object-cover"
                  />
                ) : (
                  <div className="mb-2 aspect-square w-full rounded bg-muted" />
                )}
                <p className="line-clamp-1 text-sm font-medium">{hit.title}</p>
                <p className="text-sm text-muted-foreground">{formatMoney(hit.price, "inr")}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
