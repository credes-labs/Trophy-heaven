import Image from "next/image"

/**
 * Cutout in front of the lower headline lines. Below `lg` it follows the
 * headline in flow and is pulled up over the last lines. From `lg` it is
 * placed on the headline band. Nav and the actions stay above it.
 */
export function HeroChair() {
  return (
    <div
      aria-hidden
      className="pointer-events-none relative z-20 -mt-16 ml-auto w-[min(78%,18rem)] lg:absolute lg:top-[54%] lg:right-auto lg:bottom-auto lg:left-[30%] lg:mt-0 lg:ml-0 lg:w-[min(38vw,34rem)]"
    >
      <Image
        src="/images/hero/chair.webp"
        alt=""
        width={757}
        height={633}
        sizes="(min-width: 1024px) 34rem, 42vw"
        className="h-auto w-full drop-shadow-[0_20px_28px_rgba(0,0,0,0.45)]"
      />
    </div>
  )
}
