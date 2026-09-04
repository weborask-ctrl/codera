"""interior.py — furniture and fittings for the EcoDomček Cycles scene (SPEC.md, "Interior").

Public API
----------
furnish(house, materials) -> dict
    Builds everything of the two SPEC interior rows into the collections
    {"interior_ground", "interior_upper"} and returns them. `house` is the
    dict returned by geometry.build_house(); `materials` provides get(name)
    / apply(obj, name) / add_bevel(obj, ...) (materials.py).
PENDANT : bpy.types.Object
    The bulb of the black pendant lamp over the dining table (set by
    furnish()). Its material is a bare Emission node — set_pendant(on) or
    PENDANT.data.materials[0].node_tree.nodes["Emission"].inputs["Strength"]
    toggles it. build.py: on for the `interior` and `dusk` light states.
set_pendant(on: bool, strength: float = PENDANT_STRENGTH)

What is built (ground floor, metres, floor finish at z = 0.15)
    floor_finish     20 mm oak on the screed (0.13 → 0.15), laid around the
                     stair stringers (EXACT boolean), stopping at the spruce
                     lining of the back wall; skirting 60 × 12 mm on the
                     plaster walls, interrupted at the glazing, the door and
                     the stair
    kitchen_*        block x −3.4 → −0.2, depth 0.65, worktop top 1.05:
                     anthracite toe-kick, oak_white carcass and 12 handle-less
                     fronts (one object each so Object Info Random varies the
                     grain), 20 mm anthracite compact-panel worktop with a
                     recessed steel sink + tap and a black glass hob; tall
                     column x −0.2 → 0.4 (h 2.20) with an oven; on the
                     worktop a ceramic bowl, an oak board, a kettle, two mugs,
                     two cookbooks
    table_*, chair_* dining table 1.9 × 0.9 (oak top, grain along the length,
                     black steel frame) with six oak/steel chairs, one pulled
                     out
    sofa_*           low grey sofa 2.3 × 0.95 on steel feet: base, arms,
                     back, two seat and two back cushions, two throw pillows
                     (linen + ochre), a folded linen throw — every soft box is
                     bevelled and subdivided
    coffee_table_*   round oak top Ø 0.8 on three splayed steel legs; a
                     book stack and a small bowl on it
    rug              wool flat-weave 3.0 × 2.0 with woven stripes
    pendant_*        black cone shade (white inside), cable, ceiling rose,
                     emission bulb (PENDANT)
    plant_*          1.5 m potted plant: ceramic pot, soil, bent stem,
                     16 leaf planes on petioles
Upper floor (floor at 3.15)
    bed_*            two beds: oak plinth + platform + headboard, linen
                     mattress, duvet with soft folds (Displace + Subdivision),
                     two pillows each; oak bedside tables with a small lamp;
                     a bedside rug

Everything hard-edged gets materials.add_bevel (4 mm, 2 segments); soft
things get larger bmesh bevels plus a Subdivision modifier. All objects are
built in local coordinates (the wood materials read object coordinates, so
the grain follows the object's local Y — long parts are rotated so local Y
runs along their length) and carry the custom property "interior".

Standalone test:  python3 interior.py [--view living|kitchen|sofa|upper]
                                      [--scale 25] [--samples 32]
renders _test/interior_<view>.png with the living/desktop camera of
spec.CAMERAS, the `interior` sky (elevation 32°, sun from world +X/+Y) and
the pendant on.
"""

from __future__ import annotations

import math
import os
import sys
import time

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, "/home/user/codera/clients/ecodomcek/cycles")
if _HERE not in sys.path:
    sys.path.insert(0, _HERE)

import bpy  # noqa: E402
import bmesh  # noqa: E402
from mathutils import Euler, Matrix, Vector  # noqa: E402

import meshutil  # noqa: E402
import spec  # noqa: E402
import materials as matlib  # noqa: E402  (node helpers for the few local materials)

# ---------------------------------------------------------------------------
# Local constants (not in spec.py)
# ---------------------------------------------------------------------------
EPS = 0.002
FLOOR = spec.Z_FLOOR  # 0.15 finished floor
SCREED_TOP = FLOOR - 0.02  # 0.13, geometry.py's slab_ground top
CEILING = spec.Z_SLAB1 - spec.SLAB_T  # 2.85
UPPER_FLOOR = spec.Z_SLAB1  # 3.15 (slab_first top, already 'oak_floor')
X0I, X1I = spec.X0 + spec.WALL_T, spec.X1 - spec.WALL_T  # −3.68, 3.68
Y0I, Y1I = spec.Y0 + spec.WALL_T, spec.Y1 - spec.WALL_T  # −4.68, 4.68
LINING_FACE_Y = Y0I + 0.007 - 0.001 + 0.02  # −4.654: front of geometry.py's spruce lining planks
BEVEL_W, BEVEL_SEGS = 0.004, 2
SKIRTING = (0.06, 0.012)  # height, thickness

KITCHEN_BACK_Y = LINING_FACE_Y
KITCHEN_FRONT_T = 0.02
KITCHEN_WORKTOP_T = 0.02  # Fundermax compact panel worktop (12–20 mm)
KITCHEN_TOE_KICK = (0.10, 0.06)  # height, recess
KITCHEN_GAP = 0.003  # shadow gap between fronts
KITCHEN_COLUMN_H = 2.20
KITCHEN_FRONTS = [  # (width, kind) left → right, sums to 3.2
    (0.60, "drawers3"),
    (0.80, "doors"),  # sink unit
    (0.60, "drawers2"),  # hob unit
    (0.60, "drawers3"),
    (0.60, "door"),
]
SINK = {"x": (-2.65, -2.15), "w": 0.50, "d": 0.40, "h": 0.18}
HOB = {"x": (-2.10, -1.50), "w": 0.58, "d": 0.51}

CHAIR = {"seat_h": 0.45, "seat_w": 0.44, "seat_d": 0.42, "back_h": 0.83, "leg_r": 0.009, "seat_t": 0.012}
TABLE_TOP_T = 0.035
TABLE_LEG = 0.04

SOFA_SEAT_H = 0.42  # top of the seat cushions
SOFA_FOOT_H = 0.10
COFFEE_TABLE = {"center": (spec.SOFA["x_center"], 3.55), "r": 0.40, "h": 0.40, "top_t": 0.03}
RUG = {"center": (spec.SOFA["x_center"], 3.30), "size": (3.0, 2.0), "t": 0.010}
PENDANT_XY = ((spec.TABLE["x"][0] + spec.TABLE["x"][1]) / 2, (spec.TABLE["y"][0] + spec.TABLE["y"][1]) / 2)
PENDANT_SHADE = {"r_top": 0.06, "r_bottom": 0.19, "h": 0.22, "z_bottom": 1.60}
PENDANT_STRENGTH = 40.0  # emission strength of the bulb when on (≈ a 40 W filament bulb)
PLANT_POT = {"xy": (-3.15, 4.05), "r_top": 0.17, "r_bottom": 0.14, "h": 0.32}

BED = {"w": 1.6, "l": 2.0, "plinth_h": 0.10, "base_t": 0.06, "mattress_h": 0.20, "head_h": 0.80}
BEDS = [{"x_center": -1.9}, {"x_center": 1.9}]  # both heads against the back wall (y = Y0I)
BEDSIDE = {"w": 0.45, "d": 0.40, "h": 0.45}

_COLORS = {  # local sRGB colours (not in spec.COLORS)
    "ceramic": "#E4DFD6",
    "ceramic_dark": "#6F6B66",
    "soil": "#2B2218",
    "leaf": "#3C6B2F",
    "leaf_light": "#86B455",
    "stem": "#4E4A2E",
    "paper": "#EFEAE0",
    "steel": "#C9C9C6",
    "black_glass": "#060606",
    "shade_inner": "#EDEAE4",
    "rug": "#B3A896",
    "rug_stripe": "#3E3B37",
    "rug_bed": "#8F8B85",
    "fabric_ochre": "#A8843F",
    "book_navy": "#2C3E50",
    "book_tan": "#8C6D46",
    "book_oxblood": "#5E2A2A",
    "book_chalk": "#DCD6CB",
    "book_forest": "#3A4F41",
    "lemon": "#E3BE2E",
}
BULB_COLOR = (1.0, 0.62, 0.32)  # ≈ 2700 K, linear

PENDANT: bpy.types.Object | None = None
_LOCAL_MATS: dict[str, bpy.types.Material] = {}


# ---------------------------------------------------------------------------
# bmesh helpers (everything in the object's local coordinates)
# ---------------------------------------------------------------------------
def _coll(name, parent=None):
    parent = parent or bpy.context.scene.collection
    c = parent.children.get(name)
    if c is None:
        c = bpy.data.collections.new(name)
        parent.children.link(c)
    return c


def _box(bm, b):
    """Closed axis-aligned box from bounds (x0, x1, y0, y1, z0, z1); returns its faces."""
    x0, x1, y0, y1, z0, z1 = b
    v = [bm.verts.new((x, y, z)) for z in (z0, z1) for y in (y0, y1) for x in (x0, x1)]
    faces = []
    for f in ((0, 2, 3, 1), (4, 5, 7, 6), (0, 1, 5, 4), (2, 6, 7, 3), (0, 4, 6, 2), (1, 3, 7, 5)):
        faces.append(bm.faces.new([v[i] for i in f]))
    return faces


