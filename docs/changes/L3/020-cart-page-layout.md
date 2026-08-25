# 020 — Cart page and sidebar cart

- Date: 2026-08-25 · Branch: feat/shop-page-layout · Status: in-progress
- Layer-2 anchor: WP-20

## Context / why

The full cart and sidebar drawer still used the older Playfair / bordered-card
catalog look. A cart screenshot was a **structure** reference only (2/3 items |
1/3 totals, X + thumb + qty row, coupon under the list, CART TOTALS). Chrome,
type, and color stay the homepage / shop Outfit cream system — not the demo
theme (Simply Soluble, subscription radios, teal badges).

## Decisions made (and alternatives rejected)

- **Header and footer stay Legacy Crafts.** Reference placement only.
- **Cream `max-w-[90em]` shell** matching `/shop` and the PDP, with
  `lg:[font-size:min(1rem,calc(100vw/90))]`.
- **Layout CSS in `cart.css`** so the 2fr/1fr split and item row are not lost
  if Tailwind arbitrary grids fail to land in the loaded CSS (same gotcha as
  PDP `pdp.css`).
- **No subscription radios** — this catalog has one-time SKUs.
- **Coupon lives under the item list** (screenshot), not inside totals.
  `UPDATE CART` re-retrieves the Medusa cart (`refresh`); qty changes still
  write immediately via `updateItem`.
- **Totals always show shipping + tax**, including Free / ₹0, then Subtotal,
  then Total. Walnut `PROCEED TO CHECKOUT` + `< CONTINUE SHOPPING`.
- **Sidebar cart** uses the same cream / Outfit / X + thumb + stepper language,
  not the white sheet + number input.
- **Thumbs go through `localizeImageUrl` + `next/image`.** Cross-sell tiles
  use `EditorialProductCard`.

## Changes (file → what)

| File | What |
|------|------|
| `app/(shop)/cart/page.tsx` | Cream shell, Back, YOUR CART, coupon + update, 2-col layout |
| `app/(shop)/cart/cart.css` | 2/3–1/3 split, item row, coupon row, recs grid |
| `cart-item.tsx` | X \| square thumb \| title+variant \| qty \| line + unit price |
| `promo-code.tsx` | “Have a coupon?” underline input + APPLY |
| `order-summary.tsx` | Hairline CART TOTALS, no nested promo, walnut CTA |
| `cart-drawer.tsx` | Cream sheet matching the full cart; footer lists shipping, tax, discount, subtotal, total |
| `cart-thumb.tsx` | Shared localized square thumb |
| `cart-recommendations.tsx` | Outfit heading + editorial 4-up |
| `stores/cart-store.ts` | `refresh()` retrieve (init no-ops if cart is set) |

## Gotchas for future work

- `init()` still returns early when a cart is already in memory. Use `refresh()`
  for an explicit re-fetch.
- Do not restyle `/shop`. Cart CSS is page-local.

## Verification (commands + evidence)

- `pnpm --filter @legacy-crafts/storefront typecheck` — green.
- Browser `/cart` (1406px): `.cart-layout` columns `2fr | 1fr`, totals left hairline, YOUR CART, X + thumb + qty, coupon + APPLY + UPDATE CART, CART TOTALS, walnut PROCEED TO CHECKOUT. Qty + went 3→4 and line total updated. Invalid coupon surfaces a status error. Header CART opens the cream drawer (X, thumb, stepper, PROCEED TO CHECKOUT, VIEW FULL CART). `/shop` still shows the browse collection.
