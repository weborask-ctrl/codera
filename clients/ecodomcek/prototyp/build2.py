#!/usr/bin/env python3
"""Assemble the EcoDomček page: the house as an object, taken apart by scroll.

Layout law: every image lives in a framed stage inside the page grid, with the
text beside it. Nothing is a background layer. The stage is `position: sticky`,
so it holds while its act plays and then releases — native scroll throughout.
"""
import base64, json, math, pathlib, sys

HERE = pathlib.Path(__file__).parent
REND = HERE.parent / "renders"
sys.path.insert(0, str(HERE))
import content as C  # noqa: E402


def b64(name):
    p = REND / name
    if not p.exists():
        sys.exit(f"missing render: {p}")
    return base64.b64encode(p.read_bytes()).decode("ascii")


def img_tag(name, cls, cap):
    return (f'<div class="stage-img {cls}" data-k="{cls}">'
            f'<img alt="" src="data:image/jpeg;base64,{b64(name)}">'
            f'<span class="stage-cap">{cap}</span></div>')


def parts_html(parts):
    """Numbered pins on the house. The names live in the legend beside it —
    the drawing convention, and it keeps long Slovak labels off the image."""
    out = []
    for x, y, ang, ln, num, lab in parts:
        out.append(f'<div class="part" data-p="{num}" style="left:{x*100:.2f}%;top:{y*100:.2f}%">'
                   f'<span class="pin"></span><span class="num">{num}</span></div>')
    return "".join(out)


def panel(step, idx, legend=None):
    o = [f'<div class="tag"><span class="dot"></span><span class="rule"></span>{step["tag"]}</div>']
    o.append(f'<{"h1" if step.get("big") else "h2"}>{step["h"]}</{"h1" if step.get("big") else "h2"}>')
    for para in step["p"]:
        o.append(f"<p>{para}</p>")
    if step.get("cta"):
        o.append('<div class="row"><a class="cta" href="#s1">Rozobrať dom '
                 '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>'
                 '<a class="link" href="tel:+421908704281">Zavolať 0908 704 281</a></div>')
    if legend:
        rows = "".join(f'<div><b>{n}</b><span>{t}</span></div>' for n, t in legend)
        o.append(f'<div class="legend">{rows}</div>')
    if step.get("layers"):
        rows = "".join(f'<div><b>{n}</b><span>{t}</span><i>[hrúbka]</i></div>' for n, t in C.LAYERS)
        o.append(f'<div class="layers">{rows}</div>')
        o.append('<p class="fine">Orientačná skladba — vrstvy, hrúbky a U-hodnotu potvrdí EcoDomček. Nič sa neodhaduje.</p>')
    if step.get("projects"):
        rows = "".join(f'<div><b>{y}</b><span>{t}</span></div>' for y, t in C.PROJECTS)
        o.append(f'<div class="proj">{rows}</div>')
    if step.get("contact"):
        o.append('<a class="phone" href="tel:+421908704281">0908 704 281</a>')
        o.append('<div class="fields">'
                 '<label>Meno<span></span></label>'
                 '<label>Telefón alebo e-mail<span></span></label>'
                 '<label class="wide">Čo staviame?<span></span></label></div>')
        o.append('<div class="row"><a class="cta" href="mailto:dobryden@ecodomcek.sk">Poslať dopyt '
                 '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>'
                 '<span class="fine">EcoDomček, s.r.o. · Lúčina 33 · IČO 50619616</span></div>')
    return f'<div class="step" id="s{idx}" data-step="{idx}"><div class="panel">{"".join(o)}</div></div>'


def main():
    steps_meta, html, idx = [], [], 0

    # ── ACT 1: one sticky stage, three images, parts revealed step by step ──
    a1 = C.ACT1
    stages = "".join(img_tag(s["file"], s["key"] + (" object" if s.get("object") else ""), s["cap"])
                     for s in a1["stages"])
    text = []
    for st in a1["steps"]:
        steps_meta.append(dict(stage=st["stage"], parts=[p[4] for p in st["parts"]],
                               theme="light", act=a1["id"]))
        legend = [(p[4], p[5]) for p in st["parts"]]
        text.append(panel(st, idx, legend)); idx += 1
    # every part that appears anywhere in the act is rendered once, then toggled
    all_parts = {}
    for st in a1["steps"]:
        for p in st["parts"]:
            all_parts[p[4]] = p
    html.append(
        f'<section class="act" id="act-{a1["id"]}">'
        f'<div class="col-text">{"".join(text)}</div>'
        f'<div class="col-stage"><div class="stage"><div class="stage-clip">{stages}</div>'
        f'<div class="parts">{parts_html(list(all_parts.values()))}</div>'
        f'</div></div></section>')

    # ── ACT 2: one stage per room, same grammar ────────────────────────────
    for b in C.ACT2:
        steps_meta.append(dict(stage=b["id"], parts=[], theme=b["theme"], act=b["id"]))
        cls = b["id"] + (" object" if b.get("object") else "") + " on"
        html.append(
            f'<section class="act" id="act-{b["id"]}">'
            f'<div class="col-text">{panel(b, idx)}</div>'
            f'<div class="col-stage"><div class="stage"><div class="stage-clip">{img_tag(b["file"], cls, b["cap"])}</div></div></div>'
            f'</section>')
        idx += 1

    tpl = (HERE / "template2.html").read_text()
    css = (HERE / "stage.css").read_text()
    out = (tpl.replace("/*STAGECSS*/", css)
              .replace("<!--ACTS-->", "\n".join(html))
              .replace("/*STEPS*/", json.dumps(steps_meta, ensure_ascii=False)))
    (HERE / "index2.html").write_text(out)
    print(f"wrote index2.html — {len(out)//1024} KB, {len(steps_meta)} steps")


if __name__ == "__main__":
    main()
