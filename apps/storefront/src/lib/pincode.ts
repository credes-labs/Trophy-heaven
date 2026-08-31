export type PincodePlace = {
  city: string
  state: string
}

export function isValidIndianPincode(value: string): boolean {
  return /^\d{6}$/.test(value.trim())
}

export function parsePostalPincodeResponse(data: unknown): PincodePlace | null {
  if (!Array.isArray(data) || data.length === 0) return null
  const row = data[0] as { Status?: string; PostOffice?: unknown }
  if (row.Status !== "Success" || !Array.isArray(row.PostOffice) || row.PostOffice.length === 0) {
    return null
  }
  const office = row.PostOffice[0] as { District?: string; State?: string; Name?: string }
  const city = (office.District || office.Name || "").trim()
  const state = (office.State || "").trim()
  if (!city || !state) return null
  return { city, state }
}

export async function lookupIndianPincode(pin: string): Promise<PincodePlace | null> {
  if (!isValidIndianPincode(pin)) return null
  try {
    const res = await fetch(`/api/pincode/${encodeURIComponent(pin.trim())}`)
    if (!res.ok) return null
    const data: unknown = await res.json()
    return parsePostalPincodeResponse(data)
  } catch {
    return null
  }
}
