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
    "Navrhujeme a vyvíjame firemné webstránky, ktoré pôsobia dôveryhodne, načítajú sa rýchlo a vedú návštevníka k dopytu. Weby od 699 €, prvý návrh do 72 hodín.",
  /** The studio mailbox on its own domain (Websupport), set 2026-09-07. */
  email: "kontakt@codera.sk",
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
   * The entry price. 699 € → 1 000 € on 2026-08-31; set to 700 € by Ondrej on
   * 2026-09-07 together with the whole ladder (700 / 1 200 / 2 500 €).
   *
   * Every surface that mentions it derives from these three values — the
   * offer act, the mobile edit, the world, the conversion facts, the boards,
   * the structured data, the metadata description and the enquiry form's
   * budget bands. Before this was routed, the number was hard-coded in eight
   * places and a price change meant eight edits and a chance to miss one.
   */
  priceFrom: "699 €",
  /** The same figure as a number, for structured data and the count-up. */
  priceFromValue: 699,
  priceFromLabel: "Webové projekty od 699 €",
  /** The full sentence used wherever the price appears in running copy. */
  priceFromSentence:
    "Webové projekty od 699 € — presnú cenu dohodneme po konzultácii.",
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
 * The offer, as two packages authorized by Marcus on 2026-09-24.
 *
 * Two clear offers: professional company websites and scroll-led motion websites.
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
    id: "profesionalny",
    name: "Profesionálny web",
    audience: "Pre firmu, ktorá chce jasne predstaviť svoje služby a získať dôveru zákazníkov.",
    priceFrom: "699 €", priceFromValue: 699,
    scope: [
      "Vlastný vizuálny smer a prehľadná štruktúra obsahu",
      "Responzívne spracovanie pre mobil, tablet aj počítač",
      "Jasná cesta ku kontaktu a dopytu",
      "Základné SEO, rýchlosť a prístupnosť",
      "Príprava a spustenie hotového webu",
    ],
    notIncluded: "e-shop, rezervačný systém a platené externé služby",
  },
  {
    id: "motion",
    name: "Motion web",
    audience: "Pre značku, ktorá chce spojiť profesionálny web s výrazným vizuálnym zážitkom.",
    priceFrom: "1 199 €", priceFromValue: 1199,
    scope: [
      "Všetko z profesionálneho webu",
      "Vizuálny príbeh s pohybom naviazaným na scroll",
      "Plynulé prechody medzi obsahom a animáciou",
      "Samostatne doladené správanie na mobile",
      "Plnohodnotná verzia aj pri vypnutých animáciách",
    ],
    notIncluded: "e-shop, komplexné 3D aplikácie a platené externé služby",
  },
] as const

/** Care scope and first-month offer agreed with Marcus, 2026-10-04. */
export const coderaCare = {
  name: "Codera Care",
  price: "69 €",
  priceValue: 69,
  interval: "mesačne",
  headline: "O váš web sa staráme aj po spustení.",
  description: "Hosting, technická starostlivosť a drobné úpravy obsahu. Aby váš web zostal aktuálny.",
  trial: "Prvý mesiac zdarma.",
  trialStart: "Od ostrého spustenia webu.",
  hosting: "Hosting u nás je súčasťou Codera Care. Bez služby si zabezpečíte vlastný hosting.",
  scope: [
    "Hosting vášho webu u nás.",
    "Technická starostlivosť a drobné technické úpravy podľa potreby.",
    "Aktualizácia fotiek, textov, cenníka, kontaktov či otváracích hodín v existujúcom obsahu.",
  ],
  scopeNote: "Nové sekcie, funkcie a redizajn naceníme samostatne.",
} as const

/**
 * WordPress work (Ondrej, 2026-09-07): edits and care for sites that already
 * run on WordPress, offered beside the packages. No fixed price — the scope
 * decides, and the number is said after the consultation like every other.
 */
