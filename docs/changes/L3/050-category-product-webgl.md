# 050 - Category product WebGL

- Date: 2026-10-29
- Layer-2 anchor: WP-73

## Context / why
Restore the former category canvas using the products now listed, with geometry informed by their actual photographs.

## Changes
- `constants.ts`: typed nine-model registry and three discipline tuples.
- `category-stage.tsx`: shared canvas slots, lazy loading, keyboard/hover/wheel selection and typed activation.
- `category-canvas.tsx`: reuse the earlier multi-view studio environment, camera fitting and enter/exit animation.
- `product-models.tsx`: procedural product geometry, material textures and lifecycle-managed caches.

## Verification
Pending implementation checks.

## Decisions and lifecycle
- These are procedural interpretations of the listed product photographs, not scanned product models. Three models per discipline match the three reference images in constants.
- The existing shared fixed multi-view canvas retains fitted camera bounds, cached studio lighting, directional entry/exit, and slow rotation. Cached model resources are explicitly kept alive across transitions and disposed after the last canvas releases them.
- Product photos remain visible during startup and after context loss or a canvas error. Canvas loading waits until the stage approaches the viewport; rendering pauses outside its observation margin. Reduced motion suppresses rotation and category transitions.
- Smaller mobile category text prevents clipping. Right-hand slots have a gap to prevent their models touching.

## Verification results
- `pnpm lint`: passed, 7 existing warnings.
- `pnpm typecheck`: passed. The old string/DisciplineId error is resolved.
- `pnpm test`: schema 18/18, then the documented Windows TEST_TYPE script issue; direct storefront Vitest 103/103 and Medusa Jest with PowerShell TEST_TYPE 44/44.
- Local Chromium/SwiftShader at desktop 1440x1000: canvas rendered, all three categories selected via hover, screenshots visually inspected, no page errors.
- Mobile 390x844: models render, category options fit, keyboard selection works, no horizontal overflow. Reduced-motion model screenshots were byte-identical across frames.
- Forced actual WebGL context loss: canvas unmounted, product photo fallbacks restored, no page errors.
- `git diff --check` for category sources: passed.
