import type { Metadata } from "next"
import { IBM_Plex_Mono, Instrument_Sans, Instrument_Serif } from "next/font/google"
import EcodomcekSite from "@/components/concepts/ecodomcek"
import { siteConfig } from "@/lib/site-config"

/**
 * /ecodomcek — the client concept as a live page (clients/ecodomcek/).
 *
 * A concept for a real client, so it is neither a skill demo (those carry
 * generic nouns) nor a case study (those are fictional): it is the Vzorový
 * dom walk, labelled a concept on every plate, kept out of the index until
 * the client signs it off. The route owns its own three faces so the studio
 * shell does not carry them for every visitor.
 */

const sans = Instrument_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-eco-sans",
  display: "swap",
})

const mono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-eco-mono",
  display: "swap",
})

const serif = Instrument_Serif({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  style: "italic",
  variable: "--font-eco-serif",
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
    <div className={`${sans.variable} ${mono.variable} ${serif.variable}`}>
      <EcodomcekSite />
    </div>
  )
}
