# Trophy Heaven — Master Implementation Plan

> **Trophy Heaven fork (2026-11-13, WP-87):** this plan was written for Legacy Crafts
> (trophies + furniture + artwork). Trophy Heaven sells trophies only. Ignore every
> furniture, artwork/home-decor, sculpture, midnight-blue and olive/brass instruction
> below; the trophy, customizer, corporate, checkout and brand-token guidance still applies.

## Vision

A premium e-commerce platform for custom trophies, artisanal furniture, and curated artwork/decor. The website embodies the brand's material-first philosophy with category-coded color accents, modern animations, and a seamless mobile-first shopping experience.

## Brand DNA (from PDF Identity Deck)

- **Positioning:** "A luxury affordable house furniture brand that epitomizes sophistication, comfort, and elegance"
- **Tagline:** FURNITURE. DECOR & MORE
- **Maker's Mark:** Four-petal monogram (interconnected 'l' forms from "Legacy")
- **Philosophy:** Artistic expression + structural precision
- **Materials:** Brass, Stone, Wood, Leather, Steel
- **Tone:** Sophisticated, grounded, artisanal, enduring — never loud or trendy

## Category Color System

| Category | Color Name | OKLCH | Hex | Usage |
|----------|-----------|-------|-----|-------|
| Trophies | Burgundy Red | oklch(0.45 0.15 25) | #8A2D25 | Accent, CTAs, badges, hover states |
| Furniture | Midnight Blue | oklch(0.25 0.04 250) | #191D26 | Backgrounds, section panels, overlays |
| Artwork/Decor | Olive/Brass Green | oklch(0.38 0.08 90) | #4F3516 | Borders, tags, subtle highlights |

## Neutral Palette

| Token | Value | Role |
|-------|-------|------|
| Walnut (darkest) | #331207 | Headlines, primary text |
| Stone (mid) | #867A67 | Secondary text, muted elements |
| Cream (light) | #E0D8C3 | Card backgrounds, sections |
| Champagne (lightest) | #FBFBF7 | Page background |
| Gold (accent) | #B89E6B | Logo, dividers, premium accents |

## Document Index

### Phases
- [Phase 1: Design System](phases/01-design-system.md)
- [Phase 2: Core Pages](phases/02-core-pages.md)
- [Phase 3: Backend Extensions](phases/03-backend.md)
- [Phase 4: Images & Content](phases/04-content.md)
- [Phase 5: Animations & Polish](phases/05-animations.md)
- [Phase 6: Account & Advanced](phases/06-account.md)
- [Phase 7: Testing & QA](phases/07-testing.md)

### Component Specifications
- [UI Primitives](components/01-ui-primitives.md)
- [Layout Components](components/02-layout.md)
- [Section Components](components/03-sections.md)
- [Feature Components](components/04-features.md)

### Page Specifications
- [Landing Page](pages/01-landing.md)
- [Shop Page](pages/02-shop.md)
- [Category Pages](pages/03-categories.md)
- [Product Detail](pages/04-product-detail.md)
- [Cart & Checkout](pages/05-cart-checkout.md)
- [Account Pages](pages/06-account.md)
- [Blog & Content](pages/07-blog.md)

### Backend
- [Database Schema](backend/01-schema.md)
- [API Routes](backend/02-api-routes.md)
- [Razorpay Integration](backend/03-razorpay.md)

### Automation
- [Multi-Agent Setup](automation/01-agents.md)
- [Build Automation](automation/02-build-script.md)

## Execution Order

```
Phase 1 (Design System) ──────────────────► Phase 2 (Core Pages)
    │                                           │
    ├── [parallel] Image Generation             ├── [parallel] Backend Extensions
    │                                           │
    └── Component Library                       └── Phase 5 (Animations)
                                                    │
Phase 6 (Account + Blog) ◄─────────────────────────┘
    │
    └── Phase 7 (Testing + SEO + Performance)
```
