#!/usr/bin/env python3
"""Assemble the photoreal walkthrough prototype.

The world is a scroll-scrubbed sequence of pre-rendered frames (the Arqitel /
Cula lesson from 08 §9), not a realtime blockout. Each beat is one frame; the
scroll cross-dissolves between them with a slow push so the still breathes.
Images are inlined as base64 so the page is one self-contained file.
"""
import base64, json, pathlib, sys

HERE = pathlib.Path(__file__).parent
REND = HERE.parent / "renders"

BEATS = [
    dict(id="b0", file="beat0.jpg", name="01 Exteriér", theme="light",
         tag="01 / 09 · Exteriér · Lúčina, okr. Prešov · ráno",
         h='Čo je <span class="eko">eko</span>logické,<br>je aj <span class="eko">eko</span>nomické.',
         big=True,
         p=["Drevodomy na kľúč z Lúčiny pri Prešove. Prvý sme si postavili sami v roku 2007. Tento — v našej dedine — v roku 2024. Prejdite si ho izbu po izbe."],
         cta=True),
    dict(id="b1", file="beat1.jpg", name="02 Fasáda", theme="light",
         tag="02 / 09 · Fasáda · obklady a strechy",
         h="Drevo, ktoré je vidieť.",
         p=["Rhombus profil zo smrekovca v kombinácii s kompaktnými doskami Fundermax. Klasický tatranský profil, veľkoplošné materiály alebo thermo drevo — čokoľvek, čo drží a starne pekne.",
            "Strechy: sedlová, valbová či pultová. Krytina plechová, keramická, betónová, fólia či zelená. Všetko máme, všetko spravíme."]),
    dict(id="b2", file="beat2.jpg", name="03 Prah", theme="light",
         tag="03 / 09 · Prah · o nás",
         h="Vitajte vo svete,<br>kde vonia drevo.",
         p=["Kariéra staviteľa sa začala v roku 2007, keď som si svojpomocne postavil montovaný drevodom. Dovtedy som robil v IT. Potom zavolal jeden kamarát, druhý, piaty, desiaty. Firma vznikla v roku 2017.",
            "Poradíme a prekonzultujeme — hoci aj zadarmo."]),
    dict(id="b3", file="beat3.jpg", name="04 Obývačka", theme="light",
         tag="04 / 09 · Obývačka · kúrenie",
         h="V zime teplučký,<br>v lete chladí.",
         p=["Drevodomu často stačí jeden kozub. Ak treba viac: tepelné čerpadlo, plyn, elektrina, solár. Nízkoenergetický štandard je pri tejto konštrukcii bežný, nie príplatok.",
            "A keď sa predstavivosť rozbehne — podsvietený sprchový kút, pochôdzna sieť nad galériou, hojdačka z druhého poschodia. Áno, aj také sme robili."]),
    dict(id="b4", file="beat4.jpg", name="05 Stena", theme="light",
         tag="05 / 09 · Konštrukcia · rez stenou",
         h="Otvoríme vám stenu.",
         p=["My, konzervatívni Slováci, drevostavbe nedôverujeme. Rozumieme. Preto ju neschovávame — tu je vrstva po vrstve. V USA a Kanade je táto technológia osvedčená viac ako 200 rokov."],
         layers=True),
    dict(id="b5", file="beat5.jpg", name="06 Kuchyňa", theme="light",
         tag="06 / 09 · Kuchyňa · zdravé bývanie",
         h="Príjemná klíma.<br>Bez chémie.",
         p=["Difúzne otvorená stavba z prírodných materiálov. Drevo chránime bóraxovou soľou — prírodným produktom zo soľných jazier, nie postrekom.",
            "Sadrokartón, sadrovláknité dosky, veľkoplošné materiály, maľovanie. Dokončenie je tá časť, kde sa dobrá stavba dá pokaziť. Na to si dávame bacha."]),
    dict(id="b6", file="beat6.jpg", name="07 Terasa", theme="light",
         tag="07 / 09 · Terasa · záhrada",
         h="K domu patria<br>aj chvíle vonku.",
         p=["Terasa rozširuje obytný priestor — dá sa uzavrieť a používať aj v zime. Podlaha zo sibírskeho smrekovca alebo termo jaseňa. Altánok v srdci záhrady: a ak príde búrka, skrytí v ňom grilujete ďalej.",
            "Garáž, prístrešok pre autá, sklad, drevník. Postavili sme aj kombináciu všetkého naraz."]),
    dict(id="b7", file="beat7.jpg", name="08 Zhora", theme="light",
         tag="08 / 09 · Realizácie · 2008 → 2024",
         h="Začalo to<br>vlastným domčekom.",
         p=["Osem realizácií od Žiliny po Kéked. Každá fotená z lešenia, nie z katalógu."],
         projects=True),
    dict(id="b8", file="beat8.jpg", name="09 Večer", theme="dusk",
         tag="09 / 09 · Kontakt · Lúčina · večer",
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


def b64(path):
    return base64.b64encode(path.read_bytes()).decode("ascii")


def panel(b):
    out = [f'<div class="tag"><span class="dot"></span><span class="rule"></span>{b["tag"]}</div>']
    tag = "h1" if b.get("big") else "h2"
    out.append(f'<{tag}>{b["h"]}</{tag}>')
    for para in b["p"]:
        out.append(f"<p>{para}</p>")
    if b.get("cta"):
        out.append('<div class="row"><a class="cta" href="#b1">Prejsť si dom <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>'
                   '<a class="link" href="tel:+421908704281">Zavolať 0908 704 281</a></div>')
    if b.get("layers"):
        rows = "".join(f'<div><b>{n}</b><span>{t}</span><i>[hrúbka]</i></div>' for n, t in LAYERS)
        out.append(f'<div class="layers">{rows}</div>')
        out.append('<p class="fine">Orientačná skladba — vrstvy, hrúbky a U-hodnotu potvrdí EcoDomček. Nič sa neodhaduje.</p>')
    if b.get("projects"):
        rows = "".join(f'<div><b>{y}</b><span>{t}</span></div>' for y, t in PROJECTS)
        out.append(f'<div class="proj">{rows}</div>')
    if b.get("contact"):
        out.append('<a class="phone" href="tel:+421908704281">0908 704 281</a>')
        out.append('<div class="fields">'
                   '<label>Meno<span></span></label>'
                   '<label>Telefón alebo e-mail<span></span></label>'
                   '<label class="wide">Čo staviame?<span></span></label>'
                   '</div>')
        out.append('<div class="row"><a class="cta" href="mailto:dobryden@ecodomcek.sk">Poslať dopyt <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>'
                   '<span class="fine">EcoDomček, s.r.o. · Lúčina 33 · IČO 50619616</span></div>')
    return "\n      ".join(out)


def main():
    frames, sections = [], []
    for i, b in enumerate(BEATS):
        img = REND / b["file"]
        if not img.exists():
            sys.exit(f"missing render: {img}")
        frames.append(f'<div class="frame" data-i="{i}"><img alt="" src="data:image/jpeg;base64,{b64(img)}"></div>')
        sections.append(f'<section class="beat" id="{b["id"]}" data-theme="{b["theme"]}">'
                        f'<div class="panel">\n      {panel(b)}\n    </div></section>')
    names = json.dumps([b["name"] for b in BEATS], ensure_ascii=False)
    themes = json.dumps([b["theme"] for b in BEATS])

    tpl = (HERE / "template.html").read_text()
    html = (tpl.replace("<!--FRAMES-->", "\n".join(frames))
               .replace("<!--SECTIONS-->", "\n  ".join(sections))
               .replace("/*NAMES*/", names)
               .replace("/*THEMES*/", themes))
    (HERE / "index.html").write_text(html)
    print(f"wrote index.html — {len(html)//1024} KB, {len(BEATS)} beats")


if __name__ == "__main__":
    main()
