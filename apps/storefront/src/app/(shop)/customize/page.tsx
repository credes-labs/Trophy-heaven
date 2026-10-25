import type { Metadata } from "next"
import { EditorialShell } from "@/components/layout/editorial/editorial-shell"
import { PlaqueConfigurator } from "@/components/features/customize/configurator/plaque-configurator"
import { getProductByHandle } from "@/lib/data/catalog"
import { variantInStock } from "@/lib/product-filters"
import { PLAQUE_HANDLE, parseConfig, type PlaqueVariant } from "@/lib/configurator/plaque"

export const metadata: Metadata = {
  title: "Design Studio",
  description:
    "Compose an engraved plaque in 3D — choose the form, timber, plate and lettering, read your engraving at size, and share the design before we cut.",
  alternates: { canonical: "/customize" },
}

export default async function CustomizeLandingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [params, product] = await Promise.all([searchParams, getProductByHandle(PLAQUE_HANDLE)])
  const sizeOptionId = product?.options?.find((o) => /size/i.test(o.title ?? ""))?.id
  const variants: PlaqueVariant[] = (product?.variants ?? []).map((v) => ({
    id: v.id,
    sizeLabel:
      v.options?.find((o) => o.option_id === sizeOptionId)?.value ?? v.options?.[0]?.value ?? v.title ?? "",
    amount: v.calculated_price?.calculated_amount ?? null,
    currency: v.calculated_price?.currency_code ?? "inr",
    inStock: variantInStock(v),
  }))

  return (
    <EditorialShell className="h-dvh overflow-hidden">
      <PlaqueConfigurator
        product={product ? { id: product.id, title: product.title ?? "Engraved plaque", handle: product.handle ?? PLAQUE_HANDLE } : null}
        variants={variants}
        initialConfig={parseConfig(params)}
      />
    </EditorialShell>
  )
}
