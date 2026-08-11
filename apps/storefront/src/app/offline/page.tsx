export const metadata = { title: "Offline", robots: { index: false } }

export default function OfflinePage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <h1 className="font-serif text-3xl">You&apos;re offline</h1>
      <p className="mt-3 text-muted-foreground">
        Your cart is saved on this device. Reconnect to browse the catalog and check out.
      </p>
    </div>
  )
}
