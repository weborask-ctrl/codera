# ecodomcek.sk — Content Inventory

Captured 2026-09-03 by fetching the raw HTML of every page (curl through the session proxy) and parsing it
directly, so all Slovak copy below is verbatim from the source, including the site's own typos and emoticons.
The live site could not be rendered in a headless browser (proxy returned 405 / connection reset), so the
visual-style section is derived from the stylesheet and the downloaded image assets, not from a screenshot.

Raw pages and assets were saved in the session scratchpad only (not in this repository); re-fetch from the live site when needed.

---

## 1. Site overview

| Item | Value |
| --- | --- |
| Domain | `https://ecodomcek.sk` (also `http://www.ecodomcek.sk` linked from contact page) |
| Company | EcoDomček, s.r.o. |
| Technology | Static HTML export of the ThemeForest theme **"Constructy – Construction Business Building Theme"** by max-themes (WordPress/Visual Composer markup left in place: `wpb-js-composer`, `vc_row`, `wpcf7-*` classes, `post-5` ids). jQuery, LayerSlider, Owl Carousel, Fancybox, Google Maps embed. |
| `<html lang>` | `en-US` (wrong — content is Slovak) |
| `<title>` (every page) | `EcoDomček - ekologické a ekonomické stavby` — identical on all 14 pages |
| Meta description | none on any page |
| Open Graph / structured data | none |
| Favicon | `images/favicon.ico` |
| Sitemap / robots.txt | none (404) |
| Analytics | none detected |
| Languages | Slovak only; no language switcher |
| Social links | none live. The theme's Facebook / Twitter / Shop icon bar is present in the HTML but commented out. |
| Page count | 14 real pages + 1 untouched theme demo page (`home-example-2.html`) still reachable via the nav dropdown |

### 1.1 Page list

| # | URL | Purpose |
| --- | --- | --- |
| 1 | `/index.html` | Homepage |
| 2 | `/work.html` | Realizácie (project list, 8 projects) |
| 3 | `/work1.html` | Project: Moderný dizajnový dom (Lúčina) |
| 4 | `/work2.html` | Project: VEĽKÁ rodina – VEĽKÝ dom (Beniakovce) |
| 5 | `/work3.html` | Project: Bungalov v Prešove |
| 6 | `/work4.html` | Project: Luxusná terasa (Chrastné) |
| 7 | `/work5.html` | Project: VEĽKÁ terasa (Rákoš) |
| 8 | `/work6.html` | Project: Garážo-sklado-terasa (Dúbrava) |
| 9 | `/work7.html` | Project: Budatín pri Žiline |
| 10 | `/work8.html` | Project: Moja prvotina: náš domček (Lúčina, 2008) |
| 11 | `/about-company.html` | O nás |
| 12 | `/our-services.html` | "Tech" (services) |
| 13 | `/blog.html` | Blog (static list, no post pages) |
| 14 | `/contact-us.html` | Kontakt |
| — | `/home-example-2.html` | Untouched English theme demo ("CONSTRUCTY", "Home example #2"). Not part of the real site but linked from the nav dropdown. |

There are no privacy/GDPR, references, gallery or individual blog-post pages. `work9.html`+ return 404.

### 1.2 Navigation (identical on every page, in this order)

1. **Úvod** → `index.html` — has a dropdown submenu containing theme leftovers: "Home example #1" → `index.html`, "Home example #2" → `home-example-2.html`
2. **Realizácie** → `work.html`
3. **O nás** → `about-company.html`
4. **Tech** → `our-services.html`
5. **Blog** → `blog.html`
6. **Kontakt** → `contact-us.html`

Mobile: hamburger icon (`pe-7s-menu`) toggling a duplicate of the same list.
Header: logo (`images/logo.png` 243×52, retina `upload/logo-retina.png` 486×104) linking to `index.html`.

### 1.3 Footer (identical on every page)

Black bar, centred: an empty link to `http://themeforest.net/user/max-themes/portfolio?ref=max-themes` followed by the text
`Powered by HTML5.` On `blog.html` the footer still reads the full theme credit:
`CONSTRUCTY. Theme by max-thems. Powered by HTML5.`

The *actual* company footer block (address card + map) is not in the footer element; it is a content section that
appears at the bottom of `index.html`, `about-company.html` and `our-services.html`:

```
EcoDomček, s.r.o.
Lúčina 33
08207 Lúčina, okr. Prešov

tel.: 0908 704 281
dobryden@ecodomcek.sk
```
(icon: `pe-7s-clock` — the theme's "opening hours" widget reused as the address card; there are no actual opening hours anywhere on the site)

---

## 2. Page-by-page inventory

### 2.1 `/index.html` — Úvod (Homepage)

**Title:** EcoDomček - ekologické a ekonomické stavby

**Headings in order** (theme uses `h1` for almost everything):
- (slider text, styled `p`) Vitajte! / Moderné stavby / PLÁNOVANIE a REALIZÁCIA
- H1 `page-title` — empty (inside the DNB badge column)
- H1 `page-heading`: Píšu o nás **na DAIBAU!**
- H1: Poradíme, prekonzultujeme. Zdarma ;)
- H1 `testimonial-title`: Zákaznícke **referencie**
- H1 `portfolio-title` ×6: *rodinný dom* Lúčina, okr. Prešov · *rodinný dom* Beniakovce, okr. Košice · *rodinný dom* Prešov · *terasa* Rákoš · *terasa* Veľký Šariš · *Terasa / sklad* Dúbrava
- (contact strip, styled divs) Volajte kedykoľvek ;) / 0908 704 281 / ... a mailujte tiež! / dobryden@ecodomcek.sk

**Section A — Hero LayerSlider (3 slides, 6.5 s each, full-width photo + animated white text + black CTA button)**

Slide 1 — image `upload/slider1.jpg` (alt "slider1"; photo of the Lúčina house: larch-clad cube, anthracite cladding, black windows, blue sky, still under construction)
> **Vitajte!**
> EcoDomček: Skvelá stavebná spoločnosť.
> Myslíme ekologicky, staviame ekonomicky. Alebo aj naopak?
> Myslíme ekonomicky, preto staviame ekologicky :))
> CTA: **KTO SME** → `work.html` (note: label says "who we are" but links to projects)

