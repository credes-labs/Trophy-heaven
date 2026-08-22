# Phase 2: Core Pages — Detailed Spec

## Objective
Build all customer-facing shopping surfaces on top of the Phase 1 design system: landing, shop, 3 category pages, PDP, cart, and checkout with Razorpay.

---

## 2.1 Landing Page Sections (files to create)

| File | Component | Notes |
|------|-----------|-------|
| `src/components/sections/announcement-bar.tsx` | (may already exist from layout agent) | Rotating promo bar |
| `src/components/sections/hero-section.tsx` | HeroSection | Full-bleed, parallax, CTAs |
| `src/components/sections/category-showcase.tsx` | CategoryShowcase | 3 color-coded cards |
| `src/components/sections/featured-products.tsx` | FeaturedProducts | Tabbed product grid |
| `src/components/sections/craftsmanship-story.tsx` | CraftsmanshipStory | 50/50 editorial |
| `src/components/sections/brand-values.tsx` | BrandValues | 4 pillars |
| `src/components/sections/bestsellers-carousel.tsx` | BestsellersCarousel | Horizontal scroll |
| `src/components/sections/testimonials.tsx` | TestimonialsSection | Quote carousel |
| `src/components/sections/newsletter.tsx` | NewsletterSection | Dark CTA |
| `src/app/page.tsx` | — | Compose all sections |

## 2.2 Shop Page Files

| File | Purpose |
|------|---------|
| `src/app/(shop)/shop/page.tsx` | RSC shell + data fetch |
| `src/components/features/shop/shop-client.tsx` | Filter/sort/grid client |
| `src/components/features/shop/filter-sidebar.tsx` | Desktop filters |
| `src/components/features/shop/filter-sheet.tsx` | Mobile filter sheet |
| `src/components/features/shop/shop-toolbar.tsx` | Sort + view toggle |
| `src/components/features/shop/active-filters.tsx` | Filter pills |
| `src/components/features/catalog/product-card.tsx` | Enhanced card (rewrite) |

## 2.3 Category Pages

| File | Purpose |
|------|---------|
| `src/app/(shop)/trophies/page.tsx` | Trophies PLP |
| `src/app/(shop)/furniture/page.tsx` | Furniture PLP |
| `src/app/(shop)/artwork/page.tsx` | Artwork PLP |
| `src/components/features/catalog/category-hero.tsx` | Shared hero |
| `src/components/features/catalog/subcategory-nav.tsx` | Pill nav |
| `src/components/features/catalog/category-story.tsx` | Editorial break |
| `src/lib/category-config.ts` | Per-category accent/copy config |

## 2.4 Product Detail

| File | Purpose |
|------|---------|
| `src/app/(shop)/products/[handle]/page.tsx` | Rewrite PDP |
| `src/components/features/catalog/image-gallery.tsx` | Zoom + lightbox |
| `src/components/features/catalog/variant-selector.tsx` | Color/size/material |
| `src/components/features/catalog/product-tabs.tsx` | Description/specs/reviews |
| `src/components/features/catalog/sticky-atc.tsx` | Mobile sticky bar |
| `src/components/features/catalog/related-products.tsx` | Carousel |

## 2.5 Cart & Checkout

| File | Purpose |
|------|---------|
| `src/app/(shop)/cart/page.tsx` | Cart redesign |
| `src/components/features/cart/cart-item.tsx` | Line item card |
| `src/components/features/cart/order-summary.tsx` | Summary sidebar |
| `src/components/features/cart/promo-code.tsx` | Coupon input |
| `src/app/(shop)/checkout/page.tsx` | 4-step wizard rewrite |
| `src/components/features/checkout/step-indicator.tsx` | Progress |
| `src/components/features/checkout/address-form.tsx` | Contact + address |
| `src/components/features/checkout/delivery-options.tsx` | Shipping radios |
| `src/components/features/checkout/payment-step.tsx` | Razorpay + COD + net terms |
| `src/components/features/checkout/review-step.tsx` | Final review |
| `src/lib/razorpay.ts` | Checkout.js loader + helpers |

## Acceptance Criteria

- [ ] `/` renders all 10 sections without layout shift
- [ ] `/shop` filters sync to URL and update grid
- [ ] `/trophies`, `/furniture`, `/artwork` use correct accent colors
- [ ] PDP gallery zoom + variant switch works
- [ ] Cart add/update/remove works
- [ ] Checkout reaches Razorpay popup (or system provider in test mode)
- [ ] Mobile: bottom nav, sticky ATC, filter sheet all functional
- [ ] `pnpm typecheck` + `pnpm lint` pass in storefront
