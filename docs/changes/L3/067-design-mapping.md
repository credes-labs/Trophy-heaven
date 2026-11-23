# 067 — Match designs to trophies

- Date: 2026-11-23 · Branch: main · Status: shipped
- Layer-2 anchor: WP-106

## Context / why

Customers can upload designs in bulk. The owner needs to know which design goes on which physical trophy, and a cart should not hold more designs than trophies.

## Decisions made (and alternatives rejected)

- A piece is one physical trophy, so a line with quantity 3 has three mappable slots.
- Images are designs, capped at `min(pieces, 50)`, and each must be used at least once.
- PDFs and office files are whole-order documents (max 10) with no mapping, because they often describe many trophies.
- Rejected mapping per line only: a quantity of 3 can carry three different designs.

## Changes (file → what)

- `apps/storefront/src/lib/design-mapping.ts` — rules, suggestions, stored shape
- `apps/storefront/src/hooks/use-order-documents.ts` — upload, save, remove
- `apps/storefront/src/components/features/cart/design-mapping-dialog.tsx` — mapping UI
- `apps/medusa/src/lib/order-files.ts`, `cart-complete-guard.ts` — server enforcement

## Gotchas for future work

- Medusa crashes on `null` inside metadata arrays, so an empty piece is `{}`.
- Medusa's line order is unstable; use `stableLines`.
- Lowering a quantity can leave a design unused, which blocks checkout until resolved.

## Verification (commands + evidence)

- Unit tests in both apps.
- Browser: 3 trophies + 5 images + PDF rejected 2 images, opened the dialog, blocked save with an unused design, and placed an order with mappings.
