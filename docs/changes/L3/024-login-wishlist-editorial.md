# L3-024: Login + wishlist editorial

- Date: 2026-08-31 · Status: shipped
- Layer-2 anchor: WP-26

## Context

Auth screens still used serif Card + gold Logo chrome. Wishlist sat in the same gold-icon account shell and rendered the old bordered ProductCard.

## Changes

- Shared `AuthFrame` (watermark, eyebrow, Outfit H1, underline fields, pill submit).
- Login, register, forgot-password, reset-password use that frame. Copy kept for e2e (`Welcome back`, `Create account`, `Reset your password`, Email labels).
- Account shell: cream Outfit canvas, text nav (no Lucide), hairline logout. AUTH_PATHS unchanged.
- Wishlist: watermark `saved`, editorial product tiles, underline Remove, empty-state pill to shop.

## Verification

- Browser: `/account/login`, forgot-password hop, `/account/wishlist` (login or empty redirect).
- `pnpm --filter @legacy-crafts/storefront typecheck`
