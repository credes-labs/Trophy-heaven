import Image from "next/image"

/**
 * Full-bleed cover. `object-[80%_center]` keeps the armchair on the right
 * while cropping ~20% off the source's right edge (not flush `object-right`).
 */
export function HeroStudioImage() {
  return (
    <div className="absolute inset-0 z-0 bg-[#1C1612]">
      <Image
        src="/images/hero/hero-legacy-studio.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[80%_center]"
      />
    </div>
  )
}
