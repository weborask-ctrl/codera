#!/usr/bin/env python3
"""EcoDomček — page composer.

Nine acts, each with a DIFFERENT SHAPE (refokus.md: beat variety over
effect variety). Images are framed objects inside the grid, never
backgrounds. Two type voices: grotesque for structure, serif for the human
moments. Colour lives inside the bands; the shell stays paper.

The hero is the 5D piece: the house arrives exploded into four cut-out
layers and the scroll lands them on each other — foundation, ground floor,
upper floor, roof — while the text walks through what each layer does.
"""
import base64, json, pathlib, sys

HERE = pathlib.Path(__file__).parent
REND = HERE / "renders" if (HERE / "renders").exists() else HERE.parent / "renders"
MIME = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".png": "image/png"}


def b64(rel):
    p = REND / rel
    if not p.exists():
        sys.exit(f"missing render: {p}")
    return f"data:{MIME[p.suffix]};base64," + base64.b64encode(p.read_bytes()).decode("ascii")


def lines(text, cls=""):
    """Each line in its own overflow mask — the masked reveal."""
    out = []
    for ln in text.split("|"):
        out.append(f'<span class="rl"><span>{ln}</span></span>')
    return f'<span class="{cls}">' + "".join(out) + "</span>" if cls else "".join(out)


ARROW = ('<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">'
         '<path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" '
         'stroke-linecap="round" stroke-linejoin="round"/></svg>')

# ── the house: four cut-out layers measured from the exploded render ──────
LAY = json.loads((REND / "layers2.json").read_text())
# where each layer must travel (px of the 1119-high render) to sit on the one below
DROP = {"base": 0, "ground": 44, "upper": 44 + 26, "roof": 44 + 26 + 30}
# how much wider than the render the opening spread is (% of render height, upward)
SPREAD = {"base": 0, "ground": -1.6, "upper": -5.0, "roof": -10.5}
PINS = {"roof": ("01", 52, 38), "upper": ("02", 31, 63), "ground": ("03", 26, 58), "base": ("04", 56, 74)}
NAMES = {"01": "Strecha", "02": "Poschodie · spálne a kúpeľňa",
         "03": "Prízemie · obývačka, kuchyňa", "04": "Základová doska"}
# proof-overlay labels: the client's own material vocabulary (CONTENT_INVENTORY §5)
TAGS = {"roof": "Plochá strecha", "upper": "Rhombus profil · smrekovec",
        "ground": "Kompaktné dosky Fundermax", "base": "Základová doska"}
INK = json.loads((REND / "ink-4-150.json").read_text())


def layer(name):
    l, W, H = LAY["layers"][name], LAY["W"], LAY["H"]
    y0 = SPREAD[name] * H / l["h"]           # yPercent of the layer's own height
    y1 = DROP[name] / l["h"] * 100
    p, px, py = PINS[name]
    pin = (f'<div class="pin" data-p="{p}" style="left:{px}%;top:{py}%"><s></s><b>{p}</b>'
           f'<i>{TAGS[name]}</i></div>')
    ink = INK[name]
    paths = "".join(f'<path class="{c}" d="{d}"/>' for c, d in ink["paths"])
    svg = (f'<svg class="ink" viewBox="0 0 {ink["w"]} {ink["h"]}" aria-hidden="true">{paths}</svg>')
    return (f'<div class="lyr" data-l="{name}" data-y0="{y0:.2f}" data-y1="{y1:.2f}" '
            f'style="left:{l["x"]/W*100:.2f}%;top:{l["y"]/H*100:.2f}%;width:{l["w"]/W*100:.2f}%;'
            f'aspect-ratio:{l["w"]}/{l["h"]}">'
            f'{svg}<img class="mat" src="{b64(f"lyr-{name}.webp")}" alt="" draggable="false">{pin}</div>')


