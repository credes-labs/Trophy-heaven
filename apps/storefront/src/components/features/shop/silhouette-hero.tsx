"use client"

import dynamic from "next/dynamic"

/**
 * Catalogue hero: the transparent silhouette band sits directly on the shop's
 * `#F2F1EF` surface, so only the hairlines and turning pieces read.
 * `three` is split into its own chunk and never server-rendered.
 */
const SilhouetteGrid = dynamic(() => import("./silhouette-grid"), {
  ssr: false,
  loading: () => <div className="aspect-[2/1] w-full" aria-hidden />,
})

export function SilhouetteHero() {
  return (
    <section className="bg-[#F2F1EF]">
      <div className="mx-auto w-full max-w-[90em] px-[clamp(1.25rem,2.78vw,2.5em)] pt-[clamp(2rem,4vw,3.5em)] pb-[clamp(1.5rem,3vw,2.5em)]">
        <SilhouetteGrid ink="#131111" />
      </div>
    </section>
  )
}
