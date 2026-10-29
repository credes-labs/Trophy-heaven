import Image from "next/image"

export function AboutPortrait() {
  return (
    <div className="relative h-[17.625em] w-full max-w-[15.125em] overflow-hidden rounded-[0.125em] lg:w-[15.125em]">
      <Image
        src="/images/about/about-legacy-portrait.webp"
        alt="Walnut lounge chair with bouclé upholstery beside a marble side table"
        fill
        sizes="(min-width: 1024px) 15.125em, 80vw"
        className="object-cover object-center"
      />
    </div>
  )
}
