# 9. Risk Analysis & Mitigation

Likelihood/Impact are relative planning judgments, not measured probabilities.

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R1 | 3D models too heavy for mobile | High | High | LOD system, Draco + KTX2 compression, lazy loading behind a gesture, 2D fallback, device-capability detection. |
| R2 | Fabric.js canvas performance on low-end devices | Medium | Medium | Reduced canvas resolution, disable heavy effects on weak devices, throttle re-renders, virtualize layer list. |
| R3 | Payment gateway downtime | Low | Critical | Dual gateway (Razorpay + Stripe), queue failed payments + retry, clear user messaging, reconcile job. |
| R4 | Design state corruption / loss | Low | High | Auto-save every 30s, `DesignRevision` history, strict Zod schema validation on read/write, snapshot before update. |
| R5 | Bulk order Excel parsing errors | Medium | Medium | Client-side validation for instant feedback, **server re-validation as source of truth**, downloadable template, error preview before submit. |
| R6 | Browser compatibility for WebGL/WebXR | Medium | Medium | Feature detection, graceful degradation to 2D, hide unsupported AR entry points, tested WebGL-off path. |
| R7 | DB migration failure | Low | Critical | Backup before migration, test on staging, rollback scripts, never edit shipped migrations. |
| R8 | SEO impact of client-side 3D viewer | Medium | Medium | SSR/ISR for all product pages, viewer behind interaction, pre-rendered meta + JSON-LD, dynamic sitemap. |
| R9 | Custom production delays | High | Medium | Buffer time in delivery estimates, proactive status notifications, capacity view in production dashboard. |
| R10 | Malicious file upload | Medium | High | Type whitelist, size limits, malware/moderation scan, SVG sanitization, signed URLs, no execution of uploads. |
| R11 | Payment webhook duplication / race | Medium | High | Idempotency by provider event id, signature verification, never fulfill without a confirmed order record. |
| R12 | Guest→auth cart/design merge conflicts | Medium | Low | Deterministic merge rules, preserve guest designs, surface conflicts to the user. |
| R13 | Preview generation backlog under load | Medium | Medium | Async queue, batching, autoscale render workers, degrade to client-captured preview when needed. |
| R14 | Corporate net-terms credit risk | Low | Medium | Verified accounts only, enforced credit limits, block + notify account manager on exceed, admin override trail. |
| R15 | Vendor lock-in / stack churn | Low | Medium | Ownable stack (Medusa self-host, shadcn copy-in, R2 portable storage), ADR log to revisit choices deliberately. |

**Escalation:** any Critical-impact risk that materializes (R3, R7, R11) triggers the corresponding runbook in [10-documentation-requirements.md](./10-documentation-requirements.md).
