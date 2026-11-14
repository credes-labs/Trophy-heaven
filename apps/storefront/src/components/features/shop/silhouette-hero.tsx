"use client"

import dynamic from "next/dynamic"

/**
 * Shop band under the testimonials: the transparent silhouette band sits directly on the shop's
 * `#F2F1EF` surface, so only the hairlines and turning pieces read.
 * `three` is split into its own chunk and never server-rendered.
 */
const SilhouetteGrid = dynamic(() => import("./silhouette-grid"), {
  ssr: false,
  loading: () => <div className="aspect-[2/1] w-full" aria-hidden />,
})

export function SilhouetteHero() {
  return (
    <section aria-hidden className="bg-white pt-[clamp(2.5rem,5vw,4.5em)]">
      <SilhouetteGrid ink="#131111" />
    </section>
  )
}
