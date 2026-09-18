# Chobotnica: plán viditeľného posunu

2026-09-19. Plán na žiadosť Marcusa; nejde o schválenie aktuálneho vzhľadu ani o implementáciu ďalšej iterácie.

## Smer a referencie

Zachovať čelný pohľad, obe oči, veľkú medenú chobotnicu, ramená prevažne do strán a nadol a schválené more. Používateľská biela referencia určuje kompozíciu. Fotografie reálnej chobotnice určujú anatómiu a materiál.

- [Monterey Bay Aquarium – Giant Pacific octopus exhibit](https://www.montereybayaquarium.org/visit/exhibits/giant-pacific-octopus/): vizuálne prezretá hlavná fotografia oka, kožných záhybov a prísaviek, stránka obsahuje aj ďalšie fotografie a video.
- [Monterey Bay Aquarium – profil zvieraťa](https://www.montereybayaquarium.org/animals-the-ocean/animals-a-to-z/giant-pacific-octopus): biologická referencia.
- [Adobe – Damien Guimoneau, tvorba filmového tvora](https://blog.adobe.com/en/publish/2025/05/06/creature-artist-damien-guimoneau-reflect-helping-substance-3d-painter-grow): oddelenie modelovania, animovateľnej topológie a materiálového spracovania.
- [Adobe – Subsurface Parameters](https://experienceleague.adobe.com/en/docs/substance-3d-painter/using/features/subsurface-scattering/subsurface-parameters): rozptyl svetla v koži závisí od mierky a má výkonnostné náklady.

Zdrojové fotografie sú referencie; nie sú automaticky licencované na použitie v produkčnom webe. Video bolo nájdené na stránke, nie analyzované po snímkach.

## Pravidlo porovnávania

Pred každým krokom uložiť predchádzajúci stav. Porovnávať rovnakú kameru, rozlíšenie, svetlo a čas animácie: celok spredu, diagnostický mierny bočný pohľad a detail cieľovej oblasti. Dočasne vypnúť pohyb. Zmenu hodnotiť podľa uvedeného kritéria, nie podľa počtu pridaných funkcií. Oceán zostáva zamknutý.

## Iterácie

1. **Hlava a silueta.** Prepracovať pomer plášťa, oblasti očí a koreňov ramien. Odstrániť vajcovitý vrch s dvomi guľatými objímkami; vytvoriť bočné očné objemy a mäkké prechody podľa fotografie. Kontrola v sivom materiáli spredu aj mierne zboku. Kritérium: presvedčivý živý tvar bez farby a lesku. Ak ani po cielenej oprave geometria neprejde, nepokračovať textúrami: nahradiť obmedzujúcu implicitnú konštrukciu detailným modelom s upraviteľnou povrchovou sieťou.

2. **Oči a ich okolie.** Najprv vyriešiť jedno oko: jeho uloženie, kožné záhyby, nepravidelný okraj, tmavú zrenicu, dúhovku a rohovku. Potom preniesť princíp na druhé s drobnou asymetriou. Kritérium: detail vyzerá ako oko v mäkkom tkanive, bez nalepenej kruhovej obruby; odraz reaguje na kameru.

3. **Ramená a prísavky.** Premenlivý prierez ramien, stlačenie a záhyby na vnútornej strane oblúka, plynulé zúženie, rozlíšenie chrbtovej a spodnej strany. Prísavky ako mäkké objemy s okrajom, hrdlom a dutinou, rôzne veľkosti pozdĺž ramena. Kritérium: celok nepôsobí ako zväzok hadíc; detail nemá prekrývajúce sa ani odtrhnuté prísavky. Kontrola aj pri malej skúšobnej deformácii.

4. **Koža podľa oblastí.** Samostatne riešiť väčšie záhyby, drobné výrastky a mikroskopickú štruktúru. Rozdielne spracovanie plášťa, očného okolia, chrbta ramien a spodnej strany. Pripraviť detailný zdroj a preniesť jeho jemný reliéf do máp pre web; nevynucovať všetko iba zvýšením počtu trojuholníkov. Kritérium: koža ostáva kožou pri mäkkom bočnom svetle a bez lesku; nevzniká vzhľad kameňa, plesne ani rovnomerného šumu.

5. **Svetlo v tkanive a vo vode.** Až teraz ladiť rozptyl pod povrchom podľa hrúbky, mäkkosť odleskov, lokálne tiene a útlm vzdialenejších ramien. Zachovať čitateľný čelný pohľad; neprekrývať nedostatky rozmazaním alebo tmou. Kritérium: ostrý statický záber drží pohromade s morom, koža nepôsobí kovovo ani voskovo. Výkon overiť pred zvýšením počtu vzoriek.

6. **Život a webový výkon.** Pokojné dýchanie plášťa, oneskorený pohyb ramien a ohyb zachovávajúci objem. Následne webová optimalizácia geometrie a textúr, úrovne kvality, kontrola detailu/celku/mobilu a pauzy. Kritérium: pohyb nezráža tvar, prísavky držia na povrchu a zmeraný výkon zodpovedá zvolenému režimu. Väčšia scrollová choreografia nadväzuje až na schválený model; medzi portfóliovými ukážkami sa neanimuje.

## Kontrolný bod

Po iterácii 2 porovnať detail hlavy s fotografickou referenciou. Ak stále vyzerá ako hračka, nepokračovať pridávaním efektov. Vrátiť sa k modelu a zmeniť modelovaciu metódu. Existujúci model je prototyp, nie záväzok zachovať jeho geometriu.

Počet iterácií je pracovný plán, nie záruka fotorealizmu. Každý krok má priniesť konkrétny vizuálny rozdiel a uložený stav v Gite.

## Iteration 1 implementation — head and silhouette

2026-09-19. Marcus explicitly selected step 1 only.

- Repositioned and tilted the mantle behind the head; enlarged the bake bounds to retain the rear surface.
- Reshaped the central head mass and blended lateral eye supports. Moved the eyes inward/back and reduced the existing protruding rim geometry; detailed eyelid/iris work remains step 2.
- Reduced crown/web volume while retaining the existing distal arm paths and material/light setup.
- Added `angle` review parameter, clamped to -90..90 degrees. Front clay: `octopus-look.html?clay=1`; oblique clay: `octopus-look.html?clay=1&angle=35`.
- A first transverse head shape looked like a horizontal band in the oblique review; narrowed and lengthened that transition before delivery.

Verified front and 35-degree oblique clay views, no console errors, syntax and binary integrity. Mesh: 148,740 vertices, 297,400 triangles, 10,113,368 bytes. Current eye surfaces remain placeholders for step 2. This stage is ready for Marcus's visual assessment, not a declaration of photorealism or approval. No section layout, ocean or scroll choreography changes.

## Iteration 2 implementation — eyes and surrounding tissue

2026-09-19. Marcus selected step 2 with photorealism as the target.

- Recessed iris beneath a separate transparent corneal dome. Cornea has its own live-water reflection and direct-light specular response; excluded from opaque shadow rendering. Matte clay review suppresses the corneal overlay.
- Refined iris fibers, amber variation and horizontal pupil edge. The iris itself is rougher and no longer serves as the outer glossy surface.
- Replaced the uniform rim with a wider skin apron, upper/lower fold variation and subtle asymmetry. Visual review exposed an overly separated outer edge; the apron now extends deeper into the surrounding head and the opening is narrower.
- Lens winding corrected for front-face rendering. Existing body, arms, ocean and scroll behavior untouched.

Checked frontal detail and 30-degree oblique detail in the live browser, with no console errors; JavaScript syntax and diff checks pass. This is an eye construction improvement, not a declaration that the full creature is photorealistic. Eye sockets still have a pronounced dark edge under this lighting and should be assessed by Marcus before treating the step as visually approved. No new 4K/performance claim.

## Iteration 3 implementation — arms and suckers

2026-09-19. Marcus approved the direction and requested step 3.

- Shared curvature-based arm sections flatten in tighter bends and widen reciprocally to preserve approximate cross-sectional area. Applied consistently to the baked field and analytical tips. Added restrained radius variation and inner-bend folds; original arm paths retained.
- Rebuilt cup anchors against the altered surface; removed the old circular-radius minimum that would leave cups floating above a flattened surface.
- Reworked cup profile into a short stalk, soft lip and deeper cavity with slight oval/asymmetric variation. Kept one ring per authored profile station to avoid unnecessary triangles.
- Added a functional `Detail ramien` review view in the study controls.

Verified whole view and arm close-up at two idle animation phases, no console errors and no obvious detached cups in the inspected views. Syntax, binary integrity and finite anchor checks passed. Skin mesh: 149,946 vertices / 299,820 triangles / 10,195,472 bytes; 460 baked anchors (the visible subset excludes proximal dorsal web).

This is a base-pose/idle check, not validation of future large scroll-driven deformations or collision-free animation. Detailed regional skin treatment remains step 4. Head, eyes and approved ocean were not redesigned in this pass.

## Iteration 4 implementation — regional skin

2026-09-19. Marcus requested step 4 with a photographic/cinematic target.

- Added object-space anatomical masks for mantle, orbital skin, dorsal arms and ventral arm surfaces. Masks follow the existing deformation; there are no projected screen-space color patches.
- Mantle uses a darker copper/wine palette and rougher response; dorsal arms retain finer mottling; ventral surfaces and sucker tissue are lighter and smoother.
- Added restrained eye-surround folds and fine ventral stretch folds. Separated their amplitudes from the mantle papilla relief.
- Tightened screen-footprint filtering of high-frequency detail to reduce unresolved sparkle. Reduced the pale ventral region near the crown after visual review.
- Implemented as procedural material fields over the existing sculpt; this pass does not add exported image texture maps or change the geometry, eyes, ocean or motion system.

Verified close-up in the natural viewport and whole material at a Full HD viewport, with no console/shader errors. Syntax and diff checks passed. Photorealism remains an artistic target rather than a completed quality claim; the next planned step is lighting/subsurface integration. No new 4K or frame-rate claim.
