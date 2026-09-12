/**
 * The automatic Slovak → English translation of the WordPress demo.
 *
 * A multilingual WordPress (WPML, Polylang) keeps one content per language;
 * the automatic translation pre-fills the second language and the owner
 * checks it before publishing. This is that pre-fill for the fictional
 * bakery: a hand-written dictionary of the bakery's vocabulary, phrases
 * first, words second, capitalisation kept from the source. Words it does
 * not know stay as they are and are counted, so the editor can say
 * "skontrolujte". Nothing leaves the browser.
 */

/* whole sentences the demo starts with — translated by hand */
const SENTENCES: Record<string, string> = {
  "Pekáreň Kôrka": "Kôrka Bakery",
  "Chlieb, ktorý vonia už na ulici.": "Bread you can smell from the street.",
  "Kváskové pečivo každé ráno od šiestej. Bez zlepšovadiel, s trpezlivosťou.": "Sourdough baked every morning from six. No additives, just patience.",
  "Objednať na zajtra": "Order for tomorrow",
  "Kváskový chlieb": "Sourdough loaf",
  "Maslový croissant": "Butter croissant",
  "Kardamómová buchta": "Cardamom bun",
  "Od pondelka pečieme aj bezlepkový chlieb": "From Monday we also bake gluten-free bread",
  "Nová pec, nová múka z Liptova, rovnaký kvások. Príďte ochutnať.": "A new oven, new flour from Liptov, the same starter. Come and taste.",
  "Darčeková krabica pečiva": "Pastry gift box",
}

