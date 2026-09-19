# Morský svet — Film I

2026-09-19. Nadväzuje na schválenú chobotnicu Film IV (19daba1). Rozsah: ryby, mušle, riasy, korály a povrch skál. Schválený shader mora a model/animácie chobotnice zostali nezmenené. Bez pushu.

## Čo sa zmenilo

- Štyri ryby inšpirované útesovými druhmi: odlišné proporcie, plynulý profil tela, zaoblený predok, oči, žiabrové viečka, ústa, chvost a samostatné plutvy. Farba a jemné šupiny sú v zabalených 1024² mapách farby a normál. Nie sú to fotografické skeny.
- Plutvy majú vlastný materiál, štruktúru lúčov a miernu priehľadnosť. Web zachováva exportované PBR materiály. Nezamieňa ich za jednotnú farbu.
- Chvost sa ohýba plynulo smerom od tela, prsné plutvy majú jemný samostatný pohyb. Každý jedinec má vlastnú fázu. Normály povrchu sa deformujú spolu s geometriou.
- Ryby plávajú v oddelených priestoroch po stranách trasy, v odlišných hĺbkach. Po Marcusovej úprave rozmiestnenia je 91 jedincov rozdelených do 14 úsekov od hladiny cez obchádzku útesu, bránu, terasu a hlbokú stenu až po dno. Vzdialenejšie ryby sú menšie, jedince majú rôzne smery plávania. Záverečné pristátie má vyhradený voľný koridor. Nie je to plná simulácia húfu či kolízií.
- Mušle: hrebenatka, slávka a ustrica majú rozdielnu geometriu, materiál a rastové vrstvy. Hrebenatka/ustrica majú hrúbku okraja; už nejde o tri prefarbené kópie jedného tvaru.
- **Mušle nepatria na skalnú bránu.** Sú iba na piesku a útesoch. Brána je explicitne vylúčená z cieľov osádzania mušlí. Dno má osem priestorov s voľne roztrúsenými menšími mušľami; na prvom útese sa orientujú podľa jeho povrchu, mimo vstupu chobotnice.
- Riasa má uchytenie, stonky, vzduchové mechúriky a zvlnené listy. Pohyb sa zvyšuje smerom od koreňa. Rastliny sú štylizáciou chaluhy pre túto výtvarnú scénu, nie rekonštrukciou presného biotopu.
- Korály: vetvená kolónia, nepravidelný prepojený vejár a tenké tanierové kolónie. Pôvodné pomocné valčeky v útesoch a bráne boli odstránené. Nové korály sa uchytávajú raycastom na skutočnom povrchu.
- Skaly si zachovávajú fotografické CC0 textúry. Geometria má plochejšie zlomy a vrstvy; materiál pridáva jemné škáry a teplejšie povrchové usadeniny. Priechody a uzavretý plášť útesu sú zachované.
- Statické kolónie sú rozdelené podľa priestorov, aby sa vzdialená vegetácia nemusela stále kresliť. Geometria a textúry sa zdieľajú cez inštancie.

## Zdroje a pokračovanie na inom PC

Cloudový Blender projekt: https://higgsfield.ai/3d-jutsu/49bd5c85-e487-4f5d-aa08-de7c8ccad3f1

Finálna revízia tejto iterácie: **4**, sceneSequence **0**. Prenosný GLB má 50 428 256 bajtov (48,1 MiB); Blender zdroj 56 740 235 bajtov. MD5 oboch stiahnutých súborov zodpovedá cloudovým artefaktom. Ide o pracovné zdrojové rozlíšenie. Pred produkčným nasadením treba pripraviť komprimované textúry a menší prvotný prenos.

- `scripts/marine-film-library.py`: vytvorí editovateľné modely, UV a zabalené textúry.
- `scripts/marine-film-head-refine.py`: nadväzujúca korekcia prednej časti rýb; spustiť raz po základnom skripte.
- `scripts/marine-film-stage.py`: konečné svetlá a rozmiestnenie modelov v kontrolnom Blender náhľade.
- `experiments/jellyfish/marine-film.glb`: prenosný súbor používaný priamo webom.
- `assets/blender/marine/codera-marine-film.blend`: editovateľný zdroj s vloženými obrázkami.
- `assets/blender/marine/library-review.png`: kontrolný render knižnice.
- `experiments/jellyfish/marine-film.mjs`: import, zachovanie materiálov a deformácia počas plávania/prúdenia.
- `experiments/jellyfish/marine-world.mjs`: rozmiestnenie, trasy a inštancovanie.

