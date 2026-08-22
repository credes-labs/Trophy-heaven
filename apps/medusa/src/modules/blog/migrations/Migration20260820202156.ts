import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260820202156 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "blog_post" drop constraint if exists "blog_post_category_id_foreign";`);

    this.addSql(`alter table if exists "blog_post" alter column "category_id" type text using ("category_id"::text);`);
    this.addSql(`alter table if exists "blog_post" alter column "category_id" drop not null;`);
    this.addSql(`alter table if exists "blog_post" add constraint "blog_post_category_id_foreign" foreign key ("category_id") references "blog_category" ("id") on update cascade on delete set null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "blog_post" drop constraint if exists "blog_post_category_id_foreign";`);

    this.addSql(`alter table if exists "blog_post" alter column "category_id" type text using ("category_id"::text);`);
    this.addSql(`alter table if exists "blog_post" alter column "category_id" set not null;`);
    this.addSql(`alter table if exists "blog_post" add constraint "blog_post_category_id_foreign" foreign key ("category_id") references "blog_category" ("id") on update cascade;`);
  }

}
