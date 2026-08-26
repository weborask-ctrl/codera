import { Logo } from "@/components/site/arc"
import { Container } from "@/components/site/primitives"
import { legal, mailtoHref, siteConfig, telHref } from "@/lib/site-config"

/**
 * The footer, deliberately small.
 *
 * The conversion scene directly above it already carries the contact details,
 * the price and the form. A four-column sitemap under that would be repeating
 * the page back at someone who has just finished reading it — and on a site
 * with three destinations there is nothing to map.
 *
 * What is left is the part that has to be here: who this is, what is honestly
 * true about the entity behind it, and the fact that the work shown is
 * concept work.
 */
export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-hairline">
      <Container>
        <div className="flex flex-col gap-8 py-10 sm:flex-row sm:items-start sm:justify-between sm:gap-12">
          <div>
            <Logo />
            <p className="mt-4 max-w-[22rem] text-small text-muted-foreground">
              Digitálne štúdio. Navrhujeme a vyvíjame weby pre firmy, ktorým
              prezentácia už nezodpovedá ich úrovni.
            </p>
          </div>

          <ul className="flex flex-col gap-2 text-small sm:items-end">
            <li>
              <a
                href={mailtoHref}
                className="rounded-sm transition-colors hover:text-brand"
              >
                {siteConfig.email}
              </a>
            </li>
            <li>
              <a
                href={telHref}
                className="rounded-sm transition-colors hover:text-brand"
              >
                {siteConfig.phone}
              </a>
            </li>
            <li className="text-muted-foreground">{siteConfig.market}</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3 border-t border-hairline py-7">
          {/* TODO(codera): once a trade licence or company exists, add the
              registration details here. Until then there is nothing truthful
              to publish, so nothing is claimed. */}
          <p className="max-w-[54rem] text-caption text-muted-foreground">
            {legal.note} Projekty Konštrukt, Vitalis a Forma sú ukážkové
            koncepty vytvorené štúdiom Codera — nejde o realizácie pre klientov
            a uvedené spoločnosti neexistujú.
          </p>
          <p className="label text-faint">
            © {year} {siteConfig.name}
          </p>
        </div>
      </Container>
    </footer>
  )
}
