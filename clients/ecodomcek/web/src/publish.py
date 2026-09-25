#!/usr/bin/env python3
"""The one-file build → Codera's site: public/demos/ecodomcek/index.html

    python3 src/build.py && python3 src/bundle.py && python3 src/publish.py

Two things the copy on codera.sk carries that the client's own site will not:
- noindex: a concept on Codera's domain must not compete with ecodomcek.sk;
- the label "Koncept redizajnu · Codera" (CLAUDE.md #3: portfolio concepts
  stay labelled Koncept) — nobody may take it for EcoDomček's own site.
"""
import pathlib

ROOT = pathlib.Path(__file__).parent.parent
SRC = ROOT / "dist" / "ecodomcek.html"
OUT = ROOT.parent.parent.parent / "public" / "demos" / "ecodomcek" / "index.html"

ROBOTS = '<meta name="robots" content="noindex, nofollow">'
LABEL = ('<a class="cdr-koncept" href="https://www.codera.sk/" '
         'style="position:fixed;left:12px;bottom:12px;z-index:90;display:inline-flex;align-items:center;gap:8px;'
         'padding:7px 12px;border-radius:999px;background:#231f1a;color:#f3eee3;'
         'font:500 12px/1 \'IBM Plex Mono\',ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase;'
         'text-decoration:none;box-shadow:0 6px 18px -8px rgba(0,0,0,.5)">'
         'Koncept redizajnu · Codera</a>'
         '<style>body.nav-open .cdr-koncept{display:none!important}</style>')   # the open menu keeps its phone number there


def main() -> None:
    html = SRC.read_text(encoding="utf-8")
    assert '<meta charset="utf-8">' in html and "</body>" in html
    html = html.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n' + ROBOTS, 1)
    html = html.replace("</body>", LABEL + "\n</body>", 1)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(html, encoding="utf-8")
    print(f"{OUT.relative_to(ROOT.parent.parent.parent)}: {OUT.stat().st_size / 1024 / 1024:.1f} MB")


if __name__ == "__main__":
    main()
