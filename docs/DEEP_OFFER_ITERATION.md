# Zostup z terasy a ponuka

## Plán

Po službách sa pokojová chobotnica rozpláva ku hrane terasy. Kamera mierne klesá a nakloní sa nad okraj, čím odhalí strmý prechod dna do hĺbky. Pri ponuke opäť zastane; Vizitka, Firemný web a 5D web sa čítajú bežným scrollom bez ďalších preletov. Jedna trasa pre oba smery, osobitná poloha tela na mobile.

Zachovať numericky opravené odlesky, fotografické skalné materiály a uzavretý pôvodný útes. Nová krajina je súvislé dno s prepadom, doplnené o hlbšie skalné výbežky. Ceny a rozsahy pochádzajú zo spoločnej lokálnej konfigurácie, neprepisovať ich ručne do novej sekcie.

Pred odovzdaním: kontinuita napojenia na bránu, vôľa nad terénom, odhalenie hĺbky, návrat scrollom, pokoj pri čítaní, desktop/mobil, výkon a chyby shaderov. Po prvej vizuálnej kontrole upraviť slabé miesta.

## Realizácia a kritická kontrola — 2026-09-19

Hotový úsek `#hrana` → `#ponuka`. Kamera nadväzuje na koniec brány na [18, −14, −55] a končí na [21, −29, −90]. Telo zostáva kontinuálne, pri čítaní ponuky dýcha v pokoji. Dno klesá približne o 35 svetových jednotiek a dopĺňajú ho uzavreté skalné výbežky. Prechod je riadený samostatným SwimControllerom; medzi ponukami sa trasa nemení.

Prvá vizuálna kontrola odhalila trojuholníkové hranice piesku a skaly a plochú modrú siluetu vzdialeného dna. Pred odovzdaním boli opravené:

- materiály dna sa miešajú podľa sklonu povrchu, nie výberom materiálu po trojuholníkoch,
- vzdialené objekty sa prelínajú so skutočným živým oceánom z existujúceho render targetu; farba hmly už nevytvára odlišnú plochú kulisu,
- zachované opravené kaustiky a fotografický skalný materiál,
- pridané dva nižšie uzavreté výbežky pre orientáciu v úzkom mobilnom zábere.

Ponuka sa vykresľuje serverom priamo z `packages` v `lib/site-config.ts`, vrátane všetkých rozsahov a výluk. Súčasné lokálne ceny 700 / 1 200 / 2 500 € sa neduplikujú do HTML. Text je dostupný aj bez JavaScriptu. Preview server bol reštartovaný na rovnakom porte 4317. Pri úprave konfigurácie vyžaduje tento jednoduchý server reštart.

## Overenie

- `check-deep-path.mjs`: PASS — rovnaké počiatočné pozície ako koniec brány, 2000 vzoriek trasy pre oba formáty, minimálne 2 jednotky odstupu koreňa tela/kamery od terénu, kontinuita, držanie konca. Nejde o kolízny test každého ramena.
- `check-gate-path.mjs`, `check-reef-shell.mjs`, `check-swim-controller.mjs`: PASS.
- Syntax runtime modulov a servera; `git diff --check`: PASS.
- Prehliadač: zostup, návrat scrollom, ponuka, tri balíky a ceny. Pri ďalšom scrollovaní ponuky zostala poloha [21, −30, −98] na mobile a animačný čas 1,798958 nezmenený. Spätný pohyb aktivoval plávanie (effort približne 0,55, záporná rýchlosť).
- Mobil 390 × 844 bez horizontálneho pretečenia, výrazné nadpisy a čitateľné rozsahy. Dočasná veľkosť obnovená.
- Pozorovaný pracovný výkon približne 28–29 fps; desktop buffer 555 × 484, mobil 292 × 633. Vyššia kvalita sa v tejto iterácii nebenchmarkovala.
- Bez zachytených shaderových/konzolových chýb. Ocean shader a Blender zdroje nezmenené. Next aplikácia sa nemenila; plný Next build sa nespúšťal.

Hodnotenie: nový úsek prináša zmenu výšky a pohľad nad okraj, ponuka zostáva pokojná. Fotografické materiály sú zachované, vzdialené vrstvy sú lepšie spojené s vodou. Model chobotnice a veľké tvary vzdialených výbežkov stále nie sú finálny filmový fotorealizmus. Uložiť lokálne, bez pushu.
