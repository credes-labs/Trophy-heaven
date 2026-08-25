# 017 — Shop browse + filter layouts

- Date: 2026-08-25 · Branch: feat/shop-page-layout · Status: in-progress
- Layer-2 anchor: WP-18

## Context / why

`/shop` already used cream Outfit tiles (WP-13) but always showed a left
filter column. Two layout references asked for a **browse** page (hero,
centered recent grid, load more, testimonials, wide still) and a
**filter-open** page (breadcrumb, category banner, toolbar, left accordion,
3-column grid, numbered pages). Style stays the homepage system — not the
reference sites' chrome.

## Decisions made (and alternatives rejected)

- **Two modes, one URL.** `filter` toggles local `filtersOpen`. Query params
  still own category/price/sort. Landing on `/shop?category=…` opens the
  filter layout. Rejected a second route.
- **Filter spine matches the catalog shot.** Breadcrumb is full-width
  above both columns. Sidebar sits **beside** the banner, toolbar, and
  3-col grid — not under a full-bleed banner. Browse still uses a
  full-width hero + 4-col grid. Rejected overlaying hero and banner in
  one CSS cell (hydration mismatch).
- **One class drives the morph.** `filtersOpen` toggles `.shop-page.is-filter`.
  CSS interpolates sidebar tracks, hero height, banner height, and
  load-more↔pagination in a shared `.shop-swap` so the two footers
  never stack. Hero starts collapsing immediately; filter chrome
  delayed ~80ms so mid-transition height is not hero+banner.
- **No `inert` on the shop tree.** Boolean `inert` mismatched SSR vs
  client and left a mixed React tree (toolbar open, listing still
  `0px`). Folded regions use `aria-hidden` + `pointer-events`.
- **Cards FLIP position only** (`layout="position"`), same duration as
  the sidebar (560ms, ease-in-out). Size follows the grid so images
  are not stretched while the column count changes.
- **Browse = 4 columns + load more; filter = 3 columns + numbered pages.**
  Matches the two reference structures. Page size 12 so three rows fill
  either grid.
- **Reuse Explore accordion language** for the sidebar (Outfit uppercase
  rows, hairline, charcoal clear pill). Keep existing filter fields
  (category tree, price, material, in-stock, customizable).
- **Hero slides from the live catalog** (first two products with images),
  padded with existing public JPEGs. No new image fetches.
- **Keep SiteHeader / cream footer.** References were structure-only.

## Changes (file → what)

| File | What |
|------|------|
| `shop-client.tsx` | `.shop-page.is-filter` root; banner+toolbar+grid in the right column; sidebar clips beside them; pager swap |
| `shop-fold.tsx` | Optional height-fold helper (CSS `.shop-fold`); shop page uses page-level classes instead |
| `shop-toolbar.tsx` | `ShopModeToolbar` lives in the product column; listing chrome clips in |
| `globals.css` | `.shop-page` motion: sidebar tracks, staggered hero/banner, `.shop-swap` |
| `filter-sidebar.tsx` | Explore-style accordion |
| `shop-hero.tsx` / `shop-testimonials.tsx` / `shop-banner.tsx` | Browse sections |
| `shop-pagination.tsx` / `constants.ts` | Filled active page; filter copy |
| `app/(shop)/shop/page.tsx` | `SHOP_PAGE_SIZE` fetch + 4-col skeleton |
| `lib/images.ts` | Remap stale `.png` product/catalog URLs to `.jpg` |

## Gotchas for future work

- Switching mode with `page > 1` snaps back to page 1 so load-more append
  state does not mix with numbered pagination.
- Client-side price/material/stock filters still run after Medusa list;
  `count` is the store total, not the post-filter size.
- Do not remount the product grid on `filtersOpen` (`key` must not include
  mode) or cards cannot FLIP. Do not wrap `setFiltersOpen` in a React
  transition together with `router.replace` — that delays the CSS class
  change and the sidebar never eases.
- Do not put hero and filter banner in the same overlapping grid cell.
- Custom `.shop-*` rules must live where Tailwind v4 emits them (check
  the compiled CSS for `shop-listing-frame`). Prefer `.shop-page.is-filter`
  descendants over a second `is-open` class on the listing.

## Verification (commands + evidence)

- `pnpm --filter @legacy-crafts/storefront typecheck`
- `pnpm --filter @legacy-crafts/storefront lint`
- `docker compose up -d` + Medusa `:9000` + storefront `:3000`
- Browser: `/shop` browse, then **filter** open/close and a category click
