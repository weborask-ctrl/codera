# Chobotnica — prvý základ

> Aktuálny stav: pôvodný základ bol nahradený súvislým prepracovaním podľa schváleného obrazového smeru. Podrobnosti nižšie v časti „Prepracovanie podľa referencie“. Historické poznámky opisujú odmietnutý prvý model.

Marcus vybral veľkú, farebnú chobotnicu ako nový nosný objekt a schválil iteratívny vývoj. Medúza už nie je zvolený smer. More v commite `a4bfa95` výslovne schválil ako finálny vizuálny základ; bez ďalšieho zadania ho nemeníme.

Náhľad: http://127.0.0.1:4317/octopus-look.html po spustení `npm run prototype:jellyfish`.

## Teraz

- Veľký procedurálny model: plášť, hlava, oči, osem ramien s rozdielnymi dráhami a zatočenými koncami.
- Dva rady prísavkových lemov na ramenách, spojené do jedného mesh objektu pre vykresľovanie.
- Medená, bordová a jemná tyrkysová pigmentácia, priestorový šum namiesto bitmapovej textúry.
- Spoločná deformácia ramien a prísaviek, aby sa pri prvom pohybe neoddeľovali.
- Celok a detail, úsporná aj plná kvalita. Na úzkej obrazovke menšia mierka modelu.
- Samostatný modul modelu a náhľad. Používa schválený shader mora bez jeho úpravy; pôvodný náhľad mora aj medúzy zostáva dostupný.

## Poradie ďalších iterácií

1. Silueta a póza: asymetrickejšie prekríženie ramien, väčšia hĺbka a výraznejšia osobnosť. Aktuálne je to zámerne čitateľný rozprestretý základ.
2. Anatómia: plynulé napojenie plášťa, hlavy a ramien, medziramenná blana, precíznejšie oči a duté prísavky. Súčasné prísavky sú len geometrické lemy.
3. Materiál: papily a jemný reliéf kože, lokálna vlhkosť, pigmentové bunky a presvietenie tenkých častí. Aktuálny šum a osvetlenie sú aproximáciou, nie finálna filmová koža.
4. Pohyb: nezávislé ohýbanie a stáčanie ramien, reakcia na pohyb tela, pomalé dýchanie plášťa. Aktuálne ide o jednoduché spoločné vlnenie, nie svalovú simuláciu.
5. Kamera a scroll: až po potvrdení tvora. Portfólio bez animácií medzi jednotlivými ukážkami.

Prvú iteráciu neoznačovať ako fotorealistický finálny objekt. Nosnosť, póza a materiál sa majú ďalej schvaľovať na živých iteráciách podobne ako more.

Overenie: syntax modelu a náhľadu prešla. Celok aj detail vizuálne overené pri 1920 × 1080; približne 15–17 fps na aktuálnom PC, bez zachytených chýb v konzole. Pohľad vrátený na celok a bežnú veľkosť okna. Mobilný hardvér a 4K s chobotnicou zatiaľ neoverené. Oči zatiaľ pôsobia príliš vystúpene a prísavkové lemy sa miestami zarezávajú do ramien; opraviť pri anatomickej iterácii.

## Prepracovanie podľa referencie — 2026-09-19

Marcus odmietol prvý radiálny model a požiadal najprv obrazový návrh. Schválil smer `docs/design/octopus-film-concept-v1.png` s požiadavkou na trochu menší objekt. Následne schválil jeden súvislý realizačný krok s internými kontrolami namiesto schvaľovania každej drobnej úpravy.

### Čo sa zmenilo

- Jedna súvislá plocha plášťa a hlavy, naklonená podľa referencie. Pôvodné oddelené gule a čelná póza odstránené.
- Osem individuálne navrhnutých priestorových dráh: veľké predné rameno, zdvihnuté rameno, vzdialené ramená a rôzne stočené konce. Korunu dopĺňajú krátke medziramenné plochy.
- Prísavky sú uzavreté profilované misky so stopkou, lemom a vnútornou priehlbinou. Rozstup závisí od aktuálneho priemeru ramena, aby sa veľké prísavky pri koreni neprekrývali ako v prvom pokuse.
- Jedno dominantné zapustené oko s dúhovkou, horizontálnou zrenicou, drobným odleskom a kožným lemom. Zodpovedá zvolenému pohľadu, nie anatomickej štúdii všetkých strán.
- Geometrický jemný reliéf, filtrovaná procedurálna pigmentácia a normálový reliéf kože. Teplý pigment sa kombinuje s chladným vodným svetlom.
- Vlastná tieňová mapa 1024² používa tú istú deformáciu ako viditeľná geometria. Koža navyše odoberá pohyblivé svetelné pole z existujúcej mapy mora.
- Ramená a prísavky zdieľajú váhu a fázu deformácie. Plášť jemne dýcha; telo sa pomaly natáča. Normály reagujú na deformáciu.
- Celok a detail zostávajú dostupné. Mobilný celok upravuje mierku. More sa nemenilo.

### Kontrola a limity

Celok a detail kontrolované vo Full HD; mobilná kompozícia pri 390 × 844. Pauza udržala počítadlo na 9 snímkach medzi dvoma odčítaniami. Syntax modulov a diff kontrola prešli. Pri priebežnom meraní bol celok približne 17 fps, detail približne 11–13 fps na aktuálnom PC; ide o krátke pozorovania pred posledným filtrovaním pigmentácie, nie o výkonnostný sľub finálnej verzie. Fyzický mobilný GPU a 4K s novým modelom neoverené.

Výsledok je výrazne bližší referencii tvarom a pózou, ale nie je hotovou fotorealistickou reprodukciou obrázka. Procedurálna koža v makre stále pôsobí pravidelnejšie než prirodzené tkanivo. Spoje koruny, oblet zo zadnej strany, samoprekrývanie ramien a jemný pohyb potrebujú ďalšie posúdenie. Deformácia je umelecká animácia, nie svalová simulácia; detailná dráha kamery a scroll príbeh nie sú súčasťou tohto modelového kroku.

Celý kód, referencia aj tento záznam patria do repozitára. Nahradený prvý model je dohľadateľný v commite `3358d86`; nový výsledok neoznačovať za používateľom schválený, kým ho Marcus neposúdi.

## Facing pose and skin refinement — 2026-09-19

Marcus requested a more viewer-facing starting pose with less artificial arms, plus the previously identified skin and arm-root refinement. This is a base pose for later animation, not the final motion choreography.

- Turned the animal toward the viewer (yaw -0.48 radians), with a smaller idle rotation range.
- Re-authored all eight arm paths: open bends, varied depth and fewer repeated spirals. Varied the orientation of the sucker-bearing surfaces.
- Added a fleshy crown over the buried roots, corrected web adjacency, and moved the first suckers away from the crowded attachment area.
- Warped the procedural skin coordinates, softened pale mottles and relief, and varied roughness with skin detail.
- Ocean files remain unchanged.

Verified the whole pose and material close-up in the live browser at its natural viewport; no console errors. Final crown change checked in the whole view. Syntax and diff checks passed. Remaining limitation: procedural geometry still reads as CG in close-up; this is not a claim of photographic parity or a fully rigged, collision-free animation model.
