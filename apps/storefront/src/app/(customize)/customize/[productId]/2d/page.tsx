import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getProductById } from "@/lib/data/catalog"
import { EditorialShell } from "@/components/layout/editorial/editorial-shell"
import { Editor2DLoader } from "@/components/features/customize/editor-2d-loader"
import { PLAQUE_HANDLE, parseConfig, sizeForVariant } from "@/lib/configurator/plaque"
import { toPlaqueVariants } from "@/lib/configurator/variants"

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
  const design = first(query.design)
  const variant = first(query.variant)

  // The engraved plaque shares its configuration with the 3D studio; the
  // `variant` id is the source of truth for size so both modes price the same.
  let plaque = null
  if (product.handle === PLAQUE_HANDLE) {
    const variants = toPlaqueVariants(product)
    const config = parseConfig(query)
    plaque = { variants, config: { ...config, size: sizeForVariant(variants, variant) ?? config.size } }
  }

  return (
    <EditorialShell className="h-dvh overflow-hidden">
      <Editor2DLoader product={product} designId={design} preferredVariantId={variant} plaque={plaque} />
    </EditorialShell>
  )
}
