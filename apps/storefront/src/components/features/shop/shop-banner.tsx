import Image from "next/image"
import { SHOP_BANNER } from "./constants"

export function ShopBanner() {
  return (
    <div className="relative mt-[clamp(3.5rem,8vw,6.5em)] aspect-[1360/480] w-full overflow-hidden rounded-[0.125em] bg-[#D9D9D9]">
      <Image
        src={SHOP_BANNER.src}
        alt={SHOP_BANNER.alt}
        fill
        sizes="(min-width: 1024px) 85em, 100vw"
        className="object-cover"
      />
    </div>
  )
}
