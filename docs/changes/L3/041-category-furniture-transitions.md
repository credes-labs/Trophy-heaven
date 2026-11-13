# 041 — Category furniture: smooth swaps, full 360° spin, no clipping

- Date: 2026-10-25 · Branch: `ashish/frontend-revamp` · Status: shipped
- Layer-2 anchor: WP-53 (builds on WP-52 / L3/040; WP-54 is the unrelated quotes removal)

## Context / why

After WP-52, changing category unmounted the old piece in a slot at once, so it popped out, and the new piece grew in. Each mount also rebuilt that model's canvas textures, materials, and geometries, then disposed them on the next swap. The bouclé pebble pair alone is about 170ms of 2D-canvas work, so swaps hitched. The user asked for a smoother, more optimised transition and for the pieces to rotate a bit faster. They then asked for a complete 360° rotation with no piece cut off by its slot. drei `<View>` scissors each slot to its div rect, and the lounge chair's arm was being clipped at the right edge of the big slot.

## Decisions made (and alternatives rejected)

- **Per-slot entry list, not a key swap.** `Slot` holds `{ id, kind, leaving, side, delay }` entries. A new kind marks the current entry as leaving and appends a new one, updating state during render with no effect. When the exit finishes, `Piece` calls `onExited` and the entry is dropped.
  - A kind that is still leaving when it is picked again is revived in place. It keeps its `side`, so it reverses along the same path with no jump.
  - A slot holds at most three entries, so a hover sweep can't pile up. The oldest leaving entry is dropped first.
- **One curve both ways.** Progress is linear in time: 0.8s to enter, 0.42s to exit. The visual value is `easeOutCubic(progress)`, which eases out on enter, eases in on exit, and stays continuous on revive. Scale, the vertical drop (±35% of the fitted half-height), and the yaw offset (±0.8 rad) all follow it. The contact shadow scales with it too.
- **Timing.** Incoming pieces wait 0.16s (+0.07s per slot) so the exit reads first. Leaving pieces start with a 0.04s per-slot stagger. Each frame's delta is clamped to 0.1s so a resumed frameloop doesn't skip the animation.
- **No opacity fade.** Materials are now shared across slots and instances, so per-piece opacity would need cloned materials. Scale, slide, and turn read clearly without it.
- **Full turntable spin.** Yaw is `BASE_YAW + t·2π/15 + slot·1.7` on the canvas clock: one revolution every 15s, continuous across swaps. A first pass used a 2× faster sway (`sin(t·0.7)·0.26`). The user then asked for a complete 360°, which replaced it. The backs of the pieces are modelled, so they hold up. Reduced motion keeps `BASE_YAW` static.
- **Clip-free fit, from the spin cylinder.**
  - `furnitureBounds(kind, group)` walks every vertex of a mounted model in the model's own frame, once per kind. It records the farthest vertex from the y axis (`radius`) and the lowest and highest points.
  - `fitScale(kind, bounds, aspect)` places the cylinder (`radius × height`, centred on the origin) in front of a replica of the slot camera (y 0.85, z 4.7, fov 30, looking at the origin). It binary-searches the largest scale at which 48 points on each rim, with the radius circumscribed by `1/cos(π/48)`, project within 90% of the frustum.
  - The aspect is read from `state.camera.aspect`, which drei sets to the slot's width/height every frame, so resizes refit automatically. Results are cached by kind and aspect.
  - Pieces scale about their centre (`position.y = −mid·scale·p`). The drop is 35% of the fitted half-height. Every in-between frame is therefore a convex blend of the fitted cylinder and a point on its axis, and the frustum is convex, so enter and exit can't clip either.
  - The shadow is a circle of 0.9 × the spin radius at the fitted base, inside the same cylinder.
  - The slot divs were not resized: the fit math alone guarantees no clipping. Wide tables come out smaller than tall pieces in the same slot, which is expected.
- **Module resource cache** (`furniture-models.tsx`). `shared(key, make)` replaces `useDisposable`. Keys encode the parameters, for example `box:${size}:${r}`, `wood:${colors}:${seed}`, and `brass`.
  - `CategoryCanvas` calls `retainFurniture()`. Its release disposes the whole cache on a 0ms timeout, so a StrictMode unmount and remount keeps it.
  - `useDisposable` stays in `lib/three/procedural.ts` for the materials section.
