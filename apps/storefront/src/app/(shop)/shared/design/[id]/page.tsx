import type { Metadata } from "next"
import Link from "next/link"
import { SimplePageHero } from "@/components/layout/editorial/simple-page-hero"
import { EditorialFrame, EditorialShell } from "@/components/layout/editorial/editorial-shell"
import { BACKEND_URL, PUBLISHABLE_KEY } from "@/lib/medusa"

export const metadata: Metadata = {
  title: "Shared Design",
  description: "A Trophy Heaven trophy design shared for review.",
  robots: { index: false, follow: false },
}

type SharedDesign = {
  id: string
  name?: string | null
  status?: string | null
  product_id?: string | null
}

async function fetchSharedDesign(id: string, token: string | undefined): Promise<SharedDesign | null> {
  if (!token) return null
  try {
    const res = await fetch(`${BACKEND_URL}/store/designs/${encodeURIComponent(id)}?share_token=${encodeURIComponent(token)}`, {
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": PUBLISHABLE_KEY,
      },
      cache: "no-store",
    })
    if (!res.ok) return null
    const body = (await res.json()) as { design?: SharedDesign } | SharedDesign
    if ("design" in body && body.design) return body.design
    return body as SharedDesign
  } catch {
    return null
  }
}

export default async function SharedDesignPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ share_token?: string }>
}) {
  const { id } = await params
  const { share_token: token } = await searchParams
  const design = await fetchSharedDesign(id, token)

  return (
    <EditorialShell>
      <SimplePageHero
        eyebrow="Shared design"
        watermark="shared"
        title={design?.name || "A design shared with you."}
        body={
          design
            ? "Review the render. Leave feedback with the owner, or approve it for production."
            : "This share link is invalid, expired, or missing a token. Ask the owner to send it again."
        }
      />
      <EditorialFrame>
        {design ? (
          <div className="border border-[#131111]/10 p-[1.5em] max-w-[36em]">
            <p className="m-0 font-outfit text-[0.875em] uppercase tracking-wide text-[#6B635C]">
              Status · {design.status ?? "shared"}
            </p>
            <p className="mt-[1em] m-0 font-outfit text-[1em] leading-[1.5] text-[#131111]/75">
              Design ID <span className="font-mono text-[0.9em]">{design.id}</span>
            </p>
            {design.product_id ? (
              <Link
                href={`/customize/${design.product_id}/2d`}
                className="mt-[1.5em] inline-block font-outfit text-[0.875em] uppercase underline text-[#131111]"
              >
                Open related product studio
              </Link>
            ) : (
              <Link
                href="/customize"
                className="mt-[1.5em] inline-block font-outfit text-[0.875em] uppercase underline text-[#131111]"
              >
                Visit the design studio
              </Link>
            )}
          </div>
        ) : (
          <Link href="/contact" className="font-outfit text-[1em] uppercase underline text-[#131111]">
            Contact support
          </Link>
        )}
      </EditorialFrame>
    </EditorialShell>
  )
}
