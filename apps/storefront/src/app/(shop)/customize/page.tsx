import type { Metadata } from "next"
import { EditorialShell } from "@/components/layout/editorial/editorial-shell"
import { PlaqueConfigurator } from "@/components/features/customize/configurator/plaque-configurator"
import { getProductByHandle } from "@/lib/data/catalog"
import { PLAQUE_HANDLE, parseConfig, sizeForVariant } from "@/lib/configurator/plaque"
import { toPlaqueVariants } from "@/lib/configurator/variants"

export const metadata: Metadata = {
  title: "Design Studio",
  description:
    "Compose an engraved plaque in 3D — choose the form, timber, finish, plate, emblem and lettering, lay out logos in 2D, and share the design before we cut.",
  alternates: { canonical: "/customize" },
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

export default async function CustomizeLandingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [params, product] = await Promise.all([searchParams, getProductByHandle(PLAQUE_HANDLE)])
  const variants = toPlaqueVariants(product)
  const config = parseConfig(params)
  // A `variant` id (PDP links, saved 2D links) is the source of truth for size.
  const size = sizeForVariant(variants, first(params.variant)) ?? config.size

  return (
    <EditorialShell className="fixed inset-0 z-30 h-dvh overflow-hidden overscroll-none">
      <PlaqueConfigurator
        product={
          product
            ? {
                id: product.id,
                title: product.title ?? "Engraved plaque",
                handle: product.handle ?? PLAQUE_HANDLE,
                thumbnail: product.thumbnail ?? null,
              }
            : null
        }
        variants={variants}
        initialConfig={{ ...config, size }}
        initialMode={first(params.mode) === "2d" ? "2d" : "3d"}
        designId={first(params.design)}
      />
    </EditorialShell>
  )
}
