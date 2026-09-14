# -*- coding: utf-8 -*-
"""EcoDomček — every string on the site.

Rule 3 of CLAUDE.md: nothing about the business is invented. Everything
here traces to clients/ecodomcek/CONTENT_INVENTORY.md, which was captured
from the client's own site. Quoted client sentences are marked VERBATIM
and are only corrected for the client's own typos (SÁDROKARTÓN →
sadrokartón, dervostavieb → drevostavieb); meaning is never touched.

Numbers we do not have stay as the visible placeholder [doplní EcoDomček].
"""

# ── company ──────────────────────────────────────────────────────────────
NAME = "EcoDomček, s.r.o."
PHONE = "0908 704 281"
PHONE_RAW = "+421908704281"
EMAIL = "dobryden@ecodomcek.sk"
ADDRESS = ["Lúčina 33", "082 07 Lúčina", "okr. Prešov"]
LEGAL = ["IČO 50619616", "IČ DPH SK2120403648", "OR OS Prešov, Sro 33794/P"]
DIRECTOR = "Mgr. Roman Chovanec"
MOTTO = "Čo je ekologické, je aj ekonomické."          # VERBATIM
WELCOME = "Vitajte vo svete, kde vonia drevo."          # VERBATIM

DISCLAIMER = ("Vizualizácie domu sú návrhové — nie sú to fotografie realizácie. "
              "Fotografie pri realizáciách sú skutočné.")

NAV = [
    ("Úvod", "index.html"),
    ("Realizácie <sup>8</sup>", "realizacie.html"),
    ("Služby <sup>12</sup>", "sluzby.html"),
    ("Stena", "stena.html"),
    ("Technológia", "technologia.html"),
    ("O nás", "o-nas.html"),
    ("Kontakt", "kontakt.html"),
]

FOOTER_CLAIM = ("Postaviť rodinný dom pre nás neznamená pozbíjať dokopy kusy materiálu, "
                "ale pripraviť vám domček — útulné miesto rodinnej pohody.")   # VERBATIM (skrátené)

FOOTER_COLS = [
    ("EcoDomček, s.r.o.", [
        "Lúčina 33", "082 07 Lúčina", "okr. Prešov",
        f'<a href="tel:{PHONE_RAW}" style="margin-top:12px;display:inline-block">{PHONE}</a>',
        f'<a href="mailto:{EMAIL}">{EMAIL}</a>',
    ]),
    ("Údaje", LEGAL + [f"Konateľ: {DIRECTOR}"]),
]

