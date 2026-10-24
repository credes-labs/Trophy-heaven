"use client"

import { useEffect, useState } from "react"
import {
  EditorialCtaButton,
  editorialFieldClass,
  editorialLabelClass,
} from "@/components/layout/editorial/editorial-cta"
import {
  corporateApi,
  type CorporateProfileRecord,
  type TeamMemberRecord,
} from "@/lib/bulk-client"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

const fieldClass = cn(
  editorialFieldClass,
  "placeholder:text-[#6B635C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111] focus-visible:!outline-solid"
)
const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"

export function CorporateDashboard() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<CorporateProfileRecord | null>(null)
  const [members, setMembers] = useState<TeamMemberRecord[]>([])
  const [orderCount, setOrderCount] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Create-profile form
  const [companyName, setCompanyName] = useState("")
  const [taxId, setTaxId] = useState("")
  // Invite form
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"member" | "manager">("member")

  useEffect(() => {
    ;(async () => {
      try {
        const { corporate_profiles } = await corporateApi.list()
        const p = corporate_profiles[0] ?? null
        setProfile(p)
        if (p) {
          const detail = await corporateApi.get(p.id)
          setMembers(detail.team_members)
          try {
            const orders = await corporateApi.orders(p.id)
            setOrderCount(orders.count)
          } catch {
            setOrderCount(null)
          }
        }
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  async function createProfile() {
    setError(null)
    try {
      const { corporate_profile } = await corporateApi.create({
        company_name: companyName,
        tax_id: taxId,
      })
      setProfile(corporate_profile)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  async function addMember() {
    if (!profile) return
    setError(null)
    try {
      const { team_member } = await corporateApi.addMember(profile.id, inviteEmail, inviteRole)
      setMembers((m) => [...m, team_member])
      setInviteEmail("")
    } catch (e) {
      setError((e as Error).message)
    }
  }

  if (loading) {
    return <p className="m-0 font-outfit text-[1em] text-[#6B635C]">Loading your corporate account…</p>
  }

  if (error && !profile) {
    return (
      <p className="m-0 font-outfit text-[0.875em] leading-[1.4] text-[#8A2D25]" role="alert">
        {error} — you may need to sign in.
      </p>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-[32em] space-y-[1.5em]">
        <h2 className="m-0 font-outfit text-[1.75em] leading-[1.2] font-normal tracking-[-0.03em] text-balance text-[#131111]">
          Create your corporate account
        </h2>
        <div>
          <label htmlFor="corp-company" className={editorialLabelClass}>
            Company name
          </label>
          <input
            id="corp-company"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="corp-tax" className={editorialLabelClass}>
            GST / Tax ID
          </label>
          <input
            id="corp-tax"
            value={taxId}
            onChange={(e) => setTaxId(e.target.value)}
            className={fieldClass}
          />
        </div>
        {error ? (
          <p className="m-0 font-outfit text-[0.875em] text-[#8A2D25]" role="alert">
            {error}
          </p>
        ) : null}
        <EditorialCtaButton
          type="button"
          onClick={() => void createProfile()}
          disabled={!companyName || !taxId}
          className={focusRing}
        >
          Create account
        </EditorialCtaButton>
      </div>
    )
  }

  return (
    <div className="space-y-[2.5em]">
      <section className="border-y border-[#CDCDCD] py-[1.5em]">
        <div className="flex flex-wrap items-baseline justify-between gap-[1em]">
          <h2 className="m-0 font-outfit text-[1.75em] leading-[1.2] font-normal tracking-[-0.03em] text-balance text-[#131111]">
            {profile.company_name}
          </h2>
          <p className="m-0 font-outfit text-[0.75em] tracking-[-0.02em] text-[#6B635C] uppercase">
            {profile.is_verified ? "Verified" : "Pending verification"}
          </p>
        </div>
        <dl className="mt-[1.25em] grid gap-[1.25em] font-outfit text-[1em] tracking-[-0.02em] sm:grid-cols-3">
          <div>
            <dt className="text-[0.75em] tracking-[-0.02em] text-[#6B635C] uppercase">GST / Tax ID</dt>
            <dd className="mt-[0.25em] m-0">{profile.tax_id}</dd>
          </div>
          <div>
            <dt className="text-[0.75em] tracking-[-0.02em] text-[#6B635C] uppercase">Payment terms</dt>
            <dd className="mt-[0.25em] m-0 uppercase">{profile.payment_terms.replace("_", " ")}</dd>
          </div>
          <div>
            <dt className="text-[0.75em] tracking-[-0.02em] text-[#6B635C] uppercase">Credit limit</dt>
            <dd className="mt-[0.25em] m-0 tabular-nums">{formatMoney(profile.credit_limit, "inr")}</dd>
          </div>
        </dl>
        {orderCount != null ? (
          <p className="mt-[1.25em] m-0 font-outfit text-[0.875em] tracking-[-0.02em] text-[#6B635C]">
            Orders on this account: <span className="tabular-nums text-[#131111]">{orderCount}</span>
          </p>
        ) : null}
      </section>

      <section>
        <h3 className="m-0 font-outfit text-[1.5em] leading-[1.25] font-light tracking-[-0.02em] text-balance text-[#131111]">
          Team members
        </h3>
        <ul className="mt-[1em] m-0 list-none p-0 font-outfit text-[1em] tracking-[-0.02em]">
          {members.length === 0 ? <li className="text-[#6B635C]">No members yet.</li> : null}
          {members.map((m) => (
            <li
              key={m.id}
              className="flex flex-wrap items-baseline justify-between gap-[0.75em] border-b border-[#CDCDCD] py-[0.85em]"
            >
              <span>{m.email}</span>
              <span className="font-outfit text-[0.75em] tracking-[-0.02em] text-[#6B635C] uppercase">
                {m.role} · {m.status}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-[1.5em] flex flex-wrap items-end gap-[1em]">
          <div className="min-w-[16em] flex-1">
            <label htmlFor="corp-invite" className={editorialLabelClass}>
              Invite by email
            </label>
            <input
              id="corp-invite"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="teammate@company.com"
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="corp-role" className={editorialLabelClass}>
              Role
            </label>
            <select
              id="corp-role"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as "member" | "manager")}
              className={fieldClass}
            >
              <option value="member">Member</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          <EditorialCtaButton
            type="button"
            onClick={() => void addMember()}
            disabled={!inviteEmail}
            className={focusRing}
          >
            Invite
          </EditorialCtaButton>
        </div>
        {error ? (
          <p className="mt-[1em] m-0 font-outfit text-[0.875em] text-[#8A2D25]" role="alert">
            {error}
          </p>
        ) : null}
      </section>
    </div>
  )
}
