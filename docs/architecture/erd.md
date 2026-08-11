# Entity-Relationship Diagram

Custom Legacy Crafts entities layered on top of Medusa's core commerce models
(Product, Variant, Cart, Order, Customer, Payment). Core Medusa entities are
shown only where custom entities reference them (by id, no FK across modules —
Medusa module isolation).

```mermaid
erDiagram
  DESIGN ||--o{ DESIGN_REVISION : "snapshots"
  DESIGN_PRESET ||--o{ DESIGN : "cloned into"
  DESIGN ||--o| DESIGN_APPROVAL : "reviewed by"
  DESIGN ||--o{ PRODUCTION_JOB : "produced as"
  ORDER ||--o{ PRODUCTION_JOB : "creates"
  BULK_ORDER ||--o{ BULK_ORDER_LINE : "contains"
  BULK_ORDER_LINE ||--o| DESIGN : "generates"
  CORPORATE_PROFILE ||--o{ TEAM_MEMBER : "has"
  CUSTOMER ||--o{ DESIGN : "owns"
  CUSTOMER ||--o| CORPORATE_PROFILE : "operates"

  DESIGN {
    string id PK
    string customer_id "nullable (guest)"
    string name
    string mode "2d | 3d"
    string product_id
    string variant_id
    json state_json
    string preview_url
    string status
    boolean is_template
    string share_token
    string complexity
  }
  DESIGN_PRESET {
    string id PK
    string name
    string category
    string mode
    string base_product_id
    json default_state_json
  }
  DESIGN_REVISION {
    string id PK
    string design_id FK
    int revision_number
    json state_json
    string created_by
  }
  DESIGN_APPROVAL {
    string id PK
    string design_id FK
    string reviewer_id
    string status
    string feedback
    string annotated_image_url
    datetime resolved_at
  }
  PRODUCTION_JOB {
    string id PK
    string order_id
    string order_line_item_id
    string design_id
    string status
    string complexity
    string material
    string assigned_workshop
    datetime estimated_completion
    string tracking_number
    string shipping_carrier
    json notes
  }
  BULK_ORDER {
    string id PK
    string customer_id
    string corporate_profile_id
    string product_id
    string variant_id
    string po_number
    string status
    int total_items
    string cart_id
  }
  BULK_ORDER_LINE {
    string id PK
    string bulk_order_id FK
    int row_number
    string name
    string designation
    string award_category
    string design_id
    string preview_url
    json validation_errors
  }
  CORPORATE_PROFILE {
    string id PK
    string customer_id
    string company_name
    string tax_id
    json billing_address
    number credit_limit
    string payment_terms
    string account_manager_id
    boolean is_verified
  }
  TEAM_MEMBER {
    string id PK
    string corporate_profile_id FK
    string email
    string customer_id
    string role
    string status
  }
```

## Custom events (Redis event bus)

`design.submitted`, `design.approved`, `design.rejected`, `production.started`,
`production.completed`, `production.status_changed`, `bulkorder.parsed`,
`corporate.credit_exceeded`. Subscribers handle notifications, production-job
creation, and status sync (see `apps/medusa/src/subscribers`).
