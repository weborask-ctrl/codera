#!/usr/bin/env python3
"""EcoDomček — static site generator.

Builds a real multi-page site into ``dist/``: seven page types plus eight
project details, one shared shell, shared cached assets. No base64 blob —
images are files, so the second page load is nearly free.

    python3 src/build.py && python3 -m http.server 8080 --directory dist

Content lives in ``src/content.py``; this file only knows how to assemble
it. Every page is a full document (works with JS off, crawlable); the
router in ``site.js`` fetches the next page and swaps <main> under a
curtain so navigation feels continuous.
"""
from __future__ import annotations

import html
import json
import pathlib
import re
import shutil
import sys

HERE = pathlib.Path(__file__).parent
ROOT = HERE.parent
REND = ROOT / "renders"
DIST = ROOT / "dist"
ASSETS = DIST / "assets"

sys.path.insert(0, str(HERE))
import content as C  # noqa: E402

# ── assets ────────────────────────────────────────────────────────────────
# (source path relative to renders/, published name). Images are copied as
# they are: they were exported at their display size already.
IMAGES = [
    "explod.jpg", "hero.jpg", "rez.jpg",
    "beat0.jpg", "beat1.jpg", "beat2.jpg", "beat3.jpg", "beat4.jpg",
    "beat5.jpg", "beat6.jpg", "beat7.jpg", "beat8.jpg",
    "fal/hero-web.webm", "fal/hero-web.mp4", "fal/hero-first.webp", "fal/hero-last.webp",
    "wall-1-obklad.webp", "wall-2-latovanie.webp", "wall-3-doska.webp", "wall-4-ram.webp",
    "wall-5-parobrzda.webp", "wall-6-predstena.webp", "wall-7-sadrokarton.webp",
]
PHOTOS = ["2024-lucina", "2023-kosice", "2021-bungalov-presov", "2021-terasa",
          "2019-terasa-chrastne", "2015-budatin", "2008-prvotina"]


def esc(s: str) -> str:
    return html.escape(s, quote=False)


def lines(text: str) -> str:
    """Each line in its own overflow mask — the masked reveal.

    ``|`` splits lines, ``<em>`` marks the one accent word (moss).
    """
    return "".join(f'<span class="rl"><span>{ln}</span></span>' for ln in text.split("|"))


ARROW = ('<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">'
         '<path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" '
         'stroke-linecap="round" stroke-linejoin="round"/></svg>')


def cap(left: str, right: str = "") -> str:
    return (f'<figcaption class="cap"><span>{esc(left)}</span>'
            f'{f"<span>{esc(right)}</span>" if right else ""}</figcaption>')


def figure(src: str, alt: str, ratio: str, caption=None, par=False, cls="") -> str:
    """An image is always a framed object in the grid, never wallpaper."""
    p = " data-par" if par else ""
    c = cap(*caption) if caption else ""
    return (f'<figure{p} class="{cls}">'
            f'<div class="frame clipimg" style="aspect-ratio:{ratio}">'
            f'<img src="assets/{src}" alt="{esc(alt)}" loading="lazy" decoding="async">'
            f"</div>{c}</figure>")


def btn(label: str, href: str, ghost=False, arrow=True) -> str:
    cls = "btn ghost" if ghost else "btn"
    return f'<a class="{cls}" href="{href}">{esc(label)} {ARROW if arrow else ""}</a>'


# ── the shell ─────────────────────────────────────────────────────────────
def nav(active: str) -> str:
    on = ' class="on"'
    items = "".join(
        f'<a href="{h}"{on if h == active else ""}>{l}</a>' for l, h in C.NAV)
    return f"<nav>{items}</nav>"


def header(active: str) -> str:
    return f'''<header>
  <a class="brand" href="index.html" aria-label="EcoDomček — domov">
    <svg width="32" height="24" viewBox="0 0 40 30" fill="none" aria-hidden="true">
      <polyline points="2,28 20,8" stroke="#7a5a3a" stroke-width="5"/>
      <polyline points="20,8 38,28" stroke="#3f5a2a" stroke-width="5"/>
      <polyline points="11,28 20,18 29,28" stroke="#c9a96e" stroke-width="4"/>
    </svg>
    <span><b>ECODOMČEK</b><i>EKO·LOGICKÉ · EKO·NOMICKÉ STAVBY</i></span>
  </a>
  {nav(active)}
  <div class="hright">
    <a class="pill" href="tel:{C.PHONE_RAW}"><span class="dot"></span>{C.PHONE}</a>
    <a class="pill go" href="kontakt.html">Dopyt {ARROW}</a>
    <button class="menu" type="button" aria-label="Menu" aria-expanded="false"><i></i><i></i></button>
  </div>
</header>'''


