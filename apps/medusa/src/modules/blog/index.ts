import { Module } from "@medusajs/framework/utils"
import BlogService from "./service"

export const BLOG = "blog"

export default Module(BLOG, {
  service: BlogService,
})