LAYERS = [("01", "Drevený obklad — rhombus profil"), ("02", "Vetraná medzera, latovanie"),
          ("03", "Drevovláknitá doska"), ("04", "Nosná konštrukcia + izolácia"),
          ("05", "Parobrzda"), ("06", "Inštalačná predstena"), ("07", "Sadrokartón, maľba")]

PROJECTS = [
    ("2024", "Rodinný dom Lúčina", "Lúčina, okr. Prešov", "Dom · Interiér", "t2024"),
    ("2023", "Veľká rodina — veľký dom", "pri Košiciach", "Dom · Interiér", "t2023"),
    ("2021", "Bungalov v Prešove", "Prešov", "Dom · Interiér", "t2021"),
    ("2021", "Veľká terasa", "pri Košiciach", "Terasa", "t2021b"),
    ("2019", "Luxusná terasa", "Chrastné", "Terasa · Sklo", "t2019"),
    ("2019", "Garážo-sklado-terasa", "—", "Garáž · Terasa", "t2019b"),
    ("2015", "Budatín pri Žiline", "Žilina", "Dom · Cetris", "t2015"),
    ("2008", "Moja prvotina: náš domček", "Lúčina", "Dom", "t2008"),
]

PROCESS = [
    ("01", "Konzultácia", "Poradíme a prekonzultujeme — hoci aj zadarmo. Keď už nič iné, minimálne poradíme."),
    ("02", "Projekt", "Prejdeme dispozíciu, materiály a rozpočet. Nič sa nekupuje, kým nesedí."),
    ("03", "Výroba a montáž", "Steny vznikajú v hale, na stavbe sa skladajú. Preto to ide rýchlo."),
    ("04", "Dokončenie", "Sadrokartón, obklady, maľovanie. Tá časť, kde sa dobrá stavba dá pokaziť."),
]

QUOTE = "„Vitajte vo svete,|kde vonia drevo.“"

SERVICES = ["(Drevo)domy na kľúč", "Strechy", "Altánky", "Terasy", "Sadrokartóny",
            "Drevené obklady", "Renovácie", "Maľovanie", "Zatepľovanie", "Interiéry",
            "Konzultácie", "Zoženieme, zobchodujeme"]

N = "09"   # acts on the running index


def sec(i, name, band, inner, extra=""):
    b = f' data-band="{band}"' if band != "paper" else ""
    cls = "band" + ("" if band == "paper" else f" {band}")
    return (f'<section class="{cls}" id="act-{i}" data-sec="{name}"{b}{extra}>{inner}</section>')


