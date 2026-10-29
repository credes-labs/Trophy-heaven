import type { Metadata } from "next"
import { Inter, Outfit, Playfair_Display } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { AnnouncementBar } from "@/components/layout/announcement-bar"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CartDrawer } from "@/components/features/cart/cart-drawer"
import { PWARegister } from "@/components/pwa-register"
import { Analytics } from "@/components/analytics"
import { ChromeGate, SiteChrome } from "@/components/layout/site-chrome"
import { getSiteUrl } from "@/lib/site-url"

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
})

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-outfit-family",
  display: "swap",
})

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Legacy Crafts — Custom Trophies, Furniture & Home Decor",
    template: "Legacy Crafts | %s",
  },
  description:
    "Premium handcrafted trophies, bespoke furniture, and curated artwork. Designed and made in India with heritage craftsmanship.",
  openGraph: {
    type: "website",
    siteName: "Legacy Crafts",
    locale: "en_IN",
    images: [{ url: "/images/og/og-default.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
  robots: process.env.VERCEL_ENV === "preview" ? { index: false, follow: false } : undefined,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const baseUrl = getSiteUrl()
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Legacy Crafts",
    url: baseUrl,
    logo: `${baseUrl}/icon.png`,
    description:
      "Premium handcrafted trophies, bespoke furniture, and curated artwork. Designed and made in India with heritage craftsmanship.",
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
    name: "Legacy Crafts",
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
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${outfit.variable}`}>
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
          <PWARegister />
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
