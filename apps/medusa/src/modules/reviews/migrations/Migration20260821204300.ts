import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260821204300 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_review_product_id_status" ON "product_review" ("product_id", "status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_review_rating" ON "product_review" ("rating") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`DROP INDEX IF EXISTS "IDX_product_review_rating";`);
    this.addSql(`DROP INDEX IF EXISTS "IDX_product_review_product_id_status";`);
  }

}
