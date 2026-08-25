# 016 — CI pipeline: build, integration, e2e

- Date: 2026-08-25 · Branch: feat/figma-homepage-and-image-opt · Status: shipped
- Layer-2 anchor: WP-17

## Context / why

PR #10's **Lint · Typecheck · Unit** job was green after schemas-before-typecheck.
The other three required jobs were not:

1. **Build** — `next build` prerendered `/corporate/bulk`, which called
   `listProducts()` with no catch. Medusa is not running in CI → `fetch` 
   `ECONNREFUSED`, build exit 1.
2. **Integration** — workflow ran
   `pnpm --filter … test:integration --if-present`. pnpm forwarded
   `--if-present` to Jest (`Unrecognized option "if-present"`). There are
   also no `src/modules` integration specs yet.
3. **E2E** — `needs: build`, so it skipped. Independently it would have
   failed: `--if-present` forwarded to Playwright, no production build in
   that job, no Chromium install.

## Decisions made (and alternatives rejected)

- **Swallow catalog fetch failures in `listProducts`.** Same empty-catalog
  contract the shop/category pages already use with `.catch()`. Putting it
  in the helper means a new RSC page cannot fail `next build` when Medusa
  is down. Rejected `force-dynamic` on bulk only — that hides one page and
  leaves the next unguarded caller to fail.
- **`--if-present` before the script name.** That is a pnpm flag, not a
  Jest/Playwright flag.
- **`--passWithNoTests` on `test:integration`.** There are no module
  integration specs; failing the job for an empty pattern is noise.
- **E2E job builds the storefront and installs Chromium** before
  `playwright test`. Artifacts are not shared across GitHub Actions jobs,
  so `needs: build` does not provide `.next`.

## Changes (file → what)

| File | What |
|------|------|
| `apps/storefront/src/lib/data/catalog.ts` | `listProducts` returns `{ products: [], count: 0 }` on fetch failure |
| `.github/workflows/ci.yml` | Postgres health uses `legacy_crafts_test`; pnpm `--if-present` placement; e2e build + Playwright install |
| `apps/medusa/package.json` | `test:integration` `--passWithNoTests` |

## Gotchas for future work

- Real Medusa module integration tests still need to live under
  `apps/medusa/src/modules/**/*.spec.ts` before that job asserts behavior.
- E2E still does not start Medusa; smoke specs must stay empty-catalog resilient.

## Verification (commands + evidence)

```text
CI logs: Build `next build` failed on /(shop)/corporate/bulk ECONNREFUSED
CI logs: Integration Jest Unrecognized option "if-present"
```