# ── the twelve services (client's own texts, VERBATIM) ───────────────────
# (uvádzač, názov, text)
SERVICES = [
    ("Na kľúč", "(Drevo)domy",
     "Postavíme vám krásny, zdravý, ekologický a ekonomický domček, v ktorom je príjemná "
     "klíma, v lete chladí, v zime je teplučký a zaručuje vysoký komfort bývania, rýchlosť "
     "výstavby a finančné výhody. Od základov až po kolaudáciu."),
    ("Všetky možné", "Strechy",
     "Konštrukcia sedlová, valbová či pultová? Krytina plechová, keramická pálená, betónová, "
     "asfaltová, PVC fólia či zelená? Strešné okno, komín, odkvapy. Všetko máme, všetko spravíme."),
    ("Pre chvíle s priateľmi", "Altánky",
     "V srdci vašej záhrady si nájdite váš osobný priestor. Alebo si pozvite tých, ktorých máte "
     "radi, a poriadne to roztočte. A ak by prišla búrka? Nevadí, skrytí v altánku grilujete ďalej."),
    ("K domu patria", "Terasy",
     "Spoločné raňajky s rodinou, posedenie s priateľmi… kde inde ako na terase. Ideálne miesto, "
     "ktoré rozširuje obytný priestor domu. Je možné ho uzavrieť a používať aj v zime. Skvelý nápad!"),
    ("Interiér", "Sadrokartóny",
     "Sadrokartón je tá najbežnejšia finálna vrstva pri suchej výstavbe. Ale skúsenosti máme aj so "
     "sadrovláknitými doskami a inými veľkoplošnými materiálmi."),
    ("Pekné drevené", "Obklady",
     "Či už v interiéri alebo v exteriéri, drevený obklad vždy dokáže zaujať. Klasický tatranský "
     "profil, moderný rhombus, veľkoplošné materiály alebo thermo drevo."),
    ("Chce to zmenu?", "Renovácie",
     "Ak vás vzhľad vášho príbytku už omrzel, je čas na zmenu. Častokrát stačí malý detail, inokedy "
     "to treba urobiť vo veľkom. Náš cieľ ostáva rovnaký: zrealizovať váš sen."),
    ("Dokončovanie", "Maľovanie",
     "Ak aj všetko ide dobre, vždy sa to dá pokaziť nevhodnou finalizáciou. A na to si dávame bacha. "
     "Skúmame detaily a keď treba, cibríme to do dokonalosti."),
    ("Je vám zima?", "Zateplíme",
     "Možnosti sú rôzne: výplň stien, obvodové steny zvonku… minerálna vata alebo prírodné izolácie "
     "na báze drevného vlákna, keď treba, tak aj polystyrén. Odizolujeme vás od zimy, tepla či hluku."),
    ("Niečo pekné", "Interiéry",
     "Ak je vaša predstavivosť príliš bujná alebo sa váš interiérový dizajnér poriadne vyblaznil — "
     "zverte to nám. Máme radi výzvy. Podsvietený sprchový kút? Pochôdzna sieť nad galériou? "
     "Hojdačka z druhého poschodia? Áno, aj také sme robili."),
    ("Radi poskytneme", "Konzultácie",
     "Keďže nie sme strohí obchodníci, ale najmä nadšenci drevostavieb, radi poradíme a usmerníme — "
     "hoci aj zadarmo."),
    ("Chcete niečo?", "Zoženieme, zobchodujeme",
     "Vďaka partnerstvám a dobrým vzťahom so stavebninami a všetkými dodávateľmi vieme zohnať "
     "naozaj aj neštandardné vychytávky a vybaviť výhodné ceny."),
]

