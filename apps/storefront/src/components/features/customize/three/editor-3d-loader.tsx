"use client"

import dynamic from "next/dynamic"
import type { HttpTypes } from "@medusajs/types"
import type { DesignRecord } from "@/lib/design-client"

// R3F/three touch WebGL + window, so the 3D editor is client-only (ssr:false).
const Editor3D = dynamic(() => import("./editor-3d").then((m) => m.Editor3D), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] items-center justify-center rounded-lg border border-border text-muted-foreground">
      Loading the 3D studio…
    </div>
  ),
})

export function Editor3DLoader({
  product,
  initialDesign,
}: {
  product: HttpTypes.StoreProduct
  initialDesign?: DesignRecord | null
}) {
  return <Editor3D product={product} initialDesign={initialDesign} />
}
