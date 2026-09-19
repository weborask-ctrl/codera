# Opravná iterácia: bodky, uzavretie útesu, skenovaný materiál

2026-09-19. Lokálne, bez pushu. Ocean shader a zdrojový Blender/GLB nezmenené.

## Izolácia bodiek

Rovnaký hero a následne priblížený záber boli porovnané s neosvetleným materiálom, obyčajným PBR bez vlastného shaderu, plným shaderom a plným shaderom bez násobenia kaustikami. Prvé vzdialené porovnanie nesprávne naznačovalo samotný vzor kože; detail ukázal bodky aj na prísavkách bez kožného vzoru. Rozhodujúci test: vypnutie iba násobenia svetelnými odleskami odstránilo bodky, bez zásahu do geometrie.

Oprava zachováva odlesky, ale nahrádza mocniny explicitným násobením s kladnou dolnou hranicou a chráni výpočet pred neplatnými vzorkami wave mapy. Ide o numerickú chybu tejto shaderovej vrstvy; test nerozlišuje, ktorá konkrétna optimalizácia ovládača spôsobila chybný pixel. Nie je to nedokončené načítanie modelu. Po opätovnom zapnutí opravenej vrstvy sa bodky v kontrolovaných detailoch pracovnej ani vyššej kvality nezobrazovali.

Pokožka navyše dostala širšie jemné farebné prechody, menej lesklý povrch a jemné vrásnenie s potlačením detailu pod veľkosťou pixelu. Diagnostické URL zostávajú dostupné na opakovanie kontroly: `?inspect`, `?inspect&surface=pbr`, `?inspect&surface=unlit`. Bežný náhľad tieto parametre nepoužíva.

## Geometria útesu

Pôvodná scéna mala prednú plochu, dutinu a zadný disk; vonkajšie zadné a bočné plochy chýbali. Doplnila sa zadná plocha s výstupom a spojovací obvod. Prvá verzia uzavretia vyzerala ako odrezaný blok, preto sa pred odovzdaním zmenil obvod na oblejší, rozčlenila sa zadná plocha a spojili vrcholy/normály celého povrchu. Ďalší reliéf je aj v geometrii, nielen v materiáli. Dno prekrýva spodnú časť masívu.

Výstup chobotnice teraz vedie najprv zadným otvorom, až potom bokom. Tvar sa nezmenšuje ani nevybledne. Topologický test konštruuje skutočnú geometriu s materiálovými závislosťami nahradenými jednoduchým materiálom: **16 000 trojuholníkov, 24 000 hrán, každá hrana zdieľaná práve dvoma plochami**. Test potvrdzuje uzavretie, nie úplnú kolíznu simuláciu ramien.

## Materiály a referencie

Útes a brána používajú tri lokálne 2K fotografické mapy **Rock Boulder Cracked** od Poly Haven (CC0): farba, výška a drsnosť. Mapovanie z troch smerov zabraňuje naťahovaniu textúry na nových bokoch. Súbory sú súčasťou projektu, približne 6,3 MB na disku, bez externých požiadaviek pri prezeraní. Pôvod a overené MD5: `experiments/jellyfish/textures/SOURCES.md`.

- https://polyhaven.com/a/rock_boulder_cracked — fotografický skalný materiál, licencia a autori.
- https://ocean.si.edu/ocean-life/invertebrates/how-octopuses-and-squids-change-color — referenčný kontext pokožky.
- https://greatsouthernreef.com/jurien-bay-monitoring-2025 — podvodné vápencové oblúky a porasty, referencia vyhľadaná pri iterácii.

## Overenie a hodnotenie

- `check-reef-shell.mjs`, `check-gate-path.mjs`, `check-swim-controller.mjs`: PASS.
- Syntax siedmich zmenených runtime modulov a `git diff --check`: PASS.
- Živá kontrola detailu hlavy a ramien, pohybu, obletu útesu a priechodu bránou; desktop aj mobil 390 × 844.
- Bez zachytenej shaderovej/konzolovej chyby a bez horizontálneho pretečenia na mobile.
- Pracovný režim približne 26–28 fps, mobilný priechod 28 fps. Vyššia kvalita pri veľkom detaile 18 fps, buffer 1093 × 646. Pracovná kvalita obnovená. Nejde o Full HD benchmark.
- Plný Next build sa nespúšťal, upravený je samostatný prototyp.

Hodnotenie: konkrétna numerická chyba kaustík opravená a útes už nemá otvorený zadok. Fotografické pukliny a reliéf skaly sú výrazne konkrétnejšie než pôvodný šum. Chobotnica však stále pôsobí ako pracovný 3D model; jej tvar, prísavky a detail kože ešte nedosahujú filmový fotorealizmus. Táto iterácia ho nevyhlasuje za dokončený.
