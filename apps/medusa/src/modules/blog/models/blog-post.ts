import { model } from "@medusajs/framework/utils"

export const BlogCategory = model.define("blog_category", {
  id: model.id({ prefix: "blogcat" }).primaryKey(),
  name: model.text(),
  slug: model.text(),
  description: model.text().nullable(),
  posts: model.hasMany(() => BlogPost, { mappedBy: "category" }),
})

export const BlogPost = model.define("blog_post", {
  id: model.id({ prefix: "post" }).primaryKey(),
  title: model.text(),
  slug: model.text(),
  excerpt: model.text().nullable(),
  content_md: model.text(),
  cover_image_url: model.text().nullable(),
  author_name: model.text().default("Trophy Heaven"),
  author_avatar_url: model.text().nullable(),
  tags: model.json().default([] as unknown as Record<string, unknown>),
  status: model.enum(["draft", "published", "archived"]).default("draft"),
  published_at: model.dateTime().nullable(),
  seo_title: model.text().nullable(),
  seo_description: model.text().nullable(),
  read_time_minutes: model.number().default(5),
  view_count: model.number().default(0),
  category: model.belongsTo(() => BlogCategory, { mappedBy: "posts" }).nullable(),
})
