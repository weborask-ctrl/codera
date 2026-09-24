#!/usr/bin/env python3
"""The hero assembly as a film, generated on fal.ai.

    FAL_KEY=… python3 src/fal_hero.py close     # 1 edit  → renders/fal/end-closed.jpg
    FAL_KEY=… python3 src/fal_hero.py check     # free    → does the edit keep the camera?
    FAL_KEY=… python3 src/fal_hero.py film      # 1 video → renders/fal/hero.mp4

Why two steps. The last Higgsfield try (MiniMax H3) failed because its end
frame could not seat: the four layers are cut out of an EXPLODED render,
so even composited at their landing drops the floors still float. A video
model has nothing to snap to. So first an image edit closes the house in
the same camera, then `check` measures it against the start frame (the
foundation slab does not move, so it is the anchor), and only a frame that
passes goes to the video model — one paid job each, never a batch.

Start frame `renders/fal/start-exploded.jpg` is composited from the same
alpha layers the site uses (`lyr-*.webp`, `layers2.json`), so the film's
first frame and the live DOM share pixels.

The edit model is Nano Banana Pro. FLUX Kontext Pro was tried first
(2026-09-24) and failed: it left every level floating and re-rendered the
house from a flatter camera (`renders/fal/close-1-kontext-pro-FAIL.jpg`).
An edit model answers in its own 16:9 size, not 1920×1080, so `close`
resizes the frame to the start frame's size before anything measures or
films it. A start and end frame that differ in size cannot be one shot.
"""
from __future__ import annotations

import base64
import io
import json
import os
import pathlib
import sys
import time
import urllib.request

import numpy as np
from PIL import Image

ROOT = pathlib.Path(__file__).parent.parent
OUT = ROOT / "renders" / "fal"
START = OUT / "start-exploded.jpg"
CLOSED = OUT / "end-closed.jpg"
FILM = OUT / "hero.mp4"

EDIT = "fal-ai/nano-banana-pro/edit"
VIDEO = "fal-ai/kling-video/v3/pro/image-to-video"

EDIT_PROMPT = (
    "Assemble this exploded view of a two-storey timber house into the finished house. "
    "The concrete foundation slab at the bottom stays exactly where it is. Move the ground floor "
    "(with its dark annex), the upper floor and the flat roof straight down (vertical movement "
    "only, no rotation, no scaling) until each part rests directly on the part below it: the "
    "ground floor stands on the slab, the upper floor stands on the ground-floor walls, the roof "
    "sits on the upper-floor walls. No gaps remain between the levels, so no room is visible "
    "from above any more; the roof and the annex's own flat roof are the only top surfaces. "
    "Keep exactly the same camera, viewing angle, perspective, framing and scale, the same "
    "materials (vertical larch cladding, dark Fundermax panels, dark flat roofs, concrete slab), "
    "the same soft studio light and the same plain cream background. Add nothing: no people, "
    "no text, no plants, no ground."
)
FILM_PROMPT = (
    "Static camera, no camera movement. The floating parts of a timber house descend straight "
    "down in order — ground floor, upper floor, roof — and settle precisely onto each other "
    "with a soft, weighty landing. Nothing else moves, no new objects, cream studio background."
)


def key() -> str:
    k = os.environ.get("FAL_KEY")
    if not k:
        sys.exit("FAL_KEY is not set — add it to the environment's settings, not to the chat.")
    return k


def data_uri(p: pathlib.Path) -> str:
    return "data:image/jpeg;base64," + base64.b64encode(p.read_bytes()).decode("ascii")


def call(endpoint: str, payload: dict) -> dict:
    """fal queue API: submit, poll, fetch. Blocking; one job."""
    hdr = {"Authorization": f"Key {key()}", "Content-Type": "application/json"}
    req = urllib.request.Request(f"https://queue.fal.run/{endpoint}", json.dumps(payload).encode(), hdr)
    job = json.load(urllib.request.urlopen(req))
    print("submitted", job.get("request_id"))
    while True:
        st = json.load(urllib.request.urlopen(urllib.request.Request(job["status_url"], headers=hdr)))
        if st.get("status") == "COMPLETED":
            break
        if st.get("status") not in ("IN_QUEUE", "IN_PROGRESS"):
            sys.exit(f"job failed: {st}")
        time.sleep(4)
    return json.load(urllib.request.urlopen(urllib.request.Request(job["response_url"], headers=hdr)))


def fetch(url: str, to: pathlib.Path) -> None:
    to.write_bytes(urllib.request.urlopen(url).read())
    print("saved", to.relative_to(ROOT))


def fetch_frame(url: str, to: pathlib.Path) -> None:
    """Save an edited frame at the start frame's exact size."""
    im = Image.open(io.BytesIO(urllib.request.urlopen(url).read())).convert("RGB")
    size = Image.open(START).size
    print("model frame", im.size, "→", size)
    im.resize(size, Image.LANCZOS).save(to, quality=92)
    print("saved", to.relative_to(ROOT))


def mask(p: pathlib.Path) -> np.ndarray:
    a = np.asarray(Image.open(p).convert("RGB").resize((960, 540))).astype(int)
    paper = np.array([243, 238, 227])
    return np.abs(a - paper).sum(axis=2) > 36


def check() -> bool:
    """Same camera? The slab rows (bottom of the silhouette) must line up and
    the house must keep its width; the closed house must be shorter."""
    if not CLOSED.exists():
        print("no end frame yet — run `close` first"); return False
    s, e = mask(START), mask(CLOSED)
    def box(m):
        ys, xs = np.where(m)
        return xs.min(), xs.max(), ys.min(), ys.max()
    sx0, sx1, sy0, sy1 = box(s)
    ex0, ex1, ey0, ey1 = box(e)
    ok = (abs(sy1 - ey1) <= 6 and abs((sx1 - sx0) - (ex1 - ex0)) <= 24
          and abs(sx0 - ex0) <= 18 and ey0 > sy0 + 20)
    print(f"start box x {sx0}-{sx1} y {sy0}-{sy1} | closed box x {ex0}-{ex1} y {ey0}-{ey1} | "
          f"{'PASS' if ok else 'FAIL — the edit moved the camera; do not film it'}")
    return ok


def main() -> None:
    step = sys.argv[1] if len(sys.argv) > 1 else ""
    if step == "close":
        # 2K costs the same as 1K and is downscaled to 1920×1080, never up
        r = call(EDIT, {"prompt": EDIT_PROMPT, "image_urls": [data_uri(START)], "num_images": 1,
                        "aspect_ratio": "16:9", "resolution": "2K", "output_format": "png"})
        if r.get("description"):
            print("model says:", r["description"])
        if not r.get("images"):
            sys.exit(f"no image in the answer: {r}")
        fetch_frame(r["images"][0]["url"], CLOSED)
        check()
    elif step == "check":
        check()
    elif step == "film":
        if not CLOSED.exists() or not check():
            sys.exit("no approved end frame — run `close` and pass `check` first")
        r = call(VIDEO, {"prompt": FILM_PROMPT, "start_image_url": data_uri(START),
                         "end_image_url": data_uri(CLOSED), "duration": "5",
                         "generate_audio": False,
                         "negative_prompt": "camera movement, zoom, new objects, people, text"})
        fetch(r["video"]["url"], FILM)
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main()
