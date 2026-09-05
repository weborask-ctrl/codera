/**
 * The five live demos as the /02 street shows them (Codera City).
 *
 * Every entry is a real, complete screenshot of the demo's own hero — nothing
 * cropped, nothing mocked (Ondrej: "tak ako reálne vyzerajú"). The skill name
 * is joined from `lib/skills` at render time so the roster never drifts.
 * The `line` describes the demo, not a client — these are studio concepts.
 */
export interface HomeDemo {
  slug: string
  title: string
  line: string
}

export const HOME_DEMOS: readonly HomeDemo[] = [
  {
    slug: "animacie-3d",
    title: "Observatórium",
    line: "Let k Saturnu viazaný na scroll — planéta, prstence a kamene v skutočnom 3D.",
  },
  {
    slug: "dizajn",
    title: "Kancelária",
    line: "Advokátska kancelária: editoriálna mriežka a bronzový paragraf, dôvera na prvý pohľad.",
  },
  {
    slug: "objednavky",
    title: "Pražiareň",
    line: "E-shop s kávou, kde za tri sekundy viete, čo kúpite a za koľko.",
  },
  {
    slug: "rezervacie",
    title: "Štúdio",
    line: "Rozvrh, voľné miesta a cena na jednej obrazovke telefónu.",
  },
  {
    slug: "wordpress",
    title: "WordPress",
    line: "Stránka, ktorú si klient upraví sám — živý editor priamo v ukážke.",
  },
] as const

export const demoShot = (slug: string, edit: "d" | "m") => `/home/demos/${slug}-${edit}.jpg`
