# Codera — režijný audit a plán finálneho podmorského sveta

Dátum: 2026-09-19. Východisko: lokálny commit b3374c2.
Rozsah tejto práce: bod 1, audit, referencie a plán. Scény ani modely sa týmto dokumentom nemenia. Bez pushu.

## Záväzné zadanie Marcusa

Sekcie stránky sú uzavreté. Zachovať súvislú cestu chobotnice od hero po piesočné dno. Počas portfólia sa medzi jednotlivými ukážkami nespúšťa ďalšia priestorová animácia. Všetky novo dopĺňané objekty majú smerovať k fotorealistickému spracovaniu: definovaná anatómia, objem, povrch, pestré prirodzené farby a vhodný pohyb. Pracovné rozlíšenie môže byť nižšie, cieľová kvalita objektov sa tým neznižuje. Výsledok nesmie byť iba statický obrázok vložený do scény.

- Hero: podstatne väčšia filmová chobotnica, výrazný prvý dojem.
- Prvý útes: veľké pestré 3D korály, odstrániť pochmúrnosť a plošný modrý nádych objektov; farby skál zachovať ako základ.
- Úkryt: preveriť smer vstupu, odstrániť umelosť.
- Ukážky: mierne zmenšiť obraz v každej sekcii, zachovať veľkorysý celok a obyčajné scrollovanie.
- Ryby: viac skutočne odlišných druhov, tvarov, farieb a pohybov.
- Brána: mušle/lastúrniky prirastené k povrchu a podmorská zeleň reagujúca na prúd.
- Zostup: bubliny stúpajúce z otvorov v skalách.
- Skalná zastávka: kraby alebo podobní živočísi na dne a mušle.
- Finále: mušle, morské koníky, ďalšie ryby, zeleň a chobotnica na piesku.
- Hlavné nadpisy veľké a výrazné; žiadne dekoratívne malé číselné označenia sekcií vo finále.

## Čo audit ukázal

Vizuálne skontrolované v živom IAB náhľade: hero, prvý útes/otvor, ukážka Observatórium, priechod bránou, zostup cez hranu, sekcia spolupráce a záver. Kontrola kódu potvrdila nižšie uvedené príčiny. Táto etapa nie je novým benchmarkom výkonu ani kompletným rozborom referenčných videí po snímkach.

1. More má viac vizuálneho detailu než postava. Hero zvýrazňuje tento nepomer. Väčší model potrebuje lepšiu kožu, oči a menej pravidelné ramená; samotné zväčšenie odhalí nedostatky.
2. Útes ovládajú holé skalné plochy. Drobné vetvičky sa čítajú ako suché konáre. Chýbajú veľké organické formy, ich prekrývanie a svetlo medzi nimi.
3. Modrá sa pridáva na viacerých miestach: osvetlenie, násobenie farby v underwater-material a atmosférické miešanie. Zmeniť iba farbu modelov by nestačilo.
4. Ryby sú skutočne zástupné objekty: jedna nízko členitá guľa a kužeľový chvost, spoločný materiál. Potrebujú novú knižnicu modelov, nie len prefarbenie.
5. Chobotnica často opakuje podobnú prednú siluetu aj pri zmene smeru cesty. Smer tela, opora ramien a zrýchlenie ešte netvoria presvedčivý pohyb jedného živočícha.
6. Brána má čitateľný objem, ale chýba jej porast, obývané štrbiny a rozdiel medzi osvetlenou hranou a chráneným vnútrom.
7. Skaly pri zostupe majú miestami hranaté siluety a príliš rovnomerný povrch. Textúra sama neopraví obrys blízkeho objektu.
8. Zastávka pri stene nepreukazuje presvedčivé prichytenie. Chobotnica pôsobí skôr zavesená pred skalou. Potrebujeme body opory, zmenu držania tela a odlepenie pri odchode.
9. Dno má veľké takmer prázdne plochy. Drobné fragmenty ešte nevytvárajú obývané miesto. Piesok miestami pôsobí škvrnito a zelenosivo.
10. Čítacie sekcie majú nápadné začiatky tmavých CSS prekrytí. Farebná atmosféra a kontrast textu potrebujú plynulé nadviazanie, aby nevznikali viditeľné pásy.
11. Dlhé presuny majú zatiaľ málo významových udalostí. Dĺžku prechodov určiť podľa toho, čo návštevník postupne objaví, nie podľa počtu prázdnych výšok obrazovky.
12. Fotografie ukážok sa nezostria automaticky nasadením na doménu. Neskôr treba dodať primerané responzívne zdroje alebo cielene aktivovaný živý náhľad.

