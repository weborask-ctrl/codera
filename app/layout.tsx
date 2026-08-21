import type { Metadata, Viewport } from "next"
import { Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { siteConfig } from "@/lib/site-config"
import { cn } from "@/lib/utils"

/* `latin-ext` is required, not optional: without it every Slovak diacritic
   (č, ď, ľ, ĺ, ň, ô, ŕ, š, ť, ž) falls back to a different face mid-word. */
const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
})

const fontMono = Geist_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-mono",
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

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#181b1f" },
  ],
  colorScheme: "light dark",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="sk"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <head>
        {/* Scroll entrances are progressive enhancement: with scripting off,
            the content must simply be there. */}
        <noscript>
          <style>
            {".reveal{opacity:1;transform:none;filter:none}.reveal-wipe>*{clip-path:none;transform:none}"}
          </style>
        </noscript>
      </head>
      <body>
        <ThemeProvider>
          <a
            href="#hlavny-obsah"
            className="sr-only rounded-full bg-brand px-4 py-2 text-small font-medium text-brand-foreground focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100]"
          >
            Preskočiť na hlavný obsah
          </a>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
