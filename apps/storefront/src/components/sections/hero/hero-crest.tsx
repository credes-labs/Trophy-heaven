/**
 * Figma Vector (1).svg — 1377×682 node with the left half clipped by the
 * 1440 frame (exported as 688×682). Sits after Collection / before the logo
 * frame, overlapping the studio photo. Mix-blend is applied in CSS so it
 * composites with the photo (SVG-internal blend does not apply to <img>).
 */
export function HeroCrest() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute top-[96px] left-0 z-[1] h-[682px] w-[688px] overflow-hidden"
    >
      <img
        src="/images/brand/legacy-crest.svg"
        alt=""
        width={688}
        height={682}
        className="size-full max-w-none object-cover object-left mix-blend-luminosity"
      />
    </div>
  )
}
