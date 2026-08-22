import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260821204100 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "UQ_blog_category_slug" ON "blog_category" ("slug") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "UQ_blog_post_slug" ON "blog_post" ("slug") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_blog_post_status_published_at" ON "blog_post" ("status", "published_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`DROP INDEX IF EXISTS "IDX_blog_post_status_published_at";`);
    this.addSql(`DROP INDEX IF EXISTS "UQ_blog_post_slug";`);
    this.addSql(`DROP INDEX IF EXISTS "UQ_blog_category_slug";`);
  }

}
