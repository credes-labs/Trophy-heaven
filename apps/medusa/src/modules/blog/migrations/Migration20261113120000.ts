import { Migration } from "@medusajs/framework/mikro-orm/migrations";

/** Trophy Heaven rebrand: new posts default to the new house byline. */
export class Migration20261113120000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "blog_post" alter column "author_name" set default 'Trophy Heaven';`);
    this.addSql(`update "blog_post" set "author_name" = 'Trophy Heaven' where "author_name" = 'Legacy Crafts';`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "blog_post" alter column "author_name" set default 'Legacy Crafts';`);
  }

}
