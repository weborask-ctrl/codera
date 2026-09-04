"""cladding.py — larch Rhombus cladding, openings, deck and threshold for the EcoDomček Cycles scene.

Public API
----------
clad(house, materials) -> dict of collections
    {"slats", "battens", "reveals", "frames", "glass", "door", "deck", "threshold"}
    `house` is the dict returned by geometry.build_house(materials); the
    cutter objects in house["openings"] (custom props "kind", "wall",
    "bounds") define every opening. `materials` is materials.py (get/apply/
    add_bevel).

What is built
-------------
slats     Rhombus larch slats as real geometry on every larch wall face:
          front y = 5 (except where the cantilever box is), back y = −5,
          left x = −4, right x = 4 (except behind the box). Profile: a
          parallelogram 0.070 high × 0.021 thick whose top and bottom faces
          slant 15° down and outward (the real "Rhombus" section — the back
          sits flat on the batten, so the visible face is parallel to the
          wall and the 15° shows in the slanted joints), 2 mm eased edges
          built into the profile (2 segments), horizontal, 10.4 mm open
          joints on a 0.0804 pitch: 75 rows between the plinth and the roof
          soffit, the grid anchored so a joint is centred on the box soffit
          (z = 3.15). ONE mesh per distinct slat length, every slat a linked
          duplicate (bpy.data.objects.new sharing the mesh) so materials.py
          varies each board via Object Info → Random. Front/back slats run
          the full cladding width and hide the ends of the side-wall slats.
          Slats are cut CLEAR (3 mm) short of every reveal board.
battens   0.03 × 0.06 vertical battens ('membrane' black, as on a real
          open-joint facade) every 0.6 m plus one flanking each opening
          edge, corner posts at the four corners; one mesh object per wall.
reveals   'anthracite' reveal boards (10 mm) lining every opening from the
          frame face out to the cladding face (0.111 deep), a sloped sill
          board with a 30 mm drip nose under each window, and anthracite
          face strips that take the place of the ripped slat where a row
          straddles a head or sill line (as a real installer would close
          the cut with the reveal system rather than leave a 30 mm strip
          of larch). One mesh per opening.
frames    'frame' aluminium profiles 0.08 wide × 0.08 deep, outer face
          0.06 inside the wall face so the 8 mm glass sits 0.10 in
          (spec.WINDOW_RECESS); the living-room glazing gets jambs, head, a
          slim 0.03 bottom track and the mullion at x = −0.59; the door a
          jamb/head frame; the box window a full ring set into the
          anthracite shell.
glass     8 mm 'glass' boxes (thin solids, not planes), one per pane.
door      flush 'anthracite' leaf 63 mm thick, 12 mm behind the frame face,
          slim vertical 'steel_black' bar handle.
deck      individual 'larch_deck' boards 0.145 × 0.028 along X (25 rows,
          5.25 mm gaps so 25 full boards fit the 3.75 m depth exactly; two
          boards per row with staggered end joints) on a 'concrete' plinth
          z −0.05 → 0.12, 'anthracite' fascia board on the +Y edge.
threshold 2-step 'concrete' threshold at the entrance (tops at 0.13 and
          0.065), one clean prism.

All meshes are in world units. Non-instanced objects get materials.add_bevel
(4 mm, 2 segments); the instanced slat and deck-board profiles carry their
eased edges as real geometry (no per-object modifier, so Cycles instances
them). Nothing touches face-to-face: solids either overlap by EPS (hidden)
or keep ≥ 1 mm clearance.

Standalone test:  python3 cladding.py
materials + geometry.build_house + clad(), rendered from the hero desktop
camera and from a front-left corner close-up to _test/cladding_hero.png and
_test/cladding_corner.png.
"""

import math
import os
import sys
import time

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, "/home/user/codera/clients/ecodomcek/cycles")
if _HERE not in sys.path:
    sys.path.insert(0, _HERE)

import bpy  # noqa: E402  (bpy must load before bmesh/mathutils resolve)
import bmesh  # noqa: E402
from mathutils import Matrix, Vector  # noqa: E402

import meshutil  # noqa: E402
import spec  # noqa: E402

