# Product Detail Page (PDP) — Complete Specification

## Route: `/products/[handle]`
## Type: RSC with client islands (gallery, variant selector, add-to-cart)

---

## Page Layout

```
┌─────────────────────────────────────────────────────┐
│ [Breadcrumb]: Home > Furniture > Tables > Oak Table │
├────────────────────┬────────────────────────────────┤
│                    │ [Product Title]                 │
│  [Image Gallery]   │ [Rating ★★★★☆ (24 reviews)]   │
│                    │ [Price: ₹12,999]                │
│  Main image        │ [Variant Selector]             │
│  (zoomable)        │   Color: [●] [●] [●]          │
│                    │   Size: [S] [M] [L]            │
│  Thumbnails below  │   Material: [Wood ▾]           │
│                    │ [Quantity: [-] 1 [+]]          │
│                    │ [Add to Cart] (full width)     │
│                    │ [Customize This →] (if custom) │
│                    │ [Wishlist ♡] [Share ↗]         │
│                    │─────────────────────────────────│
│                    │ [Shipping info] Free above ₹5k │
│                    │ [Returns] 7-day easy returns    │
│                    │ [Secure] 100% secure checkout   │
├────────────────────┴────────────────────────────────┤
│ [Tabs: Description | Specifications | Reviews]      │
│─────────────────────────────────────────────────────│
│ [Tab Content Area]                                   │
├─────────────────────────────────────────────────────┤
│ [Related Products Carousel]                          │
│ "You May Also Like"                                 │
└─────────────────────────────────────────────────────┘
```

---

## Image Gallery

### Desktop
- Main image: `aspect-[4/5]`, rounded-xl, `object-fit: contain` on white/muted bg
- Zoom on hover: CSS transform scale(2) following mouse position
- Click: opens fullscreen lightbox with navigation
- Thumbnails: horizontal row below (5 max visible), scrollable
- Active thumbnail: border in category accent color

### Mobile
- Full-width swipeable carousel (snap-x)
- Dot indicators below
- Pinch-to-zoom on touch
- 1:1 aspect ratio for cleaner mobile presentation

### Lightbox (client component)
- Full screen, dark overlay
- Zoom controls (pinch/scroll)
- Prev/Next arrows
- Close button (top-right)
- Keyboard navigation (arrow keys, Escape)

---

## Product Info Panel

### Title Area
```
[Category Badge]  — "Furniture" (small, uppercase, category color bg)
[Product Title]   — serif, text-3xl (mobile: text-2xl)
[Rating]          — ★★★★☆ 4.2 (24 reviews) — clickable, scrolls to reviews tab
[SKU]             — "SKU: LC-FUR-TBL-001" (text-xs, muted, on hover/expand)
```

### Pricing
```
[Current Price]   — ₹12,999 (text-2xl, font-bold)
[Compare Price]   — ₹15,999 (text-lg, line-through, muted) — only if on sale
[Discount Badge]  — "-19% OFF" (badge, destructive variant)
[Tax note]        — "Inclusive of all taxes" (text-xs, muted)
[EMI]             — "Starting ₹1,083/month" (text-xs, muted) — if price > ₹5000
```

### Variant Selector

#### Color Variants
- Circular swatches (24px), border on selected
- Tooltip with color name on hover
- Out-of-stock: crossed out, reduced opacity

#### Size/Material Variants
- Pill buttons: `px-4 py-2 rounded-md border`
- Selected: filled with foreground color, white text
- Out-of-stock: dashed border, muted text, "Notify me" on click

### Quantity Stepper
```
[-] [  1  ] [+]
```
- Min: 1, Max: stock level
- Disabled minus at 1, disabled plus at max
- Animated number change

### Primary Actions
```
[Add to Cart]        — full-width accent button, large
                       loading spinner on click, success checkmark animation
[Customize This →]   — full-width outline button (only for customizable products)
                       links to /customize/[productId]/2d
```

### Secondary Actions
```
[♡ Add to Wishlist]  — icon button, heart fills on click (optimistic)
[↗ Share]            — icon button, opens share sheet (copy link, WhatsApp, Twitter)
```

### Trust Badges (below actions)
- 🚚 Free shipping on orders above ₹5,000
- ↩️ 7-day easy returns (non-custom items)
- 🔒 100% secure payments
- 🇮🇳 Handmade in India

---

## Product Tabs

### Tab Design
- Underline style tabs (not boxed)
- Active: bold text + 2px bottom border in category accent
- Smooth content transition (fade)

### Tab 1: Description
- Rich HTML content from Medusa
- Typography: prose styling (max-w-prose, proper heading sizes)
- May include embedded images

### Tab 2: Specifications
- Key-value table (striped rows)
- Fields: Dimensions, Weight, Material, Color, Care Instructions, Origin, Warranty

### Tab 3: Reviews
- Average rating large display (4.2 / 5)
- Rating distribution bar chart (5★ ████ 60%, 4★ ██ 25%, etc.)
- Review list with:
  - Reviewer name + avatar
  - Date
  - Rating stars
  - Review text
  - Helpful button
- "Write a Review" button (requires login)
- Sort: Most Recent, Highest, Lowest, Most Helpful
- Pagination (10 per page)

---

## Related Products

### Design
- Horizontal carousel (4 visible desktop, 2 mobile)
- Same product card as shop grid
- Navigation arrows (desktop) + swipe (mobile)
- "View All in [Category]" link

### Data
- Products from same category, excluding current
- Fallback: bestsellers if < 4 in same category

---

## Mobile Adaptations

| Element | Mobile Change |
|---------|--------------|
| Layout | Single column (gallery → info stacked) |
| Gallery | Full-width carousel, 1:1 ratio |
| Info panel | Below gallery, full width |
| Add to Cart | Sticky bottom bar (always visible on scroll) |
| Tabs | Accordion instead of tabs |
| Related | Horizontal scroll |

### Sticky Add-to-Cart Bar (Mobile)
```
┌─────────────────────────────────────────┐
│ ₹12,999  │  [Add to Cart]              │
└─────────────────────────────────────────┘
```
- Appears when main "Add to Cart" button scrolls out of viewport
- 60px height, blur backdrop, shadow-lg
- Slide-up animation

---

## JSON-LD Structured Data

```json
{
  "@type": "Product",
  "name": "Oak Side Table",
  "image": ["url1", "url2"],
  "description": "...",
  "sku": "LC-FUR-TBL-001",
  "brand": { "@type": "Brand", "name": "Trophy Heaven" },
  "offers": {
    "@type": "Offer",
    "price": "12999",
    "priceCurrency": "INR",
    "availability": "InStock",
    "seller": { "@type": "Organization", "name": "Trophy Heaven" }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.2",
    "reviewCount": "24"
  }
}
```

---

## Interactions & Animations

| Action | Animation |
|--------|-----------|
| Page load | Image fades in, info slides in from right |
| Variant change | Image cross-fades to new variant image |
| Add to Cart | Button → loading spinner → checkmark → revert (1.5s) |
| Wishlist | Heart: scale bounce + fill animation |
| Tab switch | Content: fade out → fade in (200ms) |
| Gallery thumb click | Main image cross-dissolve |
| Zoom hover | Smooth scale following cursor |
| Sticky bar appear | Slide up from below |
