#!/usr/bin/env python3
"""EcoDomček — page composer.

Eleven acts, each with a DIFFERENT SHAPE (refokus.md: beat variety over
effect variety). Images are framed objects inside the grid, never
backgrounds. Two type voices: grotesque for structure, serif for the human
moments. Colour lives inside the bands; the shell stays paper.
"""
import base64, pathlib, sys

HERE = pathlib.Path(__file__).parent
REND = HERE.parent / "renders"


def b64(rel):
    p = REND / rel
    if not p.exists():
        sys.exit(f"missing render: {p}")
    return "data:image/jpeg;base64," + base64.b64encode(p.read_bytes()).decode("ascii")


def lines(text, cls=""):
    """Each line in its own overflow mask — the masked reveal."""
    out = []
    for ln in text.split("|"):
        out.append(f'<span class="rl"><span>{ln}</span></span>')
    return f'<span class="{cls}">' + "".join(out) + "</span>" if cls else "".join(out)


ARROW = ('<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">'
         '<path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" '
         'stroke-linecap="round" stroke-linejoin="round"/></svg>')

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

QUOTE = "\u201eVitajte vo svete,|kde vonia drevo.\u201c"

SERVICES = ["(Drevo)domy na kľúč", "Strechy", "Altánky", "Terasy", "Sadrokartóny",
            "Drevené obklady", "Renovácie", "Maľovanie", "Zatepľovanie", "Interiéry",
            "Konzultácie", "Zoženieme, zobchodujeme"]


def sec(i, name, band, inner, extra=""):
    b = f' data-band="{band}"' if band != "paper" else ""
    cls = "band" + ("" if band == "paper" else f" {band}")
    return (f'<section class="{cls}" id="act-{i}" data-sec="{name}"{b}{extra}>{inner}</section>')


