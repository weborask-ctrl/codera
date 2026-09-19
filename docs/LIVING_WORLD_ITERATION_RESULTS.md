# Živý podmorský svet — spoločná iterácia

Dátum: 2026-09-19. Nadväzuje na CINEMATIC_WORLD_AUDIT.md a commit b3374c2. Lokálne, bez pushu.

## Rozsah a stav

V jednom pracovnom ťahu vznikla funkčná implementácia zmien naprieč všetkými existujúcimi scénami. Nie je to potvrdenie, že všetky modely dosiahli požadovaný finálny fotorealizmus. Samostatný nový Blender sculpt, optimalizovaný export chobotnice a nová knižnica autorských animačných klipov zostávajú otvorené. Blender nebol nájdený v PATH ani v štandardnom priečinku Blender Foundation; pôvodný cloudový Blender nástroj nie je medzi dostupnými nástrojmi tejto relácie.

## A — kompozícia a svetlo

- Hero chobotnica bližšie ku kamere, výraznejší detail na desktope; mobilná poloha upravená samostatne.
- Teplejšie predné svetlo, menej plošnej straty teplých farieb v spoločnom podmorskom materiáli. Hmla zostáva silnejšia pri hero, aby útes nevstupoval do úvodného záberu príliš skoro.
- Ukážky na desktope na 88 % šírky článku s maximom 1440 px; mobil zachováva šírku. Medzi ukážkami nevznikla nová animačná cesta.
- Jemnejšie nábehy čítacích prekrytí sekcií.
- Mobilné finále má vyššiu kameru a menšie, nižšie plávajúce ryby, aby zostali kontaktné údaje čitateľné. Spodný odkaz má odstup od pevného ovládania náhľadu aj od masky prechodu.
- Schválený ocean-film-shaders.mjs nezmenený.

## B a C — knižnica a osadenie

Nové súbory marine-assets.mjs a marine-world.mjs sú zdrojom procedurálnej 3D geometrie, materiálov, rozmiestnenia a pohybu. Sú plne uložené v projekte; nie sú závislé na vygenerovanom obrázku ani externom účte.

- Tri rodiny korálov: mäkké rozvetvené kolónie, vejárové siete a vrstvené platne. Prvá kontrola odhalila príliš pravidelné hrubé konáre: zúžené, zakrivené a doplnené hustejšie koncové útvary. Vejár dostal samostatnú geometriu. Uzavreté platne nahradili problémové otvorené polgule.
- Štyri odlišné profily rýb s plutvami, očami, žiabrovými ryhami a farebnými vzormi. Pôvodné gule/kužeľové proxy ryby odstránené. Prvá kontrola odhalila ryby za povrchom útesu: centrum trasy presunuté pred útes; pri bráne zmenšený priestor plávania.
- Tri varianty rebrovaných lastúr s vnútornou a vonkajšou plochou, hrubším okrajom a farebnými rastovými pásmi. Osadené na dne aj na prednom povrchu brány.
- Vegetácia pri bráne, zastávke a finále. Druhá kontrola odhalila plochý vzhľad listov: pridané zakrivenie naprieč listom, obe strany s hrúbkou, jemná kresba a menej ostrá zelená. Pevná báza a väčší ohyb vo vrchnej časti.
- Mäkké korály a vegetácia používajú príbuzný priestorový signál prúdu, s rozdielnou amplitúdou. Tvrdé platne sa neohýbajú.

## D — existujúca chobotnica

- Jemná pigmentová kresba v materiáli, filtrovaná podľa veľkosti detailu na obrazovke. Nie nová obrazová textúra alebo nový sculpt.
- Skladanie ramien do úkrytu má rozdielne intervaly podľa ramena a vzdialenosti segmentu od tela. Zostáva založené na existujúcom plaveckom/folded pózovaní; nejde o dokončený referenčný Blender den-entry klip.
- Pri spolupráci doplnený skalný oporný objekt spojený s dnom. Dva body opory sa nájdu raycastom na jeho skutočnom povrchu. Dve ramená sa postupne pritiahnu obmedzeným CCD; pri odchode sa opora uvoľňuje.
- Pôvodná korekcia dosadnutia na piesok zachovaná. Ani tá, ani nová opora nekontrolujú kolízie všetkých vrcholov/prísaviek.

## E — spodné scény

