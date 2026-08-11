# 6. Data Models & Schemas

TypeScript types + Zod schemas for custom entities, plus the 2D/3D design-state JSON schemas and migration guidance. These are contracts to implement against; adapt field-level Medusa/MikroORM decorators as needed. IDs use `uuidv7()` (Postgres 18) for time-ordered keys.

```ts
// shared.ts
import { z } from "zod"
export const zId = z.string().min(1)
export const zTimestamps = z.object({
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})
```

---

## 6.1 Design entity

```ts
export const DesignStatus = z.enum([
  "draft", "submitted_for_review", "changes_requested", "approved", "rejected_with_feedback",
])
export type DesignStatus = z.infer<typeof DesignStatus>

export const DesignSchema = z.object({
  id: zId,
  customer_id: zId.nullable(),        // null = guest/session-owned
  name: z.string().min(1).max(120),
  mode: z.enum(["2d", "3d"]),
  product_id: zId,
  variant_id: zId.nullable(),
  state_json: z.unknown(),            // validated by Design2DState / Design3DState (6.7/6.8)
  preview_url: z.string().url().nullable(),
  status: DesignStatus.default("draft"),
  is_template: z.boolean().default(false),
  share_token: z.string().nullable(),
  complexity: z.enum(["simple", "medium", "complex"]).nullable(),
}).merge(zTimestamps)
export type Design = z.infer<typeof DesignSchema>
```

## 6.2 Design preset entity

```ts
export const DesignPresetSchema = z.object({
  id: zId,
  name: z.string().min(1).max(120),
  category: z.string(),                 // e.g. "sports", "corporate", "academic"
  occasion: z.string().nullable(),
  mode: z.enum(["2d", "3d", "both"]),
  base_product_id: zId,                 // product this preset customizes
  default_state_json: z.unknown(),      // seed design state to clone
  preview_url: z.string().url(),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
}).merge(zTimestamps)
export type DesignPreset = z.infer<typeof DesignPresetSchema>
```

## 6.3 Design revision entity

```ts
export const DesignRevisionSchema = z.object({
  id: zId,
  design_id: zId,
  state_json: z.unknown(),
  revision_number: z.number().int().nonnegative(),
  created_by: zId.nullable(),           // user or system (autosave)
  created_at: z.string().datetime(),
})
export type DesignRevision = z.infer<typeof DesignRevisionSchema>
```

## 6.4 Production job entity

```ts
export const ProductionJobStatus = z.enum([
  "pending_design_approval", "design_approved", "queued", "in_production",
  "quality_check", "packed", "completed", "on_hold", "cancelled",
])
export type ProductionJobStatus = z.infer<typeof ProductionJobStatus>

export const ProductionJobSchema = z.object({
  id: zId,
  order_id: zId,
  order_line_item_id: zId,
  design_id: zId,
  status: ProductionJobStatus.default("pending_design_approval"),
  complexity: z.enum(["simple", "medium", "complex"]),
  material: z.string(),                 // routing key
  assigned_workshop: z.string().nullable(),
  estimated_completion: z.string().datetime().nullable(),
  started_at: z.string().datetime().nullable(),
  completed_at: z.string().datetime().nullable(),
  notes: z.array(z.object({
    author_id: zId, body: z.string(), at: z.string().datetime(),
  })).default([]),
}).merge(zTimestamps)
export type ProductionJob = z.infer<typeof ProductionJobSchema>
```

## 6.5 Design approval entity

```ts
export const DesignApprovalSchema = z.object({
  id: zId,
  design_id: zId,
  reviewer_id: zId.nullable(),
  status: z.enum(["pending", "approved", "rejected", "changes_requested"]).default("pending"),
  feedback: z.string().nullable(),               // required when rejected/changes_requested
  annotated_image_url: z.string().url().nullable(),
  resolved_at: z.string().datetime().nullable(),
}).merge(zTimestamps)
export type DesignApproval = z.infer<typeof DesignApprovalSchema>
```