def build():
    S = []

    # ── 01 HERO — full bleed, the exploded house, type over it ──────────
    S.append(f'''<section class="band" id="hero" data-sec="Rozložený dom" data-reveal>
  <div class="stack">
    <figure class="art fade d1"><img src="{b64("explod.jpg")}" alt="Rozložený dom — strecha, poschodie, prízemie a základová doska"></figure>
    <div class="words">
      <div class="eyebrow fade">Rodinný dom Lúčina <i>/</i> 2024 <i>/</i> okr. Prešov</div>
      <h1>{lines("Dom, ktorý sa dá|rozobrať na kúsky.")}</h1>
      <p class="sub fade d2">Montovaná drevostavba je stavebnica s presnými dielmi. Presne preto ide rýchlo a presne preto sedí. Scrollujte — poskladáme ho.</p>
      <div id="scrollcue" class="fade d3">
        <svg width="13" height="22" viewBox="0 0 16 28" fill="none"><path d="M8 2v22M2 18l6 6 6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        Scrollujte
      </div>
      <div class="meta fade d4">
        <span class="mono">Drevostavby od roku 2007</span>
        <span class="mono">Lúčina · Prešov · Košice · Žilina</span>
      </div>
    </div>
  </div>
</section>''')

    # ── 02 LAYERS — split, sticky drawing, legend lights up ─────────────
    pins = [("01", 50, 11.5), ("02", 46, 33), ("03", 42, 62), ("04", 52, 86.5)]
    names = {"01": "Strecha", "02": "Poschodie · spálne a kúpeľňa",
             "03": "Prízemie · obývačka, kuchyňa", "04": "Základová doska"}
    pin_html = "".join(
        f'<div class="pin" data-p="{p}" style="left:{x}%;top:{y}%"><s></s><b>{p}</b></div>'
        for p, x, y in pins)
    rows = "".join(f'<div data-p="{p}"><b>{p}</b><span>{names[p]}</span></div>' for p, _, _ in pins)
    steps = [
        ('explod', '01', "02 / 11 · Štyri vrstvy", "Každá vrstva|má svoju prácu.",
         ["Základová doska drží dom nad terénom. Prízemie nesie poschodie, poschodie nesie strechu.",
          "Steny sa vyrábajú v hale, na stavbe sa už len skladajú."]),
        ('explod', '01,02,03,04', "02 / 11 · Štyri vrstvy", "Stavebnica|s presnými dielmi.",
         ["Od základov až po kolaudáciu. Tento dom nám zabral presne rok.",
          "Nie sme strohí obchodníci, ale nadšenci drevostavieb."]),
        ('axon', '', "03 / 11 · Zložený dom", "A takto to|sadne dokopy.",
         ["Tie isté diely, zložené. L-tvar s drevenou hmotou na dve podlažia a tmavým prízemným krídlom.",
          "Nič zbytočné, nič navyše."]),
    ]
    steps_html = ""
    for shot, live, eyebrow, head, paras in steps:
        ps = "".join(f'<p class="fade d2">{t}</p>' for t in paras)
        steps_html += (f'<div class="step" data-shot="{shot}" data-pins="{live}" data-reveal>'
                       f'<div class="eyebrow fade">{eyebrow}</div>'
                       f'<h2>{lines(head)}</h2>{ps}'
                       + (f'<div class="idxlist fade d3">{rows}</div>' if live else '') +
                       '</div>')
    S.append(sec(1, "Štyri vrstvy", "paper", f'''<div class="wrap split" data-stage>
  <div class="col-a sticky">
    <figure>
      <div class="frame obj" style="aspect-ratio:4/3">
        <img data-shot="explod" src="{b64("explod.jpg")}" alt="Rozložený dom" style="position:absolute;inset:0;opacity:1">
        <img data-shot="axon" src="{b64("axon.jpg")}" alt="Zložený dom" style="position:absolute;inset:0;opacity:0">
        <div class="pins">{pin_html}</div>
      </div>
      <figcaption class="cap"><span>Skladba domu · vizualizácia</span><span>01 — 04</span></figcaption>
    </figure>
  </div>
  <div class="steps">{steps_html}</div>
</div>'''))

    # ── 03 FINISHED HOUSE — wide moment + fact row ──────────────────────
    S.append(sec(2, "Hotový dom", "paper", f'''<div class="wrap wide" data-reveal>
  <div class="eyebrow fade">04 / 11 <i>/</i> Hotový dom <i>/</i> Lúčina</div>
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

    # ── 04 QUOTE — the serif voice, no image ────────────────────────────
    S.append(sec(3, "O nás", "sand", f'''<div class="wrap quote" data-reveal>
  <div>
    <div class="eyebrow fade">05 / 11 <i>/</i> O nás</div>
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

    # ── 05 WALL — moss band, technical: drawing + spec table ────────────
    spec = "".join(f'<tr><td>{n}</td><td>{t}</td><td>[hrúbka]</td></tr>' for n, t in LAYERS)
    S.append(sec(4, "Konštrukcia", "moss", f'''<div class="wrap split" data-reveal>
  <div class="col-a" style="position:sticky;top:0;padding:clamp(20px,4vh,40px) 0">
    <figure data-par>
      <div class="frame clipimg" style="aspect-ratio:4/3"><img src="{b64("beat4.jpg")}" alt="Rez difúzne otvorenou stenou"></div>
      <figcaption class="cap"><span>Rez stenou · vizualizácia</span><span>Zvonku dnu</span></figcaption>
    </figure>
  </div>
  <div style="padding:clamp(20px,4vh,40px) 0">
    <div class="eyebrow fade">06 / 11 <i>/</i> Konštrukcia <i>/</i> vrstva po vrstve</div>
    <h2 style="margin:18px 0 22px">{lines("Otvoríme|vám stenu.")}</h2>
    <p class="lead fade d2" style="margin-bottom:30px">My, konzervatívni Slováci, drevostavbe nedôverujeme. Rozumieme. Preto ju neschovávame — tu je vrstva po vrstve. V USA a Kanade je táto technológia osvedčená viac ako 200 rokov.</p>
    <table class="spec fade d3"><tbody>{spec}</tbody></table>
    <p class="fine fade d4" style="margin-top:18px">Orientačná skladba difúzne otvorenej steny. Vrstvy, hrúbky a U-hodnotu potvrdí EcoDomček — nič sa neodhaduje.</p>
  </div>
</div>'''))

    # ── 06 ROOMS — three frames in a row, a different rhythm ────────────
    rooms = [("beat3.jpg", "Obývačka", "Drevodomu často stačí jeden kozub. Ak treba viac: tepelné čerpadlo, plyn, solár."),
             ("beat5.jpg", "Kuchyňa", "Prírodné materiály, difúzne otvorená stavba. Drevo chránime bóraxovou soľou, nie postrekom."),
             ("beat6.jpg", "Terasa", "Rozširuje obytný priestor — dá sa uzavrieť a používať aj v zime. Sibírsky smrekovec.")]
    rh = "".join(f'''<figure><div class="frame clipimg"><img src="{b64(f)}" alt="{t}"></div>
      <h3>{t}</h3><p>{d}</p></figure>''' for f, t, d in rooms)
    S.append(sec(5, "Izby", "paper", f'''<div class="wrap" data-reveal>
  <div class="eyebrow fade">07 / 11 <i>/</i> Vnútri</div>
  <h2 style="margin:18px 0 40px">{lines("V zime teplučký,|v lete chladí.")}</h2>
  <div class="rooms fade d2">{rh}</div>
</div>'''))

    # ── 07 PROJECT INDEX — density is the credibility engine ────────────
    idx = "".join(f'''<a href="#" data-thumb="{b64('thumbs/' + th + '.jpg')}">
      <span class="yr">{y}</span><span class="nm">{n}</span>
      <span class="pl">{pl}</span><span class="tg">{tg}</span></a>''' for y, n, pl, tg, th in PROJECTS)
    S.append(sec(6, "Realizácie", "paper", f'''<div class="wrap" data-reveal>
  <div class="eyebrow fade">08 / 11 <i>/</i> Realizácie <i>/</i> 2008 — 2024</div>
  <h2 style="margin:18px 0 12px">{lines("Začalo to|vlastným domčekom.")}</h2>
  <p class="fade d2" style="margin-bottom:34px">Osem realizácií od Žiliny po Kéked. Každá fotená z lešenia, nie z katalógu.</p>
  <div class="index fade d3">{idx}</div>
</div>'''))

    # ── 08 PROCESS + SERVICES — numbered grid, then the full index ──────
    proc = "".join(f'<div><b>{n}</b><h3>{t}</h3><p>{d}</p></div>' for n, t, d in PROCESS)
    svc = "".join(f'<div><i>{i+1:02d}</i><span>{s}</span></div>' for i, s in enumerate(SERVICES))
    S.append(sec(7, "Ako to ide", "paper", f'''<div class="wrap" data-reveal>
  <div class="eyebrow fade">09 / 11 <i>/</i> Ako to ide</div>
  <h2 style="margin:18px 0 40px">{lines("Od prvého telefonátu|po kolaudáciu.")}</h2>
  <div class="proc fade d2">{proc}</div>
  <div class="eyebrow fade d3" style="margin-top:clamp(46px,7vh,88px)">Čo všetko robíme</div>
  <div class="svc fade d3">{svc}</div>
</div>'''))

    # ── 09 EVENING — full-bleed image moment before the contact ─────────
    S.append(sec(8, "Večer", "paper", f'''<div class="wrap wide" data-reveal>
  <figure data-par>
    <div class="frame clipimg" style="aspect-ratio:21/9"><img src="{b64("beat8.jpg")}" alt="Dom večer"></div>
    <figcaption class="cap"><span>Večer v Lúčine · vizualizácia</span><span>Postavené 2024</span></figcaption>
  </figure>
</div>'''))

    # ── 10 CONTACT — dusk act ───────────────────────────────────────────
    S.append(sec(9, "Kontakt", "dusk", f'''<div class="wrap contact" data-reveal>
  <div>
    <div class="eyebrow fade">11 / 11 <i>/</i> Kontakt <i>/</i> Lúčina</div>
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
