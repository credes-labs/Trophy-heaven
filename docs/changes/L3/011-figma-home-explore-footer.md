# 011 — Figma home explore & footer

- Date: 2026-08-24 · Branch: current · Status: in-progress
- Layer-2 anchor: WP-12

## Context / why

Fourth homepage frame from the new Figma file (`temp/explore.css`) plus the
closing `temp/cta&footer.css` band. Explore sits under Products & Categories
on the 1440 artboard (y=3627). The CSS dump stacked earlier filter drafts
under the final header / hero / accordion / 3×3 grid — only the later,
higher layers are implemented. Footer replaces the walnut site footer with
the cream CTA + polaroids + giant “legacy” wordmark.

## Decisions made (and alternatives rejected)

- **Top layers only.** Duplicate `Rectangle 34625492` names are one product
  card each (paint order = grid order), not stacked comps. `Line 1` at
  `bottom: 2302px` is the rule under the header. `short by` is the visible
  sort control (shown as “sort by”). `price page` is the price accordion.
- **Stills renamed out of `temp/`.** ChatGPT Aug 8 frames → nine product
  JPEGs; Apr 2 frame → hero; three `Rectangle 34625492` crops → lamp, rug,
  nightstand (those ChatGPT timestamps were never exported).
- **Filters are real.** Accordion + sort operate on the nine pieces so the
  UI is not a static poster. Clear-filters pill resets state.
- **Footer is global.** The Figma CTA+footer is the site footer, not a
  homepage-only strip. Polaroids use the same furniture stills (no empty
  `#D9D9D9` boards — brand forbids placeholder boxes).
- **rem/`em`.** Same recipe as about / products: Figma px÷16; from `lg`,
  `font-size: min(1rem, 100vw / 90)`.

## Changes (file → what)

| File | What |
|------|------|
| `components/sections/explore/*` | Header, hero Ken Burns, filter accordion, sort, 3×3 cards |
| `components/sections/explore-section.tsx` | Re-exports `ExploreSection` |
| `app/page.tsx` | Renders Explore after products & categories; drops story / values / bestsellers / testimonials / newsletter from `/` |
| `public/images/explore/*` | Hero + nine product stills |
| `components/layout/footer/*` | Cream CTA band, polaroid scatter, wordmark + nav |
| `public/images/footer/*` | Five polaroid stills |
| `app/globals.css` | `exploreKenBurns` keyframes |

## Gotchas for future work

- Do not size these blocks in px. `em` follows the section `font-size`.
- `temp/explore.css` still contains buried draft layers — do not re-add
  the older filter chrome at y≈959 as a second toolbar.
- Rectangle crops are 302×374 (Figma export size). Prefer a 2× still if
  the designer re-exports.
- `CraftsmanshipStory`, `BrandValues`, `BestsellersCarousel`,
  `Testimonials`, and `Newsletter` are unused on `/` but still imported
  elsewhere (newsletter on blog). Do not delete the files as part of
  this frame.

## Verification (commands + evidence)

- `pnpm --filter @legacy-crafts/storefront typecheck`
- `pnpm --filter @legacy-crafts/storefront lint`
- Browser: `/#explore` grid + filters; footer polaroids + Shop the Collection
