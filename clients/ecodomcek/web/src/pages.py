# -*- coding: utf-8 -*-
"""EcoDomček — the page builders.

Seven page types, each with a DIFFERENT SHAPE, one shared component set.
``build(B)`` receives the builder module's globals (esc, lines, figure,
section, page, …) so the helpers stay in one place.
"""
import json
import pathlib

import content as C

HERE = pathlib.Path(__file__).parent
REND = HERE.parent / "renders"

# ── the house: four cut-out layers measured from the exploded render ─────
LAY = json.loads((REND / "layers2.json").read_text())
INK = json.loads((REND / "ink-4-150.json").read_text())
DROP = {"base": 0, "ground": 44, "upper": 44 + 26, "roof": 44 + 26 + 30}
SPREAD = {"base": 0, "ground": -1.6, "upper": -5.0, "roof": -10.5}
PINS = {"roof": ("01", 52, 38), "upper": ("02", 31, 63),
        "ground": ("03", 26, 58), "base": ("04", 56, 74)}
TAGS = {"roof": "Plochá strecha", "upper": "Rhombus profil · smrekovec",
        "ground": "Kompaktné dosky Fundermax", "base": "Základová doska"}
RAIL = [("04", "Doska"), ("03", "Prízemie"), ("02", "Poschodie"), ("01", "Strecha")]


def layer(name):
    l, W, H = LAY["layers"][name], LAY["W"], LAY["H"]
    y0 = SPREAD[name] * H / l["h"]
    y1 = DROP[name] / l["h"] * 100
    p, px, py = PINS[name]
    pin = (f'<div class="pin" data-p="{p}" style="left:{px}%;top:{py}%"><s></s><b>{p}</b>'
           f"<i>{TAGS[name]}</i></div>")
    ink = INK[name]
    paths = "".join(f'<path class="{c}" d="{d}"/>' for c, d in ink["paths"])
    return (f'<div class="lyr" data-l="{name}" data-y0="{y0:.2f}" data-y1="{y1:.2f}" '
            f'style="left:{l["x"] / W * 100:.2f}%;top:{l["y"] / H * 100:.2f}%;'
            f'width:{l["w"] / W * 100:.2f}%;aspect-ratio:{l["w"]}/{l["h"]}">'
            f'<svg class="ink" viewBox="0 0 {ink["w"]} {ink["h"]}" aria-hidden="true">{paths}</svg>'
            f'<img class="mat" src="assets/lyr-{name}.webp" alt="" draggable="false">{pin}</div>')


def title_of(p):
    return p.get("short", p["title"])


def photo_src(p):
    return f'assets/foto-{p["photo"]}.jpg' if p.get("photo") else None


def plate_img(p, esc, eager=False, size=None):
    """The photo, or an honest empty plate when we have none."""
    src = photo_src(p)
    wh = f' width="{size}" height="{size}"' if size else ""
    if src:
        return (f'<img src="{src}" alt="{esc(p["shot"])}" loading="{"eager" if eager else "lazy"}" '
                f'decoding="async"{wh}>')
    return '<span class="noimg mono">Fotografiu doplní EcoDomček</span>'


