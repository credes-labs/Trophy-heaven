import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260811094249 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "design" ("id" text not null, "customer_id" text null, "name" text not null, "mode" text not null, "product_id" text not null, "variant_id" text null, "state_json" jsonb not null, "preview_url" text null, "status" text check ("status" in ('draft', 'submitted_for_review', 'changes_requested', 'approved', 'rejected_with_feedback')) not null default 'draft', "is_template" boolean not null default false, "share_token" text null, "complexity" text check ("complexity" in ('simple', 'medium', 'complex')) null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "design_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_design_deleted_at" ON "design" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "design_preset" ("id" text not null, "name" text not null, "category" text not null, "occasion" text null, "mode" text not null, "base_product_id" text not null, "default_state_json" jsonb not null, "preview_url" text not null, "is_active" boolean not null default true, "sort_order" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "design_preset_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_design_preset_deleted_at" ON "design_preset" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "design_revision" ("id" text not null, "design_id" text not null, "state_json" jsonb not null, "revision_number" integer not null default 0, "created_by" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "design_revision_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_design_revision_deleted_at" ON "design_revision" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "design" cascade;`);

    this.addSql(`drop table if exists "design_preset" cascade;`);

    this.addSql(`drop table if exists "design_revision" cascade;`);
  }

}
