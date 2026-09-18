# Chobotnica — prvý základ

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
