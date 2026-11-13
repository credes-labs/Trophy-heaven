import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { getCategoryByHandle, listProducts } from "@/lib/data/catalog"
import { ProductCard } from "@/components/features/catalog/product-card"
import { categoryKeyFromHandle, CATEGORY_CONFIG } from "@/lib/category-config"

export const revalidate = 300

type Props = {
  params: Promise<{ slug: string[] }>
  searchParams: Promise<{ page?: string; order?: string }>
}

/** Top-level Medusa handles → branded category routes */
const TOP_LEVEL_REDIRECTS: Record<string, string> = {
  trophies: "/trophies",
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const handle = slug[slug.length - 1]
  const key = categoryKeyFromHandle(handle)
  if (slug.length === 1 && key) {
    const config = CATEGORY_CONFIG[key]
    return {
      title: config.headline,
      description: config.description,
      alternates: { canonical: config.href },
    }
  }
  const category = await getCategoryByHandle(handle).catch(() => null)
  if (!category) return { title: "Category" }
  return {
    title: category.name,
    description: category.description ?? `Shop ${category.name} at Trophy Heaven.`,
    alternates: { canonical: `/categories/${slug.join("/")}` },
  }
}

const PAGE_SIZE = 12

const SORT_OPTIONS = [
  { label: "Newest", value: "-created_at" },
  { label: "Price: Low to High", value: "variants.calculated_price" },
  { label: "Price: High to Low", value: "-variants.calculated_price" },
]

export default async function CategoryCatchAllPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { page = "1", order = "-created_at" } = await searchParams
  const handle = slug[slug.length - 1]

  if (slug.length === 1 && TOP_LEVEL_REDIRECTS[handle]) {
    redirect(TOP_LEVEL_REDIRECTS[handle])
  }

  const category = await getCategoryByHandle(handle).catch(() => null)
  if (!category) notFound()

  const currentPage = Math.max(1, Number(page) || 1)
  const categoryIds = [
    category.id,
    ...(category.category_children?.map((c) => c.id) ?? []),
  ]
  const { products, count } = await listProducts({
    categoryIds,
    limit: PAGE_SIZE,
    offset: (currentPage - 1) * PAGE_SIZE,
    order,
  }).catch(() => ({ products: [], count: 0 }))

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE))
  const accent = categoryKeyFromHandle(category.handle ?? handle)
  const accentToken = accent ? CATEGORY_CONFIG[accent].accent : undefined

  return (
    <div className="mx-auto max-w-7xl bg-white px-4 py-10 font-outfit text-[#131111]">
      <nav aria-label="Breadcrumb" className="mb-2 text-sm text-[#6B635C]">
        <Link href="/" className="hover:text-[#131111]">
          Home
        </Link>{" "}
        / <span className="text-[#131111]">{category.name}</span>
      </nav>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-outfit text-3xl font-semibold text-balance text-[#131111]">{category.name}</h1>
          {category.description && (
            <p className="mt-1 max-w-2xl text-pretty text-[#6B635C]">{category.description}</p>
          )}
        </div>
        <form className="flex items-center gap-2">
          <label htmlFor="order" className="text-sm text-[#6B635C]">
            Sort
          </label>
          <select
            id="order"
            name="order"
            defaultValue={order}
            className="h-10 rounded-[0.125em] border border-[#131111]/15 bg-white px-3 font-outfit text-sm text-[#131111]"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button className="inline-flex min-h-11 items-center rounded-full border-0 bg-[#131111] px-5 text-sm text-[#F2F1EF]">Apply</button>
        </form>
      </div>

      {category.category_children?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {category.category_children.map((child) => (
            <Link
              key={child.id}
              href={`/categories/${slug[0]}/${child.handle}`}
              className="rounded-full border border-[#131111]/15 px-3 py-1 font-outfit text-xs text-[#131111] hover:bg-white"
            >
              {child.name}
            </Link>
          ))}
        </div>
      ) : null}

      {products.length ? (
        <>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} accent={accentToken} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={`/categories/${slug.join("/")}?page=${n}&order=${order}`}
                  className={`inline-flex h-11 min-w-11 items-center justify-center rounded-full border border-[#131111]/15 px-3 font-outfit text-sm ${
                    n === currentPage ? "bg-[#131111] text-[#F2F1EF]" : "text-[#6B635C] hover:text-[#131111]"
                  }`}
                >
                  {n}
                </Link>
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="mt-10 text-pretty text-[#6B635C]">No products in this category yet.</p>
      )}
    </div>
  )
}