def footer() -> str:
    cols = ""
    for title, rows in C.FOOTER_COLS:
        body = "".join(f"<div>{r}</div>" for r in rows)
        cols += f'<div class="fcol"><h4>{esc(title)}</h4>{body}</div>'
    links = "".join(f'<a href="{h}">{re.sub(r"<sup>.*?</sup>", "", l).strip()}</a>' for l, h in C.NAV)
    return f'''<footer>
  <div class="wrap">
    <div class="fgrid">
      <div class="big">{C.FOOTER_CLAIM}</div>
      {cols}
      <div class="fcol"><h4>Stránky</h4><div class="fnav">{links}</div></div>
    </div>
    <div class="fbot">
      <span>© 2026 EcoDomček, s.r.o.</span>
      <span>{esc(C.DISCLAIMER)}</span>
    </div>
  </div>
</footer>'''


SHELL = '''<!doctype html>
<html lang="sk">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{url}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="website">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{image}">
<meta property="og:image:alt" content="{image_alt}">
<meta property="og:locale" content="sk_SK">
<meta property="og:site_name" content="EcoDomček">
<meta name="twitter:card" content="summary_large_image">{jsonld}
<meta name="theme-color" content="#f3eee3">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="preload" href="assets/hanken.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/site.css">
</head>
<body data-page="{page}" data-band="{band}">
<a class="skip" href="#main">Preskočiť na obsah</a>
<div id="veil"><span>EcoDomček</span></div>
<div id="curtain" aria-hidden="true"><b></b></div>
{header}
<main id="main" data-page="{page}" data-band="{band}">
{body}
</main>
{footer}
<div id="peek"><img alt=""></div>
<script src="assets/gsap.min.js"></script>
<script src="assets/ScrollTrigger.min.js"></script>
<script src="assets/site.js"></script>
</body>
</html>
'''

FAVICON = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 30">'
           '<rect width="40" height="30" fill="#f3eee3"/>'
           '<polyline points="2,28 20,8" stroke="#7a5a3a" stroke-width="5" fill="none"/>'
           '<polyline points="20,8 38,28" stroke="#3f5a2a" stroke-width="5" fill="none"/>'
           '<polyline points="11,28 20,18 29,28" stroke="#c9a96e" stroke-width="4" fill="none"/>'
           "</svg>")


def section(i: int, name: str, band: str, inner: str, sid: str = "", extra: str = "") -> str:
    b = f' data-band="{band}"' if band != "paper" else ""
    cls = "band" + ("" if band == "paper" else f" {band}")
    ident = f' id="{sid}"' if sid else ""
    return f'<section class="{cls}"{ident} data-sec="{esc(name)}"{b}{extra}>{inner}</section>'


def page(file: str, title: str, desc: str, body: str, page_id: str,
         band: str = "paper", first: str = "", image: str = "og.jpg",
         image_alt: str = "", jsonld: dict | None = None) -> None:
    """One document. `image` is the share card (an asset name): the site card
    by default, a realisation's own photo on its detail page."""
    url = C.SITE + ("" if file == "index.html" else file)
    ld = ("\n<script type=\"application/ld+json\">" + json.dumps(jsonld, ensure_ascii=False)
          + "</script>") if jsonld else ""
    out = SHELL.format(title=esc(title), desc=esc(desc), page=page_id, band=band,
                       header=header(file), footer=footer(), body=body,
                       first=esc(first or title), url=url, image=C.SITE + "assets/" + image,
                       image_alt=esc(image_alt or "EcoDomček — montované drevodomy z Lúčiny"),
                       jsonld=ld)
    (DIST / file).write_text(for_the_web(out), encoding="utf-8")
    PAGES.append(file)


DIMS: dict[str, tuple[int, int]] = {}


def for_the_web(doc: str) -> str:
    """Every <img> the page shows: its WebP twin, and its real width and
    height so the layout never jumps while it loads. The share card and the
    og:image stay JPEG — that is what Facebook and Messenger read."""
    def img(m):
        tag, name = m.group(0), m.group(1)
        web = name[:-4] + ".webp" if name.endswith(".jpg") and (ASSETS / (name[:-4] + ".webp")).exists() else name
        tag = tag.replace(f'assets/{name}"', f'assets/{web}"')
        if " width=" not in tag and web in DIMS:
            w, h = DIMS[web]
            tag = tag.replace("<img ", f'<img width="{w}" height="{h}" ', 1)
        return tag
    doc = re.sub(r'<img [^>]*?src="assets/([A-Za-z0-9_.\-]+)"[^>]*>', img, doc)
    return re.sub(r'data-thumb="assets/([A-Za-z0-9_.\-]+)\.jpg"',
                  lambda m: f'data-thumb="assets/{m.group(1)}.webp"'
                  if (ASSETS / f"{m.group(1)}.webp").exists() else m.group(0), doc)


PAGES: list[str] = []


