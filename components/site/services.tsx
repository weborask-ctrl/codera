import { ButtonLink } from "@/components/site/button-link"
import { IndexMark } from "@/components/site/codera-motif"
import { Container, Section, SectionHeader } from "@/components/site/primitives"
import { Reveal } from "@/components/site/reveal"
import { commercial, primaryCta } from "@/lib/site-config"

/**
 * Services, structured as PROBLEM → OUTCOME → WHO.
 *
 * A list rather than a card grid: the projects and the timeline are the
 * page's loud moments, and this section reads better quiet. Each row leads
 * with the business situation the client recognises, not the deliverable.
 */

const SERVICES = [
  {
    index: "01",
    title: "Firemné webstránky",
    problem:
      "Web nezodpovedá tomu, ako firma reálne pracuje. Návštevník nevie, čo presne ponúkate ani prečo práve vás.",
    outcome:
      "Prezentácia, ktorá firmu postaví na jej skutočnú úroveň — jasná ponuka, zrozumiteľná štruktúra a viditeľný ďalší krok.",
    who: "Firmy bez webu alebo s webom, ktorý už neobstojí.",
    price: commercial.priceFromLabel,
  },
  {
    index: "02",
    title: "Landing pages",
    problem:
      "Do reklamy idú peniaze, ale návštevník pristane na stránke, ktorá ho k ničomu nevedie.",
    outcome:
      "Jedna stránka pre jednu ponuku, sústredená na jediný krok — a meranie, ktoré ukáže, či sa investícia vracia.",
    who: "Kampane, uvedenie novej služby, overenie dopytu.",
  },
  {
    index: "03",
    title: "Redizajn existujúcich webov",
    problem:
      "Firma za desať rokov vyrástla, web zostal na mieste. Pôsobí zastarane a odrádza práve tých zákazníkov, o ktorých stojíte.",
    outcome:
      "Zachováme, čo funguje, a prepracujeme, čo brzdí. Obsah, štruktúru aj vizuál zosúladíme s tým, kde je firma dnes.",
    who: "Weby staršie ako päť rokov alebo po zmene pozicionovania.",
    price: commercial.priceFromLabel,
  },
  {
    index: "04",
    title: "Správa a rozvoj webu",
    problem:
      "Web sa spustil a odvtedy sa ho nikto nedotkol. Nikto nevie, či ešte funguje, ako má.",
    outcome:
      "Priebežne dopĺňame obsah, sledujeme rýchlosť aj bezpečnosť a web zlepšujeme podľa toho, čo ukazujú dáta.",
    who: "Firmy, ktoré nechcú riešiť web interne.",
  },
]

export function Services() {
  return (
    <Section id="sluzby" tone="surface" aria-labelledby="services-heading">
      <Container>
        <Reveal>
          <SectionHeader
            eyebrow="Služby"
            headingId="services-heading"
            title="Štyri veci, ktoré robíme poriadne."
            lead="Radšej úzka ponuka zvládnutá do detailu než zoznam dvadsiatich položiek."
          />
        </Reveal>

        <ul className="mt-14 border-t border-hairline">
          {SERVICES.map((service, index) => (
            <li key={service.index} className="border-b border-hairline">
              <Reveal delay={index * 50}>
                <div className="grid gap-6 py-9 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-12 lg:py-11">
                  <div>
                    <IndexMark value={service.index} />
                    <h3 className="mt-3 text-h3">{service.title}</h3>
                    {service.price ? (
                      <p className="mt-3 inline-flex rounded-full bg-brand-soft px-3 py-1 text-caption font-medium text-brand-strong">
                        {service.price}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2 lg:gap-10">
                    <div>
                      <p className="text-caption font-medium tracking-[0.06em] text-muted-foreground uppercase">
                        Situácia
                      </p>
                      <p className="mt-2.5 text-small text-pretty text-muted-foreground">
                        {service.problem}
                      </p>
                    </div>
                    <div>
                      <p className="text-caption font-medium tracking-[0.06em] text-muted-foreground uppercase">
                        Výsledok
                      </p>
                      <p className="mt-2.5 text-small text-pretty">
                        {service.outcome}
                      </p>
                    </div>
                    <p className="text-caption text-muted-foreground sm:col-span-2">
                      <span className="text-foreground">Vhodné pre: </span>
                      {service.who}
                    </p>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal>
          <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-[34rem] text-small text-muted-foreground">
              Konečná cena závisí od rozsahu, počtu stránok a integrácií.
              Povieme ju po bezplatnej konzultácii — nie až v zmluve.
            </p>
            <ButtonLink
              href={primaryCta.href}
              variant="brand"
              className="shrink-0 rounded-full"
            >
              {primaryCta.label}
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </Section>
  )
}
