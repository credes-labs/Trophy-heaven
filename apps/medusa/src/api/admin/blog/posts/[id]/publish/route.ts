import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BLOG } from "../../../../../../modules/blog"
import type BlogService from "../../../../../../modules/blog/service"

/** POST /admin/blog/posts/:id/publish */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<BlogService>(BLOG)
  const existing = await service.retrieveBlogPost(req.params.id).catch(() => null)
  if (!existing) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Post not found." } })
  }
  const post = await service.publish(req.params.id)
  res.json({ post })
}
