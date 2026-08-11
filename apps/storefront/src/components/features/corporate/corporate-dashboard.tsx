"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  corporateApi,
  type CorporateProfileRecord,
  type TeamMemberRecord,
} from "@/lib/bulk-client"
import { formatMoney } from "@/lib/format"

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

  if (loading) return <p className="text-sm text-muted-foreground">Loading your corporate account…</p>

  if (error && !profile) {
    return (
      <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
        {error} — you may need to sign in.
      </p>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-lg space-y-4 rounded-lg border border-border p-6">
        <h2 className="font-serif text-2xl">Create your corporate account</h2>
        <div>
          <label className="mb-1 block text-sm font-medium">Company name</label>
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">GST / Tax ID</label>
          <input
            value={taxId}
            onChange={(e) => setTaxId(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button onClick={createProfile} disabled={!companyName || !taxId}>
          Create account
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-border p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl">{profile.company_name}</h2>
          <span
            className={
              profile.is_verified
                ? "rounded-full bg-success/15 px-3 py-1 text-xs text-success"
                : "rounded-full bg-warning/15 px-3 py-1 text-xs"
            }
          >
            {profile.is_verified ? "Verified" : "Pending verification"}
          </span>
        </div>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted-foreground">GST / Tax ID</dt>
            <dd>{profile.tax_id}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Payment terms</dt>
            <dd className="uppercase">{profile.payment_terms.replace("_", " ")}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Credit limit</dt>
            <dd>{formatMoney(profile.credit_limit, "inr")}</dd>
          </div>
        </dl>
        {orderCount != null && (
          <p className="mt-4 text-sm text-muted-foreground">Orders on this account: {orderCount}</p>
        )}
      </section>

      <section className="rounded-lg border border-border p-6">
        <h3 className="font-serif text-xl">Team members</h3>
        <ul className="mt-3 space-y-1 text-sm">
          {members.length === 0 && <li className="text-muted-foreground">No members yet.</li>}
          {members.map((m) => (
            <li key={m.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
              <span>{m.email}</span>
              <span className="text-xs text-muted-foreground">
                {m.role} · {m.status}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap items-end gap-2">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium">Invite by email</label>
            <input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="teammate@company.com"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as "member" | "manager")}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="member">Member</option>
            <option value="manager">Manager</option>
          </select>
          <Button onClick={addMember} disabled={!inviteEmail} size="sm">
            Invite
          </Button>
        </div>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </section>
    </div>
  )
}
