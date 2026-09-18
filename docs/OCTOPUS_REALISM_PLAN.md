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
