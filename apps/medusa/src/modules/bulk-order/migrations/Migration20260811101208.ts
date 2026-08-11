import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260811101208 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "bulk_order_line" alter column "validation_errors" drop default;`);
    this.addSql(`alter table if exists "bulk_order_line" alter column "validation_errors" type jsonb using ("validation_errors"::jsonb);`);
    this.addSql(`alter table if exists "bulk_order_line" alter column "validation_errors" drop not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "bulk_order_line" alter column "validation_errors" type jsonb using ("validation_errors"::jsonb);`);
    this.addSql(`alter table if exists "bulk_order_line" alter column "validation_errors" set default '[]';`);
    this.addSql(`alter table if exists "bulk_order_line" alter column "validation_errors" set not null;`);
  }

}
