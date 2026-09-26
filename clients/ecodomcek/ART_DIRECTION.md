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

---

## Fáza 5 — kresba → hmota (2026-09-12)

Ondrej: „text naľavo je strašný … inšpiruj sa [launch-film briefom],
prerob ten prvotný dizajn." Brief: 15 s film, blueprint sa sám vykreslí,
sklopí do 3D, budova sa zhmotní cez vlastné čiary, proof overlay, lockup.

**Prieskum pred prácou** (Higgsfield read-only + knižnica): video modely
vedia štart + koncový frame z našich obrázkov (Seedance 2.5 9 kr./s,
MiniMax H3 10 kr./5 s), no žiadny nemá parameter na text a 15 s jeden
záber pripne len dva okamihy — geometria by driftovala (fáza 4 to už
ukázala). Knižnica: 08 §9 (predrenderovaný svet, scrub), §13 (typ nad
svetom vždy v DOM), igloo.md (LIKED — čiary inžiniera nad fotoreal
objektom vo svetlom svete), refokus.md (pinned sekvencia, text v krokoch),
kpr.md/noomo.md (nadpis a objekt zdieľajú rám). Varovania: modrý blueprint
+ chartreuse = cudzia paleta a doslova súčasná (zavrhnutá) WordPress téma
klienta; 10 §1 nekopírovať referenciu; 01 §5 jedna myšlienka na viewport.

**Diagnóza textu.** 50/50 split so „SaaS stackom" nabok: eyebrow +
nadpis o triku + 4-riadkový odsek o scrollovaní + cue + dve meta linky =
päť myšlienok v jednom viewporte, agentúrna slovenčina.

**Riešenie.** Hero „Dom z výkresu": atramentová kresba (potrace zo
segmentovaných vrstiev) sa pri načítaní sama vykreslí na papieri; scroll
zhmotňuje vrstvy cez vlastný obrys a skladá ich; v poslednom stave sa
čiary znovu vykreslia machom cez hotový dom a vsiaknu, špendlíky dostanú
materiálové štítky. Copy = disciplína briefu: jeden vykreslený nadpis na
stav, jedno machové slovo, kóty ako štítky, čipy v titulnom bloku, CTA až
v hold stave. Všetky vety sú klientove: „Vitajte vo svete, kde vonia
drevo." · „Difúzne otvorená stavba s použitím ekologických materiálov." ·
„V lete chladí, v zime je teplučký." · „Nie sme strohí obchodníci, ale
nadšenci drevostavieb." · „Čo je ekologické, je aj ekonomické." · „Od
základov až po kolaudáciu." Paleta ostáva: papier, atrament, mach ako pero,
jantár len CTA/aktívny špendlík.

**Reference map (hero):** 08 §9/§13 (baked svet, DOM typ), igloo.md
(čiary nad objektom, svetlý svet), refokus.md (diskrétne kroky), kpr.md +
noomo.md (typ a objekt v jednom ráme), basement.md (hustota overených
faktov = štítky), 07 §6 (čipy a štítky ako najlacnejšia páka).

**Validácia.** LOCAL: Playwright reálny scroll 1440×900 a 390×844
(`web/shots/hero-*`). Reálny mobil NOT VALIDATED. Video test (MiniMax H3,
štart = kresba, koniec = poskladaný dom): pozri fázu 5b.

### Fáza 5b — video test (2026-09-12)

MiniMax H3, 5 s, 4:3, 2K, 10 kreditov. Štart = atramentová kresba
rozloženého domu na papieri (`web/video/test-01-start.jpg`), koniec =
poskladaný dom z vrstiev (`test-01-end.jpg`). Prompt: statická kamera,
kresba sa zhmotní zdola nahor pozdĺž vlastných čiar, bez textu.

**Výsledok** (`web/video/test-01-minimax-kresba-hmota.mp4`, snímky
`web/shots/video-test-01-sheet.jpg`):

- Zhmotnenie funguje a v správnom poradí: doska → prízemie → poschodie →
  strecha, každý diel sa naplní materiálom mäkkým čelom zhruba pozdĺž
  kresby. Kamera drží, geometria nedriftuje, papier ostáva čistý.
- Koncový frame model **nerešpektoval v geometrii**: dom ostal rozložený,
  diely nedosadli. Materiály z koncového obrázka prevzal, polohy nie.
- Čelo materializácie nie je „prúd cez čiary", je to gradientový wipe.

**Verdikt.** AI video vie kresbu → hmotu na našej geometrii lacno a
spoľahlivo, ale skladanie nie. Pre hero to nemá zmysel — prehliadačová
verzia (fáza 5) robí obe veci, zhmotnenie aj dosadnutie, s vlastnou
geometriou a bez kreditov. Zmysel to má pre samostatný launch film
(social): klip 1 kresba → hmota (tento), klip 2 rozložený → poskladaný
(oba framy fotoreal, ešte neotestované), klip 3 zostup do interiéru.
Odhad: 3 × 10 kr. skúšky + 3 × 45 kr. finál na Seedance = 165 kr.

---

## Fáza 6 — podstránky, referencie, fotky zákaziek (2026-09-14)

Ondrej: „prav text nech je to profesionálnejšie, pridaj podstránky
a referencie, uprav toto s obrázkami zákaziek, použi motionsites.ai pre
inšpiráciu smooth prechodov a rozloženia stránky."

**Prieskum** (3 z 5 agentov; copy a fact-check padli na limite, urobené
ručne). motionsites.ai: katalóg promptov je za paywallom, no štyri lekcie
v /academy publikujú celé špecifikácie (NovaAI, Aether Lane — luxusné
reality, DE</HELPERS). Prevzaté: sticky svet + obsah cez neho, 80vh
medzery medzi bitmi, jednosmerný fade-up 28 px / 700 ms s CTA
naposledy, štvorvrstvový hero s nadpisom za objektom (máme), číslované
riadky s mono indexom, badge s ľavou linkou, superscript počty v nav
(Realizácie ⁸, Služby ¹²), jedno vyjadrenie ako protiváha nadpisu,
hover strop 2 px. Odmietnuté: sklo/blur, blend-mode text, gradient
text, masonry, stock ľudia, tmavý canvas, pinned „stránka nescrolluje".
Prechod medzi dokumentmi v korpuse nie je (všetko sú single-page) —
odvodený: papierová opona + fetch/swap `<main>`, bfcache cez `pageshow`.

