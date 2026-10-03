# 031 — Homepage sections, copy deck, and sitemap

- Date: 2026-10-03 · Branch: main · Status: shipped
- Layer-2 anchor: WP-34

## Context / why

The live homepage sold furniture-only "Legacy" in USD and omitted the trophy
customizer — the kit's stated differentiator. Stats and shipping claims also
contradicted each other across about, craftsmanship-story, and the Medusa seed.
Fourteen content/conversion routes were linked or required but missing.

## Decisions made (and alternatives rejected)

- Three-discipline India-first narrative in INR (not furniture-only campaign).
- Shipping marketing aligned to seed (Standard ₹99 / Express ₹249); free-shipping
  ₹5,000 claim dropped until ops updates seed.
- Stats unified in `brand-facts.ts`; inventing new numbers rejected.
- New homepage sections built in Outfit editorial system; old Playfair sections
  left unmounted as reference only.
- Shared design page scaffolded at `/shared/design/[id]` for FR-2D-14 share URLs.
- Mobile tab bar left as Search (Design swap flagged, not assumed).

## Changes (file → what)

- `lib/brand-facts.ts` — single source for city, founding year, stats, shipping, trust, announcements
- `components/sections/_editorial/*` — SectionShell, eyebrows, watermarks, PillCta
- `docs/content/homepage-copy.md` — full copy deck
- Homepage sections: disciplines, customizer, process, recent-work, corporate-band, materials, voices, journal-rail, trust-strip, signup
- Rewrote hero/about/explore/footer/products-categories copy; INR prices (USD×85)
- `app/page.tsx` — composed sections with mobile flex order
- Explore mobile filter bottom sheet; hero `88svh`; announcement bar on `/`
- Infra: `not-found`, `error`, `loading`, `opengraph-image`
- Pages: `/customize`, `/corporate/quote`, `/track`, `/returns`, `/gift-cards`, `/press`, `/careers`, `/trade`, `/guides/[slug]`, `/sitemap`, `/shared/design/[id]`
- Nav/footer/mega-menu/sitemap.xml link repairs

## Gotchas for future work

- Homepage furniture category labels must match seeded Medusa children (chairs/tables/shelves/cabinets/stools).
- `listPosts` throws when Medusa is down — journal rail catches; other RSC callers must too.
- Quote/track/returns forms are client scaffolds (no backend persistence yet).
- Do not reintroduce free-shipping ₹5k copy without seed + ops alignment.

## Verification (commands + evidence)

- `pnpm --filter @legacy-crafts/storefront typecheck` — pass
- `pnpm --filter @legacy-crafts/storefront lint` — pass (pre-existing dropdown warning only)
- `pnpm --filter @legacy-crafts/storefront test` — 64/64 pass
- `pnpm --filter @legacy-crafts/storefront build` — see verify step