# ---------------------------------------------------------------------------
# Local constants (not in spec.py) — listed in the notes returned with the module
# ---------------------------------------------------------------------------
EPS = 0.002  # hidden overlap between touching solids (never coincident faces)
CLEAR = 0.003  # slat ends stop this far short of a reveal board
SLAT_S = spec.SLAT_T * math.tan(math.radians(spec.SLAT_TILT_DEG))  # 0.0056 — vertical offset of the slanted faces
SLAT_EXTENT = spec.SLAT_H + SLAT_S  # 0.0756 — total vertical extent of one slat
SLAT_EDGE_R = 0.002  # eased slat edges (real geometry, 2 segments)
PITCH = 0.0804  # row pitch: 10.4 mm joints let 75 full rows fit plinth → roof soffit
Z_SOFFIT = spec.BOX["z"][0]  # 3.15 — underside of the cantilever box
ROW_ANCHOR = Z_SOFFIT + (PITCH - SLAT_EXTENT) / 2  # a joint centred on the box soffit
ROWS_BELOW_ANCHOR = 36  # first slat bottom at 0.258 (plinth top 0.25); 38 rows above → top at 6.283
ROWS_ABOVE_ANCHOR = 38
CLAD_TOP = ROW_ANCHOR + ROWS_ABOVE_ANCHOR * PITCH + SLAT_EXTENT  # 6.2832 (roof soffit at 6.299)
SLAT_W0 = spec.BATTEN_T  # slat back face 0.030 off the wall
SLAT_W1 = spec.BATTEN_T + spec.SLAT_T  # cladding line 0.051 off the wall (plinth is 0.02 inside it)
BATTEN_GAP = 0.0005  # battens end this far behind the slat backs
BATTEN_W = 0.06
BATTEN_PITCH = 0.60
BATTEN_BOTTOM = spec.PLINTH_H + 0.005
FRAME_W = spec.WINDOW_FRAME  # 0.08 visible frame width
FRAME_D = 0.08  # frame depth along the wall normal
GLASS_T = 0.008
GLASS_W = -spec.WINDOW_RECESS  # glass plane 0.10 inside the wall face (w is measured outward)
FRAME_W0, FRAME_W1 = GLASS_W - FRAME_D / 2, GLASS_W + FRAME_D / 2  # −0.14 … −0.06
TRACK_H = 0.03  # slim bottom track of the living-room glazing
REVEAL_T = 0.010  # reveal lining boards
REVEAL_IN = FRAME_W1 - EPS  # lining starts 2 mm onto the frame face
SILL_PROUD = 0.030  # drip nose beyond the cladding face
SILL_SLOPE = 0.0125  # fall of the sill top over its 0.143 depth (≈ 5°)
DOOR_LEAF_T = 0.063
DOOR_LEAF_SET = 0.012  # leaf face behind the frame face
HANDLE_R = 0.009
DECK_Y0 = spec.Y1 + (spec.BATTEN_T + spec.SLAT_T - 0.02) + 0.004  # 5.035: 4 mm off the proud plinth
DECK_EDGE_T = 0.012  # anthracite fascia on the +Y edge
DECK_PLINTH_TOP = 0.12
DECK_PLINTH_INSET = 0.03
DECK_END_GAP = 0.004
DECK_JOINTS = (-1.0, 0.6, -2.6)  # end-joint x positions, cycling row by row
THRESHOLD = {"x": (2.15, 3.55), "upper": (0.033, 0.95, 0.13), "lower": (0.95, 1.25, 0.065)}  # (w0, w1, top)


# ---------------------------------------------------------------------------
# Walls: (u, w, z) → world.  u runs along the wall, w outward from the wall face
# ---------------------------------------------------------------------------
class _Wall:
    def __init__(self, name, along, face, sign, rot_deg):
        self.name, self.along, self.face, self.sign, self.rot = name, along, face, sign, math.radians(rot_deg)

    def to_world(self, u, w, z):
        d = self.face + self.sign * w
        return (u, d, z) if self.along == "x" else (d, u, z)

    def box(self, u0, u1, w0, w1, z0, z1):
        """Axis-aligned world box (x0, x1, y0, y1, z0, z1) from wall coordinates."""
        a = self.to_world(u0, w0, z0)
        b = self.to_world(u1, w1, z1)
        return (min(a[0], b[0]), max(a[0], b[0]), min(a[1], b[1]), max(a[1], b[1]), z0, z1)

    def span(self, bounds):
        """(u0, u1) of an opening from its cutter bounds [x0, x1, y0, y1, z0, z1]."""
        return (bounds[0], bounds[1]) if self.along == "x" else (bounds[2], bounds[3])


WALLS = {
    "front": _Wall("front", "x", spec.Y1, +1, 0.0),
    "back": _Wall("back", "x", spec.Y0, -1, 180.0),
    "left": _Wall("left", "y", spec.X0, -1, 90.0),
    "right": _Wall("right", "y", spec.X1, +1, -90.0),
    "box_front": _Wall("box_front", "x", spec.BOX["y"][1], +1, 0.0),
}


