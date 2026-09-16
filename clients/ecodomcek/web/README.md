# EcoDomček — stránka

Viacstránkový statický web. `python3 src/build.py` poskladá `dist/` zo
zdrojov v `src/` a obrázkov v `renders/`:

```
python3 src/build.py
python3 -m http.server 8080 --directory dist     # http://localhost:8080/
```

Jeden súbor na stiahnutie: `python3 src/bundle.py` → `dist/ecodomcek.html` (5,9 MB, všetky
stránky ako `<template>`, router na hash, funguje z `file://`).

Publikované: https://claude.ai/code/artifact/ec635947-fb5c-4b60-91e2-41bc54e1c3c9

## Zdroje

| Súbor | Čo je v ňom |
| --- | --- |
| `src/content.py` | **každý reťazec na webe** — firma, 12 služieb, 8 realizácií, 2 referencie, proces; klientove vety sú VERBATIM |
| `src/pages.py` | sedem typov stránok, každý s iným tvarom; zdieľané komponenty |
| `src/build.py` | shell (hlavička, pätička, meta), assety, zápis `dist/` |
| `src/site.css`, `src/site.js` | jeden motion engine (GSAP + ScrollTrigger na natívnom scrolle), router s papierovou oponou |
| `src/shots.cjs` | full-page zábery každej stránky (Playwright, desktop + mobil) |
| `renders/` | vizualizácie domu z Lúčiny, štyri alfa vrstvy, kresba (`ink-4-150.json`), `photos/` = skutočné fotky realizácií |

## Stránky (15 dokumentov)

| Stránka | Tvar |
| --- | --- |
| `index.html` | **plagát**: obrí nadpis „Vitajte vo svete, / kde vonia drevo.“ a dom medzi riadkami — kresba sa pri načítaní sama vykreslí a dom sa postaví (bez scrollu); scroll vrstvy znovu nadvihne · služby ako obrie slová · machový teaser steny · vizualizácia + register realizácií · jedno vyjadrenie cez celú šírku · proces · kontakt |
| `stena.html` | **5D stena**: sedem vrstiev z Higgsfield renderu (`renders/wall-b.png` → `wall-*.webp`), ktoré sa ťahom, scrollom alebo šípkami roztiahnu; každá vrstva dostane meno a jednu vetu, meter zvonku → dnu |
| `realizacie.html` | filtre s reálnymi počtami · veľký rám nesie vizualizácia (označená) · osem rovnakých štvorcových kariet — fotka sa nikdy nezobrazí väčšia, než je |
| `realizacia-*.html` ×8 | **stavebný list**: obria číslica roka, ktorá beží za doskou · doska sa po príchode vyvolá zdola nahor a vytlačí okótované úrovne (vlastné `specs` projektu) · hairline tabuľka faktov + služby, ktoré na stavbe boli · citát stavbyvedúceho vo veľkom so zoznamom realizácií z rovnakej kategórie · pager; Lúčina má navyše vizualizačný blok |
| `sluzby.html` | sticky lišta 01–12 + dvanásť riadkov s klientovými textami; pieskové prerušenie pred Konzultáciami |
| `technologia.html` | machový masthead · rozložený dom + legenda · skladba steny (tabuľka je hrdina) · tri interiéry |
| `o-nas.html` | jednostĺpcová esej v serife s rokmi na okraji · motto · dve vyjadrenia ako hairline riadky · prvotina |
| `kontakt.html` | začína v súmraku, prechádza do papiera; formulár + údaje |

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
logo v krivkách.

## Testovanie

`node src/shots.cjs realizacie.html sluzby.html …` nad `python3 -m http.server 8811
--directory dist` (potrebuje `NODE_PATH=/opt/node22/lib/node_modules`). Na úvode
`?sec=0&step=3&p=0.66` ukáže konkrétny stav hera.
