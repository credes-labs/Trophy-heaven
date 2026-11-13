# 043 — /customize 3D plaque configurator

- Date: 2026-10-25 · Branch: ashish/frontend-revamp · Status: shipped (browser check pending, see Verification)
- Layer-2 anchor: WP-56 (WP-55 / L3-042 left free for the concurrent nav work package)

## Context / why
The user asked for a configurator on `/customize` like the Suburbia Skate board builder. That page has a large 3D stage, round option swatches, a "current value" label beside each group, and the configuration stored in the URL. Before this change, `/customize` was only an editorial page with three links. Separate per-product editors live at `/customize/[productId]/{2d,3d}`. The 3D one has six primitive trophy bases and seven flat PBR materials, and its add-to-cart flow saves a design to `/store/designs`, then adds the line with `{design_id, design_name, preview_url, customization_mode}`.

The live catalog has exactly one customisable product: **Engraved Wooden Plaque** (`engraved-wooden-plaque`, `customization_level: text_only`). It has a Size option with M (8") and L (10") variants at ₹899. The Crystal Star 3D flagship was retired. So the configurator is built for that real, fulfillable product rather than for an invented trophy line. One excellent configurator beats several weak ones.

## Decisions made (and alternatives rejected)
- **Option model** (`lib/configurator/plaque.ts`, whitelisted):
  - Form: Classic, Arched, Crest (a pointed drop-arch).
  - Timber: Smoked walnut, White oak, Teak, Ebonised ash.
  - Plate: Brushed brass, Polished nickel, Black bronze. Each plate sets its engraving ink.
  - Display: Desk stand or Wall hung.
  - Size: 8 × 10 in or 10 × 12 in. These are the only choices that map to Medusa variants (matched by the Size label, then by position).
  - Engraving: Title / Recipient / Detail lines, limited to 32/28/36 characters.
  - Lettering: Editorial serif, Serif italic, Modern sans. These use the existing `--font-playfair` / `--font-inter` next/font variables; no new font.
- **Pricing**: the price is the resolved variant's `calculated_price`. Every finish is included and the copy says so. *Rejected*: showing surcharges, because Medusa wouldn't charge them without backend price rules (frontend-only scope).
- **URL state**: the query is `?form=&wood=&plate=&mount=&size=&font=[&title=&name=&detail=]`. The server page awaits `searchParams` and parses it with `parseConfig`. Unknown values fall back to defaults, and text has control characters stripped and is clamped. Shared links therefore SSR in the right state, and no `useSearchParams`/Suspense is needed. The client writes the URL with `window.history.replaceState`, which Next's router integrates with. *Rejected*: `router.replace` on every keystroke, which would trigger an RSC round-trip per character.
- **Cart contract preserved**: Add to cart works like the existing editors. It calls `designApi.create({mode:"3d", product_id, variant_id, state_json})`, then `addItem(variant, 1, {design_id, design_name, preview_url, customization_mode:"3d", configuration:{…labels, engraving}})`. `state_json` is a valid `Design3DState`: base `wall-plaque`, the plate mapped to the nearest PBR enum, and engraving joined with " / ". It also carries an extra `configurator` block holding the full spec; the backend keeps the raw JSON. `design_id` in metadata still drives the production job and approval subscribers. Add to cart is blocked until at least one engraving line is filled in. Until then, empty lines show faint sample copy on the model, which is never sent.
- **3D scene** (`plaque-scene.tsx`, loaded with `next/dynamic` `ssr:false`):
  - Geometry: the face is an `ExtrudeGeometry` (bevelled) of an outline shared with the SVG fallback (`lib/configurator/shapes.ts`). It is welded with `mergeVertices` so curved edges shade smoothly.
  - Materials: procedural wood is cached per species. The plate is a rounded box with a brushed-brass roughness map. The engraving is drawn into a `CanvasTexture` (`lib/configurator/engraving.ts`) and redrawn after `document.fonts.load`. Details include an emblem roundel, four pins, and the desk stand.
  - Staging: a linen-textured cream plinth, ContactShadows, and an Environment of Lightformers (same rig as the material specimens).
  - Controls: OrbitControls with damping, no pan, polar angle clamped above the floor, and zoom clamped around a distance fitted to the aspect ratio.
  - Motion: a small settle-turn and scale bounce on each option change, a slow idle sway, and a gentle bob when wall hung.
  - Performance: `dpr` capped at 1.5. The frameloop drops to `demand` offscreen (IntersectionObserver) and under reduced motion; reduced motion also removes the animation, and the one-shot shadow re-bakes on piece changes. Textures and geometry are disposed on unmount.
