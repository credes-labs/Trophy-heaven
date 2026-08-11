import { z } from "zod"
import { zId, zTimestamps } from "./shared.js"

/** Company account with credit limits + net terms (see docs/kit/06 §6.6). */
export const CorporateProfileSchema = z
  .object({
    id: zId,
    customer_id: zId,
    company_name: z.string().min(1),
    tax_id: z.string().min(1), // GST/Tax ID
    credit_limit: z.number().nonnegative().default(0),
    payment_terms: z.enum(["prepaid", "net_30", "net_60"]).default("prepaid"),
    account_manager_id: zId.nullable(),
    is_verified: z.boolean().default(false),
  })
  .merge(zTimestamps)
export type CorporateProfile = z.infer<typeof CorporateProfileSchema>

/** A seat on a corporate account (see docs/kit/06 §6.6). */
export const TeamMemberSchema = z
  .object({
    id: zId,
    corporate_profile_id: zId,
    email: z.string().email(),
    customer_id: zId.nullable(), // linked once they accept
    role: z.enum(["member", "manager"]).default("member"),
    status: z.enum(["invited", "active", "revoked"]).default("invited"),
  })
  .merge(zTimestamps)
export type TeamMember = z.infer<typeof TeamMemberSchema>
