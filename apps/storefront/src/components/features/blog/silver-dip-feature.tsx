import Image from "next/image"
import Link from "next/link"

export const SILVER_DIP_SLUG = "dipped-in-silver"

const STEPS = [
  {
    n: "01",
    title: "Polish",
    body: "Every figure is hand-polished first. Silver shows every mark underneath it, so the surface has to be clean before it goes in.",
  },
  {
    n: "02",
    title: "Dip",
    body: "The piece is lowered into the bath and takes on an even skin of silver across every fold, ring and edge.",
  },
  {
    n: "03",
    title: "Seal",
    body: "A clear protective lacquer goes on last, so the shine lasts on a shelf and in a boardroom without tarnishing.",
  },
] as const

/**
 * News feature on /blog: a visual story about silver-dipped trophies. The page is
 * static, so it still renders when the Medusa post hasn't been seeded; the
 * "Read the story" link points to the seeded article (`seed-content.ts`).
 */
export function SilverDipFeature() {
  return (
    <section aria-labelledby="silver-dip-title" className="border-b border-[#131111]/10">
      <div className="mx-auto w-full max-w-[90em] px-[clamp(1.25rem,2.78vw,2.5em)] py-[clamp(2.5rem,5vw,4.5em)]">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <p className="m-0 font-outfit text-[0.75em] tracking-[0.14em] text-[#131111] uppercase">
            News · New finish
          </p>
          <p className="m-0 font-outfit text-[0.75em] tracking-[0.14em] text-[#6B635C] uppercase">
            A visual story
          </p>
        </div>

        <div className="mt-[clamp(1.5em,3vw,2.5em)] grid gap-[clamp(1.5em,3vw,2.5em)] lg:grid-cols-12">
          <figure className="relative m-0 overflow-hidden bg-[#F3F3F3] lg:col-span-8">
            <div className="relative aspect-[16/9]">
              <Image
                src="/images/news/news-silver-dipped.webp"
                alt="A figure award and a statuette, both dipped in silver, standing side by side"
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
            </div>
          </figure>

          <div className="flex flex-col justify-between gap-[2em] lg:col-span-4">
            <div>
              <h2
                id="silver-dip-title"
                className="m-0 font-outfit text-[clamp(2rem,4vw,3.25em)] leading-[1.05] font-normal tracking-[-0.04em] text-balance text-[#131111]"
              >
                Trophies, dipped in silver
              </h2>
              <p className="mt-[1.25em] m-0 font-outfit text-[1.0625em] leading-[1.45] tracking-[-0.02em] text-[#131111]/70">
                Our figure awards and statuettes now come in a full silver dip. It is the same
                sculpted form, finished in a cool, bright metal that reads as quiet and modern.
              </p>
            </div>
            <Link
              href={`/blog/${SILVER_DIP_SLUG}`}
              className="inline-flex h-[3em] w-fit items-center border border-[#131111] px-[1.5em] font-outfit text-[0.75em] tracking-[0.14em] text-[#131111] uppercase no-underline transition-colors hover:bg-[#131111] hover:text-white"
            >
              Read the story
            </Link>
          </div>
        </div>

        <div className="mt-[clamp(1.5em,3vw,2.5em)] grid gap-[clamp(1.5em,3vw,2.5em)] md:grid-cols-12">
          <figure className="relative m-0 bg-[#F3F3F3] md:col-span-3">
            <div className="relative aspect-[4/5]">
              <Image
                src="/images/news/news-silver-figure.webp"
                alt="Silver-dipped figure award on a mahogany base"
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover"
              />
            </div>
          </figure>
          <figure className="relative m-0 bg-[#F3F3F3] md:col-span-3">
            <div className="relative aspect-[4/5]">
              <Image
                src="/images/news/news-silver-statuette.webp"
                alt="Silver-dipped statuette on a black marble plinth"
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover"
              />
            </div>
          </figure>
          <ol className="m-0 grid list-none content-start gap-[1.75em] p-0 md:col-span-6 md:pl-[clamp(0em,2vw,2em)]">
            {STEPS.map((step) => (
              <li key={step.n} className="grid grid-cols-[3em_1fr] border-t border-[#131111]/12 pt-[1em]">
                <span className="font-outfit text-[0.8125em] text-[#6B635C] tabular-nums">{step.n}</span>
                <div>
                  <h3 className="m-0 font-outfit text-[1.125em] font-normal tracking-[-0.02em] text-[#131111]">
                    {step.title}
                  </h3>
                  <p className="mt-[0.4em] m-0 font-outfit text-[0.9375em] leading-[1.45] tracking-[-0.01em] text-[#131111]/70">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
