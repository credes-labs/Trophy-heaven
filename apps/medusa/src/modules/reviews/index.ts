import { Module } from "@medusajs/framework/utils"
import ReviewsService from "./service"

export const REVIEWS = "reviews"

export default Module(REVIEWS, {
  service: ReviewsService,
})
