# L2 — Work packages

A paragraph per work package: what, why, key files, verification. Deep detail in the
linked L3 files. Newest first; anchor IDs (WP-NN) are stable — reference them from L1
and L3.

## WP-08 — Documentation & change logging (2026-08-22)
**What:** rewrote `README.md` (setup, stack rationale, scripts, doc map); wrote
`AGENTS.md` (AI readme with golden rules, gotchas, brand contract, architecture
decisions); created the 3-layer change log in `docs/changes/`. **Why:** the repo had
setup docs but no agent-facing conventions, no record of stack decisions (no-Payload,
pricing units, image localization), and no durable change memory. **Files:**
`README.md`, `AGENTS.md`, `docs/changes/*`. **Verified:** doc links resolve; rules
match the actual gates that ran green.

## WP-07 — QA, accessibility & merge (2026-08-22)
**What:** fixed WCAG failures found by axe (gold-on-champagne text → new
`--color-gold-dark` token applied to all on-light text; `role="img"` on star ratings);
fixed e2e flakiness from scroll-reveal animations (scroll-and-settle before axe);
fixed account-shell auth guard for the new forgot/reset pages; ran the full gate suite
and merged `kimi` → `main` (`23715ce`, fast-forward). **Why:** "done" means verified —
a11y is a brand requirement, and the merge integrates 340 files of work. **Files:**
`globals.css`, eyebrow/label usages across 15 files, `e2e/smoke.spec.ts`,
`account-shell.tsx`, `testimonials.tsx`, `product-reviews.tsx`. **Verified:** 22/22
e2e, 72 unit tests, typecheck/lint/build green. → [L3/007](L3/007-qa-verification.md)

## WP-06 — Auth, account & platform fixes (2026-08-22)
**What:** favicon + PWA icons rendered from the four-petal monogram; real password
change (re-login verification + `auth.updateProvider`); forgot/reset-password pages
on the Medusa reset flow; register phone field + terms consent; orders Reorder and
4-step status timeline; footer dead-link removal + site-wide link audit; per-route
rate limits (5/min reviews, 30/min wishlist, 200/min admin); seeded promotions with
active campaign; price normalization (seed + dev DB repair, paise→major units);
`localizeImageUrl` for optimizer-blocked localhost images; category heroes using real
imagery; blog cover localization. **Why:** a mixed bag of audited stubs and
runtime-discovered bugs blocking a coherent demo. **Verified:** typecheck per change;
visual checks on shop/PDP/blog/category pages; `/store/promotions` returns both codes.
→ [L3/006](L3/006-auth-account-platform.md)

## WP-05 — UX polish: shop, PDP, landing, cart (Wave C, 2026-08-22)
**What:** shop dual-handle price slider (300ms debounce), subcategory nesting,
in-stock/customizable toggles, category counts, ItemList JSON-LD; category-page
Price/Material filters + trophies CTA → customizer; PDP share/compare-price/EMI/SKU/
OOS-variant states/gallery hover-zoom + lightbox keyboard nav; landing hero parallax +
Ken Burns + word-by-word reveal (a11y-safe), brand-values ring draw-in, testimonials
autoplay with monogram avatars; cart cross-sell, empty-state bestsellers, sticky mobile
checkout bar. **Why:** remaining spec gaps in `.cursor/plans/pages/02–05`. **Files:**
`filter-sidebar.tsx`, `shop-client.tsx`, `range-slider.tsx` (new), `product-actions.tsx`,
`image-gallery.tsx`, `hero-section.tsx`, `testimonials.tsx`, `cart-recommendations.tsx`
(new), `lib/product-filters.ts` (new, tested). **Verified:** 40 storefront tests incl.
new filter-helper tests; typecheck/lint green. → [L3/005](L3/005-ux-polish.md)

## WP-04 — Content, SEO & imagery (Wave B, 2026-08-21→22)
**What:** bestsellers carousel; order-confirmation page (real order fetch, `#LC-`
display id, delivery estimate, share); PDP reviews tab on the real reviews module
(average, distribution, sort, moderated write-a-review); JSON-LD (BlogPosting,
BreadcrumbList, Organization+WebSite, FAQPage); placeholder panels → real generated
imagery (craftsmanship story, category stories, related-category cards); hero image
crossfade across all three hero PNGs; blog article sticky TOC + author card +
newsletter CTA; designs "Open" → real customizer routes; final privacy/terms copy. **Why:**
audited content/SEO gaps; the brand forbids placeholder boxes. **Verified:**
typecheck/lint/test green; OG/JSON-LD present in built HTML. → [L3/004](L3/004-content-seo.md)

## WP-03 — Storefront commerce wiring (Wave A2, 2026-08-21→22)
**What:** Razorpay checkout passes `order_id` + session amount and HMAC-verifies the
signature server-side (`app/api/checkout/verify-razorpay/route.ts`) before completing
the cart; promo codes apply/remove on the cart via `promo_codes`; order summary shows
discounts; coupons page reads a new `GET /store/promotions` route; wishlist hearts
sync via `use-wishlist` (optimistic, 401→login); env templates gained
`NEXT_PUBLIC_RAZORPAY_*`; newsletter/contact forms POST to the backend. **Why:** the
checkout chain previously completed orders without payment verification; coupons were
hardcoded samples. **Verified:** storefront typecheck/test/lint green; code review of
the verification chain. → [L3/003](L3/003-commerce-wiring.md)

## WP-02 — Backend hardening (Wave A1, 2026-08-21→22)
**What:** fixed 8 seed typecheck errors; Razorpay webhook now processes
captured/authorized/failed via the payment module with a new `webhook-events`
idempotency module; `authorizePayment` verifies against the Razorpay API (unpaid
orders can no longer confirm); unique/composite index migrations (blog/wishlist/
reviews); seeds extended to all 9 product images + 6 new products + blog covers/SEO
fields + 5 reviews per product, all idempotent; `/store/contact` + `/store/newsletter`
routes; wrote missing plan doc `backend/03-razorpay.md`. **Why:** payment integrity
and catalog depth are launch blockers. **Verified:** medusa typecheck + 14 tests;
live smoke — migrations applied, seeds run twice idempotently against dev Postgres.
→ [L3/002](L3/002-backend-hardening.md)

## WP-01 — Brand foundation, audit & execution system (2026-08-21)
**What:** extracted the 15-page identity deck (image-rendered); confirmed the brand
contract (palette, type, maker's mark, materials, voice); ran a three-way audit
(storefront/backend/assets) against `.cursor/plans/` producing the gap list that
drove WP-02…WP-07; installed skills.sh skills (`.agents/skills/`: react-best-practices,
web-design-guidelines, view-transitions, composition-patterns); wrote
`.cursor/plans/KIMI-EXECUTION-STATUS.md`; created the `kimi` branch. **Why:** the goal
demanded brand fidelity and a resumable multi-agent execution system. **Verified:**
audit findings each resolved in later WPs. → [L3/001](L3/001-brand-foundation.md)