# ── the eight realisations (client's own descriptions, VERBATIM) ─────────
# slug, year, month, title, place, tags, thumb, verbatim text, what the photo shows
PROJECTS = [
    dict(services=[0, 5, 9], slug="2024-lucina", year="2024", month="marec", title="Moderný dizajnový dom",
         place="Lúčina, okr. Prešov", tags=["Dom", "Drevostavba", "Interiér"], thumb="t2024", photo="2024-lucina",
         text="Super moderný dizajnový dom. Zaujme drevenou fasádou (Rhombus profil) v kombinácii "
              "s kompaktnými doskami Fundermax. Dom je prešpikovaný modernými technológiami "
              "a estetickými vychytávkami. Difúzne otvorená stavba s použitím ekologických "
              "materiálov. Od základov až po dokončenie interiéru. Užívali sme si to!",
         shot="Dvojpodlažná hmota s drevenou fasádou a tmavým prízemným krídlom.",
         specs=[("Fasáda", "Rhombus profil · smrekovec"), ("Doplnková fasáda", "Kompaktné dosky Fundermax"),
                ("Konštrukcia", "Difúzne otvorená drevostavba"), ("Rozsah", "Od základov po dokončenie interiéru")],
         hero=True),
    dict(services=[0, 9], slug="2023-kosice", year="2023", month="júl", title="Veľká rodina — veľký dom",
         place="pri Košiciach", tags=["Dom", "Drevostavba", "Interiér"], thumb="t2023", photo="2023-kosice",
         text="Moderný rodinný dom v novej lokalite pri Košiciach. 2 podlažia plné technológií "
              "a funkčnosti. Difúzne otvorená stavba s použitím ekologických materiálov. Od základov "
              "až po finál. A či v zime a či v lete, makli sme ostošesť. Zabralo nám to presne rok.",
         shot="Dvojpodlažný dom s bielou, béžovou a sivou omietkou a žalúziami.",
         specs=[("Podlažia", "2"), ("Konštrukcia", "Difúzne otvorená drevostavba"),
                ("Trvanie", "Presne rok"), ("Rozsah", "Od základov až po finál")]),
    dict(services=[0, 3, 9], slug="2021-bungalov-presov", year="2021", month="apríl", title="Bungalov v Prešove",
         place="Prešov", tags=["Dom", "Drevostavba", "Interiér"], thumb="t2021", photo="2021-bungalov-presov",
         text="Neďaleko centra Prešova sme spáchali tento milý bungalov. Členenie interiéru domu si "
              "majiteľ premyslel do posledného detailu. Na minimalistickom pozemku, v stiesnených "
              "podmienkach. Difúzne otvorená stavba s použitím ekologických materiálov. Od základov "
              "až po finál. Vynikajúca atmosféra, dobré vzťahy.",
         shot="Biely bungalov s plochou strechou, presklením a smrekovcovou terasou.",
         specs=[("Typ", "Bungalov"), ("Pozemok", "Minimalistický, stiesnené podmienky"),
                ("Konštrukcia", "Difúzne otvorená drevostavba"), ("Rozsah", "Od základov až po finál")]),
    dict(services=[3], slug="2021-terasa", year="2021", month="máj",
         title="Dobrých ľudí sa všade veľa zmestí. Preto treba veľkú terasu!",
         short="Veľká terasa", place="pri Košiciach", tags=["Terasa"], thumb="t2021b", photo="2021-terasa",
         text="Neďaleko Košíc sme postavili obrovskú terasu, s krásnou podlahou zo sibírskeho "
              "smrekovca a strechou z Lexanu. Vraj sa tam bude stretávať veľa ľudí. A my sme im to "
              "radi umožnili. Nejaká korona či lockdown nás nezastavia :)",
         shot="Terasa s X-zábradlím a polykarbonátovým prestrešením pri chate.",
         specs=[("Podlaha", "Sibírsky smrekovec"), ("Strecha", "Lexan"), ("Zábradlie", "X-profil")]),
    dict(services=[3, 2], slug="2019-terasa-chrastne", year="2019", month="máj", title="Luxusná terasa",
         place="Chrastné pri Košiciach", tags=["Terasa", "Sklo"], thumb="t2019", photo="2019-terasa-chrastne",
         text="V Chrastnom pri Košiciach sme postavili krásne prestrešenie terasy. Bonbónikom bola "
              "strecha zo skla. Ufff. Sklenené tabule sú ťažké… :) … a nebezpečné… a krehké… Ale čo "
              "už. Máme radi výzvy :) S domácim sme nadviazali dobré vzťahy — zavolal nás postaviť "
              "aj garáž a veľký altánok s grilom. Mňam!",
         shot="Sivá pergola so sklenenou strechou pri bielom bungalove.",
         specs=[("Strecha", "Sklo"), ("Konštrukcia", "Prestrešenie terasy"),
                ("Pokračovanie", "Garáž a altánok s grilom")]),
    dict(services=[3, 2], slug="2019-garaz", year="2019", month="apríl", title="Garážo-sklado-terasa",
         place="[doplní EcoDomček]", tags=["Garáž", "Terasa"], thumb=None, photo=None,
         text="Milá kombinácia stojiska pre autá, skladu a terasy s grilom. Taká zábavka na pätkách, "
              "podlaha terasy je z termo jaseňa a keramickej dlažby.",
         shot="Fotografiu tejto realizácie zatiaľ nemáme — doplní EcoDomček.",
         specs=[("Podlaha terasy", "Termo jaseň a keramická dlažba"),
                ("Založenie", "Na pätkách"), ("Funkcie", "Stojisko, sklad, terasa s grilom")]),
    dict(services=[0, 8], slug="2015-budatin", year="2015", month="júl", title="Budatín pri Žiline",
         place="Žilina", tags=["Dom", "Drevostavba", "Cetris"], thumb="t2015", photo="2015-budatin",
         text="Tak toto je moderný drevodom, ktorý na prvý pohľad zaujme fasádou zo surového cetrisu. "
              "Cool, nie? Tak si to domáci želali. Na zateplenie boli použité ekologické materiály "
              "na báze drevných vlákien.",
         shot="Kocka s cetrisovou fasádou a pultovou strechou.",
         specs=[("Fasáda", "Surový cetris"), ("Zateplenie", "Drevovláknité izolácie"),
                ("Strecha", "Pultová")]),
    dict(services=[0, 5], slug="2008-prvotina", year="2008", month="august", title="Moja prvotina: náš domček",
         place="Lúčina", tags=["Dom", "Drevostavba"], thumb="t2008", photo="2008-prvotina",
         text="Tak týmto to všetko začalo. Drevodom, ktorý som ako „kancelárska krysa“ postavil "
              "podľa knižiek a rád od kamarátov. Len s nadšením. Má drevený obklad s imitáciou zrubu. "
              "Bývame v ňom od roku 2008 a sme totálne spokojní.",
         shot="Krémový dom s červenými lemami, sedlovou strechou a verandou.",
         specs=[("Obklad", "Drevo, imitácia zrubu"), ("Postavil", "Svojpomocne, Roman Chovanec"),
                ("Bývame v ňom", "Od roku 2008")]),
]

