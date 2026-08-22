# AGENTS.md — AI readme for the Legacy Crafts repo

Read this before making any change. It records the stack decisions, the conventions
that are NOT obvious from the code, the gotchas that have already bitten once, and
the mandatory change-logging process.

## What this repo is

Premium ecommerce for trophies / furniture / artwork: Next.js 16 storefront
(`apps/storefront`, :3000) + Medusa v2.18 backend (`apps/medusa`, :9000) +
shared packages (`packages/*`). Razorpay for payments. Postgres 18 + Redis 7 +
Meilisearch v1 via `docker-compose.yml`.

## Golden rules

1. **Verify before you finish**: `pnpm -r typecheck && pnpm -r lint && pnpm -r test`
   must stay green; run `pnpm -r build` before merging. e2e:
   `pnpm --filter @legacy-crafts/storefront test:e2e` (needs dev servers running).
2. **Log every change** in the 3-layer change log — see
   [`docs/changes/INDEX.md`](docs/changes/INDEX.md). One line in L1, a paragraph in
   L2, and an L3 detail file for anything non-trivial. This is not optional.
3. **Minimal diffs.** Match the surrounding code style; no drive-by refactors.
4. Do not commit `.env` or secrets. Templates live in `.env.example` and
   `apps/storefront/.env.template` — keep them in sync when adding env vars.

## Hard-won gotchas (do not re-learn these)

- **Next.js 16**: `params`/`searchParams` are Promises — always `await` them.
  `next dev` allows only ONE dev server per project directory. Route handlers that
  use `useSearchParams` need a `<Suspense>` boundary. Docs ship in
  `apps/storefront/node_modules/next/dist/docs/`.
- **Medusa v2 prices are MAJOR units** (₹, not paise). Seeding `899900` means
  ₹8,99,900, not ₹8,999. Any price seed/migration must respect this.
- **Medusa v2 promotions without a campaign stay `draft`** — seed creates them
  inside an active campaign and sets `status: "active"` explicitly.
- **The Next image optimizer rejects absolute `localhost` URLs** even with correct
  `remotePatterns` port entries (Turbopack dev). Product/blog images seeded with
  storefront-origin URLs must pass through `localizeImageUrl()`
  (`apps/storefront/src/lib/images.ts`) — use it anywhere you render a
  backend-sourced image URL with `next/image`.
- **`CardTitle` renders a `div`, not a heading** — e2e tests must not query it by
  heading role.
- **Account auth guard**: `AUTH_PATHS` in
  `apps/storefront/src/components/features/account/account-shell.tsx` lists the
  pages reachable while logged out. Add new public account pages there or they
  bounce to `/account/login`.
- **Rate limiting** is in-memory per node (`apps/medusa/src/api/middlewares.ts`,
  100/min store, strict 5/min reviews, 30/min wishlist posts, 200/min admin).
  Test/screenshot bursts will trip it — that's expected, not a bug.
- **Wishlist/cart/auth run on the client-side Medusa SDK with JWT**
  (`apps/storefront/src/lib/medusa.ts`) — RSC fetches for customer data will 401;
  follow the account-pages pattern, not server fetches.
- **axe + animations**: scroll-reveal sections measure mid-fade in axe runs and
  produce spurious color-contrast violations; the e2e spec scrolls the page and
  waits before analyzing. Keep that pattern.
- **Gold text on light backgrounds fails WCAG AA** — use `text-gold-dark`
  (`--color-gold-dark` in `globals.css`) for any text-sized gold on cream/champagne;
  `text-gold` is for dark surfaces and decorative icons only.

## Brand contract (do not dilute)

Champagne `#FBFBF7` / cream `#E0D8C3` surfaces, walnut `#331207` text, gold
`#B89E6B` accents. Category accents: burgundy `#8A2D25` trophies, midnight blue
`#191D26` furniture, olive/brass artwork. Playfair Display for headlines, Inter for
body. Tone: minimal, elegant, editorial — "Crafted with intention. Built to last."
Tokens: `apps/storefront/src/app/globals.css`. Full spec: `.cursor/plans/00-master-plan.md`.

## Architecture decisions (recorded)

- **No Payload CMS** — blog/CMS is the Medusa `blog` module (one backend, one DB,
  one auth). Revisit only if editorial workflows outgrow Medusa admin.
- **Razorpay chain**: checkout passes `order_id` + session amount →
  `app/api/checkout/verify-razorpay/route.ts` HMAC-verifies before cart completion →
  `apps/medusa/src/api/webhooks/razorpay/route.ts` processes captured/failed with
  the `webhook-events` idempotency module. Never bypass verification.
- **Imagery**: generated brand PNGs live in `apps/storefront/public/images/` with
  prompts in `manifest.json`. New imagery must match that style and be added to the
  manifest. No placeholder boxes — ever.
- **Deferred with reasons** (see `.cursor/plans/KIMI-EXECUTION-STATUS.md`):
  Google OAuth, delete-account, server-persisted notification prefs, listing rating
  filter, Redis-backed rate limiting.

## Where things live

| What | Path |
|------|------|
| Design tokens / brand | `apps/storefront/src/app/globals.css` |
| Animation variants | `apps/storefront/src/lib/animations.ts` |
| Category configs (copy/accents/images) | `apps/storefront/src/lib/category-config.ts` |
| Medusa custom modules | `apps/medusa/src/modules/{blog,reviews,wishlist,webhook-events,...}` |
| Store API routes | `apps/medusa/src/api/store/` |
| Seeds | `apps/medusa/src/scripts/seed.ts`, `seed-content.ts` |
| Product/tech spec | `docs/kit/` |
| Design/page spec + build tracker | `.cursor/plans/` |
| Change log (mandatory) | `docs/changes/` |
