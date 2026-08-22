import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Star } from "lucide-react"
import { getProductByHandle, listProducts } from "@/lib/data/catalog"
import { ProductActions } from "@/components/features/catalog/product-actions"
import { ImageGallery } from "@/components/features/catalog/image-gallery"
import { ProductTabs } from "@/components/features/catalog/product-tabs"
import { RelatedProducts } from "@/components/features/catalog/related-products"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { CUSTOMIZATION_LABELS } from "@/lib/format"
import { CATEGORIES, hrefForCategoryHandle, type CategoryKey } from "@/lib/category-config"
import { getReviewSummary } from "@/lib/reviews"
import { cn } from "@/lib/utils"

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
  const level = (product.metadata?.customization_level as string) ?? "none"

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

  const accent = category.accent as "trophy" | "furniture" | "artwork"
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
    <div className="mx-auto max-w-7xl px-4 py-8 pb-24 lg:pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={category.href}>{category.label}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink active href={`/products/${handle}`}>
              {product.title}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid gap-10 lg:grid-cols-2">
        <ImageGallery
          images={galleryImages}
          title={product.title}
          accentClass={category.borderClass}
        />

        <div>
          <Badge variant={accent} className="mb-3">
            {category.label}
          </Badge>
          <h1 className="font-serif text-2xl font-semibold md:text-3xl">{product.title}</h1>
          {summary && (
            <p className="mt-2 flex items-center gap-1.5 text-sm">
              <span className="inline-flex items-center gap-0.5" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3.5 w-3.5",
                      i < Math.round(summary.average_rating)
                        ? "fill-gold text-gold"
                        : "text-muted-foreground/40"
                    )}
                  />
                ))}
              </span>
              <span className="font-medium">{summary.average_rating.toFixed(1)}</span>
              <span className="text-muted-foreground">
                ({summary.count} review{summary.count === 1 ? "" : "s"})
              </span>
            </p>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            {CUSTOMIZATION_LABELS[level] ?? "Product"}
          </p>
          <div className="mt-8">
            <ProductActions product={product} accent={accent} />
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
  )
}
