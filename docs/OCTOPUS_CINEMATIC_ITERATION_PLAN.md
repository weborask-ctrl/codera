# Jedna väčšia filmová iterácia — návrh na odsúhlasenie

2026-09-19. Vizuálna kontrola aktuálneho `/dive.html`: hero, zostup, vstup do útesu. V tomto kroku sa mení iba dokumentácia, nie scéna. Nepushovať.

## Diagnóza

More je najsilnejšia vrstva. Chobotnica, útes a voda zatiaľ pôsobia ako prvky s odlišnou úrovňou spracovania a odlišným osvetlením. Vyššie rozlíšenie tento nesúlad samo neodstráni.

Pohyb má konkrétnu integračnú chybu: `octopus-blender.mjs` posúva `clock` podľa uplynutého času a stále prehráva plavecký klip. Parametre `strength`, `phase` a jednotlivé `tucks` neovládajú jeho bežnú lokomóciu. `dive-journey.mjs` navyše odvodzuje intenzitu od polohy na trase, nie od rýchlosti scrollovania. Aj ich jednoduché prepojenie by preto nevyriešilo pokojový stav. Odstránenie Blender ROOT dráhy bolo potrebné, no primerané riadenie správania cez web zostalo nedokončené.

Vizuálne slabiny:

- Silno kontrastné škvrny kože a rovnomerne svetlé prísavky pripomínajú model osvetlený v štúdiu. Chýba spoločné pôsobenie vody, svetla a hĺbky.
- Takmer stále čelná prezentácia a podobná veľkosť subjektu oslabujú pocit skutočnej cesty kamerou.
- Útes tvorí príliš pravidelný horizontálny pás; otvor pripomína vyrezaný tunel. Koraly majú opakujúce sa vetvenie a viditeľné okrúhle základne.
- Útes je viditeľný už v hero, čím sa oslabuje jeho neskoršie odhalenie. Chýba výraznejšia hierarchia blízkeho, stredného a vzdialeného plánu.
- Vstup do úkrytu zatiaľ zakrýva model geometriou bez presvedčivej kontaktnej choreografie. Maskovanie samo nevytvára dojem zaliezania.
- Hladina, veľké nadpisy a základná teplá/studená farebnosť sú použiteľným základom. Existujúce more zachovať ako referenčný stav.

## Cieľ iterácie

Presvedčivý jeden súvislý úsek hero → plávanie → zostup → útes → ukážky. Nepridávať nové sekcie alebo ďalšie zvieratá. Portfólio zostane obyčajným scrollovaním bez samostatných animácií medzi ukážkami. Odsúhlasenú hladinu neprestavovať; upravovať prednostne objekty, kameru a ich napojenie na existujúce prostredie.

## Poradie realizácie

1. **Správanie a pohyb.** Oddeliť polohu na trase, vyhladenú podpísanú rýchlosť scrollu a vlastný čas animácie. Pripraviť pokojový stav s jemným dýchaním a nepravidelnými malými pohybmi koncov ramien, aktívne plávanie, dobeh/sklz a priblíženie ku kontaktu. Plynulo miešať pózy a intenzitu, nespúšťať klip od začiatku pri každom udalostnom impulze. Rozbeh orientačne 0,25–0,45 s; útlm 0,6–1 s, hodnoty doladiť vizuálne. Obmedziť reakciu na prudké scrollovanie. Pri návrate po trase ponechať biologický cyklus vpred a plynulo upraviť natočenie. V ukážkach držať koncovú polohu. Pauza, skrytá karta a reduced motion musia fungovať.

2. **Režírovať kameru a telo spoločne.** Hero: pokojný trojštvrťový pohľad, čitateľná silueta, priestor pre text. Rozbeh: telo začne viesť zmenu smeru, ramená reagujú s oneskorením. Stredný úsek: bočný prechod bližšie ku kamere so zreteľným rozdielom mierky, potom odhalenie útesu. Zostup: kamera sleduje telo mierne zozadu/boku; čas na orientáciu v priestore. Kontakt: spomalenie, vyhľadanie otvoru ramenami, následne zasunutie tela. Návrat scrollom nesmie spôsobiť skok pózy ani prechod cez kameru. Natáčanie, priechodný otvor a trajektóriu overiť pred detailovaním.

3. **Prestavať slabé tvary útesu.** Použiť asymetrický skalný masív s prekrytiami a hĺbkou otvoru. Koraly zoskupiť do niekoľkých kolónií rôznych mierok, zakotviť ich priamo v povrchu a odstrániť dojem podstavcov. Vzdialené tvary zjednodušiť. Okolie otvoru modelovať podľa zvolenej pózy a rozmerov chobotnice. Pre kontaktnú animáciu určiť niekoľko pevných bodov pre vedúce ramená; po nich viesť zvyšok tela. Najprv funkčný priechod, potom pórovitosť a drobný reliéf.

4. **Spojiť materiály a svetlo.** Zjemniť veľké škvrny kože a kontrast prísaviek; pridať rozumnú variáciu drsnosti a jemného reliéfu. Zosúladiť smer hlavného svetla s hladinou, zafarbenie a úbytok kontrastu podľa hĺbky pre chobotnicu aj útes. Preniesť jemné pohyblivé svetelné vzory vody na objekty, s menšou intenzitou v hĺbke. Doplniť lokálne tiene v záhyboch a pri kontakte podľa výkonu. Filmový výsledok posudzovať najprv pri čistej ostrej kompozícii; nezačínať bloomom, zrnom ani plošným rozmazaním.

5. **Hĺbka, výkon a výsledné zjednotenie.** Rozlíšiť niekoľko blízkych častíc, priestor okolo subjektu a pokojnejšie vzdialené vrstvy. Reef v hero potlačiť jeho umiestnením, záberom a vodnou atmosférou, následne ho prirodzene odhaliť. Optimalizovať hustý GLB a overiť zachovanie váh a siluety; pracovná aj vyššia kvalita musia používať rovnakú choreografiu. Pracovný cieľ približne 30 fps, s meraním po každom nákladnom zásahu. Vyššia kvalita sa nesmie zamieňať s overeným výkonom na inom PC.

## Dokončenie a kontrolné zábery

- Hero bez scrollu aspoň 10 s: dýchanie a malé korekcie; žiadny plný pohonný záber na mieste.
- Pomalý, rýchly a prerušovaný scroll: viditeľne odlišná primeraná reakcia, plynulý rozbeh a upokojenie.
- Návrat scrollom a kliknutie na kotvu: správne miesto na trase, bez resetu, teleportu alebo prudkého prekrútenia.
- Bočný detail: meniaca sa silueta, oneskorenie koncov ramien, žiadne dlhé natiahnuté plochy.
- Priblíženie a kontakt: ramená prejdú otvorom a vedú telo; žiadne zjavné rezanie cez skalu, zmenšovanie do nuly alebo fade.
- Ukážky: jedna pokojná bežná obsahová sekcia.
- Desktop a mobil: celý zámer kompozície, výrazné nadpisy, bez prekrytia textu telom a bez malých dekoratívnych štítkov.
- Rovnaké kontrolné polohy zachytiť pred/po; doplniť záznam pohybu, meranie pracovného výkonu a zostávajúce obmedzenia. Neoznačiť výsledok za finálny fotorealizmus len na základe jedného renderu.

Toto je návrh jednej ucelenej iterácie s internými kontrolami, nie prísľub dokončenia všetkých budúcich sekcií alebo produkčného fotorealizmu jedným zásahom.
