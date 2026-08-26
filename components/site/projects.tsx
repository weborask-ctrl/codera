import { BrowserFrame } from "@/components/site/device-frames"
import { FormaPreview } from "@/components/site/previews/forma"
import { KonstruktPreview } from "@/components/site/previews/konstrukt"
import { VitalisPreview } from "@/components/site/previews/vitalis"
import { Container, Section, SectionHeader } from "@/components/site/primitives"
import { Reveal } from "@/components/site/reveal"
import { IndexMark } from "@/components/site/w-motif"

/**
 * Selected work.
 *
 * Every entry carries a `kind`, so a real case study can be added to this
 * array later and render alongside the concepts without touching the layout.
 * Concepts stay labelled as concepts — the transparency is the point, and it
 * is worth more than a vague implication of client work.
 *
 * Each concept explains the commercial reasoning, not the palette: what the
 * business is up against, and what the design decision is supposed to do
 * about it.
 */

type Project = {
  id: string
  kind: "concept" | "case-study"
  index: string
  name: string
  sector: string
  url: string
  label: string
  problem: string
  direction: string
  reasoning: string
  preview: React.ReactNode
}

const PROJECTS: Project[] = [
  {
    id: "konstrukt",
    kind: "concept",
    index: "01",
    name: "Konštrukt",
    sector: "Stavebná spoločnosť",
    url: "konstrukt-koncept.sk",
    label:
      "Koncept webu pre stavebnú spoločnosť Konštrukt: tmavá stránka s veľkým nadpisom a jantárovým akcentom.",
    problem:
      "Stavebné firmy vyzerajú na webe zameniteľne. Investor porovnáva tri ponuky a nemá podľa čoho posúdiť, ktorá firma pracuje presne.",
    direction: "Tmavý, konštrukčný smer s jedným teplým akcentom.",
    reasoning:
      "Tmavá paleta a striktná mriežka zvyšujú vnímanú technickú presnosť a odlíšia firmu od konkurencie, ktorá používa rovnaké šablóny. Prebiehajúca stavba je hneď v úvode, aby investor videl referenciu skôr než cenník.",
    preview: <KonstruktPreview />,
  },
  {
    id: "vitalis",
    kind: "concept",
    index: "02",
    name: "Vitalis",
    sector: "Súkromná klinika",
    url: "vitalis-koncept.sk",
    label:
      "Koncept webu pre súkromnú kliniku Vitalis: svetlá stránka s panelom voľných termínov.",
    problem:
      "Pacient sa rozhoduje v neistote. Ak nevie, kedy sa dostane na rad a čo ho čaká, odloží to alebo zavolá inde.",
    direction: "Svetlý a pokojný smer s objednaním ako hlavným prvkom.",
    reasoning:
      "Voľné termíny sú viditeľné hneď v úvode, takže hlavná obava zmizne skôr, než pacient stihne odísť. Veľa priestoru a mäkký akcent znižujú napätie — v zdravotníctve je pokojný web súčasťou dôvery.",
    preview: <VitalisPreview />,
  },
  {
    id: "forma",
    kind: "concept",
    index: "03",
    name: "Forma",
    sector: "Interiérové štúdio",
    url: "forma-koncept.sk",
    label:
      "Koncept webu pre interiérové štúdio Forma: editoriálna stránka so serifovým nadpisom na teplom podklade.",
    problem:
      "Interiérové štúdiá predávajú vkus. Katalógový web ich zaraďuje medzi dodávateľov nábytku namiesto medzi autorov.",
    direction: "Editoriálny smer so serifovou sadzbou a vlasovými linkami.",
    reasoning:
      "Sadzba a rytmus časopisu presúvajú vnímanie z dodávateľa na autora, čo priamo ovplyvňuje, akú cenu je klient ochotný akceptovať. Realizácie sa čítajú ako obsah, nie ako produktový zoznam.",
    preview: <FormaPreview />,
  },
]

export function Projects() {
  return (
    <Section id="projekty" aria-labelledby="projects-heading">
      <Container>
        <Reveal>
          <SectionHeader
            eyebrow="Vybrané koncepty"
            headingId="projects-heading"
            title="Tri firmy, tri odlišné smery."
            lead="Codera je nové štúdio, preto neukazujeme cudzie logá. Ukazujeme, ako uvažujeme — čo je pre daný typ firmy obchodný problém a čo s ním dizajn robí."
          />
        </Reveal>

        <Reveal delay={80}>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-soft px-3.5 py-1.5 text-caption font-medium text-brand-strong">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-brand" />
            Ukážkové koncepty — nejde o realizácie pre klientov
          </p>
        </Reveal>

        {/* On large screens the cards pin and stack as you scroll; below that
            they simply flow, because a stack you cannot see the top of is
            just clutter. */}
        <div className="mt-14 flex flex-col gap-10 lg:mt-20 lg:gap-40">
          {PROJECTS.map((project, index) => (
            <Reveal
              key={project.id}
              className="lg:sticky"
              style={{
                top: `calc(6.5rem + ${index * 0.875}rem)`,
                zIndex: index + 1,
              }}
            >
              <article className="overflow-hidden rounded-[1.5rem] border border-hairline bg-card shadow-[var(--shadow-card)]">
                <div className="grid items-center gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-12 lg:p-10">
                  <div>
                    <div className="flex items-center gap-3">
                      <IndexMark value={project.index} />
                      <span className="rounded-full border border-hairline px-2 py-0.5 text-[0.6875rem] font-medium tracking-[0.06em] text-muted-foreground uppercase">
                        {project.kind === "concept" ? "Koncept" : "Realizácia"}
                      </span>
                    </div>

                    <h3 className="mt-4 text-h3">{project.name}</h3>
                    <p className="mt-1 text-small text-brand">
                      {project.sector}
                    </p>

                    <dl className="mt-6 flex flex-col gap-5">
                      <div>
                        <dt className="text-caption font-medium tracking-[0.06em] text-muted-foreground uppercase">
                          Obchodný problém
                        </dt>
                        <dd className="mt-2 text-small text-pretty text-muted-foreground">
                          {project.problem}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-caption font-medium tracking-[0.06em] text-muted-foreground uppercase">
                          Prečo takto
                        </dt>
                        <dd className="mt-2 text-small text-pretty">
                          {project.reasoning}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <BrowserFrame
                    url={project.url}
                    label={project.label}
                    ratio="16 / 10"
                  >
                    {project.preview}
                  </BrowserFrame>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  )
}
