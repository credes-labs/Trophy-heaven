import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BLOG } from "../../../../modules/blog"
import type BlogService from "../../../../modules/blog/service"

/** GET /store/blog/categories — list blog categories. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<BlogService>(BLOG)
  const categories = await service.listCategories()
  res.json({ categories })
}
