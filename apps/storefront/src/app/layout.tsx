import type { Metadata } from "next"
import { Inter, Fraunces } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CartDrawer } from "@/components/features/cart/cart-drawer"
import { Analytics } from "@/components/analytics"
import { PWARegister } from "@/components/pwa-register"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  title: {
    default: "Legacy Crafts — Custom Trophies, Furniture & Home Decor",
    template: "%s · Legacy Crafts",
  },
  description:
    "Design custom trophies in 2D and 3D. Premium trophies, furniture, and home decor with real-time customization.",
  openGraph: { type: "website", siteName: "Legacy Crafts" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="flex min-h-screen flex-col">
        <Providers>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-card focus:px-4 focus:py-2"
          >
            Skip to content
          </a>
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
          <CartDrawer />
          <PWARegister />
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