- Tri malé vývery nájdené raycastom na skalách, s lemom a tmavou priehlbinou. Ide o vizuálny povrchový detail, nie vyrezaný tunel do geometrie.
- 60 opakovane používaných bublín s rôznymi veľkosťami, životnosťou, vztlakom a bočným posunom. Počet nerastie počas behu.
- Tri kraby s členenými nohami, očami a klepetami. Krátky pohyb a jednoduchá deformácia nôh; nejde o rig s presne fixovanými chodidlami. Toto je jeden z otvorených limitov realizmu.
- Tri morské koníky s prstencami, korunou, rypákom, zvinutým chvostom a pevne umiestnenými rastlinami pri nich. Pokojový pohyb je jemný; chvost zatiaľ nemá skutočný kontaktný rig okolo stonky.
- Krátky lokálny sediment pri dosadnutí. Pri reduced motion vypnutý.
- Čas sveta pokračuje pri zastavení scrollu. Pri spätnom scrolle bubliny stále stúpajú a ryby sa neposúvajú obrátene v čase. Pauza stránky zastaví spoločný čas.

## Vlastná kritika

Kompozícia je bohatšia a farby čitateľnejšie, ale nová knižnica je stále procedurálne autorské spracovanie. Neoznačovať ju za hotové fotorealistické modely: najbližšie zábery rýb, krabov, koníkov a mäkkých korálov potrebujú anatomicky presnejší sculpt, materiálové mapy a precíznejšiu animáciu. Všetky objekty majú objem a rozlíšený povrch, no to samo nezaručuje filmový výsledok.

Chobotnica zostáva hlavným limitom pri hero detaile; vzor pigmentu zlepšuje čitateľnosť kože, nenahrádza jej anatomický detail. Rozostupy prísaviek, správanie ramien pri kontakte a prirodzené vedenie tela zostávajú ďalšou autorskou prácou. Nie je správne tvrdiť, že blok D z pôvodného auditu je úplne uzavretý.

Higgsfield nebol použitý; nové objekty sú skutočná programovo vytvorená geometria. Žiadne cudzie modely alebo nové fotografické textúry neboli prevzaté.

## Optimalizácia a overenie

- Zachovaním indexov v zlučovaných objektoch klesol súčet vrcholov knižnice z 1 065 162 na 257 490 bez zmeny povrchu. Geometria a materiály sa zdieľajú inštanciami.
- Nový svet má 15 koreňových dávok/objektov: korály, rastliny, lastúry, ryby, koníky, kraby, bubliny a sediment. Tento počet nie je celkovým počtom renderovacích volaní celej stránky.
- check-marine-assets.mjs: rozmery, konečné hodnoty vrcholov/normál/farieb, hranice indexov, zostavenie sveta, časové vzorky, reduced motion a uvoľnenie zdrojov.
- check-reef-shell.mjs: uzavretosť pôvodného útesu, dva zásahy opory a tri zásahy výverov na skutočnom povrchu.
- Pôvodné testy trás, kontinuity, terénu a swim controller prešli.
- Priebežné merania: približne 26 fps pri útesovej kontrole a 29 fps vo finále, pracovné rozlíšenie 819 × 484. Hodnoty nie sú prísľub Full HD výkonu.
- Záverečná kontrola: desktop 28–29 fps pri 819 × 484; mobilný viewport 390 × 844, render 292 × 633, po ustálení 27–29 fps. Počas testovania sa krátko objavilo 1–3 fps; pri opakovanej kontrole sa prepad nezopakoval. Jeho presnú príčinu sa nepodarilo izolovať, preto tieto merania neoznačovať za dlhodobý výkonnostný benchmark.
- Pauza na kontaktnom zábere: pri dvoch oddelených odčítaniach zostal počet snímok 2959 aj animačný čas 10.216154508175272 nezmenený. Bez hlásenia chyby shaderov, aktuálny error panel prázdny.
- Finálne kontroly check-marine-assets, check-reef-shell, check-finale-path, check-gate-path, check-deep-path a check-swim-controller prešli. Git diff bez whitespace chýb.

## Nasledujúci krok pre skutočné finále

Obnoviť vhodné Blender authoring prostredie, vziať túto scénu ako presné zadanie rozmerov/kamery a nahrádzať najbližšie objekty detailnými optimalizovanými modelmi. Priorita: chobotnica a kontaktné klipy, dominantné korály, najbližšie ryby a koníky. Zachovať existujúce priestorové kotvy a funkčnú cestu.
