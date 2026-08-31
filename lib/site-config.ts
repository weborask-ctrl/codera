/**
 * Single source of truth for site-wide business facts.
 *
 * Everything here is verified information supplied by Codera. Nothing in this
 * file may be invented — in particular Codera has no registered company entity
 * yet, so there is deliberately no IČO, DIČ, VAT status or registered office.
 * See `legal` below.
 */

export const siteConfig = {
  name: "Codera",
  /**
   * The canonical origin. Every absolute URL on the site — canonical tags, the
   * sitemap, Open Graph — derives from this one value.
   *
   * `www`, not the apex, because that is what actually serves: Vercel holds
   * `www.codera.sk` as the primary and 308s `codera.sk` onto it. A canonical
   * pointing at the apex would name a URL that only ever redirects, which is
   * the one thing a canonical must not do.
   */
  url: "https://www.codera.sk",
  locale: "sk_SK",
  title: "Codera — tvorba firemných webstránok a redizajn webu",
  description:
    "Navrhujeme a vyvíjame firemné webstránky, ktoré pôsobia dôveryhodne, načítajú sa rýchlo a vedú návštevníka k dopytu. Weby od 1 000 €, prvý návrh do 72 hodín.",
  email: "coderaslovakia@gmail.com",
  phone: "+421 949 753 556",
  /** Digits only, for `tel:` links. */
  phoneHref: "+421949753556",
  market: "Slovensko",
} as const

/**
 * Commercial facts used across the page. Kept in one place so the price and
 * the delivery windows can never drift between sections.
 */
export const commercial = {
  /**
   * The entry price. Raised from 699 € on 2026-08-31.
   *
   * Every surface that mentions it derives from these three values — the
   * offer act, the mobile edit, the world, the conversion facts, the boards,
   * the structured data, the metadata description and the enquiry form's
   * budget bands. Before this was routed, the number was hard-coded in eight
   * places and a price change meant eight edits and a chance to miss one.
   */
  priceFrom: "1 000 €",
  /** The same figure as a number, for structured data and the count-up. */
  priceFromValue: 1000,
  priceFromLabel: "Webové projekty od 1 000 €",
  /** The full sentence used wherever the price appears in running copy. */
  priceFromSentence:
    "Webové projekty od 1 000 € — presnú cenu poviete po konzultácii.",
  firstProposalHours: 72,
  responseHours: 24,
  typicalDeliveryDays: 14,
  /**
   * The qualifier matters: 14 days is typical for a standard company website
   * once materials and scope are settled, not a blanket guarantee.
   */
  deliveryQualifier:
    "po dodaní podkladov a odsúhlasení rozsahu",
} as const

/**
 * The offer, as three packages.
 *
 * Ladder set 2026-08-31: the 1 000 € anchor is Codera's; the steps of roughly
 * 1.8× make each rung buy something the buyer can name, which is also what
 * stops the cheapest option from being the one nobody would rationally take.
 * Reasoning in `CODERA_STEP6_CONTENT.md` §6.
 *
 * `notIncluded` is not a disclaimer. It is the line that proves the price is a
 * real boundary rather than bait, and it is trust this studio can claim today —
 * unlike anything that would need a track record.
 *
 * Scope lines are OUTCOMES, never deliverable counts. Nothing here may be
 * called Premium, Pro or Business, and no package is visually pushed over the
 * others: the audit's ban on scarcity theatre covers pricing psychology too.
 */
