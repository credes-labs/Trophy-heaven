import Image from "next/image"

/** Full-bleed studio. The chair cutout sits in front of this, over the headline. */
export function HeroStudioImage() {
  return (
    <div className="absolute inset-0 z-0 bg-[#1C1612]">
      <Image
        src="/images/hero/hero-legacy-studio.png"
        alt=""
        aria-hidden
        fill
        priority
        sizes="100vw"
        className="object-cover object-[22%_center]"
      />
    </div>
  )
}
