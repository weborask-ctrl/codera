# -*- coding: utf-8 -*-
"""EcoDomček — the page builders.

Seven page types, each with a DIFFERENT SHAPE, one shared component set.
``build(B)`` receives the builder module's globals (esc, lines, figure,
section, page, …) so the helpers stay in one place.
"""
import json
import math
import re
import pathlib

import content as C

HERE = pathlib.Path(__file__).parent
REND = HERE.parent / "renders"

# ── the house: four cut-out layers measured from the exploded render ─────
LAY = json.loads((REND / "layers2.json").read_text())
INK = json.loads((REND / "ink-4-150.json").read_text())


def _lean(d: str) -> str:
    """Potrace's absolute one-decimal path → relative integers. The drawing
    shows at about half its viewBox, so a unit is under a CSS pixel; the
    hero's HTML drops by more than half (the ink was 160 KB of it)."""
    out, x, y, sx, sy = [], 0, 0, 0, 0
    for cmd, args in re.findall(r"([MLCZ])([^MLCZ]*)", d):
        v = [round(float(a)) for a in re.findall(r"-?\d+(?:\.\d+)?", args)]
        if cmd == "Z":
            out.append("z"); x, y = sx, sy; continue
        rel = []
        step = 6 if cmd == "C" else 2
        for i in range(0, len(v), step):
            seg = v[i:i + step]
            rel += [c - (x if j % 2 == 0 else y) for j, c in enumerate(seg)]
            x, y = seg[-2], seg[-1]
        if cmd == "M":
            sx, sy = v[0], v[1]
        s = ""
        for c in rel:
            t = str(c)
            s += t if (not s or t[0] == "-") else " " + t
        out.append(cmd.lower() + s)
    return "".join(out)


for _v in INK.values():
    _v["paths"] = [(c, _lean(d)) for c, d in _v["paths"]]
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


# real photo sizes, read from the files — hard-coded sizes drifted the
# moment a photo was re-cropped
from PIL import Image as _Image
SHOTS = {f.stem: _Image.open(f).size for f in sorted((REND / "photos").glob("*.jpg"))}


# ── the opened house: one label per level, anchored to the layer's own box
# in the render (the film's first frame IS the layers at these positions,
# so when scroll rewinds the film to its start, each label sits on its
# level). Names describe the visualisation; materials are the Lúčina specs.
OPEN = [("roof", "r", "Strecha", "plochá"),
        ("upper", "l", "Poschodie", "spálne a kúpeľňa · fasáda Rhombus smrekovec"),
        ("ground", "r", "Prízemie", "obývačka a kuchyňa · kompaktné dosky Fundermax"),
        ("base", "l", "Základová doska", "")]


def open_labels():
    out = ""
    for i, (k, side, name, note) in enumerate(OPEN):
        l = LAY["layers"][k]
        y = (l["y"] + l["h"] * .5) / LAY["H"] * 100
        x = ((l["x"] + l["w"]) if side == "r" else l["x"]) / LAY["W"] * 100
        em = "".join(f"<em>{n}</em>" for n in note.split(" · "))   # a narrow tag: a line per fact
        out += (f'<div class="ol {side}" data-n="{i + 1}" style="--y:{y:.1f}%;--x:{x:.1f}%"><i></i>'
                f'<div><b>{i + 1:02d}</b><span>{name}</span>{em}</div></div>')
    return f'<div class="olabels">{out}</div>'


def street():
    """The eight jobs on one ground line, 2008 → 2024, as they were built:
    a house stands taller than a terrace, the job without a photograph is
    an empty lot. Photos keep their own aspect and never exceed their source."""
    import html as _h
    out = ""
    for p in sorted(C.PROJECTS, key=lambda q: (q["year"], q["slug"])):
        house = "Dom" in p["tags"]
        h = 400 if house else 300
        src = photo_src(p)
        if src:
            w, hh = SHOTS[p["photo"]]
            # a ratio of the street's height (CSS --hh), so the street fills
            # the viewport it is pinned in; the photos are served at 1.65×
            pic = (f'<img src="{src}" alt="{_h.escape(p["shot"])}" loading="lazy" decoding="async" '
                   f'style="--r:{h / 400:.2f};aspect-ratio:{w}/{hh}">')
        else:
            pic = f'<span class="lot" style="--r:{h / 400:.2f}"><i>Fotografiu doplní EcoDomček</i></span>'
        out += (f'<a class="house-lot" href="realizacia-{p["slug"]}.html">{pic}'
                f'<span class="cap"><span class="yr">{p["year"]}</span><b>{_h.escape(title_of(p))}</b>'
                f'<span class="where">{_h.escape(p["place"])}</span></span></a>')
    return out


def title_of(p):
    return p.get("short", p["title"])


def photo_src(p):
    return f'assets/foto-{p["photo"]}.jpg' if p.get("photo") else None


# where each photo's close-up looks: a real detail of that build, chosen by
# eye (window trim, cladding, deck boards, railing) — (x %, y %, what)
DETAIL = {
    "2008-prvotina": (60, 45, "okná s červeným lemovaním"),
    "2015-budatin": (55, 36, "fasáda z cementovláknitých dosiek"),
    "2019-terasa-chrastne": (34, 40, "zastrešenie terasy"),
    "2021-bungalov-presov": (55, 74, "smrekovcová terasa"),
    "2021-terasa": (34, 56, "zábradlie"),
    "2023-kosice": (30, 38, "okno so žalúziou"),
    "2024-lucina": (62, 44, "rhombus profil a Fundermax"),
}


def plate_img(p, esc, eager=False, size=None):
    """The photo, or an honest empty plate when we have none."""
    src = photo_src(p)
    wh = f' width="{size}" height="{size}"' if size else ""
    if src:
        return (f'<img src="{src}" alt="{esc(p["shot"])}" loading="{"eager" if eager else "lazy"}" '
                f'decoding="async"{wh}>')
    return '<span class="noimg mono">Fotografiu doplní EcoDomček</span>'


# ── where they built: Natural Earth outline (src/geo.py) + the jobs' places.
# Places are municipality centres, so the map says "orientačne"; the garage
# has no place on its sheet and is not drawn.
SK = json.loads((REND / "sk.json").read_text())
PLACES = [  # name, lat, lon, project slugs, label side
    ("Žilina", 49.223, 18.740, ["2015-budatin"]),
    ("Prešov", 48.998, 21.239, ["2021-bungalov-presov"]),
    ("Lúčina", 48.970, 21.380, ["2024-lucina", "2008-prvotina"]),
    ("pri Košiciach", 48.716, 21.261, ["2023-kosice", "2021-terasa"]),
    ("Chrastné", 48.630, 21.360, ["2019-terasa-chrastne"]),
]
BASE = "Lúčina"


def km(a, b):
    (la1, lo1), (la2, lo2) = [(math.radians(x), math.radians(y)) for x, y in (a, b)]
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 6371 * 2 * math.asin(math.sqrt(h))


