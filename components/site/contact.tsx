import { ArcTick } from "@/components/site/arc"
import { EnquiryForm } from "@/components/site/enquiry-form"
import { Container, Section } from "@/components/site/primitives"
import { Reveal } from "@/components/site/reveal"
import {
  commercial,
  mailtoHref,
  siteConfig,
  telHref,
} from "@/lib/site-config"

/**
 * Final conversion section: the form is the primary path, e-mail and phone
 * sit beside it for anyone who would rather not fill anything in.
 */

const ASSURANCES = [
  "Konzultácia je bezplatná a nezáväzná.",
  `Ozveme sa do ${commercial.responseHours} hodín.`,
  "Nevoláme opakovane a nepredávame po telefóne.",
]

export function Contact() {
  return (
    <Section id="kontakt" tone="surface" aria-labelledby="contact-heading">
      <Container>
        <div className="grid gap-14 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-20">
          <div>
            <Reveal>
              <p className="text-eyebrow text-brand uppercase">Kontakt</p>
            </Reveal>

            <h2 id="contact-heading" className="mt-5 text-h1 text-balance">
              <Reveal variant="wipe">
                <span className="block">Má váš web reprezentovať</span>
              </Reveal>
              <Reveal variant="wipe" delay={90}>
                <span className="block">firmu lepšie?</span>
              </Reveal>
            </h2>

            <Reveal delay={160}>
              <p className="mt-6 text-lead text-pretty text-muted-foreground">
                Napíšte pár viet o firme a o tom, čo potrebujete riešiť. Ozveme
                sa s návrhom ďalšieho kroku.
              </p>
            </Reveal>

            <Reveal delay={220}>
              <ul className="mt-8 flex flex-col gap-3">
                {ASSURANCES.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <ArcTick className="mt-2 h-1.5 shrink-0 text-brand" />
                    <span className="text-small text-muted-foreground">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={280}>
              <div className="mt-8 flex flex-col gap-2 border-t border-hairline pt-6 text-small">
                <a
                  href={mailtoHref}
                  className="rounded-sm font-medium text-foreground underline decoration-border-strong underline-offset-4 transition-colors hover:decoration-brand"
                >
                  {siteConfig.email}
                </a>
                <a
                  href={telHref}
                  className="rounded-sm font-medium text-foreground underline decoration-border-strong underline-offset-4 transition-colors hover:decoration-brand"
                >
                  {siteConfig.phone}
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={120}>
            <div className="rounded-[1.25rem] border border-hairline bg-background p-6 shadow-[var(--shadow-card)] sm:p-9">
              <EnquiryForm />
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  )
}