Slide 2 — image `upload/slider2.jpg` (alt "slider2")
> **Moderné stavby**
> Postavíme vaše sny.
> Všetko, čo si len zmyslíte... :)
> CTA: **Naše realizácie** → `our-services.html` (note: label says "our projects" but links to services)

Slide 3 — image `upload/slider3.jpg` (alt "slider3")
> **PLÁNOVANIE a REALIZÁCIA**
> Máte nápad? Potrebujete ho zrealizovať?
> Píšte, volajte.
> CTA: **Kontaktujte nás** → `contact-us.html`

**Section B — three-column "home-wrapper" row**

- Column (blue `colorsheme2`, right-floated): image `upload/dnb.png` alt "certifikát" — the **Dun & Bradstreet "A" Hodnotenie dôveryhodnosti 2024** badge (red "A®", text "Hodnotenie dôveryhodnosti", "2024 dun & bradstreet"). Behind it a commented-out YouTube link (`https://www.youtube.com/watch?v=6fL4gOgu6Ts`) and an empty H1.
- Column (wide):
  > # Píšu o nás na DAIBAU!
  > Roboty sa nebojíme a preto si ju aktívne hľadáme. Resp. ona si hľadá nás. Na portáli DAIBAU.SK
  > CTA button: **článok o drevostavbách na Daibau.sk** → `https://www.daibau.sk/clanok/1894/hlavne_vyhody_drevodomu_a_byvania_v_nom#eco-domcek-sro` (opens new tab)
- Column: image `upload/free-consulting.jpg` alt "free-consulting" (link with empty href)
- Column (link with empty href): 
  > # Poradíme, prekonzultujeme. Zdarma ;)
- Image `upload/pilka.jpg` (alt "", class `image-services` — decorative, presumably a saw)

**Section C — Zákaznícke referencie (testimonial carousel, dark photo background)**

| Photo (src / alt) | Quote (verbatim) | Author |
| --- | --- | --- |
| `upload/rajka.jpg` / "Johny K., Rajka (HU)" | Chlapci prišli a makali doslova od rána do noci. Aj napriek pracovnému vypätiu bola s nimi sranda a dobrá nálada. | Johny K., Rajka (HU) |
| `upload/koza.jpg` / "Wilma & Dotty" | E-e-e-e-e-ééééééééé. Me-e-e-e-. Méééééééé. Me-e-e-me-e-mééé. [preklad: Náš gazda nám spravil skvelý chlievik! Prežili sme v ňom aj tie najtuhšie zimy a priviedli na svet už niekoľko generácií svojich kozliatok.] | Wilma & Dotty *(the owner's goats — a joke testimonial)* |
| `upload/svinica.jpg` / "Jaro I., Svinica" | Rozumná komunikácia a férové jednanie, mohol som sa na nich spoľahnúť. | Jaro I., Svinica |
| `upload/keked.jpg` / "Peter F., Kéked (HU)" | Musím povedať, že som nestíhal – nasadli také tempo, že som pri svojich pracovných povinnostiach nezvládal držať krok s tým, ako rýchlo celá stavba napredovala. | Peter F., Kéked (HU) |
| `upload/budatin.jpg` / "Peťo M., Budatín" | Oceňujem ich trpezlivosť, ochotu a flexibilitu plniť všetky naše priania a zmeny – napriek tomu, že ich často zdržiavali od roboty a boli mimo plánov. | Peťo M., Budatín |

**Section D — Services strip (`services-wrapper`, 12 plain `<p>` items, no links, no icons)**

Drevodomy na kľúč · Strechy · Altánky · Terasy · Sádrokartón · Drevené obklady · Renovácie · Maľovanie · Zatepľovanie · Interiéry · Konzultácie · Obchodná činnosť

**Section E — Projects grid (6 cards: title, summary, image, black "Kuk projekt!" button)**

1. **rodinný dom Lúčina, okr. Prešov** — Super moderný dizajnový dom. Zaujme drevenou fasádou v kombinácii s kompaktnými doskami. Dom je prešpikovaný modernými technológiami a estetickými vychytávkami. Difúzne otvorená stavba s použitím ekologických materiálov. — img `upload/lucina.jpg` (alt is theme leftover: "Colored interior design") → `work1.html`
2. **rodinný dom Beniakovce, okr. Košice** — Moderný rodinný dom v novej lokalite pri Košiciach. 2 podlažia plné technológií a funkčnosti. Difúzne otvorená stavba s použitím ekologických materiálov. — img `upload/Beniakovce.jpg` (alt leftover "Family house in nature") → `work2.html`
3. **rodinný dom Prešov** — Neďaleko centra Prešova sme spáchali tento milý bungalov. Členenie domu si majiteľ premyslel do posledného detailu. Difúzne otvorená stavba s použitím ekologických materiálov. — img `upload/Presov.jpg` (alt leftover "Renovated interior house") → `work3.html`
4. **terasa Rákoš** — Obrovská terasa v Rákoši pri Košiciach. — img `upload/Rakos.jpg` (alt leftover "Modern and square house") → `work5.html`
5. **terasa Veľký Šariš** — Obrovská terasa vo Veľkom Šariši, neďaleko Prešova. — img `upload/VS.jpg` (alt leftover "Luxury House in Bali") → **`#` (dead link — no detail page exists)**
6. **Terasa / sklad Dúbrava** — Stavba, ktoré je kombináciou troch funkčných celkov: stojisko pre autá, sklad a terasa s grilom. — img `upload/Dubrava.jpg` (alt leftover "Villa Los Angeles") → `work6.html`

**Section F — Contact strip**
> Volajte kedykoľvek ;)
> **0908 704 281**
> ... a mailujte tiež!
> [dobryden@ecodomcek.sk](mailto:dobryden@ecodomcek.sk)

**Section G — Map + address card**
- Google Maps iframe embed centred on ~48.877 N, 21.436 E (Lúčina / east of Prešov, `hl=sk`)
- Address card as in §1.3.

---

