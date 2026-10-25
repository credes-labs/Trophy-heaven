import { notFound, redirect } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { getProductById } from "@/lib/data/catalog"
import { Editor3DLoader } from "@/components/features/customize/three/editor-3d-loader"
import { PLAQUE_HANDLE } from "@/lib/configurator/plaque"

export const metadata: Metadata = {
  title: "Customize in 3D",
  robots: { index: false },
}

export default async function Customize3DPage({
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

  if (product.handle === PLAQUE_HANDLE) {
    const next = new URLSearchParams()
    if (variant) next.set("variant", variant)
    if (design) next.set("design", design)
    redirect(`/customize?${next.toString()}`)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <Link href={`/products/${product.handle}`} className="font-outfit text-[0.875em] tracking-[-0.02em] text-[#131111] uppercase underline underline-offset-[0.15em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]">
          Back to {product.title}
        </Link>
        <h1 className="mt-[0.75em] font-outfit text-[clamp(1.75rem,3vw,2.25em)] leading-[1.15] font-normal tracking-[-0.03em] text-balance text-[#131111]">Design your {product.title} in 3D</h1>
        <p className="mt-[0.5em] font-outfit text-[1em] leading-[1.45] text-[#6B635C]">
          Rotate the trophy, switch materials, add engraving and your logo, then view it in AR.
        </p>
      </div>
      <Editor3DLoader product={product} designId={design} preferredVariantId={variant} />
    </div>
  )
}
