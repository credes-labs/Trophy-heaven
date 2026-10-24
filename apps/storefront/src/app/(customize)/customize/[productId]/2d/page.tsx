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
  searchParams,
}: {
  params: Promise<{ productId: string }>
  searchParams: Promise<{ design?: string; variant?: string }>
}) {
  const { productId } = await params
  const { design, variant } = await searchParams
  const product = await getProductById(productId)
  if (!product) notFound()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <Link href={`/products/${product.handle}`} className="font-outfit text-[0.875em] tracking-[-0.02em] text-[#131111] uppercase underline underline-offset-[0.15em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]">
          Back to {product.title}
        </Link>
        <h1 className="mt-[0.75em] font-outfit text-[clamp(1.75rem,3vw,2.25em)] leading-[1.15] font-normal tracking-[-0.03em] text-balance text-[#131111]">Design your {product.title}</h1>
        <p className="mt-[0.5em] font-outfit text-[1em] leading-[1.45] text-[#6B635C]">
          Add engraving text and your logo, pick a material finish, then save or add to cart.
        </p>
      </div>
      <Editor2DLoader product={product} designId={design} preferredVariantId={variant} />
    </div>
  )
}
