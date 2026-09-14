import { Experience } from "@/components/experience"
import { commercial, packages, people, siteConfig } from "@/lib/site-config"

/**
 * Structured data.
 *
 * `ProfessionalService`, not `LocalBusiness`: Codera has no fixed public
 * address, and a LocalBusiness entry without one is both wrong and useless.
 * No aggregateRating, no review, no founding date, no registration — none of
 * that is known, and inventing it to feed a rich result is not an option.
 */
const structuredData = {
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
const faqData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      question: "Koľko stojí firemná webstránka?",
      answer: `Weby staviame od ${commercial.priceFrom}. Konečná cena závisí od rozsahu, počtu stránok a integrácií — poviete ju po bezplatnej konzultácii.`,
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

export default function Page() {
  return (
    <>
      {/* React hoists these into <head>. The hero plate is the LCP element
          in every edit; the file the viewport will pick is in flight with
          the CSS instead of after it. Only this page pays for them. */}
        <link
          rel="preload"
          as="image"
          type="image/avif"
          href="/home/m/hero-720.avif"
          imageSrcSet="/home/m/hero-720.avif 1x, /home/m/hero-1080.avif 2x"
          media="(max-width: 767px)"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="image"
          type="image/avif"
          href="/home/live/sky-1280.avif"
          imageSrcSet="/home/live/sky-1280.avif 1x, /home/live/sky-2560.avif 2x"
          media="(min-width: 768px)"
          fetchPriority="high"
        />
        {/* the cloud we arrive through is the first frame; it must not
            queue behind the city's layers */}
        <link
          rel="preload"
          as="image"
          type="image/avif"
          href="/home/live/cloud-puff-1x.avif"
          imageSrcSet="/home/live/cloud-puff-1x.avif 1x, /home/live/cloud-puff-2x.avif 2x"
          media="(min-width: 768px)"
          fetchPriority="high"
        />
      
      <Experience />
      {/* JSON-LD must reach the document as raw text; both payloads are local
          literals defined above, never user input. */}
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: see comment above.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: see comment above.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />
    </>
  )
}
