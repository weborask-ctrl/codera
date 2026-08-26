import { Chevron } from "@/components/site/codera-motif"
import { Container, Section, SectionHeader } from "@/components/site/primitives"
import { Reveal } from "@/components/site/reveal"

/**
 * Technical quality, told as business benefit first.
 *
 * The headline of each item is what the client gets; the technical detail is
 * the smaller line underneath, as evidence. Every claim here is a property of
 * this page and is covered by the Playwright suite or the build — no measured
 * client results are quoted, because there are none yet.
 */

const BENEFITS = [
  {
    title: "Funguje každému, kto naň príde",
    body: "Web testujeme v Chrome, Firefoxe aj Safari. Zákazník sa nedostane na rozbitú stránku len preto, že používa iný prehliadač.",
    evidence: "Automatické testy v troch prehliadačových jadrách",
  },
  {
    title: "Mobil bez kompromisov",
    body: "Väčšina návštev prichádza z telefónu. Rozloženie kontrolujeme od malých displejov po veľké monitory — mobil navrhujeme, nie zmenšujeme.",
    evidence: "Kontrolované od 320 px po 1920 px",
  },
  {
    title: "Chyby nájdeme my, nie váš zákazník",
    body: "Pred každým spustením prebehne build aj sada testov v prehliadači. Bežné chyby sa tak nedostanú na produkciu.",
    evidence: "Build a testy pri každej zmene",
  },
  {
    title: "Rýchle načítanie",
    body: "Pomalý web stráca návštevníkov ešte pred prvým dojmom. Posielame len to, čo je naozaj potrebné.",
    evidence: "Vykresľovanie na serveri, minimum JavaScriptu",
  },
  {
    title: "Pripravené pre vyhľadávače",
    body: "Aby vás Google vedel správne zaradiť, musí web rozumieť. Štruktúra a metadáta sú súčasťou implementácie, nie príplatkom.",
    evidence: "Titulky, popisy, Open Graph, sitemap, robots.txt",
  },
  {
    title: "Použiteľné pre každého",
    body: "Web sa dá ovládať klávesnicou, čítačky obrazovky mu rozumejú a pri nastavení obmedzeného pohybu sa animácie vypnú.",
    evidence: "Sémantické HTML, viditeľný fokus, kontrast podľa WCAG 2.2 AA",
  },
]

export function Quality() {
  return (
    <Section id="kvalita" aria-labelledby="quality-heading">
      <Container>
        <Reveal>
          <SectionHeader
            eyebrow="Technická kvalita"
            headingId="quality-heading"
            title="Nielen pekný web. Aj správne postavený."
            lead="To, čo nevidno, rozhoduje o tom, či web funguje aj o rok. Nižšie je presne to, čo si na tejto stránke viete overiť sami."
          />
        </Reveal>

        <ul className="mt-14 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((benefit, index) => (
            <li key={benefit.title}>
              <Reveal delay={(index % 3) * 60}>
                <div className="flex items-center gap-2.5">
                  <Chevron className="h-1.5 shrink-0 text-brand" />
                  <h3 className="text-[1.0625rem] font-semibold tracking-[-0.014em]">
                    {benefit.title}
                  </h3>
                </div>
                <p className="mt-3 text-small text-pretty text-muted-foreground">
                  {benefit.body}
                </p>
                <p className="mt-3 border-t border-hairline pt-3 text-caption text-muted-foreground">
                  {benefit.evidence}
                </p>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  )
}
