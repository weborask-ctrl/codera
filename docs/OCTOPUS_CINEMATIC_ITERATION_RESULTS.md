# Filmová iterácia — 19. september 2026

Schválený plán bol realizovaný ako jeden pracovný celok. Náhľad: http://127.0.0.1:4317/dive.html. Bez pushu. Ocean shader, Blender zdroje a GLB zostali nezmenené.

## Šesť krokov a interné hodnotenie

1. **Správanie:** SwimController oddeľuje polohu, podpísanú rýchlosť a čas plávania. Scroll aktivuje pohyb, zastavenie ho tlmí do pokojovej pózy s jemným dýchaním a korekciami koncov ramien. Hodnotenie: chyba neustáleho plávania odstránená. Deformácie používajú existujúce Blender klipy.
2. **Kamera a telo:** trojštvrťový hero, bližší bočný záber počas zostupu, ramená smerujú do otvoru. Hodnotenie: viditeľná zmena siluety a mierky. Spätný scroll vracia telo po trase, biologický cyklus pokračuje vpred; nejde o samostatný autorský klip plávania dozadu.
3. **Útes a kontakt:** súvislý členitý masív, vložené skaly, vetvené kolónie bez podstavcov, pórovitosť, zahnutá dutina. Dve vedúce ramená majú obmedzené CCD priblíženie k okraju otvoru. Pri internej kontrole opravený pravidelný obrys a príliš rovný tunel. Hodnotenie: ukrytie zabezpečuje geometria, bez zmenšovania do nuly alebo fade. Kontakt je približný; nejde o kolíznu simuláciu ani presné prichytenie prísaviek. Lokálne prieniky môže ešte odhaliť detailná kontrola.
4. **Materiály a svetlo:** spoločná scéna, vodná hmla, smer svetla, zafarbenie podľa hĺbky, pohyblivé svetelné vzory naviazané na wave map. Jemnejšie škvrny kože, kontrast prísaviek, variácia drsnosti a reliéfu, spoločné tiene. Hodnotenie: konzistentnejšie ponorenie do vody. Koža ešte nie je finálny fotorealizmus; kaustiky sú aproximované.
5. **Hĺbka a výkon:** silnejší zákal vzdialeného útesu v hero, 1900 priestorových častíc, instancované koraly a kamene. Tiene 512/1024 podľa kvality, obnova približne každých 0,12 s. Po fyzickom ukrytí sa hustý model nevykresľuje ani neanimuje; pri návrate sa obnoví. Hodnotenie: pracovný výkon zostal blízko 30 fps. GLB sa nedecimoval, aby sa nepoškodili váhy a silueta. Skutočný ľahší LOD zostáva ďalšia práca.
6. **Celok:** živá kontrola hero, bočného zostupu, otvoru, úplného ukrytia, začiatku portfólia, spätného scrollu a návratovej kotvy. Mobil 390 × 844 bez horizontálneho pretečenia, text nad modelom. Hodnotenie: ucelená pracovná iterácia, nie deklarácia finálnej filmovej kvality.

## Overenie

- `node scripts/check-swim-controller.mjs`: PASS — idle, zrýchlenie, dobeh, reverz, pauza, reduced motion.
- Syntax všetkých šiestich runtime modulov a `git diff --check`: PASS.
- Živý spätný scroll: effort 0,594, speed −0,111, animačný čas z 1,35 na 1,434. Po zastavení effort 0 a stabilný čas. Idle kontrolovaný aj s odstupom viac než 10 s.
- Pauza: presne 583 snímok medzi oddelenými odčítaniami. Spustenie obnovilo chod.
- Desktop pracovný buffer 819 × 484: približne 27–30 fps. Mobilný buffer 292 × 633: 29–30 fps. Nie je to benchmark vyššej kvality alebo výkonnejšieho stroja.
- Bez zachytených shaderových a konzolových chýb.
- Reduced motion overené riadiacim testom, nie emuláciou nastavenia OS. Kontrola cez živé snímky a DOM telemetriu; samostatný videozáznam nevznikol.
- Next aplikácia sa nemenila; plný Next build sa nespúšťal.

## Zostávajúce rezervy

Najslabší je organický detail útesu a presný kontakt ramien. Útes je stále procedurálny pracovný asset. Finále potrebuje kvalitnejšie koralové tvary, autorské kontaktné pózy, kolízne overenie priechodu a validovaný LOD chobotnice. Táto iterácia poskytuje spoločné svetlo, choreografiu a správne riadenie idle/swim, tieto práce však nenahrádza.
