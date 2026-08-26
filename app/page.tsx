import { Contact } from "@/components/site/contact"
import { Hero } from "@/components/site/hero"
import { Offer } from "@/components/site/offer"
import { ProcessTimeline } from "@/components/site/process-timeline"
import { Projects } from "@/components/site/projects"
import { Quality } from "@/components/site/quality"
import { Services } from "@/components/site/services"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { Team } from "@/components/site/team"
import { Transformation } from "@/components/site/transformation"
import { commercial, people, siteConfig } from "@/lib/site-config"

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
      minPrice: 699,
      description:
        "Východisková cena. Konečná cena závisí od rozsahu projektu.",
    },
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Služby",
    itemListElement: [
      "Firemné webstránky",
      "Landing pages",
      "Redizajn existujúcich webov",
      "Správa a rozvoj webu",
    ].map((service) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: service },
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
      <SiteHeader />
      <main id="hlavny-obsah">
        <Hero />
        <Offer />
        <Projects />
        <Services />
        <Transformation />
        <ProcessTimeline />
        <Team />
        <Quality />
        <Contact />
      </main>
      <SiteFooter />
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
