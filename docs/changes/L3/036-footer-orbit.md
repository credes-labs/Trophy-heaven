# 036 — Footer 3D orbit

- Date: 2026-10-25 · Branch: `ashish/frontend-revamp` · Status: shipped
- Layer-2 anchor: WP-39

## Context / why

The five footer polaroids were replaced with transparent PNG cutouts (451×553). The brief was a light, detailed 3D piece with all five revolving in a circle above the Shop / Company / Support columns.

## Decisions made (and alternatives rejected)

- **Plain three.js, not React Three Fiber.** The footer is on every page. The scene is one ring of five planes, so the R3F reconciler and drei would be weight with no benefit. `orbit-scene.ts` is a framework-free `mountOrbit()` that returns `start / stop / dispose`.
- **Billboarded cutouts, not planes facing outward on the ring.** The sources are flat photographs. A plane turned with the ring shows edge-on at the sides and mirrored at the back. Billboarding keeps each piece readable at every angle. Depth comes from perspective scale, sort order, soft contact shadows on the floor, a thin gold orbit line, and fog into the footer paper.
- **No real 3D models or lighting.** The cutouts already carry studio light. Lit materials would only flatten them.
- **Lazy and paused.** three.js is a dynamic `import()` that fires 600px before the footer reaches the viewport. A second IntersectionObserver stops the rAF loop while the footer is off screen. DPR is capped at 2 and the context asks for low power.
- **Fallbacks.** Until the textures load, and always under `prefers-reduced-motion` or without WebGL, a static row of the same five PNGs is shown with `next/image`. The wrapper is one `role="img"` with the five descriptions as its label.
- **Framing from the frame aspect.** The ring radius is a share of the camera distance, `k = clamp(0.66·tan(fov/2)·aspect, 0.16, 0.46)`. The camera backs off until the cards fit the height and the side cards clear the frame edge. One formula serves the wide desktop band and the 390px phone.

## Changes (file → what)

- `components/layout/footer/orbit-scene.ts` — new. Scene, textures (sRGB, max anisotropy, mipmaps), shadows, orbit line, fog, layout, loop, disposal.
- `components/layout/footer/footer-orbit.tsx` — new client wrapper: lazy import, visibility start/stop, reduced motion, static fallback, crossfade on ready.
- `components/layout/footer/cta-band.tsx` — mounts `FooterOrbit` where the strip was (`lg:top-[13.5em] lg:h-[22.375em]`; 15rem / 20rem tall below `lg`).
- `components/layout/footer/constants.ts` — `FOOTER_POLAROIDS` → `FOOTER_ORBIT` (src + alt) and `FOOTER_ORBIT_PERIOD` (36s).
- `components/layout/footer/polaroid-strip.tsx` — deleted.
- `public/images/manifest.json` — footer entries now list the PNGs.

## Gotchas for future work

- File names do not match their subjects: `coffee-table.png` is the dining set and `dining-set.png` is the coffee table. `longue-chair.png` is spelt that way on disk. The alt text follows the picture. Rename files and constants together.
- `CARD_ASPECT` assumes 451×553 sources. Cutouts with a different aspect will stretch until it is changed.
- In `next dev` the first scroll to the footer compiles three.js, so the static row shows for a few seconds. Production loads one prebuilt chunk.
- The old `public/images/footer/*.jpg` files are no longer referenced.

## Verification (commands + evidence)

- `pnpm --filter @legacy-crafts/storefront typecheck`, `lint` (0 errors; 1 existing warning in `dropdown-menu.tsx`), `test` (64/64).
- Browser, desktop ~1024 CSS px: canvas mounts (1815×451 backing at DPR ~1.8), all five pieces on the ring, the orbit line fully inside the frame, no console errors.
- Browser, 390px emulated: ring spread across the width with no stacked pieces; emulation cleared afterwards.
