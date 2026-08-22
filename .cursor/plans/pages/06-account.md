# Account Pages — Complete Specification

---

## Account Layout (shared sidebar + content area)

### Desktop Layout
```
┌──────────┬──────────────────────────────────────────┐
│ Sidebar  │ Content Area                              │
│          │                                           │
│ [Avatar] │ (varies by page)                         │
│ John D.  │                                           │
│          │                                           │
│ Dashboard│                                           │
│ Orders   │                                           │
│ Addresses│                                           │
│ Designs  │                                           │
│ Wishlist │                                           │
│ Coupons  │                                           │
│ Settings │                                           │
│ Corporate│                                           │
│──────────│                                           │
│ Logout   │                                           │
└──────────┴──────────────────────────────────────────┘
```

### Mobile Layout
- No persistent sidebar
- Top: account header with avatar + name
- Horizontal scrollable tab navigation
- Full-width content below

---

## Dashboard (`/account`)

### Layout
```
┌─────────────────────────────────────────────────────┐
│ Welcome back, John!                                  │
├─────────────┬─────────────┬─────────────────────────┤
│ Recent      │ Saved       │ Quick Stats             │
│ Orders (3)  │ Designs (5) │ • 12 orders placed     │
│ [View All]  │ [View All]  │ • 5 designs saved      │
│             │             │ • 2 addresses           │
├─────────────┴─────────────┴─────────────────────────┤
│ [Recent Orders — last 3]                             │
│ ┌───────────────────────────────────────────────┐   │
│ │ #LC-1234 | Aug 15 | 3 items | ₹20,086 | Ship │   │
│ │ #LC-1233 | Aug 10 | 1 item  | ₹2,499  | Done │   │
│ │ #LC-1232 | Jul 28 | 5 items | ₹45,000 | Done │   │
│ └───────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│ [Saved Designs Preview — 3 cards]                    │
│ ┌─────┐ ┌─────┐ ┌─────┐                            │
│ │thumb│ │thumb│ │thumb│                            │
│ │name │ │name │ │name │                            │
│ └─────┘ └─────┘ └─────┘                            │
└─────────────────────────────────────────────────────┘
```

---

## Orders Page (`/account/orders`)

### Order List
```
┌─────────────────────────────────────────────────────┐
│ [Search orders] [Filter: All | Processing | Shipped | Delivered] │
├─────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────┐   │
│ │ Order #LC-1234                    Aug 15, 2026 │   │
│ │ 3 items • ₹20,086                             │   │
│ │ Status: [Shipped 🚚] — Arriving Aug 20-22     │   │
│ │ [Track] [View Details] [Reorder]              │   │
│ └───────────────────────────────────────────────┘   │
│ ... more orders ...                                  │
│ [Load More]                                          │
└─────────────────────────────────────────────────────┘
```

### Order Detail (`/account/orders/[id]`)
```
┌─────────────────────────────────────────────────────┐
│ ORDER #LC-1234                                       │
│ Placed: Aug 15, 2026                                │
├─────────────────────────────────────────────────────┤
│ STATUS TIMELINE                                      │
│ ● Ordered (Aug 15) → ● Processing (Aug 16) →       │
│   ● Shipped (Aug 18) → ○ Delivered (Est Aug 22)    │
├─────────────────────────────────────────────────────┤
│ ITEMS                                                │
│ ┌────┬──────────────────────────────────────────┐   │
│ │img │ Crystal Star Award × 2         ₹4,998    │   │
│ │    │ Customized ✓ [View Design]               │   │
│ └────┴──────────────────────────────────────────┘   │
│ ... more items ...                                   │
├─────────────────────────────────────────────────────┤
│ SHIPPING: John Doe, 123 MG Road, Bangalore 560001  │
│ TRACKING: DTDC #12345678 [Track Package →]          │
├─────────────────────────────────────────────────────┤
│ PAYMENT SUMMARY                                      │
│ Subtotal: ₹20,496 | Shipping: Free | Tax: ₹3,689  │
│ Discount: -₹4,099 | Total: ₹20,086                 │
├─────────────────────────────────────────────────────┤
│ [Download Invoice] [Request Return] [Need Help?]    │
└─────────────────────────────────────────────────────┘
```

---

## Addresses Page (`/account/addresses`)

