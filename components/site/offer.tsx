import { Container, Section } from "@/components/site/primitives"
import { Reveal } from "@/components/site/reveal"
import { Vertex } from "@/components/site/w-motif"
import { commercial } from "@/lib/site-config"

/**
 * Commercial clarity, deliberately high on the page.
 *
 * Price, delivery and response time are the three things an SME owner wants
 * before they read anything else. Burying them near the footer costs enquiries
 * from serious buyers and invites enquiries from people shopping on price
 * alone. The layout is intentionally quiet — a facts band, not another
 * eyebrow-headline-grid section.
 */

const FACTS = [
  {
    value: commercial.priceFrom,
    label: "Weby od",
    note: "Cena závisí od rozsahu, počtu stránok a integrácií. Presnú sumu povieme po konzultácii, nie až v zmluve.",
  },
  {
    value: `${commercial.firstProposalHours} h`,
    label: "Prvý návrh do",
    note: "Do troch dní vidíte konkrétny vizuálny smer, nie prezentáciu o tom, ako pracujeme.",
  },
  {
    value: `${commercial.typicalDeliveryDays} dní`,
    label: "Bežná firemná stránka",
    note: `Typický termín ${commercial.deliveryQualifier}. Pri rozsiahlejších projektoch termín dohodneme vopred.`,
  },
  {
    value: "0 €",
    label: "Konzultácia",
    note: "Bezplatne a nezáväzne. Ak vám vieme pomôcť, povieme ako. Ak nie, povieme aj to.",
  },
]

export function Offer() {
  return (
    <Section
      id="cennik"
      tone="surface"
      size="sm"
      aria-labelledby="offer-heading"
    >
      <Container>
        <h2 id="offer-heading" className="sr-only">
          Cena, termíny a podmienky spolupráce
        </h2>

        <dl className="grid gap-px border-y border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
          {FACTS.map((fact, index) => (
            <div
              key={fact.label}
              className="bg-surface py-8 sm:px-7 sm:first:pl-0 lg:[&:nth-child(4n+1)]:pl-0 lg:[&:nth-child(4n)]:pr-0"
            >
              <Reveal delay={index * 50}>
                <dt className="flex items-center gap-2 text-caption text-muted-foreground">
                  <Vertex className="h-1.5 text-brand" />
                  {fact.label}
                </dt>
                <dd>
                  <p className="mt-3 text-h3 tabular-nums">{fact.value}</p>
                  <p className="mt-3 text-small text-pretty text-muted-foreground">
                    {fact.note}
                  </p>
                </dd>
              </Reveal>
            </div>
          ))}
        </dl>
      </Container>
    </Section>
  )
}
