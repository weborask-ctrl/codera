# More — prerobenie podľa obrazovej referencie

Marcus 2026-09-18 povolil prepracovať schválený základ mora. Medúzu teraz nemeníme. Cieľom je priblížiť živé prostredie k `docs/design/ocean/approved-atmosphere-reference.png`.

## Postup a realizácia

1. **Kompozícia:** menej pohľadu priamo na hladinu, širší zorný uhol a viac otvorenej vody. Kamera a priestorové častice používajú zhodný smer a zorný uhol. Implementované v samostatnej štúdii.
2. **Farebná hĺbka:** sýta modrá v hĺbke, tmavšia ľavá časť, cyanové svetlo vpravo hore. Upravené objemové svetlo a farebná absorpcia; odstránený celoplošný zelenotyrkysový nádych.
3. **Hladina:** menšie základné vlny, jemnejšie normály, mapa hladiny 2048 × 2048, upravené odrazy a slnečný lesk. Útlm vzdialenej hladiny začína skôr, aby nevznikal taký ostrý horizontálny predel.
4. **Svetlo:** smer posunutý doprava, širší rozptyl pri zdroji, jemnejšie členenie objemových lúčov. Svetlo je vyhodnocované v priestore a mení sa s vlnami; nejde o video alebo vloženú fotografiu.
5. **Častice:** 3200 priestorových bodov v menšom viditeľnom objeme s rozdielnou veľkosťou podľa vzdialenosti. Bez pridávania ďalších tvorov či dekorácií.
6. **Kontrola:** porovnať rovnaký formát obrazu s referenciou, skontrolovať shaderové chyby, skutočné rozlíšenie a pauzu. Pri ďalšej iterácii hodnotiť aj bočný pohyb kamery a mobilný GPU.

## Otvorenie a porovnanie

- Server: `npm run prototype:jellyfish`.
- Nová verzia: http://127.0.0.1:4317/ocean-film.html
- Predchádzajúci základ: http://127.0.0.1:4317/ocean.html
- Model medúzy ani existujúci náhľad medúzy sa nemenili.
- Štúdia má vlastné `ocean-film.mjs` a `ocean-film-shaders.mjs`. Je to dočasná izolácia pre porovnanie; po výbere smeru zlúčiť spoločné vykresľovanie, aby sa dve implementácie nerozchádzali.

## Zdroj fyzikálnej inšpirácie

[Woods Hole Oceanographic Institution: Shedding Light on Light in the Ocean](https://www.whoi.edu/oceanus/feature/shedding-light-on-light-in-the-ocean/) — absorpcia farieb, rozptyl a sústreďovanie svetla vlnami. Použité ako vysvetlenie optických javov; nejde o validáciu fyzikálnej presnosti nášho shaderu. Vizuálny cieľ zostáva lokálna schválená obrazová referencia.

## Zostávajúci rozdiel

Kontrola: syntax oboch modulov prešla; prehliadač nevypísal chybu shaderu. Záber bol porovnaný pri 1672 × 941. Pauza ponechala počítadlo na 1069 medzi dvoma odčítaniami. Posledné vizuálne ladenie odstránilo pravidelný šum v lúčoch použitím 48 pevných integračných vzoriek a lokálneho filtra svetelnej vrstvy. Záverečná verzia bola vizuálne overená v aktuálnom okne; výkon poslednej úpravy pri Full HD/4K ešte nebol meraný. Predošlá varianta dosahovala pri 1672 × 941 približne 22 fps, tento údaj nie je benchmark finálnej úpravy.

Referenčný obrázok má bohatšie drobné odlesky a prirodzenejšie prechody svetla na hladine. Nová verzia stále miestami vytvára väčšie bledé plochy. Lúče sú aproximáciou integrácie svetelného poľa, nie plnou simuláciou rozptylu. Pred označením za finálnu filmovú kvalitu treba tieto rozdiely odstrániť a overiť pohyb aj výkon na cieľových zariadeniach. Nepridávať globálne rozmazanie na zakrytie nedostatkov.
