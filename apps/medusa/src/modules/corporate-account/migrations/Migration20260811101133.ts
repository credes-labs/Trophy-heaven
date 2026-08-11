import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260811101133 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "corporate_profile" ("id" text not null, "customer_id" text not null, "company_name" text not null, "tax_id" text not null, "billing_address" jsonb null, "credit_limit" integer not null default 0, "payment_terms" text check ("payment_terms" in ('prepaid', 'net_30', 'net_60')) not null default 'prepaid', "account_manager_id" text null, "is_verified" boolean not null default false, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "corporate_profile_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_corporate_profile_deleted_at" ON "corporate_profile" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "team_member" ("id" text not null, "email" text not null, "customer_id" text null, "role" text check ("role" in ('member', 'manager')) not null default 'member', "status" text check ("status" in ('invited', 'active', 'revoked')) not null default 'invited', "corporate_profile_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "team_member_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_team_member_corporate_profile_id" ON "team_member" ("corporate_profile_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_team_member_deleted_at" ON "team_member" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "team_member" add constraint "team_member_corporate_profile_id_foreign" foreign key ("corporate_profile_id") references "corporate_profile" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "team_member" drop constraint if exists "team_member_corporate_profile_id_foreign";`);

    this.addSql(`drop table if exists "corporate_profile" cascade;`);

    this.addSql(`drop table if exists "team_member" cascade;`);
  }

}
