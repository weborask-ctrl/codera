/**
 * The six process steps.
 *
 * Written as risk reduction, not as a developer changelog: every step says
 * what we do, what we need from the client, and what they get at the end.
 * Durations are typical, never guaranteed — see `commercial.deliveryQualifier`.
 */

export type ProcessStep = {
  readonly index: string
  readonly title: string
  readonly summary: string
  readonly webora: string
  readonly client: string | null
  readonly output: string
  readonly duration: string
  /** Optional commercial promise surfaced on the step. */
  readonly highlight?: string
}

export const processSteps: readonly ProcessStep[] = [
  {
    index: "01",
    title: "Analýza",
    summary: "Zistíme, čo firma predáva, komu a čo jej dnes na webe chýba.",
    webora:
      "Prejdeme si vašu firmu, ponuku, konkurenciu a súčasný web. Hľadáme, kde návštevník stráca istotu a kde sa stráca dopyt.",
    client:
      "Základné informácie o firme, prístup k súčasnému webu a materiálom, predstavu o cieľoch.",
    output: "Zadanie a odporúčaný smer, na ktorom sa zhodneme.",
    duration: "1–2 dni",
  },
  {
    index: "02",
    title: "Smer",
    summary: "Ukážeme prvý reálny návrh, nie moodboard.",
    webora:
      "Pripravíme prvý vizuálny a štruktúrny smer — ako bude web vyzerať a ako bude vedený návštevník.",
    client: "Krátka spätná väzba, či ideme správnym smerom.",
    output: "Prvý konkrétny návrh, ktorý sa dá posúdiť.",
    duration: "do 72 hodín",
    highlight: "Prvý návrh do 72 hodín",
  },
  {
    index: "03",
    title: "Dizajn",
    summary: "Dotiahneme kľúčové stránky do finálnej podoby.",
    webora:
      "Navrhneme štruktúru kľúčových stránok, hierarchiu, typografiu, UI a správanie na mobile.",
    client: "Sústredená spätná väzba v jednom kole, nie po častiach.",
    output: "Odsúhlasený dizajn, podľa ktorého sa programuje.",
    duration: "2–4 dni podľa rozsahu",
  },
  {
    index: "04",
    title: "Vývoj",
    summary: "Z návrhu spravíme rýchly a responzívny web.",
    webora:
      "Naprogramujeme web vrátane responzívneho správania, interakcií, formulárov a SEO základu.",
    client: "Texty a obrazové podklady, ak ich ešte nemáme.",
    output: "Funkčný web pripravený na kontrolu.",
    duration: "niekoľko pracovných dní podľa zložitosti",
  },
  {
    index: "05",
    title: "Kontrola",
    summary: "Chyby hľadáme my, nie váš zákazník.",
    webora:
      "Testujeme mobil aj desktop, Chrome, Firefox a Safari, formuláre, interakcie, rýchlosť a technické chyby.",
    client: "Posledné pripomienky k obsahu.",
    output: "Web pripravený na spustenie.",
    duration: "1–2 dni",
  },
  {
    index: "06",
    title: "Spustenie",
    summary: "Web nasadíme a odovzdáme vám ho aj s vysvetlením.",
    webora:
      "Nasadíme web, pripojíme doménu, skontrolujeme nasadenú verziu a ukážeme vám, ako s webom pracovať.",
    client: "Prístup k doméne.",
    output: "Web online a vo vašich rukách.",
    duration: "v deň spustenia",
    highlight: "Bežná firemná stránka spravidla do 14 dní",
  },
]
