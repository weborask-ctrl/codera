/**
 * The concept case studies — Step 6 phase D.
 *
 * One entry per concept world in /03. These pages sell the DECISIONS, not the
 * pixels: an SMB owner reading one should recognise their own situation in
 * the brief and see that every visual choice traces back to a commercial
 * reason. Everything here describes FICTIONAL concept clients and says so —
 * nothing may read as a real engagement.
 *
 * Content model, not markup: the route renders these as calm documents (no
 * canvas, no pins, readable with scripting off — Step 6 contract).
 */

export interface CaseStudy {
  slug: string
  name: string
  sector: string
  mechanic: string
  /** The one-line verdict from /03, repeated as the page's thesis. */
  thesis: string
  /** The fictional brief — the situation an SMB owner should recognise. */
  brief: string
  /** Decision rows: what was decided, and the commercial reason why. */
  decisions: { what: string; why: string }[]
  /** The climate summary, honest about being a design system. */
  climate: { ground: string; type: string; density: string }
  /** What this concept proves about how Codera works. */
  proves: string
}

export const caseStudies: readonly CaseStudy[] = [
  {
    slug: "meridian",
    name: "Meridián",
    sector: "Pražiareň kávy s e-shopom",
    mechanic: "Predaj — do košíka",
    thesis:
      "Pôvod predáva skôr než popis — preto je hrdinom stránky zber na farme, nie obal ani slogan.",
    brief:
      "Malá pražiareň predáva skvelú kávu, ale jej web vyzerá ako blog: fotky zrniek, dlhé texty o vášni a košík schovaný v menu. Návštevník nevie za tri sekundy povedať, čo si môže kúpiť a za koľko. Veľkoobchodní odberatelia nenachádzajú podmienky.",
    decisions: [
      {
        what: "Prvá obrazovka je plnofarebný zber na farme — zelené lístie, červené čerešne, ruky — a cez ňu veľký serifový titulok.",
        why: "Každá pražiareň má fotky zrniek a vriec; máloktorá ukáže farmu, z ktorej káva naozaj je. Pôvod je najsilnejší dôkaz čerstvosti aj ceny.",
      },
      {
        what: "Košík s počítadlom je v hlavičke od prvého pixelu a pri hrdinskom produkte je cena aj tlačidlo Do košíka.",
        why: "Stránka je obchod. Ak sa to návštevník musí domýšľať, polovica odíde skôr, než to zistí.",
      },
      {
        what: "Pôvodové dáta — nadmorská výška, príprava, praženie — sú vysádzané monospace písmom ako technický záznam.",
        why: "Presné čísla hovoria „vieme, čo robíme“ lepšie než prívlastky. Kontrast serifového názvu a technického mona je celá značka.",
      },
      {
        what: "Expedičný pás v päte: pražíme utorok a piatok, odosielame do 24 hodín, doprava zdarma od 40 €.",
        why: "Pri potravine je čerstvosť námietka číslo jeden. Odpoveď patrí na stránku, nie do e-mailu.",
      },
    ],
    climate: {
      ground: "Kosť a umbra, prehĺbené listovou zeleňou a terakotovým CTA — podklad je vždy jemne pražený, nikdy biely.",
      type: "Editoriálna serifa pre pôvod, mono pre dáta.",
      density: "Veľkorysá: tri kávy na obrazovku, každá s veľkou farebnou fotografiou, ktorá nesie obraz.",
    },
    proves:
      "Že vieme postaviť predajný web, kde vizuál robí obchodnú prácu — a že „iný jazyk“ neznamená rozbiť disciplínu e-shopu.",
  },
  {
    slug: "statut",
    name: "Štatút",
    sector: "Advokátska kancelária",
    mechanic: "Dopyt — konzultácia",
    thesis: "Klient hľadá istotu, nie efekt — stránka mu ju dá hustotou a poriadkom.",
    brief:
      "Kancelária s dvadsaťročnou praxou má web z roku 2012: fotka budovy, tri odseky o tradícii a kontakt. Firemný klient s drahým problémom z neho nevyčíta, či kancelária rieši práve jeho typ sporu — a odchádza ku konkurencii, ktorá to povedať vie.",
    decisions: [
      {
        what: "Očíslovaný index oblastí praxe je prvé, čo návštevník vidí — päť riadkov s podtitulmi, žiadny slider.",
        why: "Klient v strese hľadá jedno: „riešia môj problém?“ Odpoveď musí byť skenovateľná za pár sekúnd.",
      },
      {
        what: "Fotografie len ako prostredie — knižnica, listiny, justícia — v jednotnom duotone atramentu a oxbloodu. Žiadne tváre.",
        why: "Stock advokáti v oblekoch dôveru znižujú — každý ich pozná a nikto im neverí. Miesto a záznamy hovoria za inštitúciu úprimnejšie než prenajaté úsmevy.",
      },
      {
        what: "Čísla v tabuľkovom reze: rok založenia, počet advokátov, jurisdikcie. Pás komory a poistenia v päte.",
        why: "Inštitúcia sa preukazuje záznamami, nie sloganmi. Presne zarovnané číslice sú tichý dôkaz poriadku.",
      },
      {
        what: "Pohyb je viazaný výhradne na scroll a ruku — pomalý parallax, odhalenia riadkov, čísla, ktoré sa narátajú raz.",
        why: "Kancelária, ktorá vyzerá ako product launch, stratí klienta na prvom obraze. Zdržanlivý pohyb je tu signál disciplíny, nie efekt.",
      },
    ],
    climate: {
      ground: "Chladný kameň a atrament, jeden oxblood akcent — maximálne dvakrát na obrazovku.",
      type: "Inštitucionálna serifa, tabuľkové číslice, kapitálky pre metadáta.",
      density: "Najhustejšia z trojice — hustota je tu signál kompetencie.",
    },
    proves:
      "Že „moderné“ vieme ohnúť podľa odvetvia: tu znamená súčasná inštitucionálnosť, nie kinematika. Rozsah nie je jedna šablóna v troch farbách.",
  },
  {
    slug: "vlna",
    name: "Vlna",
    sector: "Wellness a pohybové štúdio",
    mechanic: "Rezervácia — termín",
    thesis: "Rozvrh na prvej obrazovke — rozhodnutie padne skôr, než návštevník začne hľadať.",
    brief:
      "Štúdio s deviatimi lektormi má rozvrh v PDF a rezervácie cez správy na sociálnej sieti. Záujemca, ktorý sa rozhoduje večer v posteli, potrebuje tri veci: kedy je najbližšia lekcia, či je voľné miesto a koľko to stojí. Dnes nedostane ani jednu bez písania.",
    decisions: [
      {
        what: "Rozvrh JE hrdinská grafika: dnešné lekcie s časom, názvom a voľnými miestami, hneď pod titulkom „Začnite vo štvrtok.“",
        why: "Produkt štúdia sú termíny. Stránka, ktorá ich schováva za podstránku, predáva popis produktu namiesto produktu.",
      },
      {
        what: "Kapacita je priznaná pri každej lekcii — „2 miesta“, „voľné“, „1 miesto“.",
        why: "Skutočná obsadenosť vytvára naliehavosť bez trikov a zároveň šetrí sklamanie z plnej lekcie.",
      },
      {
        what: "Tri úrovne členstva v jednom páse, s jednorazovým vstupom ako prvým — a prvá lekcia za 6 € v päte.",
        why: "Nízky prah prvej návštevy je pri službách s návykom dôležitejší než optimalizácia ceny predplatného.",
      },
      {
        what: "Citrusový akcent smie kričať — jediný svet z trojice, kde áno.",
        why: "Energia je tu obsah, nie dekorácia. Rovnaká drzosť by advokátsku kanceláriu pochovala; tu predáva.",
      },
    ],
    climate: {
      ground: "Čiernobiela fotografia pohybu pod neónom — citrus a ružová nasadené sebavedomo.",
      type: "Široký grotesk, tesný a hlasný.",
      density: "Vzdušná — ale rozvrh je skutočná mriežka so skutočnými časmi.",
    },
    proves:
      "Že mobile-first myslíme vážne: celé rozhodnutie — lekcia, miesto, cena — sa odohrá na jednej obrazovke telefónu.",
  },
] as const

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug)
}