# ---------------------------------------------------------------------------
# Mesh helpers
# ---------------------------------------------------------------------------
def _collection(name):
    coll = bpy.context.scene.collection.children.get(name)
    if coll is None:
        coll = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(coll)
    return coll


def _add_box(bm, b):
    x0, x1, y0, y1, z0, z1 = b
    v = [bm.verts.new((x, y, z)) for z in (z0, z1) for y in (y0, y1) for x in (x0, x1)]
    for f in ((0, 2, 3, 1), (4, 5, 7, 6), (0, 1, 5, 4), (2, 6, 7, 3), (0, 4, 6, 2), (1, 3, 7, 5)):
        bm.faces.new([v[i] for i in f])


def _add_prism_wz(bm, wall, pts, u0, u1):
    """Prism from a simple polygon [(w, z), ...] in the wall's section plane, extruded from u0 to u1."""
    a = [bm.verts.new(wall.to_world(u0, w, z)) for (w, z) in pts]
    b = [bm.verts.new(wall.to_world(u1, w, z)) for (w, z) in pts]
    bm.faces.new(a)
    bm.faces.new(list(reversed(b)))
    n = len(pts)
    for k in range(n):
        m = (k + 1) % n
        bm.faces.new((a[k], a[m], b[m], b[k]))


def _add_tube(bm, p0, p1, r, segments=16):
    p0, p1 = Vector(p0), Vector(p1)
    d = p1 - p0
    rot = d.normalized().to_track_quat("Z", "Y").to_matrix().to_4x4()
    bmesh.ops.create_cone(
        bm, cap_ends=True, cap_tris=False, segments=segments, radius1=r, radius2=r, depth=d.length,
        matrix=Matrix.Translation((p0 + p1) / 2) @ rot,
    )


def _mesh_object(name, bm, coll, materials=None, mat=None, bevel=0.004, smooth=True):
    """bmesh (world coordinates) → linked object with a Bevel modifier and a material."""
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    if smooth:
        meshutil.smooth_by_angle(bm)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    coll.objects.link(ob)
    if mat and materials is not None:
        materials.apply(ob, mat)
    if bevel and materials is not None and hasattr(materials, "add_bevel"):
        materials.add_bevel(ob, bevel, 2)
    return ob


def _rounded_polygon(pts, r, segs=2):
    """Replace every corner of a convex polygon by an arc of `segs` segments.

    Returns (points, flags): flags[i] is True when the edge points[i] → points[i+1]
    is part of a rounded corner (those side faces are shaded smooth, the big faces flat).
    """
    n = len(pts)
    out, flags = [], []
    for i in range(n):
        p = Vector(pts[i])
        a = Vector(pts[i - 1]) - p
        b = Vector(pts[(i + 1) % n]) - p
        theta = a.angle(b)
        d = r / math.tan(theta / 2)  # tangent distance from the corner
        ta, tb = p + a.normalized() * d, p + b.normalized() * d
        centre = p + (a.normalized() + b.normalized()).normalized() * (r / math.sin(theta / 2))
        v0, v1 = ta - centre, tb - centre
        sweep = v0.angle(v1)
        cross = v0.x * v1.y - v0.y * v1.x
        for k in range(segs + 1):
            ang = sweep * k / segs * (1 if cross > 0 else -1)
            c, s = math.cos(ang), math.sin(ang)
            out.append((centre.x + v0.x * c - v0.y * s, centre.y + v0.x * s + v0.y * c))
            flags.append(k < segs)  # the last point starts the straight edge to the next corner
    return out, flags


def _profile_mesh(name, pts, flags, length, x_from_zero=False):
    """Closed prism along local X from a 2D profile [(y, z)] — the shared mesh of an instanced board."""
    bm = bmesh.new()
    x0, x1 = (0.0, length) if x_from_zero else (-length / 2, length / 2)
    a = [bm.verts.new((x0, y, z)) for (y, z) in pts]
    b = [bm.verts.new((x1, y, z)) for (y, z) in pts]
    bm.faces.new(a).smooth = False
    bm.faces.new(list(reversed(b))).smooth = False
    n = len(pts)
    for k in range(n):
        m = (k + 1) % n
        bm.faces.new((a[k], a[m], b[m], b[k])).smooth = bool(flags[k])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    return me


def _slat_profile():
    """Rhombus section in (y, z): back flat on the batten, top/bottom slanting 15° down and outward."""
    t, h, s = spec.SLAT_T, spec.SLAT_H, SLAT_S
    return _rounded_polygon([(0.0, s), (t, 0.0), (t, h), (0.0, h + s)], SLAT_EDGE_R, 2)