### 2.2 `/work.html` — Realizácie

**Title:** EcoDomček - ekologické a ekonomické stavby. No page heading. Two-column masonry of 8 posts, alternating image / text tiles. Category tags are plain text (no links); each teaser links to its detail page; images open in Fancybox.

| # | Categories / date | H1 (link) | Teaser copy (verbatim) | Image |
| --- | --- | --- | --- | --- |
| 1 | domy, drevostavby, interiéry / Marec, 2024 | **Moderný dizajnový dom!** → `work1.html` | Super moderný dizajnový dom. Zaujme drevenou fasádou (Rhombus profil) v kombinácii s kompaktnými doskami Fundermax. Dom je prešpikovaný modernými technológiami a estetickými vychytávkami. Difúzne otvorená stavba s použitím ekologických materiálov. Od základov až po dokončenie interiéru. Užívali sme si to! | `upload/lucina.jpg` alt "Moderný dizajnový dom." |
| 2 | domy, drevostavby, interiéry / Júl, 2023 | **VEĽKÁ rodina - VEĽKÝ dom** → `work2.html` | Moderný rodinný dom v novej lokalite pri Košiciach. 2 podlažia plné technológií a funkčnosti. Difúzne otvorená stavba s použitím ekologických materiálov. Od základov až po finál. A či v zime a či v lete, makli sme ostošesť. Zabralo nám to presne rok. | `upload/Beniakovce.jpg` |
| 3 | domy, drevostavby, interiéry / Apríl, 2021 | **Bungalov v Prešove** → `work3.html` | Neďaleko centra Prešova sme spáchali tento milý bungalov. Členenie interiéru domu si majiteľ premyslel do posledného detailu. Na minimalistickom pozemku, v stiesnených podmienkach. Difúzne otvorená stavba s použitím ekologických materiálov. Od základov až po finál. Vynikajúca atmosféra, dobré vzťahy. | `upload/Presov.jpg` |
| 4 | terasy / Máj, 2019 | **Luxusná terasa** → `work4.html` | V Chrastnom pri Košiciach sme postavili krásne prestrešenie terasy. Bonbónikom bola strecha zo skla. Ufff. Sklenené tabule sú ťažké... :) ... a nebezpečné ... a krehké... Ale čo už. Máme radi výzvy :) S domácim sme nadviazali dobré vzťahy - zavolal nás postaviť aj garáž a veľký altánok s grilom. Mňam! | `upload/Chrastne.jpg` |
| 5 | terasy / Máj, 2021 | **Dobrých ľudí sa všade veľa zmestí. Preto treba VEĽKÚ terasu!** → `work5.html` | Neďaleko Košíc sme postavili obrovskú terasu, s krásnou podlahou zo sibírskeho smrekovca a strechou z Lexanu. Vraj sa tam bude stretávať veľa ľudí. A my sme im to radi umožnili. Nejaká korona či lockdown nás nezastavia :) | `upload/Rakos.jpg` |
| 6 | terasy, garáže / Apríl, 2019 | **Garážo-sklado-terasa** → `work6.html` | Milá kombinácia stojiska pre autá, skladu a terasy s grilom. Taká zábavka na pätkách, podlaha terasy je z termo jaseňa a keramickej dlažby. | `upload/Dubrava.jpg` |
| 7 | domy, drevostavby, interiéry / August, 2008 | **Moja prvotina: náš domček** → `work8.html` | Tak týmto to všetko začalo. Drevodom, ktorý som ako "kancelárska krysa" postavil podľa knižiek a rád od kamarátov. Len s nadšením. Má drevený obklad s imitáciou zrubu. Bývame v ňom od roku 2008 a sme totálne spokojní. | `upload/lucina_nas.jpg` |
| 8 | domy, drevostavby, interiéry / Júl, 2015 | **Budatín pri Žiline.** → `work7.html` | Tak toto je moderný drevodom, ktorý na prvý pohľad zaujme fasádou zo surového cetrisu. Cool, nie? Tak si to domáci želali. Na zateplenie boli použité ekologický materiály na báze drevných vlákien. | `upload/budatin1.jpg` |

Note: the "terasa Veľký Šariš" card from the homepage does **not** appear on this page and has no detail page.

---

### 2.3 Project detail pages `/work1.html` … `/work8.html`

All eight share the same layout: category tags (plain text) / date, H1 title, one or two paragraphs, hero image (Fancybox link
to itself), the line **"Preklikajte si galériu - od základov po finál."** and a row of empty-anchor Fancybox thumbnails
(`<a href="upload/…jpg">` with no visible text — the gallery is CSS/JS driven). No m², no price, no floor-plan data anywhere.

#### `/work1.html` — Moderný dizajnový dom! (Lúčina, okr. Prešov)
- Tags: domy, interiéry · Marec, 2024
- Copy:
  > Super moderný dizajnový dom. Zaujme drevenou fasádou (Rhombus profil) v kombinácii s kompaktnými doskami Fundermax. Dom je prešpikovaný modernými technológiami a estetickými vychytávkami. Difúzne otvorená stavba s použitím ekologických materiálov. Od základov až po dokončenie interiéru. Užívali sme si to!
  >
  > Dom sme začali od základov stavať v auguste 2022. Teraz (máj 2024) finišujeme interiér. Na obrázkoch uvidíte niektoré etapy výstavby hrubej stavby.
- Technical facts: diffusion-open timber-frame house; larch-type wooden facade in **Rhombus profile** combined with **Fundermax** compact HPL panels; built from foundations, start August 2022, interior finishing May 2024; 2 storeys, flat roof (from photo).
- Hero: `upload/lucina.jpg` alt "Moderný dizajnový dom."
- Gallery (10): `lucina02.jpg` … `lucina09.jpg`, `lucina010.jpg`, `lucina011.jpg`

#### `/work2.html` — VEĽKÁ rodina - VEĽKÝ dom (Beniakovce, okr. Košice)
- Tags: domy, interiéry · Marec, 2024 (list page says Júl, 2023)
- Copy:
  > Moderný rodinný dom v novej lokalite pri Košiciach. 2 podlažia plné technológií a funkčnosti. Difúzne otvorená stavba s použitím ekologických materiálov. Od základov až po finál. A či v zime a či v lete, makli sme ostošesť. Zabralo nám to presne rok.
