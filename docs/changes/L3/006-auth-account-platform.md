# 006 — Auth, account & platform fixes

- Date: 2026-08-22 · Branch: `kimi` · Status: shipped
- Layer-2 anchor: WP-06

## Context / why

A mixed work package of audited stubs and runtime-discovered bugs handled between
agent waves: auth flows, account ergonomics, link integrity, rate limits, seeded
promotions, price sanity, and the image pipeline.

## Decisions made (and alternatives rejected)

- **Password change verifies the current password by re-login**, then calls
  `POST /auth/customer/emailpass/update` (`sdk.auth.updateProvider` with the session
  token) — Medusa v2 has no dedicated change-password route, and the update route
  trusts the authenticated actor, so current-password proof must happen client-side
  first. Forgot/reset uses the standard `resetPassword` → token → `updateProvider`
  flow (`/account/forgot-password`, `/account/reset-password`).
- **`localizeImageUrl()` instead of more `remotePatterns`**: the Next image optimizer
  rejects absolute `localhost` URLs even with explicit port entries (verified against
  `match-remote-pattern.js` in this Turbopack build; relative paths always pass).
  Same-origin absolute URLs are rewritten to relative; true CDN URLs stay absolute.
- **Prices normalized to MAJOR units**: the new seed products had been written
  paise-style (₹8,99,900 chair). Seed corrected and the dev DB repaired via a one-off
  `medusa exec` script (deleted after use); the original three products were repaired
  too. Medusa v2 prices are major units — this is now an AGENTS.md gotcha.
- **Promotions seed pattern**: create campaign (or reuse by `campaign_identifier`),
  attach, then `updatePromotions({status: "active"})` — promotions default to `draft`.
- **Category heroes use the generated category imagery** with accent gradient
  overlays (the flat gradient hero wasted the brand's best assets).
- **Reorder** re-adds all variant lines (quantity + design metadata) with per-order
  loading and an error surface for unavailable items.
- **Per-route rate limits** keyed `ip:auth:route` with a `strict` mode (no authed
  multiplier): 5/min review posts, 30/min wishlist posts, 200/min admin.

## Changes (file → what)

- `app/icon.png`, `public/icon-192.png`, `icon-512.png` → monogram icons (qlmanage/sips
  rasterization of the logo SVG, gold on walnut).
- `account/settings/page.tsx` → real password change; `account/forgot-password/page.tsx`,
  `account/reset-password/page.tsx` (new); `account/login/page.tsx` → forgot link +
  reset banner; `account/register/page.tsx` + `stores/auth-store.ts` → phone + terms.
- `account/orders/page.tsx` → Reorder; `account/orders/[id]/page.tsx` → status timeline.
- `components/layout/footer.tsx` → dead links removed (`/sale`, `/careers`, `/press`),
  real destinations; site-wide link audit clean.
- `apps/medusa/src/api/middlewares.ts` → strict per-route limits.
- `apps/medusa/src/scripts/seed.ts` → promotion campaign/activation, price units.
- `src/lib/images.ts` (new) → `localizeImageUrl`; applied in `product-card.tsx`,
  `image-gallery.tsx`, `blog-card.tsx`, `blog/[slug]/page.tsx`.
- `features/catalog/category-hero.tsx` → real category imagery + overlays.
- `features/blog/share-buttons.tsx` → hydration-safe deterministic URLs + `path` prop.

## Gotchas for future work

- All of these are now encoded in `AGENTS.md` §Hard-won gotchas — read before
  touching auth, pricing, images, or the account shell.

## Verification

- Typecheck per change; visual verification on shop/PDP/blog/category pages;
  `/store/promotions` returns both codes; zero page errors on PDP + blog article.
