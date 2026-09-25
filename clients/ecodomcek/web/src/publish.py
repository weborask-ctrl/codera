#!/usr/bin/env python3
"""The built site → Codera's site: public/demos/ecodomcek/

    python3 src/build.py && python3 src/publish.py

Served at ecodomcek.codera.sk (proxy.ts maps every path there) and at
www.codera.sk/demos/ecodomcek/. The multi-page build, not the one-file
bundle: each screen fetches the film at the size it draws it (the bundle
carries only the 720 px film — stretched 1.4–2.4× on big screens) and
pages load their own images instead of 5 MB at once.

Every page gets two things the client's own site will not carry:
- noindex: a concept on Codera's domain must not compete with ecodomcek.sk;
- the label "Koncept redizajnu · Codera" (CLAUDE.md #3: portfolio concepts
  stay labelled Koncept), hidden while the menu panel is open.
"""
import pathlib
import re
import shutil

ROOT = pathlib.Path(__file__).parent.parent
DIST = ROOT / "dist"
OUT = ROOT.parent.parent.parent / "public" / "demos" / "ecodomcek"
SKIP = {"ecodomcek.html", "artifact-index.html"}             # the bundle stays a file:// deliverable

ROBOTS = '<meta name="robots" content="noindex, nofollow">'
LABEL = ('<a class="cdr-koncept" href="https://www.codera.sk/" '
         'style="position:fixed;left:12px;bottom:12px;z-index:90;display:inline-flex;align-items:center;gap:8px;'
         'padding:7px 12px;border-radius:999px;background:#231f1a;color:#f3eee3;'
         'font:500 12px/1 \'IBM Plex Mono\',ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase;'
         'text-decoration:none;box-shadow:0 6px 18px -8px rgba(0,0,0,.5)">'
         'Koncept redizajnu · Codera</a>'
         '<style>body.nav-open .cdr-koncept{display:none!important}</style>')


def main() -> None:
    if OUT.exists():
        shutil.rmtree(OUT)
    # only what a page, the stylesheet or the script names — the build keeps
    # JPEG twins and unused renders around for share cards and the bundle
    texts = [f.read_text(encoding="utf-8") for f in DIST.glob("*.html") if f.name not in SKIP]
    texts += [(DIST / "assets" / n).read_text(encoding="utf-8") for n in ("site.css", "site.js")]
    named = set()
    for t in texts:
        named |= set(re.findall(r"assets/([A-Za-z0-9_.\-]+)", t))
        named |= set(re.findall(r"url\(([A-Za-z0-9_.\-]+\.woff2)\)", t))
    (OUT / "assets").mkdir(parents=True)
    for a in (DIST / "assets").iterdir():
        film = a.name.startswith("hero")                 # site.js picks hero{,-720,-2k}.{webm,mp4} at run time
        if a.name in named or film:
            shutil.copy2(a, OUT / "assets" / a.name)
    pages = 0
    for f in sorted(DIST.glob("*.html")):
        if f.name in SKIP:
            continue
        html = f.read_text(encoding="utf-8")
        assert '<meta charset="utf-8">' in html and "</body>" in html, f.name
        if 'name="robots"' not in html:
            html = html.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n' + ROBOTS, 1)
        html = html.replace("</body>", LABEL + "\n</body>", 1)
        (OUT / f.name).write_text(html, encoding="utf-8")
        pages += 1
    size = sum(p.stat().st_size for p in OUT.rglob("*") if p.is_file()) / 1024 / 1024
    print(f"public/demos/ecodomcek/: {pages} pages + assets, {size:.1f} MB")


if __name__ == "__main__":
    main()
