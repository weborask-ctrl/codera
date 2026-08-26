import type { Metadata, Viewport } from "next"
import { Archivo, Geist_Mono } from "next/font/google"

import "./globals.css"
import { siteConfig } from "@/lib/site-config"
import { cn } from "@/lib/utils"

/**
 * Two faces, and the second one only ever appears at 11px.
 *
 * Archivo is a variable grotesque with a real **width** axis, which is why it
 * is here rather than a second static display face: the offer scene expands
 * and compresses its headline as motion, and doing that by scaling type would
 * distort the letterforms. One variable file covers the whole range.
 *
 * `latin-ext` is required, not optional. Without it every Slovak diacritic
 * (č, ď, ľ, ĺ, ň, ô, ŕ, š, ť, ž) silently falls back to a different face
 * mid-word, which is unmissable at display sizes.
 */
const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
})

const geistMono = Geist_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-geist-mono",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "tvorba webových stránok",
    "firemné webstránky",
    "redizajn webu",
    "webové štúdio",
    "webdizajn",
    "landing page",
    "Slovensko",
  ],
  alternates: {
    canonical: "/",
    /* Ready for the English version: adding `app/en/` and a second entry here
       is all a second locale needs. */
    languages: { "sk-SK": "/" },
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  formatDetection: { telephone: false },
}

/**
 * One ground colour, declared once.
 *
 * There is no light/dark theme to switch between: the page's dark/light rhythm
 * is authored per scene, so the browser chrome should match the ground the
 * page actually opens on rather than the visitor's system preference.
 */
export const viewport: Viewport = {
  themeColor: "#0a0b0c",
  colorScheme: "dark",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="sk"
      className={cn("antialiased", archivo.variable, geistMono.variable)}
    >
      <body>
        <a
          href="#hlavny-obsah"
          className="sr-only rounded-full bg-brand px-4 py-2 text-small font-medium text-brand-foreground focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100]"
        >
          Preskočiť na hlavný obsah
        </a>
        {children}
      </body>
    </html>
  )
}
