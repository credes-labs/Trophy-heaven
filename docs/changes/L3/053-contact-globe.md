# 053 - Gold contact globe

- Date: 2026-10-29
- Layer-2 anchor: WP-78

## Context
Replace the contact hero image with the supplied Aceternity globe in a yellow/gold tone. Preserve its reusable exports and document every departure from the supplied source.

## Dependencies and source
No root or storefront components.json exists, so the manual path is used. Motion, Three, React Three Fiber and Drei were already installed; three-globe is added to the storefront. Geography is bundled from https://assets.aceternity.com/globe.json, linked by https://ui.aceternity.com/components/github-globe.

## Implementation differences and verification
Details follow with implementation.

## Every departure from the supplied implementation

| Place | Change | Reason |
|---|---|---|
| Installation | Manual installation; added only `three-globe` (2.45.6) plus its lockfile entries. | Neither repo root nor storefront has `components.json`; Motion, Three, R3F and Drei already exist. The existing `@/` alias is unchanged. |
| `src/data/globe.json` | Added the official Aceternity geography file locally (176 features). | The supplied import referenced a file that was not included in the snippet or project. Source: https://assets.aceternity.com/globe.json, linked by Aceternity's component documentation. No geography fetch is needed in the browser. |
| `components/globe-demo.tsx`: palette | Replaced the blue globe, cyan/blue/violet arcs, white atmosphere and cool lighting with bronze/yellow-gold, champagne points and warm lights. | Explicitly requested yellowish tone, matching the site's gold accent. Globe geometry, hex resolution/margin, arc paths, altitude/order values, atmosphere size, and normal arc/ring timings are preserved. |
| `globe-demo.tsx`: data lifetime | Hoisted configuration/arcs out of render; compacted the same 40 route objects into typed tuples, then mapped them back to the original object shape. Three gold colors cycle deterministically instead of being randomly chosen in render. | Prevents geometry from being rebuilt on parent renders and avoids unstable colors. All supplied route coordinates, orders and altitudes are unchanged. |
| `globe-demo.tsx` and `/contact` | Added an `embedded` option, used only by the contact hero. It fits the existing image cell, uses its inherited cream background, and fades to #F2F1EF. It omits the standalone soap demo heading/body and fullscreen wrappers. | Replace the specified photograph while preserving the real contact copy and page layout. The default standalone branch retains the supplied Tailwind class strings, text, one-second entrance and light/dark layout. All styling stays in Tailwind; no replacement inline/CSS styling is used. |
| `globals.css` | Added `@source "../components/globe-demo.tsx"`. | Ensures Tailwind v4 emits the supplied standalone color/dark utilities, which the initial workspace scan omitted. This adds utilities rather than replacing the source's classes or changing site theme tokens. |
| `ui/globe.tsx`: typing | Typed the group ref, point/accessor parameters and Phong material; adapted the third-party globe to the exact `Group.add` parameter type. Removed unused imports/variables and the unused RGB calculation. | React 19 requires a ref initializer, strict TypeScript rejects the source's untyped callback/ref, and three-globe's published Object3D inheritance typings are not structurally compatible with this Three type version. Removes unsafe `any` and lint problems without changing geometry. Kept every requested export. |
| `ui/globe.tsx`: materials/defaults | Material settings use merged defaults and preserve explicit zero values instead of falling back through `||`. | Avoids undefined color values and makes `GlobeConfig` defaults/zero values work as declared. |
| `ui/globe.tsx`: lifecycle | Removes the globe from its group, pauses it and calls its destructor when replaced/unmounted. Ring subset indices are effect-local rather than an unused module variable. | Prevents orphaned animation loops/resources during navigation, Strict Mode and media-preference changes. The normal ring interval remains 2000ms. |
| `World` / `WebGLRendererConfig` | Memoized the scene/camera, initialized camera z=300 explicitly, and updated renderer effect dependencies for size changes. Rotation now honors `autoRotate` and `autoRotateSpeed` (the supplied demo config specifies 0.5) rather than hardcoding true/1. | Maintains a stable camera when React rerenders, handles viewport changes and makes the public configuration effective. Renderer clear color/alpha, fog, lights, clipping planes, polar bounds and no-pan/no-zoom controls stay as supplied. |
| `hooks/use-prefers-reduced-motion.ts`, demo, globe | Added an SSR-safe live media-preference hook. Reduced mode skips the entrance movement, initial globe growth, auto-rotation, damping, travelling arc dashes and pulsing rings. It displays static arcs instead. Normal entrance/arc timing is still 1000ms and ring interval 2000ms. | The supplied source contains no reduced-motion handling despite the requested check. Using the shared external-store hook also avoids a server/client Motion hydration mismatch and responds immediately to preference changes. |
| `genRandomNumbers` | Bounds the requested count to the available integer range; handles invalid/empty ranges and nonfinite inputs. | The supplied loop never terminates if more unique indices are requested than exist. Valid calls used by the demo retain their behavior. `hexToRgb` behavior is unchanged. |
| Tests and formatting | Added two helper regression tests and formatted new components with the repository's Prettier rules. | Verifies malformed colors and nonterminating ring-count edge cases; uses the project's formatting conventions. Renderer dependencies are mocked only in these pure helper tests. |

## Verification evidence
- Real Chromium/SwiftShader at 1440x1000 and 390x844 rendered the gold globe. No browser console errors, page errors or warnings occurred in the contact-page checks; no horizontal overflow.
- Switched reduced motion on while the page was open: the live flag updated and repeated globe screenshots were byte-identical. Normal-mode rotation/arcs/rings were visible before the change.
- Exercised the default standalone demo through a temporary QA route (removed afterward). Light mode computed black text/white background; dark mode computed white text/black background. No console or hydration errors after the SSR-safe preference fix.
- The temporary page and QA scripts are not part of the final implementation.
- Required gate/build results follow below.

**Additional source detail:** The embedded globe has an accessible image label, and data attributes expose its canvas/reduced-motion state for browser verification. These attributes do not alter the visual design. The source's unused default React import and unused RGB/global-ring variables were omitted; exported helper names remain unchanged.

**Final gates:** Root lint passed (7 existing warnings), root typecheck passed, and all 172 unit tests passed (110 storefront, 18 schemas, 44 Medusa). The root test script still encounters the documented Windows TEST_TYPE syntax issue, so Medusa was run with the PowerShell environment workaround. Root pnpm build passed for the storefront, shared packages, Medusa backend and admin frontend. Source whitespace checks passed. Contact checks ended with zero browser warnings or errors; standalone light/dark checks ended with zero console/hydration errors. The two helper tests mock rendering dependencies and emitted no duplicate-Three warning in the final suite.
