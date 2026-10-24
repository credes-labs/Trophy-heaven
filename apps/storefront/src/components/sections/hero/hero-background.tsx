import Image from "next/image"

/**
 * Full-bleed cover. `object-[42%_center]` keeps the armchair on the right
 * and crops the source's top-right monogram so it doesn't sit under the nav.
 */
export function HeroStudioImage() {
  return (
    <div className="absolute inset-0 z-0 bg-[#1C1612]">
      <Image
        src="/images/hero/hero-legacy-studio.jpg"
        alt=""
        aria-hidden
        fill
        priority
        sizes="100vw"
        className="object-cover object-[42%_center]"
      />
    </div>
  )
}
