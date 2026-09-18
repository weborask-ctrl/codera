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

## Frontal reference correction — 2026-09-19

Marcus supplied a white-background frontal octopus reference and clarified that the desired view has the mantle above the arms and both eyes visible. The earlier three-quarter turn did not satisfy that intent.

Rebuilt the mantle vertically, placed both lateral eyes toward the camera, redistributed all eight arm paths around a frontal crown, and biased the larger foreground arms downward. Retained the copper skin and approved ocean. Increased model scale (1.25 at narrow desktop, 1.42 wide desktop, 0.72 portrait) and centered the subject. Extended the mantle into the crown to conceal the neck seam. Idle movement stays restrained; full cinematic material and motion polish is deferred per Marcus.

Live natural-viewport visual check and console check passed. This iteration establishes composition and base pose; it is not a final photorealistic asset. The user-supplied reference remains at the original Desktop/bio path; its visual intent is documented here for handoff.
Reference copied to `docs/design/octopus-frontal-pose-reference.webp` for cross-PC handoff. It is a user-supplied pose reference, not a production site asset.

## Continuous sculpt, material and lighting pass — 2026-09-19

Marcus authorized the three-part plan after rejecting the frontal procedural model as plastic. Implemented an actual geometry replacement rather than only adjusting the prior tube surfaces.

### Geometry

- Offline implicit sculpt joins mantle, head, crown, proximal webbing and all eight arms into one indexed surface. Broader reclined mantle, narrower head transition, lateral eye sockets and less protruding eyelids.
- Shared anatomy lives in `experiments/jellyfish/octopus-anatomy.mjs`. Rebuild with `node scripts/build-octopus-sculpt.mjs` after starting the preview once (the builder imports its pinned cached Three.js runtime).
- Generated `octopus-sculpt.bin`: 151,026 vertices / 301,984 triangles / 9,664,856 bytes. Browser loads the result asynchronously. No voxel generation in the browser. Analytical overlays preserve thin arm tips below the voxel spacing.
- Cup attachment distances are baked against the blended skin in `octopus-cup-anchors.json`. Exposed rows begin below the frontal web; cup bowls are deeper, slightly varied and less prominent.

### Material and light

- Warped multiscale relief, subtle pigment speckles, reduced broad color contrast and softer wet highlights. Lighter underside follows each arm's local orientation.
- Darker cup cavities, quieter iris colors, restrained reflected sky fill, existing surface light and self-shadowing, stronger depth tint and a thin-edge scattering approximation.
- Approved ocean shader unchanged. Framing raised to keep the enlarged model in the Full HD view. Existing slow idle deformation retained; a complete muscular rig and scroll choreography are still pending.
- `octopus-look.html?clay=1` provides a neutral material check.

### Verification and limits

- Live gray geometry review, material close-up, Full HD 1920x1080 and mobile 390x844. Final cup-row change checked on mobile; final default viewport also reviewed.
- Binary layout, finite attributes, unit normals, valid indices and finite cup anchors checked. JavaScript syntax and diff checks passed. No browser console errors during visual checks.
- The mesh is heavier than the previous model; observed mobile-emulated viewport was about 18 fps on this machine. This is not a real mobile GPU benchmark or a 60 fps promise. Full 4K remains untested.
- This is a materially changed CG study, **not final cinematic photorealism**. Eyelid/head character, sculpted microdetail, retopology/LOD and physically convincing arm motion still need attention. The current field mesh is not production animation topology. Do not label it user-approved until Marcus reviews it.
