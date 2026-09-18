# Medúza v schválenom mori — prvá materiálová iterácia

2026-09-18. Marcus schválil začatie integrácie a požaduje filmovú kvalitu medúzy zodpovedajúcu moru. Tento checkpoint je funkčná štúdia, nie schválený finálny vzhľad.

## Otvorenie

Spustiť `npm run prototype:jellyfish` a otvoriť http://127.0.0.1:4317/jellyfish-look.html. Tlačidlá **Celok** a **Detail materiálu** menia skutočnú pozíciu kamery. Ovládanie možno skryť. Samostatné schválené more zostáva na `/ocean.html`, pôvodný scroll prototyp na `/`.

## Implementované

- Samostatný procedurálny model v `experiments/jellyfish/gel-jellyfish.mjs`: dvojvrstvový zvon, lem, 24 vnútorných kanálikov, štyri vnútorné laloky, šesť objemových zvrásnených ramien a 64 jemných chápadiel.
- Jemné pulzovanie zvona a oneskorené vlnenie visiacich častí na GPU. Geometria sa nevytvára nanovo každý frame.
- Priesvitný materiál vzorkuje živé more cez samostatný render target. Jemná refrakcia pozadia, okrajové odlesky a svetlo odvodené od existujúcej mapy hladiny.
- Lineárny medzivýsledok mora; filmové mapovanie farieb až pri prezentácii. Nový render target a vyhladzovanie sú aktivované len pre túto štúdiu.
- Full HD, úsporný a natívny režim do limitu 4K. Mobilný celok centruje medúzu.
- Pauza, zastavenie pri skrytej karte a uvoľnenie geometrie, materiálov a render targetov pri odchode.

## Overenie

- Syntax oboch JS modulov a `git diff --check` prešli.
- Vizuálne overený celok aj detail pri skutočnom drawing bufferi 1920 × 1080 v lokálnom prehliadači. Celok približne 29 fps, detail 24–25 fps. Ide o krátke meranie frekvencie vykresľovania, nie garanciu pre iný hardvér alebo dlhodobý záťažový test.
- Mobilné rámovanie 390 × 844 a dostupnosť ovládania vizuálne overené.
- Pauza: počítadlo ostalo na 294 snímkach medzi dvoma odčítaniami. Konzola bez zachytených chýb a upozornení pri kontrole detailu.
- Samostatná stránka mora sa po rozšírení naďalej vykresľuje. Jej farebnosť ani parametre vĺn sa nemenili.
- Výkon 4K, skutočný mobilný GPU a fallback bez float render targetov zatiaľ neoverené.

## Čo zostáva do filmového výsledku

1. Ramená sú objemové, ale v makre ešte príliš pravidelne zvrásnené a miestami pôsobia plastovo. Potrebujú menej periodické záhyby, mäkšie prechody a rozdielnu hustotu tkaniva.
2. Štyri vnútorné laloky sú stále zjednodušené. Rozvinúť organické vnútro podľa biologickej referencie.
3. Refrakcia je aproximácia v obrazovom priestore; nevykresľuje lom cez všetky vnútorné vrstvy. Presvietenie nie je fyzikálny podpovrchový rozptyl. Pridať hrúbku materiálu, absorpciu a hlbšie svetelné prechody.
4. Priehľadné vrstvy používajú pevné poradie vykreslenia; pred finálnym obletom otestovať samoprekrývanie zo všetkých uhlov.
5. Pulz a prúdenie sú prvá animácia. Treba napojiť kontrakciu zvona na posun tela a sekundárnu reakciu ramien.
6. Táto štúdia ešte nie je integrovaná do scroll príbehu webu. Po doladení materiálu pokračovať dráhou kamery, zostupom a prechodmi. Medzi jednotlivými portfóliovými ukážkami ostáva obyčajný scroll.

Neoznačovať tento checkpoint za dokončenú fotorealistickú medúzu. Zachovať schválený základ mora v `docs/OCEAN_APPROVED_BASELINE.md`.
