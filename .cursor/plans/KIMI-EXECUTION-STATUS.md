# Kimi Execution Status — Legacy Crafts

> Living tracker for the `kimi` branch build. Resume with one goal command:
> `/goal Continue the Legacy Crafts build per .cursor/plans/KIMI-EXECUTION-STATUS.md`
> Source-of-truth spec: the documents in this directory (`00-master-plan.md` and subfolders).
> Brand source: Legacy Crafts identity deck (PDF) — see `00-master-plan.md` §Brand DNA.

## Brand contract (from identity deck)

- Name: **Legacy Crafts** — FURNITURE. DECOR & MORE — Bangalore, India
- Mark: four-petal monogram of interconnected lowercase "l" forms (maker's mark)
- Palette: Stone cream `#E0D8C3` / champagne `#FBFBF7` base, walnut `#331207` text,
  gold `#B89E6B` accents; category accents — **burgundy `#8A2D25` = trophies**,
  **midnight blue `#191D26` = furniture**, **olive/brass green = artwork**
- Type: Playfair Display (serif headlines) + Inter (body); letter-spaced small-caps labels
- Voice: "Crafted with intention. Built to last." / "Crafted to Last." / materials: brass,
  stone, wood, leather, steel — minimal, elegant, modern; editorial serif headlines,
  thin gold rules, generous whitespace

## Status legend: ✅ done · 🔶 partial · ⬜ missing

### Phase 0 — Baseline (this branch)

| Item | Status |
|---|---|
| Brand PDF extracted (15 pages, image-rendered + reviewed) | ✅ |
| `kimi` branch created from `main` (carries prior uncommitted work) | ✅ |
| Skills installed from skills.sh → `.agents/skills/`: vercel-react-best-practices, web-design-guidelines, vercel-react-view-transitions, vercel-composition-patterns | ✅ |
| Full audit (storefront / backend / assets-SEO) vs plan docs | ✅ |
| Baseline typecheck: storefront+packages ✅, medusa ❌ (8 errors in `scripts/seed.ts`) | 🔶 fixing (Wave A) |

### Wave A — functional gaps (in flight)

| Work package | Agent | Status |
|---|---|---|
| Medusa: seed.ts type errors; Razorpay webhook processing + idempotency; authorizePayment real verification; DB unique/composite indexes (blog/wishlist/reviews); seed 9 products + imagery + 5 reviews each + blog covers/SEO fields; `/store/contact` + `/store/newsletter` routes; write missing `backend/03-razorpay.md` | coder (backend) | 🔄 |
| Storefront: checkout passes `order_id` + session amount + signature verification before cart completion; promo codes wired to Medusa promotions; coupons page real data (new `/store/promotions` route); wishlist hearts → wishlistApi; env templates `NEXT_PUBLIC_RAZORPAY_*`; newsletter/contact forms → backend | coder (commerce) | 🔄 |

### Wave B — content, SEO, broken links (queued)

- ✅ Wave B agent completed (bestsellers carousel, order confirmation, PDP reviews,
  JSON-LD suite, placeholder→real imagery, blog TOC/author/newsletter, legal copy)
- ✅ Promotions seeded (WELCOME10 10%, LEGACY500 ₹500 — active campaign) after
  fixing draft-status/campaign wiring; `/store/promotions` live
- ✅ Prices normalized to major units (seed + dev DB repair, all 10 products realistic ₹)
- ✅ Broken product images fixed: `lib/images.ts` `localizeImageUrl` rewrites
  same-origin absolute URLs to relative (Next image optimizer rejects localhost
  absolute URLs even with remotePatterns port entries); applied in ProductCard
- ✅ Wave C agent completed (shop filters+slider+toggles+subcats+ItemList JSON-LD,
  category inline filters, PDP share/discount/EMI/SKU/OOS/gallery zoom+keyboard,
  hero parallax+Ken Burns+word reveal, brand-values ring draw-in, testimonials
  autoplay+monograms, cart cross-sell+sticky mobile bar); 40 storefront tests green
- ✅ ShareButtons hydration mismatch fixed (deterministic URL from base + path prop);
  PDP gallery localized; PDP verified visually with zero page errors
- ✅ Category heroes now use the real category imagery (cat-trophies/furniture/artwork.png)
  with accent gradient overlays — verified visually; category pages show correct
  product counts (4/3/3)
- ✅ Blog covers + article heroes localized (blog-card.tsx, blog/[slug]/page.tsx) —
  verified visually; mobile shop confirmed 10 products

- ✅ Footer dead links; designs "Open" 404 (now → `/customize/[productId]/2d|3d?design=`);
  PDP breadcrumb/related links → branded category pages
- ✅ Bestsellers carousel section on landing
- ✅ Order confirmation page: order fetch, `#LC-<display_id>`, delivery estimate, share
- ✅ PDP reviews tab → real reviews module (average, distribution, sort, write-a-review)
- ✅ JSON-LD: BlogPosting, BreadcrumbList, Organization+WebSite, FAQPage; ItemList on shop
- ✅ Favicon + `icon-192.png` / `icon-512.png` generated from the monogram
- ✅ Orphaned assets wired: hero crossfade uses all 3 hero images; blog covers seeded
- ✅ Placeholder imagery replaced: craftsmanship-story panel, category story block,
  related-category cards (real images + accent overlays)
- ⬜ Settings stubs: delete account, server-persisted notification prefs (see Deferred)
- ✅ Auth: real password change in settings (current-password verified via re-login,
  then `auth.updateProvider` with session token); forgot-password + reset-password
  pages wired to Medusa reset flow; login page link + success banner; register page
  gained phone field + terms/privacy consent checkbox (passed through auth-store)
- ✅ Orders: Reorder button now re-adds all available variant lines to the cart
  (per-order loading state, error surface for unavailable items); order detail page
  gained a 4-step status timeline (Placed→Processing→Shipped→Delivered, gold accents)
  with estimated delivery date
- ✅ Wave A backend agent completed: seed.ts typecheck fixed (8→0); Razorpay webhook
  processes captured/authorized/failed with `webhook-events` idempotency module;
  authorizePayment verifies against Razorpay API; unique/composite index migrations
  (blog/wishlist/reviews); seeds now cover all 9 product PNGs + idempotent backfill,
  6 blog posts with covers/SEO/published_at, 5 reviews per product; `/store/contact`
  + `/store/newsletter` routes; wrote missing `backend/03-razorpay.md`. Live-smoked:
  migrations applied, seeds run twice idempotently against dev Postgres.
- ✅ Wave A commerce agent completed: Razorpay order_id + session amount + server-side
  HMAC verify route; promo codes apply/remove on cart + discount row; coupons page on
  real `/store/promotions` route; wishlist hearts synced via use-wishlist hook;
  env templates; newsletter/contact forms → backend. typecheck/test/lint green.
- ✅ Footer dead links removed (/sale, /careers, /press); footer now links only to
  existing routes (added All Products + Corporate & Bulk Orders); site-wide internal
  link audit clean
- ✅ e2e smoke spec extended: category pages, footer dead-link regression, login +
  forgot-password flow, register terms/phone, mobile bottom-nav visibility (12 tests)
- ✅ Landing hero polish: parallax + Ken Burns + word-by-word headline; BrandValues ring draw-in
- ✅ Shop filters: subcategory nesting, availability + customizable toggles,
  dual-handle price slider + 300ms debounce, `categoryCounts` fixed; rating deferred
- ✅ Category pages: inline Price/Material filters; trophies story CTA → customizer
- ✅ PDP completeness: share, rating summary, compare-price badge, EMI note, SKU,
  aggregateRating JSON-LD, OOS variant states, gallery hover-zoom + lightbox keyboard nav
- ✅ Blog article: sticky TOC, author bio card, newsletter CTA
- ✅ Per-route rate limits: POST /store/reviews 5/min, POST /store/wishlist 30/min,
  /admin/* 200/min (strict, per-route buckets in `api/middlewares.ts`)
- ✅ Privacy/terms: final brand-voiced copy (DPDP Act 2023, Consumer Protection Act 2019)

### Wave C — verification

- ✅ `pnpm -r typecheck` — clean across all 4 projects
- ✅ `pnpm -r lint` — 0 errors (5 pre-existing warnings)
- ✅ `pnpm -r test` — 72 unit tests green (schemas 18, storefront 40, medusa 14)
- ✅ `pnpm -r build` — storefront + medusa + packages all build
- ✅ Playwright e2e — 22/22 (11 tests × chromium+mobile) incl. axe WCAG2A/AA on home;
  fixed en route: gold-on-champagne contrast (new `--color-gold-dark` token applied to
  on-light text), aria-prohibited-attr on star ratings, account-shell auth-path
  exemption for forgot/reset pages, ShareButtons hydration mismatch
- ✅ Visual UX pass — desktop 1440 + mobile 390 screenshots reviewed for home, shop,
  all 3 categories, PDP, blog listing + article, about, login; brand deck alignment
  verified (walnut/cream/gold base, burgundy/blue/olive category accents, Playfair
  Display + Inter, maker's-mark motifs)

### Deferred (documented, non-blocking)

- Google OAuth login (needs provider config + keys); delete-account (needs admin
  workflow); server-persisted notification prefs (currently localStorage); rating
  filter on listings (needs per-product rating field or Meilisearch facet — skipped
  with code comments rather than faked); Redis-backed rate limiting for multi-node.

### Notes

- Dev-only: burst traffic from the test/screenshot runs trips the 100/min in-memory
  store rate limiter (`Too Many Requests` in dev console) — expected under load
  testing, not a product defect.
- Work is uncommitted on branch `kimi` (142 changed paths) — commit/push left to the
  user per repo policy.

## Architecture decisions (recorded)

- **Payload CMS:** not added. CMS needs (blog posts/categories with SEO fields, admin
  CRUD) are served by the Medusa `blog` module + admin/store routes, keeping one backend,
  one DB, one auth. Adding Payload would duplicate that stack; revisit only if editorial
  workflows outgrow the Medusa admin.
- **Image generation:** no external image model (e.g. Gemini) is available in this
  environment. All 18 brand assets already exist as real 1536×1024 PNGs in
  `apps/storefront/public/images/` (see `manifest.json` with the generation prompts).
  New imagery must match that manifest's style; if more is needed, generate with the
  same prompts style and add to the manifest.
- **Icons:** favicon (`app/icon.png`) + PWA `icon-192/512.png` generated from the
  four-petal monogram (gold `#B89E6B` on walnut `#331207`) — ✅ done on this branch.

## Multi-agent setup

- Backend work → coder subagent scoped to `apps/medusa` + `packages/*`
- Storefront commerce → coder subagent scoped to `apps/storefront` (+ single new medusa route when needed)
- Content/SEO/polish → coder subagent(s) on `apps/storefront`, waves sequenced to avoid file conflicts
- Audits/UX review → explore subagents (read-only)
- Product/hero/blog imagery → already generated as real 1536×1024 PNGs in
  `apps/storefront/public/images/` (see `manifest.json`); new images must match that
  style (warm walnut/brass/cream, editorial studio photography look). If an external
  image model (e.g. Gemini) is unavailable in the environment, reuse/remix existing
  assets rather than shipping placeholders.

## Verification commands

```bash
pnpm -r typecheck && pnpm -r test && pnpm -r lint && pnpm -r build
pnpm --filter @legacy-crafts/storefront test:e2e   # needs dev servers; see Makefile
make up && make migrate && make seed               # local backing services + seed
```
