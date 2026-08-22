import { MedusaService } from "@medusajs/framework/utils"
import { CorporateProfile, TeamMember } from "./models/corporate-profile"

/**
 * CorporateService — company profiles, team seats, credit/terms, and
 * account-manager assignment (API 05.4, FR-CORP-*).
 */
class CorporateService extends MedusaService({
  CorporateProfile,
  TeamMember,
}) {
  /** Invite a team member; rejects duplicates on the same profile. */
  async inviteMember(profileId: string, email: string, role: "member" | "manager" = "member") {
    const existing = await this.listTeamMembers({
      corporate_profile_id: profileId,
      email,
    })
    if (existing.length) {
      const err = new Error("Email is already a member of this account.") as Error & { code?: string }
      err.code = "CONFLICT"
      throw err
    }
    return this.createTeamMembers({
      corporate_profile_id: profileId,
      email,
      role,
      status: "invited",
    })
  }

  /** Assign (or clear) the account manager for a profile (admin action). */
  async assignAccountManager(profileId: string, accountManagerId: string | null) {
    return this.updateCorporateProfiles({ id: profileId, account_manager_id: accountManagerId })
  }

  /** Net terms are only available on verified accounts (FR-CORP-4). */
  async eligibleForNetTerms(profileId: string): Promise<boolean> {
    const profile = await this.retrieveCorporateProfile(profileId)
    return profile.is_verified && profile.payment_terms !== "prepaid"
  }

  /**
   * Whether the profile may place an order on the requested terms.
   * Requested terms must not exceed the account's admin-configured terms.
   */
  async canUsePaymentTerms(
    profileId: string,
    requested: "prepaid" | "net_30" | "net_60"
  ): Promise<{ ok: true } | { ok: false; reason: string }> {
    if (requested === "prepaid") return { ok: true }

    const profile = await this.retrieveCorporateProfile(profileId)
    if (!profile.is_verified) {
      return { ok: false, reason: "Net terms require a verified corporate account." }
    }
    if (profile.payment_terms === "prepaid") {
      return { ok: false, reason: "This account is set to prepaid only." }
    }
    // net_30 account cannot request net_60
    if (requested === "net_60" && profile.payment_terms !== "net_60") {
      return {
        ok: false,
        reason: `Account is limited to ${profile.payment_terms.replace("_", " ").toUpperCase()}.`,
      }
    }
    return { ok: true }
  }

  /**
   * Credit-limit gate for net-terms orders (amounts in major currency units,
   * matching Medusa cart totals / dashboard display).
   */
  async assertWithinCreditLimit(
    profileId: string,
    amount: number
  ): Promise<{ ok: true } | { ok: false; reason: string }> {
    const profile = await this.retrieveCorporateProfile(profileId)
    if (profile.credit_limit <= 0) {
      return { ok: false, reason: "No credit limit has been configured for this account." }
    }
    if (amount > profile.credit_limit) {
      return {
        ok: false,
        reason: `Order total exceeds the account credit limit (${profile.credit_limit}).`,
      }
    }
    return { ok: true }
  }
}

export default CorporateService
