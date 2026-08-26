import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260826090100 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_production_job_order_line_item_id" ON "production_job" ("order_line_item_id") WHERE deleted_at IS NULL;`
    )
  }

  override async down(): Promise<void> {
    this.addSql(`DROP INDEX IF EXISTS "UQ_production_job_order_line_item_id";`)
  }
}
