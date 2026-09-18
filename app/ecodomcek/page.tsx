import type { Metadata } from "next"
import localFont from "next/font/local"
import EcodomcekSite from "@/components/concepts/ecodomcek"
import { siteConfig } from "@/lib/site-config"

/**
 * /ecodomcek — the client concept as a live page (clients/ecodomcek/).
 *
 * A concept for a real client, so it is neither a skill demo (those carry
 * generic nouns) nor a case study (those are fictional): it is the Vzorový
 * dom walk, labelled a concept on every plate, kept out of the index until
 * the client signs it off.
 *
 * Two faces are the client's own (ART_DIRECTION.md §3) and are route-scoped
 * so the studio shell never pays for them: Instrument Sans for the copy,
 * IBM Plex Mono for the annotations. Both are self-hosted and subsetted by
 * `scripts/build-fonts.mjs` like every other face on the site — loading them
 * from next/font/google cost 14 hashed files and ~127 KB, which is the
 * regression Iterácia 4.7 had just removed. The italic serif is the site's
 * own Instrument Serif (`--font-instrument`, loaded by the root layout with
 * a true italic), not a second copy.
 */

const sans = localFont({
  src: "../fonts/instrument-sans.woff2",
  weight: "400 500",
  variable: "--font-eco-sans",
  display: "swap",
})

const mono = localFont({
  src: [
    { path: "../fonts/plex-mono.woff2", weight: "400", style: "normal" },
    { path: "../fonts/plex-mono-500.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-eco-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "EcoDomček — vzorový dom, koncept | Codera",
  description:
    "Prechod vzorovým drevodomom EcoDomček izbu po izbe — koncept nového webu od štúdia Codera. Nejde o realizovaný projekt.",
  robots: { index: false, follow: false },
  alternates: { canonical: `${siteConfig.url}/ecodomcek` },
}

export default function EcodomcekPage() {
  return (
    <div className={`${sans.variable} ${mono.variable}`}>
      <EcodomcekSite />
    </div>
  )
}
