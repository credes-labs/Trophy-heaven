import { model } from "@medusajs/framework/utils"

/** Company account with credit limit + net terms (docs/kit/06 §6.6, API 05.4). */
export const CorporateProfile = model.define("corporate_profile", {
  id: model.id({ prefix: "corp" }).primaryKey(),
  customer_id: model.text(),
  company_name: model.text(),
  tax_id: model.text(),
  billing_address: model.json().nullable(),
  credit_limit: model.number().default(0),
  payment_terms: model.enum(["prepaid", "net_30", "net_60"]).default("prepaid"),
  account_manager_id: model.text().nullable(),
  is_verified: model.boolean().default(false),
  members: model.hasMany(() => TeamMember, { mappedBy: "corporate_profile" }),
})

/** A seat on a corporate account (docs/kit/06 §6.6). */
export const TeamMember = model.define("team_member", {
  id: model.id({ prefix: "team" }).primaryKey(),
  email: model.text(),
  customer_id: model.text().nullable(),
  role: model.enum(["member", "manager"]).default("member"),
  status: model.enum(["invited", "active", "revoked"]).default("invited"),
  invite_token: model.text().nullable(),
  corporate_profile: model.belongsTo(() => CorporateProfile, { mappedBy: "members" }),
})
