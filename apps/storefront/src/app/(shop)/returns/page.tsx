import type { Metadata } from "next"
import Link from "next/link"
import { SimplePageHero } from "@/components/layout/editorial/simple-page-hero"
import { EditorialFrame, EditorialShell } from "@/components/layout/editorial/editorial-shell"
import { ReturnsForm } from "@/components/features/orders/returns-form"

export const metadata: Metadata = {
  title: "Start a Return",
  description: "Start a return or exchange with Legacy Crafts. See shipping-returns for policy details.",
  alternates: { canonical: "/returns" },
}

export default function ReturnsPage() {
  return (
    <EditorialShell>
      <SimplePageHero
        eyebrow="Returns"
        watermark="return"
        title="Start a return."
        body="Within the returns window, request an RMA and we will guide the rest."
      />
      <EditorialFrame>
        <p className="m-0 mb-[2em] max-w-[36em] font-outfit text-[1em] leading-[1.5] text-[#131111]/7">
          Read the full policy on{" "}
          <Link href="/shipping-returns" className="underline underline-offset-[0.15em] text-[#131111]">
            Shipping &amp; Returns
          </Link>{" "}
          before submitting.
        </p>
        <div className="mx-auto max-w-[36em]">
          <ReturnsForm />
        </div>
      </EditorialFrame>
    </EditorialShell>
  )
}