def _deck_profile():
    w, t = spec.DECK["board_w"], spec.DECK["board_t"]
    return _rounded_polygon([(0.0, 0.0), (w, 0.0), (w, t), (0.0, t)], 0.003, 2)


# ---------------------------------------------------------------------------
# Layout: the row grid, the openings, the clad regions
# ---------------------------------------------------------------------------
def _rows():
    """Bottom z (lowest point of the front face) of every slat row, low to high."""
    n = ROWS_BELOW_ANCHOR + ROWS_ABOVE_ANCHOR + 1
    return [ROW_ANCHOR + (k - ROWS_BELOW_ANCHOR) * PITCH for k in range(n)]


def _openings(house):
    """Every real opening from the cutters: dicts with name, kind, wall, u=(u0, u1), z=(z0, z1)."""
    out = []
    for ob in house["openings"].objects:
        kind, wall = ob.get("kind"), ob.get("wall")
        if kind not in ("glazing", "window", "door", "box_window") or wall not in WALLS:
            continue
        b = [float(v) for v in ob["bounds"]]
        out.append({
            "name": ob.get("opening") or ob.name.replace("cutter_", ""),
            "kind": kind,
            "wall": wall,
            "u": WALLS[wall].span(b),
            "z": (b[4], b[5]),
        })
    return out


def _regions():
    """(wall, slat u-range, wall-face u-range, z-range). Slats of a row belong to a region when
    their whole vertical extent lies inside its z-range; the grid puts a joint on Z_SOFFIT."""
    ov = SLAT_W1  # front/back slats overhang the side walls' cladding and hide its ends
    side = (spec.Y0 - SLAT_W0 + 0.001, spec.Y1 + SLAT_W0 - 0.001)  # 1 mm short of the front/back slat backs
    bx = spec.BOX
    top = CLAD_TOP + EPS
    return [
        ("front", (spec.X0 - ov, spec.X1 + ov), (spec.X0, spec.X1), (0.0, Z_SOFFIT)),
        ("front", (spec.X0 - ov, bx["x"][0] - EPS), (spec.X0, bx["x"][0] - EPS), (Z_SOFFIT, top)),
        ("back", (spec.X0 - ov, spec.X1 + ov), (spec.X0, spec.X1), (0.0, top)),
        ("left", side, (spec.Y0, spec.Y1), (0.0, top)),
        ("right", side, (spec.Y0, spec.Y1), (0.0, Z_SOFFIT)),
        ("right", (side[0], bx["y"][0] - EPS), (spec.Y0, bx["y"][0] - EPS), (Z_SOFFIT, top)),
    ]


def _subtract(intervals, a, b):
    out = []
    for s, e in intervals:
        if b <= s or a >= e:
            out.append((s, e))
            continue
        if a > s:
            out.append((s, a))
        if b < e:
            out.append((b, e))
    return out


def _row_hits(zb, oz0, oz1):
    """Does a slat row (bottom zb) interact with an opening spanning z oz0 … oz1?"""
    return zb + SLAT_EXTENT > oz0 - CLEAR and zb < oz1 + CLEAR


# ---------------------------------------------------------------------------
# Slats (instanced) and battens
# ---------------------------------------------------------------------------
def _build_slats(openings, rows, materials, coll):
    pts, flags = _slat_profile()
    larch = materials.get("larch")
    meshes = {}
    count = 0
    for wall_name, (u0, u1), _face, (z0, z1) in _regions():
        wall = WALLS[wall_name]
        ops = [o for o in openings if o["wall"] == wall_name]
        for k, zb in enumerate(rows):
            if zb < z0 - 1e-6 or zb + SLAT_EXTENT > z1 + 1e-6:
                continue
            segs = [(u0, u1)]
            for o in ops:
                if _row_hits(zb, *o["z"]):
                    segs = _subtract(segs, o["u"][0] - CLEAR, o["u"][1] + CLEAR)
            for i, (a, b) in enumerate(segs):
                key = int(round((b - a) * 10000))  # length in 0.1 mm → one mesh per distinct length
                if key < 200:
                    continue
                me = meshes.get(key)
                if me is None:
                    me = _profile_mesh(f"slat_L{key:06d}", pts, flags, key / 10000.0)
                    me.materials.append(larch)
                    meshes[key] = me
                ob = bpy.data.objects.new(f"slat_{wall_name}_{k:02d}_{i}", me)
                ob.location = wall.to_world((a + b) / 2, SLAT_W0, zb)
                ob.rotation_euler = (0.0, 0.0, wall.rot)
                coll.objects.link(ob)
                count += 1
    return count, len(meshes)


