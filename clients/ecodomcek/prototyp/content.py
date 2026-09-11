"""Content model for the EcoDomček walkthrough.

Two acts, one continuous journey:

ACT 1 — DOM.  The house is an object on the page. Scroll takes it apart:
whole building → named parts → exploded into layers → cut open. This is the
answer to "show the house first, then reveal its parts".

ACT 2 — PRECHÁDZKA.  We step inside and walk the rooms; the same stage keeps
holding one shot at a time, so the world never becomes wallpaper.

Every stage frame is content in the page grid, never a background layer.
"""

# ── ACT 1 — the house opens EXPLODED, then assembles ─────────────────────
# The page starts with the building taken apart: four layers floating, each
# numbered, the names in the legend beside the drawing. Scroll puts it back
# together (exploded → assembled axonometric → the finished house on its
# slope) and then opens it again as a cutaway.
#
# parts[]: (x, y, angle, length, number, label) — x/y are fractions of the
# frame; only the number sits on the drawing, the label goes to the legend.
ACT1 = dict(
    id="dom",
    stages=[
        dict(key="explod", file="explod.jpg", object=True,
             cap="Rozložený dom · vizualizácia"),
        dict(key="axon", file="axon.jpg", object=True,
             cap="Zložený dom · vizualizácia"),
        dict(key="whole", file="hero.jpg",
             cap="Rodinný dom Lúčina · 2024 · vizualizácia"),
        dict(key="rez", file="rez.jpg", object=True,
             cap="Rez domom · vizualizácia"),
    ],
    steps=[
        dict(
            stage="explod",
            parts=[(0.50, 0.115, 0, 0, "01", "Strecha")],
            tag="01 / 11 · Rozložený dom · Lúčina, okr. Prešov",
            h='Dom sa dá<br>rozobrať na štyri vrstvy.',
            big=True,
            p=["Takto vyzerá rodinný dom v Lúčine, keď ho rozložíte. Montovaná drevostavba je stavebnica s presnými dielmi — a presne preto ide rýchlo a presne preto sedí.",
               "Scrollujte a poskladáme ho."],
            cta=True,
        ),
        dict(
            stage="explod",
            parts=[(0.50, 0.115, 0, 0, "01", "Strecha"),
                   (0.46, 0.33, 0, 0, "02", "Poschodie · spálne a kúpeľňa"),
                   (0.42, 0.62, 0, 0, "03", "Prízemie · obývačka, kuchyňa"),
                   (0.52, 0.865, 0, 0, "04", "Základová doska")],
            tag="02 / 11 · Štyri vrstvy",
            h="Každá vrstva má svoju prácu.",
            p=["Základová doska drží dom nad terénom. Prízemie nesie poschodie, poschodie nesie strechu. Steny sa vyrábajú v hale, na stavbe sa už len skladajú.",
               "Od základov až po kolaudáciu. Tento dom nám zabral presne rok."],
        ),
        dict(
            stage="axon",
            parts=[],
            tag="03 / 11 · Zložený dom",
            h="A takto to sadne<br>dokopy.",
            p=["Tie isté diely, zložené. Nič zbytočné, nič navyše — L-tvar s drevenou hmotou na dve podlažia a tmavým prízemným krídlom.",
               "Nie sme strohí obchodníci, ale nadšenci drevostavieb. Radi poradíme a usmerníme — hoci aj zadarmo."],
        ),
        dict(
            stage="whole",
            parts=[(0.66, 0.205, 0, 0, "05", "Obklad · rhombus profil, smrekovec"),
                   (0.19, 0.63, 0, 0, "06", "Kompaktné dosky · Fundermax"),
                   (0.46, 0.585, 0, 0, "07", "Konzola nad vstupom")],
            tag="04 / 11 · Hotový dom",
            h="Postavený v našej dedine.",
            p=["Rhombus profil zo smrekovca v kombinácii s kompaktnými doskami Fundermax. Konzola nad vstupom nie je efekt — kryje vchod pred dažďom a tieni presklenie v lete.",
               "Stojí v Lúčine, takže naň vidíme z dvora."],
        ),
        dict(
            stage="rez",
            parts=[],
            tag="05 / 11 · Rez domom",
            h="A teraz dnu.",
            p=["Prízemie: obývačka s kozubom, kuchyňa, technická miestnosť. Poschodie: spálne a kúpeľňa. Členenie si majiteľ premyslel do posledného detailu.",
               "Otvorme steny ešte hlbšie — až na vrstvy."],
        ),
    ],
)

