# 072 — Shop photos in Medusa, edits that stick

- Date: 2026-11-25 · Branches: client-preview, main · Status: ready to deploy
- Layer-2 anchor: WP-116

## Context / why

The owner must be able to change shop products himself: photos, names, prices, and deleting pieces. Seeded photos pointed at storefront files, which the admin cannot replace. The pre-deploy command runs the bootstrap on every deploy, so deleted products, posts and reviews would have come back. Page design and the placement of homepage cut-outs stay in code, as agreed.

## Decisions made (and alternatives rejected)

- Product photos move into the File module through a scheduled job (`import-catalog-images`, every 5 minutes). Railway mounts the upload volume only on the running container, not in pre-deploy ([Railway volumes](https://docs.railway.com/volumes)), so a pre-deploy upload would be lost. Rejected bundling the photos into the Medusa image: it would duplicate the files in the repo.
- The job downloads from the public storefront (`STOREFRONT_PUBLIC_URL`, else `STORE_CORS`), or reads the monorepo files when they are on disk (local dev). It moves a product only when every source file is available. It skips any image that is not a storefront `/images/…` URL, so photos the owner uploads are never touched.
- The bootstrap seeds once per `SEED_VERSION`, stored in store metadata. Rejected removing bootstrap from pre-deploy: a fresh database still needs it, and the search reindex is useful on every deploy.
- Selected Editions keeps the coded tiles and cut-outs. It reads names and prices from the store API by handle, and drops a tile whose product was deleted. If the API is unreachable, it keeps the coded values.

## Changes (file → what)

- `apps/medusa/src/lib/catalog-images.ts` (+ spec) — import logic, `storefrontImagePath`, `storefrontOrigins`
- `apps/medusa/src/jobs/import-catalog-images.ts` — the job
- `apps/medusa/src/scripts/bootstrap.ts` — `SEED_VERSION` gate
- `apps/medusa/src/scripts/seed.ts` — the plaque photo refresh only replaces an old storefront asset, never a File-module image
- `apps/storefront/src/lib/data/catalog.ts` — `getProductsByHandles` (null when the backend is down)
- `apps/storefront/src/app/page.tsx`, `editions/constants.ts` (+ test), `editions/selected-editions.tsx` — live names and prices
- `apps/storefront/next.config.ts` — `dangerouslyAllowLocalIP` in development only, because Next 16 refuses localhost:9000 images
- `AGENTS.md`, `docs/deployment.md`

## Gotchas for future work

- `upload_dir: "static"` is relative to the working directory. Run the import only inside the server, never from a script that changes directory.
- Bumping `SEED_VERSION` re-runs the seed and recreates any seeded product the owner deleted.
- Hero, category and footer cut-outs are design assets in code. The admin does not change them.

## Verification (commands + evidence)

- Typecheck and lint (no new warnings). Storefront Vitest 143/143 and Medusa Jest 77/77.
- The download path was tested with no storefront folder beside Medusa: 66 photos for 26 products were fetched from the live Vercel site.
- Local dev server: the scheduled job moved 66 photos for 26 products. No seeded `/images/` URLs remained. The files return 200 image/webp, and the search index has the new thumbnails.
- Shop, product and home pages showed 12, 8 and 8 Medusa images, none broken.
- Admin API as the owner would use it: a new photo upload, a rename and a price change all appeared on the homepage tile and on the product page. A following bootstrap logged "already applied" and left the edits in place. The test product was then restored and the test admin removed.
- `next build` passes, and the homepage is still ISR (5 minutes).