def _build_battens(openings, materials, coll):
    w_out = spec.BATTEN_T - BATTEN_GAP
    for wall_name in ("front", "back", "left", "right"):
        wall = WALLS[wall_name]
        ops = [o for o in openings if o["wall"] == wall_name]
        bm = bmesh.new()
        for _w, _u, (f0, f1), (z0, z1) in [r for r in _regions() if r[0] == wall_name]:
            zlo = max(BATTEN_BOTTOM, z0 + EPS)
            zhi = min(z1, CLAD_TOP) - EPS
            in_z = [o for o in ops if o["z"][1] > zlo and o["z"][0] < zhi]
            battens = []
            for o in in_z:  # one batten flanking each side of every opening
                battens.append((o["u"][0] - 0.01 - BATTEN_W, o["u"][0] - 0.01))
                battens.append((o["u"][1] + 0.01, o["u"][1] + 0.01 + BATTEN_W))
            u = f0 + 0.01
            regular = []
            while u + BATTEN_W <= f1 - 0.01:
                regular.append((u, u + BATTEN_W))
                u += BATTEN_PITCH
            if regular and f1 - 0.01 - regular[-1][1] > 0.25:
                regular.append((f1 - 0.01 - BATTEN_W, f1 - 0.01))
            for ua, ub in regular:
                if all(ub < a - 0.01 or ua > b + 0.01 for a, b in battens):
                    battens.append((ua, ub))
            for ua, ub in battens:
                if ua < f0 or ub > f1:
                    continue
                zs = [(zlo, zhi)]
                for o in in_z:
                    if ub > o["u"][0] - 0.005 and ua < o["u"][1] + 0.005:
                        zs = _subtract(zs, o["z"][0] - 0.004, o["z"][1] + 0.004)
                for za, zc in zs:
                    if zc - za > 0.02:
                        _add_box(bm, wall.box(ua, ub, 0.0, w_out, za, zc))
        _mesh_object(f"battens_{wall_name}", bm, coll, materials, "membrane", bevel=0)
    # corner posts behind the front/back slat overhangs
    bm = bmesh.new()
    bx = spec.BOX
    for x in (spec.X0, spec.X1):
        for y in (spec.Y0, spec.Y1):
            ztop = Z_SOFFIT - EPS if (x > bx["x"][0] and y > bx["y"][0]) else CLAD_TOP
            sx, sy = (1 if x > 0 else -1), (1 if y > 0 else -1)
            _add_box(bm, (min(x, x + sx * w_out), max(x, x + sx * w_out), min(y, y + sy * w_out), max(y, y + sy * w_out), BATTEN_BOTTOM, ztop))
    _mesh_object("battens_corners", bm, coll, materials, "membrane", bevel=0)


# ---------------------------------------------------------------------------
# Openings: reveal system, frames, glass, the door
# ---------------------------------------------------------------------------
def _build_reveal(o, rows, materials, coll):
    wall, kind, name = WALLS[o["wall"]], o["kind"], o["name"]
    (a0, a1), (z0, z1) = o["u"], o["z"]
    bm = bmesh.new()
    jz0 = z0 + EPS if kind in ("glazing", "door") else z0 - EPS  # over concrete sills stay 2 mm clear; else 2 mm into the wall
    _add_box(bm, wall.box(a0 - EPS, a0 + REVEAL_T, REVEAL_IN, SLAT_W1, jz0, z1 + EPS))
    _add_box(bm, wall.box(a1 - REVEAL_T, a1 + EPS, REVEAL_IN, SLAT_W1, jz0, z1 + EPS))
    _add_box(bm, wall.box(a0 + REVEAL_T - EPS, a1 - REVEAL_T + EPS, REVEAL_IN, SLAT_W1, z1 - REVEAL_T, z1 + EPS))
    if kind == "window":  # sloped sill with a drip nose 30 mm beyond the cladding face
        nose = SLAT_W1 + SILL_PROUD
        sill = [
            (REVEAL_IN, z0 + 0.012),
            (nose, z0 + 0.012 - SILL_SLOPE),
            (nose, z0 - 0.014),
            (SLAT_W0, z0 - 0.014),
            (SLAT_W0, z0 + 0.001),
            (REVEAL_IN, z0 + 0.001),
        ]
        _add_prism_wz(bm, wall, sill, a0 + REVEAL_T - EPS, a1 - REVEAL_T + EPS)
    # anthracite face strips where a slat row straddles the sill or the head line
    for zb in rows:
        zt = zb + SLAT_EXTENT
        if zb < z0 - CLEAR < zt:
            top = z0 - 0.015 if kind == "window" else z0 - CLEAR
            if top - zb > 0.006:
                _add_box(bm, wall.box(a0 - CLEAR, a1 + CLEAR, SLAT_W0, SLAT_W1, zb, top))
        if zb < z1 + CLEAR < zt and zb + spec.SLAT_H - (z1 + CLEAR) > 0.006:
            _add_box(bm, wall.box(a0 - CLEAR, a1 + CLEAR, SLAT_W0, SLAT_W1, z1 + CLEAR, zb + spec.SLAT_H))
    _mesh_object(f"reveal_{name}", bm, coll, materials, "anthracite")


