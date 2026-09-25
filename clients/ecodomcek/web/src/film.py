#!/usr/bin/env python3
"""renders/fal/hero.mp4 → the web film the hero plays.

    python3 src/film.py      → renders/film/hero{,-720}.{mp4,webm}, hero-first.webp, hero-last.webp

Three things the raw Kling film cannot do on the page by itself:

1. Its ground is not the page's paper. Measured: the page is #f3eee3
   (243,238,227), the film drifts between (241,237,225) and (248,243,231),
   and not evenly — the middle of a frame runs lighter than its border.
   Every frame gets a smooth per-region gain map (its own paper measured
   in a 24×18 grid, filled across the house, eased over time) onto the
   paper; what is then within a few levels of paper is keyed to it exactly
   (flat fields don't blotch under compression); the outer edge is
   feathered into exact paper.
2. It is framed 16:9 around the house; the hero slot is the 1500×1119
   layer canvas. The crop is the exact inverse of how
   `start-exploded.jpg` was composed (scale 1080·0.92/1119, centred,
   +20 px), so the film sits where the layers sat.
3. 10.7 MB. H.264 (with a short keyframe interval, so a scrub back stays
   smooth) and VP9, both a fraction of that.
"""
from __future__ import annotations

import pathlib
import subprocess
import tempfile
import warnings

import numpy as np
from PIL import Image

ROOT = pathlib.Path(__file__).parent.parent
RAW = ROOT / "renders" / "fal" / "hero.mp4"
OUT = ROOT / "renders" / "film"
PAPER = np.array([243, 238, 227], dtype=np.float32)
SIZES = {"": 1200, "-720": 720, "-2k": 2000}     # desktop; phones; big and retina screens
# the crop is ~1330 px wide in the raw film: 2000 is Lanczos + a light
# unsharp mask — still sharper than a browser stretching 720 or 1200
SHARPEN = {"-2k": ",unsharp=5:5:0.55:5:5:0.0"}

try:
    import imageio_ffmpeg
    FF = imageio_ffmpeg.get_ffmpeg_exe()
except ImportError:                              # pragma: no cover
    FF = "ffmpeg"


def crop_box() -> tuple[int, int, int, int]:
    s = 1080 * .92 / 1119
    w, h = round(1500 * s), round(1119 * s)
    x, y = (1920 - w) // 2, (1080 - h) // 2 + 20
    return x, y, w, h


def feather(w: int, h: int, edge: float = .07) -> np.ndarray:
    """1 inside, 0 at the border, smooth — the film melts into the paper."""
    def ramp(n):
        t = np.minimum(np.arange(n), np.arange(n)[::-1]) / (n * edge)
        t = np.clip(t, 0, 1)
        return t * t * (3 - 2 * t)
    return np.outer(ramp(h), ramp(w))[..., None].astype(np.float32)


def ground_grid(a: np.ndarray, gw: int = 24, gh: int = 18) -> np.ndarray:
    """The frame's own paper, measured in a coarse grid: in each cell the
    mean of the pixels that ARE paper (near the border ground, low chroma).
    Cells the house covers are filled from their neighbours. A single gain
    from the border (the old way) left the middle of the frame 2 levels
    lighter than the page — invisible at 600 px, a box at 780 px."""
    h, w, _ = a.shape
    b = np.concatenate([a[:24].reshape(-1, 3), a[-24:].reshape(-1, 3),
                        a[:, :24].reshape(-1, 3), a[:, -24:].reshape(-1, 3)])
    ref = np.median(b, axis=0)
    paper = (np.abs(a - ref).max(axis=2) < 14) & ((a.max(axis=2) - a.min(axis=2)) < 26)
    g = np.full((gh, gw, 3), np.nan, dtype=np.float32)
    ys, xs = np.linspace(0, h, gh + 1).astype(int), np.linspace(0, w, gw + 1).astype(int)
    for j in range(gh):
        for i in range(gw):
            m = paper[ys[j]:ys[j + 1], xs[i]:xs[i + 1]]
            if m.mean() > .25:
                g[j, i] = a[ys[j]:ys[j + 1], xs[i]:xs[i + 1]][m].mean(axis=0)
    for _ in range(64):                                    # fill the house's cells inward
        holes = np.isnan(g[..., 0])
        if not holes.any():
            break
        pad = np.pad(g, ((1, 1), (1, 1), (0, 0)), constant_values=np.nan)
        nb = np.stack([pad[:-2, 1:-1], pad[2:, 1:-1], pad[1:-1, :-2], pad[1:-1, 2:]])
        with np.errstate(all="ignore"), warnings.catch_warnings():
            warnings.simplefilter("ignore")
            fill = np.nanmean(nb, axis=0)
        g[holes] = fill[holes]
    g = np.where(np.isnan(g), ref, g)
    k = np.pad(g, ((1, 1), (1, 1), (0, 0)), mode="edge")        # 3×3 smoothing
    return sum(k[dy:dy + gh, dx:dx + gw] for dy in range(3) for dx in range(3)) / 9


