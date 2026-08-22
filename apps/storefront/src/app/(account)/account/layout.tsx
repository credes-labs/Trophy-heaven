import { AccountShell } from "@/components/features/account/account-shell"

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <AccountShell>{children}</AccountShell>
}