## Výtvarný smer

Navrhujem presvetlený tropický útes a zostup do chránenej piesočnej kotliny. Pocit hĺbky bude vychádzať z mierky, parallaxu, prekrytia skál a vzdialenej atmosféry. Záver so zeleňou a koníkmi nebude prezentovaný ako bezsvetelná oceánska priepasť. Ide o autorskú scénu inšpirovanú reálnou prírodou, nie o rekonštrukciu jedného geografického biotopu.

Paleta: tyrkysová a hlboká modrá voda v pozadí; blízke korály v lososovej, marhuľovej, bordovej a tlmenej fialovej; menšie krémové a zlatožlté akcenty. Zeleň olivová až smaragdová, piesok slonovinový s prirodzenými chladnejšími tieňmi. V každom zábere dominujú dve až tri skupiny farieb. Sýtosť vzniká osvetlením a materiálmi, nie globálnym neónovým filtrom.

Fotografické referencie používajú blízke farebné popredie, ryby v strednej vzdialenosti a modré pozadie. Teplé farby korálov podporuje doplnkové osvetlenie. Preniesť tento princíp do našej réžie svetla; schválený ocean-film-shaders.mjs zachovať. Obmedziť plošnú farebnú stratu blízkych objektov v spoločnom materiáli a upraviť svetlá scény.

## Zábery a obsah po scénach

| Scéna | Cieľový záber a nové objekty | Pohyb a prechod | Podmienka prijatia |
|---|---|---|---|
| Hero | Detailná chobotnica zaberá orientačne 70–85 % výšky desktopového záberu vrátane ramien. Oko a povrch plášťa čitateľné, niektoré okrajové ramená môžu ísť mimo obraz. Voľný priestor pri nadpise. | Jemné dýchanie a lokálny pohyb ramien. Pri scrolle sa postava natočí do smeru cesty; kamera ustúpi a odhalí prostredie. Veľkosť meniť hlavne vzdialenosťou, nie zmenšovaním organizmu. | Výrazná silueta aj bez pohybu; žiadny konflikt s textom; detail nepripomína plast. Samostatný mobilný výrez. |
| Farebný útes | 3 dominantné koralové zoskupenia: mäkké rozvetvené, vejárovité a nižšie stolovité/masívne formy. Menšie kolónie, hubky a povlaky v škárach. Otvor zostáva čitateľný. | Postupné odkrytie útesu za blízkym koralom. Menší húf sa rozostúpi pri príchode chobotnice. Polypy a mäkké vetvy reagujú jemne na prúd. | Už široký záber pôsobí ako živý koralový útes. Farby blízkych korálov ostávajú rozlíšiteľné. |
| Vstup do úkrytu | Nepravidelná štrbina/otvor s vhodným vnútorným objemom, bez dokonale kruhového lemu. Korály a lastúry rámujú vstup. | Spomalenie → preskúmanie a dotyk okraja → uchopenie → natočenie a stlačenie tela → postupné vtiahnutie zvyšných ramien. Orientáciu presne určiť podľa vybraného referenčného klipu. | Reálne body kontaktu a čitateľný prenos tela; bez prenikania, zmeny mierky alebo zmiznutia pred úplným zakrytím. |
| Ukážky | Ponechať celú sekciu veľkorysú. Obraz orientačne 82–88 % šírky desktopu, s rozumným maximom; na mobile skoro celá šírka. V jednom zábere má byť čitateľný aj názov a odkaz. | Obyčajný scroll cez všetkých päť ukážok; žiadne presuny chobotnice medzi nimi. | Primeraná mierka, ostré vhodné zdroje, žiadny nový pohybový prechod medzi ukážkami. |
| Brána a služby | Zhluky prirastených lastúrnikov, menšie hubky a porasty v štrbinách. Pri pätách kratšie listovité riasy, pri hrane dlhšie pružné listy. Otvor zostáva priechodný. | Prúd prejde cez listy s oneskorením od bázy po špičku; kamera minie blízky trs. Jedna malá skupina rýb prejde za chobotnicou. Pri čítaní služieb pokoj. | Brána pôsobí obývane; rastliny majú upevnenú bázu, hrúbku a vlastné tiene, nezakrývajú text. |
| Zostup cez hranu a ponuka | Dve až tri lokálne štrbiny s bublinami. Rozmanitejšie skalné vrstvy a menšie porasty na osvetlených rímsach. | Bubliny stúpajú nepravidelne, bočne ich unáša prúd. Kamera s chobotnicou klesá proti nim, čo zvýrazní zostup. V ponuke sa kamera ustáli. | Jasný zdroj bublín, rôzna veľkosť/rozostupy; žiadne biele guľôčky cez celú obrazovku ani rastúce počty častíc. |
| Zastávka pri skale / spolupráca | 1–2 detailné kraby, mušle a drobné úlomky na piesku. Pri stene malý trs zelene. | Chobotnica položí vybrané ramená na skalu; pri čítaní ostáva opretá. Krab krátko prejde bokom a zastane pri škáre; nespúšťať stále tú istú akciu. Odchod začína uvoľnením prísaviek. | Rozpoznateľná opora chobotnice a kontakt nôh kraba s dnom. Žiadne kĺzanie celého modelu. |
| Piesočné finále / kontakt | Piesočná čistinka, polozapustené lastúry, menšie kamienky, riasy a morská tráva po okrajoch. 2–3 koníky pri stonkách, menšie ryby v strednej vzdialenosti. | Mäkké dosadnutie, oneskorené uloženie ramien, jemný lokálny sediment. Koníky sa zachytávajú chvostom a robia krátke presuny, ryby voľnejšie oboplávajú scénu. | Hlavná postava a kontakt zostávajú dominantné. Dno má život aj pri zastavenom scrolle, bez rušného akvária pred textom. |