## 6.6 Corporate profile, team member, bulk order

```ts
export const CorporateProfileSchema = z.object({
  id: zId,
  customer_id: zId,
  company_name: z.string().min(1),
  tax_id: z.string().min(1),                     // GST/Tax ID
  credit_limit: z.number().nonnegative().default(0),
  payment_terms: z.enum(["prepaid", "net_30", "net_60"]).default("prepaid"),
  account_manager_id: zId.nullable(),
  is_verified: z.boolean().default(false),
}).merge(zTimestamps)
export type CorporateProfile = z.infer<typeof CorporateProfileSchema>

export const TeamMemberSchema = z.object({
  id: zId,
  corporate_profile_id: zId,
  email: z.string().email(),
  customer_id: zId.nullable(),                   // linked once they accept
  role: z.enum(["member", "manager"]).default("member"),
  status: z.enum(["invited", "active", "revoked"]).default("invited"),
}).merge(zTimestamps)
export type TeamMember = z.infer<typeof TeamMemberSchema>

export const BulkOrderSchema = z.object({
  id: zId,
  customer_id: zId,
  product_id: zId,
  variant_id: zId.nullable(),
  po_number: z.string().nullable(),
  upload_file_url: z.string().url().nullable(),
  status: z.enum(["draft", "uploaded", "validated", "confirmed", "cancelled"]).default("draft"),
  total_items: z.number().int().nonnegative().default(0),
}).merge(zTimestamps)
export type BulkOrder = z.infer<typeof BulkOrderSchema>

export const BulkOrderLineSchema = z.object({
  id: zId,
  bulk_order_id: zId,
  row_number: z.number().int().positive(),
  name: z.string().min(1),
  designation: z.string().nullable(),
  award_category: z.string().nullable(),
  design_id: zId.nullable(),                     // set after generation
  order_id: zId.nullable(),                      // set after checkout
  validation_errors: z.array(z.object({
    field: z.string(), issue: z.string(),
  })).default([]),
})
export type BulkOrderLine = z.infer<typeof BulkOrderLineSchema>
```

---

## 6.7 2D design-state JSON schema (Fabric.js-compatible)

A serialized 2D design. Keep it Fabric-round-trippable but wrap it with our metadata so the server can validate and re-render without loading Fabric.

```ts
export const Text2DObject = z.object({
  type: z.literal("text"),
  id: zId,
  text: z.string(),
  fontFamily: z.string(),
  fontSize: z.number().positive(),
  fill: z.string(),                              // hex/oklch
  fontWeight: z.enum(["normal", "bold"]).default("normal"),
  fontStyle: z.enum(["normal", "italic"]).default("normal"),
  underline: z.boolean().default(false),
  textAlign: z.enum(["left", "center", "right"]).default("center"),
  charSpacing: z.number().default(0),
  lineHeight: z.number().default(1.16),
  curve: z.object({ enabled: z.boolean(), radius: z.number() }).optional(),
  shadow: z.string().nullable().optional(),
  stroke: z.object({ color: z.string(), width: z.number() }).nullable().optional(),
  left: z.number(), top: z.number(), angle: z.number().default(0),
  scaleX: z.number().default(1), scaleY: z.number().default(1),
  locked: z.boolean().default(false), visible: z.boolean().default(true),
})

export const Image2DObject = z.object({
  type: z.literal("image"),
  id: zId,
  src: z.string().url(),                         // stored logo URL
  originalFormat: z.enum(["png", "jpg", "svg"]),
  left: z.number(), top: z.number(), angle: z.number().default(0),
  scaleX: z.number().default(1), scaleY: z.number().default(1),
  opacity: z.number().min(0).max(1).default(1),
  lockAspectRatio: z.boolean().default(true),
  locked: z.boolean().default(false), visible: z.boolean().default(true),
})

export const Design2DState = z.object({
  version: z.literal(1),
  canvas: z.object({ width: z.number(), height: z.number(), background: z.string().nullable() }),
  baseImageUrl: z.string().url().nullable(),     // trophy base preview
  materialOverlay: z.enum([
    "gold","silver","bronze","rose_gold","matte_black","acrylic",
  ]).nullable(),
  engravingSafeArea: z.object({ x: z.number(), y: z.number(), width: z.number(), height: z.number() }),
  objects: z.array(z.discriminatedUnion("type", [Text2DObject, Image2DObject])),
})
export type Design2DState = z.infer<typeof Design2DState>
```

