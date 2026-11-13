import Image from "next/image"

/** Same framed stills, scaled down so the poster headline stays the subject. */
export function HeroProducts() {
  return (
    <div className="flex items-end gap-3">
      <div className="relative h-[112px] w-[96px] overflow-clip rounded-[2px] border-[4px] border-white lg:h-[168px] lg:w-[144px] lg:border-[5px]">
        <Image
          src="/images/hero/hero-legacy-chair.webp"
          alt="Walnut armchair with oatmeal upholstery in a warm interior"
          fill
          sizes="144px"
          className="object-cover"
        />
      </div>
      <div className="relative h-[84px] w-[128px] overflow-clip rounded-[2px] border-2 border-white lg:h-[126px] lg:w-[190px]">
        <Image
          src="/images/hero/hero-legacy-sideboard.webp"
          alt="Asymmetrical walnut sideboard with dimension annotations"
          fill
          sizes="190px"
          className="object-cover"
        />
      </div>
    </div>
  )
}