def _build_frame(o, materials, cols):
    wall, kind, name = WALLS[o["wall"]], o["kind"], o["name"]
    (a0, a1), (z0, z1) = o["u"], o["z"]
    ins = -EPS if kind == "box_window" else REVEAL_T - EPS  # ring edge: 2 mm into the shell / 2 mm behind the linings
    fa0, fa1, fz1 = a0 + ins, a1 - ins, z1 - ins
    fz0 = z0 - EPS if kind in ("glazing", "door") else z0 + ins  # onto the concrete sill (hidden 2 mm)
    fw = FRAME_W
    bm = bmesh.new()
    _add_box(bm, wall.box(fa0, fa0 + fw, FRAME_W0, FRAME_W1, fz0, fz1))
    _add_box(bm, wall.box(fa1 - fw, fa1, FRAME_W0, FRAME_W1, fz0, fz1))
    _add_box(bm, wall.box(fa0 + fw - EPS, fa1 - fw + EPS, FRAME_W0, FRAME_W1, fz1 - fw, fz1))
    panes = []
    gz1 = fz1 - fw + 0.01
    if kind in ("window", "box_window"):
        _add_box(bm, wall.box(fa0 + fw - EPS, fa1 - fw + EPS, FRAME_W0, FRAME_W1, fz0, fz0 + fw))
        panes.append((fa0 + fw - 0.01, fa1 - fw + 0.01, fz0 + fw - 0.01, gz1))
    elif kind == "glazing":
        _add_box(bm, wall.box(fa0 + fw - EPS, fa1 - fw + EPS, FRAME_W0, FRAME_W1, fz0, fz0 + TRACK_H + EPS))
        mx = spec.GLAZING["mullion_x"]
        _add_box(bm, wall.box(mx - fw / 2, mx + fw / 2, FRAME_W0, FRAME_W1, fz0 + TRACK_H, fz1 - fw + EPS))
        gz0 = fz0 + TRACK_H + EPS - 0.01
        panes.append((fa0 + fw - 0.01, mx - fw / 2 + 0.01, gz0, gz1))
        panes.append((mx + fw / 2 - 0.01, fa1 - fw + 0.01, gz0, gz1))
    _mesh_object(f"frame_{name}", bm, cols["frames"], materials, "frame")
    for i, (u0, u1, gz0_, gz1_) in enumerate(panes):
        gb = bmesh.new()
        _add_box(gb, wall.box(u0, u1, GLASS_W - GLASS_T / 2, GLASS_W + GLASS_T / 2, gz0_, gz1_))
        _mesh_object(f"glass_{name}_{i}", gb, cols["glass"], materials, "glass", bevel=0)
    if kind == "door":
        lu0, lu1 = fa0 + fw + CLEAR, fa1 - fw - CLEAR
        lz0, lz1 = z0 + 0.015, fz1 - fw - CLEAR
        lw1 = FRAME_W1 - DOOR_LEAF_SET
        bm = bmesh.new()
        _add_box(bm, wall.box(lu0, lu1, lw1 - DOOR_LEAF_T, lw1, lz0, lz1))
        _mesh_object("door_leaf", bm, cols["door"], materials, "anthracite")
        bm = bmesh.new()
        hu = lu1 - 0.075
        hw = lw1 + 0.045 + HANDLE_R
        _add_tube(bm, wall.to_world(hu, hw, 0.98), wall.to_world(hu, hw, 1.34), HANDLE_R, 20)
        for hz in (1.03, 1.29):
            _add_tube(bm, wall.to_world(hu, lw1 - EPS, hz), wall.to_world(hu, hw, hz), 0.006, 12)
        _mesh_object("door_handle", bm, cols["door"], materials, "steel_black", bevel=0.0015)


def _build_openings(openings, rows, materials, cols):
    for o in openings:
        if o["kind"] != "box_window":
            _build_reveal(o, rows, materials, cols["reveals"])
        _build_frame(o, materials, cols)


