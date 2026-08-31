import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { MeridianHero } from "@/components/concepts/meridian"
import { StatutHero } from "@/components/concepts/statut"
import { VlnaHero } from "@/components/concepts/vlna"
import { caseStudies, getCaseStudy } from "@/lib/case-studies"
import { siteConfig } from "@/lib/site-config"

/**
 * Case-study pages — Step 6 phase D.
 *
 * Documents, not journeys (the Step 6 contract): no canvas, no pins, no
 * scripting required to read. They sell the DECISIONS behind each concept
 * world — an SMB owner should recognise their own situation in the brief and
 * see every visual choice trace to a commercial reason. Žiara frost shell;
 * the world's own colours appear only inside its embedded frame.
 *
 * Everything on these pages describes fictional concept clients, and the
 * pages say so — in the copy, the labels and the metadata.
 */

const WORLDS = {
  meridian: MeridianHero,
  statut: StatutHero,
  vlna: VlnaHero,
} as const

const MONO = { fontFamily: "var(--font-geist-mono)" }

export function generateStaticParams() {
  return caseStudies.map(({ slug }) => ({ slug }))
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
    title: `${study.name} — ukážkový koncept | Codera`,
    description: `${study.sector}: ${study.thesis} Ukážkový koncept štúdia Codera — nejde o realizáciu pre klienta.`,
    alternates: { canonical: `${siteConfig.url}/praca/${study.slug}` },
  }
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const study = getCaseStudy((await params).slug)
  if (!study) {
    notFound()
  }
  const World = WORLDS[study.slug as keyof typeof WORLDS]
  const others = caseStudies.filter((c) => c.slug !== study.slug)

  return (
    <main className="min-h-svh bg-[#EDF0F3] text-[#17181d]">
      {/* ---- document header ---- */}
      <header className="mx-auto max-w-[72rem] px-[clamp(1.25rem,4vw,3rem)] pt-10">
        <div
          className="flex items-baseline justify-between border-b border-black/15 pb-4 text-[0.62rem] tracking-[0.22em]"
          style={MONO}
        >
          <Link href="/" className="hover:opacity-70">
            ← CODERA
          </Link>
          <span className="text-[#17181d]/55">PRÍPADOVÁ ŠTÚDIA · UKÁŽKOVÝ KONCEPT</span>
        </div>

        <p className="mt-10 text-[0.64rem] tracking-[0.28em] text-[#17181d]/55" style={MONO}>
          {study.sector.toUpperCase()} · {study.mechanic.toUpperCase()}
        </p>
        <h1
          className="mt-4 max-w-[13em] font-light"
          style={{ fontSize: "clamp(2.4rem,6vw,4.8rem)", lineHeight: 1.04, letterSpacing: "-0.022em" }}
        >
          {study.name}
        </h1>
        <p className="mt-5 max-w-[36rem] text-[1.05rem] leading-[1.6] text-[#17181d]/75">
          {study.thesis}
        </p>
      </header>

      {/* ---- the concept, live ---- *
          The same live markup /03 stages — not a screenshot, so it stays
          sharp at any density and never drifts from the real thing. */}
      <div className="mx-auto mt-12 max-w-[76rem] px-[clamp(0.75rem,2.5vw,2rem)]">
        <figure
          className="relative m-0 overflow-hidden rounded-[10px] shadow-[0_30px_80px_-30px_rgba(20,22,26,0.35)]"
          style={{ containerType: "inline-size", aspectRatio: "16/10" }}
          aria-label={`Živá ukážka konceptu ${study.name}`}
        >
          <div className="absolute inset-0">
            <World portal />
          </div>
        </figure>
        <p className="mt-3 text-center text-[0.6rem] tracking-[0.18em] text-[#17181d]/45" style={MONO}>
          ŽIVÁ UKÁŽKA — KONCEPT, NIE REALIZÁCIA PRE KLIENTA ·{" "}
          <Link href={`/koncept/${study.slug}`} className="underline underline-offset-4 hover:opacity-70">
            OTVORIŤ CELÝ KONCEPT →
          </Link>
        </p>
      </div>

      {/* ---- brief ---- */}
      <section className="mx-auto max-w-[72rem] px-[clamp(1.25rem,4vw,3rem)] pt-16">
        <div className="grid gap-10 lg:grid-cols-[16rem_1fr]">
          <h2 className="text-[0.66rem] tracking-[0.28em] text-[#17181d]/55" style={MONO}>
            VÝCHODISKO
          </h2>
          <p className="max-w-[42rem] text-[1.02rem] leading-[1.7] text-[#17181d]/80">
            {study.brief}
          </p>
        </div>
      </section>

      {/* ---- decisions ---- */}
      <section className="mx-auto max-w-[72rem] px-[clamp(1.25rem,4vw,3rem)] pt-14">
        <div className="grid gap-10 lg:grid-cols-[16rem_1fr]">
          <h2 className="text-[0.66rem] tracking-[0.28em] text-[#17181d]/55" style={MONO}>
            ROZHODNUTIA
          </h2>
          <ol className="max-w-[46rem]">
            {study.decisions.map((d, i) => (
              <li
                key={d.what}
                className="grid grid-cols-[2.6rem_1fr] gap-x-4 border-t border-black/12 py-6"
              >
                <span className="tnum text-[0.8rem] text-[#17181d]/40" style={MONO}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-[1rem] leading-[1.5] font-medium">{d.what}</p>
                  <p className="mt-2 text-[0.92rem] leading-[1.6] text-[#17181d]/65">
                    Prečo: {d.why}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---- climate ---- */}
      <section className="mx-auto max-w-[72rem] px-[clamp(1.25rem,4vw,3rem)] pt-14">
        <div className="grid gap-10 lg:grid-cols-[16rem_1fr]">
          <h2 className="text-[0.66rem] tracking-[0.28em] text-[#17181d]/55" style={MONO}>
            DIZAJNOVÝ SYSTÉM
          </h2>
          <dl className="grid max-w-[46rem] gap-px overflow-hidden rounded-[8px] border border-black/12 bg-black/12 sm:grid-cols-3">
            {(
              [
                ["FARBA", study.climate.ground],
                ["TYPOGRAFIA", study.climate.type],
                ["HUSTOTA", study.climate.density],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="bg-[#F6F8FA] px-5 py-5">
                <dt className="text-[0.56rem] tracking-[0.22em] text-[#17181d]/50" style={MONO}>
                  {label}
                </dt>
                <dd className="mt-2 text-[0.88rem] leading-[1.55] text-[#17181d]/80">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---- what it proves + CTA ---- */}
      <section className="mx-auto max-w-[72rem] px-[clamp(1.25rem,4vw,3rem)] pt-16 pb-20">
        <div className="rounded-[10px] bg-[#17181d] px-[clamp(1.5rem,4vw,3.5rem)] py-12 text-[#f2f4f6]">
          <p className="text-[0.62rem] tracking-[0.28em] text-[#f2f4f6]/55" style={MONO}>
            ČO TÝM UKAZUJEME
          </p>
          <p className="mt-4 max-w-[38rem] text-[1.15rem] leading-[1.6]">{study.proves}</p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link
              href="/#dopyt"
              className="rounded-full bg-[#f2f4f6] px-7 py-3.5 text-[0.9rem] font-medium text-[#17181d]"
            >
              Začať projekt
            </Link>
            <span className="text-[0.8rem] text-[#f2f4f6]/60">
              Prvý návrh do 72 hodín · od 1 000 €
            </span>
          </div>
        </div>

        {/* other studies */}
        <nav aria-label="Ďalšie prípadové štúdie" className="mt-12">
          <p className="text-[0.62rem] tracking-[0.28em] text-[#17181d]/50" style={MONO}>
            ĎALŠIE KONCEPTY
          </p>
          <div className="mt-4 grid gap-px overflow-hidden rounded-[8px] border border-black/12 bg-black/12 sm:grid-cols-2">
            {others.map((o) => (
              <Link
                key={o.slug}
                href={`/praca/${o.slug}`}
                className="group bg-[#F6F8FA] px-6 py-6 transition-colors hover:bg-[#FFFFFF]"
              >
                <p className="text-[0.56rem] tracking-[0.2em] text-[#17181d]/50" style={MONO}>
                  {o.sector.toUpperCase()}
                </p>
                <p className="mt-2 text-[1.2rem] font-light">
                  {o.name}{" "}
                  <span className="inline-block transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </p>
              </Link>
            ))}
          </div>
        </nav>

        <footer
          className="mt-12 border-t border-black/12 pt-5 text-[0.62rem] leading-[1.8] text-[#17181d]/55"
          style={MONO}
        >
          <p>
            MERIDIÁN, ŠTATÚT A VLNA SÚ UKÁŽKOVÉ KONCEPTY ŠTÚDIA CODERA — NEJDE O REALIZÁCIE PRE
            KLIENTOV.
          </p>
          <p className="mt-1">
            <Link href="/" className="underline underline-offset-4 hover:opacity-70">
              CODERA.SK
            </Link>{" "}
            · PREŠOV · {siteConfig.email.toUpperCase()}
          </p>
        </footer>
      </section>
    </main>
  )
}