Rozmery a počty vyššie sú východiská pre kompozíciu, nie záväzok nahustiť všetky objekty do každého záberu.

## Biologické a pohybové rozhodnutia

### Vstup chobotnice

Nemožno potvrdiť univerzálne pravidlo „vždy hlavou napred“. Zaoblená časť za očami je plášť. Výskum MBL zdôrazňuje hmatové skúmanie ramenami; sám neurčuje jediný spôsob vstupu do úkrytu. Popis konkrétneho záznamu Newsflare uvádza najprv ramená, potom vtiahnutie tela. Preto je Marcusova výhrada k umelosti platná, ale jednoduché obrátenie modelu nie je dostatočná oprava.

Pred výrobou finálneho klipu vybrať jeden jasný záznam vstupu z podobného uhla a rozobrať jeho konkrétne fázy. Filmová preferencia: dve ramená vytvoria kontakt, telo sa k otvoru natočí a nasleduje asymetrické vtiahnutie. Variant plášťom napred je možné skúmať, ale teraz ho nevydávať za overenú jedinú biologickú správnosť.

### Jeden prúd, rôzne reakcie

Spoločný smer a pomaly meniaca sa sila prúdu pre riasy, mäkké korály, sediment a bočný drift bublín. Jednotlivé typy majú rozdielnu tuhosť, oneskorenie a amplitúdu. Ryby korigujú smer aktívne. Všetko sa nemá hojdať v jednej fáze.

Pozícia kamery a cesta chobotnice reagujú na scroll. Prostredie pokračuje v čase aj počas čítania. Pri spätnom scrolle sa obracia cesta, nie čas sveta: bubliny stále stúpajú, ryby nezačnú automaticky plávať chvostom napred. Pauza a preferencia obmedzeného pohybu musia fungovať na všetky nové systémy.

### Zeleň, koníky a bubliny

Použiť krátke tropicky pôsobiace makroriasy a morskú trávu. Kelpové videá slúžia ako referencia pružnosti a prúdenia; nepreniesť automaticky celý studenovodný kelpový les do tropických korálov. Koníky dostať k stonkám, kde sa môžu chytať chvostom, nie do rýchleho kruhového húfu.

NOAA dokumentuje bubliny plynu unikajúce zo dna. V našom priestore navrhnúť lokálny výver v štrbine; samotná skala ani chobotnica nevytvárajú dekoratívny vzduch. Pôjde o výtvarne zjednodušený jav, nie simuláciu celej geológie alebo chemického prostredia výveru.

## Knižnica detailných objektov

