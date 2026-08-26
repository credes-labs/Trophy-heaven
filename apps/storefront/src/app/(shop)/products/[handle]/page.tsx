import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getProductByHandle, listProducts } from "@/lib/data/catalog"
import { ProductActions } from "@/components/features/catalog/product-actions"
import { ImageGallery } from "@/components/features/catalog/image-gallery"
import { ProductTabs } from "@/components/features/catalog/product-tabs"
import { RelatedProducts } from "@/components/features/catalog/related-products"
import { CATEGORIES, hrefForCategoryHandle, type CategoryKey } from "@/lib/category-config"
import { getReviewSummary } from "@/lib/reviews"
import "./pdp.css"

export const revalidate = 300

const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").replace(/\/$/, "")

type Props = { params: Promise<{ handle: string }> }

function resolveCategory(product: {
  categories?: { id?: string; name?: string | null; handle?: string | null }[] | null
}) {
  const handles = (product.categories ?? [])
    .map((c) => c.handle?.toLowerCase() ?? "")
    .filter(Boolean)

  for (const key of Object.keys(CATEGORIES) as CategoryKey[]) {
    const cfg = CATEGORIES[key]
    if (handles.some((h) => h === cfg.slug || h.includes(cfg.slug) || cfg.slug.includes(h))) {
      return {
        ...cfg,
        key,
        categoryId: product.categories?.find((c) =>
          c.handle?.toLowerCase().includes(cfg.slug)
        )?.id,
      }
    }
  }

  if (handles.some((h) => h.includes("trophi"))) {
    return { ...CATEGORIES.trophies, key: "trophies" as const, categoryId: product.categories?.[0]?.id }
  }

  const first = product.categories?.[0]
  return {
    ...CATEGORIES.trophies,
    key: "trophies" as const,
    label: first?.name ?? CATEGORIES.trophies.label,
    href: first?.handle ? hrefForCategoryHandle(first.handle) : CATEGORIES.trophies.href,
    categoryId: first?.id,
  }
}

function productExcerpt(description: string | null | undefined, maxChars = 220) {
  if (!description) return null
  const collapsed = description.replace(/\s+/g, " ").trim()
  if (!collapsed) return null
  if (collapsed.length <= maxChars) return collapsed
  const clipped = collapsed.slice(0, maxChars)
  const lastSpace = clipped.lastIndexOf(" ")
  return `${clipped.slice(0, lastSpace > 140 ? lastSpace : maxChars)}…`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  const product = await getProductByHandle(handle).catch(() => null)
  if (!product) return { title: "Product" }
  return {
    title: product.title,
    description: product.description ?? undefined,
    alternates: { canonical: `/products/${handle}` },
    openGraph: {
      title: product.title,
      images: product.thumbnail ? [product.thumbnail] : undefined,
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params
  const product = await getProductByHandle(handle).catch(() => null)
  if (!product) notFound()

  const category = resolveCategory(product)
  const excerpt = productExcerpt(product.description)

  const related = await listProducts({
    categoryId: category.categoryId,
    limit: 8,
  })
    .then((r) => r.products.filter((p) => p.id !== product.id).slice(0, 4))
    .catch(() => [] as Awaited<ReturnType<typeof listProducts>>["products"])

  const fallbackRelated =
    related.length >= 2
      ? related
      : await listProducts({ limit: 8 })
          .then((r) => r.products.filter((p) => p.id !== product.id).slice(0, 4))
          .catch(() => related)

  const galleryImages = [
    ...(product.thumbnail
      ? [{ id: "thumb", url: product.thumbnail, alt: product.title }]
      : []),
    ...(product.images ?? [])
      .filter((img) => img.url !== product.thumbnail)
      .map((img) => ({ id: img.id, url: img.url, alt: product.title })),
  ]

  const price = product.variants?.[0]?.calculated_price
  const reviewSummary = await getReviewSummary(product.id)
  const summary = reviewSummary && reviewSummary.count > 0 ? reviewSummary : null

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description ?? undefined,
    image: galleryImages.map((i) => i.url).filter(Boolean),
    brand: { "@type": "Brand", name: "Legacy Crafts" },
    offers: {
      "@type": "Offer",
      priceCurrency: price?.currency_code?.toUpperCase() ?? "INR",
      price: price?.calculated_amount ?? undefined,
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "Legacy Crafts" },
    },
    ...(summary
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: summary.average_rating,
            reviewCount: summary.count,
          },
        }
      : {}),
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: category.label,
        item: `${BASE_URL}${category.href}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.title,
        item: `${BASE_URL}/products/${handle}`,
      },
    ],
  }

  return (
    <div className="pdp-page">
      <div className="pdp-shell">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />

        <nav aria-label="Breadcrumb">
          <ol className="pdp-breadcrumb">
            <li>
              <Link href="/">Home</Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href={category.href}>{category.label}</Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page">
              {product.title}
            </li>
          </ol>
        </nav>

        <div className="pdp-hero">
          <div className="min-w-0">
            <ImageGallery images={galleryImages} title={product.title} />
          </div>

          <div className="min-w-0">
            <h1 className="pdp-title">{product.title}</h1>

            <p className="pdp-rating">
              <span className="inline-flex items-center gap-0.5" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => {
                  const filled = Boolean(summary && i < Math.round(summary.average_rating))
                  return (
                    <svg
                      key={i}
                      viewBox="0 0 24 24"
                      className="h-3.5 w-3.5"
                      fill={filled ? "#131111" : "none"}
                      stroke="#131111"
                      strokeWidth="1.5"
                      strokeOpacity={filled ? 1 : 0.25}
                      aria-hidden
                    >
                      <path d="M12 3.2 14.6 9l6.4.7-4.8 4.3 1.4 6.3L12 17.2 6.4 20.3l1.4-6.3L3 9.7 9.4 9z" />
                    </svg>
                  )
                })}
              </span>
              {summary ? (
                <a href="#reviews">
                  {summary.count} Rating{summary.count === 1 ? "" : "s"}
                  <span aria-hidden> | </span>
                  Add your rating
                </a>
              ) : (
                <a href="#reviews">Add your rating</a>
              )}
            </p>

            {excerpt ? <p className="pdp-excerpt">{excerpt}</p> : null}

            <div className="mt-[1.5em]">
              <ProductActions product={product} />
            </div>
          </div>
        </div>

        <ProductTabs product={product} />

        <RelatedProducts
          products={fallbackRelated}
          categoryLabel={category.label}
          categoryHref={category.href}
        />
      </div>
    </div>
  )
}
