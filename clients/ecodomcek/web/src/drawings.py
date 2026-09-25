"""Pen drawings of the visualisations (client, 2026-09-25: "not like every
AI-generated site"). A photoreal render reads as stock; the same house as
an ink drawing reads as the draftsman's sheet — the language the hero film
already opens with (renders/ink.py).

The line is XDoG (a difference of two Gaussian blurs, thresholded): where
the image is darker than its surroundings the pen goes down. It is run only
on objects standing on plain paper — the cut-away and the exploded house;
scenes with foliage turn to noise and stay what they are.

    python3 src/drawings.py      → renders/draw-<name>.jpg (the build copies them)
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
REN = ROOT / "renders"
PAPER, INK = (243, 238, 227), (35, 31, 26)
# output name: (render, crop box or None)
JOBS = {
    "draw-rez": ("rez", None),
    "draw-explod": ("explod", None),
    "draw-rezin": ("rez", (300, 300, 1260, 900)),   # the finished rooms of the cut-away
}


def pen(im, sigma=1.1, eps=1.2, bg_threshold=14):
    L = im.convert("L")
    g1 = np.array(L.filter(ImageFilter.GaussianBlur(sigma)), float)
    g2 = np.array(L.filter(ImageFilter.GaussianBlur(sigma * 1.6)), float)
    ink = (g1 - .985 * g2) < -eps
    a = np.array(im, float)
    edge = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    far = np.sqrt(((a - np.median(edge, axis=0)) ** 2).sum(-1)) > bg_threshold   # off the paper
    obj = Image.fromarray((far * 255).astype("uint8")).filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.MinFilter(9))
    ink &= np.array(obj) > 0
    ink = np.array(Image.fromarray(np.where(ink, 0, 255).astype("uint8")).filter(ImageFilter.MedianFilter(3))) < 128
    out = np.zeros(ink.shape + (3,), "uint8")
    out[:] = PAPER
    out[ink] = INK
    return Image.fromarray(out)


if __name__ == "__main__":
    for name, (src, box) in JOBS.items():
        im = pen(Image.open(REN / f"{src}.jpg").convert("RGB"))
        if box:
            im = im.crop(box)
        im.save(REN / f"{name}.jpg", quality=90)
        print(name, im.size)
