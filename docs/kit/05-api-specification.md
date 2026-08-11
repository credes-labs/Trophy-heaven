# 5. API Specification

Conventions: base paths follow Medusa (`/store/*` = storefront, authenticated as customer or guest session; `/admin/*` = staff, RBAC-guarded). All request bodies are Zod-validated; all responses are JSON. Auth via httpOnly cookie session or `Authorization: Bearer <jwt>`. Standard error envelope:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "…", "details": [ { "path": "name", "issue": "required" } ] } }
```

Common error codes: `400 VALIDATION_ERROR`, `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 NOT_FOUND`, `409 CONFLICT`, `413 PAYLOAD_TOO_LARGE`, `422 UNPROCESSABLE`, `429 RATE_LIMITED`, `500 INTERNAL`.

---

## 5.1 Design API (`/store/designs`)

### `POST /store/designs` — create design
- **Auth:** customer or guest session.
- **Body:**
```ts
{ name: string; mode: "2d" | "3d"; product_id: string; variant_id?: string;
  state_json: object /* design state, see 06 */ }
```
- **201:** `{ design: Design }`
- **Errors:** `400` invalid state, `404` product not found.

### `GET /store/designs` — list caller's designs
- **Auth:** customer. **Query:** `limit`, `offset`, `status?`, `is_template?`.
- **200:** `{ designs: Design[]; count: number }`

### `GET /store/designs/:id` — get one
- **Auth:** owner, or anyone with a valid `share_token` (see share).
- **200:** `{ design: Design }` · **404** if not found/not owned.

### `PUT /store/designs/:id` — update
- **Auth:** owner. **Body:** partial of create body (+ `name`).
- **Behavior:** creates a `DesignRevision` snapshot before applying.
- **200:** `{ design: Design }` · **409** if `status` is `approved`/`in_production` (locked).

### `DELETE /store/designs/:id` — delete
- **Auth:** owner.
- **204** · **409** if referenced by an active cart/order line.

### `POST /store/designs/:id/preview` — (re)generate preview
- **Auth:** owner. **Body:** `{ format?: "png"; width?: number }`.
- **202:** `{ status: "queued", preview_job_id }` or **200:** `{ preview_url }` if synchronous.

### `POST /store/designs/:id/clone` — clone (from template or own design)
- **Auth:** customer. **Body:** `{ name?: string }`.
- **201:** `{ design: Design }` (new id, `is_template: false`, snapshot of source assets).

### `POST /store/designs/:id/share` — generate view-only link
- **Auth:** owner. **200:** `{ share_token, share_url }`. Revocable via `DELETE .../share`.

**Example — create:**
```http
POST /store/designs
Content-Type: application/json

{ "name": "Acme 2024 MVP", "mode": "2d", "product_id": "prod_01H…",
  "state_json": { "version": 1, "objects": [ … ] } }
→ 201 { "design": { "id": "des_01H…", "status": "draft", "preview_url": null, … } }
```

---

## 5.2 Bulk Order API (`/store/bulk-orders`)

### `POST /store/bulk-orders` — create empty bulk order
- **Auth:** customer (typically corporate). **Body:** `{ product_id: string; variant_id?: string; po_number?: string }`.
- **201:** `{ bulk_order: BulkOrder }`

### `POST /store/bulk-orders/:id/upload` — upload Excel/CSV
- **Auth:** owner. **Body:** `multipart/form-data` (`file`). Max size enforced; type = xlsx/csv.
- **Behavior:** server re-parses + validates (name, designation, award_category, char limits, duplicates).
- **200:**
```ts
{ parsed: { total: number; valid: number; invalid: number };
  lines: BulkOrderLine[];               // valid rows
  errors: { row: number; field: string; issue: string }[] }
```
- **Errors:** `413` too large, `422` unreadable file.

### `GET /store/bulk-orders/:id` — details
- **200:** `{ bulk_order: BulkOrder; lines: BulkOrderLine[] }`

### `POST /store/bulk-orders/:id/confirm` — generate designs + convert to cart
- **Auth:** owner. **Behavior:** generates a `Design` per valid line, builds preview grid, creates cart line items referencing each design.
- **200:** `{ cart_id: string; line_item_ids: string[] }` · **409** if unresolved errors remain.

---

## 5.3 Production API — Admin (`/admin/production-jobs`, `/admin/design-approvals`)

### `GET /admin/production-jobs` — list
- **Auth:** Production Manager / Admin (RBAC). **Query:** `status?`, `workshop?`, `complexity?`, `material?`, pagination.
- **200:** `{ production_jobs: ProductionJob[]; count }`

### `GET /admin/production-jobs/:id` — detail
- **200:** `{ production_job: ProductionJob }` (includes design + order refs).

### `PUT /admin/production-jobs/:id/status` — update status
- **Auth:** Production Manager / Admin. **Body:** `{ status: ProductionJobStatus; note?: string; assigned_workshop?: string }`.
- **Behavior:** validates transition; emits status event → notifications.
- **200:** `{ production_job }` · **409** invalid transition.

### `POST /admin/design-approvals/:id/approve`
- **Auth:** Designer / Admin. **Body:** `{ note?: string }`.
- **200:** `{ design_approval, design: { status: "approved" } }`

### `POST /admin/design-approvals/:id/reject`
- **Auth:** Designer / Admin. **Body:** `{ feedback: string; annotated_image_url?: string }` (feedback required).
- **200:** `{ design_approval, design: { status: "rejected_with_feedback" } }`

---

## 5.4 Corporate API (`/store/corporate-profiles`)

### `POST /store/corporate-profiles` — create
- **Auth:** customer. **Body:** `{ company_name: string; tax_id: string; billing_address?: Address }`.
- **201:** `{ corporate_profile }` (`credit_limit`, `payment_terms` set by admin later).

### `GET /store/corporate-profiles/:id` — get
- **Auth:** profile owner / member / Admin. **200:** `{ corporate_profile; team_members }`.

### `POST /store/corporate-profiles/:id/team-members` — add member
- **Auth:** profile owner / Admin. **Body:** `{ email: string; role?: "member" | "manager" }`.
- **201:** `{ team_member }` · sends an invite. **409** if email already a member.

### `GET /store/corporate-profiles/:id/orders` — corporate order history
- **Auth:** owner / member / Admin. **Query:** pagination, `status?`, date range.
- **200:** `{ orders: Order[]; count }`.

---

## 5.5 Webhooks (inbound)

### `POST /webhooks/razorpay` · `POST /webhooks/stripe`
- **Auth:** provider signature verification (reject on mismatch).
- **Idempotency:** dedupe by provider event id; processing is a no-op if the event id was already handled.
- **Behavior:** update payment/order status; on success advance order to `payment_confirmed`; on failure enqueue retry.
- **200** always on accepted-and-verified (even for duplicates), to stop provider retries; **400** on signature failure.

> Documentation deliverable: generate an OpenAPI 3.1 spec from these route definitions and serve via Scalar/Swagger UI (see [10-documentation-requirements.md](./10-documentation-requirements.md)).
