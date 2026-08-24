"use client"

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { HttpTypes } from "@medusajs/types"
import { LayoutGrid, List, SlidersHorizontal } from "lucide-react"
import { EditorialProductCard } from "@/components/features/shop/editorial-product-card"
import { ShopBreadcrumb } from "@/components/features/catalog/category-hero"
import {
  FilterSidebar,
  type ShopFilters,
  type SubcategoryOption,
} from "@/components/features/shop/filter-sidebar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  CATEGORY_CONFIG,
  PAGE_SIZE,
  PRICE_RANGE,
  SHOP_MATERIALS,
  SHOP_SORT_OPTIONS,
  sortOrderFromParam,
  type CategoryKey,
} from "@/lib/category-config"
import { listProductsClient } from "@/lib/data/catalog"
import {
  isCustomizableProduct,
  matchesMaterial,
  productInStock,
  productPrice,
} from "@/lib/product-filters"
import { fadeUp, staggerGrid } from "@/lib/animations"
import { cn } from "@/lib/utils"
import { motion } from "motion/react"

export type ShopCategoryOption = {
  key: CategoryKey
  id: string
  childIds: string[]
  children: SubcategoryOption[]
  label: string
}

function parseFilters(sp: URLSearchParams): ShopFilters {
  const cat = sp.get("category")
  const category =
    cat === "trophies" || cat === "furniture" || cat === "artwork" ? cat : null
  const material = sp.get("material")
  const sort = sp.get("sort") || "newest"
  const minPrice = Math.max(PRICE_RANGE.min, Number(sp.get("minPrice")) || PRICE_RANGE.min)
  const maxPrice = Math.min(
    PRICE_RANGE.max,
    Number(sp.get("maxPrice")) || PRICE_RANGE.max
  )
  return {
    category,
    subcategory: category ? sp.get("sub") : null,
    material: material && SHOP_MATERIALS.includes(material as (typeof SHOP_MATERIALS)[number])
      ? material
      : null,
    sort,
    minPrice,
    maxPrice,
    inStock: sp.get("inStock") === "1",
    customizable: sp.get("customizable") === "1",
  }
}

function filtersToParams(filters: ShopFilters, page: number): URLSearchParams {
  const usp = new URLSearchParams()
  if (filters.category) usp.set("category", filters.category)
  if (filters.category && filters.subcategory) usp.set("sub", filters.subcategory)
  if (filters.material) usp.set("material", filters.material)
  if (filters.sort && filters.sort !== "newest") usp.set("sort", filters.sort)
  if (filters.minPrice > PRICE_RANGE.min) usp.set("minPrice", String(filters.minPrice))
  if (filters.maxPrice < PRICE_RANGE.max) usp.set("maxPrice", String(filters.maxPrice))
  if (filters.inStock) usp.set("inStock", "1")
  if (filters.customizable) usp.set("customizable", "1")
  if (page > 1) usp.set("page", String(page))
  return usp
}

export type ShopClientProps = {
  initialProducts: HttpTypes.StoreProduct[]
  initialCount: number
  categories: ShopCategoryOption[]
  categoryCounts: Partial<Record<CategoryKey, number>>
  regionId?: string
}

