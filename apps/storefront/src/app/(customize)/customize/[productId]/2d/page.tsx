import { notFound, redirect } from "next/navigation"
import type { Metadata } from "next"
import { getProductById } from "@/lib/data/catalog"
import { EditorialShell } from "@/components/layout/editorial/editorial-shell"
import { Editor2DLoader } from "@/components/features/customize/editor-2d-loader"
import { studioPieceForHandle } from "@/lib/configurator/studio-pieces"

export const metadata: Metadata = {
  title: "Customize your design",
  robots: { index: false },
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

export default async function Customize2DPage({
  params,
  searchParams,
}: {
  params: Promise<{ productId: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [{ productId }, query] = await Promise.all([params, searchParams])
  const product = await getProductById(productId)
  if (!product) notFound()

  // The engraved plaque's 2D layout lives inside the studio, next to its 3D preview.
  const piece = studioPieceForHandle(product.handle)
  if (piece) {
    const next = new URLSearchParams()
    next.set("piece", piece.id)
    for (const [key, value] of Object.entries(query)) {
      const v = first(value)
      if (v != null && key !== "mode") next.set(key, v)
    }
    next.set("mode", "2d")
    redirect(`/customize?${next.toString()}`)
  }

  return (
    <EditorialShell className="h-dvh overflow-hidden">
      <Editor2DLoader
        product={product}
        designId={first(query.design)}
        preferredVariantId={first(query.variant)}
      />
    </EditorialShell>
  )
}