- **Fallback, no placeholder boxes**: `PlaquePreview2D` is a server-renderable SVG proof of the exact configuration (shape, wood gradient, plate, engraving). It shows during SSR and while the WebGL chunk loads, then crossfades out. Without WebGL it stays as the permanent view, with a note.
- **Panel UX**: each group is a native radio `fieldset`, so arrow keys work. Each swatch is a round visual with a ring when selected, the label shows underneath, and the legend reads "GROUP | current value". Wood swatches are painted by the same `drawWood` routine as the 3D textures; metals are radial gradients; forms are SVGs of the shared outline. A sticky footer holds the product link, live price, Add to cart, Share (native share on coarse pointers, otherwise clipboard, otherwise the URL is shown), and Reset. There is a `role=status` message line, and a link to the existing 2D layout editor for logo work. Text uses `#131111`/`#6B635C` on `#FBFBF7` (AA); there is no gold text on light surfaces.
- **Layout**: on desktop the stage is on the left and the 24–28em panel on the right. The section is `100svh - 3rem`, the panel scrolls, and the footer is sticky. On mobile the stage is 4:5 (≤72svh) with the panel stacked below. The editorial "Start from a piece" grid stays below the configurator.

## Changes (file → what)
- `apps/storefront/src/app/(shop)/customize/page.tsx`: the hero is replaced by the configurator. It fetches the plaque by handle, maps variants (size label, price, stock), and parses `searchParams`. The templates grid is kept.
- `apps/storefront/src/components/features/customize/configurator/` — new:
  - `plaque-configurator.tsx`: state, panel, cart, share, reset.
  - `plaque-stage.tsx`: WebGL detection, dynamic scene, turn/reset buttons, 2D crossfade.
  - `plaque-scene.tsx`: Canvas, lights, plinth, turntable, camera fit.
  - `plaque-model.tsx`: face, plate, engraving texture, emblem, pins, stand, wood cache.
  - `plaque-preview-2d.tsx`: SVG proof.
  - `swatch-group.tsx`: radio swatch group.
- `apps/storefront/src/lib/configurator/plaque.ts` (+ `plaque.test.ts`): option whitelist, parse/serialize, variant resolution, design state, cart metadata.
- `apps/storefront/src/lib/configurator/shapes.ts`: face outlines, plate and emblem placement.
- `apps/storefront/src/lib/configurator/engraving.ts`: canvas engraving layout and font resolution/loading.
- `apps/storefront/src/lib/three/draw.ts` — new, three-free: `rng` and `drawWood` moved out of `procedural.ts`. `procedural.ts` re-exports `rng`, and `woodTexture` calls `drawWood`; the behaviour is byte-identical, so the materials and category canvases are unchanged.

## Gotchas for future work
- Only **size** changes price. If finishes ever carry a surcharge, add Medusa variants or price rules first. Don't show prices the cart won't charge.
- The plaque product's Size values must contain `M`/`8"` and `L`/`10"` (or stay in that order) for `resolveVariant` to map them.
- The engraving canvas reads next/font families from CSS variables at runtime. If a font variable is renamed in `app/layout.tsx`, update `FONTS[].cssVar`.
- `buildDesignState` must stay `Design3DState`-valid (the unit test asserts this), or `POST /store/designs` returns 400.
- The old `/customize/[productId]/{2d,3d}` editors are untouched. PDP "Customize this design" still links to them.

## Verification (commands + evidence)
- `pnpm --filter @legacy-crafts/storefront typecheck` passed.
- `npx eslint --no-warn-ignored` on the configurator, `lib/configurator`, `lib/three` and the page found 0 problems.
- `npx vitest run src/lib/configurator src/lib/design-3d.test.ts`: 10/10 passed.
- A throwaway `renderToString` test (deleted afterwards) rendered the configurator with `?wood=oak&plate=black&form=crest&name=Test`. The output had the oak, black-plate and crest radios checked, ₹899 against both sizes, the engraved "Test" in the SVG proof, the 2D-editor link carrying `?variant=`, and the product link.
- **Not yet done**: the browser walkthrough (orbit, every option, share round-trip, add to cart, 390px). The shared dev server on :3000 was at 100% CPU and timed out even on `/robots.txt` for the whole session. Per the one-dev-server rule it was neither restarted nor duplicated. Do this pass once the dev server responds.
