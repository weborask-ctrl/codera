import { Container, Section, SectionHeader } from "@/components/site/primitives"
import { Reveal } from "@/components/site/reveal"
import { people } from "@/lib/site-config"

/**
 * The people section.
 *
 * No photographs exist yet, and fake avatars would undercut the one thing
 * this section is for. So the layout carries the names typographically and
 * leaves a real portrait slot: dropping an <Image> into the same aspect box
 * later needs no redesign.
 *
 * Deliberately no invented biographies, roles, years of experience or
 * education — none of that is known.
 */

const REASONS = [
  {
    title: "Hovoríte priamo s tvorcami",
    body: "Žiadny account manažér medzi vami a prácou. Otázku poviete tomu, kto ju rieši.",
  },
  {
    title: "Menej odovzdávok, menej strát",
    body: "Dizajn a vývoj riešime spoločne od začiatku, takže sa návrh cestou nerozpadne.",
  },
  {
    title: "Rozhodnutia padnú rýchlo",
    body: "Dvaja ľudia sa dohodnú za hodinu. Pripomienku vieme zapracovať ešte v ten deň.",
  },
  {
    title: "Pri projekte zostávame my",
    body: "Ten istý tím, ktorý web navrhol, ho aj naprogramuje a spustí.",
  },
]

export function Team() {
  return (
    <Section id="o-nas" tone="ink" data-nav-tone="ink" aria-labelledby="team-heading">
      <Container>
        <div className="grid gap-14 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-20">
          <Reveal>
            <SectionHeader
              eyebrow="O nás"
              headingId="team-heading"
              title="Dvaja ľudia, ktorí web navrhnú aj postavia."
              lead="Codera je malý tím developerov a dizajnérov. Tá veľkosť je zámer — jednému projektu vieme venovať pozornosť, ktorú by väčšia agentúra rozdelila medzi desať."
            />
          </Reveal>

          <div className="flex flex-col gap-12">
            <Reveal>
              {/* Names carried typographically, not by monogram circles: a
                  placeholder avatar is still a placeholder. When real
                  portraits exist, drop an <Image> into each <li> above the
                  name — the row spacing already allows for it. */}
              <ul className="grid gap-8 sm:grid-cols-2">
                {people.map((person) => (
                  <li key={person.name} className="border-t border-white/15 pt-6">
                    <p className="text-h4">{person.name}</p>
                    <p className="mt-1.5 text-caption text-muted-foreground">
                      Codera
                    </p>
                  </li>
                ))}
              </ul>
            </Reveal>

            <div className="grid gap-px bg-white/10 sm:grid-cols-2">
              {REASONS.map((reason, index) => (
                <div key={reason.title} className="bg-ink p-7 sm:p-8">
                  <Reveal delay={index * 60}>
                    <h3 className="text-h4">{reason.title}</h3>
                    <p className="mt-3 text-small text-pretty text-muted-foreground">
                      {reason.body}
                    </p>
                  </Reveal>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
