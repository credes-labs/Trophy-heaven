import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260826090200 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `ALTER TABLE "team_member" ADD COLUMN IF NOT EXISTS "invite_token" text null;`
    )
  }

  override async down(): Promise<void> {
    this.addSql(`ALTER TABLE "team_member" DROP COLUMN IF EXISTS "invite_token";`)
  }
}
