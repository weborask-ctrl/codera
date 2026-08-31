/**
 * The skills roster (AD v3 amendment 3): the showcase is organised around
 * CAPABILITIES, not invented brands. Each skill either has a live demo page
 * (`href`) or is honestly V PRÍPRAVE until its session builds it — never a
 * dead link, never a fake promise.
 */

export interface Skill {
  slug: string
  name: string
  /** What it means commercially, in one line an SMB owner feels. */
  line: string
  tags: string
  /** Which demo renders it, when live. */
  demo?: "objednavky" | "dizajn" | "rezervacie"
  ready: boolean
}

export const skills: readonly Skill[] = [
  {
    slug: "dizajn",
    name: "Dizajn",
    line: "Vizuálny systém, ktorý firmu odlíši — typografia, mriežka a poriadok, nie prefarbená šablóna.",
    tags: "ART DIRECTION · TYPOGRAFIA · EDITORIÁLNA MRIEŽKA",
    demo: "dizajn",
    ready: true,
  },
  {
    slug: "objednavky",
    name: "Objednávky",
    line: "Obchod, kde návštevník za tri sekundy vie, čo kúpi a za koľko — košík, ceny a expedícia bez trenia.",
    tags: "E-SHOP · KOŠÍK · PRODUKTOVÝ SYSTÉM",
    demo: "objednavky",
    ready: true,
  },
  {
    slug: "rezervacie",
    name: "Rezervácie",
    line: "Termín, voľné miesto a cena na jednej obrazovke telefónu — rozhodnutie padne skôr, než návštevník začne hľadať.",
    tags: "ROZVRH · KAPACITY · MOBILE-FIRST",
    demo: "rezervacie",
    ready: true,
  },
  {
    slug: "animacie-3d",
    name: "Animácie & 3D",
    line: "Pohyb viazaný na scroll a priestor s reálnou hĺbkou — presne to, na čom stojí táto stránka.",
    tags: "WEBGL · SCROLL CHOREOGRAFIA · POINTER FYZIKA",
    ready: false,
  },
  {
    slug: "vykon",
    name: "Výkon",
    line: "Rýchlosť sa nedá tvrdiť, dá sa len namerať — stránky, ktoré sa načítajú skôr, než návštevník stihne odísť.",
    tags: "CORE WEB VITALS · SEO · MERANÉ, NIE SĽUBOVANÉ",
    ready: false,
  },
] as const

export function getSkill(slug: string): Skill | undefined {
  return skills.find((s) => s.slug === slug)
}