| Objekt | Čo musí mať model/materiál | Správanie |
|---|---|---|
| Chobotnica | Osem prepojených ramien s meniacim sa prierezom, prirodzený plášť, oči, prísavky s lemom a dutinou; farebné mapy, variácia drsnosti, mikroreliéf a väčšie kožné nerovnosti. | Oddelené pokojové, plavecké a kontaktné správanie; tvary pri deformácii ostanú objemové. |
| Korály | Aspoň 3 rozdielne rodiny tvarov a viac variantov kolónií. Definované polypy, póry alebo korality podľa typu; farebná variácia od bázy ku končekom. | Mäkké časti sa mierne ohýbajú; tvrdé kostry sa nehojdajú ako guma. |
| Ryby | Návrh 4–5 rodín: malé anthias, ploché klipky, bodlok, štíhla pyskavka a malá ryba pri dne. Výber konkrétnych druhov uzavrie referenčný list. Rozdielne siluety, ústa, žiabre, oči, plutvy s lúčmi, šupiny primerané vzdialenosti. | Húf, pokojný oblúk, krátke zrýchlenie a správanie pri dne; vlastné rytmy chvosta a plutiev. Jeden prefarbený model neplní zadanie rozmanitosti. |
| Lastúry a prirastené lastúrniky | 3–4 tvary: rebrovaná vejárovitá lastúra, nepravidelná hrubá lastúra, pretiahnutý lastúrnik, ulita. Hrúbka okraja, rastové línie, opotrebenie, usadenina. | Mŕtve lastúry statické a čiastočne zaborené; živé lastúrniky iba jemne a druhovo primerane. |
| Krab | Jeden kvalitný základ s variantmi. Členený pancier, klepetá, oči, kĺby a povrch. | Krátky bočný pohyb, zastavenie, drobná činnosť klepiet; kroky s kontaktom. |
| Morský koník | Rozpoznateľný profil, korunka, rypák, kostené prstence, zvinuteľný chvost a jemné plutvy. | Vzpriamená poloha, malé korekcie, uchopenie stonky a krátke pomalé presuny. |
| Riasy a tráva | Rozmanité listy, zakrivenie, hrúbka/silueta, jemný povrch, mierne priesvitné okraje pri vhodnom svetle. | Pevná báza, pružná stredná časť, oneskorené špičky. |
| Bubliny a sediment | Priehľadný okraj a odlesk bublín, nenápadné odlišné zrná sedimentu. | Obmedzený počet, definovaný zdroj a životnosť; prúd a vztlak. |

Každý blízky objekt overiť aj samostatne pri neutrálnom svetle. Fotorealizmus sa posudzuje podľa tvaru, materiálu, kontaktu a pohybu, nie podľa rozlíšenia textúry v názve súboru. Generovaný obrázok môže pomôcť navrhnúť záber, nie overiť anatómiu ani nahradiť priestorový model.

## Poradie realizácie a brány kvality

### A. Réžia a farby
Najprv upraviť rámovanie hero, farebnú réžiu útesu, tri vrstvy priestoru a rytmus prechodov. Určiť pevné kontrolné zábery pre desktop a mobil. Mierne zmenšiť náhľady ukážok. Výstupom bude scéna so zrozumiteľnou kompozíciou, pripravená pre detailné objekty. Dočasná kompozícia sa neoznačí za finálny fotorealizmus.

### B. Referenčná kvalita objektov
Vyrobiť jednu hotovú koralovú kolóniu, jednu reprezentatívnu rybu, lastúru a trs rias. Súbežne v pracovnom poradí dotiahnuť chobotnicu pre hero detail. Skontrolovať ich pri neutrálnom svetle a v našom oceáne z najbližšej plánovanej vzdialenosti. Až potom rozširovať varianty a osádzať ich vo väčšom počte.

### C. Živý útes a brána
Z knižnice postaviť farebné zoskupenia, doplniť viac druhov rýb a povrchový život, prepojiť pohyb vegetácie s prúdom. Skontrolovať výkon ešte pred ďalšími scénami. Pri slabšom výkone najprv znížiť vzdialené počty a rozlíšenie, zachovať kvalitu hlavných objektov.

### D. Chobotnica a kontaktné animácie
Samostatné klipy: pokoj vo vode; záber a dojazd pri plávaní; ľavá/pravá zmena smeru; preskúmanie úkrytu a vstup; výstup; opora o skalu a odlepenie; brzdenie nad pieskom a dosadnutie; pokoj na dne. Jeden plavecký klip nepoužívať ako náhradu kontaktu. Klipy pripraviť na plynulé miešanie so scrollovou cestou a na návrat smerom hore.

### E. Kaňon a piesočná kotlina
Doplniť lokálne bubliny, kraby, mušle, koníky, druhy rýb a zeleň pre spodné scény. Doplniť jemný sediment pri dosadnutí a kontaktné tiene. Detail rozmiestniť do zhlukov, zachovať čisté miesto pre chobotnicu a text.

### F. Kritické zjednotenie
Prejsť celú cestu bežnou aj rýchlou rýchlosťou, zastaviť v každej scéne a vrátiť sa späť. Kontrolovať interakcie, kolízie, čitateľnosť, opakovanie modelov, tón svetla a ostré prechody prekrytí. Samostatne mobil a vyššie rozlíšenie. Výsledky a zostávajúce nedostatky zapísať po každom bloku; jedna realizácia zahŕňa vlastnú kritiku a opravu pred odovzdaním.

## Výkon a prenositeľnosť