## 6.8 3D design-state JSON schema (Three.js scene-graph subset)

Captures user choices, not the full mesh (models live in S3). The viewer reconstructs the scene from this.

```ts
export const Design3DState = z.object({
  version: z.literal(1),
  baseModelId: z.string(),                       // maps to /3d-models/{...}/model.glb
  lod: z.enum(["auto", "high", "low"]).default("auto"),
  material: z.enum([
    "polished_gold","brushed_silver","antique_bronze","matte_black",
    "clear_crystal","white_acrylic","rose_gold",
  ]),
  environment: z.enum(["studio", "none"]).default("studio"),
  engraving: z.object({
    text: z.string(),
    fontFamily: z.string(),
    method: z.enum(["texture", "extrusion"]).default("texture"),
    surfaceAnchor: z.string(),                   // named UV region / mesh part
  }).nullable(),
  logo: z.object({
    src: z.string().url(),
    surfaceAnchor: z.string(),
    scale: z.number().default(1),
    rotation: z.number().default(0),
  }).nullable(),
  camera: z.object({
    position: z.tuple([z.number(), z.number(), z.number()]),
    target: z.tuple([z.number(), z.number(), z.number()]),
  }).optional(),
  lighting: z.object({
    ambient: z.number().default(0.6),
    directional: z.number().default(1.0),
  }).optional(),
})
export type Design3DState = z.infer<typeof Design3DState>
```

**2D↔3D sync mapping (shared fields):** `text/engraving`, `logo.src`, and `material` map across modes. Switching modes copies these; mode-specific fields (canvas geometry vs camera/lighting) are preserved per-mode within `state_json` under a `{ "2d": Design2DState, "3d": Design3DState }` envelope when a design has been edited in both.

---

## 6.9 Migrations

- **Engine:** Medusa core migrations + MikroORM migrations per custom module. Generate with the Medusa CLI; review before applying.
- **Rules:** never edit a shipped migration — add a forward migration. Every production migration is preceded by a backup and tested on staging (see [10 runbooks](./10-documentation-requirements.md)).
- **Illustrative migration (Knex-style) for `design`:**

```ts
export async function up(knex) {
  await knex.schema.createTable("design", (t) => {
    t.uuid("id").primary()                                  // uuidv7()
    t.uuid("customer_id").nullable().index()
    t.string("name", 120).notNullable()
    t.enu("mode", ["2d", "3d"]).notNullable()
    t.uuid("product_id").notNullable()
    t.uuid("variant_id").nullable()
    t.jsonb("state_json").notNullable()
    t.string("preview_url").nullable()
    t.string("status").notNullable().defaultTo("draft")
    t.boolean("is_template").notNullable().defaultTo(false)
    t.string("share_token").nullable().index()
    t.string("complexity").nullable()
    t.timestamps(true, true)
  })
}
export async function down(knex) { await knex.schema.dropTable("design") }
```

**Recommended indexes** (also see [03 §3.4](./03-technical-architecture.md#34-database-architecture)): `design(customer_id)`, `design(share_token)`, unique `design_revision(design_id, revision_number)`, partial `production_job(status) WHERE status IN ('queued','in_production','quality_check')`, `design_approval(design_id, status)`, `bulk_order_line(bulk_order_id)`, `corporate_profile(customer_id)`.
