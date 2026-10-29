import Image from "next/image"

/** Full-bleed hero photograph, placed as supplied. */
export function HeroStudioImage() {
  return (
    <div className="absolute inset-0 z-0 bg-[#1C1612]">
      <Image
        src="/images/hero/hero-legacy-tables.jpg"
        alt=""
        aria-hidden
        fill
        priority
        sizes="100vw"
        className="object-cover object-left lg:object-center"
      />
    </div>
  )
}
