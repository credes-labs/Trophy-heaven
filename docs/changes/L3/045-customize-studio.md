# 045 — Plaque studio: fullscreen, wood art, panel spacing

- Date: 2026-10-26 · Branch: ashish/frontend-revamp · Status: shipped (interaction pass incomplete in the shared browser, see Verification)
- Layer-2 anchor: WP-65

## Context / why
WP-56 put a 3D plaque configurator on `/customize`. It still had page chrome in the original layout, a text 2D/3D control, and photos that only landed on the metal plate. A later pass in the same tree added the fullscreen shell, icon switch, wood-wide artwork, laser engraving, and the five tabs, then stopped before the panel spacing and a browser pass. This entry records that studio and the spacing fix.

The catalog product is still Engraved Wooden Plaque (`engraved-wooden-plaque`). M is 8×10 in and L is 10×12 in. Those are the only choices that map to Medusa variants. Other finishes are included.

## Decisions made (and alternatives rejected)
- **One shell.** `/customize` is `fixed inset-0 z-30 h-dvh overflow-hidden`. `SiteChrome` already treats `/customize` as bare, so there is no header, footer, or announcement bar. While the configurator is mounted it also sets `documentElement.style.overflow` to `hidden`. The plaque product’s `/customize/[id]/2d` and `/3d` routes redirect back here. Other products keep their editors.
- **Icon switch.** A radiogroup at the top of the stage: an inline-SVG cube (“3D preview”) and a flat plaque (“2D design”). No text labels. Arrow keys move between them. The switch does not navigate. The 2D layout (Fabric) is stored in `sessionStorage` (`lc_plaque_layout:v1`); the query holds the options. *Rejected*: a large text toggle.
- **Artwork placement.** `art=plate|wood`. “On the wood”, and any “No plate” shape, maps the photo across the wooden face (inset 4%) in both the SVG proof and a 3D decal under the metal. “On the plate” stays in the plate safe area. “No plate” hides the metal swatches and shows a one-line note. Unknown `art` values fall back to `plate`.
- **Laser look.** Existing client pipeline (`engrave.ts`): grayscale, contrast, burn ramp, grain through the decal, edge fade. Presets Photo / Sketch / Bold. Originals are capped and kept in the design payload, not in the URL. Text uses the same burn when the plate is absent and the fill is natural.
- **URL writes must not navigate.** `history.replaceState(null, …)` is patched by Next.js and dispatches `ACTION_RESTORE`, which can leave the page or drop the query. The writer passes the current history state when it already has `__NA` or `_N`, so the patch only updates the query. Otherwise it calls `History.prototype.replaceState`. *Rejected*: `router.replace` on every option, which refetches the RSC page.
- **Panel spacing.** Sides are `px-5` / `lg:px-6`. The title has `mt-4` before the tabs. Tabs are content-sized with a 12px gap, taller hit area, and `pe-11` so a corner badge does not cover Display. Groups are 24px apart. The legend sits 12px above its swatches. Swatch labels have 10px between them and 4px of padding so the selected ring does not touch the next circle. The footer keeps its own padding. The panel stays `overflow-hidden`. *Rejected*: `overflow-y-auto` to buy the extra space.
- **Cart.** Unchanged contract: save a design, then add the size variant with `design_id`, `customization_mode`, and `configuration`. Add stays blocked until there is engraving text or an uploaded image. No price change for wood, metal, placement, or engraving.

## Changes (file → what)
- `apps/storefront/src/app/(shop)/customize/page.tsx`: fixed fullscreen shell; parses the query, including `art`.
- `apps/storefront/src/app/(customize)/customize/[productId]/3d/page.tsx`: plaque handle redirects to `/customize`. Other products stay on `Editor3DLoader`.
- `apps/storefront/src/app/(customize)/customize/[productId]/2d/page.tsx`: plaque handle already redirected to `/customize?mode=2d`.
- `components/features/customize/configurator/plaque-configurator.tsx`: tabs, compact shell, URL writer, cart gate, panel padding and gaps.
- `configurator/swatch-group.tsx`: 10px swatch gap and ring padding.
- `configurator/artwork-placement.tsx`: “On the plate” / “On the wood”.
- `configurator/studio-top-bar.tsx`: icon radiogroup.
- `configurator/plaque-model.tsx` and `plaque-preview-2d.tsx`: wood decal versus plate texture.
- `layout/layout-editor.tsx`: clip path, cover-scale for wood photos, placement control.
- `lib/configurator/plaque.ts`, `layout-geometry.ts`, and their tests: `art`, `artworkOnWood`, safe area, size round-trip.

## Gotchas for future work
- Do not call `history.replaceState(null, …)` from this page. Next treats a null state as an external navigation.
- The wood photo is a decal under an opaque plate. With a plate chosen, the centre of a wood-wide photo is covered by metal. “No plate” shows the whole face.
- Only size changes the Medusa price. Do not add frontend surcharges for timber, metal, or placement.
- The options panel must keep `overflow-hidden`. If a new group does not fit, move it to another tab or tighten type. Do not turn the panel into a scroll container.
- `pe-11` on the tab row is the clearance for a corner control (the Next dev badge sits on the viewport corner in dev). Do not drop it or Display gets covered again.
- Per-product editors at `/customize/[id]/2d` and `/3d` are still the path for every product that is not the plaque.

## Verification (commands + evidence)
- `pnpm --filter @legacy-crafts/storefront exec tsc --noEmit` — exit 0.
- eslint `--no-warn-ignored` on the configurator files, `plaque.ts`, `layout-geometry.ts`, their tests, `customize/page.tsx`, and the plaque 3D route — exit 0.
- `vitest run src/lib/configurator` — 27/27 (engrave 12, layout-geometry 5, plaque 10, including the 10-inch size round-trip and `artworkOnWood`).
- Browser on the already-running `:3000` (not restarted): at 1440×900, 1366×768, 1280×720, and 390×844, `documentElement.scrollHeight` equalled `innerHeight`, `scrollWidth` did not exceed the width, no `[data-site-header]`, no `footer`, tabpanel `overflow` hidden and not overflowing, and no other element with `overflow: auto|scroll` and overflowing content. At 1440, group gap 24px, swatch gap 10px, circle gap 18px, legend-to-swatch 12px, tab gap 12px, Display’s right edge at 1304 of 1441. At 390, tabs fit (Engraving 56px) and the swatch gap is 10px.
- The same browser session focused the 2D button, the Wood tab, and the size radios, but React did not commit those clicks (`aria-checked` / `aria-selected` stayed put, and the query was not rewritten). No React fiber was attached on the buttons after load. The icon toggle, an uploaded “On the wood” / “On the plate” image, “No plate”, and the live size=l query were therefore not re-confirmed in that session. The dev server was left running.
