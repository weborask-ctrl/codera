# EcoDomček — stránka

`python3 build.py` poskladá `index.html` z `index.tpl.html`, `site.css`,
`site.js` a záberov v `renders/`. Obrázky sa inlinujú, výstup je jeden
súbor (~2 MB).

Publikované: https://claude.ai/code/artifact/ec635947-fb5c-4b60-91e2-41bc54e1c3c9

## Čo túto verziu odlišuje

Predchádzajúce verzie opakovali jeden a ten istý split screen (obrázok
vpravo, text vľavo) jedenásťkrát. To je presne ten „šablónový" pocit.
`refokus.md` (LIKED) to pomenúva: *„the site feels rich because every
scroll beat delivers a different kind of content, not a different effect."*

**Každý akt má iný TVAR:**

| # | Akt | Tvar |
| --- | --- | --- |
| 01 | Rozložený dom | **5D hero**: dom ako štyri cut-out vrstvy na papieri, scroll ich skladá; text v piatich krokoch, špendlíky + legenda sa rozsvecujú |
| 02 | Hotový dom | široký 21:9 záber + riadok faktov |
| 03 | O nás | **serif**, žiadny obrázok, pieskový pás — typografický oddych |
| 04 | Konštrukcia | machový pás: kresba + hustá tabuľka skladby |
| 05 | Izby | tri rámy v rade s posunutým stredným |
| 06 | Realizácie | projektový index, thumbnail sleduje kurzor |
| 07 | Ako to ide | štyri číslované kroky + index dvanástich služieb |
| 08 | Večer | jeden široký záber bez textu |
| 09 | Kontakt | tmavý akt, veľký telefón, formulár |
| — | Pätička | serif claim + všetky údaje |

**Dva typografické hlasy** (refokus): Hanken Grotesk nesie štruktúru,
Newsreader (serif) nesie ľudské momenty — citát konateľa a claim
v pätičke. IBM Plex Mono ostáva anotačný hlas.

**Farba žije v pásoch, nie v shelli:** papier (default) → piesok (citát)
→ mach (technológia) → papier → súmrak (kontakt, pätička). Hlavička sa
nad tmavými pásmi invertuje.

**Remeslo:** maskované odkrytie nadpisov po riadkoch, clip-path odkrytie
obrázkov, parallax vnútri rámu, bežiaci index vpravo dole, hover stavy
na projektoch a odkazoch, focus-visible.

## Hero: ako sa dom skladá

`renders/segment.py` rozreže `renders/explod.jpg` na štyri vrstvy s alfou
(`lyr-roof/upper/ground/base.webp`, WebP ~145 KB spolu): maska = pixely
odlišné od pozadia, diery vyplnené floodfillom, prízemie od dosky oddelené
vyšším prahom (dotýkajú sa cez mäkký tieň dosky), tieň dosky ostáva v jej
vrstve s mäkkou alfou. `renders/layers2.json` nesie bounding boxy;
`renders/compose.py 30 26 44` poskladá vrstvy s dosadacími posunmi a
vyrenderuje 3× zväčšené švy na kontrolu.

V stránke: `.house` je box s pomerom renderu, každá vrstva má `data-y0`
(rozložená poloha, širšia ako render) a `data-y1` (dosadnutá) v percentách
vlastnej výšky — choreografia tak prežije každý viewport. GSAP timeline
so `scrub` na celý akt: prízemie 0,13–0,30 · poschodie 0,34–0,51 ·
strecha 0,55–0,72 · hold do konca; každé dosadnutie „štuchne" už sediace
vrstvy (thud). Text sú diskrétne kroky (ENTER → HOLD → EXIT), scrubuje sa
len dom. `prefers-reduced-motion` = dom sedí od začiatku.

Zložený render z rovnakej kamery sa nepodaril: dva pokusy s referenciou
(`asm0/asm1`) aj čistiaci prechod nad poskladaným kompozitom zmenili
proporcie (výška 726 vs 937 px), takže crossfade by bol morf. Finálny stav
je preto samotné poskladanie vrstiev.

## Zábery

Architektonické vizualizácie podľa proporcií a materiálov realizácie
*Rodinný dom Lúčina, 2024* — **nie fotografie realizácie**, označené
v pätičke. Thumbnaily v projektovom indexe sú naopak **skutočné fotky**
realizácií zo súčasného webu klienta.

## Testovanie

`?sec=N` vyrenderuje jeden akt samostatne, `?sec=0&step=3&p=0.72` konkrétny
krok hera s domom v danom bode timeline. Reálny scroll (sticky + scrub)
overuje `scroll-test.cjs` (Playwright, `NODE_PATH=/opt/node22/lib/node_modules
node scroll-test.cjs` nad `python3 -m http.server 8810`), zábery v `shots/hero-*`. Testovací režim vypína prechody — headless Chromium ich
neposúva spoľahlivo a inak sa zábery chytia uprostred animácie.
