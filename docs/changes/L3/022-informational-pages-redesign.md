# L3-022: Redesign Informational & Support Pages to Match Editorial Design Language

**Date:** 2026-08-29  
**Status:** Complete  
**Related PR / Task:** Redesign of 10 unstyled/generic informational & support pages to match new homepage design tokens (`Outfit` typography, `F2F1EF` surface styling, fluid clamp scaling, and editorial atelier layout).

---

## Context & Motivation

The homepage and core catalog pages were recently overhauled with the custom Figma editorial language (Outfit typography, fluid scaling via `clamp()` and `min(1rem, 100vw/90)`, `#131111` / `#F2F1EF` / `#FBFBF7` palette, and gold accents). However, several informational, policy, corporate, and support pages remained on older, generic templates with standard shadcn card boxes and basic layouts.

## Changes by Page

All ten routes now use shop/homepage primitives: cream `#F2F1EF`, Outfit, 8px-dot eyebrow, giant faint watermark, underline text CTAs, black pill CTAs with cream dot, hairline `#CDCDCD` dividers, `rounded-[0.125em]` images. No Lucide icon grids, gold tracking badges, or white shadowed cards.

1. **About (`/about`)**: Shop-style split hero + watermark `legacy`, rotated-rule stats (`//Legacy in numbers`), three discipline image links, workshop film strip, pill CTA.
2. **FAQ (`/faq`)**: Watermark `ask`, underline category filters, hairline accordion (shop-size grey chevron), aside + pill CTA.
3. **Contact (`/contact`)**: Split hero + watermark `hello`, underline fields, pill submit, studio aside + map.
4. **Shipping (`/shipping-returns`)**: Watermark `send`, underline tabs, hairline tier rows / numbered return steps.
5. **Privacy / Terms**: Watermark `legal`, numbered `01 / TITLE` sections, sticky contents, text link between policies.
6. **Corporate (`/corporate`)**: Watermark `honor`, shop hero, un-iconed feature list, hairline bulk calculator.
7. **Bulk (`/corporate/bulk`)**: Watermark `list`, underline wizard steps, editorial fields/selects, pill continue (no boxed form chrome).
8. **Offline (`/offline`)**: Watermark `offline`, pill to cart, text link home (server component — links only).
9. **API docs (`/api-docs`)**: Editorial header + Scalar `<script>` as siblings outside the shell.

Shared primitives: `apps/storefront/src/components/layout/editorial/{editorial-shell,editorial-eyebrow,editorial-watermark,editorial-cta}.tsx`.

## Verification

- Storefront `typecheck` green after bulk-wizard restyle (`pnpm --filter @legacy-crafts/storefront typecheck`).
- Playwright MCP: viewport shots of homepage/shop plus all 10 routes; FAQ Customization filter; Shipping → Returns tab; bulk wizard step 1 after restyle.
- Cursor IDE browser: walk of the same routes for visual confirmation.
