import Link from "next/link"
import { SectionEyebrow, SectionShell } from "@/components/sections/_editorial"
import { listCategories, countProductsByCategory, collectCategoryIds } from "@/lib/data/catalog"
import { CATEGORY_CONFIG } from "@/lib/category-config"

/** Trophy collections, keyed by their seeded Medusa subcategory handle. */
type CollectionKey = "crystal" | "metal" | "acrylic"

const ORDER: CollectionKey[] = ["crystal", "metal", "acrylic"]

const ACCENTS: Record<CollectionKey, string> = {
  crystal: "#8A2D25",
  metal: "#8A7550",
  acrylic: "#331207",
}

const COPY: Record<CollectionKey, { label: string; title: string; body: string }> = {
  crystal: {
    label: "Crystal",
    title: "Light, cut into form.",
    body: "Optical crystal faceted and polished until the engraving seems to float inside it.",
  },
  metal: {
    label: "Metal",
    title: "Awards that hold their weight.",
    body: "Cast brass and gilt figures on hardwood plinths — engraved to the name, dated to the day.",
  },
  acrylic: {
    label: "Acrylic",
    title: "Clear, bold, built for teams.",
    body: "Precision-cut acrylic honours for leagues, schools, and corporate programmes at volume.",
  },
}

export async function DisciplinesSection() {
  let counts: Record<string, number> = { crystal: 0, metal: 0, acrylic: 0 }
  try {
    const categories = await listCategories()
    const byHandle = Object.fromEntries(categories.map((c) => [c.handle, c]))
    const idsByKey: Record<string, string[]> = {}
    for (const key of ORDER) idsByKey[key] = collectCategoryIds(byHandle[key] ?? null)
    counts = await countProductsByCategory(idsByKey)
  } catch {
    // empty counts when Medusa is down
  }
  const trophiesHref = CATEGORY_CONFIG.trophies.href

  return (
    <SectionShell id="disciplines" aria-labelledby="disciplines-heading">
      <SectionEyebrow>three collections</SectionEyebrow>
      <h2
        id="disciplines-heading"
        className="mt-[0.75em] m-0 max-w-[18em] font-outfit text-[clamp(1.75em,4vw,3em)] leading-[1.15] font-normal tracking-[-0.03em] text-balance"
      >
        One workshop, every kind of honour.
      </h2>

      <div className="mt-[clamp(1.75em,3.5vw,3em)] flex snap-x snap-mandatory gap-[1em] overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:gap-[1.5em] lg:overflow-visible lg:pb-0">
        {ORDER.map((key) => {
          const copy = COPY[key]
          const count = counts[key] ?? 0
          return (
            <Link
              key={key}
              href={`${trophiesHref}?sub=${encodeURIComponent(copy.label)}`}
              className="group relative min-w-[78%] snap-start no-underline sm:min-w-[45%] lg:min-w-0"
            >
              <article
                className="flex h-full flex-col border border-[#131111]/10 p-[1.5em] transition-colors group-hover:border-[#131111]/30"
                style={{ borderTopWidth: "0.25em", borderTopColor: ACCENTS[key] }}
              >
                <p className="m-0 font-outfit text-[0.75em] uppercase tracking-[0.12em] text-[#6B635C]">
                  {copy.label}
                  {count > 0 ? ` · ${count}` : ""}
                </p>
                <h3 className="mt-[1em] m-0 font-outfit text-[1.35em] leading-[1.25] font-normal tracking-[-0.02em] text-balance text-[#131111]">
                  {copy.title}
                </h3>
                <p className="mt-[0.75em] m-0 flex-1 font-outfit text-[1em] leading-[1.45] tracking-[-0.02em] text-pretty text-[#131111]/70">
                  {copy.body}
                </p>
                <span className="mt-[1.25em] font-outfit text-[0.875em] uppercase tracking-wide text-[#131111] underline underline-offset-[0.15em]">
                  Shop {copy.label.toLowerCase()}
                </span>
              </article>
            </Link>
          )
        })}
      </div>
    </SectionShell>
  )
}
