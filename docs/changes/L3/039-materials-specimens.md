# 039 — Homepage material specimens

- Date: 2026-10-25 · Branch: `ashish/frontend-revamp` · Status: shipped
- Layer-2 anchor: WP-51

## Context / why

The homepage materials block was a six-item text grid (Optical crystal, Cast brass, Solid walnut, Kiln-dried teak, Full-grain leather, Honed stone). The replacement is a shared WebGL canvas with one procedural specimen per name. The geometry was built for walnut, brass, linen, teak, leather, and jute, so Optical crystal and Honed stone leave this section.

## Decisions made (and alternatives rejected)

- **Keep the server section shell.** `MaterialsSection` stays the named export `app/page.tsx` already imports. The eyebrow, the headline, and `SectionShell` stay on the server. The canvas is a client child.
- **Dynamic import, `ssr: false`.** `materials-loader.tsx` loads `materials-canvas.tsx` with `next/dynamic`. three and `@react-three/fiber` are a separate chunk. The names are in the server HTML before that chunk arrives. No second Outfit font, no `package.json` change.
- **Views live inside the one canvas.** drei 10’s `<View>` ignores `track` when it renders outside the canvas (it tracks the empty div it creates). Each specimen is `<View track={slot}>` inside the canvas, aimed at the `h-48` div above the name. Hover is `onPointerEnter` on the `<li>`. The canvas has `pointer-events: none`.
- **Fixed viewport canvas.** Recorded in WP-49. An in-flow canvas’s screen offset goes stale on scroll, and the specimens slide off their names. The canvas is portaled to `document.body`, `position: fixed`, `z-index: 30`, clear alpha 0. It only draws into the slot rects.
- **Copy stays local.** This section does not read `brand-facts`. `docs/content/homepage-copy.md` still lists Optical crystal and Honed stone; the page does not.
- **Dispose once.** Textures and the cushion, teak, and leather geometries use `useDisposable`. Those meshes set `dispose={null}` so React Three Fiber does not dispose the same geometry again. JSX geometries (tube, lathe, cylinder) are disposed by the reconciler.

## Changes (file → what)

- `components/sections/materials/index.tsx` — server shell: eyebrow, headline, `MaterialsLoader`.
- `components/sections/materials/copy.ts` — the six names and bodies.
- `components/sections/materials/materials-list.tsx` — two columns, three from `lg`, slot above each name.
- `components/sections/materials/materials-loader.tsx` — client boundary, reduced motion, dynamic canvas.
- `components/sections/materials/materials-canvas.tsx` — procedural textures and the six meshes (walnut tube, brass lathe, linen cushion, fluted teak, bent leather, rolled jute), one canvas, six views.

## Gotchas for future work

- Do not move `<View track>` outside the canvas. In drei 10 that prop is ignored there, and the specimen draws into a zero-height div.
- Do not put the canvas back in normal flow without updating its screen offset on every scroll frame. See WP-49.
- `prefers-reduced-motion` sets float speed to 0 and skips the spin. The canvas still mounts.
- The first visit in `next dev` compiles the three chunk when the loader hydrates. Names show immediately; the objects appear when the chunk is ready.
- Sticky header is `z-40`. The canvas is `z-30` and does not receive pointer events. Specimens can paint over the header if a slot scrolls underneath it, because the canvas is a viewport layer.

## Verification (commands + evidence)

- `pnpm --filter @legacy-crafts/storefront typecheck` and eslint on `src/components/sections/materials` (0 errors).
- Browser, desktop: `//materials`, “We name what we use.”, six specimens in their slots (walnut rail, brass cap, linen cushion, fluted teak, leather panel, jute roll). One `<canvas>`, `pointer-events: none`. After hover on the walnut item the specimen is still drawing (the rail had turned). After scroll, objects stay on their names and the product band below is uncovered. No Next.js error overlay.
- Browser, 390px emulated: grid is two columns (`167px` + `167px`), six names, `scrollWidth === clientWidth === 390`. Device-metrics emulation cleared afterwards.
- Network: `materials-canvas` and `three/build/three.module` load as their own chunks, not in the initial homepage script.
