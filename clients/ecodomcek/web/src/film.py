#!/usr/bin/env python3
"""renders/fal/hero.mp4 → the web film the hero plays.

    python3 src/film.py      → renders/film/hero{,-720}.{mp4,webm}, hero-first.webp, hero-last.webp

Three things the raw Kling film cannot do on the page by itself:

1. Its ground is not the page's paper. Measured: the page is #f3eee3
   (243,238,227), the film drifts between (241,237,225) and (248,243,231)
   — a visible lighter box mid-film. Every frame gets a per-channel gain
   that maps its own ground (median of the border) onto the paper, and the
   outer edge is feathered into exact paper, so there is no box at all.
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

import numpy as np
from PIL import Image

ROOT = pathlib.Path(__file__).parent.parent
RAW = ROOT / "renders" / "fal" / "hero.mp4"
OUT = ROOT / "renders" / "film"
PAPER = np.array([243, 238, 227], dtype=np.float32)
SIZES = {"": 1200, "-720": 720}                  # desktop ≈ 2× the slot; phones get 720

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


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    x, y, w, h = crop_box()
    with tempfile.TemporaryDirectory() as tmp:
        t = pathlib.Path(tmp)
        subprocess.run([FF, "-loglevel", "error", "-i", str(RAW), "-vf", f"crop={w}:{h}:{x}:{y}",
                        str(t / "f%04d.png")], check=True)
        frames = sorted(t.glob("f*.png"))
        mask = None
        for f in frames:
            a = np.asarray(Image.open(f).convert("RGB")).astype(np.float32)
            b = np.concatenate([a[:24].reshape(-1, 3), a[-24:].reshape(-1, 3),
                                a[:, :24].reshape(-1, 3), a[:, -24:].reshape(-1, 3)])
            ground = np.median(b, axis=0)
            a = a * (PAPER / ground)                   # the frame's ground → the page's paper
            if mask is None:
                mask = feather(a.shape[1], a.shape[0])
            a = a * mask + PAPER * (1 - mask)
            Image.fromarray(np.clip(a, 0, 255).round().astype(np.uint8)).save(t / ("g" + f.name[1:]))
        for tag, wo in SIZES.items():
            ho = round(h * wo / w / 2) * 2
            vf = f"scale={wo}:{ho}:flags=lanczos"
            src = str(t / "g%04d.png")
            if tag == "":
                for i, name in ((frames[0], "hero-first.webp"), (frames[-1], "hero-last.webp")):
                    Image.open(t / ("g" + i.name[1:])).resize((wo, ho), Image.LANCZOS).save(OUT / name, quality=84)
            subprocess.run([FF, "-loglevel", "error", "-y", "-framerate", "24", "-i", src, "-vf", vf,
                            "-c:v", "libx264", "-preset", "slow", "-crf", "24", "-pix_fmt", "yuv420p",
                            "-g", "12", "-movflags", "+faststart", "-an", str(OUT / f"hero{tag}.mp4")], check=True)
            subprocess.run([FF, "-loglevel", "error", "-y", "-framerate", "24", "-i", src, "-vf", vf,
                            "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "36", "-row-mt", "1", "-g", "12",
                            "-pix_fmt", "yuv420p", "-an", str(OUT / f"hero{tag}.webm")], check=True)
    for f in sorted(OUT.iterdir()):
        print(f"{f.name:18s} {f.stat().st_size / 1024:7.0f} KB")
    print(f"{len(frames)} frames")


if __name__ == "__main__":
    main()
