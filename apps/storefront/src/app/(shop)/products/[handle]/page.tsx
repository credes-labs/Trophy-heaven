import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { getProductByHandle, listProducts } from "@/lib/data/catalog"
import { ProductActions } from "@/components/features/catalog/product-actions"
import { ProductCard } from "@/components/features/catalog/product-card"
import { CUSTOMIZATION_LABELS } from "@/lib/format"

export const revalidate = 300

type Props = { params: Promise<{ handle: string }> }

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

  const level = (product.metadata?.customization_level as string) ?? "none"
  const related = await listProducts({ limit: 4 })
    .then((r) => r.products.filter((p) => p.id !== product.id).slice(0, 4))
    .catch(() => [])

  // JSON-LD structured data for SEO (NFR-3, FR-SRCH-7).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description ?? undefined,
    image: product.thumbnail ?? undefined,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: product.variants?.[0]?.calculated_price?.currency_code?.toUpperCase() ?? "INR",
      lowPrice: product.variants?.[0]?.calculated_price?.calculated_amount ?? undefined,
    },
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            {product.thumbnail ? (
              <Image
                src={product.thumbnail}
                alt={product.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center font-serif text-4xl text-muted-foreground opacity-40">
                LC
              </div>
            )}
          </div>
          {product.images?.length ? (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {product.images.slice(0, 5).map((img) => (
                <div key={img.id} className="relative aspect-square overflow-hidden rounded-md bg-muted">
                  <Image src={img.url} alt="" fill sizes="100px" className="object-cover" />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <p className="text-sm text-muted-foreground">{CUSTOMIZATION_LABELS[level] ?? "Product"}</p>
          <h1 className="mt-1 font-serif text-3xl font-semibold">{product.title}</h1>
          {product.description && (
            <p className="mt-4 text-muted-foreground">{product.description}</p>
          )}
          <div className="mt-8">
            <ProductActions product={product} />
          </div>
        </div>
      </div>

      {related.length ? (
        <section className="mt-16">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-semibold">You may also like</h2>
            <Link href="/categories/trophies" className="text-sm text-accent hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
