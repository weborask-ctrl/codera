import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { DemoSwitch } from "@/components/concepts/demo-switch"
import { siteConfig } from "@/lib/site-config"
import { getSkill, skills } from "@/lib/skills"

/**
 * Skill demo pages (AD v3 amendment 3): each live skill renders the full
 * demonstration site that embodies it. No invented brands — the pages carry
 * generic nouns and the corner DEMO tag. Robots stay out; these are
 * demonstrations, not content competing with the studio.
 */

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
    /* the layout template appends "— Codera" */
    title: `${skill.name} — živá ukážka`,
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
  if (!skill?.ready || !skill.demo) {
    notFound()
  }
  /* the switch is a Client Component so each demo is its own chunk */
  return <DemoSwitch demo={skill.demo} />
}
