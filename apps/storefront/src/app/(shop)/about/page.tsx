import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { EditorialEyebrow } from "@/components/layout/editorial/editorial-eyebrow"
import { EditorialFrame, EditorialShell } from "@/components/layout/editorial/editorial-shell"
import { EditorialCtaLink, EditorialTextLink } from "@/components/layout/editorial/editorial-cta"
import { EditorialWatermark } from "@/components/layout/editorial/editorial-watermark"
import { BRAND, BRAND_STATS } from "@/lib/brand-facts"

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Trophy Heaven is a Bengaluru trophy atelier crafting crystal, metal, and hardwood awards with Indian heritage craftsmanship.",
  alternates: { canonical: "/about" },
}

const STATS = BRAND_STATS

const DISCIPLINES = [
  {
    title: "Figure awards",
    href: "/products/ascent-figure-award",
    image: "/images/catalog/trophy-figure-award.webp",
    alt: "Gilt figure award on an octagonal mahogany base",
    copy: "Cast and gilded figures on hardwood plinths, for ceremonies that should last.",
  },
  {
    title: "Statuettes",
    href: "/products/achievement-statuette",
    image: "/images/catalog/trophy-achievement-statuette.webp",
    alt: "Gilded figure statuette on a black marble plinth",
    copy: "Polished brass on marble — the award that sits on a desk for decades.",
  },
  {
    title: "Engraved plaques",
    href: "/customize",
    image: "/images/catalog/plaque-studio.webp",
    alt: "Engraved wooden award plaque with a brass plate",
    copy: "Seasoned hardwood and a brass plate, laid out by you in the design studio.",
  },
] as const

