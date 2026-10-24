"use client"

import { useEffect, useState } from "react"
import { medusa } from "@/lib/medusa"
import { useAuthStore } from "@/stores/auth-store"
import {
  EditorialCtaButton,
  editorialFieldClass,
  editorialLabelClass,
} from "@/components/layout/editorial/editorial-cta"
import { EditorialEyebrow } from "@/components/layout/editorial/editorial-eyebrow"
import { EditorialWatermark } from "@/components/layout/editorial/editorial-watermark"
import { PasswordField } from "@/components/ui/password-field"
import { cn } from "@/lib/utils"

const fieldClass = cn(
  editorialFieldClass,
  "placeholder:text-[#6B635C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111] focus-visible:!outline-solid"
)
const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"

type NotifPrefs = {
  orderUpdates: boolean
  promotions: boolean
  newsletter: boolean
}

const NOTIF_KEY = "lc-notif-prefs"

function loadNotifs(): NotifPrefs {
  if (typeof window === "undefined") {
    return { orderUpdates: true, promotions: false, newsletter: false }
  }
  try {
    const raw = localStorage.getItem(NOTIF_KEY)
    if (raw) return { ...{ orderUpdates: true, promotions: false, newsletter: false }, ...JSON.parse(raw) }
  } catch {
    // ignore
  }
  return { orderUpdates: true, promotions: false, newsletter: false }
}

