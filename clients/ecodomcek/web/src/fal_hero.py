#!/usr/bin/env python3
"""The hero assembly as a film, generated on fal.ai.

    python3 src/fal_hero.py guide               # free    → renders/fal/guide-closed.jpg
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

The edit model is Nano Banana Pro, and it gets a guide, not the exploded
frame. FLUX Kontext Pro (try 1) left every level floating and re-rendered
the house from a flatter camera; Nano Banana Pro on the exploded frame
(try 2) closed the house but zoomed in 1.2× and redrew the slab. So `guide`
stacks the closed house from the same layers in the start frame's camera,
and the model only repairs the seams.
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
GUIDE = OUT / "guide-closed.jpg"
CLOSED = OUT / "end-closed.jpg"
FILM = OUT / "hero.mp4"

EDIT = "fal-ai/nano-banana-pro/edit"
VIDEO = "fal-ai/kling-video/v3/pro/image-to-video"

# Where the four layers sit in the start frame (scale from layers2.json px, top-left
# corner), found by matching each layer against start-exploded.jpg. SEAT is how far each
# one drops to rest on the one below: wall heights measured at the layer corners
# (roof 24, upper floor ~120, ground floor ~108, slab 24 px), front façades touching.
FIT = 0.8875
AT = {"base": (531, 761), "ground": (626, 507), "upper": (600, 266), "roof": (561, 95)}
SEAT = {"base": 0, "ground": 137, "upper": 137 + 179, "roof": 137 + 179 + 135}

EDIT_PROMPT = (
    "This is a rough photo-composite of a finished two-storey timber house, stacked from cut-out "
    "parts. Turn it into one clean, coherent architectural render of the same house. Fix only "
    "what the collage got wrong: the ground floor is cut open at the front like a section, so "
    "close it with its exterior walls (the same vertical larch cladding and large black-framed "
    "glazing as the rest of the ground floor) so that no interior room is visible; make every "
    "level sit cleanly on the one below; the dark annex stands on the slab. Keep everything "
    "else exactly as it is: the same position, size and outline of the house and of every part, "
    "the same camera, perspective and framing (the house stays low in the frame with the empty "
    "cream space above it), the same concrete slab, the same roof, windows, materials and soft "
    "studio light, and the same plain cream background. Do not zoom, do not re-centre, do not "
    "add shadows, people, plants, text or ground."
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


def guide() -> None:
    """The closed house stacked from the site's own layers, in the start frame's camera.
    The seams do not match (the layers come from an exploded AI render), so the edit
    model only cleans it up; position, scale and slab are already ours."""
    bg = Image.new("RGBA", Image.open(START).size, (242, 238, 227, 255))
    for name in ("base", "ground", "upper", "roof"):
        im = Image.open(ROOT / "renders" / f"lyr-{name}.webp").convert("RGBA")
        im = im.resize((round(im.width * FIT), round(im.height * FIT)), Image.LANCZOS)
        x, y = AT[name]
        bg.alpha_composite(im, (x, y + SEAT[name]))
    bg.convert("RGB").save(GUIDE, quality=92)
    print("saved", GUIDE.relative_to(ROOT))


def clear_above(p: pathlib.Path, margin: int = 16) -> None:
    """The closed house cannot reach higher than the guide's outline, so anything the
    model drew above it (try 3: a grey smudge where the roof used to float) is repainted
    with the frame's own background colour. Only empty background is touched."""
    g = np.asarray(Image.open(GUIDE).convert("RGB")).astype(int)
    solid = np.abs(g - np.array([242, 238, 227])).sum(axis=2) > 36
    top = np.where(solid.any(axis=1))[0].min() - margin
    im = np.asarray(Image.open(p).convert("RGB")).copy()
    bgc = np.median(np.concatenate([im[:40].reshape(-1, 3), im[:top, :60].reshape(-1, 3)]), axis=0)
    im[:top] = bgc.astype(np.uint8)
    Image.fromarray(im).save(p, quality=92)
    print("cleared above row", top, "with", bgc.astype(int).tolist())


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
    if step == "guide":
        guide()
    elif step == "close":
        guide()
        # 2K costs the same as 1K and is downscaled to 1920×1080, never up
        r = call(EDIT, {"prompt": EDIT_PROMPT, "image_urls": [data_uri(GUIDE)], "num_images": 1,
                        "aspect_ratio": "16:9", "resolution": "2K", "output_format": "png"})
        if r.get("description"):
            print("model says:", r["description"])
        if not r.get("images"):
            sys.exit(f"no image in the answer: {r}")
        fetch_frame(r["images"][0]["url"], CLOSED)
        clear_above(CLOSED)
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
