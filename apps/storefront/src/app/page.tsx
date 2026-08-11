import Link from "next/link"
import { listProducts } from "@/lib/data/catalog"
import { ProductCard } from "@/components/features/catalog/product-card"

export const revalidate = 300

export default async function HomePage() {
  let products: Awaited<ReturnType<typeof listProducts>>["products"] = []
  try {
    products = (await listProducts({ limit: 8 })).products
  } catch {
    // Backend unavailable at build — render the shell; ISR fills in later.
  }

  return (
    <div>
      <section className="border-b bg-gradient-to-b from-muted/60 to-background">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center">
          <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
            Design a trophy that's exactly yours
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Customize trophies, furniture, and home decor in real-time 2D and 3D — then preview the
            result before you buy.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/categories/trophies"
              className="rounded-md bg-accent px-6 py-3 text-sm font-medium text-accent-foreground hover:opacity-90"
            >
              Shop trophies
            </Link>
            <Link
              href="/corporate"
              className="rounded-md border px-6 py-3 text-sm font-medium hover:bg-muted"
            >
              Bulk & corporate
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="font-serif text-2xl font-semibold">Featured</h2>
        {products.length ? (
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="mt-6 text-muted-foreground">Catalog is loading. Please check back shortly.</p>
        )}
      </section>
    </div>
  )
}
