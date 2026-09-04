"""Assemble and render one EcoDomček board.

    python3 build.py --board hero --device desktop --quality preview
    python3 build.py --all --quality test

Writes clients/ecodomcek/boards/render/<board>-<device>.png and the matching
.anchors.json, which boards/index.html composites under the DOM layer
(capture.mjs --render).

Boards, their site and their light state come from spec.py; this file only
decides in which order the modules run and what each board hides or moves.
"""

import argparse
import math
import os
import sys
import time

import bpy

_HERE = os.path.dirname(os.path.abspath(__file__))
if _HERE not in sys.path:
    sys.path.insert(0, _HERE)

import cladding  # noqa: E402
import environment as env  # noqa: E402
import geometry  # noqa: E402
import interior  # noqa: E402
import materials  # noqa: E402
import spec  # noqa: E402

OUT_DIR = os.path.normpath(os.path.join(_HERE, "..", "boards", "render"))
BOARDS = list(spec.CAMERAS.keys())


def _lift_roof():
    """Dollhouse: the roof group floats above the walls so the plan reads."""
    d = spec.DOLLHOUSE_ROOF
    for ob in bpy.data.collections["roof"].objects:
        ob.location.x += d["dx"]
        ob.location.z += d["dz"]
        ob.rotation_euler.y = math.radians(d["rot_y_deg"])
    # the cladding of the roof edge travels with it
    for name in ("slats", "battens", "reveals"):
        for ob in bpy.data.collections[name].objects:
            if ob.location.z > spec.Z_TOP - 0.01 or (ob.get("row_z") or 0) > spec.Z_TOP:
                ob.location.x += d["dx"]
                ob.location.z += d["dz"]


def assemble(board, device, interior_on=True):
    """Build the whole scene for one board and leave it ready to render."""
    t0 = time.time()
    env.new_scene()
    anchors_extra = None

    if board == "xray":
        anchors_extra = env.build_xray(materials)
    else:
        house = geometry.build_house(materials)
        cladding.clad(house, materials)
        if interior_on:
            interior.furnish(house, materials)
            interior.set_pendant(spec.BOARD_LIGHT[board] in ("interior", "dusk"))
        env.build_site(materials, spec.BOARD_SITE[board])
        if board == "dollhouse":
            _lift_roof()

    env.set_light(spec.BOARD_LIGHT[board])
    env.set_camera(board, device)
    print(f"[build] {board}-{device} assembled in {time.time() - t0:.1f} s "
          f"({len(bpy.data.objects)} objects, {len(bpy.data.materials)} materials)")
    return anchors_extra


def run(board, device, quality, out_path=None, interior_on=True):
    out_path = out_path or os.path.join(OUT_DIR, f"{board}-{device}.png")
    extra = assemble(board, device, interior_on=interior_on)
    env.export_anchors(board, device, os.path.splitext(out_path)[0] + ".anchors.json", extra=extra)
    return env.render(board, device, quality, out_path)


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="render the EcoDomček art-direction boards with Cycles")
    ap.add_argument("--board", default=None, help="hero | living | xray | dollhouse | dusk")
    ap.add_argument("--device", default="desktop", choices=["desktop", "mobile"])
    ap.add_argument("--quality", default="test", choices=list(spec.QUALITY))
    ap.add_argument("--out", default=None, help="output PNG (default boards/render/<board>-<device>.png)")
    ap.add_argument("--all", action="store_true", help="render every board × device in spec.CAMERAS")
    ap.add_argument("--no-interior", action="store_true", help="skip furniture (faster geometry checks)")
    args = ap.parse_args()

    jobs = BOARDS if args.all else [(args.board or "hero", args.device)]
    total = 0.0
    for b, d in jobs:
        total += run(b, d, args.quality, args.out if not args.all else None, interior_on=not args.no_interior)
    print(f"[build] {len(jobs)} board(s) in {total:.1f} s of render time")
