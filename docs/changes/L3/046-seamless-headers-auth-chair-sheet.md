# 046 — Seamless editorial headers + chair sheet on auth pages

- Date: 2026-10-26 · Branch: ashish/frontend-revamp · Status: shipped
- Layer-2 anchor: WP-66

## Context / why

Two related inner-page issues.

1. **The body-colour strip under the nav.** `SiteHeader` is a zero-height
   transparent overlay. `#main` is padded by `--site-header-h`, so content clears
   the nav, but the strip behind the nav is still the `body` surface
   (`--color-background`, a near-white `oklch(...)`). Page roots that paint their
   own `#F2F1EF` surface therefore showed a pale band above the content. `.about`,
   `/blog`, `/contact`, and `/account/login` all use `EditorialShell`; only the
   shop root used the existing `.under-site-header` escape hatch.
2. **Empty right half on auth pages.** The login and register pages were a single
   narrow form column. The supplied `ChairSheet` gives them a nine-view technical
   drawing of a barrel armchair on the right.

## Decisions made

- **Fix the strip once in `EditorialShell`.** Added `under-site-header` to its
  root. The CSS rule applies a negative top margin plus equal padding, so the
  `#F2F1EF` surface paints behind the nav with no content shift. This covers
  `/about`, `/blog`, `/blog/[slug]`, `/contact`, all four auth pages, and the
  other editorial routes.
- **Also fixed `AccountShell`.** Its signed-in and guard states are `#F2F1EF`
  roots too, so both now use `under-site-header`; otherwise the dashboard would
  reintroduce the strip right after login. Auth routes bypass the shell and get
  the class from `AuthFrame`'s `EditorialShell`.
- **Blog articles needed a wrapper swap.** `/blog/[slug]` originally wrapped
  `EditorialShell` in an outer `<article>`, so the direct-child selector never
  reached the surface root. `EditorialShell` is now the outer element, with
  `<article>` inside it; the JSON-LD scripts stay at the top of the shell.
- **No header background was added.** `SiteHeader` stays a transparent,
  zero-height overlay. The page surface is what becomes seamless.
- **ChairSheet is copied in unchanged.** New
  `components/features/account/chair-sheet.tsx`; plain SVG, no dependencies,
  static markup built once at module scope. It keeps the component's nine views,
  dimensions, `role="img"`, and accessible label. `ink="#131111"` and
  `paper="#F2F1EF"` match the catalogue surface; the default 3 × 3 hairline grid
  is kept.
- **Only login and register show the sheet.** `AuthFrame` gained an optional
  `illustration` prop (default `false`). Login and register pass it; forgot-
  password and reset-password stay single-column.
- **Wide screens only.** The split is `xl` (≥1280px), with a 32em form column,
  a fluid gap, and the sheet capped at 44em and right-aligned. At 1920px the
  sheet is 704 × 660; at 1280px it is 626 × 587. Below `xl` the sheet is hidden
  because its 11.5px SVG titles become too small to read.
- **`paper` must match the surface.** The chair's `paper` polygons hide lines
  behind nearer parts; using any colour other than the section background makes
  those masks visible.

## Changes (file → what)

- `apps/storefront/src/components/layout/editorial/editorial-shell.tsx` — adds
  `under-site-header` to the shared `#F2F1EF` canvas.
- `apps/storefront/src/app/(shop)/blog/[slug]/page.tsx` — makes `EditorialShell`
  the page root and moves `<article>` inside it, so the blog article is covered
  by the same class.
- `apps/storefront/src/components/features/account/account-shell.tsx` — adds
  `under-site-header` to both `#F2F1EF` shell roots (loading/guard and signed-in).
- `apps/storefront/src/components/features/account/chair-sheet.tsx` — new. The
  supplied barrel-armchair technical sheet, unchanged.
- `apps/storefront/src/components/features/account/auth-frame.tsx` — optional
  `illustration`; two-column `xl` layout with the sheet on the right.
- `apps/storefront/src/app/(account)/account/login/page.tsx` — passes
  `illustration`.
- `apps/storefront/src/app/(account)/account/register/page.tsx` — passes
  `illustration`.

## Gotchas for future work

- `.under-site-header` only matches when the element is a **direct child of
  `#main`** and a `[data-site-header]` sibling exists. Any new page/shell root
  with its own surface colour must add the class or the body-colour strip returns.
- Auth pages are rendered by `AccountShell` with `return <>{children}</>`; their
  surface root is `AuthFrame`'s `EditorialShell`, not the account shell.
- `ChairSheet` builds its SVG string once at module scope and injects it with
  `dangerouslySetInnerHTML`. Keep it static; do not feed user content into it.
- The sheet scales its labels with the SVG. Do not show it below the `xl` split
  without increasing the label sizes or accepting unreadable text.
- If the auth page surface changes, update both `paper` and the surrounding
  `#F2F1EF` classes together.

## Verification (commands + evidence)

- `pnpm --filter @legacy-crafts/storefront typecheck` — clean.
- `pnpm --filter @legacy-crafts/storefront lint` — 0 errors, 1 pre-existing
  warning (`dropdown-menu.tsx` unused `focusIndex`).
- `pnpm --filter @legacy-crafts/storefront test` — 97/97 passed (20 files).
- Playwright 1.62.1, Chromium 151, `localhost:3000`:
  - `/about`, `/blog`, `/contact`, `/account/login`, `/account/register`:
    `.under-site-header` top `0`, computed background `rgb(242, 241, 239)`,
    zero console/page errors, `scrollWidth === innerWidth`.
  - `/blog/boardroom-moment-bengaluru`: same top `0` surface check after the
    wrapper swap; heading and cover render normally.
  - 1920×1080 login/register: sheet 704 × 660 at the right; form column intact.
  - 1280×900: sheet 626 × 587, still legible.
  - 390×844: sheet hidden, form unchanged, no horizontal scroll.
  - Screenshots reviewed for all five routes; header band is the same surface as
    the page, with no white strip.
- Announcement bar was dismissed for the screenshots to match the normal
  inner-page state; when present it is its own 36px black strip above the nav.
