# Skalná brána — postup a kontrola

## 1. Plán (2026-09-19)

Po normálne scrollovanom portfóliu kamera obíde pravú stranu útesu. Odhalí rovnakú chobotnicu na opačnej strane, sleduje ju ku skalnej bráne a prejde otvorom do voľného modrého priestoru. Pri službách sa pohyb upokojí. Trasa je obojsmerná, definovaná vo svetových súradniciach. Žiadne samostatné animácie medzi ukážkami.

Geometria: súvislý erodovaný oblúk, zapustené opory, sedimentové vrstvy, menšie porasty. Svetlo a vodné vzory z existujúceho prostredia, zachovanie ocean shaderu. Detail pridávať na skalu, nie plošným rozmazaním obrazu. Kamera musí prejsť voľným otvorom, nie povrchom skaly.

Obsah: Stratégia, Dizajn, Vývoj z https://www.codera.sk/ (overené pri realizácii), bez prenášania cien, ktoré sa líšia medzi online výpisom a lokálnou konfiguráciou. Veľké nadpisy, bez dekoratívnych čísel.

Súčasne izolovať regresiu čiernych bodiek na chobotnici: kontrola prijímania vlastného tieňa a jemného reliéfu. Zachovať pohyb a plavecké klipy.

## 2. Realizácia

Nový modul brány, testovateľná trasa kamery a tela, nadväzujúca scroll sekcia a obsah služieb. Existujúca prvá cesta a pokojné portfólio ostávajú funkčné.

## 3. Povinná kritická kontrola

Kontrolné polohy: pred bránou, bok skaly, stred otvoru, po priechode a služby. Zhodnotiť tvar, mierku, materiál, svetlo, prekrytie textu, mobil a fps. Po prvom zobrazení urobiť opravnú vizuálnu úpravu a zaznamenať výsledok aj zostávajúce obmedzenia. Nepushovať.

## Výsledok realizácie a následného dolaďovania

Všetky tri kroky vykonané v jednom pracovnom ťahu. Prechod nasleduje až po poslednej ukážke. Odkaz pod portfóliom vedie na začiatok brány. Chobotnica pokračuje z pôvodného úkrytu; kamera obchádza pravú stranu útesu, natočí pohľad k bráne, prejde otvorom a pri službách zastane. Obsah Stratégia/Dizajn/Vývoj prevzatý z existujúcej Codery. Portfólio má naďalej bežné scrollovanie.

Prvá vizuálna kontrola odhalila príliš silný šum reliéfu a vlastného tieňa skaly, priamu trasu cez oblasť pôvodnej steny, svetlé polygonálne balvany a mobilné orezanie chobotnice. Pred odovzdaním opravené:

- kamera vedie poza pravý okraj pôvodného útesu; otvor má numericky overenú vôľu,
- skala má jemnejší reliéf, sedimentové vrstvy, tienenie tvarom a doplnkové modré odrazené svetlo,
- menšie kamene majú zvarené vrcholy, hladšie normály, bohatšiu geometriu a zladenú farbu,
- mobilná kamera sleduje telo samostatne, zachováva rovnakú cestu svetom,
- prijímanie vlastného nízkorozlíšeného tieňa na chobotnici je vypnuté; model stále vrhá tieň na podklad,
- odstránené problematické vysokofrekvenčné perturbácie normály pokožky; teplejšia farba kože a prísaviek,
- kontakt s pôvodným otvorom sa počas novej cesty neprehráva; jeho pevné body sa nepoužívajú na opačnej strane útesu,
- zmena rozmerov portfólia po načítaní obrázkov aktualizuje scroll hranice cez ResizeObserver.

Overenie: syntax modulov, `git diff --check`, `node scripts/check-gate-path.mjs` a `node scripts/check-swim-controller.mjs` prešli. Test trasy kontroluje 2000 vzoriek pre desktop aj mobil, kontinuitu, obídenie pôvodnej steny, vôľu kamery v otvore a deterministické vzorkovanie. Nie je to kolízny test každého ramena.

Živý prehliadač: pred bránou, v otvore, po priechode, služby, spätný scroll a návrat do hero. Mobil 390 × 844 bez horizontálneho pretečenia; po opravnom kroku chobotnica v mobilnom otvore vycentrovaná. Bez zachytených shaderových/konzolových chýb. Pracovný režim približne 26–29 fps (desktop buffer 555 × 484, mobil 292 × 633), vyššia kvalita hero približne 22 fps pri 740 × 646. Náhľad vrátený do pracovného režimu. Tieto čísla nie sú benchmark Full HD.

Kritické hodnotenie: prechod má väčšiu priestorovú zmenu než predchádzajúce odplávanie a povrchy sú po kontrolnom kole čistejšie. Tvar brány zostáva rozpoznateľne procedurálny; realistickejšia geológia, autorské detaily koralov a presná fyzika ramien zostávajú rezervou. Žiadne tvrdenie o dokončenom fotorealizme. Ocean shader a Blender/GLB zdroje sa nemenili. Plný Next build sa nespúšťal, ide o samostatný prototyp.
