import type { Metadata } from "next"
import { notFound } from "next/navigation"
import MeridianSite from "@/components/concepts/meridian"
import { KonceptRibbon } from "@/components/concepts/shell"
import StatutSite from "@/components/concepts/statut"
import VlnaSite from "@/components/concepts/vlna"
import { getCaseStudy } from "@/lib/case-studies"
import { siteConfig } from "@/lib/site-config"

/**
 * The full concept sites (AD v3 amendment 2): real, browsable demonstration
 * websites — the proof a portal can only point at. Each wears the honest
 * ribbon; robots stay out (they are demonstrations, not content competing
 * with the studio's own pages).
 */

const SITES = {
  meridian: { Site: MeridianSite, ribbon: "light" as const },
  statut: { Site: StatutSite, ribbon: "light" as const },
  vlna: { Site: VlnaSite, ribbon: "light" as const },
}

export function generateStaticParams() {
  return Object.keys(SITES).map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const study = getCaseStudy((await params).slug)
  if (!study) {
    return {}
  }
  return {
    title: `${study.name} — živý koncept | Codera`,
    description: `${study.sector}. Plný ukážkový koncept štúdia Codera — nejde o realizáciu pre klienta.`,
    robots: { index: false, follow: true },
    alternates: { canonical: `${siteConfig.url}/koncept/${study.slug}` },
  }
}

export default async function KonceptPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const entry = SITES[slug as keyof typeof SITES]
  if (!entry) {
    notFound()
  }
  const { Site, ribbon } = entry
  return (
    <>
      <KonceptRibbon tone={ribbon === "light" ? "light" : "dark"} />
      <Site />
    </>
  )
}
