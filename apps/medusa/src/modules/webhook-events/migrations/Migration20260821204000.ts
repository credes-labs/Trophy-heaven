import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260821204000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "webhook_event" ("id" text not null, "provider" text not null, "event_id" text not null, "processed_at" timestamptz not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "webhook_event_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "UQ_webhook_event_provider_event_id" ON "webhook_event" ("provider", "event_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_webhook_event_deleted_at" ON "webhook_event" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "webhook_event" cascade;`);
  }

}
