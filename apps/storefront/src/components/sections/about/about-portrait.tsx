import Image from "next/image"

export function AboutPortrait() {
  return (
    <div className="relative h-[17.625em] w-full max-w-[15.125em] overflow-hidden rounded-[0.125em] lg:w-[15.125em]">
      <Image
        src="/images/catalog/trophy-achievement-statuette.webp"
        alt="Gilded figure statuette on a black marble plinth"
        fill
        sizes="(min-width: 1024px) 15.125em, 80vw"
        className="object-cover object-center"
      />
    </div>
  )
}