# ---------------------------------------------------------------------------
# Deck and threshold
# ---------------------------------------------------------------------------
def _build_deck(materials, coll):
    (x0, x1), y1, top = spec.DECK["x"], spec.DECK["y"][1], spec.DECK["top"]
    w, t = spec.DECK["board_w"], spec.DECK["board_t"]
    y_last = y1 - DECK_EDGE_T - EPS
    depth = y_last - DECK_Y0
    n = int(math.floor((depth + spec.DECK["gap"]) / (w + spec.DECK["gap"])))
    gap = (depth - n * w) / (n - 1)
    pts, flags = _deck_profile()
    larch = materials.get("larch_deck")
    meshes = {}
    count = 0
    for j in range(n):
        y = DECK_Y0 + j * (w + gap)
        joint = DECK_JOINTS[j % len(DECK_JOINTS)]
        for i, (xa, xb) in enumerate(((x0, joint - DECK_END_GAP / 2), (joint + DECK_END_GAP / 2, x1))):
            key = int(round((xb - xa) * 10000))
            me = meshes.get(key)
            if me is None:
                me = _profile_mesh(f"deckboard_L{key:06d}", pts, flags, key / 10000.0, x_from_zero=True)
                me.materials.append(larch)
                meshes[key] = me
            ob = bpy.data.objects.new(f"deck_{j:02d}_{i}", me)
            ob.location = (xa, y, top - t)
            coll.objects.link(ob)
            count += 1
    bm = bmesh.new()
    _add_box(bm, (x0 + DECK_PLINTH_INSET, x1 - DECK_PLINTH_INSET, DECK_Y0, y_last - 0.01, -0.05, DECK_PLINTH_TOP))
    _mesh_object("deck_plinth", bm, coll, materials, "concrete")
    bm = bmesh.new()
    _add_box(bm, (x0, x1, y1 - DECK_EDGE_T, y1, 0.03, top))
    _mesh_object("deck_edge", bm, coll, materials, "anthracite")
    return count, n, gap


def _build_threshold(materials, coll):
    (x0, x1), (u_w0, u_w1, u_top), (l_w0, l_w1, l_top) = THRESHOLD["x"], THRESHOLD["upper"], THRESHOLD["lower"]
    pts = [(u_w0, -0.05), (l_w1, -0.05), (l_w1, l_top), (l_w0, l_top), (l_w0, u_top), (u_w0, u_top)]
    bm = bmesh.new()
    _add_prism_wz(bm, WALLS["front"], pts, x0, x1)
    _mesh_object("threshold", bm, coll, materials, "concrete", bevel=0.006)


def _build_rainwater(materials, coll):
    """One downpipe on the left wall with brackets and a shoe.

    Nothing on the facade gave the eye a familiar object to size the house by;
    a 80 mm downpipe is the cheapest scale cue a building has.
    """
    face = spec.X0 - SLAT_W1  # outside face of the cladding on the left wall
    y = -4.35
    r = 0.041
    z0, z1 = 0.20, spec.Z_TOP + spec.ROOF_T - 0.10
    bm = bmesh.new()
    _add_tube(bm, (face - r - 0.035, y, z0 + 0.28), (face - r - 0.035, y, z1), r, segments=20)
    # the shoe: a short angled length spilling towards the gravel
    _add_tube(bm, (face - r - 0.035, y, z0 + 0.34), (face - r - 0.30, y, z0), r, segments=16)
    _mesh_object("downpipe", bm, coll, materials, "anthracite", bevel=0)
    bm = bmesh.new()
    for z in (1.15, 3.05, 5.05):
        _add_box(bm, (face - 0.11, face, y - 0.035, y + 0.035, z, z + 0.05))
    _mesh_object("downpipe_brackets", bm, coll, materials, "anthracite", bevel=0.004)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------
def clad(house, materials):
    """Clad the house: slats, battens, reveals, frames, glass, door, deck, threshold (see module doc)."""
    t0 = time.time()
    cols = {k: _collection(k) for k in ("slats", "battens", "reveals", "frames", "glass", "door", "deck", "threshold", "rainwater")}
    openings = _openings(house)
    rows = _rows()
    n_slats, n_meshes = _build_slats(openings, rows, materials, cols["slats"])
    _build_battens(openings, materials, cols["battens"])
    _build_openings(openings, rows, materials, cols)
    n_boards, n_rows, gap = _build_deck(materials, cols["deck"])
    _build_threshold(materials, cols["threshold"])
    _build_rainwater(materials, cols["rainwater"])
    print(
        f"[cladding] {n_slats} slats ({n_meshes} shared meshes, {len(rows)} rows, pitch {PITCH:.4f}), "
        f"{len(openings)} openings, deck {n_boards} boards in {n_rows} rows (gap {gap * 1000:.2f} mm), "
        f"built in {time.time() - t0:.2f} s"
    )
    return cols


