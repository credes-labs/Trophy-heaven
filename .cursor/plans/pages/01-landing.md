# Landing Page — Complete Specification

## Route: `/` (apps/storefront/src/app/page.tsx)
## Type: RSC with client islands for animations and interactivity

---

## Section Map (top to bottom)

```
┌─────────────────────────────────────────────────────┐
│ [1] Announcement Bar                                 │
├─────────────────────────────────────────────────────┤
│ [2] Hero Section (full viewport)                     │
│     - Parallax background image                      │
│     - Animated headline (serif, hero size)           │
│     - Subtitle + CTA buttons                        │
│     - Scroll indicator                              │
├─────────────────────────────────────────────────────┤
│ [3] Category Showcase (3 cards)                      │
│     - Trophies (red accent)                         │
│     - Furniture (blue accent)                       │
│     - Artwork (olive accent)                        │
├─────────────────────────────────────────────────────┤
│ [4] Featured Products Grid                           │
│     - Tab navigation (All | Trophies | Furniture | Art) │
│     - 4-col product cards with hover effects        │
│     - "View All" CTA                               │
├─────────────────────────────────────────────────────┤
│ [5] Craftsmanship Story (split layout)              │
│     - Left: editorial text + stats                  │
│     - Right: atmospheric image (parallax)           │
├─────────────────────────────────────────────────────┤
│ [6] Brand Values (4 columns)                         │
│     - Craftsmanship, Legacy, Precision, Collaboration│
│     - Icon + title + description                    │
├─────────────────────────────────────────────────────┤
│ [7] Bestsellers Carousel                             │
│     - Horizontal scroll / swipeable                 │
│     - Large product cards                           │
├─────────────────────────────────────────────────────┤
│ [8] Testimonials                                     │
│     - Customer quotes carousel                      │
│     - Rating stars + name + photo                   │
├─────────────────────────────────────────────────────┤
│ [9] Newsletter / CTA Section                         │
│     - Dark background (walnut)                      │
│     - Email input + subscribe button                │
│     - Trust badges                                  │
├─────────────────────────────────────────────────────┤
│ [10] Footer (mega footer)                            │
└─────────────────────────────────────────────────────┘
```

---

## Section 1: Announcement Bar

**Component:** `<AnnouncementBar />`

| Property | Value |
|----------|-------|
| Position | Fixed top, z-50 |
| Height | 36px (mobile: 32px) |
| Background | brand-trophy (burgundy) |
| Text | White, text-xs, uppercase, tracking-wide |
| Content | Rotates messages: "Free shipping on orders above ₹5,000" / "Handcrafted with love in India" |
| Dismiss | X button, persists in localStorage |
| Animation | Text slides up/fades between messages (3s interval) |

---

## Section 2: Hero Section

**Component:** `<HeroSection />`

### Layout
- Full viewport height (`100svh`) minus announcement bar
- Relative container with overflow hidden

### Background
- Full-bleed lifestyle image (dark workshop scene with warm highlights)
- CSS `object-fit: cover` with dark gradient overlay from bottom (70% to transparent)
- Subtle parallax: `transform: translateY(calc(var(--scroll) * 0.3))` via scroll listener

### Content (positioned bottom-left, 10% from edges)
```
[Pre-title]    — "FURNITURE. DECOR & MORE" (sans, text-xs, uppercase, gold color, tracking-widest)
[Headline]     — "Crafted to\nLast." (serif, text-hero, cream color, line-height 1.0)
[Subtitle]     — "Premium handcrafted trophies, furniture & artwork..." (sans, text-lg, cream/80%)
[CTA Row]      — [Shop Collection] (accent button) + [Our Story] (ghost button, cream border)
```

### Animations (staggered on load)
1. Pre-title: fade-in + slide-right (delay 0.2s)
2. Headline: fade-up word-by-word (delay 0.4s, stagger 0.1s per word)
3. Subtitle: fade-in (delay 0.8s)
4. CTAs: fade-up (delay 1.0s)
5. Background: Ken Burns slow zoom (20s, scale 1 → 1.05)

