import Link from "next/link"
import { SectionEyebrow, SectionShell } from "@/components/sections/_editorial"
import { listCategories, countProductsByCategory, collectCategoryIds } from "@/lib/data/catalog"
import { CATEGORY_CONFIG, type CategoryKey } from "@/lib/category-config"

const ORDER: CategoryKey[] = ["trophies", "furniture", "artwork"]

const ACCENTS: Record<CategoryKey, string> = {
  trophies: "#8A2D25",
  furniture: "#191D26",
  artwork: "#4F3516",
}

const COPY: Record<CategoryKey, { title: string; body: string }> = {
  trophies: {
    title: "Awards that hold their weight.",
    body: "Optical crystal, cast brass, and acrylic honours — engraved to the name, dated to the day.",
  },
  furniture: {
    title: "Furniture that earns its place.",
    body: "Kiln-dried teak, solid walnut, hand-rubbed oil. Built for decades of use, not seasons of trend.",
  },
  artwork: {
    title: "Artwork, chosen slowly.",
    body: "Handwoven textiles, cast brass, and wall pieces that reward a second look.",
  },
}

export async function DisciplinesSection() {
  let counts: Record<string, number> = { trophies: 0, furniture: 0, artwork: 0 }
  try {
    const categories = await listCategories()
    const byHandle = Object.fromEntries(categories.map((c) => [c.handle, c]))
    const idsByKey: Record<string, string[]> = {}
    for (const key of ORDER) {
      const handle = CATEGORY_CONFIG[key].medusaHandle
      const cat = byHandle[handle] ?? null
      idsByKey[key] = collectCategoryIds(cat)
    }
    counts = await countProductsByCategory(idsByKey)
  } catch {
    // empty counts when Medusa is down
  }

  return (
    <SectionShell id="disciplines" aria-labelledby="disciplines-heading">
      <SectionEyebrow>three disciplines</SectionEyebrow>
      <h2
        id="disciplines-heading"
        className="mt-[0.75em] m-0 max-w-[18em] font-outfit text-[clamp(1.75em,4vw,3em)] leading-[1.15] font-normal tracking-[-0.03em]"
      >
        One workshop, three crafts.
      </h2>

      <div className="mt-[clamp(1.75em,3.5vw,3em)] flex snap-x snap-mandatory gap-[1em] overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:gap-[1.5em] lg:overflow-visible lg:pb-0">
        {ORDER.map((key) => {
          const cfg = CATEGORY_CONFIG[key]
          const copy = COPY[key]
          const count = counts[key] ?? 0
          return (
            <Link
              key={key}
              href={cfg.href}
              className="group relative min-w-[78%] snap-start no-underline sm:min-w-[45%] lg:min-w-0"
            >
              <article
                className="flex h-full flex-col border border-[#131111]/10 p-[1.5em] transition-colors group-hover:border-[#131111]/30"
                style={{ borderTopWidth: "0.25em", borderTopColor: ACCENTS[key] }}
              >
                <p className="m-0 font-outfit text-[0.75em] uppercase tracking-[0.12em] text-[#131111]/55">
                  {cfg.label}
                  {count > 0 ? ` · ${count}` : ""}
                </p>
                <h3 className="mt-[1em] m-0 font-outfit text-[1.35em] leading-[1.25] font-normal tracking-[-0.02em] text-[#131111]">
                  {copy.title}
                </h3>
                <p className="mt-[0.75em] m-0 flex-1 font-outfit text-[1em] leading-[1.45] tracking-[-0.02em] text-[#131111]/70">
                  {copy.body}
                </p>
                <span className="mt-[1.25em] font-outfit text-[0.875em] uppercase tracking-wide text-[#131111] underline underline-offset-[0.15em]">
                  Shop {cfg.label.toLowerCase()}
                </span>
              </article>
            </Link>
          )
        })}
      </div>
    </SectionShell>
  )
}
