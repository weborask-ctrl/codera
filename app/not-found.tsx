import type { Metadata } from "next"

import { ButtonLink } from "@/components/site/button-link"
import { Container } from "@/components/site/primitives"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteNav } from "@/components/site/site-nav"

export const metadata: Metadata = {
  title: "Stránka sa nenašla",
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <>
      <SiteNav />
      <main id="hlavny-obsah">
        <Container>
          <div className="flex min-h-[60svh] max-w-[36rem] flex-col justify-center py-24">
            <p className="text-eyebrow text-brand uppercase">Chyba 404</p>
            <h1 className="mt-5 text-h1 text-balance">
              Táto stránka neexistuje.
            </h1>
            <p className="mt-5 text-lead text-pretty text-muted-foreground">
              Odkaz je pravdepodobne neplatný alebo sa obsah presunul.
              Skúste to z úvodnej stránky.
            </p>
            <div className="mt-8">
              <ButtonLink href="/" variant="brand" size="xl" className="rounded-full">
                Späť na úvod
              </ButtonLink>
            </div>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  )
}