### Address List
```
┌─────────────────────────────────────────────────────┐
│ SAVED ADDRESSES                    [+ Add New]       │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐     │
│ │ ★ DEFAULT                                    │     │
│ │ John Doe                                     │     │
│ │ 123 MG Road, Indiranagar                    │     │
│ │ Bangalore, Karnataka 560038                  │     │
│ │ Phone: +91 98765 43210                       │     │
│ │ [Edit] [Delete] [Set Default]               │     │
│ └─────────────────────────────────────────────┘     │
│ ┌─────────────────────────────────────────────┐     │
│ │ Office                                       │     │
│ │ John Doe, Acme Corp                          │     │
│ │ 456 Brigade Road, Bangalore 560001           │     │
│ │ [Edit] [Delete] [Set Default]               │     │
│ └─────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────┘
```

### Add/Edit Address Dialog
- Modal/sheet with address form
- PIN code auto-fills city/state (India API)
- "Set as default" checkbox
- Label field (Home, Office, Other)

---

## Wishlist Page (`/account/wishlist`)

### Layout
```
┌─────────────────────────────────────────────────────┐
│ WISHLIST (8 items)                                   │
├─────────────────────────────────────────────────────┤
│ [4-column product grid — same cards as shop]        │
│ Each card has:                                       │
│ - [Remove ×] top-right                             │
│ - [Add to Cart] button below price                 │
│ - "Added Aug 10" date label                        │
├─────────────────────────────────────────────────────┤
│ [Empty state if 0: "Your wishlist is empty"]        │
└─────────────────────────────────────────────────────┘
```

---

## Coupons Page (`/account/coupons`)

### Layout
```
┌─────────────────────────────────────────────────────┐
│ YOUR COUPONS                                         │
├─────────────────────────────────────────────────────┤
│ ACTIVE                                               │
│ ┌───────────────────────────────────────────────┐   │
│ │ [WELCOME20]              20% OFF               │   │
│ │ Valid on first order • Expires Sep 30          │   │
│ │ Min order: ₹2,000                             │   │
│ │ [Copy Code] [Apply to Cart]                   │   │
│ └───────────────────────────────────────────────┘   │
│                                                      │
│ EXPIRED                                              │
│ ┌───────────────────────────────────────────────┐   │
│ │ [SUMMER15]               15% OFF (expired)     │   │
│ │ Was valid until Aug 1                          │   │
│ └───────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## Settings Page (`/account/settings`)

### Sections
1. **Profile** — Name, email (readonly), phone, avatar upload
2. **Password** — Current password, new password, confirm
3. **Notifications** — Email preferences toggles (order updates, promos, newsletter)
4. **Delete Account** — Danger zone, requires password confirmation

---

## Design Gallery (`/account/designs`)

### Layout
```
┌─────────────────────────────────────────────────────┐
│ MY DESIGNS (5)                      [+ New Design]   │
├─────────────────────────────────────────────────────┤
│ [Tabs: All | 2D | 3D | Shared]                      │
├─────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│ │ [Preview] │ │ [Preview] │ │ [Preview] │             │
│ │ Name      │ │ Name      │ │ Name      │             │
│ │ Product   │ │ Product   │ │ Product   │             │
│ │ Modified  │ │ Modified  │ │ Modified  │             │
│ │ [Edit]    │ │ [Edit]    │ │ [Edit]    │             │
│ │ [Clone]   │ │ [Clone]   │ │ [Clone]   │             │
│ │ [Delete]  │ │ [Delete]  │ │ [Delete]  │             │
│ └──────────┘ └──────────┘ └──────────┘             │
└─────────────────────────────────────────────────────┘
```

---

## Authentication Pages

### Login (`/account/login`)
```
┌─────────────────────────────────────────────────────┐
│              [Logo]                                   │
│         Welcome Back                                 │
│                                                      │
│  [Email]                                            │
│  [Password]                         [Forgot?]       │
│  [Sign In] (full-width accent button)               │
│                                                      │
│  ─── or ───                                         │
│  [Continue with Google]                             │
│                                                      │
│  Don't have an account? [Register]                  │
└─────────────────────────────────────────────────────┘
```

### Register (`/account/register`)
```
┌─────────────────────────────────────────────────────┐
│              [Logo]                                   │
│         Create Account                               │
│                                                      │
│  [First Name] [Last Name]                           │
│  [Email]                                            │
│  [Phone]                                            │
│  [Password]                                         │
│  [Confirm Password]                                 │
│  □ I agree to Terms & Privacy Policy               │
│  [Create Account] (full-width accent button)        │
│                                                      │
│  Already have an account? [Sign In]                 │
└─────────────────────────────────────────────────────┘
```
