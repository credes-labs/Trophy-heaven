"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import type { HttpTypes } from "@medusajs/types"
import { EditorialProductCard } from "@/components/features/shop/editorial-product-card"
import { Skeleton } from "@/components/ui/skeleton"
import { listProductsClient } from "@/lib/data/catalog"
import {
  FACET_LABELS,
  facetValueLabel,
  searchProducts,
  type SearchHit,
} from "@/lib/search-client"
import { track } from "@/lib/analytics"

function productForHit(
  hit: SearchHit,
  listed: Map<string, HttpTypes.StoreProduct>
): HttpTypes.StoreProduct {
  const found = listed.get(hit.id)
  if (found) return found
  const amount = hit.price > 0 ? hit.price : null
  return {
    id: hit.id,
    title: hit.title,
    handle: hit.handle,
    thumbnail: hit.thumbnail,
    categories: (hit.category ?? []).filter(Boolean).map((name) => ({ name })),
    variants:
      amount == null
        ? []
        : [{ calculated_price: { calculated_amount: amount, currency_code: "inr" } }],
  } as HttpTypes.StoreProduct
}

export function SearchView({ regionId }: { regionId?: string }) {
  const [q, setQ] = useState("")
  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([])
  const [facets, setFacets] = useState<Record<string, Record<string, number>>>({})
  const [selected, setSelected] = useState<Record<string, string[]>>({})
  const [available, setAvailable] = useState(true)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const run = useCallback(async () => {
    setLoading(true)
    try {
      const res = await searchProducts({ q, facets: selected, limit: 24 })
      setFacets(res.facets)
      setAvailable(res.available)
      setTotal(res.estimatedTotalHits)
      const ids = res.hits.map((hit) => hit.id)
      let listed = new Map<string, HttpTypes.StoreProduct>()
      if (ids.length) {
        try {
          const { products: rows } = await listProductsClient({
            ids,
            limit: ids.length,
            regionId,
          })
          listed = new Map(rows.map((product) => [product.id, product]))
        } catch {
          listed = new Map()
        }
      }
      setProducts(res.hits.map((hit) => productForHit(hit, listed)))
      if (q) track("search", { query: q, results: res.estimatedTotalHits })
    } finally {
      setLoading(false)
    }
  }, [q, selected, regionId])

  useEffect(() => {
    const t = setTimeout(run, 250)
    return () => clearTimeout(t)
  }, [run])

  function toggleFacet(attr: string, value: string) {
    setSelected((current) => {
      const cur = current[attr] ?? []
      return {
        ...current,
        [attr]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value],
      }
    })
  }

  const facetGroups = Object.entries(facets).filter(([, values]) => Object.keys(values).length > 0)

  return (
    <div className="mt-[1.75em]">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search trophies, awards, materials…"
        className="w-full rounded-[0.125em] border border-[#131111]/15 bg-transparent px-[1em] py-[0.9em] font-outfit text-[1em] text-[#131111] outline-none placeholder:text-[#6B635C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"
        aria-label="Search"
      />

      {!available && (
        <p className="mt-[1em] m-0 rounded-[0.125em] bg-[#131111]/5 px-[1em] py-[0.85em] font-outfit text-[0.9375em] text-[#6B635C]">
          Live search is offline. Browse the{" "}
          <Link href="/shop" className="text-[#131111] underline">
            catalog
          </Link>{" "}
          instead.
        </p>
      )}

      <div className="search-listing-frame mt-[2em]">
        <div className="search-listing-sidebar">
          <div className="lg:sticky lg:top-[calc(var(--site-header-h)+1.5em)] lg:max-h-[calc(100svh-var(--site-header-h)-3em)] lg:overflow-y-auto lg:overscroll-contain lg:[scrollbar-width:thin]">
            {facetGroups.length > 0 ? (
              <aside aria-label="Search filters" className="border-t border-[#CDCDCD]">
                {facetGroups.map(([attr, values]) => (
                  <section key={attr} className="border-b border-[#CDCDCD] py-[1.25em]">
                    <h2 className="m-0 mb-[0.9em] font-outfit text-[1.25em] leading-[1.25] font-light tracking-[-0.02em] text-[#131111] uppercase">
                      {FACET_LABELS[attr] ?? attr}
                    </h2>
                    <ul className="m-0 flex list-none flex-col gap-[0.75em] p-0">
                      {Object.entries(values).map(([value, count]) => {
                        const checked = (selected[attr] ?? []).includes(value)
                        return (
                          <li key={value}>
                            <label
                              className={`flex min-h-[2.5em] cursor-pointer items-center gap-[0.75em] font-outfit text-[1em] leading-[1.4] tracking-[-0.02em] ${
                                checked ? "text-[#131111]" : "text-[#6B635C]"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleFacet(attr, value)}
                                className="size-[1.05em] shrink-0 accent-[#131111]"
                              />
                              <span className="flex-1">{facetValueLabel(attr, value)}</span>
                              <span className="text-[0.875em] text-[#6B635C] tabular-nums">
                                {count}
                              </span>
                            </label>
                          </li>
                        )
                      })}
                    </ul>
                  </section>
                ))}
              </aside>
            ) : null}
          </div>
        </div>

        <div className="min-w-0">
          <p className="m-0 mb-[1.5em] font-outfit text-[0.875em] tracking-[-0.02em] text-[#6B635C]">
            {loading ? "Searching…" : `${total} result${total === 1 ? "" : "s"}`}
          </p>
          {loading && products.length === 0 ? (
            <div className="grid grid-cols-1 gap-x-[1.5em] gap-y-[2.625em] sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[302/374] w-full rounded-none bg-[#131111]/5" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="border border-dashed border-[#131111]/20 py-16 text-center">
              <p className="m-0 font-outfit text-[1.25em] tracking-[-0.02em] text-[#131111]">
                No products match this search
              </p>
              <p className="mt-1 font-outfit text-[0.9375em] text-[#6B635C] text-pretty">
                Try another word or clear a filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-[1.5em] gap-y-[2.625em] sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="min-w-0"
                  onClick={() => track("select_item", { item_id: product.id })}
                >
                  <EditorialProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
