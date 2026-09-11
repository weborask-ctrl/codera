# Prototyp — dom ako predmet, ktorý sa dá rozobrať

`python3 build2.py` poskladá `index2.html` z `template2.html`, `stage.css`,
`content.py` a záberov v `renders/`. Obrázky sa inlinujú, výstup je jeden
súbor (~1,9 MB).

Publikované: https://claude.ai/code/artifact/ec635947-fb5c-4b60-91e2-41bc54e1c3c9

## Zákon layoutu

**Obrázok nikdy nie je pozadie.** Každý záber žije v ráme (`.stage`)
v mriežke stránky, text je vedľa neho. Rám je `position: sticky` — drží,
kým beží jeho akt, potom pustí. Natívny scroll, žiadna smooth-scroll
vrstva, žiadny pin.

Predchádzajúca verzia mala fotky na celú plochu s textom cez ne. Ondrej
to odmietol („nechcem aby to boli v pozadí"), a mal pravdu: fullbleed
fotka s textom navrchu je tapeta, nie exponát.

## Dva akty

**ACT 1 — DOM** (5 krokov, jeden sticky rám, štyri zábery). Stránka
**otvára rozloženým domom**: strecha, poschodie, prízemie a základová
doska plávajú od seba, každá vrstva má číslo na kresbe a názov v legende
vedľa. Potom sa dom **poskladá** — rám prejde na zloženú axonometriu
z rovnakého uhla a rovnakého pozadia, takže crossfade číta ako montáž.
Nasleduje hotový dom na svahu s číslami na fasáde a nakoniec rez domom
s izbami.

**ACT 2 — PRECHÁDZKA** (6 krokov). Rez stenou, obývačka, kuchyňa, terasa,
realizácie, kontakt. Rovnaká gramatika: jeden rám, text vedľa. Kontakt
prepne stránku do večerného tmavého aktu.

## Zábery

Architektonické vizualizácie podľa proporcií a materiálov skutočnej
realizácie *Rodinný dom Lúčina, 2024*. **Nie sú to fotografie realizácie** —
označené priamo na stránke pod každým rámom. Finálne rendery vzniknú
z výkresov.

`explod` rozložený na vrstvy · `axon` zložený (rovnaký uhol ako explod,
kvôli crossfade montáže) · `hero` celý dom na svahu · `rez` otvorený dom
· `beat3` obývačka · `beat4` rez stenou · `beat5` kuchyňa · `beat6` terasa
· `beat7` z výšky · `beat8` večer

## Testovanie

`?step=N` vyrenderuje jeden krok samostatne na začiatku dokumentu
(static-frame test). Headless prehliadač po programovom scrolle fotí od
začiatku dokumentu, nie viewport — preto krok prichádza za nami, nie my
zaň.
