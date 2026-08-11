# 10. Documentation Requirements

What the team must produce and keep current. Each item names the artifact, tool, and owner-of-record.

## 10.1 API documentation
- **Artifact:** OpenAPI 3.1 spec generated from the route definitions in [05](./05-api-specification.md), served via **Scalar** or Swagger UI.
- **Keep current:** regenerate on route change in CI; fail the build if the committed spec drifts from code.

## 10.2 Component documentation
- **Artifact:** Storybook for all shared UI components in `components/ui` and key feature components (editor toolbar, layer panel, material swatch, viewer controls), each with usage examples and accessibility notes.

## 10.3 Database documentation
- **Artifact:** ER diagram (core Medusa + custom tables from [06](./06-data-models.md)), field descriptions, and index rationale. Regenerate the ERD from the schema; note every non-obvious index's reason.

## 10.4 Deployment documentation
- **Artifact:** step-by-step environment setup (local via Docker Compose; staging; production), a complete environment-variable reference (see [14 §D](./14-appendices.md#d-environment-variable-reference)), and secrets-management guidance (managed secret store, rotation).

## 10.5 Design-system documentation
- **Artifact:** color palette (Tailwind v4 `@theme` tokens, OKLCH), typography scale, spacing system, and component usage guidelines. *This will be finalized alongside the deferred UI/UX phase once Figma is provided* — until then, keep tokens in `globals.css` as the single source of truth.

## 10.6 User guides
- **Admin manual:** catalog management, design approval, production queue, corporate accounts, settings.
- **Customer customization guide:** in-app tooltips + a help-center article covering the 2D editor, 3D viewer, saving/sharing designs, and bulk upload.

## 10.7 Runbooks
- **Incident response:** severity levels, on-call flow, comms template.
- **Payment reconciliation:** handling "charged but no order," duplicate webhooks, refunds (ties to R3/R11 in [09](./09-risk-analysis.md)).
- **Database recovery:** restore from `pg_dump` / PITR, verify integrity, resync search index.
- **Migration rollback:** pre-migration backup checklist, rollback script execution, post-rollback verification.
- **3D/asset pipeline recovery:** re-run failed preview jobs, re-sync CDN, re-validate a rejected glTF.

## 10.8 Documentation hygiene
- Docs live in-repo next to the code they describe where possible; this PRD set is the top-level `docs/`.
- Every ADR (see [14 §C](./14-appendices.md#c-architecture-decision-records-adr)) is appended, never rewritten, so decision history is auditable.
