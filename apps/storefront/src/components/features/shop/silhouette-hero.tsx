"use client"

import dynamic from "next/dynamic"

/**
 * Shop band under the testimonials, closing the page: the transparent silhouette band sits on
 * the white surface in logo maroon (the hero wordmark colour), lines and turning pieces alike.
 * `three` is split into its own chunk and never server-rendered.
 */
const SilhouetteGrid = dynamic(() => import("./silhouette-grid"), {
  ssr: false,
  loading: () => <div className="aspect-[2/1] w-full" aria-hidden />,
})

export function SilhouetteHero() {
  return (
    <section aria-hidden className="bg-white pt-[clamp(2.5rem,5vw,4.5em)]">
      <SilhouetteGrid ink="#4A1F1B" />
    </section>
  )
}
