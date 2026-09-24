import { commercial, packages, people, siteConfig } from './site-config'
export const structuredData = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.url,
  email: siteConfig.email,
  telephone: siteConfig.phone,
  areaServed: { "@type": "Country", name: "Slovensko" },
  availableLanguage: ["sk"],
  founder: people.map((person) => ({
    "@type": "Person",
    name: person.name,
  })),
  makesOffer: {
    "@type": "Offer",
    name: "Tvorba firemných webstránok",
    priceSpecification: {
      "@type": "PriceSpecification",
      priceCurrency: "EUR",
      minPrice: commercial.priceFromValue,
      description:
        "Východisková cena. Konečná cena závisí od rozsahu projektu.",
    },
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Balíky",
    /* The real packages with their from-prices, from the same source the page
       renders — the catalogue must never disagree with the visible offer. */
    itemListElement: packages.map((pkg) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: `${pkg.name} — webstránka` },
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: "EUR",
        minPrice: pkg.priceFromValue,
      },
    })),
  },
}

/** Answers the questions buyers actually type into Google before enquiring. */
export const faqData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
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
  ].map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
}

