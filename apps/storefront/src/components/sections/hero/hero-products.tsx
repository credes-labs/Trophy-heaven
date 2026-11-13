import Image from "next/image"

/** Same framed stills, scaled down so the poster headline stays the subject. */
export function HeroProducts() {
  return (
    <div className="flex items-end gap-3">
      <div className="relative h-[112px] w-[96px] overflow-clip rounded-[2px] border-[4px] border-white lg:h-[168px] lg:w-[144px] lg:border-[5px]">
        <Image
          src="/images/catalog/trophy-achievement-statuette.webp"
          alt="Gilded figure statuette on a black marble plinth"
          fill
          sizes="144px"
          className="object-cover"
        />
      </div>
      <div className="relative h-[84px] w-[128px] overflow-clip rounded-[2px] border-2 border-white lg:h-[126px] lg:w-[190px]">
        <Image
          src="/images/catalog/plaque-engraved.webp"
          alt="Engraved wooden award plaque with a brass plate"
          fill
          sizes="190px"
          className="object-cover"
        />
      </div>
    </div>
  )
}
