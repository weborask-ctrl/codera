#!/usr/bin/env python3
"""The wall in section, in its materials → renders/sec-l.webp, renders/sec-s.webp

    python3 src/section.py

The „Stena dýcha" stage on technologia.html paints this image under the
vapour and the flags. It is a vertical cut through the seven layers seen
straight on, outside on the left, the room on the right, lit low-key so
the vapour (light) reads over it (lusion.md: the object as the exhibit on
a dark stage; igloo.md: the annotation lies over it).

Procedural on purpose — no image model: every band edge sits exactly where
VBANDS in pages.py puts it, so a hovered layer lights precisely its own
material. Widths are schematic; the client confirms real thicknesses.
It is a visualisation and is labelled as a principle on the page.

Two crops: sec-l (wide, for the 21:9 stage) and sec-s (tall, for the
square and 4:5 stages). Deterministic (fixed seed).
"""
import pathlib

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = pathlib.Path(__file__).parent.parent
OUT = ROOT / "renders"
W, H = 1800, 2200
# must match VBANDS in pages.py (outside → inside)
BANDS = [1.15, .85, 1.3, 4.1, .3, 1.35, .55]
rng = np.random.default_rng(2007)


def noise(w, h, scale, octaves=4, sx=1.0, sy=1.0):
    """Fractal value noise in 0..1; sx/sy stretch it (fibres, grain)."""
    out = np.zeros((h, w), np.float32)
    amp, tot = 1.0, 0.0
    for o in range(octaves):
        gw = max(2, int(w / scale * sx * 2 ** o))
        gh = max(2, int(h / scale * sy * 2 ** o))
        g = Image.fromarray((rng.random((gh, gw)) * 255).astype(np.uint8))
        out += np.asarray(g.resize((w, h), Image.BICUBIC), np.float32) / 255 * amp
        tot += amp
        amp *= .5
    return out / tot


def rgb(hexs):
    return np.array([int(hexs[i:i + 2], 16) for i in (1, 3, 5)], np.float32) / 255


def paint(mask, base, var, tex):
    """base colour × texture into the canvas where mask is set."""
    col = base[None, None, :] * (1 - var + 2 * var * tex[..., None])
    img[mask] = col[mask]


