import { Module } from "@medusajs/framework/utils"
import WishlistService from "./service"

export const WISHLIST = "wishlist"

export default Module(WISHLIST, {
  service: WishlistService,
})