- Technical facts: 2 storeys, diffusion-open timber construction, ecological materials, foundations to finish, build time exactly one year.
- Hero: `upload/Beniakovce.jpg`
- Gallery (12): `beniakovce001, 004, 005, 006, 007, 008, 009, 012, 013, 014, 015, 016 .jpg`

#### `/work3.html` — Bungalov v Prešove
- Tags: domy, interiéry · Apríl, 2021
- Copy:
  > Neďaleko centra Prešova sme spáchali tento milý bungalov. Členenie interiéru domu si majiteľ premyslel do posledného detailu. Na minimalistickom pozemku, v stiesnených podmienkach. Difúzne otvorená stavba s použitím ekologických materiálov. Od základov až po finál. Vynikajúca atmosféra, dobré vzťahy.
- Technical facts: single-storey bungalow, small/tight plot near Prešov centre, diffusion-open construction, from foundations to finish.
- Hero: `upload/Presov.jpg`
- Gallery (10): `presov02.jpg` … `presov11.jpg`

#### `/work4.html` — Luxusná terasa (Chrastné, okr. Košice)
- Tags: terasy · máj, 2019
- Copy:
  > V Chrastnom pri Košiciach sme postavili krásne prestrešenie terasy. Bonbónikom bola strecha zo skla. Ufff. Sklenené tabule sú ťažké... :) ... a nebezpečné ... a krehké... Ale čo už. Máme radi výzvy :) S domácim sme nadviazali dobré vzťahy - zavolal nás postaviť aj garáž a veľký altánok s grilom. Mňam!
- Technical facts: terrace roofing with **glass roof**; follow-up commissions for a garage and a large gazebo with grill.
- Hero: `upload/Chrastne.jpg`
- Gallery (13): `chrastne01.jpg` … `chrastne13.jpg`

#### `/work5.html` — Dobrých ľudí sa všade veľa zmestí. Preto treba VEĽKÚ terasu! (Rákoš, okr. Košice)
- Tags: terasy · máj, 2021
- Copy:
  > Neďaleko Košíc sme postavili obrovskú terasu, s krásnou podlahou zo sibírskeho smrekovca a strechou z Lexanu. Vraj sa tam bude stretávať veľa ľudí. A my sme im to radi umožnili. Nejaká korona či lockdown nás nezastavia :)
- Technical facts: very large terrace, **Siberian larch** decking, **Lexan** (polycarbonate) roof, built during the 2021 lockdown.
- Hero: `upload/Rakos.jpg`
- Gallery (8): `rakos01.jpg` … `rakos08.jpg`

#### `/work6.html` — Garážo-sklado-terasa (Dúbrava)
- Tags: terasy, garáže · apríl, 2019
- Copy:
  > Milá kombinácia stojiska pre autá, skladu a terasy s grilom. Taká zábavka na pätkách, podlaha terasy je z termo jaseňa a keramickej dlažby.
- Technical facts: combined carport + storage + terrace with grill; built on point footings ("na pätkách"); terrace floor of **thermo-ash** and ceramic tiles.
- Hero: `upload/Dubrava.jpg`
- Gallery (10): `dubrava01.jpg` … `dubrava10.jpg`

#### `/work7.html` — Budatín pri Žiline.
- Tags: domy, drevostavby, interiéry · júl, 2015
- Copy:
  > Tak toto je moderný drevodom, ktorý na prvý pohľad zaujme fasádou zo surového cetrisu. Cool, nie? Tak si to domáci želali. Na zateplenie boli použité ekologický materiály na báze drevných vlákien.
- Technical facts: timber house, facade of **raw Cetris** (cement-bonded particleboard), **wood-fibre insulation**.
- Hero: `upload/budatin1.jpg`
- Gallery (7): `budatin01.jpg` … `budatin07.jpg`

#### `/work8.html` — Moja prvotina: náš domček (Lúčina, the owner's own house)
- Tags: domy, drevostavby, interiéry · August, 2008
- Copy:
  > Tak týmto to všetko začalo. Drevodom, ktorý som ako "kancelárska krysa" postavil podľa knižiek a rád od kamarátov. Len s nadšením. Má drevený obklad s imitáciou zrubu. Bývame v ňom od roku 2008 a sme totálne spokojní.
- Technical facts: self-built timber house, wooden cladding imitating a log house, inhabited since 2008.
- Hero: `upload/lucina_nas.jpg`
- Gallery: **bug** — reuses the Budatín gallery (`budatin01.jpg` … `budatin07.jpg`).

---

### 2.4 `/about-company.html` — O nás

**Headings in order:** H2 `Kto sme` → H1 `ČO nám ide najlepšie` → H3 `„Čo je ekologické, je aj ekonomické“` → H3 `Spoznajte nás:`

**Body copy (verbatim):**

