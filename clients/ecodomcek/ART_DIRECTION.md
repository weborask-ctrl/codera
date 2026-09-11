# ECODOMČEK — Art direction v1 „Vonia drevo"

Fáza 1 výstup. Odvodené z PLAN.md (Design DNA, referenčná mapa) a
CONTENT_INVENTORY.md (skutočný obsah). Tokeny sú záväzné pre statické
kompozície (fáza 2) a implementáciu (fáza 4). Stav: NÁVRH — po
statických kompozíciách sa kalibruje.

Vytvorené: 2026-09-03

---

## Téza

**„Čo je ekologické, je aj ekonomické."** Firma sama pomenovala svoju
bariéru — nedôveru konzervatívneho Slováka v drevostavbu. Stránka je
preto *demystifikácia*: jeden skutočný dom (Rodinný dom Lúčina, 2024),
ktorým scroll prechádza od rána do večera a ktorý sa nechá otvoriť až
na vrstvy steny. Presnosť žije v anotáciách, ľudskosť v texte.

**Podpisové obmedzenie (signature constraint):** *Jediná farba na
stránke, ktorá nie je z materiálu, je jantárová CTA.* Všetko ostatné je
papier, drevo, mach, atrament a večerné svetlo. Nikdy modrá, nikdy
oranžová šablóny, nikdy gradient.

## Referenčné odvodenie (záznamy)

| Rozhodnutie | Zdroj |
| --- | --- |
| Svetlý svet, akty = kamera + svetlo, mono anotácie | `igloo.md` (LIKED) |
| Ľahká váha displeja vo veľkom, text nad svetom v plnej opacite, teplý súmrak namiesto #000 | `exoape.md` (LIKED) |
| Fixný svet + natívne scrollujúce DOM sekcie, pečená scenéria | 08 §8–13 (Refokus/Arqitel/Cula) |
| Každý beat = iný druh obsahu | `refokus.md` (LIKED) |
| Hustota reálneho obsahu ako dôvera (pás realizácií) | `basement.md` (LIKED) |
| Slnečný pól, terénna paleta, jantárová ihla len pre CTA, pill CTA | `styles/organic-natural.md` |
| Specimen-labels, kóty, 0–2px hrany, tabuľky ako obsah | `styles/industrial-architectural.md` |
| Krémový kánon, biela = elevácia, jeden tmavý akt | `styles/warm-editorial.md` |

## Tokeny

### Canvas a farby

