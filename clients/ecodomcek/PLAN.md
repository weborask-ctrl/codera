# ECODOMCEK.SK — 5D redizajn: plán a stratégia

Klientský projekt Codery. Tento dokument je výstup fázy PLÁN — Design DNA,
referenčná mapa, zážitková architektúra, technická stratégia a fázovanie.
Nič z neho ešte nie je implementácia; implementácia začína až po schválení
plánu a po statických kompozíciách (pravidlo 14–15 Design Factory OS).

Stav: NÁVRH NA SCHVÁLENIE · Vytvorené: 2026-09-03 · Vetva:
`claude/ecodomcek-5d-redesign-40d4gh`

---

## 1. Zadanie

Redizajn `ecodomcek.sk`. Celá podstata stránky je **5D dizajn domu**: po
načítaní sa ukáže hotový dom postavený EcoDomčekom a scrollovaním
prechádzaš jednotlivými izbami; každá izba nesie jednu podstránku
(informácie zo súčasného webu). Inšpirácia od klienta: Matterport 3D
prehliadka (`my.matterport.com/show/?m=FywajUbFfCk`) — pocit „som vnútri
skutočného domu a plynulo sa ním posúvam".

**Kľúčový preklad inšpirácie:** Matterport je voľná prehliadka (užívateľ
riadi kameru sám, bez príbehu). Web nie je prehliadačka nehnuteľností —
web musí predávať. Preberáme z Matterportu POCIT (spojitý priestor, reálne
izby, „dollhouse" pohľad na celý dom), ale kameru vedieme MY: scroll =
autorská prechádzka domom s dramaturgiou, kde každá zastávka niečo
vysvetľuje a niečo predáva. Presne toto je lekcia z benchmarku (08 §10):
*„pomenuj, čo pohyb kamery VYSVETĽUJE — ak cesta nemapuje skutočný príbeh,
je to dekorácia."* Tu cesta mapuje skutočný produkt: dom, ktorý firma
stavia, izbu po izbe.

## 2. Čo vieme o klientovi (inventár obsahu)

Zdroj: vyhľadávanie (doména `ecodomcek.sk` je z tohto prostredia sieťovo
blokovaná — priamy crawl nebol možný; pozri Otvorené body §14).

- **Firma:** Eco Domček, s.r.o., Mgr. Roman Chovanec; založená 2017, tím
  s 10+ rokmi skúseností s montovanými drevostavbami.
- **Claim:** „ekologické a ekonomické stavby" — „nemontujeme kusy
  materiálu, pripravujeme vysnívaný domov".
- **Produkty/služby:** montované drevodomy (nízkoenergetické až pasívne),
  strechy, altánky, záhradné domčeky, drevníky a drobné hospodárske stavby.
- **Technológia (existujúce podstránky):** difúzne uzatvorená konštrukcia;
  kúrenie (kozub často stačí; plyn/elektrina, tepelné čerpadlá, solár);
  prírodné materiály, ochrana dreva bóraxovou soľou.
- **Portfólio:** projekty datované od ~2013 (`/projekt/…`, napr. „2013
  Lúčina — záhradný domček, drevník, chlievik").
- **Štruktúra súčasného webu:** Úvod · O spoločnosti · Technológia
  (podstránky) · Projekty · Blog/Novinky · Kontakt.

**Diera v inventári:** kvalita fotografií realizácií, presný cenník,
certifikáty a kompletný obsah podstránok — vyžaduje plný audit webu
a podklady od klienta (fáza 0).

## 3. Design DNA

| Os | Hodnota |
| --- | --- |
| Industry | rezidenčná drevostavba / eko-stavebníctvo (B2C) |
| Audience | rodiny 28–45 plánujúce dom; sekundárne chatári/záhradkári (menšie stavby) |
| Business model | zákazková výstavba; dopyt cez formulár/telefón |
| Primárna konverzia | nezáväzný dopyt / konzultácia („chcem takýto dom") |
| Sekundárne ciele | dôvera v technológiu; prehliadka realizácií; menšie stavby |
| Cenové pásmo | stredné až vyššie stredné (nie luxus, nie diskont) |
| Dôvera | vysoká — človek zveruje firme najväčšiu investíciu života |
| Osobnosť značky | poctivé remeslo, príroda, teplo domova, inžinierska istota |
| Emócia pri vstupe | „toto je môj budúci domov" (túžba + pokoj) |
| Emócia pri konverzii | istota („vedia, čo robia") |
| Obsah | reálne projekty, technologické vysvetlenia, blog |
| Vizuálna intenzita | stredná–vysoká v zážitku, pokojná v obsahu |
| Motion | storytelling tier (08 §1) — scroll-driven prechádzka je jadro produktu |
| Priorita zariadení | mobil ≥ 60 % návštev (odhad pre segment) — mobil je samostatná réžia |
| Technické obmedzenia | assety domu treba vyrobiť (3D model / render); fotky klienta neoverené |
| Prístupnosť | plná textová paralela; reduced-motion ako navrhnutý layout |

**Derivácia štýlu (DESIGN_DECISION_ENGINE):** R1 (vysoká dôvera) +
matica 03 „Construction / building" → industrial-architectural chassis
s warm-editorial vrstvou rozprávania o remesle; produkt je však DOMOV,
nie hala — preto primárna rodina **organic-natural (slnečný pól)**
s **industrial anotačnou vrstvou** ako sekundárnym zariadením. Vyhnúť sa:
dark-cinematic gloom, hravé radiusy, SaaS šablóna. Kontrola „swap probe":
moss/čap/anotácie na dome konkurencie by sedeli — vlastnícka ústava je
preto SAMOTNÝ DOM ako jediný svet stránky (nikto v segmente to nemá).

## 4. Referenčná mapa (povinná náležitosť — pravidlo 28)

Použité individuálne záznamy z `CODERA_DESIGN_REFERENCES/records/`
(kalibrované verdikty) + štýlové záznamy z
`CODERA_DESIGN_INTELLIGENCE/styles/`:

| Scéna / problém | Referencia | Extrahovaná mechanika | Adaptácia pre EcoDomček |
| --- | --- | --- | --- |
| Celý koncept „jeden svet" | `igloo.md` (LIKED) | JEDNO prostredie, akty = pozície kamery + zmeny svetla; mono anotácie ako inžinierska vrstva; svetlý monochróm, nie tma | Jeden dom, izby = akty; anotácie = kóty, skladba steny, U-hodnoty; svetlo dňa namiesto mrazu — „slnečný drevodom" |
| Kamera rozpráva proces | `chartogne.md` (PENDING verdikt) + 08 §10 (Cula) | kamera prechádza svetom, lebo PRODUKT je proces | kamera prechádza domom, lebo produkt JE dom; každá izba vysvetľuje jednu kompetenciu firmy |
| Architektúra scrollu | 08 §8–§11 (Refokus/Arqitel/Cula štúdia) | fixný svet za natívne scrollujúcimi 100vh DOM sekciami; ŽIADNE piny na stovky vh; scrub 1:1 | ~9 beatov ≈ 1 viewport na beat; text v DOM nad svetom; natívna fyzika scrollu (zákon č. 1 CLAUDE.md) |
| Bake vs. realtime | 08 §9 (Arqitel case study) | drahá scenéria sa PEČIE (pre-render, scroll-scrub video); realtime len pre to, čo musí reagovať | interiéry domu = pre-renderované sekvencie; realtime max. jeden ľahký hero objekt (model domu v dollhouse pohľade) |
| Typografia nad svetom | `exoape.md` (LIKED) | ľahká váha displeja vo veľkom, plná čitateľnosť nad svetom, teplý súmrak namiesto #000, pomalé dissolvy | ľahký display nad interiérmi; prechody izieb ako mäkké dissolvy/prejazdy, nie strihy |
| Rytmus obsahu | `refokus.md` (LIKED) | každý beat = iný DRUH obsahu, nie iný efekt; farba len vo „worku" | izby sa striedajú: emócia (obývačka) → technika (rez stenou) → dôkaz (projekty) → akcia (kontakt) |
| 3D ako demo produktu | `lusion.md` (LIKED) | 3D stage vsadený do pokojného chrómu; vstup mapovaný na pohyb okamžite | dom nie je pozadie-dekorácia, je to exponát; UI okolo ostáva tiché |
| Hustota = dôveryhodnosť | `basement.md` (LIKED) | hustota REÁLNEHO obsahu ako motor kredibility | pás realizácií s rokmi (2013→dnes), skutočné parametre stavieb; nič vymyslené |
| Objekt vpletený do typografie | `noomo.md` (LIKED) | 3D objekt medzi literami, 3D ako materiál layoutu | dollhouse model domu prepletený s nadpisom v hero/prechodoch |
| Svet dýchajúci medzi typom | `zentry.md` (LIKED) | scroll letí kapitolami, objekt je hrdina | prevziať let kapitolami; ODMIETAME neon-na-čiernej tonalitu |
| Disciplína jedného sveta | `activetheory.md` (LIKED) | presvedčenie jedného sveta, malé inžinierske UI | ODMIETAME nečitateľnosť ponuky — rodina musí ponuku prečítať na prvý prechod |
| Štýlová rodina | `styles/organic-natural.md` | slnečný pól: teplý papier, mach/šalvia/hlina, JEDNA jantárová ihla pre CTA; tempo vetra | presne sedí na eko-drevostavbu; „greenwash test" prejde — firma reálne stavia z dreva |
| Anotačná vrstva | `styles/industrial-architectural.md` | specimen-labels, kóty, tabuľky ako ozdoba i dôkaz; 0–2px hrany | technické popisky v izbách; rez konštrukciou ako blueprint moment |
| Obsahové pásma | `styles/warm-editorial.md` | krémový kánon, biela ako elevácia, jeden tmavý akt | čitateľské pásma (blog, detail projektu) mimo 3D sveta |

REFUSE naprieč setom: Matterport free-roam ako primárna navigácia
(stráca príbeh aj konverziu — ostáva ako voliteľný bonus), zvuková
vrstva, temný svet, toy-like materiály, logo-wall, akýkoľvek syntetický
smooth-scroll.

## 5. Zážitková architektúra — „Prechádzka domom"

Jeden spojitý svet: skutočný typový dom EcoDomčeka (ideálne digitálne
dvojča reálnej realizácie). Scroll vedie kameru domom; každá izba je
jeden akt ≈ jeden viewport scrollu s držaným záberom (staticky
komponovaný „shot" — pravidlo static-frame). DOM text scrolluje NAD
svetom, svet sa interpoluje pod ním.

```
BEAT 0  NAČÍTANIE — EXTERIÉR
        Hotový dom v záhrade, ranné slnko, dym z komína. Headline +
        jedna veta prísľubu + CTA „Prejsť si dom". Loading = svitanie
        (svetlo vychádza, dom sa „rozsvieti") — žiadny spinner.

BEAT 1  PRÍCHOD → DVERE                    [podstránka: O spoločnosti]
        Kamera prichádza chodníkom k vchodu. Kto sme, od kedy staviame,
        koľko realizácií. Anotácie: rok založenia, roky skúseností.

BEAT 2  ZÁDVERIE / CHODBA                  [podstránka: Ako staviame]
        Prah domu — moment prekročenia. Prehľad procesu: návrh →
        výroba → montáž → odovzdanie (4 kroky ako kóty na stene).

BEAT 3  OBÝVAČKA S KOZUBOM                 [podstránka: Kúrenie]
        Najsilnejší emočný záber: oheň, drevo, teplo. Obsah kúrenia
        (kozub často stačí; TČ, solár…). Svetlo aktu: teplé.

BEAT 4  REZ STENOU — „RÖNTGEN"             [podstránka: Konštrukcia]
        Kamera sa otočí k stene, stena sa otvorí vrstvičku po vrstve
        (blueprint moment): difúzne uzatvorená skladba, bórax, izolácie,
        U-hodnoty. Industrial anotácie v plnej sile. Toto je „wow"
        s obsahom — technologická dôvera.

BEAT 5  KUCHYŇA / SPÁLŇA                   [podstránka: Zdravé bývanie]
        Prírodné materiály, vnútorná klíma, nízkoenergetický štandard.
        Pokojný, obytný záber; mikro-parallax za oknom.

BEAT 6  OKNO → ZÁHRADA                     [podstránka: Záhradné stavby]
        Kamera vyjde oknom/terasou do záhrady: altánok, záhradný
        domček, drevník ako vedľajšie objekty na pozemku. Menší
        sortiment dostane vlastný „mini-svet" bez opustenia sveta.

BEAT 7  ZÁHRADA → PORTFÓLIO                [podstránka: Projekty]
        Zo záhrady sa záber nadvihne (dollhouse/vtáčia perspektíva)
        a dom sa zaradí do pásu ďalších realizácií: horizontálny pás
        kariet skutočných projektov s rokom a parametrami. Vstup do
        detailu projektu = klasická čitateľská stránka.

BEAT 8  SÚMRAK — KONTAKT                   [podstránka: Kontakt/Dopyt]
        Vraciame sa pred dom, svieti sa v oknách, večer. „Postavme váš."
        Dopytový formulár + telefón/e-mail (tap-to-call). Slnko zapadá
        = dramaturgický oblúk dňa uzavretý (svitanie → súmrak).
```

**Navigácia mimo scrollu:** stála mini-mapa domu (pôdorys/dollhouse
ikona) v rohu — klik na izbu = presun na beat; horná navigácia s názvami
podstránok skroluje na príslušný akt a zároveň existujú deep-linky
(`/technologia`, `/projekty`…) pre SEO a priame vstupy. End/Home,
scrollbar a kotvy fungujú vždy (žiadne pasce — 08 §4).

**Čitateľské stránky mimo sveta:** detail projektu, blog, cenník
a právne stránky sú klasické dokumenty (warm-editorial pásma), čitateľné
bez JS — rovnaký princíp ako case-study stránky Codery.

**Voliteľný bonus (fáza 2+):** „Voľná prehliadka" — tlačidlo v Beate 7,
ktoré otvorí skutočný Matterport embed reálnej realizácie, ak ho klient
má/objedná. Autorská prechádzka predáva, Matterport dokazuje.

### 5b. Aktualizácia po fáze 0 (2. dávka screenshotov, 2026-09-03)

Skutočná ponuka má 12 položiek (CONTENT_INVENTORY.md §3) a je širšia,
než plán predpokladal: okrem domu na kľúč aj strechy, altánky, terasy,
garáže/carporty, sadrokartóny, obklady, renovácie, maľovanie,
zateplenie, interiéry, konzultácie a nákup materiálu. Dom to unesie —
každá služba má v dome svoje fyzické miesto, takže **izby nesú remeslá**:

| Beat | Miesto v dome | Podstránka / služby, ktoré nesie |
| --- | --- | --- |
| 0 | exteriér, ráno | (Drevo)domy na kľúč — prísľub; logo-hračka EKO-LOGICKÉ / EKO-NOMICKÉ ako dvojica argumentov |
| 1 | príchod, fasáda | Obklady (rhombus, tatranský profil, thermo drevo) + Strechy — kamera prejde popri fasáde a pod strechou; anotácie: profil, krytina |
| 2 | zádverie | O nás — „remeslo od 2007, firma od 2017" (po potvrdení), 4 hodnotové dlaždice, Konzultácie zadarmo |
| 3 | obývačka s kozubom | Kúrenie + Interiéry („podsvietený sprchový kút, hojdačka z 2. poschodia") |
| 4 | rez stenou | Konštrukcia (difúzne otvorená/uzatvorená — vyjasniť) + Zateplenie + Sadrokartóny — vrstvy sa otvárajú zvonku dnu: obklad → izolácia → nosná konštrukcia → sadrokartón → maľovanie |
| 5 | kuchyňa / spálňa | Zdravé bývanie, prírodné materiály, bórax („Soľ nad zlato") + Renovácie ako „čo vieme zmeniť v existujúcom dome" |
| 6 | terasa → záhrada | Terasy + Altánky + Garáže/carporty — kamera vyjde presklením na terasu (Bungalov v Prešove má presne túto situáciu) |
| 7 | vtáčia perspektíva | Realizácie — feed skutočných projektov 2013→2024 s ich vlastnými textami („spáchali sme milý bungalov") |
| 8 | večer pred domom | Kontakt — „Volajte kedykoľvek ;)", tap-to-call, Zoženieme/zobchodujeme ako posledný argument |

**Hrdinský dom — odporúčanie:** *Moderný dizajnový dom (2024)* —
smrekovcový rhombus obklad + Fundermax, drevo je na ňom VIDIEŤ, čo
je pre drevostavbu najsilnejší argument. Záloha: *Bungalov v Prešove
(2021)* — jednopodlažný, jednoduchšia kamera, prirodzený prechod
terasa → záhrada. Obidva potrebujú pôdorys a interiérové fotky.

**Spresnenie Design DNA (§3):** osobnosť značky nie je „inžinierska
istota" v tóne, ale **remeselník, ktorý vie a nehrá sa na pána** —
presnosť žije v anotačnej vrstve (kóty, skladby, U-hodnoty), ľudskosť
a humor v texte. Copy súčasného webu sa zachová v duchu, nie prepíše
do agentúrnej slovenčiny. Existujúca zemitá paleta loga (hnedá ·
piesková · zelená) potvrdzuje organic-natural smer; oranžová z šablóny
sa nepreberá.

## 6. Kľúčové technické rozhodnutie: pečený svet, nie realtime bitka

Lekcia benchmarku (08 §9 — Arqitel je scroll-scrubované VIDEO z C4D;
Cula po rokoch optimalizácií skončila pri pre-renderovaných videách):

**Odporúčaná architektúra — hybrid:**

1. **Interiérové prejazdy = pre-renderované sekvencie** (Blender Cycles
   render kamerovej dráhy domom → scroll-scrub, ideálne ako sekvencia
   snímok/kodek s presným seekom). Deterministická kvalita na každom
   zariadení, fotorealistické drevo a svetlo, triviálny mobilný fallback.
2. **Realtime R3F len pre to, čo reaguje:** dollhouse model domu
   v Beate 0/7 a mini-mape (pointer-tilt, hover izieb) — jeden ľahký
   glTF (< 2 MB, baked lighting), žiadne realtime interiéry.
3. **DOM nesie všetok text** (crisp, selektovateľný, SEO) — svet nikdy
   nerenderuje typografiu (08 §13).
4. **GSAP + ScrollTrigger je jediný motor animácií**; R3F len renderuje.
   Žiadny Lenis/ScrollSmoother — natívny scroll, svet interpoluje.
5. **Výkonové tiery:** plný svet (desktop, dobrý HW) → redukovaný svet
   (mobil: ľahšie sekvencie, kratšie prejazdy) → statická kompozícia
   (reduced-motion / slabý HW / no-JS: séria komponovaných záberov izieb
   s plným obsahom — navrhnutý layout, nie fallback).

**Produkčný predpoklad (kritická cesta):** potrebujeme 3D model domu.
Možnosti: (a) digitálne dvojča reálnej realizácie klienta podľa fotiek
a výkresov — najsilnejšie, lebo „tento dom naozaj stojí"; (b) typový dom
z katalógu klienta. Modelovanie + materiály + svetlo = najväčšia
assetová položka projektu (pozri Fázy a Riziká).

## 7. Vizuálny smer (zhrnutie pre art direction dokument)

- **Canvas:** slnečný pól organic-natural — teplý papier (#f5f1e4
  trieda) pre obsahové vrstvy; svet sám je „canvas" interiérov. Nie
  tmavý web; tma existuje len ako večerný akt kontaktu (dramaturgia
  svetla = dramaturgia dňa).
- **Farby:** vzorkované z reálneho materiálu — smrek/dub, mach, hlina,
  ľan; JEDNA jantárová/medová akcentová farba výhradne pre CTA (ihla
  kompasu, Felt princíp). Žiadna dúha sekcií.
- **Typografia:** ľahká groteska pre display vo veľkých rezoch (exoape
  princíp: istota ľahkosťou), mono pre anotácie/kóty (igloo princíp);
  telo ≥ 16 px, slovenská diakritika overená. Serif nezavádzame — teplo
  dodáva drevo a svetlo, nie písmo.
- **Obraznosť:** JEDNA gramatika — rendery sveta + reálne fotografie
  realizácií v projektovom páse (denné svetlo, frontálne, poctivé).
  Miešanie gramatík v jednej mriežke zakázané (10 §7). Žiadne stockové
  rodinky.
- **Komponenty:** 0–4px hrany (stavebná reč), hairline pravidlá, tabuľky
  parametrov ako plnohodnotný obsah; formulár veľký, pokojný, s jasnými
  labelmi.
- **Anotačná vrstva:** kóty, materiálové štítky, U-hodnoty, roky —
  jednotný mono systém cez celý svet (podpis dizajnu, zároveň dôkaz
  kompetencie).

## 8. Mobil — samostatná réžia (nie zmenšený desktop)

- Žiadne piny a dlhé scruby; príbeh sa rozpráva **vertikálnym swipe
  rytmom**: každá izba = celoobrazovkový komponovaný záber (statický
  render s jemným parallaxom/dýchaním) + obsahová karta pod ním.
- Mini-mapa domu ako bottom-sheet; tap-to-call ako primárna akcia
  v kontakte (služobná firma!).
- Portrétové art-direction renderov (izby komponované nanovo pre 9:16,
  nie center-crop desktopu).
- svh jednotky, telo ≥ 16 px, ciele ≥ 44 px, LCP < 2,5 s na strednom
  Androide — sekvencie sa na mobile servujú v malých variantoch.

## 9. Prístupnosť a reduced-motion

- `prefers-reduced-motion`: dom ako séria statických záberov izieb
  s plným textom — informačná parita, vlastný navrhnutý layout.
- Každý textový stav: ENTER → PLNE ČITATEĽNÝ HOLD → EXIT; nič nežije
  v nízkej opacite.
- Sémantická štruktúra podstránok existuje v DOM aj pre čítačky a SEO
  (svet je vizuálna vrstva nad dokumentom, nie náhrada dokumentu).

## 10. Obsahová stratégia

- Všetok faktický obsah pochádza zo súčasného webu a od klienta —
  o firme nič nevymýšľame (zákon č. 3): žiadne vymyslené počty
  realizácií, certifikáty ani referencie. Chýbajúce čísla = otvorený
  bod pre klienta, nie odhad.
- Texty podstránok sa preštylizujú do rytmu beatov (1 myšlienka na
  viewport), dlhé technické texty ostávajú na čitateľských stránkach.
- Blog ostáva (SEO aktívum), dostane warm-editorial šat.
- Meta/OG/structured data: LocalBusiness + produktové stránky stavieb.

## 11. Fázy a míľniky

| Fáza | Výstup | Validácia |
| --- | --- | --- |
| 0 · Audit & podklady | plný crawl webu (mimo blokácie), fotky, výkresy, cenník, výber referenčného domu | inventár schválený klientom |
| 1 · Plán (tento dokument) + Art direction | AD dokument s tokenmi (farby, typo, anotačný systém), reference map | schválenie Ondrej/klient |
| 2 · Statické kompozície | 9 beatov desktop + mobil ako stills (Figma/rendre), static-frame test, side-by-side s referenciami (pravidlo 17) | schválenie pred kódom |
| 3 · Asset pipeline | 3D model domu, materiály, kamerová dráha, testovací render jednej izby | render prejde vizuálnym porovnaním s fotkou realizácie |
| 4 · Svet + scroll | Next.js skeleton, scrub infra, beaty 0–8, mini-mapa, deep-linky | LOCAL (`npm run verify`) + PREVIEW |
| 5 · Obsah + čitateľské stránky | podstránky, projekty, blog, formulár | PREVIEW |
| 6 · Mobil réžia + reduced-motion | samostatné mobilné kompozície, fallbacky | DEVICE (reálny iPhone + stredný Android) |
| 7 · Výkon & QA | LCP/CLS rozpočty, throttle testy, prístupnosť, smoke | CI + DEVICE |
| 8 · Launch | DNS, redirecty starých URL (SEO!), analytika | PREVIEW → produkcia |

Poradie je záväzné: žiadna implementácia sveta pred schválením
statických kompozícií (pravidlo 15 — ak stills nevyzerajú, nekódujú sa).

## 12. Riziká

1. **3D model domu neexistuje** — najdrahší asset; mitigácia: začať
   jednou izbou (obývačka s kozubom) ako proof, až potom celý dom.
2. **Kvalita fotiek realizácií neznáma** — ak sú slabé, projektový pás
   sa stavia na renderoch + malých fotografiách, nie fullbleed.
3. **Scroll-scrub sekvencie a váha stránky** — rozpočet: ≤ 4–6 MB
   kritickej cesty na desktope, tiered loading, sekvencie lazy po
   beatoch; mobil dostáva ľahšie varianty.
4. **Preklopenie SEO** — súčasné URL (`/technologia/...`, `/projekt/...`)
   musia mať 301 mapu; podstránky ostávajú indexovateľné dokumenty.
5. **Doména blokovaná v tomto prostredí** — plný obsahový audit vyžaduje
   whitelist alebo export od klienta.

## 13. Kritériá kvality (pred vyhlásením hotovo)

- Static-frame test na každom beate; side-by-side proti `igloo`,
  `exoape`, Arqitel/Cula záberom — kompozícia musí obstáť (pravidlo 17).
- Vstup okamžitý na wheel/trackpad/touch/klávesnici; žiadny pin
  nepožiera End/Home/scrollbar.
- Každý beat = zmysluplný obsah podstránky, nie efekt (scroll economy).
- Range test: vedľa Codery a jej konceptov musí EcoDomček vyzerať ako
  iný svet (slnečné drevo vs. frost monochróm) — pravidlo 32.
- Validačné triedy sa vykazujú menovite (LOCAL/CI/PREVIEW/DEVICE).

## 14. Otvorené body pre klienta

1. Ktorá realizácia bude „hrdinský dom"? (fotky + pôdorys/výkresy)
2. Existujú profesionálne fotografie realizácií? Ochota dofotiť?
3. Cenník/orientačné ceny — verejné áno/nie?
4. Certifikáty, členstvá, reálne čísla (počet stavieb) na dôverovú vrstvu.
5. Chce klient aj skutočný Matterport sken realizácie ako bonus v Beate 7?
6. Rozsah: ostáva blog? Kto ho bude plniť?

---

## Design Evidence Report (pravidlo 29)

- **Individuálne záznamy použité:** `igloo.md`, `exoape.md`,
  `refokus.md`, `lusion.md`, `basement.md`, `noomo.md`, `zentry.md`,
  `activetheory.md`, `chartogne.md` (PENDING — navrhnutý na kalibráciu,
  je to najbližší žánrový príbuzný: vinárstvo ako prechádzka svetom).
- **Všeobecné DI súbory:** `00_INDEX`, `03_INDUSTRY_STYLE_MATRIX`,
  `08_MOTION_AND_SPATIAL_DESIGN` (vrátane Refokus štúdie §8–14),
  `09_MOBILE_DESIGN`, `10_DESIGN_ANTI_PATTERNS`,
  `DESIGN_DECISION_ENGINE`; štýly `organic-natural`,
  `industrial-architectural`, `warm-editorial`, `image-led`.
- **Čo sa od referencií mení:** žiadna z referencií nie je rodinná
  drevostavba — syntéza (igloo svet + Cula/Arqitel scrub architektúra +
  exoape typografia + organic-natural paleta + industrial anotácie) je
  nová kombinácia pre tohto klienta; nič sa nekopíruje ako celok.
- **Slabé miesta priznané:** obsahový inventár je čiastočný (blokovaná
  doména); chartogne bez verdiktu; paleta a typografia sú zatiaľ smer,
  nie tokeny — tokeny vzniknú v AD dokumente fázy 1 po statických
  kompozíciách prvej izby.