export const packages = [
  {
    id: "vizitka",
    name: "Vizitka",
    audience: "Pre firmu, ktorá potrebuje jednu dôveryhodnú stránku.",
    priceFrom: "1 000 €",
    priceFromValue: 1000,
    scope: [
      "Jedna stránka so všetkým podstatným: čo robíte, pre koho a ako vás osloviť",
      "Vlastný vizuálny smer, nie prefarbená šablóna",
      "Funkčný formulár, mapa a telefón na jeden dotyk",
      "Rýchlosť a prístupnosť, ktorú ocení Google aj čítačka obrazovky",
      "Základné SEO: titulky, popisy, štruktúrované dáta, sitemap",
    ],
    notIncluded: "viac podstránok, blog ani e-shop",
  },
  {
    id: "firemny",
    name: "Firemný web",
    audience: "Pre firmu s viacerými službami, referenciami a pravidelnými novinkami.",
    priceFrom: "1 800 €",
    priceFromValue: 1800,
    scope: [
      "Až šesť podstránok: služby, referencie, o nás, kontakt",
      "Jedna sekcia, ktorú si spravujete sami — novinky alebo referencie",
      "Obsahová štruktúra postavená na to, čo ľudia naozaj hľadajú",
      "Formuláre s ochranou proti spamu a upozornením na e-mail",
      "Meranie: čo ľudia na stránke robia a odkiaľ prišli",
    ],
    notIncluded: "e-shop, rezervačný systém ani druhý jazyk",
  },
  {
    id: "5d",
    name: "5D web",
    audience: "Pre firmu, ktorá chce, aby si ju zapamätali.",
    priceFrom: "3 200 €",
    priceFromValue: 3200,
    scope: [
      "Vlastná art direction — stránka, ktorá nevyzerá ako žiadna iná",
      "Priestorová réžia: scény, kamera, materiály a pohyb viazaný na scroll",
      "Samostatne réžírovaná mobilná verzia, nie zmenšený desktop",
      "Plný zážitok tam, kde ho zariadenie unesie; plnohodnotná stránka všade inde",
      "Texty a dramaturgia celej cesty, nielen dizajn obrazoviek",
    ],
    notIncluded: "e-shop a napojenie na sklad alebo ERP",
  },
] as const

/**
 * Legal identification.
 *
 * Codera currently has no trade licence or registered company, so there is
 * nothing truthful to publish. Do not add IČO, DIČ, sídlo or "s.r.o." here
 * until the entity actually exists — an invented registry number on a live
 * site is a legal problem, not a cosmetic gap.
 */
export const legal = {
  hasRegisteredEntity: false,
  /** Shown in the footer instead of registry data. */
  note: "Codera je štúdio dvoch ľudí. Fakturačné údaje doplníme pri prvej objednávke.",
} as const

/**
 * No roles, biographies or years of experience: none of that is established,
 * and the public description is simply "tím developerov a dizajnérov".
 */
export const people = [{ name: "Peter Šichula" }, { name: "Marcus Marinica" }] as const

export type NavItem = {
  readonly label: string
  readonly href: string
}

/**
 * Three links, because the page is three destinations plus a hero.
 *
 * The old five-item nav described a page built from nine stacked sections.
 * This one describes the four scenes: the work, what we sell, and how to
 * start. Anything that used to have its own nav entry now lives inside one of
 * those, which is the point — a menu is a table of contents, and a table of
 * contents with five entries for a page you can read in four scrolls is
 * telling the visitor the page is longer than it is.
 */
export const navItems: readonly NavItem[] = [
  { label: "Práca", href: "#praca" },
  { label: "Služby", href: "#sluzby" },
  { label: "Kontakt", href: "#kontakt" },
]

/**
 * One CTA concept for the whole page: "Začať projekt".
 *
 * It points at the enquiry form rather than opening a mail client, so the
 * primary path is always the low-friction one. The label is an instruction,
 * not a description of a meeting — "nezáväzná konzultácia" was accurate and
 * completely inert, and the reassurance it was carrying now sits next to the
 * form where it actually reduces friction.
 */
export const primaryCta = {
  label: "Začať projekt",
  /**
   * The form itself, not the section that contains it. The conversion scene
   * opens with the reason to believe and the price, which is the right order
   * for someone still deciding — but a visitor who has already decided and
   * pressed the CTA should land on the fields, not read the argument again.
   */
  href: "#dopyt",
} as const

/** The one secondary action allowed alongside it. */
export const secondaryCta = {
  label: "Pozrieť prácu",
  href: "#praca",
} as const

export const mailtoHref = `mailto:${siteConfig.email}`
export const telHref = `tel:${siteConfig.phoneHref}`