**Architektúra** (06/07/09/10 + záznamy): sedem tvarov, každý iný —
pozri `web/README.md`. Vyjadrenia: presne dve, priznaný počet („02
zachytené"), žiadny karusel. Detail: katalógová platňa, fotka nikdy
väčšia než zdroj.

**Obrázky.** V `compositions/` ležali 800 px orezy tých istých fotiek
(reálne 480–680 px) — nahradili 420 px náhľady. Zistenie: `t2019b`
(garáž) a `t2021b` (terasa) sú tá istá scéna → garáž ide bez fotky,
s poctivou prázdnou platňou. AI upscale zamietnutý (dopisuje detail tam,
kde je dôkaz remesla). Zoznam pre klienta v README.

**Copy.** Všetky vety klientove (inventár §4–§6), moje spojivo v jeho
registri; self fact-check: každé číslo na webe je v inventári; dve
vymyslené sľuby („ozveme sa do dvoch dní", „odhad na papieri")
odstránené.

**Validácia.** LOCAL: full-page zábery všetkých 14 stránok 1440 a 390
(`web/shots/x-*`), router netestovaný v reálnom prehliadači (Playwright
bez klikania) — NOT VALIDATED. Reálny mobil NOT VALIDATED.

---

## Fáza 7 — plagát, rozdelená lišta, 5D stena (2026-09-14)

Ondrej: „stránka je úplne ako každá AI generated … chcem aby keď sa
stránka načíta nech sa ten dom poskladá, pridaj pútavý nadpis nie taký
nudný na kraji … rozdeľ lištu hornú, odstráň zbytočné malé texty …
stenu chcem 5D, dala sa roztahovať … o tom jednu celú podstránku."

**Diagnóza generickosti:** rovnaký masthead všade, mono štítky a
číslovania („01 / 07“, kóty, čipy, bežiaci index), nadpis vľavo +
obrázok vpravo. Všetko preč.

**Hero = plagát** (pangram.md: slovo vlastní rám; kpr.md/noomo.md:
objekt medzi riadkami nadpisu). Dva riadky obrieho Hanken 300 na
celú šírku, dom v strede, prekrýva pätu prvého a hlavu druhého riadku.
Pri načítaní: závoj → kresba sa vykreslí (0,9 s) → doska, prízemie,
poschodie, strecha sa zhmotnia a dosadnú (do 4,3 s) → až potom vyjde
text. Scroll preč: vrstvy sa rozídu rôznou rýchlosťou (hĺbka).

**Lišta rozdelená** na tri pilulky (Aether Lane z motionsites: „fixed
nav pill“, u nás papier, nie sklo): značka · stránky so superscript
počtami · telefón + Dopyt.

**Stena** (`stena.html`): render siedmich vrstiev (Higgsfield
gpt_image_2, 2 varianty × 6,5 kr., zvolený B s čiernou vetrozábranou),
segmentácia floodfillom (sadrokartón potreboval prah 6 — biela na
papieri), sedem WebP s alfou. Jedno číslo `spread` 0–1, tri vstupy
(ťah, scroll v 280svh tracku, šípky), lerp v rAF — lusion.md: vstup sa
mapuje na pohyb okamžite. Zatvorená stena je stoh v strede, otvorená
= pôvodné pozície renderu; štítky v pevnom riadku na otvorených
pozíciách, popis poslednej otvorenej vrstvy pod nimi (na mobile len
posledná). Texty vrstiev: klientove vety, kde existujú; inak stavebná
fyzika, nie tvrdenie o firme. Kôl „orientačná skladba“.

**Validácia.** LOCAL: Playwright — reálny ťah myšou 5 % → 75 %,
scroll na koniec tracku → 100 %, bez chýb v konzole; zábery
`shots/wall-*`, `shots/v7-hero.jpg`. Reálny mobil NOT VALIDATED.

---

## Fáza 8 — detail realizácie ako stavebný list (2026-09-16)

Posledná stránka, ktorá ešte vyzerala ako šablóna. Pred zásahom: malá
fotka vľavo, stĺpec štítkov vpravo, pod tým prázdny pás, citát drobným
serifom v rohu. Žiadny nápad — „fotka + text", presne to, čo Ondrej na
zvyšku webu odmietol.

**Referenčná mapa.** (LIKED záznamy z `CODERA_DESIGN_REFERENCES/records/`)

| Scéna | Záznam | Prevzatá mechanika | Ako je to prispôsobené |
| --- | --- | --- | --- |
| Doska s fotkou | `igloo.md` | mono anotácia položená na objekt ako inžinierska kresba; jedno prostredie, „akty" sú zmeny svetla | vlásočnicové úrovne cez fotku, číslo na konci čiary, popis v odsadenom stĺpci; namiesto svetla sa mení stav stavby |
| Číslica roka | `kpr.md` | typografia a objekt zdieľajú jeden priestor — riadok beží ZA ústredným objektom | za dosku ide číslica roka, nie text: prekrytá číslica je stále číslica, prekrytá veta je nečitateľná |
| Číslica ako hrdina | `pangram.md` | jedno obrie slovo vlastní rám, obraz je klíma | rok v Newsreader 200 na 19 vw, titulok vedľa nej klesol na 3,9 vw |
| Hairline tabuľka | `basement.md` | hustota SKUTOČNÉHO obsahu je motor dôveryhodnosti; rytmus obria typografia ↔ hustá mriežka | šesť riadkov, ktoré vieme doložiť (rok, miesto, kategórie, realizoval, fotografia) + linky na služby, ktoré na stavbe naozaj boli |
| Citát | `exoape.md` | ľahký rez displeja vo veľkom, text v plnom atramente, nikdy pri nízkej opacite | klientove vlastné vety serifom 2,15 vw; podpis na linke vpravo dole |
| Pravá polovica citátu | `basement.md` | prázdna polovica je miesto, kde sa šablóna prezradí | nesie realizácie z rovnakej kategórie — skutočná navigácia, nie výplň |

**Nápad.** Stránka nepoužíva nový motív, ale ten jediný, ktorý web už
má: dom rastie od zeme. Doska sa po príchode vyvolá zdola nahor
(papierová clona ustupuje, na jej hrane svieti jantárová čiara) a ako
pracovná úroveň míňa jednotlivé výšky, vytlačí sa ich anotácia. Je to
jednorazový beh na vstupe, nie scrub — po dobehnutí stav DRŽÍ, takže
žiadne obnovenie stránky nepristane na polovičnej kresbe a každý
pokojný snímok je hotová okótovaná kresba. `prefers-reduced-motion`
dostane hotový stav ako layout, nie ako náhradu.

Anotácie sú vlastné `specs` projektu — nič vymyslené, žiadne rozmery v
milimetroch, ktoré nemáme. Realizácia bez fotografie (garážo-sklado-
terasa 2019) si drží celú kresbu a stráca len obraz: prázdna doska s
tromi okótovanými úrovňami je najčistejší snímok zo série.

**Čo ešte padlo.** Mŕtve CSS po zrušených blokoch (`.marks`, `.mark`,
`.chiprow`, `.rel`). Kolízia triedy `.yr` (rok v karte realizácie vs.
číslica na liste) — nová trieda `.syr`. Vodorovný pretok 9 px na 820 px
z posterového domu (`html{overflow-x:clip}`). Biely klin v hornom okraji
fotky 2023 — orezaný z originálu v `compositions/velka-rodina.jpg`
jedným rezom, bez dokresľovania (800×692 → 800×670).

**Validácia.** LOCAL: Playwright na `dist/` — 15 stránok × 3 šírky
(1440 / 820 / 390) bez vodorovného pretoku a bez fotky zväčšenej nad
vlastný zdroj; doska sa dokresľuje na všetkých ôsmich detailoch
(4/4, 3/3 úrovní), router po prepnutí stránky znovu inicializuje
list, `reducedMotion: 'reduce'` dáva hotovú kresbu, konzola čistá.
Jeden súbor `dist/ecodomcek.html` (7,4 MB) overený z `file://` vrátane
detailu. Reálny mobil a Safari NOT VALIDATED.

---

## Fáza 9 — Technológia a Služby (2026-09-24)

Ondrej: „kde navrhuješ pokračovať, čo vylepšiť a opraviť" → vybral
Technológiu + Služby. Audit pred dizajnom našiel najprv **vecné chyby
v texte, ktoré som tam dal ja**:

- `technologia.html`: „Steny a stropy vznikajú v hale, na presných
  strojoch a pod strechou" — v klientovom obsahu nie je. Preč.
- `stena.html`: „drevo chránime bóraxovou soľou" — odvodené len z
  obrázkovej dlaždice starého webu. Preč; zateplenie prepísané podľa
  jeho textu Zateplíme (drevné vlákno *alebo* minerálna vata).
- detaily realizácií: podpis „stavbyvedúci" — overená je len funkcia
  konateľ. Opravené.
- `services` v `content.py`: Altánky pri Luxusnej terase a
  Garážo-sklado-terase, Terasy pri Bungalove — klient ich tak
  nezaradil. Prísne mapovanie: len kategória alebo text klienta,
  terasa viditeľná na fotke nie je dôkaz.
- `.btn.ghost` nemal žiadny štýl — každé sekundárne CTA na webe bola
  druhá plná jantárová pilulka. Teraz obrys; na machu a súmraku svetlý.
- akcentové slovo na machovom páse bolo machové na machovom — nové
  `.band.moss h* em` (šalviová).

### Technológia — „prečo tomu veriť"

Diagnóza: stránka recyklovala dva najlepšie nápady webu staticky
(rozložený dom z úvodu, skladbu steny zo `stena.html`). Nová úloha
stránky je tá, ktorú klient sám pomenoval: „my, konzervatívni Slováci
jej veľmi nedôverujeme". Stena ukazuje AKO, technológia PREČO.

| Scéna | Záznam | Prevzatá mechanika | Prispôsobenie |
| --- | --- | --- | --- |
| Masthead | `pangram.md` | jedna číslica vlastní rám | „200+" v glow na machu oproti jeho vlastnej pochybnosti; akcent „veriť" v tej istej farbe |
| Stena dýcha | `lusion.md` | tmavý „stage block" vsadený do pokojného chrómu, vstup = okamžitá odpoveď | rez siedmimi vrstvami; para tečie z teplej izby von, parobrzda ju brzdí (bodky), vetraná medzera ju odvádza pozdĺž steny (zvislé stopy); hover/ťuk na vrstvu → jej veta z `WALL_TEXT` |
| | `igloo.md` | jedno prostredie, mono anotácia ako kresba | zvislé mono názvy pozdĺž vrstiev; von studené, dnu lampové svetlo |
| Leto a zima | `kpr.md` | typografia je súčasť scény | jeho veta rozdelená cez dve vizualizácie, stupňovite; jeho citát o komforte, zdraví a financiách vypĺňa letný stĺpec |
| Materiály | `basement.md` | hustota skutočného, prelinkovaného obsahu | register sa generuje zo `specs` realizácií (whitelist kľúčov) — nič napísané ručne; „Pultová" presunutá na „Tvar strechy" |
| Celá stránka | `refokus.md` | rozmanitosť beatov, nie efektov | päť DRUHOV obsahu: číslica, fyzika, obraz, register, motto |

Mobil: rez sa otočí — von hore, izba dole, para stúpa; názvy vrstiev
vodorovne. Reduced motion: jeden ustálený snímok prúdenia (900 krokov
simulácie, nakreslené raz), smer čitateľný zo stôp. Slučka beží len
keď je rez na obrazovke (ScrollTrigger) a zomrie s prepnutím stránky.
Kôl pod rezom: „Princíp, nie výpočet."

### Služby — register s dôkazmi

Diagnóza: dvanásť rovnakých riadkov textu, pravá polovica prázdna cez
~4 000 px. Každá služba teraz nesie stavby, kde ju klient naozaj
robil (`basement.md`); služba bez dôkazu je poctivo holý riadok a
nesie jeho hlas vo väčšom. Dva hlasy (`refokus.md`): jeho háčik
serifom („Je vám zima?"), služba groteskom na display veľkosti
(`pangram.md`). Pieskové prerušenie opakovalo riadok Konzultácie
doslova — preč; telefón je priamo v riadku Konzultácie (`cowboy.md`:
akcia v mieste záujmu). Žiadne bežiace čísla 01–12 (vo fáze 7
odmietnuté). Na mobile je dôkaz posun prstom so snap.

### Bundle

`bundle.py` vkladal každý výskyt fotky ako nový data URI — 4,6 MB z
8,3 MB boli duplikáty. Teraz je každý obrázok v súbore raz: 2,7 MB, po
zlúčení s vlastnými písmami z paralelnej session (2026-09-18) 2,9 MB a nula
externých požiadaviek.

**Validácia.** LOCAL: Playwright nad `dist/` — 15 stránok × 3 šírky
bez reálneho vodorovného posunu (test `scrollTo`, nie `scrollWidth`,
ktorý pri `overflow-x:clip` klame) a bez fotky nad vlastný zdroj;
router úvod → technológia → služby → späť bez chýb; slučka pary len
na obrazovke (64 rAF/s = ticker GSAP na každej stránke, +60 len so
zobrazeným rezom); reduced motion kreslí ustálený snímok. Bundle z
`file://`: 62 obrázkov na 15 stránkach načítaných, klik z miniatúry
v Službách otvorí správny detail. Reálny mobil a Safari NOT
VALIDATED — v kontajneri je len Chromium.

---

## Fáza 10 — úvod, štítky, spustiteľnosť (2026-09-24)

Ondrej: „pokračuj so všetkým, čo vieš." (Úvodný film cez fal beží v inej
session — táto nemá `FAL_KEY`.)

**Úvod — služby.** Opisované ako „obrie slová", v skutočnosti stredný
zoznam s háčikom schovaným do 10px mono. Teraz dvanásť slov na 6,2 vw
(`pangram.md`: slovo vlastní rám), lomky v piesku; číslo pri slove len
tam, kde ho doloží stavba, a kurzor nesie skutočnú fotku z tej stavby
(`basement.md`). Pri tom sa ukázalo, že **„peek" nikdy nefungoval nikde**
— fixný box bez `top/left` sedel na konci dokumentu, 6 500 px pod
obrazovkou. Opravené; fotka ide pod riadok kurzora, nikdy cez čítané
slovo. Teaser steny citoval klienta s pridanou čiarkou a bez naznačeného
strihu — teraz doslova s „…".

**Štítky nad nadpismi preč.** Paralelná session ich 2026-09-18 vrátila
ako „chybu šablóny"; bolo to Ondrejovo rozhodnutie z fázy 7. Parameter aj
CSS `.eyebrow` a mŕtve pomocné funkcie odstránené.

**Spustiteľnosť.** Kanonické URL, karta na zdieľanie z vlastných vrstiev
a písma (detail realizácie zdieľa svoju fotku), `sitemap.xml`,
`robots.txt`, JSON-LD len z overených údajov (konateľ ako `employee`,
nie `founder` — zakladateľstvo nie je doslova doložené). WebP q76
(−23 %), `width/height` na každom obrázku. Formulár otvára e-mail
návštevníka s hotovým dopytom — poctivé bez servera. Bundle nevkladá
base64 do absolútnych URL v `og:image`: 2,5 MB.

---

## Fáza 11 — opravy z kritického auditu (2026-09-24)

Audit 9 typov stránok (1440×900, 390×844, prvé obrazovky aj celé
stránky, emulované pomalé 4G) našiel päť chýb priamo v záberoch:

1. **Stena: nadpis „Potiahnite stenu." sa nikdy neukázal** — maska čaká na
   `.on`, stena nemala `data-reveal`. Doplnené.
2. **Stena: popis vrstvy prekrýval nápovedu** — 7 prvkov v 6-riadkovom
   gride a popis s rezervou na jeden riadok, hoci sa zalamuje. Riadok
   doplnený, rezerva 3em; šípka nápovedy už nenaráža do písmena.
3. **Úvod, mobil: dom zakrýval „Vitajte vo svete,"** — mŕtve mobilné
   pravidlá starého hera (`#hero .house` sticky s papierovým pozadím a
   96px papierovým blokom nad sebou) sa vzťahovali na dom postera.
   Celý blok (9 pravidiel pre štruktúru, ktorá už neexistuje) zmazaný.
4. **Kontakt, mobil: telefón sa lámal na dva riadky** — `nowrap`.
5. **Garáž: verejné „[doplní EcoDomček]"** — neznáme miesto sa
   nezobrazuje nikde; ostáva v zozname pre klienta v README.

Každá oprava overená meraním (nadpis v maske a v obraze, prekrytie
podľa súradníc, prvok navrchu cez `elementFromPoint`, počet riadkov
telefónu) na oboch šírkach, potom plná regresia. Zo auditu ostáva
otvorené: Realizácie (render ako hlavný obraz, rovnaké karty), O nás
(prázdna pravá polovica, zdvojené motto), LCP úvodu 5,0 s na
mobile, text pod 12 px, dva `h1` na úvode.

---

## Fáza 12 — Realizácie ako kronika (2026-09-24)

Audit: najväčší obraz na stránke dôkazov bol **render**, potom osem
rovnakých štvorcových kariet; prvá obrazovka bez jedinej fotky. Teraz
kronika skutočných stavieb, najnovšie prvé, končí tam, kde to začalo
(2008). Rok je serifová číslica stavebného listu, sticky pri svojej
skupine; každá stavba má skutočnú fotku v poctivej mierke (dom ≤ 540 px,
terasa ≤ 420 px, nikdy nad zdroj), miesto, tri riadky zo `specs` a
odkaz na stavebný list (`basement.md`: skutočné riadky; `exoape.md`:
práca vedie, typ stojí vedľa v plnom atramente). Garáž bez fotky je
poctivý textový riadok. Filtre skrývajú stavby aj prázdne ročníky.
Render ostal len na detaile Lúčiny, označený.

Pri tom: **päť fotiek nieslo biely „jazýček" starej WordPress šablóny**
zapečený v obraze (2015, 2024, Bungalov dole; 2008 hore; Veľká terasa
dole) — orezané jedným rezom z originálov, nič dokreslené. Rozmery
fotiek sa už nepíšu ručne (`SHOTSIZE`/`SRC` sa rozišli s prvým orezom),
čítajú sa zo súborov (`SHOTS` v `pages.py`). Mŕtve CSS kariet preč.

LOCAL: 15 stránok × 3 šírky, router, filter (Terasa → 3 stavby, ročníky
2021 a 2019), bundle z `file://` (61 obrázkov), stavebný list.

---

## Fáza 13 — film a otvárací dom (2026-09-24)

Ondrej: „daj tej stránke hodnotu, 3D otvárací dom… spojením toho
začiatku a ďalších vecí chcem vidieť značný pokrok v grafickej kvalite."

**Prieskum.** Awwwards (kategória Construction), rozbor 15 najlepších
webov stavebných firiem 2026 (Whitelam Media): projekty sú hlavný
obsah; „commissioned photography of actual completed work — not stock,
not renders" je najväčší signál kvality; rýchlosť = prémiovosť; jedna
dlhá stránka projektu > záložky. Živé weby (Haven, Infinity, GM) sa cez
proxy nenačítali — vizuálne referencie ostávajú LIKED záznamy.
ecodomcek.sk blokuje náš server firewallom hostingu (WAF) — ďalšie
originály odtiaľ nejdú; ostávajú tie z `compositions/`.

**Film** (Kling v3 Pro, z paralelnej session): `src/film.py` doladí
každú snímku na papier (surový film kolíše 241–248), prelne okraje,
oreže na plátno vrstiev, 1200/720 px H.264 + VP9 (10,7 MB → 0,7 MB).
Kresba a hmota vrstiev presne v polohe prvej snímky → film dom naozaj
zavrie → kamera sa priblíži na zavretý dom. Poistky: zablokovaný
autoplay / film nezačne do 6 s → vrstvy dosadnú; reduced motion →
statický zavretý dom.

**Otvárací dom** (`noomo.md`: objekt medzi písmenami nadpisu; `igloo.md`:
anotácia ako inžinierska kresba; `lusion.md`: vstup → obraz okamžite).
Scroll pripne plagát a pretáča ten istý film späť: zavretý dom sa po
podlažiach otvorí, kamera sa vzdiali na 0,86 (otvorený dom tak nezasahuje
do riadkov nadpisu) a každé podlažie dostane meno s vodiacou čiarou —
pozície sú boxy vrstiev z `layers2.json`, lebo prvá snímka filmu SÚ tie
vrstvy. Na mobile očíslované body na dome + legenda. Film sa sťahuje
ako Blob, aby sa dal pretáčať na akomkoľvek serveri (Python dev server
Range nepodporuje — prvé meranie rýchlosti posunu bolo preto neplatné).
Nula KB navyše — je to film, ktorý stránka už načítala.

LOCAL: 1440 a 390 — pripnutie, čas filmu 5,04 → 0,18 so scrollom,
popisy len v otvorenom stave; bundle z `file://` rovnako; plná regresia.
MP4 (H.264) cesta NOT VALIDATED — Chromium v kontajneri nemá kodek.

## Fáza 14 — Ulica, audit podstránok, rýchlosť (2026-09-24)

**Ulica (úvod, sekcia 3).** Osem ich realizácií ako ulica domov v poradí
rokov: na desktope pripnutý vodorovný prechod, na mobile swipe so snapom.
Všetky domy stoja na spoločnej línii terénu; terasy nižšie (300 vs 400 px).
Garáž bez fotky je čiarkovaná parcela s popisom — nič nevymýšľame.

**O nás — motto.** Pravá polovica pásu bola prázdna. Teraz tam je slovná
hračka ich vlastnej vety ako layout: jeden koreň EKO, dve koncovky
(logicky / nomicky — je správne / je výhodné). Referencia: pangram.md
(slovo vlastní rám). Diagram je aria-hidden, veta pod ním ho hovorí celú.

**Opravené chyby z auditu:**
- maska riadkov orezávala mäkčene nad verzálkami („Co je…" namiesto „Čo");
- stavebný list: rok 2021 čítal „202" — fotka zakryla celú úzku jednotku;
  číslica je teraz 16,7 vw a doska kryje najviac tretinu poslednej cifry;
- Stena pri obmedzenom pohybe: 1,8 obrazovky prázdneho papiera (scroll
  track bez pohybu) a nadpis „Potiahnite stenu", ktorý nešiel ťahať. Stena
  sa otvorí celá a hýbe sa len pod rukou / šípkami, okamžite;
- nápoveda steny hovorí len to, čo na danom zariadení funguje;
- Služby: realizácia bez fotky bola prázdny štvorec → čiarkovaná parcela;
- dva h1 na úvode → jeden h1, druhý riadok aria-hidden;
- drobné písmo min. 10,5 px; ScrollTrigger sa registroval dvakrát (parallax,
  drift, hero, ulica).

**Rýchlosť (emulácia Slow 4G + 4× CPU, 390 px):** LCP 6,0 s → 5,1 s.
Tušové cesty hera prekódované na relatívne celé čísla (index.html 182 → 83 KB,
vizuálne zhodné), úvod štartuje po fontoch a vlastných obrázkoch hera, nie
po celom `load`, film sa sťahuje s nízkou prioritou. Zvyšok LCP je zámerná
choreografia (tuš → vrstvy → film). Ak má LCP ísť pod 2,5 s, treba ukázať
prvý záber filmu hneď bez tušu — to je rozhodnutie o dizajne, nie oprava.

## Fáza 15 — plnšie rozloženie, ostrejšie fotky (2026-09-25)

**Fotky.** Originály sú 420–880 px JPEG. Build ich znova stratovo kódoval
(WebP q76) a na 2× displejoch ich prehliadač natiahol ~1,6× mäkkým filtrom.
Teraz len klasické spracovanie (`retina()` v `build.py`): mierne potlačenie
blokov, Lanczos na ≤ 1300 px (≤ 1,65×), doostrenie hrán s prahom (hladká
omietka a obloha ostanú čisté), slabý široký lokálny kontrast, WebP q88
raz. Žiadny model, žiadne vymyslené detaily. AI zväčšenie (Real-ESRGAN)
v tomto prostredí zablokovala ochrana (váhy modelu sú pickle súbor).

**Úvod.**
- Citát: obe skutočné vyjadrenia, veľké a malé proti sebe, visiace
  machové úvodzovky (refokus.md — serif ako ľudský hlas; kpr.md — typ za
  obsahom). Predtým jeden citát a prázdna pravá polovica.
- Postup ako stavebný denník (basement.md — hustota skutočného obsahu
  medzi obrovským písmom; igloo.md — mono anotácia): 01 je priamo telefón,
  02 rez domom (dispozícia), 03 rozložený dom (poradie montáže),
  04 hotový interiér; vizualizácie označené.
- Ulica: domy sú pomer jednej výšky podľa okna (≤ 58 vh / 540 px),
  pripnutý rám je vyplnený.

**Stavebný list.** Medzi citátom a bočným stĺpcom bolo ~400 px papiera.
Teraz detail z tej istej fotky (už načítanej) na jeden skutočný prvok
stavby, s popisom „Detail z fotografie · …". Pri 420 px fotke nie.

**Zámerne nechané:** Služby — riadky bez dokladu ostávajú bez obrázka
(vizualizácia by sa tvárila ako dôkaz).

## Fáza 16 — tablet a menu (2026-09-25)

Meraný iPad na výšku (820×1180) dostával telefónne rozloženie a tretina
obrazovky ostávala prázdna.

- **Hero:** dom bol obmedzený na 420 px a nadpis na 64 px uprostred
  vysokej obrazovky; oboje teraz rastie s výškou, ktorá zostane (na
  telefóne naďalej rozhoduje 92vw / 11,5vw — telefóny sú bez zmeny).
- **Tabletová vrstva 600–980 px:** Realizácie párujú fotku a údaje ako
  desktop; obrázky príbehu O nás na plnú šírku; text Steny v dvoch stĺpcoch.
- **Predchádzajúca / ďalšia stavba:** 72 px známky → 96–150 px, obe v riadku.
- **Menu (≤ 820 px):** namiesto roletky s 11 px popismi na 32 px cieľoch
  (neskoršie desktopové pravidlo prebilo zamýšľaných 52 px) celoplošný
  papierový panel: veľké slová (pangram.md, rovnaký hlas ako zoznam
  služieb na úvode), ciele ≥ 56 px, aktuálna stránka machovou s bodkou,
  telefón dole. Zamknutý scroll, Escape zatvára, na tmavých stránkach
  sa do panelu nepreliali svetlé tokeny.

LOCAL: 820×1180, 1180×820, 768×1024, 390×844, 360×740, 1440×900; bundle
z `file://`. Skutočný iPad NOT VALIDATED.

## Fáza 17 — ostrosť a veľké obrazovky (2026-09-25)

**Ostrosť.** Živý web bol jednosúborový bundle s filmom 720 px; dom sa na 1920 /
2560 / 3440 px kreslí 1003 / 1377 / 1729 px široký — film sa naťahoval 1,4–2,4×.
Teraz beží viacstránková zostava (`publish.py`) a film má tri veľkosti: 720, 1200
a nový **2000 px** (Lanczos + jemné doostrenie; zdrojový výrez má ~1330 px).
Výber podľa skutočnej šírky rámu v pixeloch zariadenia; telefóny nikdy nie 2k.

**Proporcie.** Nadpis, text, tlačidlá a legenda úvodu sa nad šírkou tabletu
počítajú z okna (menšie z vw a vh — ultraširoké obrazovky ostanú vyvážené);
hlavička sa škáluje `zoom: var(--hz)` (1 pri 1440×900, max. 2,2). 1440 bez zmeny.

**Subdoména.** ecodomcek.codera.sk: proxy mapuje stránky aj súbory, neznáma adresa
dostane 404 konceptu; koncept má vlastnú CSP bez inline skriptov.

## Fáza 18 — dom najprv sám, potom slovo (2026-09-25)

**Pokyn.** Na začiatku len animácia domu cez celú obrazovku; potom sa dom odsunie
na kraj a zmenší; až potom príde text — o 30 % väčší, v zaujímavejšom písme.

**Choreografia.** Pri prvej návšteve (za reláciu) sa dom stavia cez celé okno,
hlavička aj text čakajú. Keď je postavený, za 1,15 s sa presunie na svoje miesto
v kompozícii (vpravo, na telefóne pod nadpis) a nadpis vyjde po riadkoch. Zdroj:
**lusion** (objekt je prvý herec, obsah prichádza k nemu), **exoape** (pokojné
tempo, jedno gesto naraz). Čitateľnosť nad choreografiou: akýkoľvek vstup
(koliesko, dotyk, kláves, klik, posun) úvod hneď ukončí (0,55 s); po 9 s sa
ukončí sám; opätovné načítanie ani návrat na úvod ho neopakujú; pri obmedzenom
pohybe sa neukáže vôbec — rovno konečné rozloženie.

**Písmo.** Nadpis je **Fraunces** (SOFT 100, WONK 1, opsz 144, váha 340): mäkké,
trochu „ručne rezané“ pätky patria drevu a remeslu viac ako chladný grotesk;
kurzíva *vonia* v zelenej je jediný akcent. Zdroj: **pangram** (písmo ako hrdina,
jedno veľké vyhlásenie), **exoape** (ľahká váha v obrom merítku). Veľkosť
+30 % (1440: 76 → 99 px; telefón 41 → 53 px); stĺpce úvodu 7 : 5 v prospech textu.
Newsreader ostáva pre ostatné nadpisy — Fraunces je len hlas úvodu.

**Oprava 18b — naozaj cez celú obrazovku.** Prvá verzia prispôsobila obrazovke
*rám* filmu, no dom v ňom zaberá len ~62 % šírky a po zložení poschodí aj menej
výšky — na telefóne bol dom počas úvodu dokonca menší ako po ňom. Teraz sa meria
dom sám (obrys z `hero.mp4`, 10 snímok/s): kamera ho počas stavby sleduje
a drží na ~90 % šírky (na výšku 98 %) alebo 86 % výšky; ako poschodia klesajú,
jemne sa priblíži. Záverečné priblíženie filmu (×1,3) sa v úvode urobí naraz
a kamera ho vyrovná, takže obraz neskočí; po 0,6 s pauzy na hotovom dome sa
odsunie. Telefón: dom po úvode 100vw (predtým 128vw), aby sa naozaj zmenšil.

**Oprava 18c — úvod sa naozaj spustí.** Na zariadení sa úvod neukazoval z dvoch
dôvodov: (1) pamätal si „videné“ na celú kartu (sessionStorage), takže obnovenie
stránky ho už nespustilo; (2) pri obnovení prehliadač vráti starú pozíciu
skrolovania a tá sa počítala ako „používateľ skroluje“ — úvod sa hneď preskočil.
Teraz: úvod hrá pri každom čerstvom príchode na úvod (odkaz zvonka, nová karta,
obnovenie); nie pri návrate z podstránky (odkaz, späť, prechod v rámci webu).
Úvod začína hore (`scrollRestoration: manual` len počas neho), obnovenie pozície
v prvej sekunde sa ignoruje. Poistka pre pomalé pripojenie 16 s (predtým 9 s),
aby text neprišiel skôr ako postavený dom.

## Fáza 19 — otvorený dom väčší, popisy pri dome (2026-09-25)

**Pokyn.** Otvorený dom (v polohe vedľa textu) o 20 % väčší; popisy podlaží vedľa
domu, nie pod nadpisom.

**Riešenie.** Mierka otvoreného domu 0,86 → 1,03 (od 1101 px; tablet na šírku
0,92). Popisy sú späť na dome ako technické anotácie (**igloo**: mono
anotácia nad objektom ako na výkrese) — no v **jednom stĺpci vpravo**: od
pravého okraja každého podlažia vodiaca čiara s jantárovým bodom k číslu,
názvu a poznámke (poznámka zalomená na „·“). Ľavé popisy by vošli do nadpisu,
pravé za okraj obrazovky (zmerané na 1024–2560 px), preto scéna pri otváraní
posunie dom doľava presne o toľko, koľko stĺpec potrebuje (meria sa pri každom
prepočte; na 1440 ~110 px, medzera k nadpisu ostáva ≥ 20 px). Tablet na šírku:
len číslo a názov (podlažia sú ~65 px od seba). Telefón a tablet na výšku:
čísla na dome ostávajú, zoznam je pod domom (nie pod nadpisom).

## Fáza 20 — dom sa zväčší po animácii, nie počas nej (2026-09-25)

**Pokyn.** Nezväčšovať dom na začiatku, ale po skončení animácie — vtedy nech je
väčší a celý lepšie viditeľný.

**Úvod.** Kamera už nepribližuje: zmestí celý dom (rozložené poschodia, najvyšší
stav) na obrazovku a pri stavbe len posúva záber, aby dom ostal v strede —
nič sa neoreže.

**Po animácii.** Záverečné priblíženie (`landAim`) už nie je pevné ×1,3, ale
vypočíta sa z rozloženia: dom vyplní priestor napravo od nadpisu a textu
(merané z obdĺžnikov riadkov), nad popiskom vizualizácie, 1,5 % od okraja
obrazovky; na telefóne šírku po 3 % okraje. Výsledok (šírka domu): 1440 px
426 → 548 (+29 %), 1920 → 729, 2560 → 968, telefón 390 314 → 366 (+17 %).
Otváranie scrollom plynulo prejde z tejto veľkosti na otvorený dom (fáza 19).
Okraje filmu sa prelínajú do papiera (maska), aby väčšie priblíženie neukázalo
hranu rámu.

**Oprava 20b — presné čísla od klienta.** Na začiatku o 15 % menší (úvodná
kamera 0,85 × „celý dom na obrazovke“); na kraji o 40 % väčší ako pôvodné
pevné ×1,3 → strop ×1,82, kde to miesto dovolí (medzera k textu 2 %, okraj
1 %). Šírka domu: 1440 px 426 → 593 (+39 %), 1920 +37 %, 2560 +33 %,
1024–1280 +39 %; telefón 314 → 378 (+20 % — viac nedovolí šírka obrazovky).

## Fáza 21 — rozložený dom rovnako veľký ako zložený (2026-09-25)

**Pokyn.** Keď sa dom otvorí po poschodiach, majú ostať rovnako veľké ako zložený
dom (predtým sa pri otváraní zmenšoval na ×1,03).

**Riešenie.** `landAim` počíta aj otvorený stav (OPEN): rovnaká mierka ako
pristátie, rovnaký stred; výšku obmedzuje len menu hore a spodok obrazovky
(popisok vizualizácie sa pri otvorení stratí). Rozložený dom je ~2× vyšší než
zložený, takže vedľa neho už miesto na stĺpec popisov nie je — každé podlažie
má preto štítok priamo na sebe: jantárový bod na okraji podlažia, krátka čiara
a papierový štítok (číslo, názov, poznámka po riadkoch) smerom dovnútra
(**igloo**: anotácia nad objektom). Merané 1024–2560 px: mierka otvoreného =
pristátie (2000×1007: −1,5 %), štítky sa neprekrývajú s textom, s okrajom ani
navzájom. Telefón/tablet na výšku: bez zmeny (čísla na dome, zoznam pod ním —
medzi tlačidlami a spodkom obrazovky sa rozložený dom v plnej veľkosti nezmestí).

## Fáza 22 — postup: vyvážený text a obrázok (2026-09-25)

**Pokyn.** Proporcie textu a obrázka v „Ako to ide“ — ľavá strana bola úplne prázdna.

**Riešenie.** Riadok mal tri stĺpce (číslica · text 15 px · obrázok 16:9 cez polovicu),
ľavé dve tretiny boli číslica a okraj. Teraz jeden textový stĺpec proti jednému
obrázku, 5 : 6 (**basement / onyx**: vlasová mriežka, každá bunka nesie skutočný
obsah; **exoape**: ľahké číslice vo veľkom merítku): číslica 96–230 px, mono
„Krok 1 zo 4“, nadpis 32–66 px, veta 17–26 px na čítanie, zarovnané na stred
obrázka 16:10 (o niečo menšieho). Tmavý panel s telefónom je vycentrovaný.
Telefón: bez zmeny rozloženia, pribudol len počet krokov.

## Fáza 23 — po hodnotení: kratší úvod, Služby, detail, ochrana údajov (2026-09-25)

**Kratší úvod.** Úvodná stránka na počítači 13,6 → 10,9 obrazovky: ulica sa posúva
2,5× rýchlejšie ako skrol (4,8 → 2,7), otváranie domu 130 % → 110 % výšky okna,
„Ako to ide“ v jednom riadku číslo · text · obrázok (bez prázdneho stredu).

**Služby.** Služba s realizáciami vedie najnovšou fotografovanou stavbou vo veľkom
(3 : 2), ďalšie stavby sú pod vetou ako pás náhľadov; všetky vety majú jednu
veľkosť (**refokus**: farba žije vo vnútri práce; **basement**: skutočné riadky).

**Detail realizácie.** Číslo roku bolo z tretiny pod fotkou („202“) — teraz je
vedľa nej celé (merané na všetkých ôsmich stavbách, 1024–2560 px). Susedná stavba
bez fotky má prerušovaný rámček „bez fotky“ ako na ulici.

**Ochrana osobných údajov.** Nová stránka, len overiteľné fakty (formulár nič
neodosiela ani neukladá, žiadne cookies, hosting Vercel, práva podľa GDPR);
označená ako návrh pre ostrú verziu — dobu uchovávania doplní EcoDomček. Odkaz
vo formulári a v pätičke; proxy ju púšťa aj na subdoméne.

Štítok „Koncept redizajnu“ a noindex ostávajú (rozhodnutie klienta: zatiaľ ukážka
pre EcoDomček).

## Fáza 24 — aby to nebola „ďalšia AI stránka" (2026-09-25)

Diagnóza (merané na 17 stránkach): 121 anglických pomlčiek „—", 21 z 56 nadpisov s jedným
zeleným kurzívnym slovom, ~500 štítkov verzálkami v mono, 164 „·", fotobankové vizualizácie,
nadpisy-slogany, ktoré som napísal ja.

1. **Slovenská typografia** — `typeset()` v builde: „–" s medzerami, pevné medzery za
   jednopísmenovými slovami, skupiny číslic, „·" → čiarka. Výsledok: 0 „—", 0 „·" v texte
   (ostáva len v ich slogane pod logom „EKO·LOGICKÉ, EKO·NOMICKÉ").
2. **Nadpisy bez zeleného slova** — zelená kurzíva ostala len v úvode („kde *vonia* drevo"),
   z 21 na 1.
3. **Ich hlas** — nadpisy z ich vlastných viet (CONTENT_INVENTORY §3–§7): „Všetko máme, všetko
   spravíme.", „Máme radi výzvy.", „Roboty sa nebojíme.", „Makli sme ostošesť.", „Poradíme,
   prekonzultujeme. Zdarma ;)", „Kariéra staviteľa sa začala písať v roku 2007." — sadzba
   `.voice` v pätkovom písme s úvodzovkami: iný typ nadpisu pre citát ako pre štruktúru
   (**refokus**: grotesk pre štruktúru, pätkové pre ľudský hlas).
4. **Menej štítkov** — dekoratívne preč („Kde sme to robili", „Ďalšie stavby", „Krok n zo 4");
   ostatné bez verzálok a prestrkania, menu v textovom písme.
5. **Kresby namiesto AI vizualizácií** — `src/drawings.py` (XDoG) pre rez a rozložený dom
   v „Ako to ide" a na O nás; rez stenou ako vektorový výkres so šrafami (`wall_section()`,
   7 vrstiev z C.WALL, hrúbky sú schéma — skutočné dodá klient); leto/zima ako schéma nad
   kresbou (**igloo**: anotácia ako inžiniersky výkres). Vizualizácie ostávajú len tam, kde
   stránka hovorí práve o nich (detail Lúčina) a úvodný film.
6. **Strieška z loga** — deliace čiary sa na začiatku zdvihnú do plochého štítu v hrúbke čiary;
   odrážky v zozname služieb sú ich trojfarebné logo.

**Oprava 24b — kresby späť na vizualizácie (klient, 2026-09-26).** Bod 5 (kresby perom,
výkres steny, schéma leta a zimy) klient vrátil: „čo si menil kresby, chcem vrátiť späť ako to
bolo". Vizualizácie sú späť na všetkých miestach, `src/drawings.py` a `draw-*.jpg` sú zmazané.
Ostatné body fázy 24 ostávajú.

## Fáza 25 — „Stena dýcha" ako výkres, nie ako šum (2026-09-26)

Klient: „nevyzerá to vôbec profesionálne". Diagnóza pôvodného plátna: 270 náhodných bodiek
a čiarok bez smeru (čítalo sa ako televízny šum), sedem takmer rovnakých hnedých pásov,
latovanie ako plávajúce obdĺžniky, náhodná oranžová vlnovka, popisy otočené o 90° v nízkom
kontraste, žiadne ohnisko.

Nové riešenie v `initVapour()`:

- **Rez stenou kreslený stavbárskymi značkami** (**igloo**: mono anotácia ako vrstva
  inžinierskeho výkresu): rhombus dosky v reze s otvorenými škárami, šrafa 45° pre
  drevovláknitú dosku, serpentína mäkkej izolácie, fólia čiarkobodkou, latovanie v predstene
  ako rezané drevo s krížom a chránička, sadrokartón bodkovaný, ťažšie čiary na vonkajších
  lícach a čiary prerušenia hore a dole, kde stena pokračuje.
- **Popisy ako vlajky na stožiaroch** v hornom okraji výkresu. Vlajka, ktorá by zakryla
  stožiar napravo, vystúpi vyššie, takže žiadna čiara nekríži text (merané: 0 prekryvov
  pri 390 až 1920 px). Na telefóne ostanú na výkrese čísla a názvy nesie zoznam `.vkey` pod
  ním, ktorý sa dá ťuknúť.
- **Para ako mäkké svetlo so stopou** (**activetheory**): vzniká v izbe v pomalom rytme
  nádychu (≈ 6,5 s), teplá v izbe, neutrálna v stene, chladná v medzere. Pri parobrzde sa
  zdrží, takže je vidno „brzdí, ale neuzatvára", a vetraná medzera ju vynesie hore.
  Kvalitatívne, žiadne čísla.
- **Vstup → odpoveď hneď** (**lusion**): hover alebo ťuknutie rozsvieti vrstvu, ostatné
  ustúpia a veta pod výkresom sa zmení. Redukovaný pohyb dostane jeden ustálený snímok toho
  istého toku.

**25b — materiály namiesto čiar (klient, 2026-09-26).** Výkres klient zhodnotil ako
„nie je to dobré" a z ponúknutých ciest vybral realistický rez. `src/section.py` kreslí rez
stenou v materiáloch:
- smrekovcové rhombus dosky s letokruhmi v reze a otvorenými škárami;
- tmavá vetraná medzera s latou;
- lisované drevovlákno;
- voľné vlákna izolácie;
- tenká fólia;
- rezané laty predsteny s chráničkou;
- sadrokartón s papierom a maľbou.

Svetlo je nízke a z izby teplé, aby para ako svetlo nad materiálom vynikla (**lusion**: predmet
ako exponát na tmavom javisku). Šírky vrstiev sú rovnaké ako `VBANDS`, preto zvýraznená vrstva
sedí presne na svojom materiáli. Pri výbere sa vrstva vysunie so svetlým okrajom a ostatné
stmavnú. Vlajky s popismi ostali (**igloo**: anotácia nad objektom). Obraz je procedurálny,
lebo generovanie obrázkov tu nebolo k dispozícii (Higgsfield 0,4 kreditu, `FAL_KEY` nie je
nastavený). Ak sa neskôr vyrobí fotorealistický render s rovnakými šírkami, nahradí
`sec-*.webp` bez zmeny kódu. Kým sa obraz načíta, stojí na jeho mieste výkres z fázy 25.