> ## Kto sme
> # ČO nám ide najlepšie
>
> Spoločnosť EcoDomček, s.r.o., ktorej konateľom je Mgr. Roman Chovanec, vznikla 1.1.2017, avšak osobne máme za sebou už 17 rokov skúseností so stavbou montovaných drevodomov, striech, altánkov a iných drevených konštrukcií. „Kariéra“ staviteľa sa začala písať v roku 2007, keď som si svojpomocne postavil montovaný drevodom. Práca s drevom ma veľmi zaujala, napĺňala a aj mi tak nejako prirodzene išla od ruky (hoci do vtedy som pracoval v IT oblasti). Následne ma zavolal jeden, druhý, ... piaty, ... desiaty,... kamarát urobiť strechu, altánok, či celý dom. Keďže som sa venoval aj iným činnostiam, trvalo mi desať rokov, kým som sa odhodlal pretaviť svoje zručnosti aj komerčne. Zameriavame sa teda hlavne na montované drevodomy, stavbu striech, altánkov a iných drevených konštrukcií, pretože je to materiál a technológia, ktorej veríme. Naším mottom je:
>
> ### „Čo je ekologické, je aj ekonomické“
>
> O tomto nás neustále presviedčajú stavby, ktoré sme už zrealizovali – a teda aj môj vlastný dom(ček). Investícia do tohto typu technológie sa reálne vypláca tak v komforte bývania, zo zdravotného hľadiska, ako aj finančne. Aj keď je to u nás ešte stále pomerne nová technológia, a my, konzervatívni Slováci jej veľmi nedôverujeme, v USA a Kanade je osvedčená už viac ako 200 rokov a preverená náročnejšími klimatickými podmienkami, ako u nás.
>
> V dnešnej dobe je moderné byť „eko“, aj keď mnohokrát sa skutočný význam tohto slova stráca. Budeme radi, keď Vás naša práca presvedčí o tom, že to nie je iba prázdna fráza. Že správať sa a žiť EKOlogicky je správne a rozmýšľať EKOnomicky výhodné. A postaviť rodinný dom pre nás neznamená pozbíjať dokopy kusy materiálu, ale pripraviť Vám domček – vysnívaný domov – útulné miesto rodinnej pohody. Vitajte teda vo svete, kde vonia drevo, kde sa k Vám správajú ako slušní ľudia, kde ekonomické záujmy idú v súlade s prírodou... Vitajte v EcoDomček.
>
> ### Spoznajte nás:

Image beside the text: `upload/drevo.jpg` (alt "", wood).

**"Team member" cards (theme's team grid repurposed as 4 hover-reveal value cards; text appears on hover overlay):**

Card 1 — image `upload/izolacia1.jpg` (630×290, alt leftover "team-member1")
> V zásade zateplíme čímkoľvek, ale radi pracujeme s prírodnými materiálmi napr.:
> - izoláciami na báze drevených vlákien
> - konope
> - ovčej vlny
> - minerálne vlny bez zdraviu škodlivých spojív (formaldehydy)
> - podobne veľkoplošné dosky

Card 2 — image `upload/salt.jpg` (alt leftover "team-member1")
> Proti škodcom impregnujeme drevo boritou soľou (prírodný produkt, ktorý sa získava z prírodných soľných jazier)
> - je účinná
> - trvácna
> - LACNEJŠIA ako bežne dostupné toxické nátery

Card 3 — image `upload/spravanie1.jpg` (title "Správame sa tak," is commented out in source)
> - aby sme neškodili sebe ani druhým a mohli sa aj po rokoch pozrieť zákazníkovi do očí a on nás odporučil svojim známym. Investorovi nerobíme to, čo by sa nepáčilo nám, ak by to robili nejakí robotníci.
> - S investorom sa snažíme nadviazať vzťah založený na vzájomnej dôvere, nie len strohý obchodný kontrakt.
> - 100% VY: Neberieme viac stavieb naraz - aby sme potom neodbiehali a nestíhali ani na jednej. Svoj čas venuje na 100% Vám.
> - 100% MY: Každú stavbu robíme osobne - fyzicky, manažérsky i logisticky – nenajímam si partie neznámych ľudí, ktorým nemôžem dôverovať.

Card 4 — image `upload/hodnoty.jpg` (title "Naše hodnoty:" is commented out in source)
> - Individuálny prístup: Zákazník nie je len „jeden z mnohých“, z ktorého budem mať biznis. Je to človek (ako každý z nás), ktorý má svoje sny a my sa mu ich snažíme pomôcť naplniť.
> - Sme dobrá partia: Nie sme len „spolupracovníci“, ale priatelia, ktorí sa vedia podržať.
> - Slušnosť: Prístup celej partie je založený na hodnotách, ktoré vyznávame – jednáme férovo, na pracovisku nenájdete žiaden alkohol. Podľa toho si vyberáme aj svojich kolegov.
> - Ústretovosť: Vyhovieme požiadavkám na zmeny v priebehu stavby (aj napriek osobnej časovej či finančnej strate).
> - Poriadok na stavenisku: počas stavby aj po nej.

Commented out (present in source, not rendered): three theme team members (Jack Smith / Joana McKnee / George Nash), a "Company history" / "Company presentation" (YouTube `6fL4gOgu6Ts`) block, and `upload/free-consulting.jpg`.

Then: contact strip (same as homepage §2.1 F), map iframe, address card (§1.3).

---

### 2.5 `/our-services.html` — "Tech" (services)

**Title:** same. No page heading. Twelve service blocks, each = image (315×290) + H1 (theme splits the H1 into a small
lead `<span>` and the main word) + one paragraph. Copy verbatim:

1. img `upload/drevodomy.jpg` alt "drevodomy"
   > # *na kľúč:* (Drevo)domy
   > Postavíme vám krásny, zdravý, ekologický a ekonomický domček, v ktorom je príjemná klíma, v lete chladí, v zime je tepľučký a zaručuje vysoký komfort bývania, rýchlosť výstavby a finančné výhody. Od základov až po kolaudáciu.
2. img `upload/roofing.jpg` alt "roofing"
   > # *Všetky možné:* strechy
   > Konštrukcia sedlová, valbová či pultová??? Krytina plechová, keramická pálená, betónová, asfaltová, PVC fólia či ZELENÁ??? Strešné okno, komín, odkvapy. Všetko máme, všekto spravíme.
3. img `upload/altanok.jpg` alt "altanok"
   > # *Pre chvíle s priateľmi:* Altánky
   > V srdci vašej záhrady si nájdite váš osobný priestor. Alebo si pozvite tých, ktorých máte radi a poriadne to roztočne. A ak by prišla búrka? Nevadí, skrytí v altánku grilujete ďalej.
4. img `upload/terasa.jpg` alt "terasa"
   > # *K domu patria:* terasy
   > Spoločné raňajky s rodinou, posedenie s priateľmi... kde inde ako na terase. Ideálne miesto, ktoré rozširuje obytný priestor domu. Je možné ho uzavrieť a používať aj v zime. Skvelý nápad!
5. img `upload/sdk.jpg` alt "sdk"
   > # *Interiér:* Sadrokartóny
   > Sadrokartón je tá najbežnejšia finálna vrstva pri suchej výstavbe. Ale skúsenosti máme aj so sadrovláknitými doskami a inými veľkoplošnýmmi materiálmi.
6. img `upload/obklad.jpg` alt "obklad"
   > # *Pekné drevené:* Obklady
   > Či už v interiéri alebo v exteriéri, drevený obklad vždy dokáže zaujať. Klasický tatranský profil, moderný rhombus, veľkoplošné materiály alebo thermo drevo.
7. img `upload/reno.jpg` alt "reno"
   > # *Chce to zmenu?* Renovácie
   > Ak vás vzhľad vášho príbytku už omrzel, je čas na zmenu. Častokrát stačí malý detail, inokedy to treba urobiť vo veľkom. Náš cieľ ostáva rovnaký: zrealizovať váš sen.
8. img `upload/paint.jpg` alt "paint"
   > # *Dokončovanie:* Maľovanie
   > Ak aj všetko ide dobre, vždy sa to dá pokaziť nevhodnou finalizáciou. A na to si dávame bacha. Skúmame detaily a keď treba, cibríme to do dokonalosti.
9. img `upload/izol.jpg` alt "izol"
   > # *Je vám zima?* Zateplíme
   > Možnosti sú rôzne: výplň stien, obvodové steny zvonku... minerálna vata, alebo prírodné izolácie na báze drevené vlákna, keď treba, tak aj polystyrén... Odizolujeme vás od zimy, tepla či hluku.
10. img `upload/inter.jpg` alt "inter"
    > # *Niečo pekné:* Interiéry
    > Ak je vaša predstavivosť príliš bujná, alebo váš interiérový dizajnér sa poriadne vybláznil - zverte to nám. Máme radi výzvy. Podsvietený sprchový kút? Pochôdzna sieť nad galériou? Hojdačka z druhého poschodia? Áno, aj také sme robili...
11. img `upload/consult.jpg` alt "consult"
    > # *Radi poskytneme:* Konzultácie
    > Keďže nie sme strohí obchodníci, ale najmä nadšenci dervostavieb, radi poradíme a usmerníme - hoci aj zadarmo.
12. img `upload/obchod.jpg` alt "obchod"
    > # *Chcete niečo?* Zoženieme, zobchodujeme
    > Vďaka partnerstvám a dobrým vzťahom so stavebninami a všetkými dodávateľmi, vieme zohnať naozaj aj neštandardné vychytávky a vybaviť výhodné ceny.

**Quote banner** (background image `upload/grid.jpg`, big white text):
> EcoDomček
> najlepšia voľba

**Contact strip (variant):**
> Volajte, mailujte kedykoľvek ;)
> **0908 704 281**
> dobryden@ecodomcek.sk