def upsample(g: np.ndarray, w: int, h: int) -> np.ndarray:
    return np.stack([np.asarray(Image.fromarray(g[..., c], mode="F").resize((w, h), Image.BILINEAR))
                     for c in range(3)], axis=2)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    x, y, w, h = crop_box()
    with tempfile.TemporaryDirectory() as tmp:
        t = pathlib.Path(tmp)
        subprocess.run([FF, "-loglevel", "error", "-i", str(RAW), "-vf", f"crop={w}:{h}:{x}:{y}",
                        str(t / "f%04d.png")], check=True)
        frames = sorted(t.glob("f*.png"))
        mask, grid = None, None
        for f in frames:
            a = np.asarray(Image.open(f).convert("RGB")).astype(np.float32)
            g = ground_grid(a)
            grid = g if grid is None else grid * .7 + g * .3      # smoothed in time: no flicker
            a = a * (PAPER / upsample(grid, a.shape[1], a.shape[0]))   # every region's ground → the page's paper
            # key the paper: within 5 levels of the page it IS the page, fading
            # out by 12 — the shadow and the house are untouched, and the
            # encoder gets a flat field instead of noise to turn into blotches
            d = np.abs(a - PAPER).max(axis=2, keepdims=True)
            k = np.clip((12 - d) / 7, 0, 1)
            a = a * (1 - k) + PAPER * k
            if mask is None:
                mask = feather(a.shape[1], a.shape[0])
            a = a * mask + PAPER * (1 - mask)
            Image.fromarray(np.clip(a, 0, 255).round().astype(np.uint8)).save(t / ("g" + f.name[1:]))
        for tag, wo in SIZES.items():
            ho = round(h * wo / w / 2) * 2
            vf = f"scale={wo}:{ho}:flags=lanczos" + SHARPEN.get(tag, "")
            src = str(t / "g%04d.png")
            if tag == "":
                for i, name in ((frames[0], "hero-first.webp"), (frames[-1], "hero-last.webp")):
                    Image.open(t / ("g" + i.name[1:])).resize((wo, ho), Image.LANCZOS).save(OUT / name, quality=84)
            subprocess.run([FF, "-loglevel", "error", "-y", "-framerate", "24", "-i", src, "-vf", vf,
                            "-c:v", "libx264", "-preset", "slow", "-crf", "21" if tag == "-2k" else "24", "-pix_fmt", "yuv420p",
                            "-g", "12", "-movflags", "+faststart", "-an", str(OUT / f"hero{tag}.mp4")], check=True)
            subprocess.run([FF, "-loglevel", "error", "-y", "-framerate", "24", "-i", src, "-vf", vf,
                            "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "30" if tag == "-2k" else "33", "-row-mt", "1", "-g", "12",
                            "-pix_fmt", "yuv420p", "-an", str(OUT / f"hero{tag}.webm")], check=True)
    for f in sorted(OUT.iterdir()):
        print(f"{f.name:18s} {f.stat().st_size / 1024:7.0f} KB")
    print(f"{len(frames)} frames")


if __name__ == "__main__":
    main()
