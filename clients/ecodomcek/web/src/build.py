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
    "lyr-base.webp", "lyr-ground.webp", "lyr-upper.webp", "lyr-roof.webp",
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


def eyebrow(text: str) -> str:
    return f'<div class="eyebrow fade">{text}</div>' if text else ""


def kota(text: str) -> str:
    """A dimension-line label: a moss rule, then mono uppercase."""
    return f'<div class="kota fade">{text}</div>' if text else ""


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
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="website">
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
         band: str = "paper", first: str = "") -> None:
    out = SHELL.format(title=esc(title), desc=esc(desc), page=page_id, band=band,
                       header=header(file), footer=footer(), body=body,
                       first=esc(first or title))
    (DIST / file).write_text(out, encoding="utf-8")


# ── assets pipeline ───────────────────────────────────────────────────────
def copy_assets() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    for name in IMAGES:
        src = REND / name
        if not src.exists():
            sys.exit(f"missing render: {src}")
        shutil.copy2(src, ASSETS / name)
    for t in PHOTOS:
        src = REND / "photos" / f"{t}.jpg"
        if not src.exists():
            sys.exit(f"missing photo: {src}")
        shutil.copy2(src, ASSETS / f"foto-{t}.jpg")
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
    files = sorted(p.name for p in DIST.glob("*.html"))
    weight = sum(p.stat().st_size for p in DIST.rglob("*")) / 1024
    print(f"dist/ — {len(files)} pages, {weight:.0f} KB total")
    for f in files:
        print(f"  {f:34s} {(DIST / f).stat().st_size / 1024:6.0f} KB")


if __name__ == "__main__":
    main()