Then map iframe + address card.

---

### 2.6 `/blog.html` — Blog

**Title:** same. Static two-column tile list (theme's "post-view" tiles); **none of the tiles link anywhere** (hrefs are
commented out) and there are no post pages. Nine tiles, alternating title-tile / image-tile. Some dates are still the
theme's English placeholders ("March 23, 2015"). Verbatim:

1. Title tile — category **domy** / Jún, 2024
   > # Hľadáme nových pracantov!
   > # Krásna robota, vtipný kolektív, výplata tiež nie na zahodenie :)
2. Image tile — `upload/praca.jpg` alt "praca"
   > Si zručný a používaš aj hlavu?
   > Máš rád prácu s drevom či iné stavbárske aktivity?
   > Môžeš byť aj absolventov odbornej školy, alebo mať 20-ročnú prax.
   > Skúsme sa stretnúť a uvidíme: možno sa naše cesty spoja :)
   > Aj k zamestnancom sa správame férovo: pracovnú dobu si vieme dohodnúť, za poctivú prácu - spravodlivá mzda a tej srandy čo v robote zažiješ, to ti neponúkne žiaden iný zamestnávateľ!
3. Title tile — **materiály** / Marec, 2020
   > # Soľ nad zlato, alebo ochrana dreva trochu inak
   > # Toto nie je rozprávka. Na základe skutočnej udalosti...
4. Image tile — `upload/sol2.jpg` alt "soľ" — **materiály** / Máj, 2020 (empty H1)
   > Prírodnou ochranou dreva je boritá soľ - vzniknutá z kyseliny boritej (chemicky H3BO3). Je to soľ, ktorá v prírode vzniká odparovaním vody zo soľných jazier a následným vyzrážaním soľných kryštálov. Kyselina boritá sa vo všeobecnosti využíva na dezinfekciu, ničí plesne má antibakteriálne účinky, znižuje horľavosť látok napr. dreva tiež má široké uplatnenie ako insekticíd.
5. Image tile — `upload/kozy.jpg` alt "kozy" — **eko** / Máj, 2024
   > # Ďakujeméé - é - é - é!
   > E - e - e - eko!
6. Title tile — **material** / March 23, 2015
   > # Používanie prírodných materiálov
7. Image tile — `upload/seno.jpg` alt "seno" — **material** / Máj, 2024
   > # Eko život
   > Kozičkám, ktoré chovám: seno na zimu, chystá celá firma :)
8. Image tile — `upload/dennik.jpg` alt "" — **office** / Marec 23, 2024
   > # Ako nestratiť prehľad ani hlavu...
   > ... ani financie a zákazníka
9. Title tile — **office** / March 24, 2015
   > # Denník stavbára
10. Image tile — `upload/house.jpg` alt "" — **material** / Marec 24, 2024
    > # drevo
    > seno
    > drevovláknité izolácie

Footer on this page: `CONSTRUCTY. Theme by max-thems. Powered by HTML5.`

---

### 2.7 `/contact-us.html` — Kontakt

**Title:** same. Layout: image column (`upload/new-houses.jpg` alt "", `upload/dnb.png` alt "certifikát", `upload/two-men.jpg` alt ""), a quote-style H1, one paragraph, the form, and a company-details column.

**Heading (H1 `contact-form-title`):**
> „Postavíme Vám domček, vysnívaný dom, útulné miesto rodinnej pohody.
> Domov si už z neho spravíte sami“

