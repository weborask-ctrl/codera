# Chobotnica — Film IV

2026-09-19. Nadväzuje na lokálny commit 643ec78. Len chobotnica; more, ryby a rozmiestnenie sveta sú mimo tejto iterácie. Bez pushu.

## Skutočná príčina straty kvality

Pôvodný GLB obsahoval štyri materiály, ale žiadne obrazové textúry. Procedurálna koža v Blenderi sa do prenosného súboru neprenášala. Navyše octopus-blender.mjs zahadzoval načítané materiály a nahrádzal ich jednotnými farbami. Oprava preto musí zahŕňať authoring, export aj webový renderer.

V tejto relácii je dostupný cloudový Blender cez Higgsfield 3D Jutsu. Predchádzajúci záznam o jeho nedostupnosti platí len pre vtedajšie vyhľadanie nástrojov, nie ako trvalé obmedzenie. Blender nemusí technicky bežať v Higgsfielde; lokálne skripty používajú štandardné bpy. Aktuálna realizácia používa existujúci cloudový projekt 7a20cd33-574f-4a42-9aa6-e1100fbcdad1.

## Zmeny

- Upravený obrys plášťa, jemná asymetria a reliéf papíl v skutočnej geometrii. Zmeny aplikované konzistentne na oba shape keys.
- Nová farebná kresba kože, rozdielna drsnosť a mikroreliéf. UV atlas a zabalené mapy: farba 2048², normály 2048², drsnosť 1024². Sú procedurálne autorské, nie fotografický sken zvieraťa.
- Jemnejšie okraje prísaviek, mierna individuálna odchýlka tvarov, rozlíšené tkanivo vnútorných a vonkajších prstencov. Dúhovka má radiálnu kresbu. Farby malých objektov sa prenášajú cez vertex attributes.
- Zachovanie PBR materiálov a textúr pri načítaní do Three.js. Podmorský shader na mapovanej koži pridáva iba reakciu na vodu a svetlo, nepremaľuje ju starým pigmentovým šumom.
- Samostatná autorská póza ramien na piesku na konci 14-sekundovej stopy. Plavecká slučka zostáva v intervale 0–12 s; nesmie prechádzať cez pridaný koniec pri bežnom plávaní.
- Záverečná korekcia využíva priamo výškovú funkciu piesku a mierku/polohu desktopového finále. Prísavky smerujú nadol. Mobilné finále používa tú istú pózu s korekciou koreňa, preto nie je presným kontaktom každého ramena na inom mieste terénu.
- Zrušená iteratívna projekcia jednotlivých kĺbov k piesku. Web mieša celú pózu a koriguje výšku koreňa podľa vzoriek kostí a hrúbky ramien. Je to aproximácia kontaktu, nie presná kolízia všetkých vrcholov.
- Jemné nezávisle fázované pohyby koncov ramien pri plávaní; pokojový pohyb sa utlmuje pri dosadnutí. Existujúce riadenie úsilia podľa scrollu zostáva zachované.

## Reprodukcia

Skripty v scripts/:

1. octopus-film-surface.py — geometria, UV, zdrojový materiál; vstup pôvodná revízia 15.
2. octopus-film-bake.py — spustiť postupne s PASS color, normal, roughness.
3. octopus-film-small-details.py — prísavky a oči; spustiť raz.
4. octopus-film-swim-detail.py — jemný sekundárny pohyb, chránený príznakom proti opakovaniu.
5. octopus-film-landing.py — pôdorys, orientácia spodnej strany ramien, prechod a kontrolný render.

Skripty využívajú cloudový registry artifacts len na publikovanie renderov; pri lokálnom spustení treba túto časť nahradiť bežným render filepath a uložením blend/glb. Tvar a materiály nemenia žiadny externý generovaný obrázok.

## Referencie a hranice tvrdení

- Monterey Bay Aquarium, [Giant Pacific octopus](https://www.montereybayaquarium.org/animals-the-ocean/animals-a-to-z/giant-pacific-octopus): biologický a farebný referenčný zdroj. Nie je použitý ako produkčná textúra.
- Blender Manual, [glTF materials](https://docs.blender.org/manual/en/3.0/addons/import_export/scene_gltf2.html): vysvetlenie prenosného zapojenia materiálov; konkrétne operácie overené v RNA pracovného Blenderu 5.2.

Nejde o sken ani ručne dokončený produkčný sculpt. Jemné biologické správanie, mäkké tkanivo a úplné kontakty prísaviek s prostredím nemožno vyhlásiť za vyriešené iba na základe úspešného exportu. Záver sa má posudzovať podľa renderu aj pohybu na webe.

## Dodanie a overenie

- Finálna cloudová revízia tejto iterácie: 22, sceneSequence 5. GLB 41 406 324 bajtov (39,5 MiB).
- Web načítava aktualizovaný assets/blender/octopus/codera-octopus-swim.glb.
- Aktuálny editovateľný zdroj je **assets/blender/octopus/codera-octopus-film-source.zip**, obsahuje codera-octopus-film.blend. Archív má približne 39,4 MiB; rozbalený Blender súbor prekračuje 100 MiB. Starší codera-octopus-swim.blend je historická verzia pred Film IV. SHA256 rozbaleného obsahu archívu overený proti stiahnutej revízii 22.
- Samostatný octopus-look.html teraz zobrazuje ten istý GLB ako stránka, s prepínačom Plávanie/Pokoj a existujúcimi detailnými pohľadmi. Nezobrazuje už starú procedurálnu chobotnicu.
- check-octopus-film.mjs: vložené mapy farby/normál/drsnosti, 11 platných kostrových póz, jednotková mierka kostí a odlišná póza pristátia. Test prešiel.
- Vizuálne skontrolované: render pred/po povrchu, dosadnutie s dočasnou kópiou terénu, hero na webe, samostatná pokojová a pohybová póza. Browser bez shaderových chýb pri kontrole.
- V teste pri 740 × 646 a vyššej kvalite mala cesta približne 15–18 fps. Ide o údaj konkrétneho náhľadu, nie výkonový prísľub. Rozlíšenie textúr ani model neboli kvôli tomuto číslu znížené.

## Kritika po implementácii

Materiál už prežíva celý prenos Blender → GLB → Three.js; toto je zásadný rozdiel proti predchádzajúcej verzii. Farebné škvrny a mikroreliéf sú však stále autorsky procedurálne. Oči majú jednoduché viečka a celkový tvar plášťa zostáva výtvarne zjednodušený. Prísavky pri korune a samostatný pohyb ich tkaniva vyžadujú ďalšiu anatomickú prácu. Dosadnutie už nepoužíva staré lámanie kostí k terénu, ale nie je to plná simulácia mäkkých tkanív ani kompletná séria kontaktných klipov pre všetky povrchy.
