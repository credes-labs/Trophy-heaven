# 062 — Next.js 16.4.6 Google font build fix

- Date: 2026-11-23 · Branch: current · Status: shipped
- Layer-2 anchor: WP-101

## Context / why

`next build` on Next.js 16.3.0 (Turbopack) failed while loading fonts from `apps/storefront/src/app/layout.tsx`:

```
Module not found: Can't resolve '@vercel/turbopack-next/internal/font/google/font'
next/font/google queries have exactly one entry
```

The import trace pointed at the generated Playfair Display CSS module. Google Fonts sometimes answers Next's font request with an extensionless file URL (`https://fonts.gstatic.com/l/font?kit=…&skey=…&v=…`) instead of a `/s/…/*.woff2` path. Turbopack in 16.3.0 parsed that JSON query as a query string, so the `&` characters split it into more than one entry and the font replacer bailed. The same response is a successful HTTP 200, so Next's font download retry does not help. Tracked as vercel/next.js#99114; fixed in PR #100158, which is in the 16.4.6 release.

## Decisions made (and alternatives rejected)

- Upgrade the storefront from `next@16.3.0` to `next@16.4.6` (current stable). That release percent-encodes the font options as a single query value and reads the font type from the CSS `format()` hint when the URL has no extension.
- Leave the four `next/font/google` calls in `layout.tsx` as they are. Urbanist, Marcellus, Inter and Playfair Display are still the right faces.
- Do not vendor the font files. Self-hosting would also avoid the bad URL, but the framework fix covers every Google font without a second copy of the files in the repo.

## Changes (file → what)

- `apps/storefront/package.json` — `next` `16.3.0` → `16.4.6`
- `pnpm-lock.yaml` — lockfile updated for that install

## Gotchas for future work

- Reproduced only when Google returns the `/l/font?kit=` shape. A rebuild on 16.3.0 can pass and then fail later.
- `apps/storefront/src/app/opengraph-image.tsx` still sets `runtime = "edge"`. Next 16.4.6 warns that the Edge Runtime is deprecated. The page still builds as a dynamic route. Moving it to the Node.js runtime is separate work.
- The jsdom / `canvas` peer warning during install is unchanged and unrelated.

## Verification (commands + evidence)

- `pnpm --filter @trophy-heaven/storefront build` — Next.js 16.4.6 (Turbopack), compiled successfully, TypeScript finished, 49/49 static pages generated. No font module error.
