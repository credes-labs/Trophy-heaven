# 057 - Mixed-product silhouette mosaic

- Date: 2026-10-31
- Layer-2 anchor: WP-86

## Change
Replaces the shared furniture-only SilhouetteGrid with the user's supplied mixed-product mosaic. Adds the six sculpture/trophy meshes and supporting shape extrusion helpers, and applies the supplied cell kinds and fitting fractions. Existing furniture meshes, 12-column/6-row arrangement, transparent background, shaded ink, seven-second turns and swept-radius camera fit are preserved.

## Integration
The only SilhouetteGrid implementation is `features/shop/silhouette-grid.tsx`; SilhouetteHero dynamically imports it for the shop. No new dependencies or image assets are needed. The existing null-ref type guard is retained in place of the source's unchecked array assertion, and the accessible description now includes trophies/sculptures.

## Verification
Pending checks.

## Verification results
- Root lint passed with 7 existing warnings; root typecheck passed.
- Root tests passed 18 schema tests before the documented Windows TEST_TYPE script failure. Direct storefront Vitest passed 113 tests and Medusa Jest with PowerShell TEST_TYPE passed 44 (175 total).
- Chromium/SwiftShader on /shop at 1440px and 390px rendered all 15 cells, rotated between screenshots, had no page errors and no horizontal overflow. Screenshots were visually inspected.
- Reduced-motion screenshots were byte-identical. Source whitespace check passed. Production build result follows.

**Production build:** Root pnpm build passed, including storefront and Medusa backend/admin. Existing Next Edge runtime warning remains.
