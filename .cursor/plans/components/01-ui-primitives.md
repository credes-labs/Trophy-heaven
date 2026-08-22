# Component Specifications — UI Primitives & Layout

## Status: Phase 1 Complete

### Design Tokens (`globals.css`)
- Brand: `trophy`, `furniture`, `artwork` (+ light/dark)
- Neutrals: `walnut`, `stone`, `cream`, `champagne`, `gold`
- Semantic: background, foreground, card, muted, border, ring, primary, accent, success, warning, destructive
- Fluid type: xs → hero via clamp()
- Shadows, radius, transition easings

### Animations (`lib/animations.ts`)
- fadeIn, fadeUp, fadeDown, scaleIn, slideInLeft, slideInRight
- staggerContainer, pageTransition, scrollReveal
- springConfig, gentleSpring
- useScrollReveal hook

### UI Components (`components/ui/`)

| Component | File | Key Variants |
|-----------|------|--------------|
| Button | button.tsx | default, accent, outline, ghost, link, trophy, furniture, artwork + loading |
| Badge | badge.tsx | default, outline, gold, trophy, furniture, artwork, sale, success |
| Card | card.tsx | default, elevated, bordered, glass |
| Input | input.tsx | default, error, success × sm/md/lg |
| Dialog | dialog.tsx | sm/md/lg/fullscreen |
| Sheet | sheet.tsx | left/right/top/bottom |
| Tabs | tabs.tsx | underline, pills |
| Accordion | accordion.tsx | default, bordered |
| Skeleton | skeleton.tsx | default, circle, text |
| Separator | separator.tsx | horizontal, vertical |
| AspectRatio | aspect-ratio.tsx | 1:1, 4:3, 3:4, 16:9, 21:9 |
| Breadcrumb | breadcrumb.tsx | nav+ol a11y |
| QuantityStepper | quantity-stepper.tsx | min/max |
| ScrollArea | scroll-area.tsx | custom scrollbar |
| Slider | slider.tsx | single range |
| Tooltip | tooltip.tsx | hover delay |
| DropdownMenu | dropdown-menu.tsx | items + keyboard |

### Layout (`components/layout/`)

| Component | Purpose |
|-----------|---------|
| AnnouncementBar | Rotating promo, dismissible |
| Header + HeaderClient | Sticky mega-nav, search/cart/account |
| MegaMenu | Shop dropdown with categories |
| Footer | 5-col mega footer on walnut |
| MobileNav | Bottom bar Home/Shop/Search/Cart/Account |

### Root Layout
- Fonts: Inter + Playfair Display
- Structure: AnnouncementBar → Header → main → Footer → CartDrawer → MobileNav