Aktuálna chobotnica je už hustý model. Pred osadením množstva ďalších rigovaných tvorov treba vytvoriť webovú verziu s detailmi prenesenými do máp a s úrovňami detailu. Detailné zdrojové modely, exporty, textúry, licencie a postup výroby uložiť do repozitára vhodným spôsobom; väčšie súbory posúdiť pred budúcim pushom.

Na tomto PC možno uzavrieť réžiu, svetlá, knižnicu v rozumnom pracovnom detaile, pohyb a integráciu. Náročné modelovanie a pečenie máp bude potrebné robiť podľa skutočne dostupného Blender prostredia alebo na výkonnejšom PC. Nesľubovať automatické dosiahnutie filmovej kvality z jednoduchých procedurálnych tvarov.

Zdieľať geometriu a materiály opakovaných objektov, animovať hlavne viditeľné tvory, jemné šupiny a póry niesť mapami. Priehľadné vrstvy rias/bublín držať pod kontrolou. Orientačný pracovný cieľ je približne 30 fps; po každom bloku merať rovnaké zábery. Nižšie pracovné rozlíšenie nie je ospravedlnenie pre nesprávnu anatómiu alebo nevýraznú farebnosť.

## Referencie a rozsah ich overenia

Zdroje sú inšpirácia a biologická opora, nie automaticky licencované produkčné textúry. Overené stránky, fotografie vo vyhľadávaní a popisy videí. Detailný rozpis konkrétneho den-entry videa po snímkach zostáva súčasťou prípravy klipu v bloku D; netvrdiť, že už bol vykonaný. Higgsfield v tejto etape nebol potrebný: reálne referencie postačujú na audit. Pri nejasnej kompozícii možno neskôr pripraviť jeden cielený návrh.

- [Ikelite / Jeff Milisen — Soft Coral Photography](https://www.ikelite.com/blogs/cheat-sheets/soft-coral-underwater-photography-camera-settings-and-technique): farebné osvetlené popredie, stredná vrstva rýb, modré pozadie; praktická práca so svetlom. Výtvarný princíp prenášame, konkrétnu fotografiu nekopírujeme do scény.
- [NOAA — Types of soft coral](https://oceanservice.noaa.gov/education/tutorial_corals/media/supp_coral03c.html): rozdielne organické formy a farby.
- [Monterey Bay Aquarium — Coral reefs](https://www.montereybayaquarium.org/animals-the-ocean/ecosystems/coral-reefs): štruktúra útesu, rozmanitosť rýb, lastúrnikov a kôrovcov.
- [Monterey Bay Aquarium — Kelp Forest Cam](https://www.montereybayaquarium.org/cams-videos/live-cams/kelp-forest-cam): referenčný zdroj videa pre pružnosť porastu a prúdenie. Nepreberať studenovodný biotop ako celok.
- [MBL — Octopus arm behavior](https://www.mbl.edu/news/how-many-ways-can-octopus-flex-its-supple-arms-now-we-know): hmatové správanie a rozmanité používanie ramien, s videom. Nie dôkaz univerzálneho smeru vstupu do úkrytu.
- [Newsflare — Safe haven, octopus retreat](https://www.newsflare.com/video/719009/safe-haven-watch-an-octopus-retreat-to-its-den-in-china?origin=den): popis konkrétneho záznamu uvádza ramená pred telom. Video zatiaľ neanalyzované po snímkach.
- [Friends of Fitzgerald Marine Reserve — Octopus encounters](https://fitzgeraldreserve.org/octopus-a-night-tidepooling-highlight): referencia videí vrátane vstupu do úkrytu.
- [NOAA Flower Garden Banks — Invertebrate videos](https://flowergarden.noaa.gov/vid/invertebratevideos.html): záznamy pohybu krabov, lastúrnikov, ulitníkov a pokojovej chobotnice.
- [NOAA — Methane Bubbles](https://oceanexplorer.noaa.gov/multimedia/video-shorts-ex1302-bubbles/): prirodzené lokálne zdroje stúpajúcich bublín, referenčné video.
- [Seattle Aquarium — Seahorses](https://www.seattleaquarium.org/animal/seahorses/): prstence tela, vzpriamený pohyb, plutvy a chytanie chvostom.

## Najbližší konkrétny pracovný blok

Začať A: hero kamera + farebná a svetelná kompozícia prvého útesu + mierka ukážok. Následne B vytvorí overiteľný štandard detailu, podľa ktorého vzniknú všetky ostatné objekty. Implementáciu neposudzovať iba jedným screenshotom: vždy záber v pokoji, pohyb a návrat pri scrolle.
