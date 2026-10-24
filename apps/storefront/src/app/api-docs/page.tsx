import type { Metadata } from "next"
import Script from "next/script"
import { EditorialEyebrow } from "@/components/layout/editorial/editorial-eyebrow"
import { EditorialFrame, EditorialShell } from "@/components/layout/editorial/editorial-shell"
import { EditorialWatermark } from "@/components/layout/editorial/editorial-watermark"

export const metadata: Metadata = {
  title: "API Documentation",
  robots: { index: false },
}

/**
 * Serves the OpenAPI 3.1 spec via Scalar. The spec lives at /openapi.yaml.
 */
export default function ApiDocsPage() {
  return (
    <>
      <EditorialShell>
        <EditorialFrame className="pb-[2em]">
          <div className="relative max-w-[36em]">
            <EditorialWatermark>api</EditorialWatermark>
            <EditorialEyebrow>Developers</EditorialEyebrow>
            <h1 className="relative m-0 mt-[1em] font-outfit text-[clamp(2.25rem,5vw,3.75em)] leading-[1.1] font-normal tracking-[-0.04em] text-balance text-[#131111]">
              Store API
            </h1>
            <p className="mt-[1.25em] m-0 font-outfit text-[1.125em] leading-[1.4] tracking-[-0.02em] text-[#131111]/70">
              Custom Legacy Crafts endpoints — OpenAPI 3.1.
            </p>
          </div>
        </EditorialFrame>
      </EditorialShell>
      <script id="api-reference" data-url="/openapi.yaml" />
      <Script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference" strategy="afterInteractive" />
    </>
  )
}
