import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { getProductById } from "@/lib/data/catalog"
import { Editor3DLoader } from "@/components/features/customize/three/editor-3d-loader"

export const metadata: Metadata = {
  title: "Customize in 3D",
  robots: { index: false },
}

export default async function Customize3DPage({
  params,
  searchParams,
}: {
  params: Promise<{ productId: string }>
  searchParams: Promise<{ design?: string }>
}) {
  const { productId } = await params
  const { design } = await searchParams
  const product = await getProductById(productId)
  if (!product) notFound()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <Link href={`/products/${product.handle}`} className="text-sm text-accent hover:underline">
          ← Back to {product.title}
        </Link>
        <h1 className="mt-2 font-serif text-3xl">Design your {product.title} in 3D</h1>
        <p className="text-sm text-muted-foreground">
          Rotate the trophy, switch materials, add engraving and your logo, then view it in AR.
        </p>
      </div>
      <Editor3DLoader product={product} designId={design} />
    </div>
  )
}
