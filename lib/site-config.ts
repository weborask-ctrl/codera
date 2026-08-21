/**
 * Single source of truth for site-wide business facts.
 *
 * Everything here is verified information supplied by Webora. Nothing in this
 * file may be invented — in particular Webora has no registered company entity
 * yet, so there is deliberately no IČO, DIČ, VAT status or registered office.
 * See `legal` below.
 */

export const siteConfig = {
  name: "Webora",
  /** TODO(webora): confirm the production domain before launch. */
  url: "https://www.webora.sk",
  locale: "sk_SK",
  title: "Webora — tvorba firemných webstránok a redizajn webu",
  description:
    "Navrhujeme a vyvíjame firemné webstránky, ktoré pôsobia dôveryhodne, načítajú sa rýchlo a vedú návštevníka k dopytu. Weby od 699 €, prvý návrh do 72 hodín.",
  email: "webora.sk@gmail.com",
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
  priceFrom: "699 €",
  priceFromLabel: "Weby od 699 €",
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
 * Legal identification.
 *
 * Webora currently has no trade licence or registered company, so there is
 * nothing truthful to publish. Do not add IČO, DIČ, sídlo or "s.r.o." here
 * until the entity actually exists — an invented registry number on a live
 * site is a legal problem, not a cosmetic gap.
 */
export const legal = {
  hasRegisteredEntity: false,
  /** Shown in the footer instead of registry data. */
  note: "Webora je štúdio dvoch ľudí. Fakturačné údaje doplníme pri prvej objednávke.",
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

export const navItems: readonly NavItem[] = [
  { label: "Služby", href: "#sluzby" },
  { label: "Projekty", href: "#projekty" },
  { label: "Proces", href: "#proces" },
  { label: "O nás", href: "#o-nas" },
  { label: "Kontakt", href: "#kontakt" },
]

/**
 * One CTA concept for the whole page: "Nezáväzná konzultácia".
 * It points at the enquiry form rather than opening a mail client, so the
 * primary path is always the low-friction one.
 */
export const primaryCta = {
  label: "Nezáväzná konzultácia",
  href: "#kontakt",
} as const

export const mailtoHref = `mailto:${siteConfig.email}`
export const telHref = `tel:${siteConfig.phoneHref}`
