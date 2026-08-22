# 004 — Content, SEO & imagery

- Date: 2026-08-21→22 · Branch: `kimi` · Status: shipped
- Layer-2 anchor: WP-04

## Context / why

Audit found placeholder imagery panels, hardcoded reviews, a static order-confirmation
page, missing JSON-LD beyond Product, orphaned generated assets, broken "Open design"
links, and self-flagged placeholder legal copy.

## Decisions made (and alternatives rejected)

- **Order fetch is client-side** on the confirmation page (customer JWT lives in the
  browser SDK; an RSC fetch would 401) with graceful static fallback for guests.
- **Bestsellers sort = newest** (`-created_at`) — no sales ordering exists upstream;
  flagged in code comments rather than faked.
- **Reviews render from the reviews module** with a moderated write-a-review form
  (backend creates `pending`) — placeholder data deleted outright.
- **TOC generated from the same markdown pass** (`addHeadingIds()` in `lib/blog.ts`)
  so anchors can't drift from headings.
- **Legal copy finalized** in brand voice (DPDP Act 2023 rights, Consumer Protection
  Act 2019 carve-out, India/Bangalore jurisdiction); counsel-review note kept as a
  code comment only — never in UI copy.

## Changes (file → what)

- `sections/bestsellers-carousel.tsx` (new) + `app/page.tsx` → landing section 7.
- `order/confirmed/[id]/order-confirmed-client.tsx` (new) + `page.tsx` → real order,
  `#LC-<display_id>`, delivery estimate (+7d), share, track CTA.
- `lib/reviews.ts` (new), `features/catalog/product-reviews.tsx` (new),
  `product-tabs.tsx` → real reviews tab; `products/[handle]/page.tsx` → branded
  breadcrumb links, rating summary, `aggregateRating` in Product JSON-LD.
- `app/layout.tsx` → Organization + WebSite(SearchAction) JSON-LD;
  `blog/[slug]/page.tsx` → BlogPosting + BreadcrumbList + TOC + author card +
  newsletter CTA; `faq/page.tsx` → FAQPage from the same data as the accordion.
- `sections/craftsmanship-story.tsx`, `features/catalog/category-page-client.tsx`,
  `sections/hero-section.tsx` → real imagery (hero crossfade across all 3 hero PNGs).
- `account/designs/page.tsx` + `customize/[productId]/{2d,3d}` loaders → `?design=`
  deep-links load saved designs.
- `privacy/page.tsx`, `terms/page.tsx` → final copy.

## Gotchas for future work

- This repo's flat ESLint config does not register `@next/next` — `eslint-disable
  @next/next/no-img-element` comments ERROR. Use `next/image` (remotePatterns already
  cover backend/CDN hosts).
- Product OG images depend on seeded thumbnails — reseed rather than hand-editing
  metadata if they look stale.

## Verification

- Storefront typecheck/lint/test green; JSON-LD verified present in rendered HTML.