### Scroll Indicator
- Bottom center, animated bouncing chevron down
- Fades out after first scroll

### Mobile Adaptation
- 80svh height (not full viewport — show peek of next section)
- Headline: text-4xl
- CTAs stack vertically
- No parallax (performance)

---

## Section 3: Category Showcase

**Component:** `<CategoryShowcase />`

### Layout
- 3-column grid (`lg:grid-cols-3`, `sm:grid-cols-1` stacked on mobile)
- Gap: 24px
- Section padding: `var(--spacing-section)` top/bottom

### Each Card Structure
```
┌──────────────────────────┐
│  [Image: 4:3 ratio]      │  ← object-fit cover, rounded-xl
│                           │
├──────────────────────────┤
│  [Category Title]         │  ← serif, text-3xl
│  [Description]            │  ← sans, text-sm, muted
│  [Shop Now →]             │  ← text link with arrow, category color
│                           │
│  [Color accent bar]       │  ← 4px bottom border in category color
└──────────────────────────┘
```

### Per-Card Styling

| Card | Accent Color | Image | Title |
|------|-------------|-------|-------|
| Trophies | brand-trophy (#8A2D25) | Crystal trophy on dark velvet | "Award-Winning Trophies" |
| Furniture | brand-furniture (#191D26) | Oak table in warm light | "Artisan Furniture" |
| Artwork | brand-artwork (#4F3516) | Ceramic vase with dried flowers | "Curated Artwork" |

### Hover Effect
- Card lifts: `translateY(-8px)` + shadow-xl
- Image: `scale(1.05)` with overflow hidden
- Title color transitions to category accent
- Arrow slides right 8px

### Scroll Animation
- Cards stagger in from below (0.1s delay between each)
- `whileInView` with threshold 0.3

---

## Section 4: Featured Products

**Component:** `<FeaturedProducts />`

### Tab Navigation
- Horizontal pills: "All" | "Trophies" | "Furniture" | "Artwork"
- Active pill has category color background
- Smooth underline animation on switch

### Product Grid
- 4 columns (desktop), 2 columns (mobile)
- 8 products shown (2 rows)
- AnimatePresence for tab switch (fade + scale)

### Product Card Design
```
┌──────────────────────────┐
│  [Badge: "New" / "Sale"] │  ← top-left, category colored
│                           │
│  [Product Image]          │  ← 1:1 aspect ratio, bg-muted
│  [Quick Add hover icon]   │  ← appears on hover, bottom-right
│                           │
├──────────────────────────┤
│  [Category tag]           │  ← text-xs, uppercase, muted
│  [Product Name]           │  ← sans, text-sm, font-medium
│  [Price]                  │  ← sans, text-base, font-semibold
│  [Rating: ★★★★☆ (4.2)]   │  ← text-xs, gold stars
└──────────────────────────┘
```

### Hover Effects
- Image: subtle scale (1.03) + shadow increase
- Quick-add icon slides up from below
- Card background: slight warm tint

---

## Section 5: Craftsmanship Story

**Component:** `<CraftsmanshipStory />`

### Layout: 50/50 split
- Left (text): padding-right 3rem, vertically centered
- Right (image): full height, rounded-xl, overflow hidden

### Left Content
```
[Eyebrow]      — "OUR STORY" (sans, text-xs, uppercase, gold, tracking-widest)
[Headline]     — "Where Tradition\nMeets Modern\nDesign" (serif, text-4xl)
[Body]         — 2 paragraphs about craftsmanship, materials, process
[Stats Row]    — [15+ Years] [500+ Products] [10,000+ Happy Customers]
[CTA]          — "Learn More →" text link
```

### Right Content
- Large atmospheric image (craftsman working, warm lighting)
- Parallax scroll effect (slower than page)
- Gold border accent (2px, partial — only top and right)

### Stats Design
- Large number (serif, text-3xl, gold)
- Label below (sans, text-xs, uppercase, muted)
- Divider between each stat

### Mobile
- Stacks vertically (image on top, reduced height)
- Stats in 3-column grid

---

## Section 6: Brand Values

**Component:** `<BrandValues />`

### Layout: 4 columns (desktop), 2x2 (tablet), vertical stack (mobile)

### Each Value
```
[Icon]         — 48px, gold stroke, line-art style
[Title]        — sans, text-lg, font-semibold
[Description]  — sans, text-sm, muted-foreground, max-w-[200px]
```

### Values
1. **Craftsmanship** — "Every piece handcrafted with intention and skill"
2. **Legacy** — "Objects designed to be passed on through generations"  
3. **Precision** — "Meticulous attention to material, form, and finish"
4. **Collaboration** — "Working with artisans across India's craft traditions"

### Animation
- Icons draw themselves (SVG path animation) when in view
- Text fades up staggered

---

## Section 7: Bestsellers Carousel

**Component:** `<BestsellersCarousel />`

### Design
- Horizontal scrollable container (snap-x)
- Large cards (300px width min)
- Peek: shows partial next card to indicate scrollability
- Navigation: prev/next arrows (desktop), dots (mobile)
- Drag/swipe enabled

### Card (enlarged product card variant)
- Taller image (3:4 ratio)
- Product name + price + rating
- "Add to Cart" button visible (not hover-only)

---

## Section 8: Testimonials

**Component:** `<TestimonialsSection />`

### Layout
- Center-aligned section
- Carousel with 3 visible cards (desktop), 1 (mobile)
- Auto-play (5s interval), pause on hover

### Card Design
```
┌──────────────────────────┐
│  ★★★★★                   │  ← gold stars
│  "Quote text here..."    │  ← serif italic, text-lg
│                           │
│  [Avatar] Name            │  ← 40px circle + name
│           Location        │  ← text-xs, muted
└──────────────────────────┘
```

---

## Section 9: Newsletter CTA

**Component:** `<NewsletterSection />`

### Design
- Full-width dark background (walnut color)
- Centered content, max-w-lg
- Pattern overlay (four-petal repeat, 5% opacity)

### Content
```
[Headline]     — "Stay in the Loop" (serif, text-3xl, cream)
[Subtitle]     — "Get early access..." (sans, text-base, cream/70%)
[Input + Button] — email input (dark bg, cream border) + gold button
[Trust]        — "Join 5,000+ design lovers • Unsubscribe anytime"
```

---

## Section 10: Footer

**Component:** `<Footer />` (rewrite of existing)

### Layout: 5-column grid

| Col 1 | Col 2 | Col 3 | Col 4 | Col 5 |
|-------|-------|-------|-------|-------|
| Logo + tagline + social icons | Shop (links) | Company (links) | Support (links) | Contact info |

### Bottom Bar
- Copyright + payment method icons (Razorpay, Visa, MC, UPI)

---

## Data Requirements

| Section | Data Source | Caching |
|---------|-----------|---------|
| Announcement | Hardcoded / CMS (future) | Static |
| Hero | Static assets | Static |
| Categories | Medusa categories API | ISR 5min |
| Featured Products | Medusa products API (featured=true) | ISR 5min |
| Craftsmanship | Static content | Static |
| Brand Values | Static content | Static |
| Bestsellers | Medusa products (sort by sales) | ISR 5min |
| Testimonials | Hardcoded initially | Static |
| Newsletter | Form → email service | - |

---

## Performance Targets

| Metric | Target |
|--------|--------|
| LCP | < 2.5s (hero image) |
| FID | < 100ms |
| CLS | < 0.1 |
| TTI | < 3.5s |
| Bundle (page) | < 100KB gzipped JS |

### Optimizations
- Hero image: priority loading, responsive srcset, AVIF/WebP
- Products: lazy loaded below fold
- Animations: `will-change` only during animation, cleanup after
- Fonts: `font-display: swap`, preload critical fonts
- ISR: catalog data cached, revalidated every 5 minutes