export function ShopClient({
  initialProducts,
  initialCount,
  categories,
  categoryCounts,
  regionId,
}: ShopClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()

  const filters = useMemo(() => parseFilters(searchParams), [searchParams])
  const page = Math.max(1, Number(searchParams.get("page")) || 1)

  const [products, setProducts] = useState(initialProducts)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)
  const [layout, setLayout] = useState<"grid" | "list">("grid")
  const [sheetOpen, setSheetOpen] = useState(false)

  const categoryIdMap = useMemo(() => {
    const map = new Map<CategoryKey, string[]>()
    for (const c of categories) {
      map.set(c.key, [c.id, ...c.childIds])
    }
    return map
  }, [categories])

  const subcategories = useMemo(() => {
    const map: Partial<Record<CategoryKey, SubcategoryOption[]>> = {}
    for (const c of categories) map[c.key] = c.children
    return map
  }, [categories])

  const subcategoryIdMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const c of categories) {
      for (const child of c.children) map.set(child.handle, child.id)
    }
    return map
  }, [categories])

  const writeFilters = useCallback(
    (patch: Partial<ShopFilters>, nextPage = 1) => {
      const next = { ...filters, ...patch }
      const usp = filtersToParams(next, nextPage)
      const qs = usp.toString()
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
      })
    },
    [filters, pathname, router]
  )

  const clearFilters = useCallback(() => {
    startTransition(() => {
      router.replace(pathname, { scroll: false })
    })
  }, [pathname, router])

  const fetchProducts = useCallback(
    async (f: ShopFilters, p: number, append: boolean) => {
      setLoading(true)
      try {
        const childId = f.subcategory ? subcategoryIdMap.get(f.subcategory) : undefined
        const categoryIds = childId
          ? [childId]
          : f.category
            ? categoryIdMap.get(f.category)
            : undefined
        const { products: next, count: total } = await listProductsClient({
          categoryIds,
          limit: PAGE_SIZE,
          offset: (p - 1) * PAGE_SIZE,
          order: sortOrderFromParam(f.sort),
          regionId,
        })
        let filtered = next
        if (f.material) {
          filtered = filtered.filter((prod) => matchesMaterial(prod, f.material!))
        }
        if (f.minPrice > PRICE_RANGE.min || f.maxPrice < PRICE_RANGE.max) {
          filtered = filtered.filter((prod) => {
            const price = productPrice(prod)
            if (price == null) return true
            return price >= f.minPrice && price <= f.maxPrice
          })
        }
        if (f.inStock) {
          filtered = filtered.filter(productInStock)
        }
        if (f.customizable) {
          filtered = filtered.filter(isCustomizableProduct)
        }
        setProducts((prev) => (append ? [...prev, ...filtered] : filtered))
        setCount(total)
      } catch {
        if (!append) setProducts([])
      } finally {
        setLoading(false)
      }
    },
    [categoryIdMap, subcategoryIdMap, regionId]
  )

  const filterKey = useMemo(
    () =>
      [
        filters.category,
        filters.subcategory,
        filters.material,
        filters.sort,
        filters.minPrice,
        filters.maxPrice,
        filters.inStock,
        filters.customizable,
      ].join("|"),
    [filters]
  )
  const prevFilterKey = useRef(filterKey)

  useEffect(() => {
    const filtersChanged = prevFilterKey.current !== filterKey
    prevFilterKey.current = filterKey

    const isDefault =
      !filters.category &&
      !filters.subcategory &&
      !filters.material &&
      !filters.inStock &&
      !filters.customizable &&
      filters.sort === "newest" &&
      filters.minPrice === PRICE_RANGE.min &&
      filters.maxPrice === PRICE_RANGE.max &&
      page === 1
    if (isDefault) {
      setProducts(initialProducts)
      setCount(initialCount)
      return
    }

    const append = !filtersChanged && page > 1
    void fetchProducts(filters, page, append)
  }, [filters, filterKey, page, fetchProducts, initialProducts, initialCount])

  const activePills: { key: string; label: string; clear: () => void }[] = []
  if (filters.category) {
    activePills.push({
      key: "category",
      label: CATEGORY_CONFIG[filters.category].label,
      clear: () => writeFilters({ category: null, subcategory: null }),
    })
  }
  if (filters.subcategory) {
    const subName = categories
      .flatMap((c) => c.children)
      .find((c) => c.handle === filters.subcategory)?.name
    activePills.push({
      key: "subcategory",
      label: subName ?? filters.subcategory,
      clear: () => writeFilters({ subcategory: null }),
    })
  }
  if (filters.material) {
    activePills.push({
      key: "material",
      label: filters.material,
      clear: () => writeFilters({ material: null }),
    })
  }
  if (filters.minPrice > PRICE_RANGE.min || filters.maxPrice < PRICE_RANGE.max) {
    activePills.push({
      key: "price",
      label: `₹${filters.minPrice.toLocaleString("en-IN")}–₹${filters.maxPrice.toLocaleString("en-IN")}`,
      clear: () => writeFilters({ minPrice: PRICE_RANGE.min, maxPrice: PRICE_RANGE.max }),
    })
  }
  if (filters.inStock) {
    activePills.push({
      key: "inStock",
      label: "In stock",
      clear: () => writeFilters({ inStock: false }),
    })
  }
  if (filters.customizable) {
    activePills.push({
      key: "customizable",
      label: "Customizable",
      clear: () => writeFilters({ customizable: false }),
    })
  }

  const remaining = Math.max(0, count - products.length)
  const canLoadMore = remaining > 0

  function loadMore() {
    const nextPage = page + 1
    const usp = filtersToParams(filters, nextPage)
    startTransition(() => {
      router.replace(`${pathname}?${usp.toString()}`, { scroll: false })
    })
  }

  const filterPanel = (
    <FilterSidebar
      filters={filters}
      categoryCounts={categoryCounts}
      subcategories={subcategories}
      onChange={(patch) => writeFilters(patch)}
      onClear={clearFilters}
      showSort={false}
    />
  )

  return (
    <div className="bg-[#F2F1EF] font-outfit text-[#131111] lg:[font-size:min(1rem,calc(100vw/90))]">
      <div className="mx-auto w-full max-w-[90em] px-[clamp(1.25rem,2.78vw,2.5em)] pt-[clamp(2rem,4vw,3.5em)] pb-[clamp(3rem,6vw,5.5em)]">
      <ShopBreadcrumb />
      <div className="mb-[2.5em] mt-[1.5em] flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <h1 className="m-0 max-w-[20em] font-outfit text-[clamp(2rem,6vw,3.375em)] leading-[1.24] font-normal tracking-[-0.04em] text-[#131111]">
          The collection
        </h1>
        <p className="m-0 font-outfit text-[clamp(1rem,2vw,1.25em)] leading-[1.4] tracking-[-0.03em] text-[rgba(19,17,17,0.6)]">
          {loading || pending ? "Updating…" : `${count} piece${count === 1 ? "" : "s"}`}
        </p>
      </div>

      <div className="flex flex-col gap-[2.5em] lg:flex-row lg:items-start lg:gap-[3.25em]">
        <div className="hidden w-[14em] shrink-0 md:block">{filterPanel}</div>

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="md:hidden"
              onClick={() => setSheetOpen(true)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activePills.length > 0 && (
                <span className="ml-1 rounded-full bg-muted px-1.5 text-xs">
                  {activePills.length}
                </span>
              )}
            </Button>

            <select
              className="h-9 rounded-md border border-border bg-card px-3 text-sm"
              value={filters.sort}
              onChange={(e) => writeFilters({ sort: e.target.value })}
              aria-label="Sort"
            >
              {SHOP_SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            <div className="ml-auto flex items-center gap-1 rounded-md border border-border p-0.5">
              <button
                type="button"
                aria-label="Grid view"
                aria-pressed={layout === "grid"}
                onClick={() => setLayout("grid")}
                className={cn(
                  "rounded p-1.5",
                  layout === "grid" ? "bg-muted text-foreground" : "text-muted-foreground"
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="List view"
                aria-pressed={layout === "list"}
                onClick={() => setLayout("list")}
                className={cn(
                  "rounded p-1.5",
                  layout === "list" ? "bg-muted text-foreground" : "text-muted-foreground"
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {activePills.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {activePills.map((pill) => (
                <button
                  key={pill.key}
                  type="button"
                  onClick={pill.clear}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium hover:bg-muted"
                >
                  {pill.label}
                  <span aria-hidden>×</span>
                </button>
              ))}
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-medium text-accent hover:underline"
              >
                Clear all
              </button>
            </div>
          )}

          {loading && products.length === 0 ? (
            <div
              className={cn(
                "grid gap-x-[1.5em] gap-y-[2.625em]",
                layout === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                  : "grid-cols-1"
              )}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[302/374] w-full rounded-[0.125em] bg-[#D9D9D9]" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-16 text-center">
              <p className="font-medium">No products match your filters</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting or clearing filters.
              </p>
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear all filters
              </Button>
            </div>
          ) : (
            <motion.div
              key={`${filterKey}|${layout}`}
              className={cn(
                "grid gap-x-[1.5em] gap-y-[2.625em]",
                layout === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                  : "grid-cols-1"
              )}
              variants={staggerGrid}
              initial="hidden"
              animate="visible"
            >
              {products.map((p, i) => (
                <motion.div key={p.id} variants={fadeUp}>
                  <EditorialProductCard product={p} layout={layout} index={i} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {canLoadMore && (
            <div className="mt-10 flex justify-center">
              <Button
                variant="outline"
                loading={loading}
                onClick={loadMore}
                className="h-[3.875em] rounded-full border-[#131111] bg-[#131111] px-8 font-outfit text-[1em] tracking-[-0.02em] text-[#F2F1EF] uppercase hover:opacity-90"
              >
                Show more products ({remaining} remaining)
              </Button>
            </div>
          )}
        </div>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="flex h-[85vh] flex-col overflow-hidden p-0">
          <SheetHeader className="border-b border-border px-6 py-4">
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {filterPanel}
          </div>
          <div className="flex gap-2 border-t border-border px-6 py-4">
            <Button variant="ghost" className="flex-1" onClick={clearFilters}>
              Reset
            </Button>
            <Button className="flex-1" onClick={() => setSheetOpen(false)}>
              Apply ({count} results)
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      </div>
    </div>
  )
}
