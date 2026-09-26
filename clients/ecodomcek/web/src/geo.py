#!/usr/bin/env python3
"""Slovakia's outline for the "where we built" map → renders/sk.json

    npm pack world-atlas@2.0.2 && tar xzf world-atlas-2.0.2.tgz
    python3 src/geo.py package/countries-10m.json

Natural Earth 1:10m (public domain, via world-atlas, ISC). The outline is
decoded from TopoJSON, projected equirectangular about 48.7° N (cos-scaled,
so a km is a km both ways at this latitude), simplified to ~0.4 km and
saved with the projection, so the build needs neither npm nor the 3.6 MB
file. Places are municipality centres — the page says "orientačne".
"""
from __future__ import annotations

import json
import math
import pathlib
import sys

ROOT = pathlib.Path(__file__).parent.parent
OUT = ROOT / "renders" / "sk.json"
LAT0 = 48.7
K = math.cos(math.radians(LAT0))


def decode(topo: dict, geom: dict) -> list[list[tuple[float, float]]]:
    sx, sy = topo["transform"]["scale"]
    tx, ty = topo["transform"]["translate"]

    def arc(i: int) -> list[tuple[float, float]]:
        a = topo["arcs"][i if i >= 0 else ~i]
        x = y = 0
        pts = []
        for dx, dy in a:
            x += dx; y += dy
            pts.append((x * sx + tx, y * sy + ty))
        return pts if i >= 0 else pts[::-1]

    polys = geom["arcs"] if geom["type"] == "MultiPolygon" else [geom["arcs"]]
    rings = []
    for poly in polys:
        ring = []
        for i in poly[0]:                        # outer ring only
            pts = arc(i)
            ring.extend(pts if not ring else pts[1:])
        rings.append(ring)
    return rings


def project(lon: float, lat: float) -> tuple[float, float]:
    return lon * K, -lat                         # degrees, y down


def rdp(pts, eps):
    if len(pts) < 3:
        return pts
    (x1, y1), (x2, y2) = pts[0], pts[-1]
    dx, dy = x2 - x1, y2 - y1
    n = math.hypot(dx, dy) or 1e-12
    dmax, idx = 0, 0
    for i, (x, y) in enumerate(pts[1:-1], 1):
        d = abs(dy * x - dx * y + x2 * y1 - y2 * x1) / n
        if d > dmax:
            dmax, idx = d, i
    if dmax <= eps:
        return [pts[0], pts[-1]]
    return rdp(pts[:idx + 1], eps)[:-1] + rdp(pts[idx:], eps)


def main(src: str) -> None:
    topo = json.loads(pathlib.Path(src).read_text())
    g = next(x for x in topo["objects"]["countries"]["geometries"] if x["properties"]["name"] == "Slovakia")
    ring = max(decode(topo, g), key=len)
    xy = [project(lon, lat) for lon, lat in ring]
    # a closed ring has no chord to measure against: split it at the point
    # farthest from its start and simplify the two halves
    far = max(range(len(xy)), key=lambda i: math.dist(xy[0], xy[i]))
    xy = rdp(xy[:far + 1], 0.004)[:-1] + rdp(xy[far:], 0.004)      # ≈ 0.4 km
    xs, ys = [p[0] for p in xy], [p[1] for p in xy]
    box = [min(xs), min(ys), max(xs), max(ys)]
    OUT.write_text(json.dumps({"lat0": LAT0, "box": box,
                               "ring": [[round(x, 4), round(y, 4)] for x, y in xy]}))
    print(f"{OUT.name}: {len(xy)} points, box {[round(v, 3) for v in box]}")


if __name__ == "__main__":
    main(sys.argv[1])
