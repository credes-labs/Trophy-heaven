# Change Log — Index

This directory is the project's durable memory. It logs **what changed, why, where,
and how it was verified** — for everything done so far and everything done from now on.
It is organized as an index plus **3 layers of increasing detail**. Read the layer
that matches how much you need to know.

## The layers

| Layer | File(s) | Granularity | Read this when… |
|-------|---------|-------------|-----------------|
| **L1 — Milestones** | [`L1-milestones.md`](L1-milestones.md) | One or two lines per milestone/release | you want the story of the project in 2 minutes |
| **L2 — Work packages** | [`L2-work-packages.md`](L2-work-packages.md) | A paragraph per work package: what, why, key files, verification | you're reviewing a change or onboarding |
| **L3 — Deep details** | [`L3/`](L3/) — one file per work package | Full technical entry: context, decisions, file-by-file changes, gotchas, verification evidence | you're modifying that area and must not break it |

## L3 entries

| # | Title | Layer-2 anchor |
|---|-------|----------------|
| 001 | [Brand foundation & design system](L3/001-brand-foundation.md) | WP-01 |
| 002 | [Backend hardening: Razorpay chain, modules, seeds](L3/002-backend-hardening.md) | WP-02 |
| 003 | [Storefront commerce wiring](L3/003-commerce-wiring.md) | WP-03 |
| 004 | [Content, SEO & imagery](L3/004-content-seo.md) | WP-04 |
| 005 | [UX polish: shop, PDP, landing, cart](L3/005-ux-polish.md) | WP-05 |
| 006 | [Auth, account & platform fixes](L3/006-auth-account-platform.md) | WP-06 |
| 007 | [QA: accessibility, e2e, visual verification](L3/007-qa-verification.md) | WP-07 |

## Rules for future changes (mandatory)

1. **Every change** gets a one-line entry in L1 (date + what + link).
2. **Every work package** gets a paragraph in L2 with: what, why, key files, how verified.
3. **Non-trivial changes** (new module, new integration, schema change, design-system
   change) get an L3 file `NNN-short-title.md` with the template below, and a row in
   the table above.
4. Write entries **before or with** the change, not after the fact. Keep them factual —
   what a future engineer needs, not narration.
5. Never edit history: corrections are new entries referencing the old ones.

## L3 template

```markdown
# NNN — Title

- Date: YYYY-MM-DD · Branch: … · Status: shipped | in-progress | deferred
- Layer-2 anchor: WP-NN

## Context / why
## Decisions made (and alternatives rejected)
## Changes (file → what)
## Gotchas for future work
## Verification (commands + evidence)
```
