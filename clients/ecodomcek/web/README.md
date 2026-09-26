# EcoDomček — stránka

Viacstránkový statický web. `python3 src/build.py` poskladá `dist/` zo
zdrojov v `src/` a obrázkov v `renders/`:

```
node src/fonts.mjs                               # only when a face changes
python3 src/build.py
python3 -m http.server 8080 --directory dist     # http://localhost:8080/
```

Jeden súbor na stiahnutie: `python3 src/bundle.py` → `dist/ecodomcek.html` (2,9 MB, všetky
stránky ako `<template>`, router na hash, funguje z `file://`). Každý obrázok je v súbore raz:
živá stránka nesie data URI s menom (`data-a`), ostatné sú v `window.__A` a šablóny majú len
tokeny `#a:meno`. Písma sú vlastné (`src/fonts/`) a vložené, takže súbor nerobí žiadnu
externú požiadavku.

Publikované: https://claude.ai/code/artifact/ec635947-fb5c-4b60-91e2-41bc54e1c3c9

## Zdroje

| Súbor | Čo je v ňom |
| --- | --- |
| `src/content.py` | **každý reťazec na webe** — firma, 12 služieb, 8 realizácií, 2 referencie, proces; klientove vety sú VERBATIM |
| `src/pages.py` | sedem typov stránok, každý s iným tvarom; zdieľané komponenty |
| `src/build.py` | shell (hlavička, pätička, meta), assety, zápis `dist/` |
| `src/site.css`, `src/site.js` | jeden motion engine (GSAP + ScrollTrigger na natívnom scrolle), router s papierovou oponou |
| `src/fonts.mjs` | orezané woff2 do `src/fonts/` (potrebuje `subset-font` z node_modules repozitára); stránka ich má samohostované, nie z fonts.googleapis.com — build kopíruje hotové súbory a nič nesťahuje |
| `src/section.py` | rez stenou v materiáloch pre „Stena dýcha“ na Technológii (`renders/sec-l.webp`, `sec-s.webp`); procedurálne, šírky vrstiev = `VBANDS` v `pages.py`, spúšťa sa ručne `python3 src/section.py` a výsledok sa commitne |
| `src/shots.cjs` | full-page zábery každej stránky (Playwright, desktop + mobil) |
| `renders/` | vizualizácie domu z Lúčiny, štyri alfa vrstvy, kresba (`ink-4-150.json`), `photos/` = skutočné fotky realizácií |

## Stránky (15 dokumentov)

| Stránka | Tvar |
| --- | --- |
| `index.html` | **plagát**: obrí nadpis „Vitajte vo svete, / kde vonia drevo.“ a dom medzi riadkami — kresba sa pri načítaní sama vykreslí a dom sa postaví (bez scrollu); scroll vrstvy znovu nadvihne · služby ako obrie slová · machový teaser steny · vizualizácia + register realizácií · jedno vyjadrenie cez celú šírku · proces · kontakt |
| `stena.html` | **5D stena**: sedem vrstiev z Higgsfield renderu (`renders/wall-b.png` → `wall-*.webp`), ktoré sa ťahom, scrollom alebo šípkami roztiahnu; každá vrstva dostane meno a jednu vetu, meter zvonku → dnu |
| `realizacie.html` | filtre s reálnymi počtami · veľký rám nesie vizualizácia (označená) · osem rovnakých štvorcových kariet — fotka sa nikdy nezobrazí väčšia, než je |
| `realizacia-*.html` ×8 | **stavebný list**: obria číslica roka, ktorá beží za doskou · doska sa po príchode vyvolá zdola nahor a vytlačí okótované úrovne (vlastné `specs` projektu) · hairline tabuľka faktov + služby, ktoré na stavbe boli · citát stavbyvedúceho vo veľkom so zoznamom realizácií z rovnakej kategórie · pager; Lúčina má navyše vizualizačný blok |
| `sluzby.html` | **register s dôkazmi**: obsah v mastheade (počty len tam, kde máme dôkaz) · pri každej službe klientov háčik serifom, názov groteskom, jeho text a realizácie, kde ju naozaj robil (na mobile posun prstom); služba bez dôkazu nesie jeho hlas vo väčšom · Konzultácie majú telefón priamo v riadku |
| `technologia.html` | **prečo tomu veriť**: klientova vlastná pochybnosť + 200+ rokov v USA a Kanade · živý rez stenou, ktorým para tečie z izby von (hover/ťuk na vrstvu = jej veta; na mobile otočený) · „V lete chladí, v zime je teplučký“ cez dve vizualizácie · register materiálov s odkazmi na stavby · motto |
| `o-nas.html` | jednostĺpcová esej v serife s rokmi na okraji · motto · dve vyjadrenia ako hairline riadky · prvotina |
| `kontakt.html` | začína v súmraku, prechádza do papiera; formulár + údaje |

