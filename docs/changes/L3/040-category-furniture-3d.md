# 040 — 3D furniture in the categories stage

- Date: 2026-10-25 · Branch: `ashish/frontend-revamp` · Status: shipped
- Layer-2 anchor: WP-52

## Context / why

The `//categories` stage (Chairs, Cabinets, Shelves, Stools, Tables) showed three tilted catalog photos per category. The user asked for the materials-section 3D treatment here instead: model the furniture in each photo, leave out the rooms, and show the right pieces when a category is picked.

## Decisions made (and alternatives rejected)

- **Six models, one per catalog photo.** The categories reuse six photos, so there are six models:
  - `lounge`: sculpted walnut frame with arms that sweep into the back posts, oatmeal linen cushions, brass ferrules.
  - `armchair`: straight walnut frame, flat arms with brass caps, taupe bouclé cushions.
  - `coffee`: oval oak top, two half-round pedestals, round under-shelf, brass fin.
  - `dining`: stadium-shaped walnut top on four splayed legs with brass tips.
  - `side`: round fluted-glass top in a brass band, three walnut plank legs, brass Y stretcher.
  - `shelf`: walnut carcass, brass posts and shelves, lit shelf undersides, two-door base.

  Each category keeps the same three-photo pairing as before, now as `pieces`. Décor from the photos (vases, books, lamps, plants) is left out because the brief was furniture only.
- **Everything procedural.** All models are built from primitives, extrusions, and tubes, with canvas-drawn textures: wood grain, linen weave, a pebble map for bouclé, and a stripe bump for the fluted glass. No asset files ship, so `manifest.json` is unchanged.
- **Same canvas setup as materials.** One canvas, portaled to `document.body`, `position: fixed`, `z-30`, `pointer-events: none`, transparent clear. One `<View track={slot}>` per slot, inside the canvas (see L3/039 and WP-49 for why).
- **Desktop and mobile slot sets.** Six slot refs exist: three absolute slots on desktop and a three-slot row below `lg`. A `(min-width: 1024px)` media query chooses which three are tracked. View keys include the layout name, so a breakpoint change remounts them on the new slots.
- **Swap animation in `useFrame`.** Each piece is keyed by its kind, so a slot only animates when its piece changes. A damped 0→1 progress drives the scale from the floor, a drop in the scroll direction, and a small yaw. Each slot starts 0.08s after the one before.
- **Lazy and paused.** The canvas chunk (`next/dynamic`, `ssr: false`) mounts when the stage comes within 300px of the viewport. `frameloop` is `never` while the stage is outside that margin. The last frame drawn before pausing has the views offscreen, so nothing is left painted.
- **Shared helpers.** `rng`, `canvasTexture`, `woodTexture`, `drawPebbles`, `linenTexture`, `roundedBox`, and `useDisposable` moved verbatim to `lib/three/procedural.ts`, and `materials-canvas.tsx` imports them. The jute, cushion, fluted, and bent-panel helpers stay in the materials file.
- **Accessibility.** Slots are `role="img"`, and each `aria-label` comes from `FURNITURE_LABELS`. The canvas is `aria-hidden`.

## Changes (file → what)

- `components/sections/products-categories/constants.ts` — adds `FurnitureKind` and `FURNITURE_LABELS`. `CatalogCategory.images`/`alts` become `pieces`.
- `components/sections/products-categories/category-stage.tsx` — the `Polaroid` component and its motion and `next/image` imports are gone. Adds slot refs, media-query hooks, an IntersectionObserver, and the dynamic `CategoryCanvas`. Wheel, keyboard, hover, and link behaviour are unchanged.
- `components/sections/products-categories/category-canvas.tsx` (new) — the portaled canvas, per-slot camera and lights, and the `Piece` enter and sway animation.
- `components/sections/products-categories/furniture-models.tsx` (new) — the six models and the `FURNITURE` spec table (scale, height, shadow footprint).
- `lib/three/procedural.ts` (new) — the shared texture and geometry helpers.
- `components/sections/materials/materials-canvas.tsx` — the local copies of those helpers are removed and imported instead. No behaviour change.

## Gotchas for future work

- Clicking the active category still follows its link to `/shop?...` (existing behaviour). Hover or click a different one to preview it.
- A real mouse resting over a category label re-activates it on hover, so scripted `.click()` tests can appear not to switch. Move the pointer away first.
- When editing these files from PowerShell, do not use `Get-Content`/`Set-Content` without `-Encoding`. They read UTF-8 as ANSI and garble `₹`, `é`, and `—`.
- Every slot carries its own `<Environment frames={1}>`. Adding slots adds env-map bakes, so keep it to three.
- The Next dev overlay's hydration warning comes from `hero/hero-wordmark.tsx`, not from this section.

## Verification (commands + evidence)

- `pnpm --filter @legacy-crafts/storefront typecheck` passes.
- eslint on `src/components/sections/products-categories`, `src/components/sections/materials`, and `src/lib/three` reports 0 problems.
- `vitest run src/components/sections/products-categories` passes (2 tests).
- Browser, desktop 1024px:
  - Chairs shows the lounge chair (left), armchair, and side table.
  - Cabinets shows the bookcase, side table, and dining table.
  - Tables shows the coffee table, dining table, and side table.
  - There are two canvases on the page (materials and categories). Product-card prices render as `₹`.
  - Navigating to `/shop` leaves no pieces painted on the page.
- Browser, 390px emulated: three pieces in the row above the list. After scrolling 150px, the pieces stay in their slots. Device-metrics emulation cleared afterwards.
