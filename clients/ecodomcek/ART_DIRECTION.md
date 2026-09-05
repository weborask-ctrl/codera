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