**Paragraph:**
> Napíšte nám svoju požiadavku. Určite sa ozveme. Keď už nič iné, minimálne skúsime poradiť.

**Form** `#contact-form` (`action="#"`, Contact Form 7 markup, no visible backend — likely non-functional):

| Field | name / id | type | placeholder | required |
| --- | --- | --- | --- | --- |
| Meno | `name` | text | `Meno *` | yes (aria-required) |
| Email | `mail` | text (validates-as-email class) | `Email *` | yes |
| Predmet | `subject` | text | `Predmet` | no |
| Správa | `comment` | textarea 40×10 | `Správa` | no |
| Submit | `submit_contact` | submit | value **`Odoslať správu`** | — |

**Contact column (`contact-info-right`):**
> Tel: 0908 704 281
> Email: dobryden@ecodomcek.sk (mailto)
> Web: www.ecodomcek.sk (→ http://www.ecodomcek.sk)

**Company registration block (`contact-info--wrapper type2`):**
> IČO: 50619616
> IČ DPH: SK2120403648
> bankové spojenie: FIO Banka,
> SWIFT/BIC: FIOZSKBAXXX
> IBAN: SK92 8330 0000 0027 0113 1053
> Spoločnosť registrovaná v Obchodnom registri Okresného súdu v Prešove oddiel Sro, vložka číslo 33794/P

**Map section:** heading text `Nájdite nás` / `NA MAPE`, Google Maps iframe (same Lúčina embed). The page also loads the
old Google Maps JS API with a marker hard-coded to **34.0205, -118.2005 (Los Angeles)** — a theme leftover that is not visible because the iframe embed is what actually renders.

**Quote banner** (bg `upload/grid.jpg`):
> EcoDomček je tá správna
> voľba pre váš projekt.

Note: the registered address (Lúčina 33, 082 07 Lúčina) does **not** appear on the contact page itself; it is only in the address card on index / about / services.

---

## 3. Consolidated facts

### 3.1 Company details (single source: contact page + address card + about page)

| Field | Value |
| --- | --- |
| Legal name | EcoDomček, s.r.o. |
| Managing director (konateľ) | Mgr. Roman Chovanec |
| Founded | 1.1.2017 (owner building timber houses since 2007; "17 rokov skúseností") |
| Address | Lúčina 33, 082 07 Lúčina, okr. Prešov |
| Phone | 0908 704 281 |
| E-mail | dobryden@ecodomcek.sk |
| Web | www.ecodomcek.sk |
| IČO | 50619616 |
| IČ DPH | SK2120403648 |
| Bank | FIO Banka, SWIFT/BIC FIOZSKBAXXX, IBAN SK92 8330 0000 0027 0113 1053 |
| Register | Obchodný register Okresného súdu v Prešove, oddiel Sro, vložka č. 33794/P |
| Opening hours | not stated anywhere ("Volajte kedykoľvek ;)") |
| Credentials | Dun & Bradstreet "A" Hodnotenie dôveryhodnosti 2024 badge; featured on daibau.sk |
| Service area (inferred from projects) | Prešov and Košice regions, plus Budatín/Žilina and cross-border jobs in Hungary (Rajka, Kéked) |
| Motto | „Čo je ekologické, je aj ekonomické“ / logo tagline "EKOlogické · EKOnomické STAVBY" |
| Brand voice | informal, humorous, first-person singular slipping into plural, emoticons `:)` `;)` `:))`, exclamations, self-deprecating ("kancelárska krysa", "spáchali tento milý bungalov") |

### 3.2 Services (12, as listed on homepage; expanded on "Tech" page)

Drevodomy na kľúč · Strechy · Altánky · Terasy · Sádrokartón · Drevené obklady · Renovácie · Maľovanie · Zatepľovanie · Interiéry · Konzultácie · Obchodná činnosť

Recurring technical vocabulary: montované drevodomy, difúzne otvorená stavba, ekologické materiály, drevovláknité izolácie, konope, ovčia vlna, minerálna vlna bez formaldehydov, boritá soľ (impregnácia), Rhombus profil, tatranský profil, thermo drevo / termo jaseň, Fundermax kompaktné dosky, Cetris, sibírsky smrekovec, Lexan, sadrovláknité dosky, sedlová/valbová/pultová strecha, zelená strecha.

### 3.3 Projects (master table)

| Project (site title) | Location | Type | Date shown | Materials / tech | Detail page | Gallery imgs |
| --- | --- | --- | --- | --- | --- | --- |
| Moderný dizajnový dom! / rodinný dom Lúčina | Lúčina, okr. Prešov | 2-storey timber house, flat roof | Marec 2024 (build Aug 2022 → May 2024) | Rhombus wood facade + Fundermax panels, diffusion-open, eco materials, foundations→interior | work1 | 10 |
| VEĽKÁ rodina - VEĽKÝ dom / rodinný dom Beniakovce | Beniakovce, okr. Košice | 2-storey timber house | Júl 2023 / Marec 2024 | diffusion-open, eco materials, 1 year build | work2 | 12 |
| Bungalov v Prešove / rodinný dom Prešov | Prešov | bungalow, tight plot | Apríl 2021 | diffusion-open, eco materials | work3 | 10 |
| Luxusná terasa | Chrastné, okr. Košice | terrace roofing | Máj 2019 | glass roof; later garage + gazebo | work4 | 13 |
| VEĽKÁ terasa / terasa Rákoš | Rákoš, okr. Košice | large terrace | Máj 2021 | Siberian larch deck, Lexan roof | work5 | 8 |
| Garážo-sklado-terasa / Terasa / sklad Dúbrava | Dúbrava | carport + storage + terrace | Apríl 2019 | point footings, thermo-ash + ceramic floor | work6 | 10 |
| Budatín pri Žiline. | Budatín (Žilina) | timber house | Júl 2015 | raw Cetris facade, wood-fibre insulation | work7 | 7 |
| Moja prvotina: náš domček | Lúčina | owner's own timber house | August 2008 | log-imitation cladding | work8 | 7 (wrong set) |
| terasa Veľký Šariš | Veľký Šariš, okr. Prešov | large terrace | — | — | none (homepage only, dead link) | 0 |

No m², prices, energy classes or floor plans are published for any project.

### 3.4 Testimonials — see §2.1 C (5 items, 4 real + 1 goat joke). Locations: Rajka (HU), Svinica, Kéked (HU), Budatín.

### 3.5 CTAs

| Label | Target | Where |
| --- | --- | --- |
| KTO SME | work.html | hero slide 1 |
| Naše realizácie | our-services.html | hero slide 2 |
| Kontaktujte nás | contact-us.html | hero slide 3 |
| článok o drevostavbách na Daibau.sk | daibau.sk article | homepage |
| Kuk projekt! ×6 | work1/2/3/5/6, `#` | homepage project cards |
| Odoslať správu | form submit (`action="#"`) | contact page |
| phone / mailto | tel text (not a `tel:` link) / mailto | index, about, services, contact |

### 3.6 Image assets (all under `/upload/` unless noted)

Brand: `images/logo.png`, `upload/logo-retina.png`, `images/favicon.ico`, `images/bg-image.jpg` (theme blueprint/crane render used as fixed page background).
Hero: `slider1.jpg` (Lúčina house), `slider2.jpg`, `slider3.jpg`.
Homepage: `dnb.png` (D&B badge), `free-consulting.jpg`, `pilka.jpg`, `grid.jpg` (quote banner bg).
Testimonials: `rajka.jpg`, `koza.jpg`, `svinica.jpg`, `keked.jpg`, `budatin.jpg`.
Project covers: `lucina.jpg`, `Beniakovce.jpg`, `Presov.jpg`, `Rakos.jpg`, `VS.jpg`, `Dubrava.jpg`, `Chrastne.jpg`, `lucina_nas.jpg`, `budatin1.jpg`.
Galleries: `lucina02–09, 010, 011`; `beniakovce001, 004–009, 012–016`; `presov02–11`; `chrastne01–13`; `rakos01–08`; `dubrava01–10`; `budatin01–07`.
About: `drevo.jpg`, `izolacia1.jpg`, `salt.jpg`, `spravanie1.jpg`, `hodnoty.jpg` (630×290 each; also unused `team-member2/3/4.jpg` referenced in commented code).
Services (315×290): `drevodomy.jpg`, `roofing.jpg`, `altanok.jpg`, `terasa.jpg`, `sdk.jpg`, `obklad.jpg`, `reno.jpg`, `paint.jpg`, `izol.jpg`, `inter.jpg`, `consult.jpg`, `obchod.jpg`.
Blog: `praca.jpg`, `sol2.jpg`, `kozy.jpg`, `seno.jpg`, `dennik.jpg`, `house.jpg`.
Contact: `new-houses.jpg`, `two-men.jpg`, `dnb.png`.

Alt-text quality: mostly empty or file-name-like; six homepage project images carry theme-demo English alts ("Luxury House in Bali", "Villa Los Angeles", …).

---

## 4. Current visual style (from CSS + assets; not screenshot-verified)

- **Layout:** boxed 1260 px `container-wrapper` centred with a soft drop shadow, floating over a **fixed full-screen background photo of architectural blueprints and a white 3D crane model** (`images/bg-image.jpg`, theme stock). White content area. Breakpoints at 1280/960/767/630 px. Full-width LayerSlider hero with rotating/scaling text animations.
- **Logo:** geometric roof/chevron mark in dark brown `≈#7a4a2a`, olive green `≈#7a9635` and tan; wordmark "ECODOMČEK" in widely tracked caps (ECO green, DOMČEK brown), tagline "EKOlogické/EKOnomické STAVBY".
- **Colour:** essentially black/white theme — black CTA buttons (`#000`, white 13 px bold uppercase text), black footer, dark grey body text (`#6b6b6b` links, `#000` headings). Theme accents: orange `#f58243` (`colorsheme1`, footer link hover, portfolio title spans), blue `#0b559e` (`colorsheme2` DNB badge column, dropdown/current menu, hover states, submit hover). The only bespoke change: main-menu hover/current background is **olive green `#7a9635`** (the logo green; the original `#0b559e` is commented out in CSS). Testimonial section uses white text on a dark photo.
- **Typography:** Google Fonts **Open Sans** (300–800) everywhere; Playfair Display loaded for the blockquote style; Lato/Oswald/Indie Flower loaded but unused. Headings are small uppercase bold (h1 18 px, h2 16 px) with a lighter `<span>` lead word; hero text 72 px bold white with heavy text-shadow, italic 24 px subline.
- **Components:** 3-column "pego-columns" tiles (315×290 images), hover-overlay "team member" cards, masonry post tiles, Fancybox galleries, Owl testimonial carousel, Google Maps iframe, `pe-7s` line icons (`clock`, `video`, `menu`, `plus`).
- **Overall impression:** a 2015-era generic construction-business WordPress theme lightly localised; photos are real job-site snapshots (phone camera, unstyled) which is the most authentic asset the site has.

---

## 5. Notable issues worth carrying into the redesign brief

1. Theme residue is visible: "Home example #1/#2" dropdown, `home-example-2.html` demo page in English, "CONSTRUCTY. Theme by max-thems" footer on blog, English demo alt texts, English demo dates, LA map marker in JS, `lang="en-US"`.
2. Identical `<title>` on all pages, no meta descriptions, no sitemap, no OG tags, no analytics.
3. Homepage CTAs are mislabelled: "KTO SME" → projects, "Naše realizácie" → services.
4. Dead link: "terasa Veľký Šariš" → `#`; `work8` shows the Budatín gallery instead of its own.
5. Blog is a static list with no links and no post content beyond teasers; two entries have empty H1s.
6. Contact form posts to `#` (no handler visible); phone number is not a `tel:` link.
7. Registered address is missing from the contact page; no opening hours anywhere; no privacy/GDPR page despite a form.
8. No social profiles; no language variants.
9. Copy is full of personality (emoticons, jokes, goat testimonial) — a real differentiator, but also several typos to fix: "všekto", "veľkoplošnýmmi", "dervostavieb", "roztočne", "absolventov", "Stavba, ktoré je", "ekologický materiály".