export default function AboutPage() {
  return (
    <EditorialShell>
      <section id="story" className="relative scroll-mt-[7rem] overflow-hidden border-b border-[#131111]/10">
        <EditorialFrame className="pt-[clamp(2.5rem,6vw,5em)] pb-[clamp(2.5rem,6vw,5em)]">
          <div className="grid items-center gap-[2.5em] lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:min-h-[32em] lg:gap-16">
            <div className="relative z-10 max-w-[32em]">
              <EditorialWatermark>heaven</EditorialWatermark>
              <EditorialEyebrow>What we do & about us</EditorialEyebrow>
              <h1 className="relative m-0 mt-[1em] font-outfit text-[clamp(2.25rem,5vw,3.75em)] leading-[1.1] font-normal tracking-[-0.04em] text-balance text-[#131111]">
                Crafted with intention. Built to last.
              </h1>
              <p className="mt-[1.5em] m-0 font-outfit text-[1.125em] leading-[1.4] font-normal tracking-[-0.02em] text-[#131111]/70">
                A {BRAND.city} atelier where trophies and awards are made with patience — for
                ceremonies, teams, and achievements that deserve permanence.
              </p>
              <div className="mt-[2em]">
                <EditorialTextLink href="/shop">Shop the collection →</EditorialTextLink>
              </div>
            </div>

            <div className="relative aspect-[5/4] w-full overflow-hidden rounded-[0.125em] bg-[#D9D9D9] lg:aspect-[6/5]">
              <Image
                src="/images/hero/hero-workshop.webp"
                alt="Trophy workshop bench with brass tools in warm, low light"
                fill
                preload
                sizes="(min-width: 1024px) 48em, 100vw"
                className="object-cover object-center"
              />
            </div>
          </div>
        </EditorialFrame>
      </section>

      <section className="border-b border-[#131111]/10">
        <EditorialFrame className="pt-[clamp(2.5rem,5vw,4.25em)] pb-[clamp(2.5rem,5vw,4.25em)]">
          <p className="m-0 font-outfit text-[clamp(0.875em,1.39vw,1.25em)] leading-[1.25em] font-normal tracking-[-0.02em] text-[#131111] uppercase">
            //Trophy Heaven in numbers
          </p>
          <div className="mt-[2em] flex flex-wrap items-start justify-between gap-y-[1.25em] sm:flex-nowrap">
            {STATS.map((stat, i) => (
              <div key={stat.value} className="flex items-start">
                {i > 0 ? (
                  <span
                    aria-hidden
                    className="mx-[1.1em] hidden h-[6.375em] w-0 shrink-0 border-l-[0.125em] border-[#131111] lg:block"
                    style={{ transform: "rotate(7deg)" }}
                  />
                ) : null}
                <div className="flex w-[12em] flex-col gap-[0.375em]">
                  <p className="m-0 font-outfit text-[clamp(2em,4.5vw,4.0625em)] leading-[1.1] font-normal tracking-[-0.03em] text-[#131111]">
                    {stat.value}
                  </p>
                  <p className="m-0 font-outfit text-[0.875em] leading-[1.4] font-normal tracking-[-0.02em] text-[#131111]">
                    {stat.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </EditorialFrame>
      </section>

      <section id="sustainability" className="scroll-mt-[7rem] border-b border-[#131111]/10">
        <EditorialFrame className="pt-[clamp(2.5rem,5vw,4.25em)] pb-[clamp(2.5rem,5vw,4.25em)]">
          <p className="m-0 font-outfit text-[clamp(0.875em,1.39vw,1.25em)] leading-[1.25em] font-normal tracking-[-0.02em] text-[#131111] uppercase">
            //Materials
          </p>
          <div className="mt-[1.5em] grid grid-cols-1 gap-[2em] lg:grid-cols-12">
            <h2 className="m-0 max-w-[12em] font-outfit text-[clamp(1.75em,4vw,3em)] leading-[1.15] font-normal tracking-[-0.03em] text-balance text-[#131111] lg:col-span-5">
              Built to last, not to replace
            </h2>
            <p className="m-0 max-w-[36em] font-outfit text-[1.125em] leading-[1.5] tracking-[-0.02em] text-[#131111]/70 lg:col-span-7">
              Cast brass, optical crystal, seasoned hardwood. Materials we can stand behind.
              Awards leave the workshop finished by hand so they can be displayed for decades — not
              boxed up after the ceremony. Offcuts become samples; packing is sized to the piece, not the
              pallet.
            </p>
          </div>
        </EditorialFrame>
      </section>

      <EditorialFrame>
        <h2 className="m-0 max-w-[22em] font-outfit text-[clamp(1.75em,4vw,3.375em)] leading-[1.2] font-normal tracking-[-0.02em] text-balance text-[#131111]">
          One standard, every award
        </h2>
        <div className="mt-[clamp(2em,4vw,3.75em)] grid grid-cols-1 gap-[2em] lg:grid-cols-3">
          {DISCIPLINES.map((item) => (
            <Link key={item.title} href={item.href} className="group block no-underline">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[0.125em] bg-[#D9D9D9]">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="(min-width: 90rem) 27rem, 100vw"
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <h3 className="mt-[1em] m-0 font-outfit text-[1.5em] leading-[1.25em] font-light tracking-[-0.02em] text-balance text-[#131111] uppercase">
                {item.title}
              </h3>
              <p className="mt-[0.5em] m-0 font-outfit text-[1em] leading-[1.4] tracking-[-0.02em] text-[#131111]/70">
                {item.copy}
              </p>
            </Link>
          ))}
        </div>
      </EditorialFrame>

      <section className="relative mx-auto w-full max-w-[90em] px-[clamp(1.25rem,2.78vw,2.5em)] pb-[clamp(3.5rem,8vw,7em)]">
        <div className="relative aspect-[1360/664] w-full overflow-hidden rounded-[0.125em]">
          <Image
            src="/images/hero/hero-workshop.webp"
            alt="Artisan shaping timber in the atelier"
            fill
            sizes="(min-width: 90rem) 85rem, 100vw"
            className="object-cover object-center"
          />
        </div>
        <p className="pointer-events-none m-0 mt-[-0.2em] text-center font-outfit text-[clamp(1.85em,8.95vw,8.059em)] leading-[0.74] font-medium tracking-[-0.054em] text-[#131111]">
          From workshop to stage
        </p>
        <div className="mx-auto mt-[2em] flex max-w-[34em] flex-col items-center gap-[1.5em] text-center">
          <p className="m-0 font-outfit text-[1em] leading-[1.4] tracking-[-0.02em] text-[#131111]">
            Whether a single desk award or a hundred custom trophies, the same rules apply: clean
            silhouette, honest material, and a finish you can feel with your eyes closed.
          </p>
          <EditorialCtaLink href="/contact">Commission a piece</EditorialCtaLink>
        </div>
      </section>
    </EditorialShell>
  )
}