# ── ACT 2 ────────────────────────────────────────────────────────────────
ACT2 = [
    dict(id="stena", file="beat4.jpg", object=True, theme="light",
         cap="Rez difúzne otvorenou stenou · vizualizácia",
         tag="06 / 11 · Konštrukcia · vrstva po vrstve",
         h="Otvoríme vám stenu.",
         p=["My, konzervatívni Slováci, drevostavbe nedôverujeme. Rozumieme. Preto ju neschovávame — tu je vrstva po vrstve. V USA a Kanade je táto technológia osvedčená viac ako 200 rokov."],
         layers=True),
    dict(id="obyvacka", file="beat3.jpg", theme="light",
         cap="Obývačka · vizualizácia",
         tag="07 / 11 · Obývačka · kúrenie",
         h="V zime teplučký,<br>v lete chladí.",
         p=["Drevodomu často stačí jeden kozub. Ak treba viac: tepelné čerpadlo, plyn, elektrina, solár. Nízkoenergetický štandard je pri tejto konštrukcii bežný, nie príplatok.",
            "A keď sa predstavivosť rozbehne — podsvietený sprchový kút, pochôdzna sieť nad galériou, hojdačka z druhého poschodia. Áno, aj také sme robili."]),
    dict(id="kuchyna", file="beat5.jpg", theme="light",
         cap="Kuchyňa · vizualizácia",
         tag="08 / 11 · Kuchyňa · zdravé bývanie",
         h="Príjemná klíma.<br>Bez chémie.",
         p=["Difúzne otvorená stavba z prírodných materiálov. Drevo chránime bóraxovou soľou — prírodným produktom zo soľných jazier, nie postrekom.",
            "Sadrokartón, sadrovláknité dosky, veľkoplošné materiály, maľovanie. Dokončenie je tá časť, kde sa dobrá stavba dá pokaziť. Na to si dávame bacha."]),
    dict(id="terasa", file="beat6.jpg", theme="light",
         cap="Terasa a záhrada · vizualizácia",
         tag="09 / 11 · Terasa · záhrada",
         h="K domu patria<br>aj chvíle vonku.",
         p=["Terasa rozširuje obytný priestor — dá sa uzavrieť a používať aj v zime. Podlaha zo sibírskeho smrekovca alebo termo jaseňa. Altánok v srdci záhrady: a ak príde búrka, skrytí v ňom grilujete ďalej.",
            "Garáž, prístrešok pre autá, sklad, drevník. Postavili sme aj kombináciu všetkého naraz."]),
    dict(id="realizacie", file="beat7.jpg", theme="light",
         cap="Pozemok z výšky · vizualizácia",
         tag="10 / 11 · Realizácie · 2008 → 2024",
         h="Začalo to<br>vlastným domčekom.",
         p=["Osem realizácií od Žiliny po Kéked. Každá fotená z lešenia, nie z katalógu."],
         projects=True),
    dict(id="kontakt", file="beat8.jpg", theme="dusk",
         cap="Večer v Lúčine · vizualizácia",
         tag="11 / 11 · Kontakt · Lúčina · večer",
         h="Postavme váš.",
         p=["Volajte kedykoľvek ;) — alebo napíšte, čo staviame. Keď už nič iné, minimálne poradíme. Zadarmo."],
         contact=True),
]

LAYERS = [
    ("01", "Drevený obklad — rhombus profil"),
    ("02", "Vetraná medzera, latovanie"),
    ("03", "Drevovláknitá doska"),
    ("04", "Nosná konštrukcia + izolácia"),
    ("05", "Parobrzda"),
    ("06", "Inštalačná predstena"),
    ("07", "Sadrokartón, maľba"),
]

PROJECTS = [
    ("2008", "Moja prvotina: náš domček"),
    ("2015", "Budatín pri Žiline — fasáda zo surového cetrisu"),
    ("2019", "Luxusná terasa, Chrastné — strecha zo skla"),
    ("2021", "Bungalov v Prešove"),
    ("2023", "Veľká rodina — veľký dom pri Košiciach"),
    ("2024", "Rodinný dom Lúčina — tento dom"),
]
