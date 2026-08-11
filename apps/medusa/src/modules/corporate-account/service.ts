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
}

export default CorporateService
