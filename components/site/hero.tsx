import { ButtonLink } from "@/components/site/button-link"
import { HeroVisual } from "@/components/site/hero-visual"
import { Container } from "@/components/site/primitives"
import { Reveal } from "@/components/site/reveal"
import { Vertex } from "@/components/site/w-motif"
import { commercial, primaryCta } from "@/lib/site-config"

const CREDIBILITY = [
  commercial.priceFromLabel,
  `Prvý návrh do ${commercial.firstProposalHours} hodín`,
  "Bezplatná konzultácia",
]

export function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="relative overflow-hidden pt-14 pb-20 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-28"
    >
      {/* A single quiet wash so the device shadows have something to land on. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-[62%] bg-gradient-to-b from-transparent to-surface"
      />

      <Container>
        <div className="mx-auto flex max-w-[58rem] flex-col items-center text-center">
          <Reveal>
            <p className="text-eyebrow text-muted-foreground uppercase">
              Tvorba firemných webstránok · Slovensko
            </p>
          </Reveal>

          <Reveal delay={70}>
            <h1
              id="hero-heading"
              className="mt-5 text-display text-balance text-foreground"
            >
              Vaša firma je lepšia,
              <br className="hidden sm:block" /> než ukazuje váš web.
            </h1>
          </Reveal>

          <Reveal delay={140}>
            <p className="mt-6 max-w-[38rem] text-lead text-pretty text-muted-foreground">
              Firemné weby a redizajny pre firmy, ktorých prezentácia už
              nezodpovedá ich úrovni. Web, ktorý pôsobí dôveryhodne, načíta sa
              rýchlo a vedie k dopytu.
            </p>
          </Reveal>

          <Reveal delay={210}>
            <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
              <ButtonLink
                href={primaryCta.href}
                variant="brand"
                size="xl"
                className="w-full rounded-full sm:w-auto"
              >
                {primaryCta.label}
              </ButtonLink>
              <ButtonLink
                href="#projekty"
                variant="ghost"
                size="xl"
                className="w-full rounded-full text-brand hover:bg-brand-soft hover:text-brand sm:w-auto"
              >
                Pozrieť projekty
                <svg
                  viewBox="0 0 16 16"
                  className="size-3.5"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="m6 3 5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </ButtonLink>
            </div>
          </Reveal>

          {/* The commercial facts, stated once and quietly. */}
          <Reveal delay={280}>
            <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {CREDIBILITY.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-caption text-muted-foreground"
                >
                  <Vertex className="h-1.5 text-brand" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Container>

      <Container className="mt-16 sm:mt-20 lg:mt-24">
        <Reveal delay={120} className="mx-auto max-w-[68rem]">
          <HeroVisual />
        </Reveal>
        <p className="mx-auto mt-8 max-w-[68rem] text-center text-caption text-muted-foreground sm:mt-16 sm:text-left">
          Ukážkový koncept — Vitalis, súkromná klinika. Nejde o reálneho
          klienta.
        </p>
      </Container>
    </section>
  )
}
