import type { Metadata, Viewport } from "next"
import {
  Bricolage_Grotesque,
  Fraunces,
  Geist,
  Geist_Mono,
  Instrument_Serif,
  Sacramento,
} from "next/font/google"

import "./globals.css"
import { siteConfig } from "@/lib/site-config"
import { cn } from "@/lib/utils"

/**
 * The Žiara type system: one family plus its mono (CODERA_ART_DIRECTION_V3.md).
 *
 * Geist Sans carries everything — LIGHT weights at display sizes for the act
 * statements [exoape: confidence through lightness], regular for body — and
 * Geist Mono is the engineering voice: coordinates, measurements, annotations
 * [igloo]. Archivo and its width axis retired with v2; Fraunces stays loaded
 * only because the Meridián and Štatút concept worlds use a serif in their own
 * interior grammar.
 *
 * `latin-ext` is required, not optional. Without it every Slovak diacritic
 * (č, ď, ľ, ĺ, ň, ô, ŕ, š, ť, ž) silently falls back to a different face
 * mid-word, which is unmissable at display sizes.
 */
const geist = Geist({
  subsets: ["latin", "latin-ext"],
  variable: "--font-geist-sans",
  display: "swap",
})

const geistMono = Geist_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-geist-mono",
  display: "swap",
})

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-fraunces",
  axes: ["opsz"],
  /* Iterácia 0.3: the hero headline carries a true-italic accent — a faux
     oblique at 12vw would read as a rendering bug, so both styles load */
  style: ["normal", "italic"],
})

/* Per-world faces (AD v3 amendment 2026-08-31): the concept worlds prove
   typographic range, not only palette range. Instrument Serif is Štatút's
   institutional voice; Bricolage is Vlna's loud wide grotesque. The +2
   families are a conscious spend against issue #5 — range wins. */
const instrument = Instrument_Serif({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  variable: "--font-instrument",
  display: "swap",
})

/* Iterácia 0.6: the written mark — a thin monoline script (ETA gesture,
   Ondrej's pick C). One weight, display-only, the /05 signature. */
const sacramento = Sacramento({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  variable: "--font-sacramento",
  display: "swap",
})

const bricolage = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  variable: "--font-bricolage",
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
      className={cn(
        "antialiased",
        geist.variable,
        geistMono.variable,
        fraunces.variable,
        instrument.variable,
        bricolage.variable,
        sacramento.variable
      )}
    >
      <head>
        {/* the flat-mode hero C is the mobile LCP element — fetch it first */}
        <link rel="preload" href="/brand/codera-mark.svg" as="image" fetchPriority="high" />
      </head>
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
