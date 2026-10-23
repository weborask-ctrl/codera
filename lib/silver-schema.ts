import { commercial, faq, packages, people, siteConfig } from './site-config'
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

/** The visible FAQ on the page, as structured data — one source, so the two never disagree. */
export const faqData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
}
