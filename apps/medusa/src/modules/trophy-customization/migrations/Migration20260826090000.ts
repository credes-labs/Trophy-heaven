import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260826090000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `ALTER TABLE "design" ADD COLUMN IF NOT EXISTS "owner_token" text null;`
    )
  }

  override async down(): Promise<void> {
    this.addSql(`ALTER TABLE "design" DROP COLUMN IF EXISTS "owner_token";`)
  }
}