def _box_c(bm, size, center=(0.0, 0.0, 0.0)):
    """Box of `size` centred at `center`."""
    sx, sy, sz = size
    cx, cy, cz = center
    return _box(bm, (cx - sx / 2, cx + sx / 2, cy - sy / 2, cy + sy / 2, cz - sz / 2, cz + sz / 2))


def _cyl(bm, r, z0, z1, center=(0.0, 0.0), segs=32, r_top=None):
    """Capped vertical cylinder (or cone when r_top differs) between z0 and z1."""
    rt = r if r_top is None else r_top
    m = Matrix.Translation((center[0], center[1], (z0 + z1) / 2))
    return bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=segs, radius1=r, radius2=rt, depth=z1 - z0, matrix=m)


def _tube(bm, p0, p1, r, segs=12):
    """Capped cylinder between two points."""
    p0, p1 = Vector(p0), Vector(p1)
    d = p1 - p0
    rot = d.normalized().to_track_quat("Z", "Y").to_matrix().to_4x4()
    m = Matrix.Translation((p0 + p1) / 2) @ rot
    return bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=segs, radius1=r, radius2=r, depth=d.length, matrix=m)


def _polyline_tube(bm, pts, r, segs=12):
    """Tube along a polyline with spheres at the joints (bent handles, tap, stem)."""
    for a, b in zip(pts[:-1], pts[1:]):
        _tube(bm, a, b, r, segs)
    for p in pts[1:-1]:
        _sphere(bm, p, r, u=segs, v=max(6, segs // 2))


def _sphere(bm, center, r, u=24, v=12):
    return bmesh.ops.create_uvsphere(bm, u_segments=u, v_segments=v, radius=r, matrix=Matrix.Translation(Vector(center)))


def _lathe(bm, profile, segs=48, center=(0.0, 0.0, 0.0)):
    """Revolve a closed-shell profile [(r, z), ...] around the local Z axis.

    Points with r == 0 become a single vertex (pole); consecutive points are
    joined by quads (or a triangle fan at a pole). The profile should run
    from the bottom pole (or rim) up the outside and back down the inside.
    """
    cx, cy, cz = center
    rings = []
    for r, z in profile:
        if r <= 1e-6:
            rings.append(bm.verts.new((cx, cy, cz + z)))
        else:
            ring = []
            for k in range(segs):
                a = 2 * math.pi * k / segs
                ring.append(bm.verts.new((cx + r * math.cos(a), cy + r * math.sin(a), cz + z)))
            rings.append(ring)
    for a, b in zip(rings[:-1], rings[1:]):
        if isinstance(a, list) and isinstance(b, list):
            for k in range(segs):
                n = (k + 1) % segs
                bm.faces.new((a[k], a[n], b[n], b[k]))
        elif isinstance(a, list):
            for k in range(segs):
                bm.faces.new((a[k], a[(k + 1) % segs], b))
        elif isinstance(b, list):
            for k in range(segs):
                bm.faces.new((a, b[(k + 1) % segs], b[k]))


def _round_edges(bm, offset, segments=4, edges=None, vertical_only=False):
    """bmesh bevel of (a subset of) edges — rounded corners before the modifiers."""
    if edges is None:
        edges = list(bm.edges)
    if vertical_only:
        edges = [e for e in edges if abs((e.verts[0].co - e.verts[1].co).normalized().z) > 0.99]
    bmesh.ops.bevel(bm, geom=edges, offset=offset, offset_type="OFFSET", segments=segments, profile=0.5, affect="EDGES", clamp_overlap=True)


def _grid(bm, x0, x1, y0, y1, nx, ny, z=0.0, fn=None):
    """Quad grid; fn(x, y) -> z offset (soft folds, leaves)."""
    rows = []
    for j in range(ny + 1):
        row = []
        for i in range(nx + 1):
            x = x0 + (x1 - x0) * i / nx
            y = y0 + (y1 - y0) * j / ny
            row.append(bm.verts.new((x, y, z + (fn(x, y) if fn else 0.0))))
        rows.append(row)
    faces = []
    for j in range(ny):
        for i in range(nx):
            faces.append(bm.faces.new((rows[j][i], rows[j][i + 1], rows[j + 1][i + 1], rows[j + 1][i])))
    return rows, faces


def _finish_mesh(bm, name, smooth=True):
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    if smooth:
        meshutil.smooth_by_angle(bm)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    return me


def _obj(name, bm, coll, location=(0.0, 0.0, 0.0), rotation=(0.0, 0.0, 0.0), smooth=True, mat=None, materials=None, bevel=BEVEL_W, segments=BEVEL_SEGS):
    """Mesh object from a local-space bmesh, placed, with material and bevel."""
    me = _finish_mesh(bm, name, smooth)
    ob = bpy.data.objects.new(name, me)
    ob.location = location
    ob.rotation_euler = Euler(rotation, "XYZ")
    ob["interior"] = True
    coll.objects.link(ob)
    if mat is not None:
        _assign(ob, mat, materials)
    if bevel:
        _bevel(ob, bevel, segments, materials)
    return ob


def _assign(ob, mat, materials=None):
    """Assign a material by SPEC name (through `materials`) or a Material datablock."""
    if isinstance(mat, bpy.types.Material):
        if len(ob.data.materials) == 0:
            ob.data.materials.append(mat)
        else:
            ob.data.materials[0] = mat
        return mat
    if materials is not None and hasattr(materials, "apply"):
        return materials.apply(ob, mat)
    return matlib.apply(ob, mat)


def _bevel(ob, width=BEVEL_W, segments=BEVEL_SEGS, materials=None):
    fn = getattr(materials, "add_bevel", None) or matlib.add_bevel
    return fn(ob, width, segments)


def _subsurf(ob, levels=1, render_levels=None):
    m = ob.modifiers.new("subd", "SUBSURF")
    m.subdivision_type = "CATMULL_CLARK"
    m.levels = levels
    m.render_levels = levels if render_levels is None else render_levels
    return m


def _apply_modifiers(ob):
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(ob.evaluated_get(dg), preserve_all_data_layers=False, depsgraph=dg)
    old = ob.data
    me.name = old.name
    ob.modifiers.clear()
    ob.data = me
    if old.users == 0:
        bpy.data.meshes.remove(old)


def _soft(ob, round_w=0.04, round_segs=4, subd=1):
    """Soft furniture: rounded bevel + subdivision (the bmesh box stays simple)."""
    for m in list(ob.modifiers):
        if m.type == "BEVEL":
            ob.modifiers.remove(m)
    b = ob.modifiers.new("round", "BEVEL")
    b.width = round_w
    b.segments = round_segs
    b.limit_method = "ANGLE"
    b.angle_limit = math.radians(30)
    b.use_clamp_overlap = True
    _subsurf(ob, subd, subd)
    return ob


# ---------------------------------------------------------------------------
# Local materials (things the SPEC table has no entry for), built with the
# node helpers of materials.py so they match its look. Cached as "int_<name>".
# ---------------------------------------------------------------------------
def _local(name, builder, *args):
    m = _LOCAL_MATS.get(name)
    if m is not None:
        try:
            if m.name in bpy.data.materials and bpy.data.materials[m.name] == m:
                return m
        except ReferenceError:
            pass
    full = "int_" + name
    ex = bpy.data.materials.get(full)
    if ex is not None and ex.get("ecodomcek_interior") == name:
        _LOCAL_MATS[name] = ex
        return ex
    m = bpy.data.materials.new(full)
    m["ecodomcek_interior"] = name
    builder(matlib._B(m), *args)
    _LOCAL_MATS[name] = m
    return m


def _rgb(key, mul=1.0, tint=(1.0, 1.0, 1.0)):
    return matlib.rgb(_COLORS.get(key, key), mul, tint)


def _m_ceramic(b, base, rough=0.35, coat=0.3, speck=0.04):
    co = b.obj_co()
    fine = b.noisef(co, 400.0, detail=2.0)
    low = b.noisef(co, 4.0, detail=2.0)
    color = b.scale_color(_rgb(base), b.add(1.0, b.centred(low, 0.04)))
    color = b.scale_color(color, b.add(1.0, b.centred(fine, speck)))
    r = b.add(rough, b.centred(fine, 0.05))
    n = b.bump(fine, 0.05, 0.001)
    n = b.bevel(n, 0.002)
    p = b.principled(color, r, n, spec_level=0.5, coat=coat, coat_rough=0.2)
    b.finish(p)


def _m_soil(b):
    co = b.obj_co()
    crumbs = b.voronoi(co, 300.0, "F1")
    dome = b.mapr(crumbs.outputs["Distance"], 0.0, 0.6, 1.0, 0.0)
    cr, _, _ = b.separate(crumbs.outputs["Color"])
    low = b.noisef(co, 8.0, detail=3.0)
    color = b.scale_color(_rgb("soil"), b.madd(cr, 0.5, 0.75))
    color = b.scale_color(color, b.add(1.0, b.centred(low, 0.2)))
    n = b.bump(b.add(dome, b.mul(low, 0.3)), 0.8, 0.004)
    p = b.principled(color, 0.95, n, spec_level=0.2)
    b.finish(p)


def _m_leaf(b):
    co = b.obj_co()
    var = b.noisef(co, 3.0, detail=2.0)
    veins = b.noisef(co, 120.0, detail=3.0, rough=0.6)
    color = b.mixc(var, _rgb("leaf"), _rgb("leaf", 1.3, (1.0, 1.06, 0.88)))
    color = b.scale_color(color, b.add(1.0, b.centred(veins, 0.08)))
    n = b.bump(veins, 0.15, 0.001)
    p = b.principled(color, 0.42, n, spec_level=0.5, coat=0.3, coat_rough=0.25)
    tr = b.node("ShaderNodeBsdfTranslucent")
    b.set(tr, "Color", _rgb("leaf_light"))
    mix = b.node("ShaderNodeMixShader")
    b.set(mix, 0, 0.3)
    b.links.new(p.outputs[0], mix.inputs[1])
    b.links.new(tr.outputs[0], mix.inputs[2])
    b.output(mix.outputs[0])


def _m_stem(b):
    co = b.obj_co()
    x, y, z = b.separate(co)
    bark = b.noisef(b.combine(b.mul(x, 30.0), b.mul(y, 30.0), b.mul(z, 3.0)), 8.0, detail=3.0)
    color = b.scale_color(_rgb("stem"), b.add(1.0, b.centred(bark, 0.25)))
    n = b.bump(bark, 0.3, 0.001)
    p = b.principled(color, 0.7, n, spec_level=0.3)
    b.finish(p)


def _m_paper(b):
    co = b.obj_co()
    x, y, z = b.separate(co)
    leaves = b.noisef(b.combine(x, y, b.mul(z, 400.0)), 30.0, detail=2.0)
    color = b.scale_color(_rgb("paper"), b.add(1.0, b.centred(leaves, 0.12)))
    n = b.bump(leaves, 0.3, 0.0005)
    p = b.principled(color, 0.85, n, spec_level=0.3)
    b.finish(p)


def _m_cover(b, base):
    co = b.obj_co()
    cloth = b.noisef(co, 500.0, detail=2.0)
    low = b.noisef(co, 6.0, detail=2.0)
    color = b.scale_color(_rgb(base), b.add(1.0, b.centred(low, 0.06)))
    color = b.scale_color(color, b.add(1.0, b.centred(cloth, 0.06)))
    n = b.bump(cloth, 0.12, 0.0006)
    n = b.bevel(n, 0.0015)
    p = b.principled(color, 0.6, n, spec_level=0.4, sheen=0.3, sheen_rough=0.5)
    b.finish(p)


def _m_steel(b):
    x, y, z = b.separate(b.obj_co())
    brushed = b.noisef(b.combine(b.mul(x, 2.0), b.mul(y, 2.0), b.mul(z, 80.0)), 25.0, detail=3.0)
    rough = b.add(0.32, b.centred(brushed, 0.06))
    n = b.bump(brushed, 0.04, 0.0005)
    n = b.bevel(n, 0.002)
    p = b.principled(_rgb("steel"), rough, n, spec_level=0.5, metallic=1.0)
    b.finish(p)


def _m_black_glass(b):
    co = b.obj_co()
    smudge = b.noisef(co, 6.0, detail=3.0)
    rough = b.add(0.05, b.mul(smudge, 0.04))
    n = b.bevel(None, 0.002)
    p = b.principled(_rgb("black_glass"), rough, n, spec_level=0.6, coat=1.0, coat_rough=0.03)
    b.finish(p)


def _m_flat(b, base, rough, spec_level=0.4):
    n = b.bevel(None, 0.002)
    p = b.principled(_rgb(base), rough, n, spec_level=spec_level)
    b.finish(p)


def _m_bulb(b):
    e = b.node("ShaderNodeEmission")
    e.name = "Emission"
    b.set(e, "Color", (*BULB_COLOR, 1.0))
    b.set(e, "Strength", PENDANT_STRENGTH)
    b.output(e.outputs[0])


def _m_fabric(b, base):
    matlib._fabric(b, _COLORS[base], 0.5, 700.0, 3.0, 0.012, 0.9, 0.06)


def _m_rug(b, base, stripe, half_w, sheen=0.5):
    """Flat-weave wool: base colour, dark woven stripes near the long edges
    (local |y| bands), fine weave bump and a soft pile mottle."""
    co = b.obj_co()
    x, y, z = b.separate(co)
    ay = b.absv(y)

    def band(a0, a1):
        return b.mul(b.smooth(ay, a0 - 0.004, a0, 0.0, 1.0), b.smooth(ay, a1, a1 + 0.004, 1.0, 0.0))

    stripes = b.maxv(band(half_w - 0.50, half_w - 0.47), band(half_w - 0.43, half_w - 0.40))
    stripes = b.maxv(stripes, band(half_w - 0.34, half_w - 0.24))
    stripes = b.maxv(stripes, band(half_w - 0.10, half_w - 0.07))
    w1 = b.wave(co, 420.0, direction="X").outputs["Factor"]
    w2 = b.wave(co, 420.0, direction="Y").outputs["Factor"]
    weave = b.mul(b.add(w1, w2), 0.5)
    pile = b.noisef(co, 60.0, detail=3.0, rough=0.6)
    mottle = b.noisef(b.vmath("ADD", co, (3.0, 1.0, 0.0)), 2.5, detail=2.0)
    heather = b.noisef(co, 220.0, detail=2.0)
    color = b.mixc(stripes, _rgb(base), _rgb(stripe))
    color = b.scale_color(color, b.add(1.0, b.centred(mottle, 0.08)))
    color = b.scale_color(color, b.add(1.0, b.centred(pile, 0.14)))
    color = b.scale_color(color, b.add(1.0, b.centred(heather, 0.1)))
    rough = b.add(0.93, b.centred(heather, 0.04))
    n = b.bump(b.add(b.mul(pile, 0.6), b.mul(weave, 0.4)), 0.5, 0.003)
    p = b.principled(color, rough, n, spec_level=0.25, sheen=sheen, sheen_rough=0.6)
    b.finish(p)


def _lm(name):
    """Local material by short name."""
    table = {
        "ceramic": (_m_ceramic, "ceramic"),
        "ceramic_dark": (_m_ceramic, "ceramic_dark", 0.5, 0.05, 0.06),
        "lemon": (_m_ceramic, "lemon", 0.45, 0.12, 0.12),
        "soil": (_m_soil,),
        "leaf": (_m_leaf,),
        "stem": (_m_stem,),
        "paper": (_m_paper,),
        "steel": (_m_steel,),
        "black_glass": (_m_black_glass,),
        "shade_inner": (_m_flat, "shade_inner", 0.5),
        "bulb": (_m_bulb,),
        "fabric_ochre": (_m_fabric, "fabric_ochre"),
        "rug": (_m_rug, "rug", "rug_stripe", RUG["size"][1] / 2),
        "rug_bed": (_m_rug, "rug_bed", "rug_stripe", 0.35, 0.6),
    }
    if name.startswith("book_"):
        return _local(name, _m_cover, name)
    spec_ = table[name]
    return _local(name, spec_[0], *spec_[1:])


# ---------------------------------------------------------------------------
# Floor finish and skirting
# ---------------------------------------------------------------------------
def _find(house, key, name):
    coll = (house or {}).get(key)
    if coll is None:
        return bpy.data.objects.get(name)
    for ob in coll.objects:
        if ob.name == name or ob.name.startswith(name):
            return ob
    return None


def _floor_finish(coll, materials, house):
    """20 mm oak on the screed, up to the lining and laid around the stair strings."""
    bm = bmesh.new()
    _box(bm, (X0I - EPS, X1I + EPS, LINING_FACE_Y - 0.001, Y1I + EPS, SCREED_TOP - EPS, FLOOR))
    ob = _obj("floor_finish", bm, coll, smooth=False, mat="oak_floor", materials=materials, bevel=0)
    strings = _find(house, "stair", "stair_stringers")
    if strings is not None:
        m = ob.modifiers.new("cut_stringers", "BOOLEAN")
        m.operation = "DIFFERENCE"
        m.solver = "EXACT"
        m.object = strings
        _apply_modifiers(ob)
    try:
        ob.data.shade_smooth()
    except AttributeError:
        ob.data.polygons.foreach_set("use_smooth", [True] * len(ob.data.polygons))
    _bevel(ob, BEVEL_W, BEVEL_SEGS, materials)
    return ob


def _skirting(coll, materials):
    h, t = SKIRTING
    gx, dx = spec.GLAZING["x"], spec.DOOR["x"]
    d = 0.001  # pushed 1 mm into the wall: no coplanar back faces
    segs = [
        (X0I - d, X0I + t, LINING_FACE_Y, Y1I - t),  # left wall
        (X0I - d, gx[0], Y1I - t, Y1I + d),  # front wall, left of the glazing
        (gx[1], dx[0], Y1I - t, Y1I + d),  # between the glazing and the door
        (dx[1], X1I + d, Y1I - t, Y1I + d),  # right of the door
        (X1I - t, X1I + d, 3.32, Y1I - t),  # right wall in front of the stair foot
        (X1I - t, X1I + d, LINING_FACE_Y, -0.92),  # right wall behind the stair top
    ]
    bm = bmesh.new()
    for x0, x1, y0, y1 in segs:
        _box(bm, (x0, x1, y0, y1, FLOOR - EPS, FLOOR + h))
    return _obj("skirting", bm, coll, mat="plaster", materials=materials, bevel=0.002)


# ---------------------------------------------------------------------------
# Small objects
# ---------------------------------------------------------------------------
def _box_m(bm, b, M):
    faces = _box(bm, b)
    verts = list({v for f in faces for v in f.verts})
    bmesh.ops.transform(bm, matrix=M, verts=verts)
    return faces


def _book(coll, materials, name, w, h, t, cover, M, pages_bm=None):
    """Hardback: bottom/top boards + spine in `cover`, page block in paper.
    Local frame: spine on −X, fore-edge +X, lying flat on z = 0; M places it."""
    c = 0.0025
    bm = bmesh.new()
    for b in ((-w / 2, w / 2, -h / 2, h / 2, 0.0, c), (-w / 2, w / 2, -h / 2, h / 2, t - c, t), (-w / 2, -w / 2 + c, -h / 2, h / 2, 0.0, t)):
        _box_m(bm, b, M)
    ob = _obj(name, bm, coll, mat=_lm(cover), materials=materials, bevel=0.0012)
    own = pages_bm is None
    pb = bmesh.new() if own else pages_bm
    _box_m(pb, (-w / 2 + c - 0.0005, w / 2 - 0.003, -h / 2 + 0.004, h / 2 - 0.004, c - 0.0004, t - c + 0.0004), M)
    if own:
        _obj(name + "_pages", pb, coll, mat=_lm("paper"), materials=materials, bevel=0.0008)
    return ob


def _book_stack(coll, materials, name, books, at, yaw=0.0):
    """books: [(w, h, t, cover, dyaw, dx, dy)] bottom → top, placed at `at` (x, y, z)."""
    z = 0.0
    pb = bmesh.new()
    for k, (w, h, t, cover, dyaw, ddx, ddy) in enumerate(books):
        M = Matrix.Translation((at[0] + ddx, at[1] + ddy, at[2] + z)) @ Matrix.Rotation(yaw + dyaw, 4, "Z")
        _book(coll, materials, f"{name}_{k}", w, h, t, cover, M, pages_bm=pb)
        z += t
    _obj(name + "_pages", pb, coll, mat=_lm("paper"), materials=materials, bevel=0.0008)


def _bowl(coll, materials, name, at, r=0.13, h=0.08, mat="ceramic"):
    p = [(0.0, 0.0), (r * 0.42, 0.0), (r * 0.7, h * 0.15), (r * 0.93, h * 0.62), (r, h), (r * 0.93, h * 1.02), (r * 0.86, h * 0.75), (r * 0.62, h * 0.25), (0.0, h * 0.16)]
    bm = bmesh.new()
    _lathe(bm, p, 48)
    return _obj(name, bm, coll, location=at, mat=_lm(mat), materials=materials, bevel=0.0015)


def _mug(coll, materials, name, at, yaw):
    p = [(0.0, 0.0), (0.033, 0.0), (0.04, 0.008), (0.04, 0.09), (0.036, 0.09), (0.036, 0.012), (0.0, 0.012)]
    bm = bmesh.new()
    _lathe(bm, p, 32)
    _polyline_tube(bm, [(0.038, 0.0, 0.072), (0.06, 0.0, 0.07), (0.067, 0.0, 0.05), (0.06, 0.0, 0.03), (0.038, 0.0, 0.028)], 0.006, 10)
    return _obj(name, bm, coll, location=at, rotation=(0.0, 0.0, yaw), mat=_lm("ceramic"), materials=materials, bevel=0.0015)


def _kettle(coll, materials, name, at, yaw):
    bm = bmesh.new()
    _cyl(bm, 0.075, 0.0, 0.17, (0.0, 0.0), 40, r_top=0.07)
    _cyl(bm, 0.07, 0.17, 0.19, (0.0, 0.0), 40, r_top=0.052)
    _cyl(bm, 0.03, 0.19, 0.2, (0.0, 0.0), 24)
    _sphere(bm, (0.0, 0.0, 0.212), 0.012)
    arc = [(0.0, 0.06 * math.cos(a), 0.19 + 0.075 * math.sin(a)) for a in (math.radians(v) for v in (180, 150, 120, 90, 60, 30, 0))]
    _polyline_tube(bm, arc, 0.009, 12)
    _tube(bm, (0.06, 0.0, 0.12), (0.115, 0.0, 0.195), 0.012, 12)
    _sphere(bm, (0.115, 0.0, 0.195), 0.012)
    return _obj(name, bm, coll, location=at, rotation=(0.0, 0.0, yaw), mat="steel_black", materials=materials, bevel=0.002)


def _bar_handle(bm, cx, y_face, cz, length, dir_y=1.0):
    """Black bar handle on a front whose face is at y_face, protruding in dir_y."""
    yb = y_face + dir_y * 0.035
    _tube(bm, (cx - length / 2, yb, cz), (cx + length / 2, yb, cz), 0.005, 12)
    for sx in (-1, 1):
        x = cx + sx * (length / 2 - 0.03)
        _tube(bm, (x, y_face + dir_y * 0.001, cz), (x, yb, cz), 0.0045, 10)


# ---------------------------------------------------------------------------
# Kitchen
# ---------------------------------------------------------------------------
def _kitchen(coll, materials):
    kx0, kx1 = spec.KITCHEN["x"]
    depth = spec.KITCHEN["depth"]
    yb = KITCHEN_BACK_Y
    y_front = yb + depth - 0.02  # face of the fronts; the worktop overhangs 20 mm
    yf_carc = y_front - KITCHEN_FRONT_T
    z_wt_top = FLOOR + spec.KITCHEN["h"]  # 1.05
    z_wt_bot = z_wt_top - KITCHEN_WORKTOP_T
    tk_h, tk_r = KITCHEN_TOE_KICK
    z_carc0 = FLOOR + tk_h
    cx0, cx1 = spec.KITCHEN["column_x"]
    z_col_top = FLOOR + KITCHEN_COLUMN_H
    g = KITCHEN_GAP

    bm = bmesh.new()
    _box(bm, (kx0 + tk_r, cx1 - tk_r, yb - EPS, y_front - tk_r, FLOOR - EPS, z_carc0 + EPS))
    _obj("kitchen_toekick", bm, coll, mat="anthracite", materials=materials)

    bm = bmesh.new()
    _box(bm, (kx0, cx0 + EPS, yb - EPS, yf_carc + EPS, z_carc0, z_wt_bot + EPS))
    _obj("kitchen_carcass", bm, coll, mat="oak_white", materials=materials)
    bm = bmesh.new()
    _box(bm, (cx0, cx1, yb - EPS, yf_carc + EPS, z_carc0, z_col_top))
    _obj("kitchen_column", bm, coll, mat="oak_white", materials=materials)

    # fronts of the run, one object each
    handles = bmesh.new()
    x = kx0
    k = 0
    z0, z1 = z_carc0 + g, z_wt_bot - g
    for w, kind in KITCHEN_FRONTS:
        xa, xb = x + g / 2, x + w - g / 2
        if kind == "door":
            panels = [(xa, xb, z0, z1)]
            _bar_handle(handles, (xa + xb) / 2, y_front, z1 - 0.06, 0.20)
        elif kind == "doors":
            m = (xa + xb) / 2
            panels = [(xa, m - g / 2, z0, z1), (m + g / 2, xb, z0, z1)]
            _bar_handle(handles, (xa + m) / 2, y_front, z1 - 0.06, 0.20)
            _bar_handle(handles, (m + xb) / 2, y_front, z1 - 0.06, 0.20)
        elif kind == "drawers2":
            zm = z1 - 0.16
            panels = [(xa, xb, zm + g / 2, z1), (xa, xb, z0, zm - g / 2)]
            for fz0, fz1 in ((zm + g / 2, z1), (z0, zm - g / 2)):
                _bar_handle(handles, (xa + xb) / 2, y_front, (fz0 + fz1) / 2, 0.30)
        else:  # drawers3
            hh = z1 - z0
            zs = [z0, z0 + 0.38 * hh, z0 + 0.70 * hh, z1]
            panels = [(xa, xb, zs[i] + g / 2, zs[i + 1] - g / 2) for i in range(3)]
            for i in range(3):
                _bar_handle(handles, (xa + xb) / 2, y_front, (zs[i] + zs[i + 1]) / 2, 0.30)
        for fx0, fx1, fz0, fz1 in panels:
            bm = bmesh.new()
            _box(bm, (fx0, fx1, yf_carc, y_front, fz0, fz1))
            _obj(f"kitchen_front_{k}", bm, coll, mat="oak_white", materials=materials, bevel=0.0015)
            k += 1
        x += w

    # tall column fronts: bottom door, oven, top door
    z_oven = (z_wt_top, z_wt_top + 0.60)
    for fz0, fz1, kind in ((z0, z_oven[0] - g, "door"), (z_oven[0] + g, z_oven[1] - g, "oven"), (z_oven[1] + g, z_col_top - g, "door")):
        bm = bmesh.new()
        _box(bm, (cx0 + g / 2, cx1 - g / 2, yf_carc, y_front, fz0, fz1))
        if kind == "oven":
            _obj("kitchen_oven", bm, coll, mat=_lm("black_glass"), materials=materials, bevel=0.0015)
            _bar_handle(handles, (cx0 + cx1) / 2, y_front, fz1 - 0.05, 0.50)
        else:
            _obj(f"kitchen_front_{k}", bm, coll, mat="oak_white", materials=materials, bevel=0.0015)
            _bar_handle(handles, (cx0 + cx1) / 2, y_front, fz1 - 0.06 if fz0 < z_wt_top else fz0 + 0.06, 0.20)
            k += 1
    _obj("kitchen_handles", handles, coll, mat="steel_black", materials=materials, bevel=0.001)

    # worktop with the sink cut-out
    sx0, sx1 = SINK["x"]
    sy0 = yb + 0.12
    sy1 = sy0 + SINK["d"]
    bm = bmesh.new()
    _box(bm, (kx0 - 0.02, cx0 + EPS, yb - EPS, yb + depth, z_wt_bot, z_wt_top))
    wt = _obj("kitchen_worktop", bm, coll, smooth=False, mat="anthracite", materials=materials, bevel=0)
    bm = bmesh.new()
    _box(bm, (sx0, sx1, sy0, sy1, z_wt_bot - 0.01, z_wt_top + 0.01))
    cutter = _obj("kitchen_sink_cutter", bm, coll, smooth=False, bevel=0)
    m = wt.modifiers.new("cut_sink", "BOOLEAN")
    m.operation = "DIFFERENCE"
    m.solver = "EXACT"
    m.object = cutter
    _apply_modifiers(wt)
    bpy.data.objects.remove(cutter, do_unlink=True)
    try:
        wt.data.shade_smooth()
    except AttributeError:
        wt.data.polygons.foreach_set("use_smooth", [True] * len(wt.data.polygons))
    _bevel(wt, 0.002, BEVEL_SEGS, materials)

    # undermount steel basin (open box + solidify), tap
    bm = bmesh.new()
    faces = _box(bm, (sx0 + 0.001, sx1 - 0.001, sy0 + 0.001, sy1 - 0.001, z_wt_top - SINK["h"], z_wt_top - 0.004))
    top = max(faces, key=lambda f: f.calc_center_median().z)
    bmesh.ops.delete(bm, geom=[top], context="FACES")
    basin = _obj("kitchen_sink", bm, coll, mat=_lm("steel"), materials=materials, bevel=0.003)
    sol = basin.modifiers.new("shell", "SOLIDIFY")
    sol.thickness = 0.0015
    sol.offset = -1.0
    basin.modifiers.move(len(basin.modifiers) - 1, 0)
    tx, ty = (sx0 + sx1) / 2, sy0 + 0.06
    bm = bmesh.new()
    _cyl(bm, 0.02, z_wt_top - 0.001, z_wt_top + 0.008, (tx, ty), 24)
    _polyline_tube(bm, [(tx, ty, z_wt_top), (tx, ty, z_wt_top + 0.26), (tx, ty + 0.05, z_wt_top + 0.32), (tx, ty + 0.15, z_wt_top + 0.33), (tx, ty + 0.23, z_wt_top + 0.28)], 0.011, 16)
    _tube(bm, (tx, ty, z_wt_top + 0.20), (tx - 0.02, ty - 0.05, z_wt_top + 0.24), 0.005, 10)  # lever
    _obj("kitchen_tap", bm, coll, mat=_lm("steel"), materials=materials, bevel=0.0015)

    # induction hob: black glass 4 mm proud of the worktop
    bm = bmesh.new()
    _box(bm, (HOB["x"][0], HOB["x"][1], yb + 0.06, yb + 0.06 + HOB["d"], z_wt_top - 0.001, z_wt_top + 0.004))
    _obj("kitchen_hob", bm, coll, mat=_lm("black_glass"), materials=materials, bevel=0.0015)

    # things on the worktop
    zt = z_wt_top
    _bowl(coll, materials, "kitchen_bowl", (-2.98, yb + 0.30, zt), 0.13, 0.08)
    bm = bmesh.new()
    for k, (dx, dy) in enumerate(((-0.035, 0.02), (0.035, 0.025), (0.0, -0.035))):
        _sphere(bm, (-2.98 + dx, yb + 0.30 + dy, zt + 0.014 + 0.028), 0.03, 20, 10)
    lem = _obj("kitchen_lemons", bm, coll, mat=_lm("lemon"), materials=materials, bevel=0)
    lem.scale = (1.0, 1.0, 0.9)
    # oak board leaning against the spruce wall
    bm = bmesh.new()
    _box(bm, (-0.19, 0.19, -0.009, 0.009, 0.0, 0.26))
    _obj("kitchen_board", bm, coll, location=(-3.12, yb + 0.0765, zt + 0.0024), rotation=(math.radians(15), 0.0, 0.0), mat="oak", materials=materials, bevel=0.003)
    _kettle(coll, materials, "kitchen_kettle", (-0.45, yb + 0.36, zt), math.radians(-25))
    _mug(coll, materials, "kitchen_mug_0", (-0.68, yb + 0.22, zt), math.radians(140))
    _mug(coll, materials, "kitchen_mug_1", (-0.79, yb + 0.33, zt), math.radians(50))
    _book_stack(
        coll, materials, "kitchen_books",
        [(0.22, 0.29, 0.028, "book_forest", 0.0, 0.0, 0.0), (0.20, 0.26, 0.022, "book_chalk", math.radians(7), 0.01, -0.01)],
        (-1.12, yb + 0.20, zt), math.radians(4),
    )


# ---------------------------------------------------------------------------
# Dining table and chairs
# ---------------------------------------------------------------------------
def _dining_table(coll, materials):
    tx0, tx1 = spec.TABLE["x"]
    ty0, ty1 = spec.TABLE["y"]
    h = spec.TABLE["h"]
    cx, cy = (tx0 + tx1) / 2, (ty0 + ty1) / 2
    L, W = tx1 - tx0, ty1 - ty0
    # top: built with its length along local Y so the oak grain runs along it, then turned 90°
    bm = bmesh.new()
    _box(bm, (-W / 2, W / 2, -L / 2, L / 2, -TABLE_TOP_T, 0.0))
    _round_edges(bm, 0.008, 2, vertical_only=True)
    _obj("table_top", bm, coll, location=(cx, cy, FLOOR + h), rotation=(0.0, 0.0, math.radians(90)), mat="oak", materials=materials, bevel=0.003)
    # black steel frame: four 40 × 40 legs and an apron
    bm = bmesh.new()
    leg = TABLE_LEG
    z1 = FLOOR + h - TABLE_TOP_T + EPS
    ix, iy = 0.16, 0.10
    for sx in (-1, 1):
        for sy in (-1, 1):
            lx, ly = cx + sx * (L / 2 - ix), cy + sy * (W / 2 - iy)
            _box(bm, (lx - leg / 2, lx + leg / 2, ly - leg / 2, ly + leg / 2, FLOOR - EPS, z1))
    for sy in (-1, 1):
        ly = cy + sy * (W / 2 - iy)
        _box(bm, (cx - (L / 2 - ix), cx + (L / 2 - ix), ly - 0.01, ly + 0.01, z1 - 0.07, z1))
    for sx in (-1, 1):
        lx = cx + sx * (L / 2 - ix)
        _box(bm, (lx - 0.01, lx + 0.01, cy - (W / 2 - iy), cy + (W / 2 - iy), z1 - 0.07, z1))
    _obj("table_frame", bm, coll, mat="steel_black", materials=materials, bevel=0.002)


def _arc_band(bm, R, t, half, yc, z0, z1, n=12):
    """Curved strip (chair backrest): radius R, thickness t, half-angle `half`,
    arc centre at (0, yc); concave toward +Y."""
    outer, inner = [], []
    for k in range(n + 1):
        a = -half + 2 * half * k / n
        outer.append((R * math.sin(a), yc - R * math.cos(a)))
        inner.append(((R - t) * math.sin(a), yc - (R - t) * math.cos(a)))
    vo = [[bm.verts.new((x, y, z)) for (x, y) in outer] for z in (z0, z1)]
    vi = [[bm.verts.new((x, y, z)) for (x, y) in inner] for z in (z0, z1)]
    for k in range(n):
        bm.faces.new((vo[0][k], vo[0][k + 1], vo[1][k + 1], vo[1][k]))
        bm.faces.new((vi[0][k + 1], vi[0][k], vi[1][k], vi[1][k + 1]))
        bm.faces.new((vo[1][k], vo[1][k + 1], vi[1][k + 1], vi[1][k]))
        bm.faces.new((vo[0][k + 1], vo[0][k], vi[0][k], vi[0][k + 1]))
    bm.faces.new((vo[0][0], vo[1][0], vi[1][0], vi[0][0]))
    bm.faces.new((vo[1][n], vo[0][n], vi[0][n], vi[1][n]))


def _chair(coll, materials, name, at, yaw):
    """Oak seat and curved backrest on a black steel frame. Local frame: seat
    centred at the origin on the floor, facing +Y (the back on −Y)."""
    c = CHAIR
    sw, sd, sh, st = c["seat_w"], c["seat_d"], c["seat_h"], c["seat_t"]
    rot = (0.0, 0.0, yaw)
    bm = bmesh.new()
    _box(bm, (-sw / 2, sw / 2, -sd / 2, sd / 2, sh - st, sh))
    _round_edges(bm, 0.03, 4, vertical_only=True)
    _obj(name + "_seat", bm, coll, at, rot, mat="oak", materials=materials, bevel=0.003)
    R, t = 0.55, 0.014
    half = math.asin((sw / 2 - 0.01) / R)
    y_back = -sd / 2 - 0.025
    bm = bmesh.new()
    _arc_band(bm, R, t, half, y_back + R, c["back_h"] - 0.14, c["back_h"])
    _obj(name + "_back", bm, coll, at, rot, mat="oak", materials=materials, bevel=0.003)
    # frame: rear posts up into the backrest, front legs to the seat, side rails
    xp, yp = (R - t / 2) * math.sin(half), y_back + R - (R - t / 2) * math.cos(half)
    r = c["leg_r"]
    bm = bmesh.new()
    for sx in (-1, 1):
        _tube(bm, (sx * 0.19, -0.16, -EPS), (sx * xp, yp, c["back_h"] - 0.03), r, 12)
        _tube(bm, (sx * 0.19, 0.15, -EPS), (sx * 0.185, 0.14, sh - st + 0.004), r, 12)
        _box(bm, (sx * 0.19 - 0.006, sx * 0.19 + 0.006, -0.16, 0.15, 0.395, 0.425))
    _obj(name + "_frame", bm, coll, at, rot, mat="steel_black", materials=materials, bevel=0.0015)


def _chairs(coll, materials):
    tx0, tx1 = spec.TABLE["x"]
    ty0, ty1 = spec.TABLE["y"]
    xs = [tx0 + 0.35, (tx0 + tx1) / 2, tx1 - 0.35]
    k = 0
    for side in (-1, 1):  # −1: the −Y side (backs to the living camera), facing +Y
        y = (ty0 - 0.22) if side < 0 else (ty1 + 0.22)
        yaw0 = 0.0 if side < 0 else math.pi
        for i, x in enumerate(xs):
            dx, dy, dyaw = 0.0, 0.0, math.radians((-4, 3, 2, -3, 5, -2)[k])
            if k == 0:  # one chair pulled out and turned, lived-in
                dx, dy, dyaw = -0.08, -0.22, math.radians(-18)
            _chair(coll, materials, f"chair_{k}", (x + dx, y + dy * (1 if side < 0 else -1), FLOOR), yaw0 + dyaw)
            k += 1


# ---------------------------------------------------------------------------
# Sofa, coffee table, rug
# ---------------------------------------------------------------------------
def _sofa(coll, materials):
    s = spec.SOFA
    W, D = s["w"], s["d"]
    at = (s["x_center"], s["y"], FLOOR)
    arm_w, back_d, foot_h = 0.16, 0.20, 0.08
    base_top, cushion_h = 0.28, 0.14

    def part(name, b, mat="fabric_grey", round_w=0.03, segs=4, subd=1, rot=(0.0, 0.0, 0.0), loc=at):
        bm = bmesh.new()
        _box(bm, b)
        ob = _obj(name, bm, coll, loc, rot, mat=mat, materials=materials, bevel=0)
        _soft(ob, round_w, segs, subd)
        return ob

    part("sofa_base", (-W / 2 + arm_w - EPS, W / 2 - arm_w + EPS, -D / 2, D / 2, foot_h, base_top), round_w=0.02)
    for sx, nm in ((-1, "l"), (1, "r")):
        x0 = min(sx * W / 2, sx * (W / 2 - arm_w))
        part(f"sofa_arm_{nm}", (x0, x0 + arm_w, -D / 2, D / 2, foot_h, 0.56))
    part("sofa_back", (-W / 2 + arm_w - EPS, W / 2 - arm_w + EPS, -D / 2, -D / 2 + back_d, base_top - 0.02, 0.74))
    # seat cushions
    cw = (W - 2 * arm_w - 0.01) / 2
    cd = D - back_d - 0.015
    for sx, nm in ((-1, "l"), (1, "r")):
        x0 = sx * 0.005 + (sx - 1) / 2 * cw
        part(f"sofa_seat_{nm}", (x0, x0 + cw, -D / 2 + back_d + 0.005, -D / 2 + back_d + 0.005 + cd, base_top - 0.005, base_top + cushion_h), round_w=0.05, segs=5, subd=2)
    # back cushions leaning 12° against the back
    tilt = math.radians(12)
    ch, ct = 0.40, 0.15
    y_face = -D / 2 + back_d
    for sx, nm in ((-1, "l"), (1, "r")):
        loc = (at[0] + sx * (cw / 2 + 0.005), at[1] + y_face + ch * math.sin(tilt) + 0.005, at[2] + base_top + cushion_h - 0.02)
        part(f"sofa_backcushion_{nm}", (-cw / 2 + 0.01, cw / 2 - 0.01, 0.0, ct, 0.0, ch), round_w=0.05, segs=5, subd=2, rot=(tilt, 0.0, 0.0), loc=loc)
    # throw pillows and a folded throw
    z_seat = at[2] + base_top + cushion_h - 0.01
    part("sofa_pillow_0", (-0.22, 0.22, 0.0, 0.12, 0.0, 0.44), mat="linen", round_w=0.05, segs=5, subd=2, rot=(math.radians(18), 0.0, math.radians(14)), loc=(at[0] - W / 2 + arm_w + 0.30, at[1] + y_face + ct + 0.10, z_seat))
    part("sofa_pillow_1", (-0.22, 0.22, 0.0, 0.12, 0.0, 0.44), mat=_lm("fabric_ochre"), round_w=0.05, segs=5, subd=2, rot=(math.radians(16), 0.0, math.radians(-10)), loc=(at[0] + W / 2 - arm_w - 0.35, at[1] + y_face + ct + 0.09, z_seat))
    part("sofa_throw", (-0.25, 0.25, -0.18, 0.18, 0.0, 0.07), mat="linen", round_w=0.03, segs=4, subd=2, rot=(0.0, 0.0, math.radians(8)), loc=(at[0] + W / 2 - arm_w - 0.32, at[1] + 0.12, z_seat))
    # feet
    bm = bmesh.new()
    for sx in (-1, 1):
        for sy in (-1, 1):
            _cyl(bm, 0.02, -EPS, foot_h + 0.01, (sx * (W / 2 - 0.10), sy * (D / 2 - 0.08)), 20)
    _obj("sofa_feet", bm, coll, at, mat="steel_black", materials=materials, bevel=0.002)


def _coffee_table(coll, materials):
    cx, cy = COFFEE_TABLE["center"]
    r, h, tt = COFFEE_TABLE["r"], COFFEE_TABLE["h"], COFFEE_TABLE["top_t"]
    bm = bmesh.new()
    _cyl(bm, r, -tt, 0.0, (0.0, 0.0), 96)
    _obj("coffee_table_top", bm, coll, location=(cx, cy, FLOOR + h), mat="oak", materials=materials, bevel=0.004)
    bm = bmesh.new()
    for a in (90, 210, 330):
        a = math.radians(a)
        _tube(bm, (0.26 * math.cos(a), 0.26 * math.sin(a), h - tt + 0.003), (0.34 * math.cos(a), 0.34 * math.sin(a), -EPS), 0.013, 14)
    _cyl(bm, 0.05, h - tt - 0.012, h - tt + 0.003, (0.0, 0.0), 24)
    _obj("coffee_table_legs", bm, coll, location=(cx, cy, FLOOR), mat="steel_black", materials=materials, bevel=0.0015)
    _book_stack(
        coll, materials, "coffee_books",
        [(0.24, 0.31, 0.030, "book_navy", 0.0, 0.0, 0.0), (0.21, 0.28, 0.022, "book_tan", math.radians(-9), 0.012, 0.008), (0.17, 0.24, 0.018, "book_oxblood", math.radians(6), -0.01, 0.0)],
        (cx - 0.10, cy + 0.06, FLOOR + h), math.radians(12),
    )
    _bowl(coll, materials, "coffee_bowl", (cx + 0.20, cy - 0.14, FLOOR + h), 0.07, 0.04)


def _rug(coll, materials, name, center, size, t, mat, yaw=0.0):
    bm = bmesh.new()
    _box_c(bm, (size[0], size[1], t), (0.0, 0.0, 0.0))
    return _obj(name, bm, coll, location=(center[0], center[1], FLOOR + t / 2 - 0.001), rotation=(0.0, 0.0, yaw), mat=_lm(mat), materials=materials, bevel=0.004)


# ---------------------------------------------------------------------------
# Pendant lamp
# ---------------------------------------------------------------------------
def _pendant(coll, materials):
    global PENDANT
    px, py = PENDANT_XY
    s = PENDANT_SHADE
    zb = s["z_bottom"]
    zt = zb + s["h"]
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=False, cap_tris=False, segments=64, radius1=s["r_bottom"], radius2=s["r_top"], depth=s["h"], matrix=Matrix.Translation((px, py, (zb + zt) / 2)))
    shade = _obj("pendant_shade", bm, coll, mat="frame", materials=materials, bevel=0)
    shade.data.materials.append(_lm("shade_inner"))
    sol = shade.modifiers.new("shell", "SOLIDIFY")
    sol.thickness = 0.0012
    sol.offset = -1.0
    sol.use_rim = True
    sol.material_offset = 1
    sol.material_offset_rim = 0
    bm = bmesh.new()
    _cyl(bm, s["r_top"] + 0.0012, zt - 0.006, zt, (px, py), 48)
    _obj("pendant_cap", bm, coll, mat="frame", materials=materials, bevel=0.001)
    bm = bmesh.new()
    _cyl(bm, 0.014, zt - 0.10, zt - 0.005, (px, py), 24)
    _obj("pendant_holder", bm, coll, mat="frame", materials=materials, bevel=0.001)
    bm = bmesh.new()
    _sphere(bm, (px, py, zt - 0.10 - 0.028), 0.03, 32, 16)
    PENDANT = _obj("pendant_bulb", bm, coll, mat=_lm("bulb"), materials=materials, bevel=0)
    PENDANT["pendant"] = True
    bm = bmesh.new()
    _tube(bm, (px, py, zt - 0.002), (px, py, CEILING + 0.001), 0.0025, 12)
    _obj("pendant_cable", bm, coll, mat="frame", materials=materials, bevel=0)
    bm = bmesh.new()
    _cyl(bm, 0.05, CEILING - 0.022, CEILING + 0.002, (px, py), 40)
    _obj("pendant_rose", bm, coll, mat="frame", materials=materials, bevel=0.002)
    return PENDANT


def set_pendant(on: bool, strength: float = PENDANT_STRENGTH):
    """Toggle the bulb's emission (build.py: on for the `interior` and `dusk` states)."""
    mat = _lm("bulb")
    node = mat.node_tree.nodes.get("Emission")
    if node is not None:
        node.inputs["Strength"].default_value = float(strength) if on else 0.0
    if PENDANT is not None:
        PENDANT["pendant_on"] = bool(on)


# ---------------------------------------------------------------------------
# Plant
# ---------------------------------------------------------------------------
def _leaf(bm, M, L, W, nu=8, nv=4, droop=0.22, cup=0.10):
    rows = []
    for j in range(nu + 1):
        u = j / nu
        wj = (W / 2) * (math.sin(math.pi * u) ** 0.55)
        row = []
        for i in range(nv + 1):
            v = -1.0 + 2.0 * i / nv
            x = v * wj
            y = u * L
            z = -droop * L * u * u + cup * wj * v * v
            row.append(bm.verts.new(M @ Vector((x, y, z))))
        rows.append(row)
    for j in range(nu):
        for i in range(nv):
            bm.faces.new((rows[j][i], rows[j][i + 1], rows[j + 1][i + 1], rows[j + 1][i]))


def _path_point(pts, z):
    for a, b in zip(pts[:-1], pts[1:]):
        if a[2] <= z <= b[2]:
            f = (z - a[2]) / (b[2] - a[2])
            return Vector(a).lerp(Vector(b), f)
    return Vector(pts[-1])


def _plant(coll, materials):
    px, py = PLANT_POT["xy"]
    r1, r0, h = PLANT_POT["r_top"], PLANT_POT["r_bottom"], PLANT_POT["h"]
    at = (px, py, FLOOR - 0.001)
    bm = bmesh.new()
    _lathe(bm, [(0.0, 0.0), (r0, 0.0), (r1, h), (r1 - 0.009, h), (r1 - 0.012, h - 0.02), (r0 - 0.008, 0.015), (0.0, 0.015)], 64)
    _obj("plant_pot", bm, coll, at, mat=_lm("ceramic_dark"), materials=materials, bevel=0.0015)
    bm = bmesh.new()
    _cyl(bm, r1 - 0.011, h - 0.06, h - 0.035, (0.0, 0.0), 48)
    _obj("plant_soil", bm, coll, at, mat=_lm("soil"), materials=materials, bevel=0.003)
    stem = [(0.0, 0.0, h - 0.05), (0.012, 0.006, 0.45), (0.03, -0.012, 0.80), (0.02, 0.022, 1.10), (0.0, 0.03, 1.42)]
    bm = bmesh.new()
    radii = (0.018, 0.015, 0.012, 0.009, 0.006)
    for k, (a, b) in enumerate(zip(stem[:-1], stem[1:])):
        _tube(bm, a, b, radii[k], 12)
        _sphere(bm, b, radii[k + 1] if k + 1 < len(radii) else radii[-1], 12, 6)
    leaves = bmesh.new()
    n = 16
    for k in range(n):
        f = k / (n - 1)
        z = 0.42 + f * 0.98
        theta = math.radians(137.5 * k + 20.0)
        elev = math.radians(-18.0 + 48.0 * f + (6.0 if k % 2 else -6.0))
        L = 0.36 - 0.10 * f
        W = 0.21 - 0.05 * f
        pet = 0.20 - 0.06 * f
        base = _path_point(stem, z)
        d = Vector((-math.sin(theta) * math.cos(elev), math.cos(theta) * math.cos(elev), math.sin(elev)))
        tip = base + d * pet
        _tube(bm, base, tip, 0.004, 8)
        M = Matrix.Translation(tip) @ Matrix.Rotation(theta, 4, "Z") @ Matrix.Rotation(elev, 4, "X") @ Matrix.Rotation(math.radians((-1) ** k * 9.0), 4, "Y")
        _leaf(leaves, M, L, W)
    _obj("plant_stem", bm, coll, at, mat=_lm("stem"), materials=materials, bevel=0)
    _obj("plant_leaves", leaves, coll, at, mat=_lm("leaf"), materials=materials, bevel=0)


# ---------------------------------------------------------------------------
# Upper floor: beds, bedside tables, lamps, rugs
# ---------------------------------------------------------------------------
def _fold_texture():
    tex = bpy.data.textures.get("int_duvet_folds")
    if tex is None:
        tex = bpy.data.textures.new("int_duvet_folds", "CLOUDS")
        tex.noise_scale = 0.32
        tex.noise_depth = 2
        tex.noise_basis = "BLENDER_ORIGINAL"
    return tex


def _bedroom(coll, materials, k, x_center, side):
    """One bed with its head against the back wall, bedside tables (lamp and
    rug on the `side` = −1 / +1 side of the bed)."""
    b = BED
    w, l = b["w"], b["l"]
    y_head = Y0I + 0.01
    cy = y_head + 0.04 + l / 2
    z0 = UPPER_FLOOR
    at = (x_center, cy, z0)
    ph, bt, mh = b["plinth_h"], b["base_t"], b["mattress_h"]
    name = f"bed_{k}"

    def hard(nm, bounds, mat="oak", loc=at, rot=(0.0, 0.0, 0.0), bevel=0.003):
        bm = bmesh.new()
        _box(bm, bounds)
        return _obj(nm, bm, coll, loc, rot, mat=mat, materials=materials, bevel=bevel)

    def soft(nm, bounds, mat, round_w, segs, subd, loc=at, rot=(0.0, 0.0, 0.0)):
        bm = bmesh.new()
        _box(bm, bounds)
        ob = _obj(nm, bm, coll, loc, rot, mat=mat, materials=materials, bevel=0)
        _soft(ob, round_w, segs, subd)
        return ob

    hard(name + "_plinth", (-(w - 0.24) / 2, (w - 0.24) / 2, -l / 2 + 0.02, l / 2 - 0.12, -EPS, ph))
    hard(name + "_base", (-(w + 0.10) / 2, (w + 0.10) / 2, -l / 2 - 0.005, l / 2 + 0.02, ph - EPS, ph + bt))
    # headboard built across local Y (grain along its width), turned 90°
    hard(name + "_headboard", (-0.04, 0.0, -(w + 0.10) / 2, (w + 0.10) / 2, ph - EPS, b["head_h"]), loc=(at[0], at[1] - l / 2, z0), rot=(0.0, 0.0, math.radians(-90)))
    soft(name + "_mattress", (-w / 2, w / 2, -l / 2 + 0.005, l / 2 - 0.005, ph + bt - 0.005, ph + bt + mh), "linen", 0.04, 4, 1)
    duvet = soft(name + "_duvet", (-w / 2 - 0.03, w / 2 + 0.03, -l / 2 + 0.62, l / 2 + 0.03, ph + bt + mh - 0.012, ph + bt + mh + 0.08), "linen", 0.045, 5, 2)
    dm = duvet.modifiers.new("folds", "DISPLACE")
    dm.texture = _fold_texture()
    dm.texture_coords = "LOCAL"
    dm.direction = "NORMAL"
    dm.strength = 0.035
    dm.mid_level = 0.5
    _subsurf(duvet, 1, 1)
    for sx, nm in ((-1, "l"), (1, "r")):
        soft(name + f"_pillow_{nm}", (-0.34, 0.34, 0.0, 0.46, 0.0, 0.13), "linen", 0.05, 5, 2, loc=(at[0] + sx * 0.39, at[1] - l / 2 + 0.10, z0 + ph + bt + mh - 0.02), rot=(0.0, 0.0, math.radians(sx * 4.0)))
    # bedside tables on both sides, lamp and rug on `side`
    bs = BEDSIDE
    for sx in (-1, 1):
        tx = x_center + sx * (w / 2 + 0.06 + bs["w"] / 2)
        ty = y_head + 0.02 + bs["d"] / 2
        hard(f"{name}_side_{'l' if sx < 0 else 'r'}", (-bs["w"] / 2, bs["w"] / 2, -bs["d"] / 2, bs["d"] / 2, 0.06, bs["h"]), loc=(tx, ty, z0))
        bm = bmesh.new()
        for ax in (-1, 1):
            for ay in (-1, 1):
                _cyl(bm, 0.012, -EPS, 0.065, (ax * (bs["w"] / 2 - 0.04), ay * (bs["d"] / 2 - 0.04)), 12)
        _obj(f"{name}_side_{'l' if sx < 0 else 'r'}_legs", bm, coll, (tx, ty, z0), mat="steel_black", materials=materials, bevel=0.0015)
        if sx == side:
            bm = bmesh.new()
            _cyl(bm, 0.06, -0.001, 0.02, (0.0, 0.0), 32)
            _tube(bm, (0.0, 0.0, 0.015), (0.0, 0.0, 0.30), 0.008, 12)
            _obj(f"{name}_lamp_base", bm, coll, (tx, ty, z0 + bs["h"]), mat="steel_black", materials=materials, bevel=0.0015)
            bm = bmesh.new()
            _cyl(bm, 0.11, 0.20, 0.36, (0.0, 0.0), 48, r_top=0.09)
            _obj(f"{name}_lamp_shade", bm, coll, (tx, ty, z0 + bs["h"]), mat="linen", materials=materials, bevel=0.002)
    rx = x_center + side * (w / 2 + 0.05 + 0.35)
    bm = bmesh.new()
    _box_c(bm, (0.7, 1.4, 0.008), (0.0, 0.0, 0.0))
    _obj(f"{name}_rug", bm, coll, (rx, cy + 0.45, z0 + 0.003), (0.0, 0.0, math.radians(90)), mat=_lm("rug_bed"), materials=materials, bevel=0.003)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------
def furnish(house, materials):
    """Furnish the house (see the module doc); returns the interior collections."""
    t0 = time.time()
    g = _coll("interior_ground")
    u = _coll("interior_upper")
    _floor_finish(g, materials, house)
    _skirting(g, materials)
    _kitchen(g, materials)
    _dining_table(g, materials)
    _chairs(g, materials)
    _sofa(g, materials)
    _coffee_table(g, materials)
    _rug(g, materials, "rug", RUG["center"], RUG["size"], RUG["t"], "rug")
    _pendant(g, materials)
    _plant(g, materials)
    for k, bed in enumerate(BEDS):
        _bedroom(u, materials, k, bed["x_center"], -1 if bed["x_center"] < 0 else 1)
    print(f"[interior] furnished in {time.time() - t0:.2f} s: {len(g.objects)} ground + {len(u.objects)} upper objects")
    return {"interior_ground": g, "interior_upper": u, "pendant": PENDANT}


# ---------------------------------------------------------------------------
# Standalone test
# ---------------------------------------------------------------------------
_TEST_DIR = os.path.join(_HERE, "_test")
# spec.LIGHTS rotation → Blender ShaderNodeTexSky.sun_rotation: the node's rotation is clockwise from +Y
# (0 = +Y, 90 = +X; verified with a shadow probe), and the intent of the mirrored spec is the sun from
# world (+X, +Y) = front-right, so "145" becomes 45 here. environment.py owns the real conversion.
TEST_SUN_ROTATION = 45.0


def _look_at(ob, target):
    d = Vector(target) - ob.location
    ob.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()


def _test_scene(view="living", scale=25, samples=32, exposure=-1.5):
    import geometry

    bpy.ops.wm.read_factory_settings(use_empty=True)
    matlib._CACHE.clear()
    _LOCAL_MATS.clear()
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.render.threads_mode = "AUTO"
    sc.view_settings.view_transform = "AgX"
    sc.view_settings.look = "AgX - Base Contrast"
    sc.view_settings.exposure = exposure
    sc.render.filter_size = 1.5

    house = geometry.build_house(matlib)
    furnish(house, matlib)
    set_pendant(True)

    # test-only surroundings: lawn and a plain deck slab so the glazing looks onto something
    bm = bmesh.new()
    _box(bm, (-80.0, 80.0, -80.0, 80.0, -0.2, 0.0))
    _obj("test_lawn", bm, sc.collection, mat="lawn", materials=matlib, bevel=0)
    bm = bmesh.new()
    d = spec.DECK
    _box(bm, (d["x"][0], d["x"][1], d["y"][0] + 0.03, d["y"][1], 0.0, d["top"]))
    _obj("test_deck", bm, sc.collection, mat="larch_deck", materials=matlib, bevel=0.003)

    w = bpy.data.worlds.new("interior_test_world")
    sc.world = w
    if w.node_tree is None:
        w.use_nodes = True
    nt = w.node_tree
    sky = nt.nodes.new("ShaderNodeTexSky")
    sky.sky_type = "MULTIPLE_SCATTERING"
    sky.sun_disc = True
    sky.sun_elevation = math.radians(spec.LIGHTS["interior"]["elevation"])
    sky.sun_rotation = math.radians(TEST_SUN_ROTATION)
    sky.sun_intensity = spec.LIGHTS["interior"]["intensity"]
    sky.altitude = 300.0
    sky.air_density = 1.0
    sky.aerosol_density = 1.5
    bg = nt.nodes["Background"]
    bg.inputs["Strength"].default_value = spec.LIGHTS["interior"]["world"]
    nt.links.new(sky.outputs[0], bg.inputs[0])

    # the SPEC `interior` accent: a warm 2700 K 40 W light in the pendant, plus a small warm fill
    px, py = PENDANT_XY
    ld = bpy.data.lights.new("pendant_light", "POINT")
    ld.energy = 40.0
    ld.color = BULB_COLOR
    ld.shadow_soft_size = 0.03
    lo = bpy.data.objects.new("pendant_light", ld)
    sc.collection.objects.link(lo)
    lo.location = (px, py, PENDANT_SHADE["z_bottom"] + PENDANT_SHADE["h"] - 0.128)
    fd = bpy.data.lights.new("fill", "AREA")
    fd.energy = 25.0
    fd.color = (1.0, 0.82, 0.62)
    fd.size = 1.4
    fo = bpy.data.objects.new("fill", fd)
    sc.collection.objects.link(fo)
    fo.location = (-0.8, -3.2, 2.6)
    _look_at(fo, (-1.0, 1.5, 0.6))

    cam = bpy.data.cameras.new("test_cam")
    co = bpy.data.objects.new("test_cam", cam)
    sc.collection.objects.link(co)
    sc.camera = co
    cam.sensor_fit = "VERTICAL"
    cam.sensor_height = 24.0
    pos, tgt, fov, fstop = spec.CAMERAS[("living", "desktop")]
    size = spec.SIZES["desktop"]
    focus = 4.5
    if view == "kitchen":
        pos, tgt, fov, focus = (1.6, -1.2, 1.55), (-1.9, -4.6, 0.95), 52, 3.8
    elif view == "sofa":
        pos, tgt, fov, focus = (1.4, 0.6, 1.35), (-1.6, 3.4, 0.55), 40, 4.0
    elif view == "upper":
        pos, tgt, fov, focus, fstop = (-7.0, 3.0, 9.5), (0.6, -2.6, 3.4), 40, 10.0, 8.0
        for ob in house["roof"].objects:
            ob.hide_render = True
    elif view == "mobile":
        pos, tgt, fov, fstop = spec.CAMERAS[("living", "mobile")]
        size = spec.SIZES["mobile"]
    co.location = pos
    _look_at(co, tgt)
    cam.lens = spec.lens_for_fov(fov)
    cam.dof.use_dof = fstop > 0
    cam.dof.focus_distance = focus
    cam.dof.aperture_fstop = fstop if fstop > 0 else 8.0

    sc.render.resolution_x, sc.render.resolution_y = size
    sc.render.resolution_percentage = scale
    cy = sc.cycles
    cy.samples = samples
    cy.use_adaptive_sampling = True
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
    return sc


if __name__ == "__main__":
    import argparse

    ap = argparse.ArgumentParser(description="interior.py standalone test render")
    ap.add_argument("--view", default="living", choices=["living", "kitchen", "sofa", "upper", "mobile"])
    ap.add_argument("--scale", type=int, default=spec.QUALITY["test"]["scale"])
    ap.add_argument("--samples", type=int, default=spec.QUALITY["test"]["samples"])
    ap.add_argument("--exposure", type=float, default=-1.5)
    ap.add_argument("--name", default=None)
    args = ap.parse_args()
    os.makedirs(_TEST_DIR, exist_ok=True)
    scene = _test_scene(args.view, args.scale, args.samples, args.exposure)
    out = os.path.join(_TEST_DIR, f"interior_{args.name or args.view}.png")
    scene.render.filepath = out
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGB"
    t0 = time.time()
    bpy.ops.render.render(write_still=True)
    dt = time.time() - t0
    print(f"[interior] test render: {out}")
    print(f"[interior] render time: {dt:.1f} s")