| Token | Hodnota | Úloha |
| --- | --- | --- |
| `--paper` | `#f3eee3` | denný canvas (teplá kosť) |
| `--paper-2` | `#e9e1cf` | zapustené pásy, karty na papieri |
| `--white` | `#fbf9f4` | elevovaná plocha (formulár, karta) — nikdy čistá biela |
| `--ink` | `#26221c` | primárny text, teplý atrament (nikdy #000) |
| `--ink-2` | `#5b554a` | sekundárny text, mono anotácie na papieri |
| `--line` | `rgba(38,34,28,.18)` | hairline pravidlá |
| `--moss` | `#4d6a2f` | z loga — zvýraznenie „eko", štítky, aktívny stav |
| `--moss-deep` | `#33471f` | mach na tmavom podklade |
| `--larch` | `#c48a3f` | smrekovec — materiálová farba v diagramoch |
| `--sand` | `#d9c9a8` | piesok z loga — jemné plochy |
| `--amber` | `#d2842a` | **jediná akčná farba** — CTA, aktívny bod mini-mapy |
| `--dusk` | `#1d1b19` | večerný akt (Kontakt) — teplá tma |
| `--dusk-2` | `#2a2622` | plochy na tme |
| `--glow` | `#f2b563` | svetlo v oknách, jediný „efekt" večera |

Dramaturgia svetla: beaty 0–7 na `--paper` (deň), beat 8 na `--dusk`
(večer). Jeden tmavý akt na stránku (warm-editorial pravidlo), a je
motivovaný príbehom (súmrak), nie štýlom.

### Typografia

- **Display + telo: Hanken Grotesk** (Google Fonts, 300/400/500).
  Humanistická groteska s dobrou diakritikou; váha 300 nesie display
  (istota ľahkosťou — exoape). Nie Inter, nie Geist (Codera), nie
  Roboto.
- **Anotácie: IBM Plex Mono** (400/500) — kóty, štítky, čísla beatov,
  IČO, telefón v pätičke.
- Škála desktop: display 88/0.98 (−0.02em) · h2 56/1.02 · lead 22/1.4 ·
  telo 17/1.6 · mono štítok 12 uppercase +0.14em · mono anotácia 13.
- Škála mobil: display 40/1.02 · h2 32 · lead 18 · telo 16 (nikdy
  menej) · mono 11–12.
- Váhový strop: 500. Nič tučnejšie — tučnosť patrí súčasnému webu.
- Slovná hračka loga sa prenáša do textu: „eko" v „ekologické /
  ekonomické" farbou `--moss` (jediné farebné zvýraznenie v texte).

### Anotačný systém

Bod (6px, `--amber` len pre aktívny, inak `--ink-2`) + vodorovná
čiarka 32px + mono štítok uppercase. Formát čísel beatov `01 / 09`.
Na svete: materiálové štítky z reálneho slovníka klienta („RHOMBUS
PROFIL", „FUNDERMAX", „SIBÍRSKY SMREKOVEC", „DREVOVLÁKNITÁ IZOLÁCIA").
Čísla, ktoré klient nedodal (hrúbky, U-hodnota), sa píšu ako viditeľný
placeholder `[doplní EcoDomček]` — nikdy odhad.

### Tvary a komponenty

- Hrany plôch: 0–2px. Fotky a karty ostré.
- Primárne CTA: pill (999px), `--amber`, text `--ink`, 52px výška;
  jedno na viewport.
- Sekundárne akcie: text s podčiarknutím hairline, alebo mono link.
- Formulár: polia s hairline spodnou linkou na papieri / na tme
  `rgba(243,238,227,.25)`; labely nad poľom, nie placeholder-only.
- Mini-mapa domu: pôdorys ako SVG, 9 bodov, aktívny `--amber`; desktop
  vpravo dole, mobil bottom-sheet.
- Telefón ako komponent: na súčasnom webe je najsilnejší konverzný
  prvok — v redizajne ostáva veľký (display 300) v Kontakte a ako
  tap-to-call na mobile.

### Obraznosť

Jedna gramatika: **render domu** (svet) + **fotografie realizácií**
(dôkaz, v páse Beatu 7). V statických kompozíciách stojí namiesto
renderu skutočná fotka domu v Lúčine — viditeľne označená ako
stand-in. Nikdy stock, nikdy AI-fotka, nikdy ilustrácia.

### Motion tier

Storytelling (08 §1 úroveň 4): scroll-scrub sveta, DOM text s ENTER →
HOLD → EXIT. Žiadne ambientné loopy v čitateľských zónach. Prechody
medzi izbami = kamerové prejazdy s mäkkým dissolve svetla, nie strihy.
Reduced-motion: statické zábery izieb, plný obsah.

### Mobil

Vertikálny swipe rytmus: každá izba = celoobrazovkový záber
(portrétový crop renderu) + karta obsahu pod ním. Bez pinov. Tap-to-call
v spodnej lište v Kontakte. Mini-mapa ako bottom-sheet.

## Zakázané pre tento projekt

1. Tmavý web ako default — tma je len večerný akt.
2. Modrá / oranžová / gradienty šablóny Constructy.
3. Stock a AI fotografie (rodinka pred vilou, podanie rúk).
4. Uhladenie copy do agentúrnej slovenčiny — „bacha", „Mňam!",
   „kancelárska krysa" ostávajú.
5. Vymyslené čísla (roky skúseností, počty stavieb, hrúbky) — len
   placeholdery alebo potvrdené fakty.

---

## Fáza 2 — statické kompozície

Plátno (Claude Design canvas, 7 artboardov):
https://claude.ai/code/artifact/39fd44b2-0411-4768-93f3-54b38dceea91

Zdrojové artboardy a fotky sú v `compositions/` (`*.dc.html`,
`canvas.json`, JPEG orezy z reálnych realizácií). Desktop 1440×900:
01 Exteriér · 04 Rez stenou · 07 Realizácie · 09 Kontakt. Mobil 390×844:
01 · 04 · 09. Stav: NA SCHVÁLENIE — implementácia sveta začína až po
schválení (PLAN.md §11, fáza 2 → 3).

---

## Fáza 2b — prototyp prechádzky (fotoreálny)

Prototyp: https://claude.ai/code/artifact/ec635947-fb5c-4b60-91e2-41bc54e1c3c9
Zdroj a zábery: `prototyp/` (pozri `prototyp/README.md`).

**Korekcia 2026-09-10.** Prvá verzia prototypu bola realtime three.js
blockout a Ondrej ju odmietol: „kreslený blud, stromy nie sú pekné".
Mal pravdu a knižnica to hovorila vopred — 08 §9 (pre-rendered secret)
aj PLAN.md §6 predpisujú **pečený svet**: drahá scenéria sa renderuje
offline, realtime ostáva len pre to, čo musí reagovať. Blockout tú
lekciu porušil. Nahradený sekvenciou pred-renderovaných záberov.

**Vizuálny smer — `exoape.md` (LIKED), teraz naplno.** Záznam hovorí:
„TAKE: light-weight display type at massive scale; dusk warmth instead
of flat black; text floating over the world at full opacity; slow-dissolve
transitions. REFUSE: photography dependence — Codera has no photo assets."
Pre EcoDomček sa to REFUSE obracia: klient MÁ fotografovateľný predmet —
skutočný dom. Fotografický svet je teda pre neho legitímny, kým pre
Coderu nebol. To je presne to, na čo knižnica slúži: rovnaký záznam,
opačné rozhodnutie podľa klienta.

Doplnkovo: `igloo.md` (jedno prostredie, akty = kamera a svetlo — latka
fotoreálnosti a atmosféry) a 08 §11 (jeden beat ≈ jeden viewport).

**Čo prototyp dokazuje:** 9 zastávok v jednom fotoreálnom svete,
dramaturgia svetla ráno → večer, text nad svetom s čitateľným holdom,
mapa domu, natívny scroll bez smooth-scroll vrstvy.

**Čo prototyp nie je:** zábery sú architektonické vizualizácie podľa
proporcií a materiálov realizácie Lúčina 2024, **nie fotografie domu**.
Označené priamo na stránke. Finálne rendery vzniknú z výkresov.

**Otvorené:**
- Mobil NOT VALIDATED — headless Chromium ignoruje šírku okna pod 500 px
  a rozloží stránku na 500, takže staršie „mobilné chyby" boli artefakt
  merania. Úzky layout (500 px) overený, 390 px treba na reálnom zariadení.
- Výkon (LCP, váha 2 MB) nemeraný — fáza 7.
- Rez stenou má stále `[hrúbka]` placeholdery — čaká na klienta.

---

## Fáza 2c — dom ako predmet (2026-09-10)

Prototyp: https://claude.ai/code/artifact/ec635947-fb5c-4b60-91e2-41bc54e1c3c9

**Korekcia dva.** Fotoreálna verzia mala zábery na celú plochu s textom
cez ne. Ondrej: „nechcem aby to boli v pozadí." Má pravdu — fullbleed
fotka s textom navrchu je tapeta, nie exponát, a stránka o remesle má
svoj predmet ukazovať, nie ním podkladať.

**Nový zákon layoutu:** obrázok nikdy nie je pozadie. Každý záber žije
v ráme v mriežke stránky, text je vedľa. Rám je sticky — drží, kým beží
jeho akt, potom pustí. Canvas stránky ostáva papier.

**Odvodenie z knižnice:** `lusion.md` (LIKED) — *„the stage-block grammar:
a dark 3D stage set INTO a calm chrome, not a dark page; the 3D is the
PRODUCT DEMO, not decoration."* Presne to: exponát vsadený do pokojnej
stránky. `noomo.md` (LIKED) — *„3D as a tangible material of the layout"*.
Anotačný systém (číslované body + legenda) je z
`styles/industrial-architectural.md`: specimen-labels a kóty. Dlhé
slovenské názvy nejdú na obrázok, ale do legendy vedľa — kreslárska
konvencia, a rieši to pretekanie štítkov cez okraj rámu.

**Nová dramaturgia — dom sa rozoberá:**
ACT 1 (5 krokov, jeden rám): celý dom → číslované časti pribúdajú
(strecha, obklad, kompaktné dosky, konzola) → rozložený na vrstvy
(strecha, poschodia, základová doska) → rez domom s izbami.
ACT 2 (6 krokov): rez stenou, obývačka, kuchyňa, terasa, realizácie,
kontakt vo večernom tmavom akte.

**Nové zábery:** `explod.jpg` (rozložený dom), `rez.jpg` (otvorený dom
ako dollhouse), `hero.jpg` (celý dom s čistou oblohou a priestorom okolo).

**Poznámka k testovaniu:** headless Chromium po programovom scrolle fotí
od začiatku dokumentu, nie viewport — preto `?step=N` vyrenderuje krok
samostatne na začiatku dokumentu namiesto scrollovania k nemu. Skoršie
„prázdne" zábery boli tento artefakt, nie chyba layoutu.

**Otvorené:** mobil 390 px NOT VALIDATED (headless nejde pod 500 px);
výkon nemeraný; `[hrúbka]` v skladbe steny čaká na klienta.

---

## Fáza 2d — exploded view na úvode (2026-09-11)

Ondrej: „urob exploded view domu na začiatku." Stránka teraz otvára
**rozloženým domom** a scroll ho skladá.

**Prečo to funguje pre tohto klienta:** montovaná drevostavba JE
stavebnica. Rozložený dom nie je efekt, je to doslovný popis technológie
— a zároveň odpoveď na bariéru nedôvery z O nás: kto vidí, z čoho sa dom
skladá, prestane sa báť, že je to „len drevo".

**Mechanika montáže.** Vrstvy sa nedali vyrezať z jedného renderu —
v axonometrii sú L-tvaru a v obrazových riadkoch sa prelínajú, takže
žiadny vodorovný ani šikmý rez ich nerozdelí čisto (zmerané po stĺpcoch).
Namiesto slicovania vznikol druhý render: **zložená axonometria
z rovnakého uhla, rovnakej mierky a na rovnakom pozadí**. Crossfade
rozložený → zložený potom číta ako poskladanie domu.

**Nový sled ACT 1:** rozložený dom (hero) → štyri vrstvy s číslami
a legendou (01 strecha, 02 poschodie, 03 prízemie, 04 základová doska) →
zložený dom → hotový dom na svahu (05 obklad, 06 kompaktné dosky,
07 konzola) → rez domom. ACT 2 (prechádzka izbami) ostáva.

---

## Fáza 3 — remeselná prestavba podľa Refokusu (2026-09-11)

Ondrej: „inšpiruj sa knižnicou a prácou Refokus, urob to premakanejšie —
nech to vyzerá ako stránka za 20 tisíc."

**Diagnóza.** Predchádzajúca verzia opakovala jeden split screen
jedenásťkrát. To je najsilnejší „šablónový" signál, aký stránka môže
vyslať. `refokus.md` to hovorí presne: *„the site feels rich because every
scroll beat delivers a different kind of content, not a different effect."*
Pozrel som aj skutočné zábery (`shots/refokus-02`, `-04`) a potvrdilo sa:
logo wall, serif testimonial, celý oranžový pás pre projekt, tmavý pás pre
ďalší — zakaždým iný tvar aj iná farba.

**Čo sa zmenilo:**

1. **Dva typografické hlasy.** Hanken Grotesk nesie štruktúru, Newsreader
   (serif) ľudské momenty — citát konateľa a claim v pätičke. Doteraz bol
   na stránke jediný hlas, čo ju robilo plochou.
2. **Desať aktov, desať tvarov.** Full-bleed kresba s typom cez ňu ·
   sticky kresba s legendou · široký 21:9 záber s riadkom faktov · čisto
   typografický serif pás bez obrázka · machový technický pás s tabuľkou ·
   tri rámy v rade · projektový index s thumbnailom na kurzore · štyri
   číslované kroky + index služieb · tichý široký záber · tmavý kontakt.
3. **Farba v pásoch, nie v shelli.** papier → piesok → mach → papier →
   súmrak. Hlavička sa nad tmavými pásmi invertuje.
4. **Hustota ako dôveryhodnosť** (`basement.md`): osem reálnych realizácií
   s rokom, miestom a tagmi; dvanásť služieb ako index; sedemvrstvová
   tabuľka skladby steny.
5. **Remeslo:** maskované odkrytie nadpisov po riadkoch, clip-path odkrytie
   obrázkov, parallax vnútri rámu, bežiaci index, hover stavy, focus-visible.

Zdroj: `web/` (pozri `web/README.md`), zábery aktov vo `web/shots/`.

**Otvorené:** mobil 390 px NOT VALIDATED (headless nejde pod 500 px);
výkon nemeraný; `[hrúbka]` a U-hodnota čakajú na klienta.

---

## Fáza 4 — dom zapadne do seba (2026-09-11)

Ondrej: „prerob rozpoloženie stránky a vlož 5D prvky na úvodnú stránku,
že keď sa bude scrolovať dole, ten dom zapadne do seba pekne."

**Čo sa zmenilo v rozložení.** Úvod (rozložený dom s typom) a druhý akt
(Štyri vrstvy, crossfade rozložený → zložený) sa zliali do jedného
**5D hera na 5 obrazoviek**: vpravo sticky dom, vľavo päť textových
krokov. Stránka má teraz 9 aktov, index a kotvy prečíslované.

**Mechanika.** Fáza 2d tvrdila, že vrstvy sa z jedného renderu vyrezať
nedajú — platilo to pre rovné rezy. Segmentácia podľa farby pozadia
s floodfillom (`web/renders/segment.py`) ich oddelí čisto: strecha,
poschodie, prízemie, doska + jej tieň, každá ako WebP s alfou. Dom je
**cut-out priamo na papieri** — objekt v mriežke, nie obrázok v ráme
(a už vôbec nie pozadie). Dosadacie posuny sú zmerané (44/26/30 px
renderu), rozložená poloha je širšia než render, aby mal scroll čo skladať.

**Dramaturgia.** Dosadnutie prízemia · poschodia · strechy je zladené
s textovým krokom, ktorý o ňom hovorí; špendlíky na dome, legenda pri
texte a koľajnica pod domom (Doska · Prízemie · Poschodie · Strecha) sa
rozsvecujú diskrétne, nie scrubom. Text nikdy nežije v polovičnej
opacite. Reduced motion = dom sedí od začiatku, text len scrolluje.

**Reference map (hero):**

| Prvok | Zdroj | Extrahované | Adaptované |
| --- | --- | --- | --- |
| Predrenderované vrstvy scrubované scrollom | `08_MOTION_AND_SPATIAL_DESIGN.md` §9 (Arqitel, „pre-rendered secret") | scéna sa pečie, realtime je len scrub | žiadny WebGL: 4 alfa-obrázky + transform |
| Objekt, ktorý sa scrollom stavia | `records/igloo.md` (svet vzniká pri scrolle, jeden materiál) | jedno prostredie, jeden objekt, scroll = stavba | dom sa skladá zdola nahor, papier ostáva |
| Sticky objekt + diskrétne textové kroky | `records/refokus.md` (pinned sekvencie, beat variety) | text nesie kroky, objekt drží | 5 krokov, každý má vlastný pin/legendu |
| Číslované špendlíky + legenda | výkresová konvencia z fázy 2b | čísla na kresbe, mená v legende | špendlíky sú deti vrstiev, cestujú s nimi |

**Čo sa nepodarilo.** Zložený render z rovnakej kamery (dva pokusy
s referenciou, jeden čistiaci prechod nad poskladaným kompozitom) zakaždým
zmenil proporcie domu — crossfade by bol morf, nie „cvaknutie". Finálny
stav je preto samotné poskladanie vrstiev; švy sú tesné (kontrola 3× zoom
v `compose.py`), ale bez kontaktných tieňov medzi dielmi.

**Validácia.** LOCAL: Playwright reálny scroll 1440×900 a 390×844 —
sticky drží, dom sa skladá v správnych bodoch (`web/shots/hero-*`).
Mobil na reálnom zariadení NOT VALIDATED.
