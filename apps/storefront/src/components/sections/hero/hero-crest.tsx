/**
 * Oversized "T" monogram watermark that sits behind the hero copy and
 * overlaps the studio photo. Mix-blend composites it with the photo.
 */
export function HeroCrest() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute top-[96px] left-0 z-[1] flex h-[682px] w-[688px] items-center overflow-hidden"
    >
      <span className="-ml-[12%] font-serif text-[760px] leading-none font-semibold text-[#F2F1EF]/25 mix-blend-luminosity select-none">
        T
      </span>
    </div>
  )
}
