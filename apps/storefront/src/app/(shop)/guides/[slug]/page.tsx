import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { SimplePageHero } from "@/components/layout/editorial/simple-page-hero"
import { EditorialFrame, EditorialShell } from "@/components/layout/editorial/editorial-shell"
import { EditorialTextLink } from "@/components/layout/editorial/editorial-cta"

const GUIDES = {
  size: {
    title: "Size guide",
    body: "Heights, footprints, and podium clearances for trophies and plaques.",
    sections: [
      {
        h: "Trophies",
        p: "Desk awards typically sit 150–250mm. Podium pieces run taller — tell us the stage height when you brief.",
      },
      {
        h: "Plaques",
        p: "Wall plaques list overall size and engraving area. Desk plaques include the depth of the foot.",
      },
    ],
  },
  care: {
    title: "Care guide",
    body: "How to look after crystal, brass, walnut, marble, and acrylic without shortening their life.",
    sections: [
      {
        h: "Crystal & brass",
        p: "Soft cloth, no abrasives. Brass will darken — polish only if you prefer a bright finish.",
      },
      {
        h: "Timber, marble & acrylic",
        p: "Keep walnut bases out of standing water. Wipe marble dry. Clean acrylic with water and a microfibre cloth — never solvents.",
      },
    ],
  },
  customization: {
    title: "Customization guide",
    body: "How the 2D/3D studio works — from template to approved engraving.",
    sections: [
      {
        h: "In the studio",
        p: "Choose a plate, set type, place a logo, and read the engraving at actual size. Share the link for sign-off.",
      },
      {
        h: "Into production",
        p: "We cut only after you approve. Changes after approval may extend lead time.",
      },
    ],
  },
} as const

type GuideSlug = keyof typeof GUIDES

export function generateStaticParams() {
  return Object.keys(GUIDES).map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const guide = GUIDES[slug as GuideSlug]
  if (!guide) return { title: "Guide" }
  return {
    title: guide.title,
    description: guide.body,
    alternates: { canonical: `/guides/${slug}` },
  }
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const guide = GUIDES[slug as GuideSlug]
  if (!guide) notFound()

  return (
    <EditorialShell>
      <SimplePageHero eyebrow="Guides" watermark="guide" title={guide.title} body={guide.body} />
      <EditorialFrame>
        <div className="mb-[2em] flex flex-wrap gap-[1em]">
          {(Object.keys(GUIDES) as GuideSlug[]).map((key) => (
            <EditorialTextLink key={key} href={`/guides/${key}`} className={key === slug ? "opacity-100" : "text-[#6B635C]"}>
              {GUIDES[key].title}
            </EditorialTextLink>
          ))}
        </div>
        <div className="grid gap-[2em] lg:grid-cols-2">
          {guide.sections.map((section) => (
            <article key={section.h}>
              <h2 className="m-0 font-outfit text-[1.35em] font-normal tracking-[-0.02em] text-balance text-[#131111]">
                {section.h}
              </h2>
              <p className="mt-[0.75em] m-0 font-outfit text-[1em] leading-[1.5] text-[#6B635C]">
                {section.p}
              </p>
            </article>
          ))}
        </div>
      </EditorialFrame>
    </EditorialShell>
  )
}
