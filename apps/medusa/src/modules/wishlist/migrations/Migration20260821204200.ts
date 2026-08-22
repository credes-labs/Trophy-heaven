import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260821204200 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "UQ_wishlist_item_customer_product" ON "wishlist_item" ("customer_id", "product_id") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`DROP INDEX IF EXISTS "UQ_wishlist_item_customer_product";`);
  }

}
