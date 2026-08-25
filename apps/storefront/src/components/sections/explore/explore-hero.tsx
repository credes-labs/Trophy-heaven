import Image from "next/image"

import { EXPLORE_HERO } from "./constants"

export function ExploreHero() {
  return (
    <div className="relative mt-[2.5em] aspect-[1360/634] w-full overflow-hidden rounded-[0.125em] bg-[#131111]">
      <Image
        src={EXPLORE_HERO.src}
        alt={EXPLORE_HERO.alt}
        fill
        priority={false}
        sizes="(min-width: 1024px) 85em, 100vw"
        className="object-cover object-center motion-safe:animate-[exploreKenBurns_22s_ease-out_forwards]"
      />
    </div>
  )
}
