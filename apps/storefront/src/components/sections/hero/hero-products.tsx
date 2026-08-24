import Image from "next/image"

/** Bottom-left product frames — 242×284 (6px stroke) and 320×212. */
export function HeroProducts() {
  return (
    <div className="flex items-end gap-3">
      <div className="relative h-[180px] w-[154px] overflow-clip rounded-[2px] border-[6px] border-white lg:h-[284px] lg:w-[242px]">
        <Image
          src="/images/hero/hero-legacy-chair.png"
          alt="Walnut armchair with oatmeal upholstery in a warm interior"
          fill
          sizes="242px"
          className="object-cover"
        />
      </div>
      <div className="relative h-[134px] w-[202px] overflow-clip rounded-[2px] border-2 border-white lg:h-[212px] lg:w-[320px]">
        <Image
          src="/images/hero/hero-legacy-sideboard.png"
          alt="Asymmetrical walnut sideboard with dimension annotations"
          fill
          sizes="320px"
          className="object-cover"
        />
      </div>
    </div>
  )
}