def build():
    S = []

    # ── 01 HERO — the house is drawn, then materialises layer by layer ──
    # Copy discipline from the launch-film brief: one plotted headline per
    # state, one moss word, dimension-style labels, title-block chips.
    # Every sentence is the client's own (CONTENT_INVENTORY §4, §5, §6).
    house = "".join(layer(n) for n in ("base", "ground", "upper", "roof"))
    steps = [
        ("",            "", "Vitajte vo svete,|kde <em>vonia</em> drevo.", "", True),
        ("04,03", "04 → 03 <i>/</i> Základová doska · prízemie", "Difúzne <em>otvorená</em>|stavba.", "s použitím ekologických materiálov", False),
        ("02",    "02 <i>/</i> Poschodie", "V lete chladí,|v zime <em>teplučký</em>.", "", False),
        ("01",    "01 <i>/</i> Strecha", "Nadšenci|<em>drevo</em>stavieb.", "Nie sme strohí obchodníci.", False),
        ("01,02,03,04", f"01 / {N} <i>/</i> Zložený dom <i>/</i> Lúčina", "Čo je <em>eko</em>logické,|je aj ekonomické.", "Od základov až po kolaudáciu.", False),
    ]
    steps_html = ""
    for k, (live, kota, head, line, intro) in enumerate(steps):
        tag = "h1" if intro else "h2"
        inner = (f'<div class="kota fade">{kota}</div>' if kota else "")
        inner += f'<{tag}>{lines(head)}</{tag}>'
        if line:
            inner += f'<p class="line fade d2">{line}</p>'
        if intro:
            inner += (f'<div class="chips fade d2"><span>Rodinný dom Lúčina · 2024 · okr. Prešov</span>'
                      f'<span>Drevostavby od roku 2007</span><span>Vizualizácia</span></div>'
                      f'<div id="scrollcue" class="fade d3"><svg width="13" height="22" viewBox="0 0 16 28" fill="none">'
                      f'<path d="M8 2v22M2 18l6 6 6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>Scrollujte — postavíme ho</div>')
        if k == 4:
            inner += (f'<div class="ctas fade d3"><a class="btn" href="tel:+421908704281">Zavolajte 0908 704 281 {ARROW}</a>'
                      f'<a class="btn ghost" href="#act-5">Realizácie</a></div>')
        steps_html += f'<div class="step{" intro" if intro else ""}" data-k="{k}" data-pins="{live}">{inner}</div>'
    S.append(f'''<section class="band" id="hero" data-sec="Dom z výkresu" data-reveal>
  <div class="track" data-house>
    <div class="stage">
      <div class="house" id="house">{house}</div>
      <div class="copy">{steps_html}</div>
      <div class="rail mono"><i data-p="04">Doska</i><i data-p="03">Prízemie</i><i data-p="02">Poschodie</i><i data-p="01">Strecha</i></div>
      <div class="stamp mono">Rodinný dom Lúčina <i>/</i> vizualizácia <i>/</i> rev. 01</div>
    </div>
  </div>
</section>''')

    # ── 02 FINISHED HOUSE — wide moment + fact row ──────────────────────
    S.append(sec(1, "Hotový dom", "paper", f'''<div class="wrap wide" data-reveal>
  <div class="eyebrow fade">02 / {N} <i>/</i> Hotový dom <i>/</i> Lúčina</div>
  <h2 style="margin:18px 0 34px">{lines("Stojí v našej dedine.|Vidíme naň z dvora.")}</h2>
  <figure data-par>
    <div class="frame clipimg" style="aspect-ratio:21/9"><img src="{b64("hero.jpg")}" alt="Rodinný dom Lúčina"></div>
    <figcaption class="cap"><span>Rodinný dom Lúčina · 2024 · vizualizácia</span>
      <span>Rhombus smrekovec · Fundermax</span></figcaption>
  </figure>
  <div class="facts fade d2">
    <div><b>2024</b><span>Rok dokončenia</span></div>
    <div><b>1 rok</b><span>Od základov po kolaudáciu</span></div>
    <div><b>2</b><span>Podlažia + prízemné krídlo</span></div>
  </div>
</div>'''))

    # ── 03 QUOTE — the serif voice, no image ────────────────────────────
    S.append(sec(2, "O nás", "sand", f'''<div class="wrap quote" data-reveal>
  <div>
    <div class="eyebrow fade">03 / {N} <i>/</i> O nás</div>
    <blockquote style="margin-top:26px">{lines(QUOTE)}</blockquote>
    <div class="who fade d2">
      <span class="mono">Roman Chovanec</span><span class="fine">konateľ · stavia od roku 2007</span>
    </div>
  </div>
  <div class="fade d3">
    <p class="sig">Kariéra staviteľa sa začala v roku 2007, keď som si svojpomocne postavil montovaný drevodom. Dovtedy som robil v IT. Potom zavolal jeden kamarát, druhý, piaty, desiaty.</p>
    <p class="sig" style="margin-top:20px">Firma vznikla v roku 2017. Naším mottom je: <span class="eko">čo je ekologické, je aj ekonomické.</span></p>
  </div>
</div>'''))

    # ── 04 WALL — moss band, technical: drawing + spec table ────────────
    spec = "".join(f'<tr><td>{n}</td><td>{t}</td><td>[hrúbka]</td></tr>' for n, t in LAYERS)
    S.append(sec(3, "Konštrukcia", "moss", f'''<div class="wrap split" data-reveal>
  <div class="col-a" style="position:sticky;top:0;padding:clamp(20px,4vh,40px) 0">
    <figure data-par>
      <div class="frame clipimg" style="aspect-ratio:4/3"><img src="{b64("beat4.jpg")}" alt="Rez difúzne otvorenou stenou"></div>
      <figcaption class="cap"><span>Rez stenou · vizualizácia</span><span>Zvonku dnu</span></figcaption>
    </figure>
  </div>
  <div style="padding:clamp(20px,4vh,40px) 0">
    <div class="eyebrow fade">04 / {N} <i>/</i> Konštrukcia <i>/</i> vrstva po vrstve</div>
    <h2 style="margin:18px 0 22px">{lines("Otvoríme|vám stenu.")}</h2>
    <p class="lead fade d2" style="margin-bottom:30px">My, konzervatívni Slováci, drevostavbe nedôverujeme. Rozumieme. Preto ju neschovávame — tu je vrstva po vrstve. V USA a Kanade je táto technológia osvedčená viac ako 200 rokov.</p>
    <table class="spec fade d3"><tbody>{spec}</tbody></table>
    <p class="fine fade d4" style="margin-top:18px">Orientačná skladba difúzne otvorenej steny. Vrstvy, hrúbky a U-hodnotu potvrdí EcoDomček — nič sa neodhaduje.</p>
  </div>
</div>'''))

    # ── 05 ROOMS — three frames in a row, a different rhythm ────────────
    rooms = [("beat3.jpg", "Obývačka", "Drevodomu často stačí jeden kozub. Ak treba viac: tepelné čerpadlo, plyn, solár."),
             ("beat5.jpg", "Kuchyňa", "Prírodné materiály, difúzne otvorená stavba. Drevo chránime bóraxovou soľou, nie postrekom."),
             ("beat6.jpg", "Terasa", "Rozširuje obytný priestor — dá sa uzavrieť a používať aj v zime. Sibírsky smrekovec.")]
    rh = "".join(f'''<figure><div class="frame clipimg"><img src="{b64(f)}" alt="{t}"></div>
      <h3>{t}</h3><p>{d}</p></figure>''' for f, t, d in rooms)
    S.append(sec(4, "Izby", "paper", f'''<div class="wrap" data-reveal>
  <div class="eyebrow fade">05 / {N} <i>/</i> Vnútri</div>
  <h2 style="margin:18px 0 40px">{lines("V zime teplučký,|v lete chladí.")}</h2>
  <div class="rooms fade d2">{rh}</div>
</div>'''))

    # ── 06 PROJECT INDEX — density is the credibility engine ────────────
    idx = "".join(f'''<a href="#" data-thumb="{b64('thumbs/' + th + '.jpg')}">
      <span class="yr">{y}</span><span class="nm">{n}</span>
      <span class="pl">{pl}</span><span class="tg">{tg}</span></a>''' for y, n, pl, tg, th in PROJECTS)
    S.append(sec(5, "Realizácie", "paper", f'''<div class="wrap" data-reveal>
  <div class="eyebrow fade">06 / {N} <i>/</i> Realizácie <i>/</i> 2008 — 2024</div>
  <h2 style="margin:18px 0 12px">{lines("Začalo to|vlastným domčekom.")}</h2>
  <p class="fade d2" style="margin-bottom:34px">Osem realizácií od Žiliny po Kéked. Každá fotená z lešenia, nie z katalógu.</p>
  <div class="index fade d3">{idx}</div>
</div>'''))

    # ── 07 PROCESS + SERVICES — numbered grid, then the full index ──────
    proc = "".join(f'<div><b>{n}</b><h3>{t}</h3><p>{d}</p></div>' for n, t, d in PROCESS)
    svc = "".join(f'<div><i>{i+1:02d}</i><span>{s}</span></div>' for i, s in enumerate(SERVICES))
    S.append(sec(6, "Ako to ide", "paper", f'''<div class="wrap" data-reveal>
  <div class="eyebrow fade">07 / {N} <i>/</i> Ako to ide</div>
  <h2 style="margin:18px 0 40px">{lines("Od prvého telefonátu|po kolaudáciu.")}</h2>
  <div class="proc fade d2">{proc}</div>
  <div class="eyebrow fade d3" style="margin-top:clamp(46px,7vh,88px)">Čo všetko robíme</div>
  <div class="svc fade d3">{svc}</div>
</div>'''))

    # ── 08 EVENING — full-bleed image moment before the contact ─────────
    S.append(sec(7, "Večer", "paper", f'''<div class="wrap wide" data-reveal>
  <figure data-par>
    <div class="frame clipimg" style="aspect-ratio:21/9"><img src="{b64("beat8.jpg")}" alt="Dom večer"></div>
    <figcaption class="cap"><span>Večer v Lúčine · vizualizácia</span><span>Postavené 2024</span></figcaption>
  </figure>
</div>'''))

    # ── 09 CONTACT — dusk act ───────────────────────────────────────────
    S.append(sec(8, "Kontakt", "dusk", f'''<div class="wrap contact" data-reveal>
  <div>
    <div class="eyebrow fade">09 / {N} <i>/</i> Kontakt <i>/</i> Lúčina</div>
    <h2 style="margin:18px 0 26px">{lines("Postavme váš.")}</h2>
    <p class="lead fade d2">Volajte kedykoľvek ;) — alebo napíšte, čo staviame. Keď už nič iné, minimálne poradíme. Zadarmo.</p>
    <a class="tel-big fade d3" href="tel:+421908704281" style="margin-top:30px">0908 704 281</a>
    <div class="fade d4" style="margin-top:14px"><a class="mono" href="mailto:dobryden@ecodomcek.sk">dobryden@ecodomcek.sk</a></div>
  </div>
  <form class="fade d2" onsubmit="return false">
    <div class="form">
      <label>Meno<input type="text" name="meno" autocomplete="name"></label>
      <label>Telefón alebo e-mail<input type="text" name="kontakt" autocomplete="tel"></label>
      <label class="wide">Čo staviame?<textarea rows="3" name="sprava" placeholder="Dom, strecha, terasa, altánok… alebo len otázka."></textarea></label>
    </div>
    <button class="btn" style="margin-top:30px" type="submit">Poslať dopyt {ARROW}</button>
  </form>
</div>'''))

    # ── footer ──────────────────────────────────────────────────────────
    footer = f'''<footer data-sec="Pätička" data-band="dusk"><div class="wrap">
  <div class="fgrid">
    <div class="big">Postavíme vám domček — útulné miesto rodinnej pohody. Domov si už z neho spravíte sami.</div>
    <div class="fcol"><h4>EcoDomček, s.r.o.</h4>
      <div>Lúčina 33</div><div>082 07 Lúčina</div><div>okr. Prešov</div>
      <div style="margin-top:12px"><a href="tel:+421908704281">0908 704 281</a></div>
      <div><a href="mailto:dobryden@ecodomcek.sk">dobryden@ecodomcek.sk</a></div>
    </div>
    <div class="fcol"><h4>Údaje</h4>
      <div>IČO 50619616</div><div>IČ DPH SK2120403648</div>
      <div>OR OS Prešov, Sro 33794/P</div>
      <div style="margin-top:12px">Konateľ: Mgr. Roman Chovanec</div>
    </div>
  </div>
  <div class="fbot">
    <span>© 2026 EcoDomček, s.r.o.</span>
    <span>Vizualizácie · finálne rendery vzniknú z výkresov realizácie</span>
  </div>
</div></footer>'''

    tpl = (HERE / "index.tpl.html").read_text()
    out = (tpl.replace("/*CSS*/", (HERE / "site.css").read_text())
              .replace("/*JS*/", (HERE / "site.js").read_text())
              .replace("<!--BODY-->", "\n".join(S) + "\n" + footer))
    (HERE / "index.html").write_text(out)
    print(f"wrote index.html — {len(out)//1024} KB, {len(S)} acts")


if __name__ == "__main__":
    build()
