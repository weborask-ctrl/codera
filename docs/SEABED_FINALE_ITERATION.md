# Piesočné finále — plán a kontrola

1. Z ponuky pokračovať popri kaňone do pokojnej sekcie Ako začneme. Obsah a kontakty z existujúcej konfigurácie.
2. Súvislý, reverzibilný zostup na piesočné dno. Chobotnica zostáva jedným objektom, pri čítaní nepláva. Kamera na konci zostane pri nej.
3. Jemný reliéf piesku, zrno, kontakt so zemou a prirodzenejšia variácia kože. Bez zmeny schváleného oceánového shaderu.
4. Overiť obraz, scroll oboma smermi, mobil, chyby a výkon; opraviť slabiny pred odovzdaním.

Nejde o nový finálny Blender sculpt ani fyzikálnu simuláciu všetkých ramien. Tie zostávajú ďalším krokom kvality.

## Realizované
- Dve záverečné obsahové sekcie: proces spolupráce a kontakt. Lehoty, email a telefón sa renderujú z existujúcej konfigurácie bez duplicity údajov.
- Dva plynulé scrollové úseky nadväzujú na deepPose. Čítanie drží polohu a utlmí plavecký cyklus; scroll späť vracia chobotnicu súvislo nahor.
- Finále je na piesku. Osem ramien má obmedzený CCD kontakt končekov a korekciu stredných kĺbov nad lokálnym terénom. Nejde o úplnú kolíziu povrchu modelu.
- Piesok: filtrované vlnky v normále, farebná variácia, 110 drobných fragmentov v jednom instanced draw. Terén predĺžený na 340 jednotiek, aby sa jeho koniec v zábere neodrezával.
- Koža: mierne jemnejší mikroreliéf a nepravidelnejšia drsnosť. Smer kľúčového svetla prechádza pri závere dopredu a zhora.
- Kamene: triplanárna orientácia zohľadňuje transformáciu inštancií. Ocean film shader ostal nezmenený.

## Kritické posúdenie a opravy
Prvá verzia visela nad pieskom, mala málo čitateľný tvar a viditeľný koniec terénu. Nasledovalo zníženie tela, korekcia ramien, nové smerovanie svetla a predĺženie dna. Pridané fragmenty najprv odhalili chybu poradia inicializácie pomocného objektu; opravená a geometrický test znovu úspešne prešiel. Náhodná sekvencia pôvodného útesu zostáva zachovaná.

Stále nejde o úplný fotorealizmus: vzhľad je limitovaný existujúcim sculptom a jednoduchou kontaktnou pózou. CCD kontroluje kĺby, nie všetky vrcholy kože/prísaviek. Finálny Blender landing clip a materiál s detailnými mapami zostávajú potrebné pre najvyššiu kvalitu. Fyzikálna simulácia sedimentu nie je súčasťou tejto iterácie.

## Overenie
- check-finale-path: presné nadväzovanie kamery/tela, 2000 vzoriek každého úseku pre desktop aj mobil, koreň a kamera nad terénom, koncová póza stabilná.
- check-deep-path, check-gate-path, check-swim-controller: PASS.
- check-reef-shell: PASS, 16000 trojuholníkov, všetkých 24000 hrán zdieľajú presne dve plochy.
- Syntax kontrolovaných JS modulov a git diff --check: PASS.
- IAB: desktop aj 390 × 844 mobil, bez vodorovného overflow. Piesok, pokojová póza a spätný scroll vizuálne skontrolované.
- Pracovný režim: približne 28 fps pri 555 × 484 a 29–30 fps pri 292 × 633. Vyššia kvalita približne 20 fps pri 740 × 646 počas kontroly.
- Pokoj na dne: phase seabed, effort 0; spätný scroll: landing-swim so zápornou rýchlosťou. Žiadna aktuálna chyba v #error; konzola obsahovala historickú, už opravenú chybu dummy.

Všetko lokálne, bez pushu.