/* phrases and words, lower case; longer phrases win over shorter ones */
const DICT: Record<string, string> = {
  /* time */
  "od pondelka do piatku": "Monday to Friday",
  "každé ráno": "every morning",
  "každý deň": "every day",
  "cez deň": "during the day",
  "cez víkend": "at the weekend",
  "od šiestej": "from six",
  "od siedmej": "from seven",
  "od ôsmej": "from eight",
  "od deviatej": "from nine",
  "do šiestej": "until six",
  "do siedmej": "until seven",
  "do osemnástej": "until six pm",
  "od pondelka": "from Monday",
  "do piatku": "until Friday",
  "v pondelok": "on Monday",
  "v utorok": "on Tuesday",
  "v stredu": "on Wednesday",
  "vo štvrtok": "on Thursday",
  "v piatok": "on Friday",
  "v sobotu": "on Saturday",
  "v nedeľu": "on Sunday",
  "otváracie hodiny": "opening hours",
  pondelok: "Monday",
  utorok: "Tuesday",
  streda: "Wednesday",
  štvrtok: "Thursday",
  piatok: "Friday",
  sobota: "Saturday",
  nedeľa: "Sunday",
  sviatky: "holidays",
  dnes: "today",
  zajtra: "tomorrow",
  včera: "yesterday",
  teraz: "now",
  ráno: "morning",
  večer: "evening",
  poobede: "in the afternoon",
  hodina: "hour",
  hodiny: "hours",
  hodín: "hours",
  minút: "minutes",
  deň: "day",
  dni: "days",
  dní: "days",
  týždeň: "week",
  víkend: "weekend",
  mesiac: "month",
  rok: "year",
  roky: "years",
  rokov: "years",
  otvorené: "open",
  zatvorené: "closed",
  otvárame: "we open",
  zatvárame: "we close",
  /* the bakery */
  "z pece": "from the oven",
  "na pulte": "on the counter",
  "na pult": "on the counter",
  "už na ulici": "from the street",
  "na ulici": "on the street",
  "bez zlepšovadiel": "no additives",
  "s trpezlivosťou": "with patience",
  "s láskou": "with love",
  "pečieme naživo": "we bake live",
  "z liptova": "from Liptov",
  chlieb: "bread",
  chleba: "bread",
  chlebom: "bread",
  chlebu: "bread",
  chleby: "breads",
  pečivo: "pastry",
  pečiva: "pastry",
  pečivom: "pastry",
  rožok: "roll",
  rožky: "rolls",
  rožkov: "rolls",
  žemľa: "bun",
  žemle: "buns",
  buchta: "bun",
  buchty: "buns",
  koláč: "cake",
  koláče: "cakes",
  koláčov: "cakes",
  koláčik: "cookie",
  koláčiky: "cookies",
  sušienky: "cookies",
  torta: "cake",
  torty: "cakes",
  croissant: "croissant",
  croissanty: "croissants",
  bageta: "baguette",
  bagety: "baguettes",
  závin: "strudel",
  štrúdľa: "strudel",
  zákusok: "dessert",
  zákusky: "desserts",
  pagáč: "scone",
  pagáče: "scones",
  praclík: "pretzel",
  praclíky: "pretzels",
  škorica: "cinnamon",
  škoricový: "cinnamon",
  škoricová: "cinnamon",
  škoricové: "cinnamon",
  makový: "poppy seed",
  maková: "poppy seed",
  makové: "poppy seed",
  orechový: "walnut",
  orechová: "walnut",
  orechové: "walnut",
  tvarohový: "curd",
  tvarohová: "curd",
  tvarohové: "curd",
  jablkový: "apple",
  jablková: "apple",
  jablkové: "apple",
  čokoládový: "chocolate",
  čokoládová: "chocolate",
  čokoládové: "chocolate",
  čokoláda: "chocolate",
  vanilkový: "vanilla",
  vanilková: "vanilla",
  maslový: "butter",
  maslová: "butter",
  maslové: "butter",
  maslo: "butter",
  kváskový: "sourdough",
  kvásková: "sourdough",
  kváskové: "sourdough",
  kváskového: "sourdough",
  kváskových: "sourdough",
  kvások: "sourdough starter",
  kváskom: "starter",
  kardamómový: "cardamom",
  kardamómová: "cardamom",
  celozrnný: "wholegrain",
  celozrnná: "wholegrain",
  celozrnné: "wholegrain",
  ražný: "rye",
  ražná: "rye",
  ražné: "rye",
  špaldový: "spelt",
  špaldová: "spelt",
  pšeničný: "wheat",
  bezlepkový: "gluten-free",
  bezlepková: "gluten-free",
  bezlepkové: "gluten-free",
  vegánsky: "vegan",
  vegánska: "vegan",
  vegánske: "vegan",
  múka: "flour",
  múky: "flour",
  múkou: "flour",
  pec: "oven",
  pece: "oven",
  pekáreň: "bakery",
  pekárne: "bakery",
  pekárni: "bakery",
  pekár: "baker",
  pekári: "bakers",
  pekárka: "baker",
  pult: "counter",
  pulte: "counter",
  vonia: "smells",
  vôňa: "scent",
  chuť: "taste",
  ochutnať: "taste",
  ochutnajte: "taste",
  upečený: "baked",
  upečené: "baked",
  pečený: "baked",
  pečieme: "we bake",
  pečie: "bakes",
  napečieme: "we will bake",
  upečieme: "we will bake",
  kysne: "rises",
  raňajky: "breakfast",
  obed: "lunch",
  večera: "dinner",
  káva: "coffee",
  kávu: "coffee",
  čaj: "tea",
  mlieko: "milk",
  cukor: "sugar",
  soľ: "salt",
  voda: "water",
  med: "honey",
  orechy: "nuts",
  ovocie: "fruit",
  syr: "cheese",
  šunka: "ham",
  zlepšovadiel: "additives",
  zlepšovadlá: "additives",
  konzervanty: "preservatives",
  trpezlivosť: "patience",
  láska: "love",
  rodina: "family",
  rodinná: "family",
  rodinný: "family",
  tradícia: "tradition",
  recept: "recipe",
  recepty: "recipes",
  receptu: "recipe",
  ulica: "street",
  ulici: "street",
  mesto: "town",
  meste: "town",
  námestie: "square",
  námestí: "the square",
  "na námestí": "on the square",
  lásky: "love",
  remeslo: "craft",
  remeslu: "the craft",
  remesla: "the craft",
  "k remeslu": "for the craft",
  "z lásky": "out of love",
  /* the shop */
  "do košíka": "add to cart",
  "na objednávku": "to order",
  "na zajtra": "for tomorrow",
  "na dnes": "for today",
  "objednajte si": "order",
  "v ponuke": "on the menu",
  "o nás": "about us",
  "u nás": "at our place",
  "pre vás": "for you",
  "s vami": "with you",
  "otvorili sme": "we opened",
  obchod: "shop",
  predajňa: "shop",
  objednať: "order",
  objednávka: "order",
  objednávky: "orders",
  objednajte: "order",
  rezervovať: "book",
  rezervácia: "booking",
  rezervácie: "bookings",
  rezervujte: "book",
  stôl: "table",
  kúpiť: "buy",
  kúpte: "buy",
  košík: "cart",
  platba: "payment",
  doprava: "shipping",
  doručenie: "delivery",
  doručíme: "we deliver",
  rozvoz: "delivery",
  vyzdvihnutie: "pickup",
  zadarmo: "free",
  cena: "price",
  ceny: "prices",
  zľava: "discount",
  akcia: "offer",
  novinka: "news",
  novinky: "news",
  darček: "gift",
  darčeková: "gift",
  darčekový: "gift",
  darčekové: "gift",
  krabica: "box",
  krabice: "boxes",
  balíček: "package",
  poukážka: "voucher",
  kurz: "workshop",
  kurzy: "workshops",
  naživo: "live",
  ďakujeme: "thank you",
  vitajte: "welcome",
  príďte: "come",
  príď: "come",
  navštívte: "visit",
  nájdete: "you will find",
  napíšte: "write to us",
  zavolajte: "call us",
  kontakt: "contact",
  galéria: "gallery",
  fotky: "photos",
  ponuka: "menu",
  ponuke: "menu",
  tím: "team",
  spolu: "together",
  pozor: "note",
  prosím: "please",
  /* qualities */
  nový: "new",
  nová: "new",
  nové: "new",
  nových: "new",
  novú: "new",
  starý: "old",
  malý: "small",
  malá: "small",
  malé: "small",
  veľký: "big",
  veľká: "big",
  veľké: "big",
  dobrý: "good",
  dobrá: "good",
  dobré: "good",
  najlepší: "the best",
  najlepšia: "the best",
  najlepšie: "the best",
  čerstvý: "fresh",
  čerstvá: "fresh",
  čerstvé: "fresh",
  čerstvého: "fresh",
  teplý: "warm",
  teplá: "warm",
  teplé: "warm",
  domáci: "homemade",
  domáca: "homemade",
  domáce: "homemade",
  tradičný: "traditional",
  tradičná: "traditional",
  tradičné: "traditional",
  remeselný: "artisan",
  remeselná: "artisan",
  remeselné: "artisan",
  poctivý: "honest",
  poctivá: "honest",
  poctivé: "honest",
  ručne: "by hand",
  pravý: "real",
  pravá: "real",
  prírodný: "natural",
  prírodné: "natural",
  rovnaký: "the same",
  rovnaká: "the same",
  rovnaké: "the same",
  /* the small words */
  ktorý: "that",
  ktorá: "that",
  ktoré: "that",
  kto: "who",
  čo: "what",
  kde: "where",
  kedy: "when",
  ako: "how",
  prečo: "why",
  my: "we",
  vy: "you",
  vás: "you",
  vám: "you",
  nás: "us",
  nám: "us",
  náš: "our",
  naša: "our",
  naše: "our",
  našej: "our",
  našich: "our",
  váš: "your",
  vaša: "your",
  vaše: "your",
  vašej: "your",
  môj: "my",
  moja: "my",
  moje: "my",
  tento: "this",
  táto: "this",
  toto: "this",
  tu: "here",
  tam: "there",
  sem: "here",
  viac: "more",
  menej: "less",
  prvý: "first",
  prvá: "first",
  jeden: "one",
  jedna: "one",
  jedno: "one",
  dva: "two",
  dve: "two",
  tri: "three",
  štyri: "four",
  päť: "five",
  šesť: "six",
  sedem: "seven",
  všetko: "everything",
  všetci: "everyone",
  každý: "every",
  každá: "every",
  každé: "every",
  je: "is",
  sú: "are",
  som: "I am",
  sme: "we are",
  ste: "you are",
  bol: "was",
  bola: "was",
  bolo: "was",
  boli: "were",
  bude: "will be",
  budeme: "we will",
  má: "has",
  máme: "we have",
  máte: "you have",
  nie: "not",
  nič: "nothing",
  áno: "yes",
  aj: "also",
  tiež: "also",
  už: "already",
  ešte: "still",
  len: "only",
  iba: "only",
  veľmi: "very",
  vždy: "always",
  nikdy: "never",
  stále: "always",
  opäť: "again",
  a: "and",
  i: "and",
  alebo: "or",
  ale: "but",
  že: "that",
  keď: "when",
  lebo: "because",
  pretože: "because",
  preto: "so",
  tak: "so",
  aby: "so that",
  ak: "if",
  či: "whether",
  ani: "nor",
  s: "with",
  so: "with",
  z: "from",
  zo: "from",
  k: "to",
  ku: "to",
  o: "about",
  u: "at",
  do: "to",
  od: "from",
  pre: "for",
  pri: "at",
  po: "after",
  za: "for",
  bez: "without",
  cez: "through",
  medzi: "between",
  na: "on",
  v: "in",
  vo: "in",
}

