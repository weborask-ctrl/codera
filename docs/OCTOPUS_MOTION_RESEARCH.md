# Chobotnica: podklad pre model a pohyb

19. 9. 2026 — pracovná verzia, nie úplná biologická rekonštrukcia.

## Rozsah a hranice dôkazov

Pripravujeme útesovú chobotnicu inšpirovanú skupinou Octopus vulgaris. Neprenášame na ňu plutvový pohyb hlbokomorských druhov. Model zostáva výtvarným živočíchom Codery, nie vedecky identifikovaným exemplárom. Najprv model a deformácie, potom klipy a napojenie na scroll. Schválené more nemeníme.

Z verejných zdrojov nemožno zrekonštruovať každý sval, skryté rameno ani všetky smery z jednej kamery. Nižšie odlišujeme **L — literatúru**, **V — vizuálne pozorovanie vybraných záberov** a **N — náš animačný návrh**. Časovanie N nie je nameranou biológiou. V tejto fáze nemáme vlastné 3D motion capture ani kompletnú analýzu videa po snímkach.

## Overené mechanické princípy

**L1.** Terénna štúdia Bennice et al. opisuje štyri deformácie ramena: ohyb, predĺženie, skrátenie a skrútenie. Môžu sa kombinovať na jednom ramene aj medzi ramenami. Rozlišuje proximálnu, strednú a koncovú oblasť; ramená nemajú plniť všetky rovnakú úlohu v rovnakom čase. Katalogizuje dvanásť akcií, napríklad reach, raise, lower, tuck, curl, push, parachute, roll, grasp, stilt a tiptoe. Naše ovládanie musí umožňovať lokálne, nie iba celoplošné deformácie. [Primárna štúdia, Scientific Reports 2025](https://www.nature.com/articles/s41598-025-10674-y).

**L2.** Pri lezení je orientácia tela oddeliteľná od smeru presunu. Skúmané plazenie nemalo zrejmý pravidelný rytmus koordinácie ramien; odraz vytvára predlžovanie skrátených ramien. Z toho nevyplýva, že každé plávanie je nerytmické. [Levy, Flash & Hochner, Current Biology 2015](https://pubmed.ncbi.nlm.nih.gov/25891406/).

**L3.** Publikovaný záznam plaveckých vzorcov rozlišuje jet swimming, head-first swimming a arm swimming. Pri poslednom sa objavuje záber pri zatváraní a návrat pri otváraní ramien. Jetový režim má ramená združené za plášťom. Tieto režimy nemáme miešať do jednej permanentnej slučky. Dostupný text je konferenčný podklad autorov, nie náš kvantitatívny rozbor. [Swimming Patterns of the Octopus Vulgaris](https://www.researchgate.net/publication/240048531_Swimming_Patterns_of_the_Octopus_Vulgaris).

**L4.** Prísavka má kontaktnú časť a vnútornú dutinu. Publikovaný mechanizmus zahŕňa vytvorenie tesnenia a podtlaku; ide o aktívnu mäkkú štruktúru. Pre animáciu z toho vyplýva potreba kontaktnej deformácie, nie tvrdého krúžku posúvajúceho sa po skale. Detaily mechanizmu v práci sú hypotézou podporenou morfológiou a ultrazvukom. [Tramacere et al., 2013](https://pmc.ncbi.nlm.nih.gov/articles/PMC3672162/).

**L5.** Pre reaching je relevantné šírenie ohybu a kombinácia deformácií v mäkkom ramene. Naše kosti sú výpočtová aproximácia svalového hydrostatu, nie skutočné kĺby. [Biomechanics, motor control and dynamic models…, JEB](https://doi.org/10.1242/jeb.245295).

**L6.** Arm-swimming môže byť synchronizovaný, s pomalším otvorením a rýchlejším zatvorením ramien. N: použiť asymetrickú krivku otvorenie → záber → sklz. [Kazakidi, Zabulis & Tsakiris, ICRA 2015, autorský plný text](https://www.researchgate.net/publication/282315037_Vision-based_3D_motion_reconstruction_of_octopus_arm_swimming_and_comparison_with_an_8-arm_underwater_robot).

## Vizuálne referencie skutočného zvieraťa

### Konkrétna nameraná plavecká sekvencia z L6

Práca analyzuje jeden 1,32-sekundový pohyb 180-gramovej samice. Otváracia fáza končí približne v 0,66 s; záber trvá 0,44 s; po 1,10 s nasleduje spomaľovanie. Pomer otvorenie/záber je 1,5. Práca pri jednom ramene opisuje priestorové rotácie a twist, pri zatváraní postupujúci ohyb a na konci takmer narovnanie. Priemerné dĺžky zo siedmich ramien rastú približne do 0,94 s a potom klesajú. To je konkrétny referenčný záber, **nie univerzálna frekvencia ani rozmerovo nezávislá rýchlosť našej veľkej chobotnice**. Aktívna úloha blany je v tejto práci interpretácia, nie priamo zmeraná svalová aktivita.

N: prvý budúci plavecký klip založiť na tomto poradí fáz; časovanie škálovať až podľa výsledného vizuálneho dojmu a mierky zvieraťa. V samostatnom súbore evidovať biologický originál aj naše upravené časy.

[MBL: zábery Hanlona a Bennice, 1:23](https://www.youtube.com/watch?v=wvmqLYWUIjQ), prepojené z [oficiálneho článku MBL](https://www.mbl.edu/news/how-many-ways-can-octopus-flex-its-supple-arms-now-we-know).

Prezreté vybrané zastavené zábery; nejde o meranie celého klipu. Video je montáž, preto rozdielne časy automaticky netvoria súvislý pohyb.

| Približný čas | V: čo bolo viditeľné | N: dôsledok pre nás |
|---|---|---|
| 0:16 | Nízka poloha pri nerovnom substráte; svetlá spodná plocha ramien pri kontakte. | Kontakt nesmie závisieť od jednej vodorovnej roviny. |
| 0:33 | Vysoko nesené telo; súčasne označené reach, stilt a raise. Jedno rameno siaha do strany, iné podopiera. | V tom istom okamihu potrebujeme odlišné úlohy a rôzne lokálne zakrivenia. |
| 0:38 | Ďalší záber nízko pri skale. | Nepoužívať strih montáže ako dôkaz rýchlosti prechodu z predchádzajúcej polohy. |
| 0:50 | Moving seaweed: zdvihnuté a zahnuté rameno má viditeľnú prísavkovú stranu, iné ramená zostávajú nižšie. | Potrebujeme otáčať aj prierez ramena, nielen jeho os. |

Video neposkytuje overenie všetkých smerov plávania ani úplného vchádzania do úkrytu. Tie zostávajú otvorenými referenčnými úlohami pred finálnymi klipmi.

## N: pohybová matica pre web

Smer posunu je svetový vektor, orientácia tela je samostatná veličina. Kamera nesmie otáčať zviera namiesto jeho vlastného pohybu. Všetky nasledujúce sekvencie sú návrhom realizácie, nie tabuľkou nameraných uhlov.

| Situácia | Telo a plášť | Ramená a detail | Kontakt a overenie |
|---|---|---|---|
| Pokoj vo vode | Malá ventilácia plášťa, pomalá korekcia polohy. | Dve či tri aktívne špičky; zvyšok tlmený. Žiadne rovnaké fázy všetkých ramien. | Overiť spredu aj zboku; telo nesmie vyzerať ako nehybná guľa. |
| Vpred vzhľadom na hlavu | Samostatná smerová orientácia a posun; vybrať plavecký režim. | Pripraviť rozvinutie, záber a doznievanie; nedávať veľký záber počas každého sklzu. | Potrebujeme dodatočnú video referenciu na konkrétnu trajektóriu. |
| Dozadu, plášťom napred | Pre jetový režim zúžiť siluetu, oddeliť impulz od sklzu. | Ramená sa združia a vlečú; konce dobiehajú zmenu smeru. | Žiadne okamžité obrátenie celej pózy o 180°. |
| Doľava / doprava | Najprv smerový zámer, potom oblúk posunu; pri lezení môže hlava zostať natočená inam. | Vnútorná a vonkajšia strana oblúka majú odlišné dráhy; zrkadlenie iba ako východisková pomôcka. | Test oboch strán, nepredpokladať jednu dominantnú. |
| Hore / dole | Pitch a vertikálny presun ovládať oddelene. | Pri zmene smeru oneskoriť špičky, upraviť rozovretie; nedovoliť prienik cez plášť. | Rýchlosti a uhly zatiaľ výtvarné parametre. |
| Diagonálne | Zložiť smerový vektor, nie naraz prehrať dva celé klipy. | Vyhodnotiť jednu výslednú pózu a lokálne korekcie. | Kontrola siluety a prekrývania z troch kamier. |
| Yaw / pitch / roll | Plynulá rotácia koreňa plus mäkké oneskorenie plášťa. | Špičky sa neotáčajú ako súčasť pevnej hviezdy. | Roll používať účelovo, nie trvalo dekoratívne. |
| Spomalenie | Rýchlosť klesá spojito; žiadne zastavenie v jednom frame. | Postupný prechod z vlečených ramien na skúmanie povrchu. | Zmeniť režim pred kontaktom s útesom. |
| Lezenie | Presun tela nad meniacou sa sadou opôr. | Reach → kontakt → odraz/ťah podľa scény → uvoľnenie → presun ramena. | Ukotvená prísavka musí zostať na rovnakom bode útesu. |
| Zaliezanie | Zmenšiť profil vhodnou deformáciou; telo musí fyzicky prejsť otvorom. | Prieskumné rameno, oporné ramená, postupné prevzatie kontaktov, posledné konce. | Toto je režijný návrh. Poradie tela a ramien overiť vhodným súvislým videom; nedávať ho za univerzálny zvyk. |
| Vyliezanie | Vytvoriť samostatnú sekvenciu so zisťovaním okolia. | Výstup nemusí byť mechanicky obrátené zaliezanie. | Neukazovať odhalený vnútrajšok dutého proxy modelu. |

## N: požadované malé pohyby a ovládače

- **Každé rameno:** základňa, stred, koniec; lokálny ohyb v dvoch rovinách, twist, predĺženie a skrátenie. Polomer pri pozdĺžnom streči s faktorom s približne násobiť 1/sqrt(s); nie je to plná simulácia tkaniva.
- **Šírenie ohybu:** posun maxima zakrivenia po ramene; na konci odlišné doznenie. Vyhnúť sa zalomeniu v jednom bode kostry.
- **Prísavky:** orientácia podľa lokálneho povrchu, deformácia pri kontakte, uvoľnenie pred odchodom. Mikropohyb každej prísavky netreba renderovať mimo detailu.
- **Blana:** meniace sa napätie medzi susednými koreňmi; nesmie vyzerať ako tvrdý trojuholník ani sa prevrátiť pri krížení ramien.
- **Plášť:** ventilácia oddelená od lokomočného impulzu. Silu a frekvenciu až podľa referencie, nie náhodná veľká pulzácia.
- **Sifón:** samostatné smerovanie a deformácia otvoru; nepúšťať z neho dekoratívne bubliny pri každom pohybe.
- **Oči:** drobná zmena smeru pohľadu bez ľudského žmurkania; horizontálna štrbinová zrenica. Zmenu zrenice ani viečok zatiaľ nemáme referenčne rozpracovanú.
- **Koža:** farba a papily môžu byť ďalšia vrstva. Nevydávať náhodný farebný šum za overenú behaviorálnu reakciu.

## Model a nasledujúce kontrolné brány

1. Blender: čitateľná čelná silueta, telo, osem ramien, blany, oči, sifón, dvojice radov prísaviek. Editovateľný zdroj, nie iba export starého triangulovaného povrchu.
2. Deformačný základ: nezávislé reťaze, váhy spoločné pre rameno a jeho prísavky. Overiť skúšobný ohyb; po teste uložiť neutrálnu pózu. Kosti zatiaľ nie sú pohodlný finálny spline/IK ovládač.
3. Pred produkčnou animáciou: doladiť súvislé napojenie koreňov, membrány pri extrémnych polohách, smerovanie sifónu, kontaktné ovládače a objemovú kompenzáciu. Existencia kostry nie je dôkaz hotového rigu pre každú pózu.
4. Doplniť súvislé referenčné klipy plávania v profilovom pohľade, otočky a vstupu do dutiny. Zaznamenať čas, viditeľné rameno, fázu, kontakt, mieru istoty. Skryté časti označiť ako nepozorované.
5. Vytvoriť najprv pokoj, jeden presun a jednu otočku. Až po kontrole plášťa, špičiek a objemu rozšíriť smery. Časovanie neprepočítavať slepo z rýchlosti scrollu.
6. Vytvoriť skutočný otvor útesu a kontaktnú choreografiu. Žiadne alpha zmiznutie zvieraťa. Potom odľahčený GLB, bake materiálov, skúška FPS na tomto PC.

V tejto etape je výsledkom rešerš a prvý editovateľný Blender základ. Filmový finálny sculpt, textúry, všetky smery pohybu a kontaktné klipy nemožno označiť za hotové len preto, že prebehol export.
