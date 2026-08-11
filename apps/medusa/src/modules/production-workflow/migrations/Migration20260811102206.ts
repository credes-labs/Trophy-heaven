import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260811102206 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "design_approval" ("id" text not null, "design_id" text not null, "reviewer_id" text null, "status" text check ("status" in ('pending', 'approved', 'rejected', 'changes_requested')) not null default 'pending', "feedback" text null, "annotated_image_url" text null, "resolved_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "design_approval_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_design_approval_deleted_at" ON "design_approval" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "production_job" ("id" text not null, "order_id" text not null, "order_line_item_id" text not null, "design_id" text not null, "status" text check ("status" in ('pending_design_approval', 'design_approved', 'queued', 'in_production', 'quality_check', 'packed', 'completed', 'on_hold', 'cancelled')) not null default 'pending_design_approval', "complexity" text check ("complexity" in ('simple', 'medium', 'complex')) not null, "material" text not null, "assigned_workshop" text null, "estimated_completion" timestamptz null, "started_at" timestamptz null, "completed_at" timestamptz null, "tracking_number" text null, "shipping_carrier" text null, "notes" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "production_job_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_production_job_deleted_at" ON "production_job" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "design_approval" cascade;`);

    this.addSql(`drop table if exists "production_job" cascade;`);
  }

}
