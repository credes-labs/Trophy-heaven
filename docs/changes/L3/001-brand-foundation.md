# 001 — Brand foundation, audit & execution system

- Date: 2026-08-21 · Branch: `kimi` (created here) · Status: shipped
- Layer-2 anchor: WP-01

## Context / why

The goal: complete the Legacy Crafts ecommerce build guided by the brand identity deck
(PDF) and a set of reference designs, with a resumable multi-phase execution system.
A large prior build existed as uncommitted work on `main` (Cursor phases), so the
first job was to establish ground truth: what the brand actually is, what exists,
what's missing.

## Decisions made (and alternatives rejected)

- **Brand contract locked from the PDF, not from memory**: rendered all 15 PDF pages
  (PyMuPDF via a temp venv — the PDF is image-only, no text layer) and extracted:
  palette (Stone cream, walnut, brass gold, burgundy accent, deep blue custom, olive),
  typography (high-contrast serif wordmark + letter-spaced small caps), the four-petal
  "l" monogram, materials (brass/stone/wood/leather/steel), voice ("Crafted with
  intention. Built to last."). User's "red/blue/green" maps to burgundy→trophies,
  deep blue→furniture, olive→artwork — matching the deck's own color-direction page.
- **Audit before edits**: three parallel read-only audits (storefront, backend,
  assets/SEO) against `.cursor/plans/` — produced the prioritized gap list that all
  later waves executed. Rejected: diving into fixes page-by-page (would have missed
  systemic issues like the Razorpay chain and image pipeline).
- **Execution tracker as the "one goal command" system**:
  `.cursor/plans/KIMI-EXECUTION-STATUS.md` records status, waves, deferred items, and
  resume instructions, instead of inventing a new orchestration file format.
- **skills.sh**: installed `vercel-react-best-practices`, `web-design-guidelines`,
  `vercel-react-view-transitions`, `vercel-composition-patterns` into `.agents/skills/`
  (via `npx skills add vercel-labs/agent-skills`).

## Changes (file → what)

- `.cursor/plans/KIMI-EXECUTION-STATUS.md` → living execution tracker (brand contract,
  waves, verification commands, architecture decisions).
- `.agents/skills/**` → installed agent skills.
- Branch `kimi` created from `main` (carried prior uncommitted work).

## Audit findings that drove later waves (summary)

- Storefront: promo/coupons/wishlist stubs, broken links, placeholder imagery, missing
  bestsellers carousel, hardcoded reviews, SEO JSON-LD gaps, missing icons.
- Backend: seed typecheck broken, Razorpay webhook log-only + authorize unconditionally
  (payment integrity hole), missing DB indexes, thin seeds, no contact/newsletter routes.
- Assets/SEO: 9 product PNGs unreferenced by seeds, blog posts without covers, missing
  favicon/PWA icons, placeholder legal copy.

## Verification

- Baseline: storefront + packages typecheck green; medusa typecheck failed (8 errors in
  `scripts/seed.ts` → fixed in 002). Baseline unit tests: 44 green (30 storefront,
  14 medusa).
