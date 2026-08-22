import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BLOG } from "../../../../../modules/blog"
import type BlogService from "../../../../../modules/blog/service"

/** GET /store/blog/posts/:slug — single published post. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<BlogService>(BLOG)
  const post = await service.getBySlug(req.params.slug)
  if (!post) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Post not found." } })
  }

  await service.updateBlogPosts({
    id: post.id,
    view_count: (post.view_count ?? 0) + 1,
  })

  res.json({ post: { ...post, view_count: (post.view_count ?? 0) + 1 } })
}
