import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { getProductById } from "@/lib/data/catalog"
import { Editor2DLoader } from "@/components/features/customize/editor-2d-loader"

export const metadata: Metadata = {
  title: "Customize your design",
  robots: { index: false },
}

export default async function Customize2DPage({
  params,
}: {
  params: Promise<{ productId: string }>
}) {
  const { productId } = await params
  const product = await getProductById(productId)
  if (!product) notFound()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <Link href={`/products/${product.handle}`} className="text-sm text-accent hover:underline">
          ← Back to {product.title}
        </Link>
        <h1 className="mt-2 font-serif text-3xl">Design your {product.title}</h1>
        <p className="text-sm text-muted-foreground">
          Add engraving text and your logo, pick a material finish, then save or add to cart.
        </p>
      </div>
      <Editor2DLoader product={product} />
    </div>
  )
}
