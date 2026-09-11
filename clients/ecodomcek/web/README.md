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
| 01 | Rozložený dom | full-bleed kresba vpravo, typografia cez ňu vľavo |
| 02 | Štyri vrstvy | sticky kresba + legenda, ktorá sa rozsvecuje |
| 03 | Hotový dom | široký 21:9 záber + riadok faktov |
| 04 | O nás | **serif**, žiadny obrázok, pieskový pás — typografický oddych |
| 05 | Konštrukcia | machový pás: kresba + hustá tabuľka skladby |
| 06 | Izby | tri rámy v rade s posunutým stredným |
| 07 | Realizácie | projektový index, thumbnail sleduje kurzor |
| 08 | Ako to ide | štyri číslované kroky + index dvanástich služieb |
| 09 | Večer | jeden široký záber bez textu |
| 10 | Kontakt | tmavý akt, veľký telefón, formulár |
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

## Zábery

Architektonické vizualizácie podľa proporcií a materiálov realizácie
*Rodinný dom Lúčina, 2024* — **nie fotografie realizácie**, označené
v pätičke. Thumbnaily v projektovom indexe sú naopak **skutočné fotky**
realizácií zo súčasného webu klienta.

## Testovanie

`?sec=N` vyrenderuje jeden akt samostatne, `?sec=1&step=2` konkrétny krok
v sticky akte. Testovací režim vypína prechody — headless Chromium ich
neposúva spoľahlivo a inak sa zábery chytia uprostred animácie.
