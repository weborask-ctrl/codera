import type { Metadata, Viewport } from "next"
import localFont from "next/font/local"
import { connection } from "next/server"

import "./globals.css"
import "./city.css"
import { siteConfig } from "@/lib/site-config"
import { cn } from "@/lib/utils"

/**
 * The type system, self-hosted (Iterácia 4.7, issue #5).
 *
 * The same five families as before — Geist Sans for body and UI, Geist Mono
 * as the engineering voice, Fraunces for the italic accent and the two
 * serif demos, Bricolage 800 for display, Instrument Serif for Štatút — but
 * built by `scripts/build-fonts.mjs` from the google/fonts sources with
 * harfbuzz: the weight axis pinned or narrowed to what the site renders,
 * Fraunces keeping its optical-size axis (the 118 px italic is designed
 * around it), Bricolage instanced exactly where Google's static 800 sat,
 * and one file per face covering Basic Latin, Latin-1 and Latin Extended-A
 * instead of Google's latin + latin-ext pair. 390 KB → 196 KB on the
 * homepage, ten requests → five, nothing on the page changes shape.
 *
 * Latin Extended-A is required, not optional: without it every Slovak
 * diacritic (č, ď, ľ, ĺ, ň, ô, ŕ, š, ť, ž) silently falls back to a
 * different face mid-word, which is unmissable at display sizes.
 */
const geist = localFont({
  src: "./fonts/geist.woff2",
  weight: "400 700",
  variable: "--font-geist-sans",
  display: "swap",
})

const geistMono = localFont({
  src: "./fonts/geist-mono.woff2",
  weight: "400 700",
  variable: "--font-geist-mono",
  display: "swap",
})

/* the hero headline carries a true-italic accent — a faux oblique at 12vw
   would read as a rendering bug, so the italic is its own file; the roman
   spans 400–600 for the bakery's 600 and the roastery's 560 */
const fraunces = localFont({
  src: [
    { path: "./fonts/fraunces.woff2", weight: "400 600", style: "normal" },
    { path: "./fonts/fraunces-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-fraunces",
  display: "swap",
})

/* Per-world faces (AD v3 amendment 2026-08-31): the concept worlds prove
   typographic range, not only palette range. Instrument Serif is Štatút's
   institutional voice — demo pages only, not preloaded, so the homepage
   never pays for a face it does not render; its true italic replaces the
   oblique the browser used to synthesise for "Obchodné právo". */
const instrument = localFont({
  src: [
    { path: "./fonts/instrument-serif.woff2", weight: "400", style: "normal" },
    { path: "./fonts/instrument-serif-italic.woff2", weight: "400", style: "italic" },
  ],
  preload: false,
  variable: "--font-instrument",
  display: "swap",
})

/* every surface sets Bricolage at 800 — one static instance */
const bricolage = localFont({
  src: "./fonts/bricolage-800.woff2",
  weight: "800",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  /* the CSP nonce is per request (proxy.ts), so every page renders per
     request: a prerendered page could not carry it (Iterácia 4.8) */
  await connection()
  return (
    <html
      lang="sk"
      className={cn(
        "antialiased",
        geist.variable,
        geistMono.variable,
        fraunces.variable,
        instrument.variable,
        bricolage.variable
      )}
    >
      {/* the homepage preloads its own plates (app/page.tsx); every other page
          used to pay for them and never use them (audit 2026-09-14 §1) */}
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