# ---------------------------------------------------------------------------
# Standalone test
# ---------------------------------------------------------------------------
def _look_at(ob, target):
    ob.rotation_euler = (Vector(target) - ob.location).to_track_quat("-Z", "Y").to_euler()


def _test_scene(materials, geometry):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.render.threads_mode = "AUTO"
    sc.view_settings.view_transform = "AgX"
    sc.view_settings.look = "AgX - Base Contrast"
    sc.view_settings.exposure = -2.6
    sc.render.filter_size = 1.5

    house = geometry.build_house(materials)
    cols = clad(house, materials)
    for k, c in cols.items():
        print(f"  {k:9s} {len(c.objects)} objects")

    bm = bmesh.new()
    _add_box(bm, (-80, 80, -80, 80, -0.3, 0.0))
    _mesh_object("test_ground", bm, sc.collection, materials, "lawn", bevel=0)

    world = bpy.data.worlds.new("test_world")
    sc.world = world
    if world.node_tree is None:
        world.use_nodes = True
    nt = world.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    sky = nt.nodes.new("ShaderNodeTexSky")
    sky.sky_type = "MULTIPLE_SCATTERING"
    sky.sun_disc = True
    sky.sun_elevation = math.radians(spec.LIGHTS["morning"]["elevation"])
    # Blender: sun_rotation 0 = sun at +Y, 90 = +X (clockwise, verified by a shadow probe); the spec's
    # 145° means "front-right in world" = the +X+Y quadrant, i.e. 180 − 145 = 35° here.
    sky.sun_rotation = math.radians(180.0 - spec.LIGHTS["morning"]["rotation"])
    sky.sun_intensity = spec.LIGHTS["morning"]["intensity"]
    sky.altitude = 300.0
    sky.air_density = 1.0
    sky.aerosol_density = 1.5
    bg = nt.nodes.new("ShaderNodeBackground")
    out = nt.nodes.new("ShaderNodeOutputWorld")
    nt.links.new(sky.outputs[0], bg.inputs[0])
    nt.links.new(bg.outputs[0], out.inputs[0])

    cam = bpy.data.cameras.new("test_cam")
    cam.sensor_fit = "VERTICAL"
    cam.sensor_height = 24.0
    co = bpy.data.objects.new("test_cam", cam)
    sc.collection.objects.link(co)
    sc.camera = co

    cy = sc.cycles
    cy.samples = spec.QUALITY["test"]["samples"]
    cy.use_adaptive_sampling = False
    cy.use_denoising = True
    cy.denoiser = "OPENIMAGEDENOISE"
    cy.denoising_use_gpu = False
    cy.use_light_tree = True
    cy.max_bounces = 8
    cy.glossy_bounces = 4
    cy.transmission_bounces = 8
    cy.caustics_reflective = False
    cy.caustics_refractive = False
    cy.sample_clamp_indirect = 8.0
    sc.render.resolution_x, sc.render.resolution_y = spec.SIZES["desktop"]
    sc.render.resolution_percentage = spec.QUALITY["test"]["scale"]
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGB"
    return sc, co


def _shoot(sc, co, pos, target, fov, fstop, out):
    co.location = pos
    _look_at(co, target)
    co.data.lens = spec.lens_for_fov(fov)
    co.data.dof.use_dof = fstop > 0
    co.data.dof.aperture_fstop = fstop if fstop > 0 else 8.0
    co.data.dof.focus_distance = (Vector(target) - Vector(pos)).length
    sc.render.filepath = out
    t0 = time.time()
    bpy.ops.render.render(write_still=True)
    return time.time() - t0


if __name__ == "__main__":
    import geometry
    import materials

    out_dir = os.path.join(_HERE, "_test")
    os.makedirs(out_dir, exist_ok=True)
    views = {
        "hero": (*spec.CAMERAS[("hero", "desktop")],),
        "corner": ((-8.4, 9.4, 1.9), (-3.8, 4.5, 1.7), 35.0, 5.6),
    }
    wanted = [a for a in sys.argv[1:] if a in views] or list(views)
    scene, cam_ob = _test_scene(materials, geometry)
    for v in wanted:
        pos, tgt, fov, fstop = views[v]
        out = os.path.join(out_dir, f"cladding_{v}.png")
        dt = _shoot(scene, cam_ob, pos, tgt, fov, fstop, out)
        print(f"[cladding] test render: {out}")
        print(f"[cladding] render time: {dt:.1f} s")