## Písma

Tri rezy, všetky samohostované a orezané (`src/fonts.mjs`, 175 KB v 4 súboroch):
Hanken Grotesk 300–500, Newsreader 200–300 s opsz osou, IBM Plex Mono 400 a 500.
Orez drží Basic Latin, Latin-1, **Latin Extended-A** (č ď ľ ĺ ň ŕ š ť ž), všeobecnú
interpunkciu (slovenské „úvodzovky", pomlčky), euro a šípky.

Do 2026-09-18 si stránka ťahala všetky tri rodiny z `fonts.googleapis.com` na každom
načítaní. Render-blokujúca požiadavka na tretiu stranu, IP každého návštevníka ide
Googlu, a presný opak toho, čo robí web štúdia. Stránka teraz nenačítava **nič**
externé — ani písma, ani GSAP.

## Lišta

Tri oddelené pilulky: značka · stránky · telefón + Dopyt. Nad tmavými pásmi sa invertujú.

## Router

Odkazy na vlastné stránky zachytí `site.js`: papierová opona vyjde zdola,
pod ňou sa `fetch`-ne ďalší dokument a vymení `<main>`, opona odíde hore.
Každá stránka je pritom úplný dokument — bez JS funguje normálna navigácia,
`pageshow` rieši bfcache, `prefers-reduced-motion` oponu vynechá.

## Obrázky — pravidlá

- **Skutočná fotka sa nikdy nezobrazí väčšia než jej zdroj.** Máme 800 px orezy
  (`renders/photos/`, z `../compositions/`) pre šesť stavieb a 420 px náhľad pre
  Veľkú terasu. Žiadny AI upscale — dopisoval by fasádu, ktorú klient postavil inak.
- **Garážo-sklado-terasa (2019) je bez fotky.** Jediný kandidát (`thumbs/t2019b.jpg`)
  je tá istá scéna ako Veľká terasa 2021 — na starom webe bola pri garáži cudzia fotka.
  Stránka má poctivú prázdnu platňu „Fotografiu doplní EcoDomček"; na stavebnom liste
  drží celú kresbu s okótovanými úrovňami a stráca len obraz.
- **Veľká rodina (2023) je orezaná o 22 px zhora** — klientov orez niesol biely pás
  a malý klin. Orezané jedným rezom z `../compositions/velka-rodina.jpg`, nič sa
  nedokresľovalo (800×692 → 800×670). Rozmery zdrojov drží `SHOTSIZE` v `src/pages.py`.
- Vizualizácie domu z Lúčiny (1500–1600 px) nesú veľké rámy a sú vždy označené
  „vizualizácia".

## Čo treba od klienta

Originály fotiek z WordPressu (Médiá → pôvodný súbor) alebo `wp-content/uploads`;
fotky garáže 2019; ku každej stavbe celok + detail + priebeh; interiér a hotový
exteriér Lúčiny; pôdorysy Lúčiny + súhlas majiteľa; hrúbky vrstiev a U-hodnota;
vyjasniť „difúzne otvorená" vs. „uzatvorená"; zvyšné 4 referencie so súhlasom;
logo v krivkách. Potvrdiť: chráni EcoDomček drevo bóraxom (na starom webe len obrázková dlaždica — z webu sme to stiahli)? Je Roman Chovanec aj stavbyvedúci, alebo len konateľ (dnes píšeme len konateľ)? Vyrábajú sa steny v hale, alebo na stavbe (veta o hale bola vymyslená a je preč)?

## Testovanie

`node src/shots.cjs realizacie.html sluzby.html …` nad `python3 -m http.server 8811
--directory dist` (potrebuje `NODE_PATH=/opt/node22/lib/node_modules`). Na úvode
`?sec=0&step=3&p=0.66` ukáže konkrétny stav hera.

## Úvodný film (fal.ai) — hotový: `renders/fal/hero.mp4`

`src/fal_hero.py` potrebuje `FAL_KEY` v nastaveniach prostredia. Tri kroky, každý nanajvýš
jedna platená úloha:

1. `close` — najprv zadarmo `guide`: zavretý dom poskladaný z tých istých `lyr-*.webp` v kamere
   štartu (`renders/fal/guide-closed.jpg`; polohy vrstiev a o koľko ktorá klesne sú v `AT`
   a `SEAT`). Spoje nesedia, lebo vrstvy sú z rozloženého AI renderu (tak zlyhal MiniMax H3),
   preto ich Nano Banana Pro (`fal-ai/nano-banana-pro/edit`, 2K, 16:9) len začistí. Výstup sa
   zmenší na 1920×1080 a pozadie nad obrysom poskladaného domu sa prefarbí farbou pozadia
   (`clear_above`) → `renders/fal/end-closed.jpg`.
2. `check` — zadarmo: základová doska sa nesmie pohnúť, šírka domu sa nesmie zmeniť, dom
   musí byť nižší. Len PASS pustí ďalej.
3. `film` — Kling v3 Pro (`fal-ai/kling-video/v3/pro/image-to-video`, `start_image_url` +
   `end_image_url`, 5 s, bez zvuku) → `renders/fal/hero.mp4`.

`renders/fal/start-exploded.jpg` je zložený z tých istých `lyr-*.webp`, ktoré používa web.

### Ceny v účte (fal pricing API, 2026-09-24)

| Krok | Model | Cena |
| --- | --- | --- |
| `close` | Nano Banana Pro | 0,15 $ za obrázok (1K aj 2K; 4K dvojnásobok) |
| `close` (pokus 1) | FLUX Kontext Pro | 0,04 $ za obrázok |
| `film` | Kling v3 Pro, 5 s | API účtu 0,14 $/s → 0,70 $; stránka modelu 0,112 $/s bez zvuku → 0,56 $ |

Zostatok kreditu sa s týmto kľúčom prečítať nedá — billing vracia 403.

### Pokus 1 — 2026-09-24: FAIL

`close` s Kontext Pro (request `01a0d4ff-2216-7f62-aa92-208ce0f78aab`, 0,04 $):

    start box x 282-691 y 48-509 | closed box x 283-693 y 76-452 | FAIL — the edit moved the camera; do not film it

Kontext dom **nezavrel** — všetky štyri úrovne ostali rozostúpené — a prerenderoval ho z nižšej,
plochšej kamery: spodok základovej dosky sa posunul o 57 px hore (pri 960×540, limit 6),
interiéry stratili detail. Záber leží v `renders/fal/close-1-kontext-pro-FAIL.jpg`, mimo mena
`end-closed.jpg`, aby ho `film` nemohol vziať. Kontext navyše vracia 1392×752, nie 16:9: aj
záber, ktorý by `check` prešiel, treba pred `film` vrátiť na 1920×1080, inak sa prvý a posledný
záber filmu nezhodujú.

### Pokus 2 — 2026-09-24: FAIL

`close` s Nano Banana Pro (request `01a0d516-fdf2-7162-a9d9-bb4136814e3b`, 0,15 $), výstup
2752×1536 zmenšený na 1920×1080:

    start box x 282-691 y 48-509 | closed box x 185-737 y 72-476 | FAIL — the edit moved the camera; do not film it

Dom **zavrel** (súvislý dvojpodlažný dom, okná poschodia aj prístavok sedia), ale záber
prekomponoval: dom je asi 1,2× väčší a posunutý do stredu, spodok dosky sa posunul o 33 px hore.
Z dosky urobil väčšiu terasu, prízemiu dal spredu zvislé lamely a vľavo pridal vrhnutý tieň.
Ľavý okraj boxu (185) je ten tieň, dom sám začína na 245. Ani po zmenšení na ×0,83 doska
nesedí na štartovú, takže film by menil práve tú časť, ktorá sa hýbať nemá. Záber leží
v `renders/fal/close-2-nano-banana-pro-FAIL.jpg`.

### Pokus 3 — 2026-09-24: PASS

`close` nad `guide-closed.jpg` (request `01a0d527-e050-7772-bf62-b67aac92f69b`, 0,15 $):

    start box x 282-691 y 48-509 | closed box x 282-691 y 274-510 | PASS

Kamera, mierka aj doska sú zo štartu, model uzavrel rezom otvorené prízemie. Nad domom
dokreslil sivú rozmazanú škvrnu (tam, kde predtým visela strecha). `check` ju nevidí, lebo meria
len box, preto ju `clear_above` prefarbí pozadím. Box pred čistením bol y 133-510. Rozdiel voči
štartu: obklad je v zábere zvislými doskami a pozadie je o 2 odtiene teplejšie. Spolu za
`close` 0,34 $.

### Film — 2026-09-24

Kling v3 Pro (request `01a0d529-e16b-78c3-956f-5a0593e92a1e`, 5 s bez zvuku, 0,56–0,70 $),
1920×1080, 24 fps, 121 snímok, 10,7 MB. Kamera stojí: box na snímkach 0/24/48/72/96/120
drží x 280–691 a spodok 508–510. Prvá a posledná snímka sa od štartu a konca líšia
v priemere o 1,9 a 1,4 z 255. Poradie: prízemie na dosku, poschodie, strecha. Obklad
prejde z vodorovného na zvislý počas skladania.

Na web ešte nie je zapojený a pre web treba menší súbor (10,7 MB je priveľa pre úvod).

## Spustiteľnosť

- **Kanonické URL a zdieľanie**: každá stránka má `canonical` a `og:*` na `https://www.ecodomcek.sk/`
  (`SITE` v `content.py`). Karta pri zdieľaní je `assets/og.jpg` (1200×630, generuje ju
  `share_card()` v `build.py` z tých istých vrstiev a písma ako hero); detail realizácie
  zdieľa vlastnú fotku.
- **Vyhľadávače**: `sitemap.xml`, `robots.txt`; na úvode JSON-LD `GeneralContractor` len z
  overených údajov (názov, IČO, IČ DPH, adresa, telefón, e-mail, vznik 1. 1. 2017, konateľ).
  Žiadne hodnotenia, otváracie hodiny ani oblasť pôsobenia — tie nemáme.
- **Obrázky**: stránky načítavajú WebP (kvalita 76: −23 %, najhoršie PSNR 35 dB), JPEG ostáva
  len pre zdieľanie. Každý `<img>` má `width`/`height`, layout pri načítaní neposkakuje.
- **Formulár** (`kontakt.html`): server zatiaľ nie je, takže otvorí e-mail návštevníka s hotovým
  dopytom na `dobryden@ecodomcek.sk`. Bez JS nesie aspoň predmet a text. Na ostrom hostingu ho
  treba napojiť na skutočné odosielanie (napr. funkcia hostingu) — rozhodne to hosting.

### Zapojenie do hera

`python3 src/film.py` spraví z `renders/fal/hero.mp4` webový film do `renders/film/`: každú snímku
doladí na papier stránky (surový film kolíše 241–248 v R), okraje prelnie do papiera, oreže na
plátno vrstiev 1500×1119 a zakóduje H.264 + VP9 v 1200 a 720 px (10,7 MB → 739/661 KB, mobil
350/337 KB). V hero sa najprv vykreslí kresba a zhmotnia vrstvy presne v polohe prvej snímky,
potom film dom zavrie a kamera sa priblíži na zavretý dom. Zablokované automatické prehrávanie
alebo film, ktorý nezačne do 6 s → vrstvy dosadnú ako predtým. Reduced motion → statický zavretý
dom. Počas filmu je nadpis nad domom (film nemá alfa kanál). Bundle nesie 720 px WebM aj MP4.

## Náhľad na tablete / telefóne

`public/demos/ecodomcek/` je zostava webu (stránky + `assets/`) pre web Codera —
**ecodomcek.codera.sk** (proxy.ts mapuje každú cestu) a www.codera.sk/demos/ecodomcek/:
`python3 src/build.py && python3 src/publish.py`. Viacstránková zostava, nie jednosúborový
bundle: každá obrazovka si stiahne film vo veľkosti, v akej ho kreslí (`hero-720/hero/hero-2k`).
Kopíruje len súbory, na ktoré stránky odkazujú; každej stránke pridá `noindex` a štítok
„Koncept redizajnu · Codera" (CLAUDE.md #3).

## Mapa „Kde stoja" (Realizácie)

Obrys Slovenska je z Natural Earth 1:10m (public domain, cez `world-atlas`, ISC),
predspracovaný do `renders/sk.json` skriptom `src/geo.py` (návod v jeho hlavičke).
Miesta realizácií sú v `src/pages.py` (`PLACES`) — stredy obcí, preto „orientačne".

## 404

`dist/404.html` — väčšina hostingov ho vráti pre akúkoľvek zlú adresu. Má
`<base href="/">` (zdroje z koreňa webu, funguje na hlbokých adresách) a `noindex`;
nie je v sitemap ani v jednosúborovom bundli. Ak by web bežal v podpriečinku,
`base` treba upraviť.

## Typografia

`build.py` → `typeset()` prejde každý text stránky: pomlčka „–" s medzerami namiesto „—",
pevná medzera za jednopísmenovými slovami (v, k, s, z, a, o, u, i), neoddeliteľné skupiny číslic
(telefón, 8 000 €), „·" v texte → čiarka. Stačí písať normálne; build to vysadí.