def share_card() -> None:
    """dist/assets/og.jpg — 1200×630, what a link shows on Messenger or
    Facebook. The same paper, the same type and the house built from the
    same alpha layers as the hero; labelled a visualisation, like everywhere."""
    from PIL import Image, ImageDraw, ImageFont
    W, H, paper = 1200, 630, (243, 238, 227)
    card = Image.new("RGB", (W, H), paper)
    lay = json.loads((REND / "layers2.json").read_text())
    drop = {"base": 0, "ground": 44, "upper": 70, "roof": 100}
    house = Image.new("RGBA", (lay["W"], lay["H"]), (0, 0, 0, 0))
    for n in ("base", "ground", "upper", "roof"):
        im = Image.open(REND / f"lyr-{n}.webp").convert("RGBA")
        house.alpha_composite(im, (lay["layers"][n]["x"], lay["layers"][n]["y"] + drop[n]))
    house = house.crop(house.getbbox())
    s = 520 / house.height
    house = house.resize((round(house.width * s), 520), Image.LANCZOS)
    card.paste(house, (W - house.width - 36, H - house.height - 40), house)

    def face(file, size, wght):
        f = ImageFont.truetype(str(HERE / "fonts" / file), size)
        try:
            f.set_variation_by_axes([wght])
        except OSError:
            pass
        return f
    d = ImageDraw.Draw(card)
    ink, moss, ink2 = (35, 31, 26), (63, 90, 42), (107, 99, 87)
    big = face("hanken.woff2", 76, 300)
    d.text((64, 150), "Vitajte vo svete,", font=big, fill=ink)
    d.text((64, 238), "kde ", font=big, fill=ink)
    x = 64 + d.textlength("kde ", font=big)
    d.text((x, 238), "vonia", font=big, fill=moss)
    d.text((x + d.textlength("vonia ", font=big), 238), "drevo.", font=big, fill=ink)
    d.text((64, 356), "Montované drevodomy z Lúčiny pri Prešove.", font=face("hanken.woff2", 26, 400), fill=ink2)
    mono = face("plex-mono.woff2", 17, 400)
    d.text((64, 64), "ECODOMČEK", font=face("plex-mono-500.woff2", 19, 500), fill=ink)
    d.text((64, H - 70), "0908 704 281  ·  ecodomcek.sk", font=mono, fill=ink2)
    d.text((W - 36 - d.textlength("vizualizácia", font=mono), H - 34), "vizualizácia", font=mono, fill=ink2)
    card.save(ASSETS / "og.jpg", quality=86, optimize=True, progressive=True)


def crawl_files() -> None:
    """sitemap.xml and robots.txt, from the pages this build wrote."""
    urls = "".join(f"<url><loc>{C.SITE + ('' if f == 'index.html' else f)}</loc></url>"
                   for f in sorted(PAGES, key=lambda f: (f != "index.html", f)))
    (DIST / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        f'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{urls}</urlset>\n', encoding="utf-8")
    (DIST / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {C.SITE}sitemap.xml\n",
                                     encoding="utf-8")


# ── assets pipeline ───────────────────────────────────────────────────────
def copy_assets() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    for name in IMAGES:
        src = REND / name
        if not src.exists():
            sys.exit(f"missing render: {src}")
        shutil.copy2(src, ASSETS / pathlib.Path(name).name)
    for t in PHOTOS:
        src = REND / "photos" / f"{t}.jpg"
        if not src.exists():
            sys.exit(f"missing photo: {src}")
        shutil.copy2(src, ASSETS / f"foto-{t}.jpg")
    # WebP twins for every photo and visualisation; the JPEG stays for share cards
    from PIL import Image
    for f in sorted(ASSETS.iterdir()):
        if f.suffix in (".jpg", ".webp", ".png"):
            im = Image.open(f)
            if f.suffix == ".jpg":
                im.save(f.with_suffix(".webp"), quality=76, method=6)  # −23 %, worst PSNR 35 dB
                DIMS[f.with_suffix(".webp").name] = im.size
            DIMS[f.name] = im.size
    for name in ("site.css", "site.js", "gsap.min.js", "ScrollTrigger.min.js"):
        shutil.copy2(HERE / name, ASSETS / name)
    # self-hosted faces, built by `node src/fonts.mjs` (see its header for why)
    fonts = sorted((HERE / "fonts").glob("*.woff2"))
    if not fonts:
        sys.exit("missing fonts: run `node src/fonts.mjs`")
    for f in fonts:
        shutil.copy2(f, ASSETS / f.name)
    (ASSETS / "favicon.svg").write_text(FAVICON, encoding="utf-8")


def main() -> None:
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir(parents=True)
    copy_assets()
    import pages  # noqa: E402  — page builders live next door
    pages.build(globals())
    share_card()
    crawl_files()
    files = sorted(p.name for p in DIST.glob("*.html"))
    weight = sum(p.stat().st_size for p in DIST.rglob("*")) / 1024
    print(f"dist/ — {len(files)} pages, {weight:.0f} KB total")
    for f in files:
        print(f"  {f:34s} {(DIST / f).stat().st_size / 1024:6.0f} KB")


if __name__ == "__main__":
    main()
