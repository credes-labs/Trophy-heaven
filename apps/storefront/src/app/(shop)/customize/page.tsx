import type { Metadata } from "next"
import { EditorialShell } from "@/components/layout/editorial/editorial-shell"
import { PlaqueConfigurator } from "@/components/features/customize/configurator/plaque-configurator"
import { getProductByHandle } from "@/lib/data/catalog"
import { PLAQUE_HANDLE, parseConfig } from "@/lib/configurator/plaque"
import { toPlaqueVariants } from "@/lib/configurator/variants"

export const metadata: Metadata = {
  title: "Design Studio",
  description:
    "Compose an engraved plaque in 3D — choose the form, timber, finish, plate, emblem and lettering, lay out logos in 2D, and share the design before we cut.",
  alternates: { canonical: "/customize" },
}

export default async function CustomizeLandingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [params, product] = await Promise.all([searchParams, getProductByHandle(PLAQUE_HANDLE)])
  const variants = toPlaqueVariants(product)

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