def sk_map(esc):
    import math as _m
    k = _m.cos(_m.radians(SK["lat0"]))
    x0, y0, x1, y1 = SK["box"]
    S = 100
    pad, side = 10, 128                                  # label column right of the country
    W, H = (x1 - x0) * S + pad * 2 + side, (y1 - y0) * S + pad * 2
    def xy(lat, lon):
        return ((lon * k - x0) * S + pad, (-lat - y0) * S + pad)
    ring = " ".join(f"{(x - x0) * S + pad:.1f},{(y - y0) * S + pad:.1f}" for x, y in SK["ring"])
    by = {p["slug"]: p for p in C.PROJECTS}
    base = next(pl for pl in PLACES if pl[0] == BASE)
    bx, by_ = xy(base[1], base[2])
    lines_, pins, labels, legend = "", "", "", ""
    east = [pl for pl in PLACES if pl[2] > 20]
    ly = {pl[0]: 18 + i * ((H - 36) / max(1, len(east) - 1)) for i, pl in enumerate(sorted(east, key=lambda q: -q[1]))}
    for i, (name, lat, lon, slugs) in enumerate(PLACES):
        x, y = xy(lat, lon)
        if name != BASE:                                  # from home to the job: a flat arc
            mx, my = (bx + x) / 2, (by_ + y) / 2 - abs(bx - x) * .18
            lines_ += f'<path class="route" d="M{bx:.1f},{by_:.1f} Q{mx:.1f},{my:.1f} {x:.1f},{y:.1f}"/>'
        pins += (f'<circle class="{"ghome" if name == BASE else "gpin"}" cx="{x:.1f}" cy="{y:.1f}" r="{5.2 if name == BASE else 4.4}"/>'
                 f'<text class="pn" x="{x:.1f}" y="{y + .3:.1f}">{i + 1}</text>')
        jobs = "".join(f'<a href="realizacia-{sl}.html"><i>{by[sl]["year"]}</i>{esc(title_of(by[sl]))}</a>' for sl in slugs)
        head = f'<b>{esc(name)}</b>' + ('<em>tu sme doma</em>' if name == BASE else f'<em>{round(km(base[1:3], (lat, lon)))} km</em>')
        if lon > 20:                                      # east: a leader to the label column
            tx, ty = (x1 - x0) * S + pad + 14, ly[name]
            lines_ += f'<path class="lead" d="M{x:.1f},{y:.1f} L{tx - 8:.1f},{ty:.1f} L{tx - 2:.1f},{ty:.1f}"/>'
            labels += (f'<div class="gl" style="left:{tx / W * 100:.2f}%;top:{ty / H * 100:.2f}%">'
                       f'<span class="gn">{i + 1}</span><div>{head}{jobs}</div></div>')
        else:                                             # west: the label sits over the pin
            labels += (f'<div class="gl gw" style="left:{x / W * 100:.2f}%;top:{y / H * 100:.2f}%">'
                       f'<span class="gn">{i + 1}</span><div>{head}{jobs}</div></div>')
        legend += f'<li><span class="gn">{i + 1}</span><div>{head}{jobs}</div></li>'
    svg = (f'<svg viewBox="0 0 {W:.1f} {H:.1f}" aria-hidden="true">'
           f'<polygon class="sk" points="{ring}"/>{lines_}{pins}</svg>')
    return (f'<figure class="skmap" style="aspect-ratio:{W:.1f}/{H:.1f}">{svg}{labels}</figure>'
            f'<ol class="glegend">{legend}</ol>')


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

    # the home's process as a build log (basement.md: dense rows of real
    # content between vast type; igloo.md: mono annotation). Every step
    # carries something real: the first step IS the call, the others a
    # visualisation that shows literally that step — the cutaway is the
    # layout, the exploded house is the assembly order, the interior is
    # the finish. All labelled "vizualizácia".
    STEP_ART = {
        "02": ("rez.jpg", "Rez domom · dispozícia · vizualizácia", "Rez domom s dispozíciou oboch podlaží — vizualizácia"),
        "03": ("explod.jpg", "Základ, prízemie, poschodie, strecha · vizualizácia", "Dom rozložený na základ, podlažia a strechu — vizualizácia"),
        "04": ("beat5.jpg", "Hotový interiér · vizualizácia", "Dokončená kuchyňa s jedálňou — vizualizácia"),
    }

    def build_log():
        rows = ""
        total = len(C.PROCESS)
        for i, (n, t, d) in enumerate(C.PROCESS):
            if n in STEP_ART:
                f, capt, alt = STEP_ART[n]
                art = (f'<figure class="lart"><div class="frame clipimg"><img src="assets/{f}" alt="{esc(alt)}" '
                       f'loading="lazy" decoding="async"></div>{cap(capt)}</figure>')
            else:
                art = (f'<div class="lart lcall"><span class="mono">Prvý krok je telefonát</span>'
                       f'<a class="lphone" href="tel:{C.PHONE_RAW}">{C.PHONE}</a>'
                       f'<a class="fine" href="mailto:{C.EMAIL}">{C.EMAIL}</a></div>')
            rows += (f'<li class="lrow fade"><span class="lnum" aria-hidden="true">{n}</span>'
                     f'<div class="ltext"><span class="lstep mono">Krok {i + 1} zo {total}</span>'
                     f'<h3>{esc(t)}</h3><p>{esc(d)}</p></div>{art}</li>')
        return f'<ol class="blog">{rows}</ol>'

    def quotes_home():
        """Both real quotes, one large and one set against it — the band
        was a single quote with its right half empty."""
        big, small = C.TESTIMONIALS[1], C.TESTIMONIALS[0]
        return f'''<div class="qhome">
  <span class="qmark" aria-hidden="true">„</span>
  <figure class="qbig fade"><blockquote>„{esc(big["quote"])}“</blockquote>
    <figcaption><b>{esc(big["author"])}</b><span>{esc(big["note"])}</span></figcaption></figure>
  <figure class="qsmall fade d2"><blockquote>„{esc(small["quote"])}“</blockquote>
    <figcaption><b>{esc(small["author"])}</b><span>Zdroj oboch: ecodomcek.sk</span></figcaption>
    <a class="qmore" href="o-nas.html">Kto sme a čo nám ide najlepšie <span aria-hidden="true">→</span></a></figure>
</div>'''

    def contact_band(current="index.html"):
        """The closing beat of every page except kontakt.html.

        It used to be the whole contact block — headline, lead, phone, mail
        and a full (deliberately dead) form — repeated on all fourteen
        pages. Measured 2026-09-18 it ran 1330 px on desktop and 1940 px on
        mobile: 57 % of the wall page and 44 % of the thinnest project page
        on a phone. More than half of what a visitor scrolled was a form
        they had already scrolled past somewhere else. refokus.md (LIKED)
        names both halves of that failure — "every scroll beat delivers a
        different KIND of content" and REFUSE: "the sheer page length".

        The form now lives on kontakt.html, where it is the page. What
        stays here is the two things a family needs at the end of a page:
        the phone, and where to go next — and "next" differs per page,
        which is what turns a repeated dead end back into a beat.
        """
        order = [(re.sub(r"<sup>.*?</sup>", "", l).strip(), h) for l, h in C.NAV]
        hrefs = [h for _, h in order]
        if current in hrefs:
            nxt = order[(hrefs.index(current) + 1) % len(order)]
            if nxt[1] == "kontakt.html":
                nxt = order[0]  # the right-hand column already IS the contact call
        else:
            nxt = order[1]  # project details lead back to the register
        return section(9, "Kontakt", "dusk", f'''<div class="wrap closing" data-reveal>
  <a class="next fade" href="{nxt[1]}">
    <span class="mono">Ďalej</span>
    <b>{esc(nxt[0])} {ARROW}</b>
  </a>
  <div class="reach fade d2">
    <span class="mono">Povedzte nám, čo staviate</span>
    <a class="tel-big" href="tel:{C.PHONE_RAW}">{C.PHONE}</a>
    <div class="reachrow">{btn("Napíšte nám", "kontakt.html")}
      <a class="mono" href="mailto:{C.EMAIL}">{C.EMAIL}</a></div>
  </div>
</div>''', sid="kontakt")

    def form():
        """No server yet, so the form does what it honestly can: it opens the
        visitor's own e-mail with the enquiry already written to the client.
        Without JS the browser's mailto: GET still carries subject and text."""
        # the fields are the client's own list: "Hodí sa: miesto stavby, či
        # máte pozemok a projekt, a dokedy by ste chceli bývať"; the chips
        # are their services, so a tap says what the enquiry is about
        chips = "".join(f'<label class="chip"><input type="checkbox" name="co" value="{v}"><span>{v}</span></label>'
                        for v in ("Dom na kľúč", "Strecha", "Terasa", "Altánok", "Interiér", "Zateplenie",
                                  "Renovácia", "Iné"))
        def pick(name, legend, opts):
            o = "".join(f'<label class="chip"><input type="radio" name="{name}" value="{v}"><span>{v}</span></label>'
                        for v in opts)
            return f'<fieldset class="pick"><legend>{legend}</legend><div>{o}</div></fieldset>'
        return f'''<form class="inquiry" action="mailto:{C.EMAIL}" method="get" data-mail="{C.EMAIL}" novalidate>
  <input type="hidden" name="subject" value="Dopyt z webu">
  <fieldset class="pick wide"><legend>Čo staviame?</legend><div>{chips}</div></fieldset>
  <div class="form">
    <label>Meno<input type="text" name="meno" autocomplete="name"></label>
    <label><span>Telefón alebo e-mail <i class="req">povinné</i></span><input type="text" name="kontakt" autocomplete="tel"
      inputmode="email" aria-describedby="kontakt-err" required><em class="ferr" id="kontakt-err" aria-live="polite"></em></label>
    <label>Miesto stavby<input type="text" name="miesto" placeholder="obec alebo okres"></label>
    <label>Dokedy by ste chceli bývať?<input type="text" name="kedy" placeholder="napr. jar 2027"></label>
    {pick("pozemok", "Pozemok", ("mám", "hľadám"))}
    {pick("projekt", "Projekt", ("mám", "nemám", "neviem"))}
    <label class="wide">Čo ešte by sme mali vedieť?<textarea rows="3" name="body"
      placeholder="Veľkosť, počet izieb, otázka… čokoľvek."></textarea></label>
  </div>
  <button class="btn" style="margin-top:30px" type="submit">Pripraviť e-mail {ARROW}</button>
  <p class="fine fstatus" style="margin-top:16px" aria-live="polite">Otvorí sa váš e-mail s hotovým
    dopytom na {C.EMAIL} — stačí ho odoslať. Alebo zavolajte {C.PHONE}.</p>
  <p class="fine" style="margin-top:6px">Formulár nič neukladá — <a href="ochrana-udajov.html">ochrana osobných údajov</a>.</p>
  <div class="fdone" hidden>
    <b>Dopyt je pripravený.</b>
    <p>Ak sa e-mail neotvoril, skopírujte text a pošlite ho na <a href="mailto:{C.EMAIL}">{C.EMAIL}</a> —
      alebo rovno zavolajte <a href="tel:{C.PHONE_RAW}">{C.PHONE}</a>.</p>
    <button class="btn ghost" type="button" data-copy>Skopírovať text dopytu</button>
    <span class="fine fcopied" aria-live="polite"></span>
  </div>
</form>'''

    def masthead(head, lead, meta=None, band="paper", name="Úvod"):
        """A page opens on its headline — no annotation line above it.

        Ondrej, phase 7 (2026-09-14): „odstráň zbytočné malé texty a
        podnadpisy, ktoré nedávajú význam". A parallel session restored the
        eyebrow ("Realizácie / 2008 — 2024") on 2026-09-18 as a template
        bug; it was his decision, so the argument is gone for good.
        """
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
    # 2026-09-25, client's call: the house must be bigger and the words
    # BESIDE it, not wrapped around it (the noomo.md weave is retired).
    # lusion.md: the 3D object is the product demo — one live exhibit per
    # frame, calm type beside it; cowboy.md: one big headline with the CTA
    # immediately under it. Phones stack the words above the house.
    hero = f'''<section class="band" id="hero" data-sec="Dom">
  <div class="poster">
    <div class="ptext">
      <h1><span class="rl"><span>Vitajte vo svete,</span></span> <span class="rl"><span>kde <em>vonia</em> drevo.</span></span></h1>
      <p class="sub fade">Montované drevodomy z Lúčiny pri Prešove. Od základov až po kolaudáciu.</p>
      <div class="ctas fade d2">{btn("Pozrieť realizácie", "realizacie.html")}{btn("Otvoriť stenu", "stena.html", ghost=True, arrow=False)}</div>
    </div>
    <div class="house" data-house>{house}
      <video class="film" muted playsinline preload="auto" aria-hidden="true" tabindex="-1"
        poster="assets/hero-first.webp" data-wide="assets/hero" data-narrow="assets/hero-720" data-big="assets/hero-2k"></video>
      <img class="still" src="assets/hero-last.webp" alt="" aria-hidden="true" loading="lazy">
      {open_labels()}
    </div>
    <ol class="olegend" aria-label="Podlažia domu">{"".join(f"<li><b>{i + 1:02d}</b><span>{n}</span>" + (f"<i>{note}</i>" if note else "") + "</li>" for i, (_, _, n, note) in enumerate(OPEN))}</ol>
    <span class="vz mono">vizualizácia · Rodinný dom Lúčina 2024</span>
  </div>
</section>'''

    # services, 2026-09-25 rework (client: "not nice, must catch the eye at
    # first sight"; the word list only came alive under a mouse). Five
    # panels carry the services we can SHOW — cowboy.md: the big imagery
    # sells; refokus.md: colour lives inside the work — one open at a time
    # (hover / focus / tap). Real photos where a job proves the service;
    # interiors are a visualisation and say so. The other seven stay a
    # dense ruled list (basement.md: real rows under a vast moment).
    PANELS = [  # service index, image, object-position, caption
        (0, "foto-2024-lucina.jpg", "50% 45%", "Fotografia · Moderný dizajnový dom, Lúčina 2024"),
        (3, "foto-2019-terasa-chrastne.jpg", "40% 50%", "Fotografia · Luxusná terasa, 2019"),
        (5, "foto-2024-lucina.jpg", "22% 30%", "Fotografia · rhombus profil, Lúčina 2024"),
        (8, "foto-2015-budatin.jpg", "50% 40%", "Fotografia · Budatín pri Žiline, 2015"),
        (9, "beat5.jpg", "55% 50%", "Vizualizácia · interiér"),
    ]

    def svc_count(i):
        return sum(1 for p in C.PROJECTS if i in p["services"])

    def panels():
        out = ""
        for k, (i, img, pos, capt) in enumerate(PANELS):
            u, n, t = C.SERVICES[i]
            c = svc_count(i)
            cnt = (f'<span class="pcount">{c} {"realizácia" if c == 1 else ("realizácie" if c < 5 else "realizácií")}</span>'
                   if c else "")
            zoom = ' style="--z:1.9"' if i == 5 else ""
            out += (f'<a class="panel{" open" if k == 0 else ""}" href="sluzby.html#s{i}" data-panel{zoom}>'
                    f'<img src="assets/{img}" alt="" loading="lazy" decoding="async" style="object-position:{pos}">'
                    f'<span class="pshade" aria-hidden="true"></span>'
                    f'<span class="pbody"><i class="phook">{esc(u)}</i><b class="pname">{esc(n)}</b>'
                    f'<span class="pmore"><span class="ptext2">{esc(t)}</span>{cnt}</span></span>'
                    f'<span class="pcap mono">{esc(capt)}</span></a>')
        return f'<div class="panels fade d2">{out}</div>'

    def svc_rest():
        shown = {i for i, *_ in PANELS}
        rows = "".join(f'<a href="sluzby.html#s{i}"><i>{esc(u)}</i><b>{esc(n)}</b><span aria-hidden="true">→</span></a>'
                       for i, (u, n, t) in enumerate(C.SERVICES) if i not in shown)
        return f'<div class="svcrest fade d3"><span class="mono">A ďalej</span>{rows}</div>'

    home = hero + section(1, "Čo staviame", "paper", f'''<div class="wrap" data-reveal>
  <div class="svchead">
    <h2 class="fade">{lines("Dom, strechu, terasu.|A všetko medzi tým.")}</h2>
    <p class="fade d2">Dvanásť vecí, ktoré robíme. Číslo pri službe je počet našich
      realizácií, kde ju uvidíte.</p>
  </div>
  {panels()}
  {svc_rest()}
</div>''') + section(2, "Stena", "moss", f'''<div class="wrap wallteaser" data-reveal>
  <div class="wt-text">
    <h2 class="fade">{lines("Otvoríme|vám <em>stenu</em>.")}</h2>
    <p class="lead fade d2">„…my, konzervatívni Slováci jej veľmi nedôverujeme…“ Preto drevostavbu
      neschovávame. Potiahnite stenu a pozrite sa, čo je v nej — sedem vrstiev, každá s menom.</p>
    <div class="fade d3">{btn("Roztiahnuť stenu", "stena.html")}</div>
  </div>
  <a class="wt-art" href="stena.html" aria-label="Otvoriť stenu">
    <img src="assets/beat4.jpg" alt="Rez stenou — vizualizácia" loading="lazy">
    <span class="vz mono">vizualizácia</span>
  </a>
</div>''') + section(3, "Ulica", "paper", f'''<div class="wrap streethead" data-reveal>
  <h2 class="big fade">{lines("Začalo to|vlastným <em>domčekom</em>.")}</h2>
  <p class="lead fade d2">Osem stavieb od roku 2008, zoradených tak, ako pribúdali. Každá je skutočná
    fotografia — okrem garáže, ktorú zatiaľ nemáme nafotenú.</p>
</div>
<div class="street" data-street><div class="strack">{street()}</div></div>
<div class="wrap"><div class="more">{btn("Všetkých osem realizácií", "realizacie.html")}</div></div>''') + section(4, "Vyjadrenie", "sand", f'''<div class="wrap" data-reveal>
  {quotes_home()}
</div>''') + section(5, "Ako to ide", "paper", f'''<div class="wrap" data-reveal>
  <div class="loghead"><h2 class="big fade">{lines("Od prvého telefonátu|po kolaudáciu.")}</h2>
    <p class="fade d2">Štyri kroky od základov až po kolaudáciu. Poradenstvo je
      zadarmo — stačí zavolať.</p></div>
  {build_log()}
</div>''') + contact_band("index.html")

    # who we are, for search engines — only facts from content.py, which
    # traces to the client's own site; no area served, no ratings, no hours
    business = {
        "@context": "https://schema.org", "@type": "GeneralContractor",
        "name": "EcoDomček", "legalName": C.NAME, "url": C.SITE,
        "telephone": C.PHONE_RAW, "email": C.EMAIL, "slogan": C.MOTTO,
        "foundingDate": C.FOUNDED, "vatID": C.LEGAL[1].split()[-1],
        "identifier": {"@type": "PropertyValue", "propertyID": "IČO", "value": C.LEGAL[0].split()[-1]},
        "image": C.SITE + "assets/og.jpg", "logo": C.SITE + "assets/favicon.svg",
        "address": {"@type": "PostalAddress", "streetAddress": C.ADDRESS[0],
                    "postalCode": C.ADDRESS[1].split()[0] + " " + C.ADDRESS[1].split()[1],
                    "addressLocality": C.ADDRESS[1].split(maxsplit=2)[2], "addressRegion": "Prešovský kraj",
                    "addressCountry": "SK"},
        "employee": {"@type": "Person", "name": C.DIRECTOR, "jobTitle": "konateľ"},
        "knowsAbout": [n for _, n, _ in C.SERVICES],
    }
    page("index.html", "EcoDomček — drevostavby z Lúčiny",
         "Montované drevodomy, strechy, terasy a interiéry z Lúčiny pri Prešove. "
         "Difúzne otvorené stavby z ekologických materiálov, od základov po kolaudáciu.",
         home, "index", first="Dom", jsonld=business)

    # ═══════════════════════════════════════════════════════════════════
    # 2 — REALIZÁCIE (index)
    # ═══════════════════════════════════════════════════════════════════
    # The proof page used to open on a visualisation — the render was the
    # biggest picture on the page that is supposed to show built work — and
    # then eight identical square cards. Now it is a chronicle of the real
    # jobs, newest first, ending where it began (2008). The year is the
    # sheet's serif numeral (same system as the detail page); each job keeps
    # its real photo at an honest size — a house wider than a terrace, never
    # wider than its source (basement.md: real content is the credibility;
    # exoape.md: the work leads, the type floats beside it at full ink).
    from collections import Counter, OrderedDict
    years = OrderedDict()
    for p in C.PROJECTS:
        years.setdefault(p["year"], []).append(p)
    SRC = {k: w for k, (w, _) in SHOTS.items()}
    groups = ""
    for y, jobs in years.items():
        rows = ""
        for p in jobs:
            house = "Dom" in p["tags"]
            wmax = min(SRC.get(p.get("photo") or "", 0), 540 if house else 420)
            specs = "".join(f"<li><span class=\"mono\">{esc(k)}</span>{esc(v)}</li>" for k, v in p["specs"][:3])
            pic = (f'<div class="jpic" style="--w:{wmax}px"><div class="clipimg">{plate_img(p, esc)}</div></div>'
                   if photo_src(p) else "")
            where = f'{esc(p["place"])} · ' if p["place"] else ""
            rows += (f'<a class="job{" nophoto" if not pic else ""}" href="realizacia-{p["slug"]}.html" data-reveal '
                     f'data-tags="{esc("|".join(p["tags"]))}">{pic}'
                     f'<div class="jtext"><span class="mono">{where}{esc(p["month"])}</span>'
                     f'<h2>{esc(title_of(p))}</h2><ul>{specs}</ul>'
                     f'<span class="jgo">Stavebný list {ARROW}</span></div></a>')
        groups += (f'<section class="yeargroup" data-year="{y}"><div class="ynum" aria-hidden="true">{y}</div>'
                   f'<div class="jobs">{rows}</div></section>')

    cnt = Counter(t for p in C.PROJECTS for t in p["tags"])
    chips_f = f'<button class="on" data-f="">Všetko <sup>{len(C.PROJECTS)}</sup></button>' + "".join(
        f'<button data-f="{esc(t)}">{esc(t)} <sup>{n}</sup></button>' for t, n in cnt.most_common())
    real = f'''<section class="band realmast" data-sec="Realizácie">
  <div class="wrap rmgrid" data-reveal>
    <h1>{lines("Osem stavieb.|Jedna <em>technológia</em>.")}</h1>
    <div class="rmr">
      <p class="lead fade d2">Od svojpomocného domčeka v Lúčine po dvojpodlažný dom pri Košiciach.
        Každá stavba je difúzne otvorená a z ekologických materiálov — to sa nemení, aj keď fasáda áno.</p>
      <div class="filters mono fade d3">{chips_f}</div>
    </div>
  </div>
</section>'''
    real += section(1, "Kronika", "paper", f'''<div class="wrap chronicle">{groups}
  <p class="fine chron-note">Fotografie sú zo skutočných realizácií EcoDomčeka, v rozlíšení, v akom
    ich máme. Garážo-sklado-terasu (2019) zatiaľ bez fotografie.</p>
</div>''')
    placed = sum(len(pl[3]) for pl in PLACES)
    far = max(PLACES, key=lambda pl: km(next(q for q in PLACES if q[0] == BASE)[1:3], pl[1:3]))
    far_km = round(km(next(q for q in PLACES if q[0] == BASE)[1:3], far[1:3]))
    real += section(2, "Kde stoja", "paper", f'''<div class="wrap geo" data-reveal>
  <div class="geotext">
    <h2 class="fade">{lines("Od Žiliny|po <em>Košice</em>.")}</h2>
    <p class="fade d2">Vychádzame z Lúčiny pri Prešove. {placed} z {len(C.PROJECTS)} realizácií má na
      stavebnom liste miesto — najďalej {esc(far[0])}, {far_km} km vzdušnou čiarou.</p>
    <dl class="gfacts fade d3"><div><dt>{len(PLACES)}</dt><dd>miest</dd></div>
      <div><dt>{placed}</dt><dd>stavieb na mape</dd></div><div><dt>{far_km}</dt><dd>km najďalej</dd></div></dl>
    <p class="fine fade d3">Poloha orientačne — stred obce. Obrys: Natural Earth.</p>
  </div>
  <div class="fade d2">{sk_map(esc)}</div>
</div>''')
    real += contact_band("realizacie.html")
    page("realizacie.html", "Realizácie — EcoDomček",
         "Osem realizácií EcoDomčeka z rokov 2008 – 2024: drevodomy, terasy, garáž a altánky "
         "v okolí Prešova, Košíc a Žiliny.", real, "realizacie", first="Realizácie")

    # ═══════════════════════════════════════════════════════════════════
    # 3 — REALIZÁCIA (detail × 8) — „stavebný list"
    #
    # The old shape was a small photo beside a label list: the genre's
    # default, and the reason this page read as filler. The new shape uses
    # the one motif the site already owns — a building goes up from the
    # ground — and turns the page into a sheet from the site.
    #
    #   igloo.md    mono annotation laid over the object like an engineer's
    #               drawing: the lines carry precision, the image carries
    #               the feeling. Every act is one environment.
    #   basement.md density of REAL content as the credibility engine, and
    #               the rhythm vast type ↔ hairline grid.
    #   kpr.md      type and object share one space — the year numeral runs
    #               BEHIND the plate instead of sitting politely beside it.
    #   pangram.md  one numeral owns the frame and bleeds to the page edge.
    #   exoape.md   light display weight at scale, copy at full ink.
    #
    # The plate develops from the bottom up when it arrives (ENTER → HOLD,
    # never a scrub — no reload can land on a half-built frame) and each
    # working level prints its annotation as the line passes it. The
    # annotations are the project's own specs; nothing is invented, and the
    # project without a photograph keeps the whole drawing and loses only
    # the image.
    # ═══════════════════════════════════════════════════════════════════
    SHOTSIZE = SHOTS
    for i, p in enumerate(C.PROJECTS):
        nxt = C.PROJECTS[(i + 1) % len(C.PROJECTS)]
        prv = C.PROJECTS[(i - 1) % len(C.PROJECTS)]

        # the working levels: spec 01 sits lowest, so the sheet annotates
        # itself from the ground up, the same direction the house builds.
        n = len(p["specs"])
        lns = lvs = ""
        for j, (k, v) in enumerate(p["specs"]):
            y = 100 - (j + 1) * 100 / (n + 1)
            lns += (f'<span class="ln" data-t="{y:.2f}" style="top:{y:.2f}%">'
                    f"<i>{j + 1:02d}</i></span>")
            lvs += (f'<div class="lv" data-t="{y:.2f}" style="top:{y:.2f}%">'
                    f'<i>{j + 1:02d}</i><b>{esc(k)}</b><em>{esc(v)}</em></div>')

        # a photo is never shown above its source width — that is the
        # archive we have, and enlarging it would show.
        w, h = SHOTSIZE.get(p.get("photo") or "", (620, 465))
        plate = (f'<div class="plimg" style="aspect-ratio:{w}/{h}">'
                 f"{plate_img(p, esc, eager=True)}"
                 f'<div class="cover"></div><div class="edge"></div>{lns}</div>')

        body = f'''<section class="band sheet" data-sec="{esc(title_of(p))}">
  <div class="wrap">
    <div class="sheettop">
      <a class="crumb mono" href="realizacie.html">← Realizácie</a>
      <span class="mono">{esc(p["place"]) + " <i>·</i> " if p["place"] else ""}{esc(p["month"])} {p["year"]}</span>
    </div>
    <div class="sheetgrid" data-reveal data-plate style="--pw:{w}px">
      <div class="scol">
        {f'<p class="shot fade">{esc(p["shot"])}</p>' if photo_src(p) else ''}
        <h1 class="fade d2">{lines(esc(p["title"]).replace(". ", ".|"))}</h1>
        <div class="syr fade d3" aria-hidden="true">{p["year"]}</div>
      </div>
      <figure class="pl fade d2">
        {plate}<div class="plnotes">{lvs}</div>
        {cap("Fotografia · archív EcoDomček" if photo_src(p) else "Fotografiu doplní EcoDomček",
             " · ".join(p["tags"]))}
      </figure>
    </div>
  </div>
</section>'''

        # the hairline sheet: only facts we can stand behind
        tbl = [("Rok", f'{p["month"]} {p["year"]}')] + ([("Miesto", p["place"])] if p["place"] else []) + [
               ("Kategórie", " · ".join(p["tags"])), ("Realizoval", "EcoDomček, s.r.o."),
               ("Fotografia", "Archív EcoDomček" if photo_src(p) else "Zatiaľ nemáme")]
        rws = "".join(f'<div class="strow"><span class="mono">{esc(k)}</span>'
                      f"<b>{esc(v)}</b></div>" for k, v in tbl)
        svc = "".join(
            f'<a href="sluzby.html#s{j}"><i>{j + 1:02d}</i><span>{esc(nm)}</span>{ARROW}</a>'
            for j, (_, nm, _) in enumerate(C.SERVICES) if j in p["services"])
        body += section(1, "Údaje", "paper", f'''<div class="wrap specs" data-reveal>
  <div class="sttab fade">{rws}</div>
  <div class="stwide fade d2"><span class="mono">Čo sme na stavbe robili</span>
    <div class="svlinks">{svc}</div></div>
</div>''')

        # the one big typographic moment of the page (exoape.md: light
        # display weight at scale, copy at full ink, held — never a whisper
        # in a corner). The konateľ's own words, verbatim — his verified role.
        # the empty half of a quote spread is where a template gives itself
        # away, so it carries real navigation: the jobs in the same category
        same = [q for q in C.PROJECTS
                if q["slug"] != p["slug"] and set(q["tags"]) & set(p["tags"])][:3]
        sim = "".join(
            f'<a href="realizacia-{q["slug"]}.html"><i class="mono">{q["year"]}</i>'
            f'<span>{esc(title_of(q))}</span>{ARROW}</a>' for q in same)
        # the close-up: the same photo, already loaded, framed on one real
        # detail — it fills the gap between the words and the side column
        det = DETAIL.get(p.get("photo", ""))
        closeup = (f'''<figure class="wdet fade d2"><div class="frame">
    <img src="{photo_src(p)}" alt="" loading="lazy" decoding="async"
      style="transform-origin:{det[0]}% {det[1]}%"></div>{cap("Detail z fotografie · " + det[2])}</figure>'''
                   if det and photo_src(p) and SHOTS[p["photo"]][0] >= 800 else "")   # a 420 px photo cannot carry a 1.7× crop
        body += section(2, "Slovami konateľa", "paper", f'''<div class="wrap words{" hasdet" if closeup else ""}" data-reveal>
  <blockquote class="fade">„{esc(p["text"])}“</blockquote>
  {closeup}
  <div class="wside">
    <div class="simil fade d2"><span class="mono">Z rovnakej kategórie</span>{sim}</div>
    <div class="who fade d3"><b>{esc(C.DIRECTOR)}</b>
      <span class="mono">EcoDomček, s.r.o. <i>·</i> konateľ</span></div>
  </div>
</div>''')
        if p.get("hero"):
            body += section(3, "Vizualizácia", "paper", f'''<div class="wrap wide" data-reveal>
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
        body += section(4, "Ďalšia stavba", "paper", f'''<div class="wrap pager" data-reveal>
  <a class="np prev" href="realizacia-{prv["slug"]}.html">
    <span class="pth">{plate_img(prv, esc, size=72) if photo_src(prv) else ""}</span>
    <span><i class="mono">Predchádzajúca</i><b>{esc(title_of(prv))}</b></span></a>
  <a class="allp mono" href="realizacie.html">Všetkých osem</a>
  <a class="np next" href="realizacia-{nxt["slug"]}.html">
    <span><i class="mono">Ďalšia stavba</i><b>{esc(title_of(nxt))}</b></span>
    <span class="pth">{plate_img(nxt, esc, size=72) if photo_src(nxt) else ""}</span></a>
</div>''')
        body += contact_band()
        page(f"realizacia-{p['slug']}.html", f"{title_of(p)} ({p['year']}) — EcoDomček",
             f"{p['text'][:150]}…", body, "realizacia", first=title_of(p),
             image=f"foto-{p['photo']}.jpg" if p.get("photo") else "og.jpg",
             image_alt=p["shot"] if p.get("photo") else "")

    # ═══════════════════════════════════════════════════════════════════
    # 4 — SLUŽBY — a ledger with its evidence
    #
    # The old page was twelve identical rows of text beside an empty half.
    # Now every service carries the jobs where the client's own category or
    # text names that work (basement.md: real rows are the credibility
    # engine); a service we cannot prove stays a plain row — no stock
    # picture, no filler. Two voices (refokus.md): the client's hook in the
    # serif ("Je vám zima?"), the service in the grotesque at display size
    # (pangram.md: the word owns its row). No running numbers.
    # ═══════════════════════════════════════════════════════════════════
    def evidence(i):
        return [p for p in C.PROJECTS if i in p["services"]]

    rows = ""
    for i, (u, n, t) in enumerate(C.SERVICES):
        ev = evidence(i)
        # the newest photographed job leads, large; the rest stay a strip
        lead = next((p for p in ev if photo_src(p)), None)
        head = ""
        if lead:
            head = (f'<a class="slead" href="realizacia-{lead["slug"]}.html">'
                    f'<span class="frame clipimg"><img src="{photo_src(lead)}" alt="{esc(lead["shot"])}" '
                    f'loading="lazy" decoding="async"></span>'
                    f'<span class="mono">{lead["year"]} · {esc(title_of(lead))}</span></a>')
        strip = ""
        for p in ev:
            if p is lead:
                continue
            img = (f'<img src="{photo_src(p)}" alt="" loading="lazy" decoding="async">'
                   if photo_src(p) else '<span class="noph"><em>bez<br>fotky</em></span>')
            strip += (f'<a href="realizacia-{p["slug"]}.html" aria-label="{esc(title_of(p))} ({p["year"]})">'
                      f'{img}<i class="mono">{p["year"]}</i><b>{esc(title_of(p))}</b></a>')
        proof = (f'<div class="sev fade d2"><span class="mono">Kde sme to robili</span>{head}'
                 + ("" if head else f'<div class="sstrip">{strip}</div>') + '</div>') if ev else ""
        # beside a lead photo the other jobs sit under the sentence
        more = (f'<div class="smore fade d3"><span class="mono">Ďalšie stavby</span>'
                f'<div class="sstrip">{strip}</div></div>') if head and strip else ""
        if i == 10:                                   # the free consultation: the call is the proof
            proof = (f'<div class="sev fade d2">{btn("Zavolajte " + C.PHONE, "tel:" + C.PHONE_RAW, arrow=False)}'
                     f'<a class="fine" href="mailto:{C.EMAIL}">{C.EMAIL}</a></div>')
        rows += (f'<article class="srow{" has" if proof else ""}" id="s{i}" data-reveal>'
                 f'<div class="sname"><span class="shook serif fade">{esc(u)}</span>'
                 f'<h2>{lines(esc(n))}</h2></div>'
                 f'<p class="stext fade d2">{esc(t)}</p>{proof}{more}</article>')

    toc = "".join(
        f'<a href="#s{i}">{esc(n)}{f"<sup>{len(evidence(i))}</sup>" if evidence(i) else ""}</a>'
        for i, (_, n, _) in enumerate(C.SERVICES))
    svc = f'''<section class="band svmast" data-sec="Služby">
  <div class="wrap svgrid" data-reveal>
    <div>
      <h1>{lines("Dom na kľúč —|alebo len jeho <em>kus</em>.")}</h1>
      <p class="lead fade d2">Stavali sme celé domy aj samostatné terasy, strechy a interiéry.
        Napíšte, čo potrebujete; ak to nerobíme, povieme rovno.</p>
    </div>
    <div class="svtoc fade d2" role="navigation" aria-label="Služby">{toc}</div>
  </div>
</section>'''
    svc += section(1, "Služby", "paper", f'''<div class="wrap srows">{rows}</div>''')
    svc += contact_band("sluzby.html")
    page("sluzby.html", "Služby — EcoDomček",
         "Drevodomy na kľúč, strechy, altánky, terasy, sadrokartóny, obklady, renovácie, "
         "maľovanie, zatepľovanie, interiéry a konzultácie — pri každej službe stavby, kde sme ju robili.",
         svc, "sluzby", first="Služby")

    # ═══════════════════════════════════════════════════════════════════
    # 5 — TECHNOLÓGIA — „prečo tomu veriť"
    #
    # Two pages already show HOW the house is made (the assembling house on
    # the home page, the seven-layer wall on stena.html). This page answers
    # the question the client himself names — „my, konzervatívni Slováci jej
    # veľmi nedôverujeme" — and shows neither of them again.
    #
    #   lusion.md   the stage-block grammar: one live exhibit set INTO calm
    #               paper chrome; input maps to an answer at once.
    #   igloo.md    one environment, mono annotation as the drawing layer.
    #   refokus.md  beat variety over effect variety — numeral, physics,
    #               image, ledger, manifesto: five KINDS of content.
    #   pangram.md  one numeral owns the masthead.
    #   basement.md the ledger: density of real, linked content.
    #   kpr.md      the season line set as part of each image's scene.
    #
    # Every claim is the client's own sentence; the diagram is labelled as a
    # principle, never a calculation.
    # ═══════════════════════════════════════════════════════════════════
    # the section bands outside → inside, the order WALL_TEXT uses. Widths
    # are schematic (the client confirms real thicknesses); names and
    # sentences are WALL_TEXT, shared with stena.html.
    VBANDS = [("ob", 1.15), ("med", .85), ("dvd", 1.3), ("nos", 4.1), ("pb", .3),
              ("pre", 1.35), ("sdk", .55)]
    total = sum(w for _, w in VBANDS)
    lab, x = "", 0.0
    for i, (key, w) in enumerate(VBANDS):
        n, s = C.WALL_TEXT[i]
        c = (x + w / 2) / total * 100
        lab += (f'<button class="vb" type="button" data-i="{i}" style="--c:{c:.2f}%;--w:{w / total * 100:.2f}%" '
                f'data-s="{esc(s)}"><i>{i + 1:02d}</i><span>{esc(n)}</span></button>')
        x += w
    bands_json = ",".join(f"{w / total:.4f}" for _, w in VBANDS)

    tech = f'''<section class="band moss tmast" data-sec="Technológia" data-band="moss">
  <div class="wrap tmgrid" data-reveal>
    <div class="tml">
      <h1>{lines("Drevostavbe sa|nedá <em>veriť</em>?")}</h1>
      <blockquote class="tq fade d2">„… a my, konzervatívni Slováci jej veľmi nedôverujeme,
        v USA a Kanade je osvedčená už viac ako 200 rokov a preverená náročnejšími klimatickými
        podmienkami, ako u nás.“</blockquote>
      <div class="twho fade d3"><b>{esc(C.DIRECTOR)}</b><span class="mono">konateľ EcoDomček, s.r.o.</span></div>
    </div>
    <div class="t200 fade d2" aria-hidden="true"><b>200+</b><span class="mono">rokov v USA a Kanade</span></div>
  </div>
</section>'''

    tech += section(1, "Stena dýcha", "paper", f'''<div class="wrap tex" data-reveal>
  <div class="texhead">
    <h2>{lines("Stena <em>dýcha</em>.")}</h2>
    <p class="lead fade d2">Difúzne otvorená stavba znamená, že stena vie prepustiť vodnú paru von.
      Vlhkosť v nej neostáva stáť — a to je hlavný dôvod, prečo drevostavba vydrží.</p>
  </div>
  <figure class="stage fade d2" data-vapour data-bands="{bands_json}">
    <canvas aria-hidden="true"></canvas>
    <span class="vend out mono">Zvonku</span><span class="vend in mono">Dnu</span>
    <div class="vbs" role="group" aria-label="Vrstvy steny">{lab}</div>
  </figure>
  <div class="vcap">
    <p class="vdesc" aria-live="polite">Para vzniká v dome — varením, dychom, sprchou — a stenou prechádza von.
      Parobrzda ju pribrzdí, vetraná medzera ju odvedie.</p>
    <span class="fine">Princíp, nie výpočet. Skladbu a hodnoty potvrdí EcoDomček pre konkrétny projekt.</span>
  </div>
</div>''')

    tech += section(2, "Leto a zima", "paper", f'''<div class="wrap tsea" data-reveal>
  <div class="seas">
    <figure class="sl fade">
      <div class="frame clipimg"><img src="assets/beat6.jpg" alt="Terasa v lete — vizualizácia" loading="lazy"></div>
      <h2>V lete <em>chladí</em>,</h2>
      {cap("Terasa · vizualizácia")}
    </figure>
    <figure class="sz fade d2">
      <div class="frame clipimg"><img src="assets/beat3.jpg" alt="Obývačka v zime — vizualizácia" loading="lazy"></div>
      <h2>v zime je <em>teplučký</em>.</h2>
      {cap("Obývačka · vizualizácia")}
    </figure>
    <blockquote class="tpay fade d3">„Investícia do tohto typu technológie sa reálne vypláca tak
      v komforte bývania, zo zdravotného hľadiska, ako aj finančne.“
      <span class="mono">{esc(C.DIRECTOR)}</span></blockquote>
  </div>
</div>''')

    # the ledger: every material a realisation's own description names,
    # linked to that realisation — nothing typed in by hand
    MATKEYS = ("Fasáda", "Doplnková fasáda", "Zateplenie", "Obklad", "Strecha",
               "Podlaha", "Podlaha terasy")
    mrows = ""
    for p in C.PROJECTS:
        for k, v in p["specs"]:
            if k not in MATKEYS:
                continue
            th = f' data-thumb="{photo_src(p)}"' if photo_src(p) else ""
            mrows += (f'<a href="realizacia-{p["slug"]}.html"{th}><b>{esc(v)}</b>'
                      f'<span class="mono">{esc(k)}</span><i class="mono">{p["year"]}</i>'
                      f'<em>{esc(title_of(p))}</em>{ARROW}</a>')
    tech += section(3, "Materiály", "paper", f'''<div class="wrap tmat" data-reveal>
  <div class="tmh">
    <h2>{lines("Z čoho sme|<em>naozaj</em> stavali.")}</h2>
    <p class="lead fade d2">Materiály z našich realizácií, tak ako sú v ich popise. Každý riadok
      vedie na stavbu, kde bol použitý.</p>
  </div>
  <div class="mledger fade d2" data-peek>{mrows}</div>
</div>''')

    tech += section(4, "Stena", "moss", f'''<div class="wrap tmotto" data-reveal>
  <h2 class="fade">{lines("Chcete ju vidieť|<em>vrstvu po vrstve</em>?")}</h2>
  <div class="tmr fade d2">
    <p>Sedem vrstiev difúzne otvorenej steny si môžete roztiahnuť sami — každá má meno.</p>
    <div>{btn("Otvoriť stenu", "stena.html")}{btn("Realizácie", "realizacie.html", ghost=True, arrow=False)}</div>
  </div>
</div>''')
    tech += contact_band("technologia.html")
    page("technologia.html", "Technológia — prečo drevostavbe veriť — EcoDomček",
         "Difúzne otvorená drevostavba: prečo stena dýcha, prečo v lete chladí a v zime hreje, "
         "a z čoho sme na našich stavbách naozaj stavali.",
         tech, "technologia", band="moss", first="Technológia")

    # ═══════════════════════════════════════════════════════════════════
    # 6 — O NÁS — one column, one measure, the client's own words; the
    # years stand in the margin like marginalia
    # ═══════════════════════════════════════════════════════════════════
    about = masthead("Kto sme a čo nám|ide <em>najlepšie</em>.",
                     "",
                     name="O nás")
    # The essay used to run in a narrow column beside ~1000 px of nothing.
    # Now every paragraph has its picture: a sticky frame on the right shows
    # the real job from that part of the story (refokus.md: the serif
    # carries the human voice, the work carries the proof). Pairings follow
    # the client's own dates; the last one is the wall — a visualisation,
    # labelled.
    essay = [
        ("2007", "„Kariéra“ staviteľa sa začala písať v roku 2007, keď som si svojpomocne "
                 "postavil montovaný drevodom. Práca s drevom ma veľmi zaujala, napĺňala a aj mi "
                 "tak nejako prirodzene išla od ruky — hoci dovtedy som pracoval v IT oblasti.",
         "foto-2008-prvotina.jpg", "Prvý dom, Lúčina · 2008",
         "Drevodom, ktorý som ako „kancelárska krysa“ postavil podľa knižiek a rád od kamarátov."),
        ("", "Následne ma zavolal jeden, druhý… piaty… desiaty kamarát urobiť strechu, altánok "
             "či celý dom. Keďže som sa venoval aj iným činnostiam, trvalo mi desať rokov, kým som "
             "sa odhodlal pretaviť svoje zručnosti aj komerčne.",
         "foto-2015-budatin.jpg", "Budatín pri Žiline · 2015", ""),
        ("2017", "Spoločnosť EcoDomček, s.r.o. vznikla 1. 1. 2017. Zameriavame sa hlavne na "
                 "montované drevodomy, stavbu striech, altánkov a iných drevených konštrukcií, "
                 "pretože je to materiál a technológia, ktorej veríme.",
         "foto-2019-terasa-chrastne.jpg", "Luxusná terasa, Chrastné · 2019", ""),
        ("", "O tom nás neustále presviedčajú stavby, ktoré sme už zrealizovali — a teda aj môj "
             "vlastný dom(ček). Investícia do tohto typu technológie sa reálne vypláca tak "
             "v komforte bývania, zo zdravotného hľadiska, ako aj finančne.",
         "foto-2024-lucina.jpg", "Moderný dizajnový dom, Lúčina · 2024", ""),
        ("200 rokov", "Aj keď je to u nás ešte stále pomerne nová technológia, a my, konzervatívni "
                      "Slováci jej veľmi nedôverujeme, v USA a Kanade je osvedčená už viac ako "
                      "200 rokov a preverená náročnejšími klimatickými podmienkami, ako u nás.",
         "beat4.jpg", "Rez stenou · vizualizácia", ""),
    ]
    paras, stack = "", ""
    for j, (y, txt, img, capt, note) in enumerate(essay):
        n = f'<p class="fine">{note}</p>' if note else ""
        paras += (f'<div class="para" data-i="{j}"><i class="mono">{esc(y)}</i><div>'
                  f'<p class="sig">{txt}</p>'
                  f'<figure class="pinl"><img src="assets/{img}" alt="{esc(capt)}" loading="lazy">'
                  f'<figcaption class="mono">{esc(capt)}</figcaption>{n}</figure></div></div>')
        stack += (f'<figure class="sf{" on" if j == 0 else ""}" data-i="{j}">'
                  f'<div class="sfimg"><img src="assets/{img}" alt="{esc(capt)}" loading="{"eager" if j == 0 else "lazy"}"></div>'
                  f'<figcaption><span class="mono">{esc(capt)}</span>{n}</figcaption></figure>')
    about += section(1, "Príbeh", "paper", f'''<div class="wrap story" data-story>
  <div class="essay">{paras}
    <div class="who" style="margin-top:34px">
      <span class="mono">{esc(C.DIRECTOR)}</span><span class="fine">konateľ</span></div>
  </div>
  <div class="stack" aria-hidden="true">{stack}</div>
</div>''')
    # the motto's own pun, drawn: one root, two endings (pangram.md: the
    # word owns the frame). The words are theirs; the sentence below says
    # it in full, so the diagram is aria-hidden.
    root = '''<div class="root fade d2" aria-hidden="true"><b>EKO</b>
    <span><i>logicky</i><small>je správne</small></span>
    <span><i>nomicky</i><small>je výhodné</small></span></div>'''
    about += section(2, "Motto", "sand", f'''<div class="wrap motto" data-reveal>
  <div><blockquote class="fade d1">{lines("Čo je <em>eko</em>logické,|je aj ekonomické.")}</blockquote>
  <p class="sig fade d2">V dnešnej dobe je moderné byť „eko“, aj keď mnohokrát sa skutočný význam
    tohto slova stráca. Budeme radi, keď vás naša práca presvedčí, že to nie je iba prázdna
    fráza. Že správať sa a žiť EKOlogicky je správne a rozmýšľať EKOnomicky výhodné.</p></div>
  {root}
</div>''')
    about += section(3, "Zákaznícke vyjadrenia", "paper", f'''<div class="wrap" data-reveal>
  <h2 style="margin:18px 0 40px;max-width:16ch">{lines("Ľudia, ktorým sme|už <em>stavali</em>.")}</h2>
  {testimonials(full=True)}
  <p class="fine fade d3" style="margin-top:26px">Vyjadrenia sú prevzaté zo súčasného webu
    EcoDomčeka tak, ako ich zákazníci napísali. Ďalšie zverejníme, keď k nim budeme mať súhlas.</p>
</div>''')
    about += contact_band("o-nas.html")
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
    <div class="wallstage" data-reveal>
      <h1 class="wl"><span class="rl"><span>Potiahnite <em>stenu</em>.</span></span></h1>
      <div class="slabs" style="aspect-ratio:{WL["W"]}/{WL["H"]}">{slabs}</div>
      <div class="tags">{tags}</div>
      <p class="tagdesc"></p>
      <div class="handle mono" aria-hidden="true"><i></i><span class="h-wide">Ťahajte doprava — alebo scrollujte</span><span class="h-drag">Ťahajte doprava</span><span class="h-rm">Ťahajte doľava — stena sa zloží</span></div>
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
    <p class="lead">Zatepľujeme prírodnými izoláciami na báze drevného vlákna alebo minerálnou
      vatou — podľa toho, čo stavba potrebuje. Konštrukcia vzniká ako montovaná drevostavba — od
      základov až po kolaudáciu.</p>
  </div>
  <div class="fade d3">{btn("Celá technológia", "technologia.html")}{btn("Zavolajte " + C.PHONE, "tel:" + C.PHONE_RAW, ghost=True, arrow=False)}</div>
</div>''')
    wall += contact_band("stena.html")
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
  <div class="kside">
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

    # ═══════════════════════════════════════════════════════════════════
    # OCHRANA SÚKROMIA — only what this site verifiably does (the form
    # sends nothing, nothing is stored, no cookies); the company's own
    # practice (how long e-mails are kept) is left for EcoDomček to state
    # ═══════════════════════════════════════════════════════════════════
    legal = section(0, "Ochrana údajov", "paper", f'''<div class="wrap legal" data-reveal>
  <h1>{lines("Ochrana osobných|<em>údajov</em>")}</h1>
  <p class="ldraft mono fade d2">Návrh textu pre ostrú verziu webu — pred spustením ho EcoDomček, s.r.o. overí a doplní.</p>
  <div class="lgrid fade d2">
    <section><h2>Kto údaje spracúva</h2>
      <p>EcoDomček, s.r.o., {", ".join(C.ADDRESS[:2])}, {C.LEGAL[0]}.<br>
        E-mail <a href="mailto:{C.EMAIL}">{C.EMAIL}</a>, telefón <a href="tel:{C.PHONE_RAW}">{C.PHONE}</a>.</p></section>
    <section><h2>Formulár</h2>
      <p>Formulár na stránke <a href="kontakt.html">Kontakt</a> nič neodosiela na server a nič neukladá.
        Pripraví e-mail vo vašom e-mailovom programe — údaje, ktoré doň napíšete (meno, telefón alebo e-mail,
        miesto stavby, správa), dostaneme až vtedy, keď ho sami odošlete. Ako dlho e-maily uchovávame, doplní EcoDomček.</p></section>
    <section><h2>Cookies a meranie</h2>
      <p>Web nepoužíva cookies ani analytické či reklamné nástroje a do vášho prehliadača nič neukladá.</p></section>
    <section><h2>Prevádzka webu</h2>
      <p>Web beží na hostingu Vercel Inc. Ten pri každej návšteve zaznamenáva technické údaje
        (napríklad IP adresu a čas požiadavky), aby web mohol bezpečne fungovať.</p></section>
    <section><h2>Vaše práva</h2>
      <p>Máte právo na prístup k svojim údajom, ich opravu, vymazanie, obmedzenie spracúvania, prenosnosť
        a právo namietať. Stačí napísať na <a href="mailto:{C.EMAIL}">{C.EMAIL}</a>. Sťažnosť môžete podať
        Úradu na ochranu osobných údajov Slovenskej republiky (dataprotection.gov.sk).</p></section>
  </div>
</div>''')
    page("ochrana-udajov.html", "Ochrana osobných údajov — EcoDomček",
         "Ako web EcoDomčeka zaobchádza s osobnými údajmi: formulár nič neukladá, žiadne cookies.",
         legal, "legal", first="Ochrana údajov")

    # ═══════════════════════════════════════════════════════════════════
    # 404 — a wrong address still lands on the site, not on a server error
    # ═══════════════════════════════════════════════════════════════════
    lost = section(0, "Nenájdené", "paper", f'''<div class="wrap lost" data-reveal>
  <span class="lnum404 fade" aria-hidden="true">404</span>
  <h1>{lines("Túto stránku|sme <em>nepostavili</em>.")}</h1>
  <p class="lead fade d2">Adresa neexistuje alebo sa zmenila. Všetko ostatné stojí na svojom mieste.</p>
  <div class="ctas fade d3">{btn("Na úvod", "index.html")}{btn("Realizácie", "realizacie.html", ghost=True, arrow=False)}{btn("Kontakt", "kontakt.html", ghost=True, arrow=False)}</div>
  <p class="fine fade d3" style="margin-top:26px">Alebo rovno zavolajte <a href="tel:{C.PHONE_RAW}">{C.PHONE}</a>.</p>
</div>''')
    page("404.html", "Stránka nenájdená — EcoDomček", "Táto adresa na webe EcoDomčeka neexistuje.",
         lost, "lost", first="404")
