import { Logo } from "@/components/site/logo"
import { Container } from "@/components/site/primitives"
import { legal, mailtoHref, siteConfig, telHref } from "@/lib/site-config"

const COLUMNS = [
  {
    heading: "Služby",
    links: [
      { label: "Firemné webstránky", href: "#sluzby" },
      { label: "Landing pages", href: "#sluzby" },
      { label: "Redizajn webu", href: "#sluzby" },
      { label: "Správa a rozvoj", href: "#sluzby" },
    ],
  },
  {
    heading: "Štúdio",
    links: [
      { label: "Projekty", href: "#projekty" },
      { label: "Proces", href: "#proces" },
      { label: "O nás", href: "#o-nas" },
      { label: "Technická kvalita", href: "#kvalita" },
    ],
  },
]

export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-hairline bg-background">
      <Container>
        <div className="grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[minmax(0,20rem)_repeat(3,minmax(0,1fr))] lg:gap-10 lg:py-20">
          <div>
            <Logo className="text-foreground" />
            <p className="mt-4 max-w-[18rem] text-small text-muted-foreground">
              Malý tím developerov a dizajnérov. Firemné webstránky a redizajny
              s dôrazom na dizajn, rýchlosť a technickú kvalitu.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h2 className="text-caption font-medium tracking-[0.06em] text-muted-foreground uppercase">
                {column.heading}
              </h2>
              <ul className="mt-4 flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="rounded-sm text-small text-foreground transition-colors hover:text-brand"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="text-caption font-medium tracking-[0.06em] text-muted-foreground uppercase">
              Kontakt
            </h2>
            <ul className="mt-4 flex flex-col gap-3 text-small">
              <li>
                <a
                  href={mailtoHref}
                  className="rounded-sm text-foreground transition-colors hover:text-brand"
                >
                  {siteConfig.email}
                </a>
              </li>
              <li>
                <a
                  href={telHref}
                  className="rounded-sm text-foreground transition-colors hover:text-brand"
                >
                  {siteConfig.phone}
                </a>
              </li>
              <li className="text-muted-foreground">{siteConfig.market}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-hairline py-8">
          {/* TODO(codera): once a trade licence or company exists, add the
              registration details here. Until then there is nothing truthful
              to publish, so nothing is claimed. */}
          <p className="max-w-[52rem] text-caption text-muted-foreground">
            {legal.note}
          </p>

          <p className="mt-4 max-w-[52rem] text-caption text-muted-foreground">
            Projekty Konštrukt, Vitalis a Forma sú ukážkové koncepty vytvorené
            štúdiom Codera. Nejde o realizácie pre klientov a uvedené
            spoločnosti neexistujú.
          </p>

          <p className="mt-6 text-caption text-muted-foreground">
            © {year} {siteConfig.name}
          </p>
        </div>
      </Container>
    </footer>
  )
}
