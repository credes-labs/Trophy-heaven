# 12. Future Roadmap & Extensibility

Post-MVP capabilities and the architectural hooks that keep them cheap to add later. The point is not to build these now, but to avoid decisions that foreclose them.

| # | Capability | Architectural hook to preserve now |
|---|-----------|-----------------------------------|
| 1 | **AI design assistant** (auto-layout, occasion-based suggestions) | Design state is clean JSON ([06](./06-data-models.md)); a vision-language model (e.g. GPT-4V or Claude with vision) can read/emit it. Keep `state_json` schema-versioned. |
| 2 | **Marketplace** (third-party designers sell templates, commission) | `DesignPreset` already models templates; add `author_id` + commission fields; reuse the approval pipeline for template review. |
| 3 | **Subscription service** ("Trophy of the Month," decor boxes) | Keep order/customer modules standard so Medusa subscription patterns slot in; wallet/loyalty schema hooks noted in cart ([02 §2.4](./02-product-requirements.md#24-cart--checkout)). |
| 4 | **B2B white-label portal** for event companies | CorporateAccount module + RBAC generalize to tenant-scoped branding; keep theming in Tailwind tokens, not hardcoded. |
| 5 | **Native mobile app** (React Native) | Business logic lives in Medusa APIs, not the web client; share types (Zod schemas) as a package. |
| 6 | **Live design consultation** (video with in-house designers) | Design share links + approval threads already exist; add a scheduling + video integration around them. |
| 7 | **3D-printing integration** (direct-to-print) | 3D design state + validated glTF pipeline feed a print provider; add a fulfillment provider like any other. |
| 8 | **Loyalty & gamification** (points for shares/referrals/repeat) | Emit the funnel events from [11](./11-success-metrics.md) now; a points ledger consumes them later. |
| 9 | **Multi-language & multi-currency** (Hindi, Tamil; currency switcher) | Next.js i18n routing + Medusa region/currency support; avoid hardcoded copy and single-currency assumptions. |
| 10 | **Advanced AR** (room-scale furniture with occlusion/lighting) | WebXR abstraction from Phase 3 isolates AR; upgrade the AR module without touching commerce. |

**Extensibility principles**
- New behavior arrives as a **Medusa module + subscribers**, not by editing core.
- Keep `state_json` **schema-versioned** so old designs remain readable as the engine evolves.
- Keep the storefront a **thin consumer of APIs** so other clients (native app, white-label) reuse the same backend.
