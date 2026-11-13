# 047 — Product pages: seamless nav and paper gallery

- Date: 2026-10-26 · Branch: ashish/frontend-revamp · Status: shipped
- Layer-2 anchor: WP-68

## Context / why

The editorial header fix in WP-66 covered `EditorialShell` and the account shell, but
the product detail page uses its own `.pdp-page` root. That root already painted
`#F2F1EF`, yet it did not use `.under-site-header`, so the 5rem strip behind the
transparent nav stayed the near-white `body` colour. The page therefore still had a
pale band above the breadcrumb while `/about`, `/blog`, `/contact` and the account
pages were seamless.

The gallery also had a large grey plate behind the product photo. The colour was set
in three places: an inline `backgroundColor: "#D9D9D9"` on `.pdp-gallery-well`, the
same value in `pdp.css`, and again in `image-gallery.css` (the component imports its
own CSS chunk). The thumbnail buttons used the same grey. With `object-contain` and
an 8% frame, that grey was visibly a box around the image.

## Decisions made

- **Add `under-site-header` to the shared PDP root.** The route renders
  `<div className="pdp-page under-site-header">`, and the root is a direct child of
  `#main`, so the existing negative-margin/padding rule paints `#F2F1EF` behind the
  nav without moving the breadcrumb, gallery or buy column. Every `/products/[handle]`
  page inherits the fix.
- **Make the gallery surface transparent, not another solid colour.** Removed the
  inline grey override and set both `.pdp-gallery-well` and `.pdp-thumb` to
  `background: transparent` in `pdp.css` and `image-gallery.css`. This removes the
  grey plate and lets the page surface show through; it also adapts if the PDP
  surface changes later. The arrows and counter keep their `#F2F1EF` chips because
  they sit over photography.
- **Do not change `ProductCard`.** Its grey well is covered by `object-cover` images
  in the related-products and listing cards; the grey is only a loading placeholder,
  unlike the `object-contain` PDP gallery. The visible PDP result stays scoped to the
  main image and thumbnails.
- **Clip the PDP root horizontally.** The full-bleed PDP tabs produced a 2px
  horizontal overflow at 390px (`scrollWidth` 392, `innerWidth` 390) because the
  first/last tab border sat just outside the viewport. `.pdp-page` now uses
  `overflow-x: clip`, which brings the document back to 390 while preserving the
  sticky mobile buy bar (a fixed element). `clip`, not `hidden`, is used deliberately.

## Changes (file → what)

- `apps/storefront/src/app/(shop)/products/[handle]/page.tsx` — adds
  `under-site-header` to the shared `.pdp-page` root.
- `apps/storefront/src/app/(shop)/products/[handle]/pdp.css` — transparent gallery
  well and thumb backgrounds; `overflow-x: clip` on `.pdp-page`.
- `apps/storefront/src/components/features/catalog/image-gallery.tsx` — removes the
  inline grey background from `.pdp-gallery-well`.
- `apps/storefront/src/components/features/catalog/image-gallery.css` — matches the
  transparent well and thumb surfaces used by the component chunk.

## Gotchas for future work

- `.under-site-header` only applies to a direct child of `#main` with the
  `[data-site-header]` sibling. Keep `.pdp-page` as the route root; wrapping it in
  another element would bring the body-colour strip back.
- The gallery colours are duplicated in `pdp.css` and `image-gallery.css` because the
  gallery is imported by the component. Change both if the frame colour changes
  again.
- `overflow-x: clip` on `.pdp-page` is what keeps the full-bleed tabs from widening
  the document at 390px. Do not switch it to `hidden`; `hidden` creates a scroll
  container and can interfere with sticky descendants.
- Product photography is `object-contain` inside an 8% frame. A transparent well
  means the photograph's own border is now the only edge; do not add a coloured
  well back for contrast.

## Verification (commands + evidence)

- `pnpm --filter @legacy-crafts/storefront typecheck` — clean.
- `pnpm --filter @legacy-crafts/storefront lint` — 0 errors, 1 pre-existing warning
  (`dropdown-menu.tsx` unused `focusIndex`).
- `pnpm --filter @legacy-crafts/storefront test` — 100/100 passed (21 files).
- Playwright 1.62.1, Chromium 151, `localhost:3000`, announcement dismissed:
  - `/products/lumen-side-table` at 1440×1000 and 390×844: `.pdp-page` top `0`,
    computed background `rgb(242, 241, 239)`; `.pdp-gallery-well` background
    `rgba(0, 0, 0, 0)`; no grey plate in the screenshot.
  - `/products/woven-jute`, `/products/haven-pine`,
    `/products/noir-leather-armchair` at 1280×900: same top `0`, same transparent
    gallery surface.
  - `/products/oak-side-table` (three images) at 1280×900 and 390×844: all three
    `.pdp-thumb` backgrounds are transparent; gallery and arrows still work.
  - 1440 and 1280: `scrollWidth === innerWidth`; 390: page-root clip brings
    `scrollWidth` from 392 to 390.
  - No page errors. The two 401 resource messages from the customer/review client
    are pre-existing on every PDP (present before this change) and are unrelated.
- Screenshots reviewed at desktop and mobile; the nav band matches the page surface
  and the photograph now sits directly on paper.
