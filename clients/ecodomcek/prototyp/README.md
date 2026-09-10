# Prototyp prechádzky domom — fotoreálna verzia

`python3 build.py` poskladá `index.html` z `template.html` a záberov
v `renders/`. Obrázky sa inlinujú ako base64, takže výstup je jeden
samostatný súbor (~2 MB).

Publikované: https://claude.ai/code/artifact/ec635947-fb5c-4b60-91e2-41bc54e1c3c9

## Architektúra

Svet je **scroll-scrubovaná sekvencia pred-renderovaných záberov**, nie
realtime 3D. Je to lekcia z 08 §9 (Arqitel je scroll-scrubované video
z C4D; Cula skončila pri pre-renderovaných videách) a je zapísaná
v PLAN.md §6. Prvá verzia prototypu túto lekciu porušila — bol to
realtime three.js blockout a vyzeral ako kreslený. Nahradená 2026-09-10.

- 9 záberov = 9 beatov, cross-dissolve podľa scrollu + pomalý push
  (still dýcha, neleží mŕtvy)
- text v DOM nad svetom, ENTER → čitateľný HOLD → EXIT
- GSAP + ScrollTrigger, natívny scroll, žiadna smooth-scroll vrstva
- `?beat=N` podrží jednu zastávku (static-frame test)

## Zábery

Vygenerované ako architektonické vizualizácie podľa proporcií a
materiálov skutočnej realizácie *Rodinný dom Lúčina, 2024* (rhombus
smrekovec + antracitové kompaktné dosky, konzola nad vstupom, svah).
**Nie sú to fotografie realizácie.** Finálne rendery vzniknú z výkresov
a fotiek domu — vizualizácie sú označené priamo na stránke.

`beat0` exteriér ráno · `beat1` fasáda · `beat2` prah · `beat3` obývačka
s kozubom · `beat4` rez stenou · `beat5` kuchyňa · `beat6` terasa
a záhrada · `beat7` z vtáčej perspektívy · `beat8` večer