export default function SettingsPage() {
  const { customer, loadCustomer } = useAuthStore()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [saving, setSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [savingPassword, setSavingPassword] = useState(false)

  const [notifs, setNotifs] = useState<NotifPrefs>({
    orderUpdates: true,
    promotions: false,
    newsletter: false,
  })

  useEffect(() => {
    if (!customer) return
    setFirstName(customer.first_name ?? "")
    setLastName(customer.last_name ?? "")
    setPhone(customer.phone ?? "")
  }, [customer])

  useEffect(() => {
    setNotifs(loadNotifs())
  }, [])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setProfileMsg(null)
    setProfileError(null)
    try {
      await medusa.store.customer.update({
        first_name: firstName || undefined,
        last_name: lastName || undefined,
        phone: phone || undefined,
      })
      await loadCustomer()
      setProfileMsg("Profile updated.")
    } catch (err) {
      setProfileError((err as Error).message || "Could not update profile")
    } finally {
      setSaving(false)
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setPasswordMsg(null)
    setPasswordError(null)
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.")
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.")
      return
    }
    if (!customer?.email) return
    setSavingPassword(true)
    try {
      // Verify the current password before allowing the change.
      await medusa.auth.login("customer", "emailpass", {
        email: customer.email,
        password: currentPassword,
      })
      const token = await medusa.client.getToken()
      if (!token) throw new Error("Session expired. Please sign in again.")
      await medusa.auth.updateProvider(
        "customer",
        "emailpass",
        { email: customer.email, password: newPassword },
        token
      )
      setPasswordMsg("Password updated.")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch {
      setPasswordError("Current password is incorrect, or the update failed.")
    } finally {
      setSavingPassword(false)
    }
  }

  function toggleNotif(key: keyof NotifPrefs) {
    setNotifs((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      try {
        localStorage.setItem(NOTIF_KEY, JSON.stringify(next))
      } catch {
        // ignore
      }
      return next
    })
  }

  if (!customer) return null

  return (
    <div>
      <header className="relative overflow-hidden">
        <EditorialWatermark>settings</EditorialWatermark>
        <EditorialEyebrow>Account</EditorialEyebrow>
        <h1 className="relative m-0 mt-[1em] font-outfit text-[clamp(2.25rem,4vw,3em)] leading-[1.1] font-normal tracking-[-0.04em] text-balance text-[#131111]">
          Settings
        </h1>
        <p className="relative mt-[1em] m-0 max-w-[28em] font-outfit text-[1.125em] leading-[1.4] tracking-[-0.02em] text-[#131111]/70">
          Profile, security, and notifications.
        </p>
      </header>

      <section className="mt-[2.5em] max-w-[36em] border-t border-[#CDCDCD] pt-[2em]">
        <h2 className="m-0 font-outfit text-[1.5em] leading-[1.25] font-light tracking-[-0.02em] text-balance text-[#131111]">
          Profile
        </h2>
        <p className="mt-[0.5em] m-0 font-outfit text-[1em] leading-[1.4] tracking-[-0.02em] text-[#6B635C]">
          How we address you on invoices and shipping labels.
        </p>
        <form onSubmit={(e) => void saveProfile(e)} className="mt-[1.5em] grid gap-[1.5em] sm:grid-cols-2">
          <div>
            <label htmlFor="settings-first" className={editorialLabelClass}>
              First name
            </label>
            <input
              id="settings-first"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="settings-last" className={editorialLabelClass}>
              Last name
            </label>
            <input
              id="settings-last"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
              className={fieldClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="settings-email" className={editorialLabelClass}>
              Email
            </label>
            <input id="settings-email" value={customer.email ?? ""} disabled className={fieldClass} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="settings-phone" className={editorialLabelClass}>
              Phone
            </label>
            <input
              id="settings-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              className={fieldClass}
            />
          </div>
          {profileMsg ? (
            <p className="m-0 font-outfit text-[0.875em] text-[#131111] sm:col-span-2" role="status">
              {profileMsg}
            </p>
          ) : null}
          {profileError ? (
            <p className="m-0 font-outfit text-[0.875em] text-[#8A2D25] sm:col-span-2" role="alert">
              {profileError}
            </p>
          ) : null}
          <div className="sm:col-span-2">
            <EditorialCtaButton type="submit" disabled={saving} className={focusRing}>
              {saving ? "Saving" : "Save profile"}
            </EditorialCtaButton>
          </div>
        </form>
      </section>

      <section className="mt-[2.5em] max-w-[28em] border-t border-[#CDCDCD] pt-[2em]">
        <h2 className="m-0 font-outfit text-[1.5em] leading-[1.25] font-light tracking-[-0.02em] text-balance text-[#131111]">
          Password
        </h2>
        <p className="mt-[0.5em] m-0 font-outfit text-[1em] leading-[1.4] tracking-[-0.02em] text-[#6B635C]">
          Update your sign-in password.
        </p>
        <form onSubmit={(e) => void handlePasswordChange(e)} className="mt-[1.5em] grid gap-[1.5em]">
          <div>
            <label htmlFor="settings-current" className={editorialLabelClass}>
              Current password
            </label>
            <PasswordField
              id="settings-current"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="settings-new" className={editorialLabelClass}>
              New password
            </label>
            <PasswordField
              id="settings-new"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="settings-confirm" className={editorialLabelClass}>
              Confirm new password
            </label>
            <PasswordField
              id="settings-confirm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className={fieldClass}
            />
          </div>
          {passwordMsg ? (
            <p className="m-0 font-outfit text-[0.875em] text-[#131111]" role="status">
              {passwordMsg}
            </p>
          ) : null}
          {passwordError ? (
            <p className="m-0 font-outfit text-[0.875em] text-[#8A2D25]" role="alert">
              {passwordError}
            </p>
          ) : null}
          <EditorialCtaButton type="submit" disabled={savingPassword} className={focusRing}>
            {savingPassword ? "Updating" : "Update password"}
          </EditorialCtaButton>
        </form>
      </section>

      <section className="mt-[2.5em] max-w-[28em] border-t border-[#CDCDCD] pt-[2em]">
        <h2 className="m-0 font-outfit text-[1.5em] leading-[1.25] font-light tracking-[-0.02em] text-balance text-[#131111]">
          Notifications
        </h2>
        <p className="mt-[0.5em] m-0 font-outfit text-[1em] leading-[1.4] tracking-[-0.02em] text-[#6B635C]">
          Preferences are stored in this browser for now.
        </p>
        <div className="mt-[1.25em] space-y-[1em]">
          {(
            [
              ["orderUpdates", "Order updates"],
              ["promotions", "Promotions & offers"],
              ["newsletter", "Newsletter"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between gap-[1em]">
              <span className="font-outfit text-[1em] tracking-[-0.02em] text-[#131111]">{label}</span>
              <button
                type="button"
                role="switch"
                aria-checked={notifs[key]}
                aria-label={label}
                onClick={() => toggleNotif(key)}
                className={`relative h-6 w-11 cursor-pointer rounded-full border-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111] ${
                  notifs[key] ? "bg-[#131111]" : "bg-[#E4DDD2]"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-[#F2F1EF] transition-transform ${
                    notifs[key] ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-[2.5em] max-w-[28em] border-t border-[#CDCDCD] pt-[2em]">
        <h2 className="m-0 font-outfit text-[1.5em] leading-[1.25] font-light tracking-[-0.02em] text-balance text-[#8A2D25]">
          Danger zone
        </h2>
        <p className="mt-[0.5em] m-0 font-outfit text-[1em] leading-[1.4] tracking-[-0.02em] text-[#6B635C]">
          Account deletion is not available in the storefront yet.
        </p>
        <button
          type="button"
          disabled
          className="mt-[1.25em] cursor-not-allowed border-0 bg-transparent p-0 font-outfit text-[0.875em] tracking-[-0.02em] text-[#8A2D25] uppercase underline underline-offset-[0.15em] opacity-50"
        >
          Delete account
        </button>
      </section>
    </div>
  )
}