Spustenie: `node scripts/jellyfish-preview.mjs`. Celý web: `/dive.html`. Zväčšené modely s prepínačom a otáčaním: `/marine-look.html`.

Skripty používajú `artifacts` iba na publikovanie kontrolného renderu v cloude. Pre lokálny Blender nahraď túto časť vlastnou cestou renderu a uložením `.blend`/exportom GLB. Nevyžadujú generované video.

## Referencie

- [Georgia Aquarium — Blue tang](https://www.georgiaaquarium.org/animal/blue-tang-surgeonfish/): profil tela, malé šupiny, chrbtová plutva a umiestnenie očí.
- [Monterey Bay Aquarium — Giant kelp](https://www.montereybayaquarium.org/animals-the-ocean/animals-a-to-z/giant-kelp): stavba listov, stoniek a uchytenia.
- [NOAA — Soft corals](https://oceanservice.noaa.gov/education/tutorial_corals/media/supp_coral03c.html): vizuálna rozmanitosť mäkkých korálov.
- [NOAA — Coral reefs](https://floridakeys.noaa.gov/corals/coralreefs.html): rastové formy korálov a vejárov.

Referenčné fotografie neboli skopírované do produkčných textúr.

## Overenie a zostávajúca práca

Integračný test načíta skutočné binárne geometrie z GLB a zapojí ich do sveta. Overuje aj to, že všetkých päť materiálových častí každej ryby má počas pohybu rovnaké transformácie; oči a plutvy teda nezostávajú za telom. Priehľadnosť plutiev je prítomná v exporte. Export obsahuje 157 464 vrcholov naprieč 11 modelmi.

Test rozmiestnenia overuje počas 600 sekúnd prítomnosť rýb vo všetkých siedmich širokých hĺbkových pásmach aj voľné finálne pristátie. Samostatná geometrická situácia s vyvýšenou bránou overuje, že mušle zostanú na dne a neuchytia sa na bránu.

`check-marine-film.mjs` overuje skutočný GLB: všetkých 11 koreňov modelov, metre/orientáciu, platnú geometriu, UV a vložené PBR mapy. `check-marine-assets.mjs` overuje aj konečné rozmiestnenie rýb počas 600 sekúnd a voľný koridor okolo oboch miest pristátia. Test uzavretia útesu zachováva 16 000 trojuholníkov a 24 000 hrán s presne dvoma susednými plochami. Testy trás brány, zostupu a finále prešli.

V prehliadači kontrolované ryby zblízka, útes, finále a priechod bránou. Prvá kontrola pri 740 × 646 ukázala približne 25 fps pri hladine a 14 fps pri detailnom útesu; nejde o garantovaný výkon ani meranie na inom zariadení.

Finálny import sa skontroloval aj pri mobilnom rozmere 390 × 844: kontakt zostal čitateľný, ryby neobsadili pristátie a v prehliadači sa neobjavili shaderové chyby. Nastavenie viewportu bolo následne vrátené na desktop. Pri bráne bola po vizuálnej kontrole opravená výška uchytenia vegetácie nad balvanmi.

Toto je detailnejšia knižnica pre živý web, nie uzavretý produkčný fotorealizmus. Zblízka zostáva pri rybách priestor pre mäkké tkanivo hlavy, nepravidelnejšiu pigmentáciu a druhovo presnejšie plutvy. Korály ešte potrebujú jemnejšie organické odchýlky; útesy výraznejšie geologické zlomy vo veľkom meradle. Súčasná priehľadnosť plutiev je jednoduché alfa miešanie, nie úplné rozptyľovanie svetla v tkanive. Kraby a morské koníky táto iterácia nemení.
