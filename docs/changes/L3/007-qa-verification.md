# 007 — QA: accessibility, e2e & the merge to main

- Date: 2026-08-22 · Branch: `kimi` → merged to `main` (`23715ce`) · Status: shipped
- Layer-2 anchor: WP-07

## Context / why

Final verification wave: full gate suite, e2e hardening, axe accessibility, and the
integration merge. Several real defects were found and fixed here — this is the
evidence trail.

## Defects found & fixed

1. **WCAG AA color-contrast (real)**: gold `#c69e58` text on champagne measured
   2.34–2.42:1 (needs 4.5:1 at 12px). Fix: new `--color-gold-dark: oklch(0.50 0.09 78)`
   token in `globals.css`, applied to every on-light text usage (page/section eyebrows,
   blog TOC/author labels, mega-menu price/CTA, craftsmanship stats). `text-gold`
   remains for dark surfaces and decorative icons.
2. **aria-prohibited-attr (real)**: star-rating containers had `aria-label` on
   role-less `div`/`span`. Fix: `role="img"` in `testimonials.tsx` and
   `product-reviews.tsx`.
3. **axe flakiness from scroll-reveal animations (test-only)**: sections measure
   mid-fade (partial opacity washes out colors). Fix in the spec: scroll the full
   page to trigger reveals, wait 1.5s, then analyze — do not scroll back (reveals
   re-hide).
4. **Auth guard bouncing forgot/reset pages (real)**: `AUTH_PATHS` in
   `account-shell.tsx` only exempted login/register; the new pages redirected to
   login. Fix: added both paths.
5. **Heading-role assumptions in tests**: `CardTitle` renders a `div` — tests now
   assert text, not heading role.
6. **ShareButtons hydration mismatch (real)**: `window.location` read during render.
   Fix: deterministic URL from `NEXT_PUBLIC_BASE_URL` + explicit `path` prop (blog,
   PDP, order confirmation pass their own paths).
7. **Dev-server port/config**: `next dev` in Next 16 allows one server per project;
   a restart was required to pick up `next.config.ts` changes.

## Verification evidence (final state)

- `pnpm -r typecheck` — clean (4 projects)
- `pnpm -r lint` — 0 errors (5 pre-existing warnings)
- `pnpm -r test` — 72 unit tests green (schemas 18, storefront 40, medusa 14)
- `pnpm -r build` — storefront + medusa + packages all build
- `npx playwright test e2e/smoke.spec.ts` — **22/22** (11 tests × chromium + mobile),
  including axe WCAG2A/AA serious/critical = 0 on the landing page
- Visual sweep: desktop 1440 + mobile 390 screenshots of home, shop, trophies,
  furniture, artwork, PDP, blog listing + article, about, login — reviewed against
  the identity deck
- Merge: `kimi` → `main` fast-forward, `23715ce`, 340 files (+32,331/−676)

## E2e coverage (11 tests)

home renders + axe · header search nav · corporate bulk calculator · shop · cart ·
blog · category pages · footer dead-link regression · login→forgot-password flow ·
register terms/phone · mobile bottom nav
