import type { Metadata } from "next"
import { notFound } from "next/navigation"
import MeridianSite from "@/components/concepts/meridian"
import ObservatoriumSite from "@/components/concepts/observatorium"
import StatutSite from "@/components/concepts/statut"
import VlnaSite from "@/components/concepts/vlna"
import { siteConfig } from "@/lib/site-config"
import { getSkill, skills } from "@/lib/skills"

/**
 * Skill demo pages (AD v3 amendment 3): each live skill renders the full
 * demonstration site that embodies it. No invented brands — the pages carry
 * generic nouns and the corner DEMO tag. Robots stay out; these are
 * demonstrations, not content competing with the studio.
 */

const DEMOS = {
  dizajn: StatutSite,
  objednavky: MeridianSite,
  rezervacie: VlnaSite,
  animacie: ObservatoriumSite,
} as const

export function generateStaticParams() {
  return skills.filter((s) => s.ready && s.demo).map(({ slug }) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const skill = getSkill((await params).slug)
  if (!skill?.ready) {
    return {}
  }
  return {
    title: `${skill.name} — živá ukážka | Codera`,
    description: `${skill.line} Demo štúdia Codera.`,
    robots: { index: false, follow: true },
    alternates: { canonical: `${siteConfig.url}/ukazky/${skill.slug}` },
  }
}

export default async function UkazkaPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const skill = getSkill(slug)
  const Site = skill?.demo ? DEMOS[skill.demo] : undefined
  if (!skill?.ready || !Site) {
    notFound()
  }
  return <Site />
}