const MAX_PHRASE = 4

interface Piece {
  lead: string
  core: string
  trail: string
}

function split(word: string): Piece {
  const m = /^([^\p{L}\p{N}]*)(.*?)([^\p{L}\p{N}]*)$/u.exec(word)
  return m ? { lead: m[1], core: m[2], trail: m[3] } : { lead: "", core: word, trail: "" }
}

function isUpper(ch: string): boolean {
  return ch !== "" && ch !== ch.toLowerCase()
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export interface Translation {
  text: string
  /** words the dictionary did not know — the owner should read those */
  unknown: number
}

export function translateInfo(sk: string): Translation {
  const src = sk.trim()
  if (src === "") {
    return { text: "", unknown: 0 }
  }
  const whole = SENTENCES[src]
  if (whole) {
    return { text: whole, unknown: 0 }
  }
  const chunks = src.split(/(\s+)/)
  const words: Piece[] = []
  const gaps: string[] = []
  for (let i = 0; i < chunks.length; i += 2) {
    words.push(split(chunks[i]))
    gaps.push(chunks[i + 1] ?? "")
  }
  const out: string[] = []
  let unknown = 0
  let i = 0
  while (i < words.length) {
    let taken = 0
    let hit: string | null = null
    for (let n = Math.min(MAX_PHRASE, words.length - i); n >= 1; n--) {
      /* a phrase cannot run across punctuation */
      let clean = true
      for (let j = 0; j < n - 1; j++) {
        if (words[i + j].trail !== "" || words[i + j + 1].lead !== "") {
          clean = false
          break
        }
      }
      if (!clean) {
        continue
      }
      const key = words
        .slice(i, i + n)
        .map((w) => w.core.toLowerCase())
        .join(" ")
      const v = DICT[key]
      if (v !== undefined) {
        hit = v
        taken = n
        break
      }
    }
    const first = words[i]
    if (hit !== null) {
      const last = words[i + taken - 1]
      out.push(first.lead + (isUpper(first.core.charAt(0)) ? cap(hit) : hit) + last.trail + gaps[i + taken - 1])
      i += taken
      continue
    }
    if (first.core !== "" && /\p{L}/u.test(first.core) && !isUpper(first.core.charAt(0))) {
      /* a lower-case word we do not know; capitalised ones are names and stay */
      unknown++
    }
    out.push(first.lead + first.core + first.trail + gaps[i])
    i++
  }
  return { text: out.join("").trim(), unknown }
}

export function translate(sk: string): string {
  return translateInfo(sk).text
}
