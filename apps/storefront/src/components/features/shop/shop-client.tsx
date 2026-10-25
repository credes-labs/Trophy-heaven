"use client"

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { HttpTypes } from "@medusajs/types"
import { EditorialProductCard } from "@/components/features/shop/editorial-product-card"
import {
  FilterSidebar,
  type ShopFilters,
  type SubcategoryOption,
} from "@/components/features/shop/filter-sidebar"
import { ShopHero } from "@/components/features/shop/shop-hero"
import { ShopTestimonials } from "@/components/features/shop/shop-testimonials"
import { ShopBanner } from "@/components/features/shop/shop-banner"
import { ShopPagination } from "@/components/features/shop/shop-pagination"
import {
  ShopListingBreadcrumb,
  ShopFilterBanner,
  ShopModeToolbar,
} from "@/components/features/shop/shop-toolbar"
import { SHOP_LOAD_MORE, SHOP_PAGE_SIZE } from "@/components/features/shop/constants"
import { Skeleton } from "@/components/ui/skeleton"
import {
  PRICE_RANGE,
  SHOP_MATERIALS,
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
import { cn } from "@/lib/utils"
import { LayoutGroup, motion, useReducedMotion } from "motion/react"

const CARD_LAYOUT = {
  type: "tween" as const,
  duration: 0.56,
  ease: [0.25, 0.82, 0.25, 1] as const,
}

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

function hasNarrowingFilters(filters: ShopFilters) {
  return Boolean(
    filters.category ||
      filters.subcategory ||
      filters.material ||
      filters.inStock ||
      filters.customizable ||
      filters.minPrice > PRICE_RANGE.min ||
      filters.maxPrice < PRICE_RANGE.max
  )
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
  const [sortOpen, setSortOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(() => hasNarrowingFilters(filters))
  const reduceMotion = useReducedMotion()
  const cardTransition = reduceMotion ? { duration: 0 } : CARD_LAYOUT

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

  const goToPage = useCallback(
    (nextPage: number) => {
      const usp = filtersToParams(filters, nextPage)
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
          limit: SHOP_PAGE_SIZE,
          offset: (p - 1) * SHOP_PAGE_SIZE,
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
      !hasNarrowingFilters(filters) &&
      filters.sort === "newest" &&
      page === 1
    if (isDefault && !filtersOpen) {
      setProducts(initialProducts)
      setCount(initialCount)
      return
    }

    const append = !filtersOpen && !filtersChanged && page > 1
    void fetchProducts(filters, page, append)
  }, [filters, filterKey, page, fetchProducts, initialProducts, initialCount, filtersOpen])

  const remaining = Math.max(0, count - products.length)
  const canLoadMore = !filtersOpen && remaining > 0
  const totalPages = Math.max(1, Math.ceil(count / SHOP_PAGE_SIZE))
  const showingFrom = count === 0 ? 0 : (page - 1) * SHOP_PAGE_SIZE + 1
  const showingTo = Math.min(page * SHOP_PAGE_SIZE, count)

  function loadMore() {
    goToPage(page + 1)
  }

  function setListingMode(open: boolean) {
    setFiltersOpen(open)
    setSortOpen(false)
    if (!open) setLayout("grid")
    if (page > 1) {
      startTransition(() => {
        const usp = filtersToParams(filters, 1)
        const qs = usp.toString()
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
      })
    }
  }

  const filterPanel = (
    <FilterSidebar
      filters={filters}
      categoryCounts={categoryCounts}
      subcategories={subcategories}
      onChange={(patch) => writeFilters(patch)}
      onClear={clearFilters}
    />
  )

  const gridClass = filtersOpen
    ? layout === "grid"
      ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
      : "grid-cols-1"
    : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"

  const productGrid =
    loading && products.length === 0 ? (
      <div className={cn("grid gap-x-[1.5em] gap-y-[2.625em]", gridClass)}>
        {Array.from({ length: filtersOpen ? 6 : 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[302/374] w-full rounded-[0.125em] bg-[#D9D9D9]" />
        ))}
      </div>
    ) : products.length === 0 ? (
      <div className="border border-dashed border-[#131111]/20 py-16 text-center">
        <p className="font-outfit text-[1.25em] tracking-[-0.02em]">No products match your filters</p>
        <p className="mt-1 font-outfit text-[0.9375em] text-[#6B635C] text-pretty">
          Try adjusting or clearing filters.
        </p>
        <button
          type="button"
          onClick={clearFilters}
          className="mt-4 cursor-pointer border-0 bg-transparent p-0 font-outfit text-[0.9375em] tracking-[-0.02em] text-[#131111] uppercase underline"
        >
          Clear all filters
        </button>
      </div>
    ) : (
      <LayoutGroup>
        <div className={cn("grid gap-x-[1.5em] gap-y-[2.625em]", gridClass)}>
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              layout="position"
              transition={cardTransition}
              className="min-w-0"
            >
              <EditorialProductCard
                product={p}
                layout={filtersOpen ? layout : "grid"}
                index={i}
              />
            </motion.div>
          ))}
        </div>
      </LayoutGroup>
    )

  return (
    <div
      className={cn(
        "shop-page under-site-header bg-[#F2F1EF] font-outfit text-[#131111] lg:[font-size:min(1rem,calc(100vw/90))]",
        filtersOpen && "is-filter"
      )}
    >
      <div className="shop-page-hero" aria-hidden={filtersOpen}>
        <div className="shop-fold-pane">
          <ShopHero products={initialProducts} />
        </div>
      </div>

      <div
        className={cn(
          "mx-auto w-full max-w-[90em] px-[clamp(1.25rem,2.78vw,2.5em)] pb-[clamp(3rem,6vw,5.5em)] transition-[padding] duration-[560ms] ease-[cubic-bezier(0.25,0.82,0.25,1)] motion-reduce:duration-0",
          filtersOpen ? "pt-[clamp(1.25rem,2vw,2em)]" : "pt-[clamp(2rem,4vw,3.5em)]"
        )}
      >
        <div className="shop-filter-breadcrumb" aria-hidden={!filtersOpen}>
          <div className="shop-fold-pane">
            <div className="mb-[1.5em]">
              <ShopListingBreadcrumb category={filters.category} />
            </div>
          </div>
        </div>

        <div className="shop-listing-frame">
          <div className="shop-listing-sidebar" aria-hidden={!filtersOpen}>
            <div className="shop-listing-sidebar-inner lg:sticky lg:top-[calc(var(--site-header-h)+1.5em)] lg:max-h-[calc(100svh-var(--site-header-h)-3em)] lg:overflow-y-auto lg:overscroll-contain lg:[scrollbar-width:thin]">
              {filterPanel}
            </div>
          </div>
          <div className="min-w-0">
            <div className="shop-filter-banner-slot" aria-hidden={!filtersOpen}>
              <div className="shop-fold-pane">
                <ShopFilterBanner category={filters.category} />
              </div>
            </div>

            <ShopModeToolbar
              filtersOpen={filtersOpen}
              onToggleFilters={() => setListingMode(!filtersOpen)}
              layout={layout}
              onLayout={setLayout}
              sort={filters.sort}
              sortOpen={sortOpen}
              onToggleSort={() => setSortOpen((open) => !open)}
              onSort={(value) => {
                setSortOpen(false)
                writeFilters({ sort: value })
              }}
              showingFrom={showingFrom}
              showingTo={showingTo}
              total={count}
            />

            {productGrid}

            <div className="shop-swap">
              <div className="shop-fold-pane">
                {canLoadMore ? (
                  <div className="mt-[3.5em] flex justify-center">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={loadMore}
                      className="cursor-pointer border-0 bg-transparent p-0 font-outfit text-[0.8125em] tracking-[0.2em] text-[#6B635C] uppercase disabled:opacity-50"
                    >
                      ‹ {SHOP_LOAD_MORE} ›
                    </button>
                  </div>
                ) : null}
              </div>
              <div className="shop-fold-pane">
                <ShopPagination
                  page={page}
                  totalPages={totalPages}
                  onPage={goToPage}
                  showingFrom={showingFrom}
                  showingTo={showingTo}
                  total={count}
                />
              </div>
            </div>

            {pending || loading ? (
              <p className="mt-4 m-0 text-center font-outfit text-[0.875em] tracking-[-0.02em] text-[#6B635C]">
                Updating…
              </p>
            ) : null}

            <div className="shop-browse-footer" aria-hidden={filtersOpen}>
              <div className="shop-fold-pane">
                <ShopTestimonials />
                <ShopBanner />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
