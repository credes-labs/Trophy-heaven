# Trophy Heaven — Product PRD & Implementation Roadmap

> **Product:** Trophy Heaven — premium e-commerce for custom trophies and awards, with a real-time 2D/3D trophy customization engine.
> **Deliverable:** WHAT to build + HOW + WHY. No time estimates, sprints, or Gantt charts.
> **Audience:** Engineering, product, and design teams implementing the platform (optimized for use as Cursor / AI-agent context).

---

## How to use this doc set (Cursor)

- Each file is a self-contained section with stable heading anchors. Reference a file directly in Cursor (e.g. `@06-data-models.md`) when working on that area.
- Cross-references use relative links (e.g. [Data Models](./06-data-models.md#61-design-entity)).
- Code blocks (TypeScript interfaces, Zod schemas, Medusa module skeletons, SQL) are meant to be copied and adapted, not treated as final production code.
- Keep this index open as the map; open only the sections relevant to the current task to keep context tight.

---

## Document map

| # | File | Covers |
|---|------|--------|
| 00 | [00-index.md](./00-index.md) | This index, stack summary, conventions |
| 01 | [01-executive-summary.md](./01-executive-summary.md) | Vision, differentiator, users, scope, guardrails |
| 02 | [02-product-requirements.md](./02-product-requirements.md) | Full PRD — catalog, customization engine, auth, cart, payments, orders, bulk/corporate, search, content, admin, NFRs |
| 03 | [03-technical-architecture.md](./03-technical-architecture.md) | System overview, frontend, backend (Medusa v2 modules), database, asset pipeline, integrations, security, DevOps |
| 04 | [04-implementation-roadmap.md](./04-implementation-roadmap.md) | Phases 1–6 with approach, dependencies, Definition of Done |
| 05 | [05-api-specification.md](./05-api-specification.md) | Design, Bulk Order, Production, Corporate API contracts |
| 06 | [06-data-models.md](./06-data-models.md) | TS/Zod entities, 2D & 3D design-state JSON schemas, migrations |
| 07 | [07-testing-strategy.md](./07-testing-strategy.md) | Unit, integration, E2E, performance, accessibility |
| 08 | [08-services-and-costs.md](./08-services-and-costs.md) | Third-party service catalog + MVP/scale cost model |
| 09 | [09-risk-analysis.md](./09-risk-analysis.md) | Risk register + mitigations |
| 10 | [10-documentation-requirements.md](./10-documentation-requirements.md) | Docs the team must produce |
| 11 | [11-success-metrics.md](./11-success-metrics.md) | Business, technical, and product KPIs |
| 12 | [12-future-roadmap.md](./12-future-roadmap.md) | Post-MVP capabilities + architectural hooks |
| 13 | [13-constraints-and-assumptions.md](./13-constraints-and-assumptions.md) | Locked decisions and operating assumptions |
| 14 | [14-appendices.md](./14-appendices.md) | Glossary, ADR log, env var reference, folder structure |

> **UI/UX Specifications (original Section 7): deferred.** Detailed screen specs, wireframes, and interaction patterns will be authored in a later phase once Figma files are provided (as Figma MCP links or exported images). This doc set intentionally omits pixel-level UI specs; functional and structural requirements for each screen live in [02-product-requirements.md](./02-product-requirements.md) and [03-technical-architecture.md](./03-technical-architecture.md).

---

## Finalized technology stack (verified stable, August 2026)

Versions below supersede the older versions named in the source brief (Next.js 15, Fabric.js 6, R3F 8-era). Use these.

| Layer | Choice | Version | Rationale |
|-------|--------|---------|-----------|
| Framework | Next.js (App Router) | **16.3** | Turbopack default, React Compiler stable, Cache Components / PPR, improved routing. |
| UI runtime | React | **19.2** | Server Components, `use cache`, View Transitions, Activity. |
| Language | TypeScript | **5.9+** (TS7 for typecheck) | Type safety end-to-end; Next 16 can typecheck with the faster TS7. |
| Styling | Tailwind CSS | **v4** | CSS-first `@theme`, OKLCH colors, faster engine, no JS config. |
| Components | shadcn/ui | CLI **4.x** | Copy-in primitives (Base UI default, Radix supported), Tailwind-native, fully ownable. |
| Client state | Zustand | **5.x** | Minimal, ideal for cart + editor stores. |
| Server state | TanStack Query | **v5** | Caching, mutations, optimistic updates for interactive surfaces. |
| Animation | Motion | latest | Successor to Framer Motion; declarative animations, layout transitions. |
| 2D editor | Fabric.js | **7.x** | Mature canvas object model, JSON (de)serialization, SVG parsing; Node ≥20. |
| 3D renderer | React Three Fiber | **9.x** | Declarative Three.js in JSX, React 19 compatible. |
| 3D helpers | @react-three/drei | **9.116+** | OrbitControls, Environment, useGLTF, Bounds, Stats. |
| 3D core | Three.js | latest | WebGL/WebGPU renderer, PBR materials, glTF loader. |
| Commerce backend | Medusa.js | **v2.18** | Modular architecture, custom modules, workflows, full ownership. |
| ORM (Medusa) | MikroORM | **6.6.14** | Bundled with Medusa; patched (CVE-2026-44680). |
| Runtime | Node.js | **24 LTS** | Active LTS through Apr 2028; npm 11, modern V8. |
| Primary DB | PostgreSQL | **18** | Async I/O, `uuidv7()`, virtual generated columns, skip-scan indexes. |
| Cache / sessions | Redis | **7** (Valkey 8 acceptable) | Cart, sessions, rate-limit counters, pub/sub. |
| Search | Meilisearch | **v1.x** | Typo tolerance, facets; self-hostable (cost). Algolia = managed alternative. |
| File storage | S3-compatible + CDN | — | AWS S3 or Cloudflare R2; CloudFront/Cloudflare CDN. |
| Image/3D optimize | Cloudinary | — | `f_auto,q_auto` transforms, video/GIF delivery. |

See [13-constraints-and-assumptions.md](./13-constraints-and-assumptions.md) for the full list of locked decisions and [14-appendices.md](./14-appendices.md#c-architecture-decision-records-adr) for the ADR log capturing every "why".

---

## Conventions used across these docs

- **Requirement IDs:** `FR-<module>-<n>` (functional), `NFR-<n>` (non-functional). Referenced by acceptance criteria.
- **Priority:** `P0` (MVP-blocking), `P1` (MVP), `P2` (fast-follow), `P3` (post-MVP).
- **Design state** always refers to the serialized JSON that describes a customized trophy; see [06-data-models.md](./06-data-models.md).
- **Custom trophy** = a product line item that references a `design_id`. **Standard product** = catalog item with no design.