export const wordpressService = {
  name: "Úpravy WordPressu",
  line: "Máte web na WordPresse? Upravíme vzhľad aj obsah, zrýchlime ho a naučíme vás meniť si texty, fotky a novinky bez programátora.",
  scope: [
    "Úpravy vzhľadu a obsahu existujúcej stránky",
    "Redizajn alebo nová šablóna na WordPresse",
    "Rýchlosť, aktualizácie a zabezpečenie",
    "Zaškolenie do editora — ďalšie zmeny robíte sami",
  ],
  priceNote: "cena podľa rozsahu, po konzultácii",
  demo: "/ukazky/wordpress",
} as const

/**
 * The questions buyers actually type into Google before enquiring. Rendered
 * as a visible section on the page and as FAQPage structured data from this
 * one list: Google ignores (and may penalise) FAQ markup that the page does
 * not show (audit 2026-10-21).
 */
export const faq = [
  {
    question: "Koľko stojí firemná webstránka?",
    answer: `Weby staviame od ${commercial.priceFrom}. Konečná cena závisí od rozsahu, počtu stránok a integrácií — dohodneme ju po bezplatnej konzultácii.`,
  },
  {
    question: "Ako dlho trvá vytvorenie webu?",
    answer: `Prvý návrh vidíte do ${commercial.firstProposalHours} hodín. Bežná firemná stránka býva hotová spravidla do ${commercial.typicalDeliveryDays} dní ${commercial.deliveryQualifier}. Pri rozsiahlejších projektoch termín dohodneme vopred.`,
  },
  {
    question: "Čo potrebujete odo mňa na začiatku?",
    answer:
      "Základné informácie o firme, prístup k súčasnému webu a materiálom a predstavu o cieľoch. Zvyšok vyriešime počas konzultácie.",
  },
  {
    question: "Za ako dlho sa ozvete?",
    answer: `Na dopyt odpovedáme do ${commercial.responseHours} hodín. Konzultácia je bezplatná a nezáväzná.`,
  },
] as const

/**
 * Legal identification.
 *
 * Marcus Marinica's trade licence, supplied by Webora on 2026-10-23 (IČO and
 * VAT status) and checked against the Register of Legal Entities
 * (api.statistics.sk/rpo, source: Živnostenský register, established
 * 2026-10-08). Codera is a brand under this licence, not a company: never
 * write "s.r.o." or a different name. Change these only from the register.
 */
export const legal = {
  hasRegisteredEntity: true as boolean,
  operator: {
    /** Trade name exactly as in the trade register. */
    name: "Marcus Marinica",
    /** Miesto podnikania. */
    address: "Na brehu 43, 080 05 Prešov",
    ico: "57942153",
    registry: "Zapísaný v Živnostenskom registri Okresného úradu Prešov, č. 750-73389",
    /** Drives the "nie sme platitelia DPH" line. */
    vatPayer: false as boolean | null,
  },
  /** The date the published privacy policy and terms take effect (D. M. RRRR). */
  effectiveFrom: "23. 10. 2026",
  /** Shown in the footer of the older Next.js pages (404, demos). */
  note: "Codera · Marcus Marinica · IČO 57942153 · Na brehu 43, 080 05 Prešov. Nie sme platitelia DPH.",
} as const

/**
 * Commercial terms agreed with Webora on 2026-10-23 for the published
 * Obchodné podmienky. Revision counts and the hourly rate are Claude's
 * proposal from the 2026-10-21 audit, accepted with the rest.
 */
export const terms = {
  depositPercent: 30,
  finalPercent: 70,
  invoiceDueDays: 14,
  /** Days of silence after which a delivered design or build counts as approved. */
  tacitApprovalDays: 14,
  designRevisionRounds: 2,
  buildRevisionRounds: 1,
  hourlyRate: "45 €",
  warrantyDays: 30,
  /** Days within which a cancelled Care client receives the site's files. */
  handoverDays: 14,
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
