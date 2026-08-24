# 012 — Shared site nav + editorial shop

- Date: 2026-08-24 · Branch: current · Status: shipped
- Layer-2 anchor: WP-13

## Context / why

The Figma homepage nav (wordmark, two Outfit columns, Search/Cart) was
home-only. `/shop` still used the old sticky header and a mega-menu whose
full-viewport dimmer re-fired `open` on hover, so the panel stayed open
after the pointer left Shop. The shop listing also still used the previous
serif/card catalog, not the cream Explore language.

## Decisions made (and alternatives rejected)

- **One `SiteNav`.** Hero overlay and inner-page chrome share the same
  component so the shop header cannot drift. Inner pages sit on `#1C1612`
  so the white wordmark stays as-is.
- **Flyout lives in the `<li>`.** Trigger + panel share one hover target.
  `mouseleave` closes immediately. No 200ms timeout, no `h-screen`
  overlay (that was the stay-open bug).
- **Static flyout links + live departments.** Collection merges Medusa
  top-level categories when the header fetch succeeds; other columns use
  the footer/catalog information architecture.
- **Editorial shop tiles, not a ProductCard rewrite.** Category pages still
  use the existing card; only `/shop` switches to the Explore 302/374
  treatment.

## Changes (file → what)

| File | What |
|------|------|
| `components/layout/site-nav/*` | Shared nav + hover flyouts that close on leave |
| `components/layout/site-header.tsx` | Walnut sticky bar for inner pages |
| `components/layout/header.tsx` | Renders `SiteHeader` with top categories |
| `components/sections/hero/hero-nav.tsx` | Thin wrapper around `SiteNav` |
| `components/features/shop/editorial-product-card.tsx` | Explore-style product tile |
| `components/features/shop/shop-client.tsx` | Cream Outfit PLP + editorial tiles |
| `app/(shop)/shop/page.tsx` | Matching cream fallback skeleton |

## Gotchas for future work

- Do not add a full-viewport overlay behind nav flyouts. Hovering it will
  keep the menu open.
- Keep the flyout inside the same element that handles `mouseleave`.
- `HeaderClient` / `MegaMenu` are unused. Leave them unless a later pass
  deletes dead chrome.
- Hero section is `overflow-x-clip` so vertical flyouts can paint over the
  studio photo.
- Cart `init()` swallows Medusa network errors. If the Next overlay shows
  `TypeError: Failed to fetch` on every page, Medusa is not running on
  `:9000` — start the backend; the overlay should no longer appear either way.

## Verification (commands + evidence)

- `pnpm --filter @legacy-crafts/storefront typecheck`
- `pnpm --filter @legacy-crafts/storefront lint`
- Browser: `/` hover COLLECTION → flyout; leave → closes. `/shop` same nav;
  listing uses cream editorial tiles.
