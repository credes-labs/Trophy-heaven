import type { Metadata } from "next"
import Script from "next/script"

export const metadata: Metadata = {
  title: "API Documentation",
  robots: { index: false },
}

/**
 * Serves the OpenAPI 3.1 spec via Scalar (docs/kit/10). The spec lives at
 * /openapi.yaml and documents the custom Legacy Crafts endpoints.
 */
export default function ApiDocsPage() {
  return (
    <>
      <script id="api-reference" data-url="/openapi.yaml" />
      <Script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference" strategy="afterInteractive" />
    </>
  )
}
