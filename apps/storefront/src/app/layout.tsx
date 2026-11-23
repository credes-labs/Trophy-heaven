import type { Metadata } from "next"
import { Inter, Marcellus, Playfair_Display, Urbanist } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { AnnouncementBar } from "@/components/layout/announcement-bar"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CartDrawer } from "@/components/features/cart/cart-drawer"
import { DesignMappingDialog } from "@/components/features/cart/design-mapping-dialog"
import { PWARegister } from "@/components/pwa-register"
import { Analytics } from "@/components/analytics"
import { ChromeGate, SiteChrome } from "@/components/layout/site-chrome"
import { getSiteUrl } from "@/lib/site-url"
import { SHARE_IMAGE } from "@/lib/images"

/**
 * Urbanist is the single site typeface (display, body, UI) — the geometric
 * grotesque from the Trophy Heaven landing-page reference.
 */
const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-urbanist",
  display: "swap",
})

/**
 * Brand wordmark face: Marcellus, a flared Roman serif matching the Trophy Heaven
 * logo lettering. Used for the wordmark only (hero, header lockup, footer).
 */
const marcellus = Marcellus({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-marcellus",
  display: "swap",
})

/**
 * Engraving faces only: the plaque configurator offers these as lettering
 * styles for the customer's plate. Not preloaded — the site never uses them.
 */
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-inter",
  display: "swap",
  preload: false,
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
  preload: false,
})

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Trophy Heaven — Custom Trophies, Awards & Plaques",
    template: "Trophy Heaven | %s",
  },
  description:
    "Premium handcrafted trophies, awards, and engraved plaques. Designed and made in India with heritage craftsmanship.",
  openGraph: {
    type: "website",
    siteName: "Trophy Heaven",
    locale: "en_IN",
    images: [SHARE_IMAGE],
  },
  twitter: { card: "summary_large_image" },
  robots: process.env.VERCEL_ENV === "preview" ? { index: false, follow: false } : undefined,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const baseUrl = getSiteUrl()
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Trophy Heaven",
    url: baseUrl,
    logo: `${baseUrl}/icon.png`,
    description:
      "Premium handcrafted trophies, awards, and engraved plaques. Designed and made in India with heritage craftsmanship.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bangalore",
      addressRegion: "Karnataka",
      addressCountry: "IN",
    },
  }
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Trophy Heaven",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }

  return (
    <html lang="en" className={`${urbanist.variable} ${marcellus.variable} ${inter.variable} ${playfair.variable}`}>
      <body className="font-sans bg-background text-foreground antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <Providers>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-card focus:px-4 focus:py-2"
          >
            Skip to content
          </a>
          <SiteChrome announcement={<AnnouncementBar />} header={<Header />} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <ChromeGate>
            <Footer />
          </ChromeGate>
          <CartDrawer />
          <DesignMappingDialog />
          <PWARegister />
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
