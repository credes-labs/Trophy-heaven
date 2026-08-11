# 7. Testing Strategy

> Section number 7 is retained for the *testing* strategy. The original brief's Section 7 (UI/UX specs) is **deferred** to a later Figma-driven phase — see the note in [00-index.md](./00-index.md).

Coverage philosophy: heaviest automated coverage on money paths (checkout, payment webhooks, design→order linkage) and on the customization engine's state serialization (a corrupt design is a lost order). Aim for meaningful coverage, not a blanket percentage.

## 7.1 Unit testing

- **Frontend:** Vitest + React Testing Library. Target the editor state reducers (undo/redo, serialize/deserialize round-trips), price calculators, validators (safe-area, resolution, char limits), and cart store logic. Mock Fabric/R3F where they touch the DOM/WebGL.
- **Backend:** Jest with `medusa-test-utils`. Cover service layer: `DesignService`, `PreviewGenerationService`, `ProductionQueueService` routing, `ExcelParserService` validation, `CorporateService` credit/terms logic, payment webhook idempotency.
- **Schema tests:** every Zod schema in [06](./06-data-models.md) gets valid/invalid fixtures; the 2D/3D design-state schemas get round-trip tests (serialize → parse → deep-equal).

## 7.2 Integration testing

- API endpoints via supertest against a test Medusa instance (all routes in [05](./05-api-specification.md)).
- Payment webhooks against Razorpay/Stripe **test modes**: success, failure, duplicate-delivery (idempotency), signature mismatch.
- File upload flow: type whitelist, size cap, malware/moderation stub, SVG sanitization.
- Bulk upload: client parse + server re-validation agreement; malformed rows surfaced correctly.

## 7.3 End-to-end testing (Playwright)

Critical journeys:
1. Browse → Customize 2D → Add to Cart → Checkout (Razorpay test) → Order Confirmation.
2. Browse → 3D preview → Customize → Save Design → Share (open share URL in a fresh context).
3. Corporate: Bulk Upload → Validate (with intentional bad rows) → Preview grid → Confirm → multi-recipient order.
4. Production: `order.placed` → design approval (approve + reject-with-feedback) → status transitions → notification fired.

Also: mobile-viewport runs of journeys 1–2; cross-browser matrix (Chromium, Firefox, WebKit) for the storefront and editor; a WebGL-disabled run asserting the 2D fallback.

## 7.4 Performance testing

- Lighthouse CI on PDP, category, home, and the customize entry page (target 90+ all categories).
- 3D viewer load-time benchmark: time-to-first-frame after gesture on a low-end profile vs desktop; assert LOD selection.
- 2D editor Time-to-Interactive budget.
- API load testing with k6/Artillery on catalog, cart, and design-create endpoints; capture p50/p95/p99.

## 7.5 Accessibility testing

- axe-core automated checks in CI on every page and in the editor.
- Keyboard-navigation tests for the 2D editor (tab order, focus traps in modals/bottom sheets, escape to close).
- Manual screen-reader passes (NVDA on Windows, VoiceOver on macOS/iOS) on checkout and account flows.
- Assert 44px minimum touch targets on mobile controls.

## 7.6 CI gates

Pipeline order: lint → type-check (TS7) → unit → integration → build → (on main/preview) E2E smoke + Lighthouse CI + axe. Block merge on failing money-path E2E or a Lighthouse regression beyond threshold.
