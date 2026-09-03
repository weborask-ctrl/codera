# ECODOMCEK.SK — obsahový inventár (Fáza 0, priebežný stav)

Stav: NEÚPLNÉ — zostavené len z verejných search výsledkov (WebSearch),
pretože priamy prístup na `ecodomcek.sk` aj na väčšinu ostatných externých
domén (napr. `daibau.sk`) je v tomto prostredí blokovaný network egress
proxy (`EGRESS_BLOCKED`). Toto NIE JE plnohodnotný crawl — je to podklad
na doplnenie, kým sa nevyrieši prístup alebo kým nedodáš obsah priamo.

Vytvorené: 2026-09-03.

---

## 1. Firma — potvrdené fakty

- **Názov:** Eco Domček, s.r.o.
- **Konateľ:** Mgr. Roman Chovanec — do stavebníctva prišiel z IT, prvý
  montovaný drevodom si postavil sám v roku 2007.
- **Vek firmy vs. skúsenosti — NEZROVNALOSŤ v zdrojoch:**
  - jeden zdroj: firma založená 1. 1. 2017, tím s 10-ročnou skúsenosťou
  - iný zdroj (referencia zákazníka): „18 rokov skúseností s drevostavbami"
  - → **potrebuje overenie priamo s klientom**, nesmie sa použiť
    nepotvrdené číslo na dôverovej vrstve (zákon č. 3 CLAUDE.md).
- **Sídlo/pôsobisko:** spomínaná lokalita Lúčina (z názvu projektu aj
  z katalógového záznamu „drevostavby, drevodomy, strechy, altánky,
  terasy, sadrokartón, Lúčina").
- **Claim:** „ekologické a ekonomické stavby" — „nemontujeme kusy
  materiálu, pripravujeme vysnívaný domov".

## 2. Služby / produkty (potvrdené z viacerých zdrojov)

- Montované drevodomy (nízkoenergetické až pasívne)
- Strechy
- Altánky
- Terasy
- Sadrokartón (interiérové práce)
- Záhradné domčeky, drevníky, drobné hospodárske stavby (napr. chlievik
  pre kozy/sliepky)
- Kombinované objekty — príklad z portfólia: jedna stavba spájajúca tri
  funkčné jednotky (parkovanie auta, sklad, terasa s grilom)

## 3. Technológia (podstránky existujú, obsah len čiastočne známy)

- `/technologia/difuzne-uzatvorena-konstrukcia/` — difúzne uzatvorená
  konštrukcia (presný obsah/parametre neznáme — treba stiahnuť)
- `/technologia/kurenie/` — kúrenie: kozub často stačí ako jediný zdroj;
  alternatívy plyn/elektrina, tepelné čerpadlá, solárna energia
- Ochrana dreva: bóraxová soľ (prírodný produkt zo soľných jazier) proti
  škodcom — spomínané ako súčasť "prírodné materiály" pozicioningu

## 4. Portfólio / projekty (čiastočný zoznam z URL štruktúry)

- `/projekt/2013-lucina-zahradny-domcek-drevnik-chlievik-pre-kozy-a-sliepky/`
  — záhradný domček + drevník + chlievik, rok 2013, lokalita Lúčina
- Ďalší nájdený príklad (bez URL): veľká terasa vo Veľkom Šariši
  (pri Prešove)
- Vzor kombinovanej stavby: parkovanie + sklad + terasa s grilom (presná
  lokalita/rok neznáme)
- **Celkový zoznam realizácií, roky, fotky vo vysokom rozlíšení —
  chýba.** URL vzor `/projekt/<rok>-<lokalita>-<popis>/` naznačuje, že
  portfólio je pravdepodobne rozsiahlejšie, len sme nevideli plný zoznam.

## 5. Navigácia / štruktúra webu (rekonštruovaná z URL, NEúplná)

```
/                                    Úvod
/o-spolocnosti/                      O spoločnosti
/technologia/
  /difuzne-uzatvorena-konstrukcia/   Technológia — konštrukcia
  /kurenie/                          Technológia — kúrenie
/projekt/<slug>/                     Detail realizácie (viacero, presný počet neznámy)
/blog-novinky/                       Blog / Novinky
```

Pravdepodobne existujú aj: Kontakt, Cenník/Ponuka, prípadne Kariéra —
**nepotvrdené, treba overiť reálnym crawlom alebo od klienta.**

## 6. Čo CHÝBA a je blokujúce pre ďalšie fázy

Toto potrebujem priamo od teba (skopírovať/vložiť text, poslať
screenshoty, alebo WordPress export) — bez toho fáza 0 nemôže byť
uzavretá a fáza 2 (statické kompozície) nemá o čo sa oprieť:

1. **Plný textový obsah** stránok O spoločnosti, oboch Technológia
   podstránok, a aspoň 5–8 detailov projektov (texty + parametre).
2. **Kontaktné údaje** — telefón, e-mail, adresa, IČO/DIČ (na
   LocalBusiness structured data) — WebSearch ich nenašiel.
3. **Kompletný zoznam realizácií** s rokmi a fotografiami vo vysokom
   rozlíšení (nie z webu — originály).
4. **Presné číslo rokov pôsobenia / skúseností** — vyriešiť rozpor
   2017 vs. 18 rokov.
5. **Cenník / orientačné ceny**, ak existujú na webe.
6. **Existencia stránky Kontakt/Ponuka** a jej presný obsah.
7. **Skladba konštrukcie s hrúbkami vrstiev a U-hodnotou** — nutné pre
   beat „rez stenou" v zážitkovej architektúre (PLAN.md §5, Beat 4).
8. **Výber „hrdinského domu"** pre 3D svet — fotky zo všetkých strán +
   interiér + pôdorys/výkresy, ak existujú (PLAN.md §14, bod 1).

## 7. Ako to doplniť najrýchlejšie

Odporúčané poradie:
1. Skús znova sprístupniť `ecodomcek.sk` cez Environment → Network
   access (zmena sa musí uložiť a prejaviť v NOVEJ session — v tejto
   ešte nefunguje, over to najprv v novom chate/session skôr než mi
   povieš "skús teraz").
2. Kým to nejde: pošli mi WordPress export (Nástroje → Exportovať v
   administrácii) alebo prilep texty jednotlivých stránok sem do chatu.
3. Fotky/výkresy realizácie posielaj ako súbory priamo do konverzácie.
