"""Turn the Higgsfield camera-move clips into scroll-scrubbable frame sequences.

    python3 clients/ecodomcek/frames.py <clips.json>

`clips.json` maps a clip id to a local MP4 (or a URL). For each clip the
script writes `public/demos/ecodomcek/seq/<id>/000.webp … NNN.webp` — evenly
spaced frames, 1280 px wide, plus `poster.jpg` from the first frame — and
prints the frame count `components/concepts/ecodomcek.tsx` expects.

Why frames and not a <video> scrubbed with currentTime: seeking a normal MP4
is keyframe-bound and stutters under scroll; a frame sequence drawn onto a
canvas is immediate on every input, which is the non-negotiable of the
experience (no synthetic smoothing between the user's hand and the world).

Uses the static ffmpeg that ships with imageio-ffmpeg (`pip install
imageio-ffmpeg pillow`); no system ffmpeg is needed.
"""

import json
import os
import shutil
import subprocess
import sys
import tempfile
import urllib.request

import imageio_ffmpeg
from PIL import Image

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
OUT = os.path.join(ROOT, "public", "demos", "ecodomcek", "seq")
FRAMES = 48
WIDTH = 1280
WIDTH_PORTRAIT = 720  # a phone is never wider; 2K portrait frames at 1280 wide were 19 MB a clip
QUALITY = 74
QUALITY_PORTRAIT = 62  # phones fetch these on data; 48 frames must stay near 4 MB


def extract(clip_id: str, source: str) -> int:
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    work = tempfile.mkdtemp(prefix=f"eco-{clip_id}-")
    src = source
    if source.startswith("http"):
        src = os.path.join(work, "src.mp4")
        urllib.request.urlretrieve(source, src)
    # duration → evenly spaced sample times
    probe = subprocess.run(
        [ffmpeg, "-i", src], capture_output=True, text=True, check=False
    ).stderr
    dur = 0.0
    for line in probe.splitlines():
        if "Duration:" in line:
            h, m, s = line.split("Duration:")[1].split(",")[0].strip().split(":")
            dur = int(h) * 3600 + int(m) * 60 + float(s)
    if dur <= 0:
        raise SystemExit(f"{clip_id}: could not read duration from {source}")
    fps = FRAMES / dur
    raw = os.path.join(work, "f%03d.png")
    portrait = any(f"{w}x{h}" in probe and h > w for w, h in ((1088, 1920), (1080, 1920), (1152, 2048), (1440, 2560), (1536, 2752)))
    width = WIDTH_PORTRAIT if portrait or clip_id.endswith("-m") else WIDTH
    subprocess.run(
        [ffmpeg, "-y", "-loglevel", "error", "-i", src, "-vf", f"fps={fps:.6f},scale={width}:-2", "-frames:v", str(FRAMES), raw],
        check=True,
    )
    dst = os.path.join(OUT, clip_id)
    shutil.rmtree(dst, ignore_errors=True)
    os.makedirs(dst)
    n = 0
    for i in range(1, FRAMES + 1):
        p = raw % i
        if not os.path.exists(p):
            break
        im = Image.open(p).convert("RGB")
        im.save(os.path.join(dst, f"{i - 1:03d}.webp"), "WEBP", quality=QUALITY_PORTRAIT if width == WIDTH_PORTRAIT else QUALITY, method=6)
        if i == 1:
            im.save(os.path.join(dst, "poster.jpg"), quality=80, optimize=True, progressive=True)
        n += 1
    shutil.rmtree(work, ignore_errors=True)
    size = sum(os.path.getsize(os.path.join(dst, f)) for f in os.listdir(dst))
    print(f"{clip_id}: {n} frames, {size // 1024} KB → {dst}")
    return n


if __name__ == "__main__":
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    with open(sys.argv[1], encoding="utf-8") as f:
        clips = json.load(f)
    counts = {cid: extract(cid, src) for cid, src in clips.items()}
    print(json.dumps(counts))