def smooth(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def endgrain(xs, ys, px, py, spacing, early, late):
    """Timber cut across: growth rings around a pith (px, py) — light
    earlywood darkening into a thin latewood line, then an abrupt start of
    the next year; fine pores and rays. Returns RGB for the grid xs, ys."""
    h, w = xs.shape
    warp = (noise(w, h, 90, 2) - .5) * spacing * 1.4
    r = np.hypot(xs - px, (ys - py) * .92) + warp
    f = (r / spacing) % 1
    lw = smooth(.55, .9, f) * (1 - smooth(.965, 1, f))
    pores = noise(w, h, 1.6, 1)
    ang = np.arctan2(ys - py, xs - px)
    rays = np.clip((np.sin(ang * 900 + noise(w, h, 40, 1) * 3) - .96) * 25, 0, 1)
    t = lw[..., None]
    col = early[None, None, :] * (1 - t) + late[None, None, :] * t
    col *= (.9 + .18 * pores)[..., None] * (1 - .08 * rays)[..., None]
    col *= (.92 + .16 * noise(w, h, 70, 2))[..., None]
    return col


img = np.zeros((H, W, 3), np.float32)
edges = np.concatenate([[0], np.cumsum(BANDS) / sum(BANDS) * W]).round().astype(int)
X, Y = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
air = rgb('#16140f')
img[:] = air

# ── 1 larch rhombus boards, cut: end grain in slanted parallelograms ─────
x0, x1 = edges[0], edges[1]
bw, hb, sl, jt = x1 - x0 - 10, 440, 70, 18            # thickness, height, slant, open joint
xs, ys = X[:, x0:x1], Y[:, x0:x1]
for k in range(-1, H // (hb + jt) + 2):
    top = k * (hb + jt)
    u = (xs - x0 - 5) / bw                            # 0 outside face → 1 inside face
    yt = top + sl * (1 - u)                           # top edge slopes down to the outside
    m = (u >= 0) & (u <= 1) & (ys >= yt) & (ys <= yt + hb)
    px = x0 + bw * rng.uniform(-.2, 1.2)
    py = top + hb * rng.choice([-1.6, 2.6]) + rng.uniform(-60, 60)
    col = endgrain(xs, ys, px, py, rng.uniform(15, 22), rgb('#c89462'), rgb('#7a4a26'))
    v = np.clip((ys - yt) / hb, 0, 1)                 # light from above: the lower part falls away
    col *= (1.06 - .22 * v)[..., None]
    col += .16 * np.clip(1 - (ys - yt) / 4, 0, 1)[..., None]      # the arris catches the light
    sub = img[:, x0:x1]
    sub[m] = col[m]

# ── 2 ventilated gap: dark air, a counter-batten behind it ───────────────
x0, x1 = edges[1], edges[2]
m = (X >= x0) & (X < x1)
bt = (X >= x0 + (x1 - x0) * .28) & (X < x1 - (x1 - x0) * .28)
grain = noise(W, H, 30, 3, sx=4, sy=.25)
paint(bt, rgb('#6d4c2c'), .35, grain)                # batten seen behind, in shade
img[m & ~bt] = air * (.8 + .25 * noise(W, H, 200, 2)[m & ~bt][:, None])

# ── 3 wood-fibre board: dense, fine, warm brown ──────────────────────────
x0, x1 = edges[2], edges[3]
m = (X >= x0) & (X < x1)
fib = noise(W, H, 2.2, 2) * .5 + noise(W, H, 14, 3, sx=.35, sy=2.6) * .35 + noise(W, H, 80, 2) * .15
paint(m, rgb('#8c6139'), .42, fib)

# ── 4 frame + insulation: loose wood-fibre batt between the studs ─────────
x0, x1 = edges[3], edges[4]
layer = Image.new('L', (x1 - x0, H), 0)
d = ImageDraw.Draw(layer)
for _ in range(52000):                                # fibres, mostly across the wall
    cx, cy = rng.uniform(0, x1 - x0), rng.uniform(0, H)
    a = rng.normal(0, .55)
    ln = rng.uniform(10, 46)
    bend = rng.normal(0, 6)
    pts = [(cx, cy), (cx + np.cos(a) * ln * .5, cy + np.sin(a) * ln * .5 + bend),
           (cx + np.cos(a) * ln, cy + np.sin(a) * ln)]
    d.line(pts, fill=int(rng.uniform(90, 255)), width=1)
fibres = np.asarray(layer.filter(ImageFilter.GaussianBlur(.6)), np.float32) / 255
loft = noise(x1 - x0, H, 60, 3)                       # clumps and hollows in the batt
tex = .34 + .62 * fibres * (.8 + .35 * loft) + .08 * loft
col = rgb('#a47d50')[None, None, :] * (.45 + .75 * tex[..., None])
img[:, x0:x1] = col

# ── 5 vapour brake: a thin film, a little wavy, catching light ───────────
x0, x1 = edges[4], edges[5]
xc = (x0 + x1) / 2 + 3 * np.sin(Y[:, 0] / 90) + 2 * np.sin(Y[:, 0] / 23)
dist = np.abs(X - xc[:, None])
film = np.clip(1 - dist / 3.2, 0, 1)
sheen = .6 + .4 * noise(W, H, 120, 2, sx=.2, sy=3)
m = (X >= x0) & (X < x1)
img[m] = img[m] * (1 - film[m][:, None]) + (rgb('#d9d2c2') * sheen[m][:, None]) * film[m][:, None]

# ── 6 service cavity: battens cut (end grain), a conduit, a cable ────────
x0, x1 = edges[5], edges[6]
bw, bh, step = x1 - x0 - 8, 150, 620
xs, ys = X[:, x0:x1], Y[:, x0:x1]
sub = img[:, x0:x1]
for k in range(-1, H // step + 2):
    top = k * step + 180
    m = (xs >= x0 + 4) & (xs < x1 - 4) & (ys >= top) & (ys < top + bh)
    px, py = x0 + bw * rng.uniform(-.6, 1.6), top + bh * rng.choice([-1.4, 2.4])
    col = endgrain(xs, ys, px, py, rng.uniform(11, 16), rgb('#d2ad7c'), rgb('#9b7040'))
    col *= (1.08 - .25 * np.clip((ys - top) / bh, 0, 1))[..., None]
    col += .14 * np.clip(1 - (ys - top) / 4, 0, 1)[..., None]
    sub[m] = col[m]
    # a grey corrugated conduit in the gap below it, a cable inside
    cy, cx, rr = top + bh + 230, x0 + (x1 - x0) * .42, 34
    d_ = np.hypot(xs - cx, ys - cy)
    ring = (d_ < rr) & (d_ > rr - 7)
    lit = .7 + .3 * np.cos(np.arctan2(ys - cy, xs - cx) + 2.3)
    sub[ring] = (rgb('#8d8a84')[None, None, :] * lit[..., None])[ring]
    sub[d_ < 12] = rgb('#26221e')

# ── 7 gypsum board: porous off-white core between paper faces, paint ─────
x0, x1 = edges[6], edges[7]
m = (X >= x0) & (X < x1)
por = noise(W, H, 2.5, 2) * .6 + noise(W, H, 18, 2) * .4
paint(m, rgb('#d8d3c7'), .16, por)
for xf, c in ((x0 + 3, '#b9b19f'), (x1 - 6, '#b9b19f'), (x1 - 3, '#f4f1ea')):
    img[:, int(xf):int(xf) + 3] = rgb(c)

# ── relief: the texture itself as a height map, lit from the upper left ─
lum = img.mean(axis=2)
hgt = np.asarray(Image.fromarray((lum * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2)),
                 np.float32) / 255
gy, gx = np.gradient(hgt)
bump = np.clip(1 + 3.5 * (-gx * .6 - gy * .8), .8, 1.2)
only = np.zeros(W, bool)                              # the pressed boards only: wood fibre and gypsum
only[edges[2]:edges[3]] = only[edges[6]:edges[7]] = True
img[:, only] *= bump[:, only][..., None]

# ── shared light: interfaces in shadow, the room warms its side ──────────
ao = np.ones(W, np.float32)
for e in edges[1:-1]:
    ao *= 1 - .38 * np.exp(-((np.arange(W) - e) / 9) ** 2)
img *= ao[None, :, None]
t = np.linspace(0, 1, W, dtype=np.float32)[None, :, None]
cool, warm = np.array([.86, .90, .95], np.float32), np.array([1.05, .93, .78], np.float32)
img *= (cool * (1 - t) + warm * t) * (.70 + .26 * t)   # low key; brighter toward the lamp-lit room
img *= .93 + .1 * noise(W, H, 400, 2)[..., None]         # uneven studio light, never flat
out = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8))

OUT.mkdir(exist_ok=True)
wide = out.crop((0, (H - 1100) // 2, W, (H - 1100) // 2 + 1100))
wide.save(OUT / "sec-l.webp", quality=80, method=6)
out.resize((900, 1100), Image.LANCZOS).save(OUT / "sec-s.webp", quality=80, method=6)
for f in ("sec-l.webp", "sec-s.webp"):
    print(f, (OUT / f).stat().st_size // 1024, "KB")