def build(B):
    esc, lines, figure, section, page = (B["esc"], B["lines"], B["figure"],
                                         B["section"], B["page"])
    btn, ARROW, cap = B["btn"], B["ARROW"], B["cap"]

    # ── shared components ────────────────────────────────────────────────
    def project_index(limit=None, heading=True):
        """Density is the credibility engine: every job, with year and place."""
        rows = ""
        for p in C.PROJECTS[:limit]:
            tags = " · ".join(p["tags"])
            th = f' data-thumb="{photo_src(p)}"' if photo_src(p) else ""
            rows += (f'<a href="realizacia-{p["slug"]}.html"{th}>'
                     f'<span class="yr">{p["year"]}</span>'
                     f'<span class="nm">{esc(title_of(p))}</span>'
                     f'<span class="pl">{esc(p["place"])}</span>'
                     f'<span class="tg">{esc(tags)}</span></a>')
        return f'<div class="index fade d2">{rows}</div>'

    def testimonials(full=False, pick=None, giant=False):
        """Two real quotes, honestly labelled. Rarity is played by naming
        the count, never by a carousel that advertises the shortage."""
        items = C.TESTIMONIALS if pick is None else [C.TESTIMONIALS[pick]]
        rows = ""
        for t in items:
            rows += (f'<figure class="ref"><blockquote>„{esc(t["quote"])}“</blockquote>'
                     f'<figcaption><b>{esc(t["author"])}</b>'
                     f'<span>{esc(t["note"])}</span><span>Zdroj: ecodomcek.sk</span>'
                     f'</figcaption></figure>')
        cls = " full" if full else (" giant" if giant else "")
        return f'<div class="refs{cls} fade d2">{rows}</div>'

    def process():
        return '<div class="proc fade d2">' + "".join(
            f"<div><b>{n}</b><h3>{esc(t)}</h3><p>{esc(d)}</p></div>"
            for n, t, d in C.PROCESS) + "</div>"

    def contact_band(num):
        return section(9, "Kontakt", "dusk", f'''<div class="wrap contact" data-reveal>
  <div>
    <h2 style="margin:0 0 26px">{lines("Poďme si o tom|<em>pokecať</em>.")}</h2>
    <p class="lead fade d2">Zavolajte alebo napíšte, čo staviate. Prejdeme si pozemok, predstavu
      a rozpočet — a poradíme, aj keď z toho nakoniec nič nebude. Zadarmo.</p>
    <a class="tel-big fade d3" href="tel:{C.PHONE_RAW}" style="margin-top:30px">{C.PHONE}</a>
    <div class="fade d4" style="margin-top:14px">
      <a class="mono" href="mailto:{C.EMAIL}">{C.EMAIL}</a></div>
  </div>
  <div class="fade d2">{form()}</div>
</div>''', sid="kontakt")

    def form():
        return f'''<form onsubmit="return false" novalidate>
  <div class="form">
    <label>Meno<input type="text" name="meno" autocomplete="name"></label>
    <label>Telefón alebo e-mail<input type="text" name="kontakt" autocomplete="tel"></label>
    <label class="wide">Čo staviame?<textarea rows="3" name="sprava"
      placeholder="Dom, strecha, terasa, altánok… alebo len otázka."></textarea></label>
  </div>
  <button class="btn" style="margin-top:30px" type="submit">Poslať dopyt {ARROW}</button>
  <p class="fine" style="margin-top:16px">Formulár je v návrhu nefunkčný — na ostrej stránke
    pošle dopyt na {C.EMAIL}.</p>
</form>'''

    def masthead(kota, head, lead, meta=None, band="paper", name="Úvod"):
        m = ""
        if meta:
            m = '<div class="mmeta fade d2">' + "".join(
                f"<div><span>{esc(k)}</span><b>{esc(v)}</b></div>" for k, v in meta) + "</div>"
        return section(0, name, band, f'''<div class="wrap masthead" data-reveal>
  <h1>{lines(head)}</h1>
  {f'<p class="lead fade d2">{lead}</p>' if lead else ''}
  {m}
</div>''')

    # ═══════════════════════════════════════════════════════════════════
    # 1 — ÚVOD — type as the hero, the house in front of it
    # (pangram.md: the word owns the frame; kpr.md/noomo.md: the object
    # sits between the headline lines). On load the drawing plots itself
    # and the house builds — no scroll needed. Scroll only lifts the
    # layers apart again as the poster leaves.
    # ═══════════════════════════════════════════════════════════════════
    house = "".join(layer(n) for n in ("base", "ground", "upper", "roof"))
    hero = f'''<section class="band" id="hero" data-sec="Dom">
  <div class="poster">
    <h1 class="l1"><span class="rl"><span>Vitajte vo svete,</span></span></h1>
    <div class="house" data-house>{house}</div>
    <h1 class="l2"><span class="rl"><span>kde <em>vonia</em> drevo.</span></span></h1>
    <p class="sub fade">Montované drevodomy z Lúčiny pri Prešove. Od základov až po kolaudáciu.</p>
    <div class="ctas fade d2">{btn("Pozrieť realizácie", "realizacie.html")}{btn("Otvoriť stenu", "stena.html", ghost=True, arrow=False)}</div>
    <span class="vz mono">vizualizácia · Rodinný dom Lúčina 2024</span>
  </div>
</section>'''

    # services as one big typographic list — the words are the design
    svc_words = "".join(
        f'<a href="sluzby.html#s{i}" style="--i:{i}"><span>{esc(n)}</span><i>{esc(u)}</i></a>'
        for i, (u, n, _) in enumerate(C.SERVICES))

    home = hero + section(1, "Čo staviame", "paper", f'''<div class="wrap" data-reveal>
  <h2 class="big fade">{lines("Dom, strechu, terasu.|A všetko medzi tým.")}</h2>
  <div class="svcwords">{svc_words}</div>
</div>''') + section(2, "Stena", "moss", f'''<div class="wrap wallteaser" data-reveal>
  <div class="wt-text">
    <h2 class="fade">{lines("Otvoríme|vám <em>stenu</em>.")}</h2>
    <p class="lead fade d2">„My, konzervatívni Slováci, jej veľmi nedôverujeme.“ Preto drevostavbu
      neschovávame. Potiahnite stenu a pozrite sa, čo je v nej — sedem vrstiev, každá s menom.</p>
    <div class="fade d3">{btn("Roztiahnuť stenu", "stena.html")}</div>
  </div>
  <a class="wt-art" href="stena.html" aria-label="Otvoriť stenu">
    <img src="assets/beat4.jpg" alt="Rez stenou — vizualizácia" loading="lazy">
    <span class="vz mono">vizualizácia</span>
  </a>
</div>''') + section(3, "Realizácie", "paper", f'''<div class="wrap" data-reveal>
  <a class="feature" href="realizacia-2024-lucina.html">
    <figure data-par>
      <div class="frame clipimg" style="aspect-ratio:21/9">
        <img src="assets/hero.jpg" alt="Rodinný dom Lúčina — vizualizácia" loading="lazy"></div>
    </figure>
    <div class="fmeta">
      <h2 class="fade">Moderný dizajnový dom, Lúčina 2024 {ARROW}</h2>
      <p class="fade d2">Drevená fasáda v rhombus profile s kompaktnými doskami Fundermax.
        Stojí v našej dedine — vidíme naň z dvora. <span class="vz">vizualizácia</span></p>
    </div>
  </a>
  <h2 class="big fade" style="margin-top:clamp(50px,8vh,110px)">{lines("Začalo to|vlastným domčekom.")}</h2>
  {project_index()}
  <div class="more fade d3">{btn("Všetkých osem realizácií", "realizacie.html")}</div>
</div>''') + section(4, "Vyjadrenie", "sand", f'''<div class="wrap" data-reveal>
  {testimonials(pick=1, giant=True)}
</div>''') + section(5, "Ako to ide", "paper", f'''<div class="wrap" data-reveal>
  <h2 class="big fade">{lines("Od prvého telefonátu|po kolaudáciu.")}</h2>
  {process()}
</div>''') + contact_band("")

    page("index.html", "EcoDomček — drevostavby z Lúčiny",
         "Montované drevodomy, strechy, terasy a interiéry z Lúčiny pri Prešove. "
         "Difúzne otvorené stavby z ekologických materiálov, od základov po kolaudáciu.",
         home, "index", first="Dom")

    # ═══════════════════════════════════════════════════════════════════
    # 2 — REALIZÁCIE (index)
    # ═══════════════════════════════════════════════════════════════════
    cards = ""
    for i, p in enumerate(C.PROJECTS):
        cards += (f'<a class="card" href="realizacia-{p["slug"]}.html" data-reveal '
                  f'data-tags="{esc("|".join(p["tags"]))}">'
                  f'<div class="frame clipimg">{plate_img(p, esc)}</div>'
                  f'<div class="cmeta"><span class="yr">{p["year"]}</span>'
                  f'<span class="tg">{esc(" · ".join(p["tags"]))}</span></div>'
                  f"<h3>{esc(title_of(p))}</h3>"
                  f'<p class="pl">{esc(p["place"])}</p></a>')

    real = masthead("Realizácie <i>/</i> 2008 — 2024",
                    "Osem stavieb.|Jedna <em>technológia</em>.",
                    "Od svojpomocného domčeka v Lúčine po dvojpodlažný dom pri Košiciach. "
                    "Každá stavba je difúzne otvorená a z ekologických materiálov — "
                    "to sa nemení, aj keď fasáda áno.", name="Realizácie")
    from collections import Counter
    cnt = Counter(t for p in C.PROJECTS for t in p["tags"])
    chips_f = f'<button class="on" data-f="">Všetko <sup>{len(C.PROJECTS)}</sup></button>' + "".join(
        f'<button data-f="{esc(t)}">{esc(t)} <sup>{n}</sup></button>' for t, n in cnt.most_common())
    real += section(1, "Realizácie", "paper", f'''<div class="wrap">
  <div class="filters mono" data-reveal>{chips_f}</div>
  <a class="feature" href="realizacia-2024-lucina.html" data-reveal>
    <figure data-par>
      <div class="frame clipimg" style="aspect-ratio:21/9">
        <img src="assets/hero.jpg" alt="Rodinný dom Lúčina — vizualizácia" loading="eager"></div>
    </figure>
    <div class="fmeta">
      <div>
        <h2 class="fade">Moderný dizajnový dom {ARROW}</h2>
      </div>
      <div>
        <p class="fade d2">Drevená fasáda (Rhombus profil) v kombinácii s kompaktnými doskami
          Fundermax. Stojí v našej dedine — vidíme naň z dvora.</p>
        <p class="fine fade d3" style="margin-top:12px">Vizualizácia navrhnutá podľa realizácie —
          nie je to fotografia.</p>
      </div>
    </div>
  </a>
  <div class="cards">{cards}</div>
  <p class="fine" style="margin-top:clamp(30px,5vh,60px)">Fotografie sú zo skutočných realizácií
    EcoDomčeka, v rozlíšení, v akom ich máme. Garážo-sklado-terasu (2019) zatiaľ bez fotografie —
    ostré zábery doplníme, keď ich od klienta dostaneme.</p>
</div>''')
    real += contact_band("Kontakt")
    page("realizacie.html", "Realizácie — EcoDomček",
         "Osem realizácií EcoDomčeka z rokov 2008 – 2024: drevodomy, terasy, garáž a altánky "
         "v okolí Prešova, Košíc a Žiliny.", real, "realizacie", first="Realizácie")

    # ═══════════════════════════════════════════════════════════════════
    # 3 — REALIZÁCIA (detail × 8)
    # ═══════════════════════════════════════════════════════════════════
    for i, p in enumerate(C.PROJECTS):
        nxt = C.PROJECTS[(i + 1) % len(C.PROJECTS)]
        prv = C.PROJECTS[(i - 1) % len(C.PROJECTS)]
        # the drawing convention: the photo is a plate, the facts float
        # around it on leader lines. No photo is ever shown above 420 px —
        # that is the archive we have, and blowing it up would show it.
        marks = [("Rok", f'{p["month"]} {p["year"]}'), ("Miesto", p["place"]),
                 ("Kategórie", " · ".join(p["tags"])), ("Fotografia", "Archív EcoDomček")]
        marks_html = "".join(
            f'<div class="mark fade d{min(4, j + 1)}"><span>{esc(k)}</span><b>{esc(v)}</b></div>'
            for j, (k, v) in enumerate(marks))
        chips = "".join(f"<span>{esc(v)}</span>" for _, v in p["specs"])
        rel = "".join(
            f'<a href="sluzby.html#s{j}"><i>{j + 1:02d}</i><span>{esc(n)}</span>{ARROW}</a>'
            for j, (_, n, _) in enumerate(C.SERVICES) if j in p["services"])

        body = (f'<section class="band crumbband" data-sec="{esc(title_of(p))}">'
                f'<div class="wrap"><a class="crumb mono" href="realizacie.html">'
                f'← Realizácie</a></div></section>')
        body += masthead(
            f'{p["year"]} <i>/</i> {esc(" · ".join(p["tags"]))}',
            esc(p["title"]).replace(". ", ".|"),
            f'{esc(p["place"])} <i>·</i> {esc(p["month"])} {p["year"]}',
            name=title_of(p))
        body += section(1, "Fotografia", "paper", f'''<div class="wrap plateset" data-reveal>
  <figure class="plate">
    <div class="frame clipimg">{plate_img(p, esc, eager=True)}</div>
    {cap(p["shot"], "Fotografia realizácie" if photo_src(p) else "Bez fotografie")}
  </figure>
  <div class="marks">{marks_html}</div>
</div>''')
        body += section(2, "Klientov text", "paper", f'''<div class="wrap words" data-reveal>
  <blockquote class="sig fade">„{esc(p["text"])}“</blockquote>
  <div class="who fade d2"><span class="mono">{esc(C.DIRECTOR)}</span>
    <span class="fine">EcoDomček</span></div>
  <div class="chiprow fade d3"><span class="lbl mono">Z čoho je</span>{chips}</div>
</div>''')
        if rel:
            body += section(3, "Súvisiace služby", "paper", f'''<div class="wrap" data-reveal>
  <div class="rel fade d2">{rel}</div>
</div>''')
        if p.get("hero"):
            body += section(4, "Vizualizácia", "paper", f'''<div class="wrap wide" data-reveal>
  <h2 style="margin:18px 0 22px">{lines("Tento dom sme|<em>nakreslili</em> znovu.")}</h2>
  <p class="lead fade d2" style="margin-bottom:34px">Pre návrh stránky sme dom z Lúčiny
    vymodelovali a vyrenderovali — aby sme na ňom mohli ukázať, ako je drevostavba poskladaná.
    Nie sú to fotografie realizácie.</p>
  <figure data-par>
    <div class="frame clipimg" style="aspect-ratio:21/9">
      <img src="assets/hero.jpg" alt="Vizualizácia domu" loading="lazy"></div>
    {cap("Rodinný dom Lúčina · vizualizácia", "Rhombus smrekovec · Fundermax")}
  </figure>
  <div class="trio fade d2">
    {figure("beat3.jpg", "Obývačka — vizualizácia", "4/3", ("Obývačka · vizualizácia",))}
    {figure("beat5.jpg", "Kuchyňa — vizualizácia", "4/3", ("Kuchyňa · vizualizácia",))}
    {figure("beat6.jpg", "Terasa — vizualizácia", "4/3", ("Terasa · vizualizácia",))}
  </div>
  <div class="more fade d3">{btn("Ako je taký dom postavený", "technologia.html")}</div>
</div>''')
        body += section(5, "Ďalšia stavba", "paper", f'''<div class="wrap pager" data-reveal>
  <a class="np prev" href="realizacia-{prv["slug"]}.html">
    <span class="pth">{plate_img(prv, esc, size=72) if photo_src(prv) else ""}</span>
    <span><i class="mono">Predchádzajúca</i><b>{esc(title_of(prv))}</b></span></a>
  <a class="allp mono" href="realizacie.html">Všetkých osem</a>
  <a class="np next" href="realizacia-{nxt["slug"]}.html">
    <span><i class="mono">Ďalšia stavba</i><b>{esc(title_of(nxt))}</b></span>
    <span class="pth">{plate_img(nxt, esc, size=72) if photo_src(nxt) else ""}</span></a>
</div>''')
        body += contact_band("Kontakt")
        page(f"realizacia-{p['slug']}.html", f"{title_of(p)} ({p['year']}) — EcoDomček",
             f"{p['text'][:150]}…", body, "realizacia", first=title_of(p))

    # ═══════════════════════════════════════════════════════════════════
    # 4 — SLUŽBY
    # ═══════════════════════════════════════════════════════════════════
    rows = ""
    for i, (u, n, t) in enumerate(C.SERVICES):
        if i == 10:
            rows += (f'<aside class="sandbreak" data-reveal><p class="sig fade">Nie sme strohí '
                     f'obchodníci, ale najmä nadšenci drevostavieb. Radi poradíme a usmerníme — '
                     f'hoci aj zadarmo.</p><div class="fade d2">'
                     f'{btn("Zavolajte " + C.PHONE, "tel:" + C.PHONE_RAW, arrow=False)}</div></aside>')
        rows += (f'<article class="srow" id="s{i}" data-reveal style="--i:{i}">'
                 f'<div class="snum mono">{i + 1:02d}</div>'
                 f'<div class="sbody">'
                 f"<h2>{esc(n)}</h2><p class=\"fade d2\">{esc(t)}</p></div></article>")
    jump = "".join(f'<a href="#s{i}">{esc(n)}</a>' for i, (_, n, _) in enumerate(C.SERVICES))

    svc = masthead("Služby <i>/</i> dvanásť vecí, ktoré robíme",
                   "Dom na kľúč —|alebo len jeho <em>kus</em>.",
                   "Stavali sme celé domy aj samostatné terasy, strechy a interiéry. "
                   "Napíšte, čo potrebujete; ak to nerobíme, povieme rovno.", name="Služby")
    svc += section(1, "Služby", "paper", f'''<div class="wrap split srv">
  <nav class="jump" aria-label="Zoznam služieb">{jump}</nav>
  <div class="srows">{rows}</div>
</div>''')
    svc += contact_band("Kontakt")
    page("sluzby.html", "Služby — EcoDomček",
         "Drevodomy na kľúč, strechy, altánky, terasy, sadrokartóny, obklady, renovácie, "
         "maľovanie, zatepľovanie, interiéry a konzultácie.", svc, "sluzby", first="Služby")

    # ═══════════════════════════════════════════════════════════════════
    # 5 — TECHNOLÓGIA
    # ═══════════════════════════════════════════════════════════════════
    spec = "".join(f"<tr><td>{n}</td><td>{esc(t)}</td><td>—</td></tr>" for n, t in C.WALL)
    tech = masthead("Technológia <i>/</i> difúzne otvorená stavba",
                    "Drevostavbe sa|nedá <em>veriť</em>?",
                    "", name="Technológia", band="moss")
    tech += section(1, "Vrstvy domu", "paper", f'''<div class="wrap wide" data-reveal>
  <h2 style="margin:18px 0 34px">{lines("Dom je <em>stavebnica</em>|s presnými dielmi.")}</h2>
  <div class="mhead">
    <figure data-par>
      <div class="frame clipimg" style="aspect-ratio:4/3">
        <img src="assets/explod.jpg" alt="Rozložený dom — strecha, poschodie, prízemie, doska"
          loading="lazy"></div>
      {cap("Rozložený dom · vizualizácia", "01 — 04")}
    </figure>
    <div>
      <p class="fade d2">Steny a stropy vznikajú v hale, na presných strojoch a pod strechou.
        Na stavbu prídu ako diely a skladajú sa. Preto to ide rýchlo — a preto to sedí.</p>
      <div class="idxlist fade d3">
        <div class="on"><b>01</b><span>Strecha</span></div>
        <div class="on"><b>02</b><span>Poschodie · spálne a kúpeľňa</span></div>
        <div class="on"><b>03</b><span>Prízemie · obývačka, kuchyňa</span></div>
        <div class="on"><b>04</b><span>Základová doska</span></div>
      </div>
    </div>
  </div>
</div>''')
    tech += section(2, "Skladba steny", "moss", f'''<div class="wrap split" data-reveal>
  <div class="col-a" style="position:sticky;top:0;padding:clamp(20px,4vh,40px) 0">
    <figure data-par>
      <div class="frame clipimg" style="aspect-ratio:4/3">
        <img src="assets/beat4.jpg" alt="Rez stenou" loading="lazy"></div>
      {cap("Rez stenou · vizualizácia", "Zvonku dnu")}
    </figure>
  </div>
  <div style="padding:clamp(20px,4vh,40px) 0">
    <h2 style="margin:18px 0 22px">{lines("Sedem vrstiev|medzi vami a <em>zimou</em>.")}</h2>
    <p class="lead fade d2" style="margin-bottom:30px">Difúzne otvorená stavba znamená, že stena
      vie prepustiť vodnú paru von. Vlhkosť v nej neostáva stáť — a to je hlavný dôvod, prečo
      drevostavba vydrží.</p>
    <table class="spec fade d3"><tbody>{spec}</tbody></table>
    <p class="fine fade d4" style="margin-top:18px">Orientačná skladba, poradie vrstiev zvonku
      dnu. Hrúbky a U-hodnotu (stĺpec vpravo) doplní EcoDomček podľa konkrétneho projektu —
      nič neodhadujeme.</p>
  </div>
</div>''')
    tech += section(3, "Vnútri", "paper", f'''<div class="wrap" data-reveal>
  <h2 style="margin:18px 0 40px">{lines("V lete chladí,|v zime je <em>teplučký</em>.")}</h2>
  <div class="trio fade d2">
    {figure("beat3.jpg", "Obývačka", "3/4", ("Obývačka · vizualizácia",))}
    {figure("beat5.jpg", "Kuchyňa", "3/4", ("Kuchyňa · vizualizácia",))}
    {figure("beat6.jpg", "Terasa", "3/4", ("Terasa · vizualizácia",))}
  </div>
  <p class="fine fade d3" style="margin-top:22px">Vizualizácie navrhovaného interiéru —
    nie fotografie realizácie.</p>
</div>''')
    tech += contact_band("Kontakt")
    page("technologia.html", "Technológia — EcoDomček",
         "Difúzne otvorená drevostavba vrstvu po vrstve: skladba steny, drevovláknitá izolácia "
         "a prečo je táto technológia v USA a Kanade overená vyše 200 rokov.",
         tech, "technologia", first="Technológia")

    # ═══════════════════════════════════════════════════════════════════
    # 6 — O NÁS — one column, one measure, the client's own words; the
    # years stand in the margin like marginalia
    # ═══════════════════════════════════════════════════════════════════
    about = masthead("O nás <i>/</i> od roku 2007",
                     "Kto sme a čo nám|ide <em>najlepšie</em>.",
                     "",
                     name="O nás")
    essay = [
        ("2007", "„Kariéra“ staviteľa sa začala písať v roku 2007, keď som si svojpomocne "
                 "postavil montovaný drevodom. Práca s drevom ma veľmi zaujala, napĺňala a aj mi "
                 "tak nejako prirodzene išla od ruky — hoci dovtedy som pracoval v IT oblasti."),
        ("", "Následne ma zavolal jeden, druhý… piaty… desiaty kamarát urobiť strechu, altánok "
             "či celý dom. Keďže som sa venoval aj iným činnostiam, trvalo mi desať rokov, kým som "
             "sa odhodlal pretaviť svoje zručnosti aj komerčne."),
        ("2017", "Spoločnosť EcoDomček, s.r.o. vznikla 1. 1. 2017. Zameriavame sa hlavne na "
                 "montované drevodomy, stavbu striech, altánkov a iných drevených konštrukcií, "
                 "pretože je to materiál a technológia, ktorej veríme."),
        ("", "O tom nás neustále presviedčajú stavby, ktoré sme už zrealizovali — a teda aj môj "
             "vlastný dom(ček). Investícia do tohto typu technológie sa reálne vypláca tak "
             "v komforte bývania, zo zdravotného hľadiska, ako aj finančne."),
        ("200 rokov", "Aj keď je to u nás ešte stále pomerne nová technológia a my, konzervatívni "
                      "Slováci, jej veľmi nedôverujeme, v USA a Kanade je osvedčená už viac ako "
                      "200 rokov a preverená náročnejšími klimatickými podmienkami, ako u nás."),
    ]
    paras = "".join(
        f'<div class="para fade d{min(4, j % 4 + 1)}"><i class="mono">{esc(y)}</i><p class="sig">{t}</p></div>'
        for j, (y, t) in enumerate(essay))
    about += section(1, "Príbeh", "paper", f'''<div class="wrap essay" data-reveal>
  {paras}
  <div class="who fade d4" style="margin-top:34px">
    <span class="mono">{esc(C.DIRECTOR)}</span><span class="fine">konateľ</span></div>
</div>''')
    about += section(2, "Motto", "sand", f'''<div class="wrap motto" data-reveal>
  <blockquote class="fade d1">{lines("Čo je <em>eko</em>logické,|je aj ekonomické.")}</blockquote>
  <p class="sig fade d2">V dnešnej dobe je moderné byť „eko“, aj keď mnohokrát sa skutočný význam
    tohto slova stráca. Budeme radi, keď vás naša práca presvedčí, že to nie je iba prázdna
    fráza. Že správať sa a žiť EKOlogicky je správne a rozmýšľať EKOnomicky výhodné.</p>
</div>''')
    about += section(3, "Zákaznícke vyjadrenia", "paper", f'''<div class="wrap" data-reveal>
  <h2 style="margin:18px 0 40px;max-width:16ch">{lines("Ľudia, ktorým sme|už <em>stavali</em>.")}</h2>
  {testimonials(full=True)}
  <p class="fine fade d3" style="margin-top:26px">Vyjadrenia sú prevzaté zo súčasného webu
    EcoDomčeka tak, ako ich zákazníci napísali. Ďalšie zverejníme, keď k nim budeme mať súhlas.</p>
</div>''')
    about += section(4, "Prvotina", "paper", f'''<div class="wrap plateset first" data-reveal>
  <figure class="plate">
    <a href="realizacia-2008-prvotina.html"><div class="frame clipimg"><img src="assets/foto-2008-prvotina.jpg"
      alt="Prvý dom — krémová fasáda, sedlová strecha, veranda" loading="lazy"></div></a>
    {cap("Prvý dom, Lúčina 2008", "Fotografia realizácie")}
  </figure>
  <div>
    <h2 style="margin:18px 0 22px">{lines("Tak týmto to|všetko <em>začalo</em>.")}</h2>
    <p class="sig fade d2">Drevodom, ktorý som ako „kancelárska krysa“ postavil podľa knižiek
      a rád od kamarátov. Len s nadšením. Bývame v ňom od roku 2008 a sme totálne spokojní.</p>
    <div class="more fade d3">{btn("Pozrieť prvotinu", "realizacia-2008-prvotina.html")}</div>
  </div>
</div>''')
    about += contact_band("Kontakt")
    page("o-nas.html", "O nás — EcoDomček",
         "Roman Chovanec si v roku 2007 svojpomocne postavil drevodom. Z nadšenia vznikla v roku "
         "2017 firma EcoDomček, s.r.o. z Lúčiny pri Prešove.", about, "o-nas", first="O nás")

    # ═══════════════════════════════════════════════════════════════════
    # 8 — STENA — the 5D wall: seven slabs you pull apart
    # (lusion.md: input maps to motion instantly; igloo.md: labels over a
    # photoreal object in a light world; 08 §5 one hero object, held shots)
    # ═══════════════════════════════════════════════════════════════════
    WL = json.loads((REND / "wall-layers.json").read_text())
    slabs = ""; tags = ""
    for i, key in enumerate(WL["order"]):
        l = WL["layers"][key]
        n, t = C.WALL_TEXT[i]
        slabs += (f'<div class="slab" data-i="{i}" style="left:{l["x"] * 100:.2f}%;top:{l["y"] * 100:.2f}%;'
                  f'width:{l["w"] * 100:.2f}%;aspect-ratio:{l["w"] * WL["W"]:.0f}/{l["h"] * WL["H"]:.0f}">'
                  f'<img src="assets/wall-{i + 1}-{key}.webp" alt="{esc(n)}" draggable="false" loading="eager"></div>')
        tags += (f'<div class="tag" data-i="{i}" style="left:{l["x"] * 100:.2f}%;width:{l["w"] * 100:.2f}%">'
                 f'<b>{i + 1:02d}</b><span>{esc(n)}</span><p>{esc(t)}</p></div>')
    wall = f'''<section class="band wallpage" id="wall" data-sec="Stena">
  <div class="walltrack" data-wall>
    <div class="wallstage">
      <h1 class="wl"><span class="rl"><span>Potiahnite <em>stenu</em>.</span></span></h1>
      <div class="slabs" style="aspect-ratio:{WL["W"]}/{WL["H"]}">{slabs}</div>
      <div class="tags">{tags}</div>
      <p class="tagdesc"></p>
      <div class="handle mono" aria-hidden="true"><i></i>Ťahajte doprava — alebo scrollujte</div>
      <div class="wallbar">
        <span class="mono">zvonku</span>
        <div class="meter"><b></b></div>
        <span class="mono">dnu</span>
      </div>
      <span class="vz mono">vizualizácia · orientačná skladba, hrúbky a U-hodnotu potvrdí EcoDomček</span>
    </div>
  </div>
</section>'''
    wall += section(1, "Prečo difúzne otvorená", "moss", f'''<div class="wrap wallwhy" data-reveal>
  <h2 class="big fade">{lines("Prečo <em>difúzne</em>|otvorená?")}</h2>
  <div class="wallcols fade d2">
    <p class="lead">Stena, ktorá vie prepustiť vodnú paru von. Vlhkosť v nej neostáva stáť —
      a to je hlavný dôvod, prečo drevostavba vydrží. Aj keď je to u nás ešte stále pomerne nová
      technológia, v USA a Kanade je osvedčená už viac ako 200 rokov a preverená náročnejšími
      klimatickými podmienkami, ako u nás.</p>
    <p class="lead">Na zateplenie používame ekologické materiály na báze drevných vlákien; drevo
      chránime bóraxovou soľou. Konštrukcia vzniká ako montovaná drevostavba — od základov až po
      kolaudáciu.</p>
  </div>
  <div class="fade d3">{btn("Celá technológia", "technologia.html")}{btn("Zavolajte " + C.PHONE, "tel:" + C.PHONE_RAW, ghost=True, arrow=False)}</div>
</div>''')
    wall += contact_band("")
    page("stena.html", "Stena — sedem vrstiev, ktoré môžete roztiahnuť — EcoDomček",
         "Interaktívna skladba difúzne otvorenej steny: obklad, vetraná medzera, drevovláknitá "
         "doska, nosná konštrukcia s izoláciou, parobrzda, inštalačná predstena, sadrokartón.",
         wall, "stena", first="Stena")

    # ═══════════════════════════════════════════════════════════════════
    # 7 — KONTAKT
    # ═══════════════════════════════════════════════════════════════════
    kont = f'''<section class="band dusk" data-sec="Kontakt" data-band="dusk">
  <div class="wrap masthead" data-reveal>
    <div class="mhead">
      <div>
        <h1>{lines("Poďme si o tom|<em>pokecať</em>.")}</h1>
        <p class="lead fade d2">Zavolajte kedykoľvek — alebo napíšte, čo staviate.
          Keď už nič iné, minimálne poradíme. Zadarmo.</p>
        <a class="tel-big fade d3" href="tel:{C.PHONE_RAW}" style="margin-top:34px">{C.PHONE}</a>
        <div class="fade d4" style="margin-top:14px">
          <a class="mono" href="mailto:{C.EMAIL}">{C.EMAIL}</a></div>
      </div>
      <div class="mmeta fade d2">
        <div><span>Adresa</span><b>Lúčina 33</b></div>
        <div><span>PSČ</span><b>082 07 Lúčina</b></div>
        <div><span>Okres</span><b>Prešov</b></div>
        <div><span>Konateľ</span><b>{esc(C.DIRECTOR)}</b></div>
        <div><span>IČO</span><b>50619616</b></div>
        <div><span>IČ DPH</span><b>SK2120403648</b></div>
      </div>
    </div>
  </div>
</section>''' + section(1, "Dopyt", "paper", f'''<div class="wrap split" data-reveal>
  <div>
    <h2 style="margin:18px 0 22px">{lines("Napíšte nám,|čo <em>staviate</em>.")}</h2>
    <p class="lead fade d2">Čím viac napíšete, tým presnejšie vieme odpovedať. Hodí sa:
      miesto stavby, či máte pozemok a projekt, a dokedy by ste chceli bývať.</p>
    <div class="idxlist fade d3" style="margin-top:30px">
      <div class="on"><b>01</b><span>Poradíme a usmerníme — hoci aj zadarmo</span></div>
      <div class="on"><b>02</b><span>Prejdeme si pozemok, projekt a rozpočet</span></div>
      <div class="on"><b>03</b><span>Od základov až po kolaudáciu</span></div>
    </div>
  </div>
  <div class="fade d2">{form()}</div>
</div>''')
    page("kontakt.html", "Kontakt — EcoDomček",
         f"EcoDomček, s.r.o., Lúčina 33, 082 07 Lúčina, okr. Prešov. Telefón {C.PHONE}, "
         f"e-mail {C.EMAIL}.", kont, "kontakt", band="dusk", first="Kontakt")
