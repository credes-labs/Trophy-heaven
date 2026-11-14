# 061 - Design and document uploads that reach the owner (WP-97)

## Why
Customers could only type a sticker description on product pages, and the cart's order-wide section was one file plus a notes box. The owner wants real uploads: a design image/PDF per piece, and any documents (name lists, spreadsheets, briefs) for the whole order, delivered to them with the order.

## Changes (file → what)
- `apps/medusa/src/lib/design-upload.ts` → `UploadKind` (`design`/`document`), `DOCUMENT_UPLOAD_TYPES`, `sniffDocumentMime` (bytes pick the family, extension picks the type).
- `apps/medusa/src/api/store/design-uploads/route.ts` → optional `kind` in the body.
- `apps/medusa/src/lib/order-files.ts` → `collectOrderFiles` (cart `order_documents`, legacy `order_design_file`, line `design_upload`), `renderOwnerOrderEmail` (escaped HTML).
- `apps/medusa/src/subscribers/order-placed.ts` → owner email to `ORDER_NOTIFY_EMAIL` (template `order-owner`, subject/html passed as content); failures are logged, never block the customer email.
- `apps/storefront/src/lib/design-uploads.ts` → kinds, `uploadAccept`, `UPLOAD_HINT`, `ORDER_DOCUMENTS_KEY`, `ORDER_DOCUMENTS_MAX` (10), `readOrderDocuments`.
- `apps/storefront/src/components/features/cart/design-dropzone.tsx` (new) → drop/click field, single or multi-file, sequential uploads, remove/replace.
- `cart/order-design-panel.tsx`, `cart/cart-drawer.tsx`, `cart/design-upload-button.tsx` (kind prop), `catalog/product-actions.tsx`, `customize/configurator/plaque-configurator.tsx`.

## Gotchas for future work
- Metadata: cart `order_documents` is an array of `{url, filename, mime_type, size}`; writing it also clears the old `order_design_file`. `order_design_notes` and line `sticker_design` are legacy (read and shown, no longer written).
- Order-wide appends read the cart from `useCartStore.getState()` so several files in one pick each append to the newest list.
- Files are stored `public` through the File module (local provider: `/static/<timestamp>-<name>`). URLs are not secret; switch to private access plus signed links if documents become sensitive.
- The owner email needs `RESEND_API_KEY` and `ORDER_NOTIFY_EMAIL`; without them the local provider only logs. Files are also visible in the admin under order and line-item metadata.
- CSV/TXT can't be sniffed by magic bytes; they are accepted only with that extension and no NUL byte in the first 8 KB.

## Verification (commands + evidence)
```
pnpm typecheck                                    # all packages Done
npx vitest run (storefront)                       # 27 files, 121 tests passed
TEST_TYPE=unit npx jest --testPathPattern="design-upload|order-files"   # 2 suites, 9 tests passed
POST /store/design-uploads names.csv kind=document  -> 201 text/csv
POST /store/design-uploads names.csv (design)       -> 400 UNSUPPORTED_TYPE
POST /store/design-uploads evil.exe kind=document   -> 400 UNSUPPORTED_TYPE
Chromium: PDP upload logo.png -> add to cart -> cart line shows logo.png; cart panel 2 of 10 files; no page errors
```