# ── the two captured testimonials (VERBATIM, inventory §3a) ──────────────
TESTIMONIALS = [
    dict(quote="Rozumná komunikácia a férové jednanie, mohol som sa na nich spoľahnúť.",
         author="Zákazník EcoDomčeka", note="Referencia zo súčasného webu; meno autora "
                                            "doplníme so súhlasom."),
    dict(quote="Musím povedať, že som nestíhal — nasadili také tempo, že som pri svojich pracovných "
               "povinnostiach nezvládal držať krok s tým, ako rýchlo celá stavba napredovala.",
         author="Peter F.", note="Kéked, Maďarsko"),
]

# ── the wall build-up (orientation only — the client confirms the rest) ──
WALL = [
    ("01", "Drevený obklad — rhombus profil"),
    ("02", "Vetraná medzera, latovanie"),
    ("03", "Drevovláknitá doska"),
    ("04", "Nosná konštrukcia + izolácia"),
    ("05", "Parobrzda"),
    ("06", "Inštalačná predstena"),
    ("07", "Sadrokartón, maľba"),
]

PROCESS = [
    ("01", "Konzultácia",
     "Poradíme a usmerníme — hoci aj zadarmo. Nie sme strohí obchodníci, ale nadšenci drevostavieb."),
    ("02", "Projekt a rozpočet",
     "Dispozícia, materiály, cena. Vďaka dobrým vzťahom s dodávateľmi vieme zohnať aj neštandardné veci."),
    ("03", "Montáž",
     "Montovaná drevostavba, difúzne otvorená, z ekologických materiálov. Od základov až po finál."),
    ("04", "Dokončenie",
     "Sadrokartón, obklady, maľovanie. Všetko sa dá pokaziť nevhodnou finalizáciou — a na to si dávame bacha."),
]

# ── the wall page: name + one sentence per layer. Client sentences VERBATIM
# where they exist; the rest is building physics, not a claim about EcoDomček.
WALL_TEXT = [
    ("Drevený obklad — rhombus profil",
     "Klasický tatranský profil, moderný rhombus, veľkoplošné materiály alebo thermo drevo."),
    ("Vetraná medzera, latovanie",
     "Vzduch za obkladom prúdi zdola nahor a odvádza vlhkosť skôr, než sa dostane k izolácii."),
    ("Drevovláknitá doska",
     "Prírodná izolácia na báze drevného vlákna: chráni konštrukciu zvonku a paru nechá prejsť von."),
    ("Nosná konštrukcia + izolácia",
     "Drevený rám vyplnený izoláciou. Tu vzniká to „v lete chladí, v zime je teplučký“."),
    ("Parobrzda",
     "Brzdí paru z interiéru, ale neuzatvára ju — stena ostáva difúzne otvorená."),
    ("Inštalačná predstena",
     "Priestor pre elektrinu a vodu bez zásahu do izolácie."),
    ("Sadrokartón, maľba",
     "Sadrokartón je tá najbežnejšia finálna vrstva pri suchej výstavbe."),
]
