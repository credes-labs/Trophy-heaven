import { isValidIndianPincode } from "@/lib/pincode"

/**
 * Proxies India Post PIN lookup so the checkout form can fill city/state
 * without hitting CORS on api.postalpincode.in from the browser.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ pin: string }> }
) {
  const { pin } = await params
  if (!isValidIndianPincode(pin)) {
    return Response.json([{ Status: "Error", PostOffice: null }], { status: 400 })
  }
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 86_400 },
    })
    const data: unknown = await res.json()
    return Response.json(data, { status: res.ok ? 200 : res.status })
  } catch {
    return Response.json([{ Status: "Error", PostOffice: null }], { status: 502 })
  }
}
