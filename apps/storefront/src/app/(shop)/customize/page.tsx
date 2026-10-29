import type { Metadata } from "next"
import { EditorialShell } from "@/components/layout/editorial/editorial-shell"
import { PlaqueConfigurator } from "@/components/features/customize/configurator/plaque-configurator"
import { getProductByHandle } from "@/lib/data/catalog"
import { PLAQUE_HANDLE, parseConfig, sizeForVariant } from "@/lib/configurator/plaque"
import { initialStudioPiece, studioPiece } from "@/lib/configurator/studio-pieces"
import { toPlaqueVariants } from "@/lib/configurator/variants"

export const metadata: Metadata = {
  title: "Design Studio",
  description: "Personalise a figure award or wooden plaque. Compose the engraving in 2D and inspect your trophy in 3D.",
  alternates: { canonical: "/customize" },
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

export default async function CustomizeLandingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const piece = studioPiece(initialStudioPiece(params))
  const product = await getProductByHandle(piece.handle)
  const award = piece.id === "plaque" ? undefined : piece.id
  const variants = toPlaqueVariants(product)
  const config = parseConfig(params)
  // A `variant` id (PDP links, saved 2D links) is the source of truth for size.
  const size = award ? "m" : (sizeForVariant(variants, first(params.variant)) ?? config.size)

  return (
    <EditorialShell className="fixed inset-0 z-30 h-dvh overflow-hidden overscroll-none">
      <PlaqueConfigurator
        key={piece.id}
        award={award}
        restoreDraft={!first(params.face)}
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
        initialConfig={{
          ...config,
          size,
          ...(award
            ? ({ pshape: "rect", art: "plate", emblem: "none", mount: "desk" } as const)
            : {}),
        }}
        initialMode={first(params.mode) === "2d" ? "2d" : "3d"}
        designId={first(params.design)}
      />
    </EditorialShell>
  )
}
