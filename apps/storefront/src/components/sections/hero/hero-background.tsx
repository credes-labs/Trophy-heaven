import { getImageProps } from "next/image"

/** Art-directed sources keep the award visible on portrait screens. */
export function HeroStudioImage() {
  const shared = { alt: "", fill: true, sizes: "100vw", loading: "eager" as const, fetchPriority: "high" as const }
  const { props: mobile } = getImageProps({ ...shared, src: "/images/catalog/trophy-figure-award.webp" })
  const { props: desktop } = getImageProps({ ...shared, src: "/images/catalog/trophy-figure-award.webp" })
  return (
    <div className="absolute inset-0 z-0 bg-[#1C1612]">
      <picture className="absolute inset-x-0 top-0 block h-[65svh] lg:h-full">
        <source media="(max-width: 1023px)" srcSet={mobile.srcSet} sizes={mobile.sizes} />
        {/* getImageProps supplies Next's optimized responsive URLs to this picture. */}
        <img {...desktop} alt="" aria-hidden className="object-cover object-[center_28%] lg:object-[center_12%]" />
      </picture>
      <div className="absolute inset-x-0 top-0 h-[65svh] bg-gradient-to-t from-[#1C1612] via-transparent to-transparent lg:hidden" />
    </div>
  )
}
