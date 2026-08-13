import { Migration } from "@medusajs/framework/mikro-orm/migrations"

/**
 * Creates the bulk_order / bulk_order_line tables. The prior migration only
 * altered validation_errors and was a no-op when the tables did not yet exist
 * (create migration was lost during model iteration).
 */
export class Migration20260813161200 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`create table if not exists "bulk_order" ("id" text not null, "customer_id" text not null, "corporate_profile_id" text null, "product_id" text not null, "variant_id" text null, "po_number" text null, "upload_file_url" text null, "status" text check ("status" in ('draft', 'uploaded', 'validated', 'confirmed', 'cancelled')) not null default 'draft', "total_items" integer not null default 0, "cart_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "bulk_order_pkey" primary key ("id"));`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bulk_order_deleted_at" ON "bulk_order" ("deleted_at") WHERE deleted_at IS NULL;`)

    this.addSql(`create table if not exists "bulk_order_line" ("id" text not null, "row_number" integer not null, "name" text not null, "designation" text null, "award_category" text null, "design_id" text null, "order_id" text null, "preview_url" text null, "validation_errors" jsonb null, "bulk_order_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "bulk_order_line_pkey" primary key ("id"));`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bulk_order_line_bulk_order_id" ON "bulk_order_line" ("bulk_order_id") WHERE deleted_at IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bulk_order_line_deleted_at" ON "bulk_order_line" ("deleted_at") WHERE deleted_at IS NULL;`)

    this.addSql(`alter table if exists "bulk_order_line" add constraint "bulk_order_line_bulk_order_id_foreign" foreign key ("bulk_order_id") references "bulk_order" ("id") on update cascade;`)
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "bulk_order_line" drop constraint if exists "bulk_order_line_bulk_order_id_foreign";`)
    this.addSql(`drop table if exists "bulk_order_line" cascade;`)
    this.addSql(`drop table if exists "bulk_order" cascade;`)
  }
}
