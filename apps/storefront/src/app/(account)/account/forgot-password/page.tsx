import { redirect } from "next/navigation"

/** Sign-in is passwordless (one-time codes), so password recovery routes go to sign-in. */
export default function Page() {
  redirect("/account/login")
}
