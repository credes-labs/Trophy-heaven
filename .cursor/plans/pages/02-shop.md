# Shop Page — Complete Specification

## Route: `/shop` (apps/storefront/src/app/(shop)/shop/page.tsx)
## Type: RSC shell + Client interactive filter/sort layer

---

## Page Layout

```
┌─────────────────────────────────────────────────────┐
│ [Breadcrumb]: Home > Shop                           │
├─────────────────────────────────────────────────────┤
│ [Page Header]                                        │
│   "Shop All" (serif, text-4xl)                      │
│   "248 products" (muted, text-sm)                   │
├───────────┬─────────────────────────────────────────┤
│ [Filters] │ [Toolbar: Sort | Grid/List toggle]      │
│           │─────────────────────────────────────────│
│ Category  │ [Product Grid]                          │
│ Price     │   ┌────┐ ┌────┐ ┌────┐ ┌────┐         │
│ Material  │   │    │ │    │ │    │ │    │         │
│ Color     │   └────┘ └────┘ └────┘ └────┘         │
│ Rating    │   ┌────┐ ┌────┐ ┌────┐ ┌────┐         │
│ Custom.   │   │    │ │    │ │    │ │    │         │
│           │   └────┘ └────┘ └────┘ └────┘         │
│           │─────────────────────────────────────────│
│           │ [Load More / Pagination]                 │
└───────────┴─────────────────────────────────────────┘
```

---

## Filter Sidebar (Desktop: 220px fixed, Mobile: Sheet from bottom)

### Filter Groups

| Group | Type | Options |
|-------|------|---------|
| **Category** | Checkbox list with count | Trophies (45), Furniture (120), Artwork (83) |
| **Subcategory** | Nested checkboxes (show when parent selected) | Sports, Corporate, Tables, etc. |
| **Price Range** | Dual-handle slider + min/max inputs | ₹500 — ₹50,000 |
| **Material** | Checkbox with color swatch | Wood, Metal, Crystal, Acrylic, Marble, Leather |
| **Customizable** | Toggle switch | "Can be personalized" |
| **Rating** | Star rating filter (4+, 3+, etc.) | ★★★★☆ & up |
| **Availability** | Toggle | "In Stock Only" |
| **Sort** | Dropdown (desktop: in toolbar) | Relevance, Price ↑, Price ↓, Newest, Bestselling, Rating |

### Filter Interaction
- URL-synced (query params: `?category=trophies&material=wood&sort=price_asc`)
- Instant update (no submit button)
- Active filter pills shown above grid with "Clear All"
- Count updates as filters narrow results
- Debounced 300ms for slider/text inputs

### Mobile Filter Experience
- "Filters" button in toolbar opens full-screen Sheet from bottom
- Each filter group is an Accordion
- "Apply (N results)" sticky button at bottom
- "Reset" link top-right

---

## Toolbar

### Desktop
```
[Active Filters: Category: Trophies × | Material: Wood ×] [Clear All]
                                          [Sort: Relevance ▾] [Grid □ | List ≡]
```

### Mobile
```
[Filters (3)] [Sort ▾]                                      [Grid □ | List ≡]
```

---

## Product Grid

### Grid Layout Options

| View | Desktop | Tablet | Mobile |
|------|---------|--------|--------|
| Grid (default) | 4 columns | 3 columns | 2 columns |
| List | 1 column (horizontal card) | 1 column | 1 column |

### Product Card (Grid View)
```
┌──────────────────────────────┐
│ [Sale Badge: "-20%"]          │ top-left
│ [Wishlist Heart]              │ top-right
│                               │
│ [Product Image]               │ 1:1 aspect, bg-muted, rounded-lg
│                               │
│ [Quick Actions on hover]      │ "Quick View" | "Add to Cart"
├──────────────────────────────┤
│ [Category] "Trophies"         │ text-xs, uppercase, category color
│ [Name] "Crystal Star Award"   │ text-sm, font-medium, truncate 2 lines
│ [Price] ₹2,499               │ text-base, font-semibold
│ [Was] ₹3,199                  │ text-sm, line-through, muted
│ [Rating] ★★★★☆ (4.2) 12 reviews │ text-xs
│ [Colors] ● ● ● (3 variants)  │ 12px circles
└──────────────────────────────┘
```

### Product Card (List View)
```
┌────────────┬─────────────────────────────────────────┐
│            │ [Category] "Furniture"                   │
│  [Image]   │ [Name] "Oak Side Table"                 │
│  200x200   │ [Description] First 2 lines of desc...  │
│            │ [Price] ₹12,999                         │
│            │ [Rating] ★★★★★ (4.8) 24 reviews        │
│            │ [Add to Cart] button                    │
└────────────┴─────────────────────────────────────────┘
```

### Hover Effects (Grid)
- Image: scale 1.03, shadow increases
- Quick action bar slides up from bottom of image area
- Card border subtly appears

---

## Pagination / Infinite Scroll

### Strategy: Hybrid
- Initial: 24 products loaded (SSR)
- "Load More" button loads next 24 (client fetch)
- URL updates with page param for SEO: `/shop?page=2`
- Back button preserves scroll position

### Load More Button
```
[Show More Products (224 remaining)]
```

---

## Empty / Loading States

### Loading
- Skeleton grid (4x2 skeleton cards)
- Filter sidebar: skeleton lines

### No Results
```
[Illustration: empty box]
"No products match your filters"
[Adjust Filters] button | [Clear All Filters] link
```

---

## SEO

- Title: "Shop All Products — Legacy Crafts"
- Description: "Browse our collection of handcrafted trophies, artisan furniture, and curated artwork..."
- Canonical: `/shop`
- JSON-LD: ItemList with first 10 products
- Pagination: `rel=prev` / `rel=next` links

---

## Data Flow

```
[RSC page.tsx]
    │
    ├── Fetch initial products (Medusa SDK, first 24)
    ├── Fetch categories (for filter sidebar)
    ├── Fetch price range (min/max across catalog)
    │
    └── Render <ShopClient initialProducts={...} categories={...} />
            │
            ├── URL state ↔ Filter UI (useSearchParams)
            ├── Client fetch on filter change (Medusa SDK)
            ├── Optimistic UI (show skeletons on grid)
            └── Meilisearch for text search within shop
```

---

## Performance

| Metric | Strategy |
|--------|----------|
| Initial load | SSR 24 products, no client JS for grid |
| Filter change | Client fetch, skeleton UI, 300ms debounce |
| Images | `loading="lazy"` below fold, responsive srcset |
| Bundle | Filter components code-split via dynamic import |
| Cache | ISR 5min for initial data; client SWR for interactions |