- **One studio environment.** `useStudioEnvironment` renders the same five lightformers that drei `<Lightformer>` would build into a 256px half-float cube target, once. These are plane or ring meshes with `MeshBasicMaterial`, `toneMapped: false`, double-sided, colour × intensity, facing the origin. Each view uses it through `<Environment map>`. That is one capture and one PMREM conversion instead of three per layout mount.
- **Idle prewarm.** `<Prewarm>` sits in the first view, behind the camera, so it is frustum-culled and never drawn. It mounts one model per step, runs `gl.compileAsync(scene, camera)`, uploads the cached textures with `initTexture`, and moves on in `requestIdleCallback` (falling back to `setTimeout`). Because the compile happens in a real view scene with the same lights and environment, the program cache keys match the visible pieces.
- **DPR cap** `[1, 1.5]`. The canvas is viewport-sized but draws only three small scissored views, so 2× mostly added fill cost.

## Changes (file → what)

- `components/sections/products-categories/furniture-models.tsx`:
  - Adds the module cache, `retainFurniture`, and `uploadFurnitureTextures`.
  - The material helpers become plain functions (`woodMaterial`, `brassMaterial`, `linenMaterial`, `boucleMaterial`).
  - Every geometry, material, and texture goes through `shared`. The dining top's cloned wood material and map are cached too.
  - Adds `furnitureBounds`. `FURNITURE` becomes `Record<FurnitureKind, Model>`, dropping the hand-tuned `scale`, `height`, and `footprint`.
  - Model shapes are unchanged.
- `components/sections/products-categories/category-canvas.tsx`:
  - Adds `Slot` with `swapEntries`, a reworked `Piece` (enter and exit, revive, fitted scale, centre pivot, turntable spin, circular shadow), `fitScale`, `useStudioEnvironment`, `Prewarm`, and `Stage`.
  - Caps `dpr` and retains the furniture cache.
  - The `CategoryCanvas` props are unchanged, so `category-stage.tsx` is untouched.

## Gotchas for future work

- Do not mutate cached materials per piece (opacity, colour). They are shared by every slot and instance. Clone them under a new cache key if a piece needs its own.
- Cache keys must include every parameter that changes the result. Two different shapes under the same key would silently share one geometry.
- The first prewarm step that reaches the armchair still draws the bouclé textures once, about 170ms, but in idle time. If that ever shows up as jank, lower the pebble texture size there.
- The L3/040 gotcha "every slot carries its own `<Environment frames={1}>`" no longer applies.
- If you move the slot camera, change `CAMERA_Y`, `CAMERA_Z`, or `FOV`. The fit replica reads the same constants. A camera set up separately would break the no-clip guarantee.
- The two desktop right-hand slots overlap vertically (0.25–14em and 10.4–24.15em). A pixel-edge test must ignore edge pixels that fall inside the neighbouring slot.
- Clicking the already-active category follows its link to `/shop`. Scripted checks must skip clicking the selected option.
- A backgrounded browser tab throttles rAF to about 1fps. Swap animations then look frozen in automated screenshots, and frame-time measurements mean nothing. Use long-task observation instead.

## Verification (commands + evidence)

- `pnpm --filter @legacy-crafts/storefront typecheck` passes.
- `npx eslint --no-warn-ignored` on both changed files reports 0 problems.
- `npx vitest run src/components/sections/products-categories` passes (2 tests).
- Browser (dev server, desktop ~1920px):
  - The pieces render with the same look as before: linen, bouclé, fluted glass, brass, and wood grain.
  - A mid-swap screenshot shows the incoming bookcase growing from the floor.
  - A `PerformanceObserver('longtask')` across eight category clicks recorded 0 long tasks.
  - For comparison, a page-side benchmark of the old per-swap bouclé redraw took about 170ms, and two wood textures took about 27ms.
  - A rapid 11-click sweep at 120ms intervals settles on the final category with no stray pieces and no console errors.
- Browser, 390px emulated: the three-slot row renders and animates in place. Device-metrics emulation cleared afterwards.
- No-clip check (after the 360° and fit change): a temporary script outside the repo ran headless Playwright Chromium (SwiftShader WebGL) against the dev server.
  - At 1440×900, and at 390×844 with DPR 2 and mobile emulation, it opened Chairs, Cabinets, Shelves, Stools, and Tables.
  - For each, it took four screenshots 3.75s apart, which is a quarter turn each.
  - It counted non-background pixels in a 2px band just inside each slot's edges, ignoring the band where the desktop right slots overlap.
  - Result: 0 hits in all 120 slot samples (40 screenshots × 3 slots), and no page errors.
  - The screenshots show the bookcase from behind at one angle, which confirms the full turn.
