# Category Pages — Complete Specification

## Routes
- `/trophies` → Trophies category (accent: brand-trophy)
- `/furniture` → Furniture category (accent: brand-furniture)  
- `/artwork` → Artwork & Decor category (accent: brand-artwork)

Each is a variation of the same template with category-specific accent color, hero imagery, subcategory structure, and copy.

---

## Page Template Structure

```
┌─────────────────────────────────────────────────────┐
│ [1] Category Hero (full-width, 50vh)                │
│     - Background image with gradient overlay        │
│     - Category title + description                  │
│     - Accent color gradient on bottom               │
├─────────────────────────────────────────────────────┤
│ [2] Subcategory Navigation                           │
│     - Horizontal scrollable pills/tabs              │
│     - All | Sports | Corporate | Academic | ...     │
├─────────────────────────────────────────────────────┤
│ [3] Filter Bar (inline, collapsible)                │
│     - Sort | Price | Material | Rating              │
├─────────────────────────────────────────────────────┤
│ [4] Product Grid                                     │
│     - 4 columns desktop, 2 mobile                   │
│     - Cards with category accent on hover           │
├─────────────────────────────────────────────────────┤
│ [5] Category Story Section                           │
│     - Midway editorial break                        │
│     - "Why our [trophies] are different"            │
├─────────────────────────────────────────────────────┤
│ [6] More Products (continued grid)                  │
├─────────────────────────────────────────────────────┤
│ [7] Related Categories                               │
│     - "You might also like" — other 2 categories    │
└─────────────────────────────────────────────────────┘
```

---

## Category-Specific Configuration

### Trophies (`/trophies`)

| Property | Value |
|----------|-------|
| Accent | `--brand-trophy` (#8A2D25 burgundy) |
| Hero Image | Crystal trophies displayed on velvet (dark, dramatic lighting) |
| Headline | "Award-Winning Trophies" |
| Subhead | "Celebrate excellence with handcrafted crystal, metal, and acrylic awards" |
| Subcategories | All, Sports, Corporate, Academic, Memorial, Crystal, Metal, Acrylic |
| Story | "Each trophy begins as raw material..." (craftsmanship narrative) |
| CTA | "Design Your Own Trophy →" (links to customizer) |

### Furniture (`/furniture`)

| Property | Value |
|----------|-------|
| Accent | `--brand-furniture` (#191D26 midnight blue) |
| Hero Image | Workshop scene with wooden table being finished |
| Headline | "Artisan Furniture" |
| Subhead | "Honest materials. Expert craftsmanship. Furniture built to be lived with." |
| Subcategories | All, Tables, Chairs, Shelves, Cabinets, Stools, Beds, Dining |
| Story | "From sustainably sourced hardwoods..." (materials narrative) |
| CTA | "Explore Collections →" |

### Artwork (`/artwork`)

| Property | Value |
|----------|-------|
| Accent | `--brand-artwork` (#4F3516 olive/brass) |
| Hero Image | Curated decor display — vases, wall art, lamps on shelving |
| Headline | "Curated Artwork & Decor" |
| Subhead | "Objects of quiet beauty — handpicked to elevate any space" |
| Subcategories | All, Vases, Wall Art, Lamps, Mirrors, Clocks, Planters |
| Story | "Our curators travel across India..." (sourcing narrative) |
| CTA | "Shop New Arrivals →" |

---

## Section 1: Category Hero

### Layout
- Height: 50vh (desktop), 40vh (mobile)
- Full width with rounded-none (bleeds to edges)
- Dark gradient overlay: `linear-gradient(to top, category-color/90% 0%, transparent 60%)`

### Content (bottom-left aligned)
```
[Breadcrumb]   — Home > Trophies (white/70%, text-xs)
[Headline]     — serif, text-5xl, white
[Description]  — sans, text-lg, white/80%
[Product Count]— "45 products" (sans, text-sm, white/60%)
```

### Animation
- Background: slow Ken Burns zoom
- Text: staggered fade-up on page load

---

## Section 2: Subcategory Navigation

### Design
- Horizontal scroll container with fade edges
- Pills: `px-4 py-2 rounded-full text-sm font-medium`
- Active: filled with category accent color, white text
- Inactive: bordered, category-color text
- Scroll snap on mobile

### Behavior
- Clicking a subcategory filters the grid below
- URL updates: `/trophies?sub=crystal`
- Smooth scroll to grid on mobile after selection

---

## Section 3: Inline Filter Bar

### Desktop: Single row
```
[Sort: Relevance ▾] | [Price: ₹0 — ₹50k ▾] | [Material ▾] | [Rating ▾] | [Clear]
```

### Mobile: Collapsed
```
[Filters (2)] → opens Sheet | [Sort ▾]
```

---

## Section 4 & 6: Product Grid

- Same ProductCard component as Shop page
- Category accent on hover border/badge
- Staggered reveal animation (0.05s delay per card)
- 12 products per section (24 total before load more)

---

## Section 5: Category Story (Editorial Break)

### Layout: Asymmetric 2-column
- 60% image (rounded, overflow hidden) | 40% text
- Alternates direction on different category pages

### Content Structure
```
[Eyebrow]   — "WHY LEGACY CRAFTS" (uppercase, category accent)
[Headline]  — "Crafted for\nGenerations" (serif, text-3xl)
[Body]      — 2–3 paragraphs about process/materials
[Feature List] — 3 bullet points with checkmarks
[CTA Button] — category-colored accent button
```

---

## Section 7: Related Categories

### Design
- 2-card grid showing the other two categories
- Same card style as landing page Category Showcase
- "Explore more" header above

---

## Mobile-Specific Adaptations

| Element | Mobile Change |
|---------|--------------|
| Hero | 40vh, smaller text, no parallax |
| Subcategory nav | Full-width scroll, smaller pills |
| Filter bar | Collapsed to button, opens sheet |
| Grid | 2 columns, smaller cards |
| Story section | Stacked vertically, image on top |
| Related categories | Horizontal scroll cards |

---

## SEO Per Category

| Page | Title | JSON-LD |
|------|-------|---------|
| /trophies | "Custom Trophies & Awards — Legacy Crafts" | CollectionPage + ItemList |
| /furniture | "Handcrafted Furniture — Legacy Crafts" | CollectionPage + ItemList |
| /artwork | "Artwork & Home Decor — Legacy Crafts" | CollectionPage + ItemList |

Open Graph images: category hero image cropped to 1200x630.
