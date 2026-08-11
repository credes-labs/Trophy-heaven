import Link from "next/link"
import { CheckCircle2 } from "lucide-react"

type Props = { params: Promise<{ id: string }> }

export default async function OrderConfirmedPage({ params }: Props) {
  const { id } = await params
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <CheckCircle2 className="mx-auto h-14 w-14 text-success" aria-hidden />
      <h1 className="mt-4 font-serif text-3xl font-semibold">Thank you for your order!</h1>
      <p className="mt-2 text-muted-foreground">
        Your order <span className="font-mono text-foreground">{id}</span> has been placed. A
        confirmation email is on its way.
      </p>
      <p className="mt-4 text-sm text-muted-foreground">
        Custom trophy orders enter design approval and production next — you'll get status updates
        by email and SMS. Estimated production lead time is 7–14 days.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link
          href="/account/orders"
          className="rounded-md bg-accent px-6 py-3 text-sm font-medium text-accent-foreground hover:opacity-90"
        >
          View my orders
        </Link>
        <Link href="/" className="rounded-md border px-6 py-3 text-sm font-medium hover:bg-muted">
          Continue shopping
        </Link>
      </div>
    </div>
  )
}
