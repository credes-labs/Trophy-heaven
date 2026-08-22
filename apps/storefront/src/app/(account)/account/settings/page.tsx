"use client"

import { useEffect, useState } from "react"
import { medusa } from "@/lib/medusa"
import { useAuthStore } from "@/stores/auth-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

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
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">Profile, security, and notifications.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile</CardTitle>
          <CardDescription>How we address you on invoices and shipping labels.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void saveProfile(e)} className="grid gap-4 sm:grid-cols-2">
            <Input
              label="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
            />
            <Input
              label="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
            />
            <div className="sm:col-span-2">
              <Input label="Email" value={customer.email ?? ""} disabled />
            </div>
            <div className="sm:col-span-2">
              <Input
                label="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />
            </div>
            {profileMsg && <p className="text-sm text-success sm:col-span-2">{profileMsg}</p>}
            {profileError && (
              <p className="text-sm text-destructive sm:col-span-2">{profileError}</p>
            )}
            <div className="sm:col-span-2">
              <Button type="submit" loading={saving}>
                Save profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Password</CardTitle>
          <CardDescription>Update your sign-in password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void handlePasswordChange(e)} className="grid max-w-md gap-4">
            <Input
              label="Current password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
            <Input
              label="New password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
            />
            <Input
              label="Confirm new password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
            {passwordMsg && <p className="text-sm text-success">{passwordMsg}</p>}
            {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
            <Button type="submit" variant="outline" loading={savingPassword}>
              Update password
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notifications</CardTitle>
          <CardDescription>Preferences are stored in this browser for now.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(
            [
              ["orderUpdates", "Order updates"],
              ["promotions", "Promotions & offers"],
              ["newsletter", "Newsletter"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center justify-between gap-4 text-sm">
              <span>{label}</span>
              <button
                type="button"
                role="switch"
                aria-checked={notifs[key]}
                onClick={() => toggleNotif(key)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  notifs[key] ? "bg-gold" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-card shadow transition-transform ${
                    notifs[key] ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </label>
          ))}
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-lg text-destructive">Danger zone</CardTitle>
          <CardDescription>Account deletion is not available in the storefront yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          <Button variant="outline" disabled className="border-destructive/40 text-destructive">
            Delete account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
