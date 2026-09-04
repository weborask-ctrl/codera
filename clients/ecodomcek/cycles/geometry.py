"""geometry.py — the house shell for the EcoDomček Cycles scene.

Public API
----------
build_house(materials, partition=True) -> dict
    Builds the house from the numbers in spec.py and returns the collections
    {"walls", "roof", "box", "openings", "slabs", "stair", "plinth"}.
    `materials` must provide get(name) -> bpy.types.Material and
    apply(obj, name) (materials.py). Pass None to use the flat stand-in
    materials defined at the bottom of this file.

What is built
-------------
walls     wall_ring (0.32 solid ring, z 0 → 6.30, every opening a real
          EXACT-boolean hole; exterior faces 'membrane', interior faces
          'plaster', wall tops 'spruce' (timber top plate, seen in the
          dollhouse), faces inside the cantilever-box cavity 'spruce'),
          lining_back_* (ground-floor back wall: 60 vertical spruce planks
          on a black backing), partition_upper (x = 0, y −5 → 0.4).
roof      roof_slab (z 6.30 → 6.61, underside 'plaster' inside the wall
          line and 'anthracite' on the overhang), roof_membrane
          (6.60 → 6.635), roof_fascia (0.28 tall band, outer face at
          ±4.2 / ±5.2). All three objects share the origin ROOF_PIVOT =
          (0, 0, 6.30) so build.py can lift/rotate them as a rigid group by
          giving every object of the collection the same location offset and
          rotation_euler.
box       box_shell — hollow anthracite shell (sides/top 0.25, floor 0.30),
          spruce cavity, window hole; it merges with the walls (the walls are
          cut open into the cavity, so the alcove is part of the upper floor).
openings  the cutter objects (hide_render=True, display WIRE), named
          cutter_<name>, with custom props "opening", "wall", "kind" and
          "bounds" = [x0, x1, y0, y1, z0, z1] of the real opening (through the
          full wall thickness). cladding.py can enumerate them.
slabs     slab_ground (concrete screed, top at 0.13 so a 20 mm oak finish by
          interior.py lands at 0.15; the top face already carries 'oak_floor'),
          slab_first (2.85 → 3.15, top 'oak_floor', ceiling 'plaster', with a
          stairwell hole x 2.69 → 3.70, y −0.85 → 2.34).
stair     stair_treads (15 spruce treads 0.27 going, 0.1875 rise so the run
          actually lands on the 3.15 slab), stair_stringers (two closed
          spruce strings), stair_handrail (black steel: posts, top rail, mid
          rail, continuing as a guard around the stairwell).
plinth    plinth — 0.25-tall concrete band 0.031 outside the wall face
          (= 0.02 inside the cladding line), cut open at the glazing/door.

All meshes are in world units (object origin (0, 0, 0)) except the roof
objects (origin ROOF_PIVOT). Every object gets a 4 mm 2-segment Bevel
modifier (angle-limited, hardened normals).
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

import spec  # noqa: E402

# ---------------------------------------------------------------------------
# Local constants (not in spec.py) — see the notes returned with the module.
# ---------------------------------------------------------------------------
X0, X1, Y0, Y1 = spec.X0, spec.X1, spec.Y0, spec.Y1
X0I, X1I = X0 + spec.WALL_T, X1 - spec.WALL_T  # −3.68, 3.68 interior wall faces
Y0I, Y1I = Y0 + spec.WALL_T, Y1 - spec.WALL_T  # −4.68, 4.68
Z_TOP = spec.Z_TOP

EPS = 0.002  # overlap between touching solids so no two faces are ever coincident
CUT = 0.06  # how far every cutter reaches beyond the faces it cuts
SILL_DROP = 0.003  # wall stub under the glazing/door sits this much below the plinth top (no coplanar faces)
BEVEL_W = 0.004
BEVEL_SEGS = 2

FLOOR_SLAB_TOP = spec.Z_FLOOR - 0.02  # 0.13: screed; the 20 mm oak finish (interior.py) reaches 0.15
FLOOR_SLAB_BOTTOM = -0.05
CEILING_Z = spec.Z_SLAB1 - spec.SLAB_T  # 2.85

BOX_SHELL_T = 0.25  # sides / top of the cantilever box
BOX_FLOOR_T = 0.30  # its floor structure (interior floor of the alcove at 3.45)
BOX_CAVITY = (
    spec.BOX["x"][0] + BOX_SHELL_T,
    spec.BOX["x"][1] - BOX_SHELL_T,
    spec.BOX["y"][0] + BOX_SHELL_T,
    spec.BOX["y"][1] - BOX_SHELL_T,
    spec.BOX["z"][0] + BOX_FLOOR_T,
    spec.BOX["z"][1] - BOX_SHELL_T,
)  # (1.75, 4.45, 3.85, 6.05, 3.45, 6.03)

ROOF_PIVOT = (0.0, 0.0, Z_TOP)
ROOF_SLAB_TOP = Z_TOP + spec.ROOF_T - 0.03  # 6.61 (anthracite structure)
ROOF_MEMBRANE_TOP = Z_TOP + spec.ROOF_T - 0.005  # 6.635 (membrane sits 5 mm under the fascia lip)
FASCIA_T = 0.02
FASCIA_OUT = spec.ROOF_OVERHANG + FASCIA_T  # 0.20 → outer face at ±4.2 / ±5.2

PLINTH_PROUD = spec.BATTEN_T + spec.SLAT_T - 0.02  # 0.031 outside the wall face = 0.02 inside the cladding line
PLINTH_BAND = 0.16  # band depth measured from the wall face inward (inner face stays inside the wall)

PARTITION_T = 0.12
PARTITION_Y = (Y0I - EPS, 0.4)

STAIR_GOING = spec.STAIR["tread"]
STAIR_TREADS = spec.STAIR["treads"]
STAIR_RISE = (spec.Z_SLAB1 - spec.Z_FLOOR) / (STAIR_TREADS + 1)  # 0.1875 (spec nominal 0.18)
STAIR_X = (X1I - 1.0, X1I)  # 2.68 → 3.68, along the right wall
STAIR_Y_START = spec.STAIR["y_start"]  # first riser at y = 3.2, rising toward −Y
STAIR_Y_TOP = STAIR_Y_START - STAIR_TREADS * STAIR_GOING  # −0.85: the slab edge = 16th riser
STRINGER_T = 0.06
STRINGER_D = 0.30
TREAD_T = 0.045
NOSING = 0.02
STAIRWELL_Y = (STAIR_Y_TOP, STAIR_Y_START - 3 * STAIR_GOING - 0.05)  # (−0.85, 2.34)
RAIL_H = 0.95
RAIL_R = 0.02
MIDRAIL_R = 0.006
POST_R = 0.009

LINING_PLANK_T = 0.02
LINING_GAP = 0.004
LINING_PLANKS = 60
LINING_BACKING_T = 0.007


# ---------------------------------------------------------------------------
# Small mesh helpers
# ---------------------------------------------------------------------------
def _scene_collection(name, parent=None):
    parent = parent or bpy.context.scene.collection
    coll = parent.children.get(name)
    if coll is None:
        coll = bpy.data.collections.new(name)
        parent.children.link(coll)
    return coll


def _add_box(bm, b):
    """Axis-aligned closed box (x0, x1, y0, y1, z0, z1) into an existing bmesh."""
    x0, x1, y0, y1, z0, z1 = b
    v = [bm.verts.new((x, y, z)) for z in (z0, z1) for y in (y0, y1) for x in (x0, x1)]
    for f in ((0, 2, 3, 1), (4, 5, 7, 6), (0, 1, 5, 4), (2, 6, 7, 3), (0, 4, 6, 2), (1, 3, 7, 5)):
        bm.faces.new([v[i] for i in f])


def _add_ring(bm, outer, inner, z0, z1):
    """Rectangular ring (outer minus inner footprint) between z0 and z1."""
    ox0, ox1, oy0, oy1 = outer
    ix0, ix1, iy0, iy1 = inner
    oc = ((ox0, oy0), (ox1, oy0), (ox1, oy1), (ox0, oy1))
    ic = ((ix0, iy0), (ix1, iy0), (ix1, iy1), (ix0, iy1))
    o = [[bm.verts.new((x, y, z)) for (x, y) in oc] for z in (z0, z1)]
    i = [[bm.verts.new((x, y, z)) for (x, y) in ic] for z in (z0, z1)]
    for k in range(4):
        n = (k + 1) % 4
        bm.faces.new((o[0][k], o[0][n], o[1][n], o[1][k]))  # outer side
        bm.faces.new((i[0][k], i[0][n], i[1][n], i[1][k]))  # inner side
        bm.faces.new((o[1][k], o[1][n], i[1][n], i[1][k]))  # top
        bm.faces.new((o[0][k], o[0][n], i[0][n], i[0][k]))  # bottom


def _add_prism_yz(bm, pts, x0, x1):
    """Prism from a simple polygon [(y, z), ...] extruded from x0 to x1."""
    a = [bm.verts.new((x0, y, z)) for (y, z) in pts]
    b = [bm.verts.new((x1, y, z)) for (y, z) in pts]
    bm.faces.new(a)
    bm.faces.new(list(reversed(b)))
    n = len(pts)
    for k in range(n):
        m = (k + 1) % n
        bm.faces.new((a[k], a[m], b[m], b[k]))


def _add_tube(bm, p0, p1, r, segments=16):
    """Capped cylinder between two world points."""
    p0, p1 = Vector(p0), Vector(p1)
    d = p1 - p0
    rot = d.normalized().to_track_quat("Z", "Y").to_matrix().to_4x4()
    mat = Matrix.Translation((p0 + p1) / 2) @ rot
    bmesh.ops.create_cone(
        bm, cap_ends=True, cap_tris=False, segments=segments, radius1=r, radius2=r, depth=d.length, matrix=mat
    )


def _add_sphere(bm, p, r):
    bmesh.ops.create_uvsphere(bm, u_segments=16, v_segments=10, radius=r, matrix=Matrix.Translation(Vector(p)))


def _mesh_object(name, bm, coll, origin=(0.0, 0.0, 0.0)):
    """Turn a bmesh (world coordinates) into a linked object with the given origin."""
    if any(origin):
        bmesh.ops.translate(bm, verts=bm.verts, vec=(-origin[0], -origin[1], -origin[2]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    ob.location = origin
    coll.objects.link(ob)
    return ob


def _box(name, b, coll, origin=(0.0, 0.0, 0.0)):
    bm = bmesh.new()
    _add_box(bm, b)
    return _mesh_object(name, bm, coll, origin)


def _cutter(name, b, coll, opening=None, wall=None, kind="internal", bounds=None):
    ob = _box(name, b, coll)
    ob["opening"] = opening or name.replace("cutter_", "")
    ob["wall"] = wall or ""
    ob["kind"] = kind
    ob["bounds"] = [float(v) for v in (bounds or b)]
    ob.display_type = "WIRE"
    return ob


def _apply_modifiers(ob):
    """Bake the modifier stack into a new mesh (works without any operator context)."""
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(ob.evaluated_get(dg), preserve_all_data_layers=False, depsgraph=dg)
    old = ob.data
    me.name = old.name
    ob.modifiers.clear()
    ob.data = me
    if old.users == 0:
        bpy.data.meshes.remove(old)


def _boolean_subtract(ob, cutters):
    for c in cutters:
        m = ob.modifiers.new("cut_" + c.name, "BOOLEAN")
        m.operation = "DIFFERENCE"
        m.solver = "EXACT"
        m.object = c
    _apply_modifiers(ob)


def _inside(c, b, tol=0.0):
    return (
        b[0] - tol <= c.x <= b[1] + tol
        and b[2] - tol <= c.y <= b[3] + tol
        and b[4] - tol <= c.z <= b[5] + tol
    )


def _assign_faces(ob, materials, rule):
    """rule(world_center, normal) -> material name; builds the slots on the fly."""
    me = ob.data
    me.materials.clear()
    slots = {}
    idx = []
    mw = ob.matrix_world
    for p in me.polygons:
        name = rule(mw @ p.center, p.normal)
        if name not in slots:
            slots[name] = len(me.materials)
            me.materials.append(materials.get(name))
        idx.append(slots[name])
    me.polygons.foreach_set("material_index", idx)
    me.update()


def _finish(ob, width=BEVEL_W):
    """Smooth shading + angle-limited 4 mm bevel with hardened normals."""
    try:
        ob.data.shade_smooth()
    except AttributeError:
        ob.data.polygons.foreach_set("use_smooth", [True] * len(ob.data.polygons))
    b = ob.modifiers.new("bevel", "BEVEL")
    b.width = width
    b.segments = BEVEL_SEGS
    b.limit_method = "ANGLE"
    b.angle_limit = math.radians(30)
    b.use_clamp_overlap = True
    b.harden_normals = True
    b.miter_outer = "MITER_ARC"
    return ob


# ---------------------------------------------------------------------------
# Openings (cutters)
# ---------------------------------------------------------------------------
def _make_cutters(coll):
    """Every real opening as a cutter box reaching CUT beyond both wall faces."""
    cutters = {}
    fy = (Y1I - CUT, Y1 + PLINTH_PROUD + CUT)  # through the front wall and the plinth band
    lx = (X0 - PLINTH_PROUD - CUT, X0I + CUT)

    g = spec.GLAZING
    cutters["glazing"] = _cutter(
        "cutter_glazing", (g["x"][0], g["x"][1], fy[0], fy[1], g["z"][0] - SILL_DROP, g["z"][1]), coll,
        opening="glazing", wall="front", kind="glazing",
        bounds=(g["x"][0], g["x"][1], Y1I, Y1, g["z"][0], g["z"][1]),
    )
    for k, w in enumerate(spec.FRONT_WINDOWS):
        cutters[f"front_window_{k}"] = _cutter(
            f"cutter_front_window_{k}", (w["x"][0], w["x"][1], fy[0], fy[1], w["z"][0], w["z"][1]), coll,
            opening=f"front_window_{k}", wall="front", kind="window",
            bounds=(w["x"][0], w["x"][1], Y1I, Y1, w["z"][0], w["z"][1]),
        )
    for k, w in enumerate(spec.LEFT_WINDOWS):
        cutters[f"left_window_{k}"] = _cutter(
            f"cutter_left_window_{k}", (lx[0], lx[1], w["y"][0], w["y"][1], w["z"][0], w["z"][1]), coll,
            opening=f"left_window_{k}", wall="left", kind="window",
            bounds=(X0, X0I, w["y"][0], w["y"][1], w["z"][0], w["z"][1]),
        )
    d = spec.DOOR
    cutters["door"] = _cutter(
        "cutter_door", (d["x"][0], d["x"][1], fy[0], fy[1], d["z"][0] - SILL_DROP, d["z"][1]), coll,
        opening="door", wall="front", kind="door",
        bounds=(d["x"][0], d["x"][1], Y1I, Y1, d["z"][0], d["z"][1]),
    )
    # the plinth is cut at the true sill height (0.15); the wall stub under it sits SILL_DROP lower so the two
    # top faces are never coplanar (coplanar faces shadow each other in Cycles)
    bm = bmesh.new()
    for o in (g, d):  # SILL_DROP wider on each side too: the plinth's cut faces must not share the reveal plane
        _add_box(bm, (o["x"][0] - SILL_DROP, o["x"][1] + SILL_DROP, fy[0], fy[1], o["z"][0], spec.PLINTH_H + CUT))
    pc = _mesh_object("cutter_plinth_openings", bm, coll)
    pc["opening"], pc["wall"], pc["kind"] = "plinth_openings", "front", "internal"
    pc["bounds"] = [0.0] * 6
    pc.display_type = "WIRE"
    cutters["plinth_openings"] = pc
    bw, bx = spec.BOX_WINDOW, spec.BOX
    cutters["box_window"] = _cutter(
        "cutter_box_window",
        (bw["x"][0], bw["x"][1], bx["y"][1] - BOX_SHELL_T - CUT, bx["y"][1] + CUT, bw["z"][0], bw["z"][1]), coll,
        opening="box_window", wall="box_front", kind="box_window",
        bounds=(bw["x"][0], bw["x"][1], bx["y"][1] - BOX_SHELL_T, bx["y"][1], bw["z"][0], bw["z"][1]),
    )
    # internal cutters
    cutters["box_cavity"] = _cutter("cutter_box_cavity", BOX_CAVITY, coll, wall="box", kind="internal")
    cutters["house_core"] = _cutter(
        "cutter_house_core",
        (X0 - CUT, X1, Y0 - CUT, Y1, bx["z"][0] - CUT, bx["z"][1] + CUT), coll, kind="internal",
    )
    cutters["stairwell"] = _cutter(
        "cutter_stairwell",
        (STAIR_X[0] + 0.01, X1I + CUT, STAIRWELL_Y[0], STAIRWELL_Y[1], CEILING_Z - CUT, spec.Z_SLAB1 + CUT), coll,
        kind="internal", bounds=(STAIR_X[0] + 0.01, X1I, STAIRWELL_Y[0], STAIRWELL_Y[1], CEILING_Z, spec.Z_SLAB1),
    )
    return cutters


def _hide_cutters(coll):
    for ob in coll.objects:
        ob.hide_render = True
        ob.hide_viewport = True
        try:
            ob.hide_set(True)
        except RuntimeError:
            pass
    coll.hide_render = True


# ---------------------------------------------------------------------------
# Parts
# ---------------------------------------------------------------------------
def _build_walls(coll, materials, cutters):
    bm = bmesh.new()
    _add_ring(bm, (X0, X1, Y0, Y1), (X0I, X1I, Y0I, Y1I), -0.02, Z_TOP)  # 2 cm into the ground: no face on z = 0
    ring = _mesh_object("wall_ring", bm, coll)
    holes = [cutters[k] for k in cutters if cutters[k]["kind"] in ("glazing", "window", "door")]
    _boolean_subtract(ring, holes + [cutters["box_cavity"]])

    def rule(c, n):
        if n.z > 0.9 and c.z > Z_TOP - 0.01:
            return "spruce"  # timber top plate, visible in the dollhouse
        if n.z > 0.9 and c.z < 0.2:
            return "concrete"  # sills under the glazing / door threshold
        if n.z < -0.9 and c.z < 0.0:
            return "concrete"
        if _inside(c, BOX_CAVITY, 0.01):
            return "spruce"
        on_x = abs(n.x) > 0.9 and abs(abs(c.x) - X1) < 0.003
        on_y = abs(n.y) > 0.9 and abs(abs(c.y) - Y1) < 0.003
        return "membrane" if (on_x or on_y) else "plaster"

    _assign_faces(ring, materials, rule)
    _finish(ring)

    # ground-floor back wall: spruce plank lining on a black backing
    lz = (FLOOR_SLAB_TOP - EPS, CEILING_Z + EPS)
    backing = _box("lining_back_backing", (X0I, X1I, Y0I - EPS, Y0I + LINING_BACKING_T, lz[0], lz[1]), coll)
    materials.apply(backing, "membrane")
    _finish(backing)
    bm = bmesh.new()
    w = (X1I - X0I - (LINING_PLANKS - 1) * LINING_GAP) / LINING_PLANKS
    py0 = Y0I + LINING_BACKING_T - 0.001
    for k in range(LINING_PLANKS):
        x = X0I + k * (w + LINING_GAP)
        _add_box(bm, (x, x + w, py0, py0 + LINING_PLANK_T, lz[0], lz[1]))
    planks = _mesh_object("lining_back_planks", bm, coll)
    materials.apply(planks, "spruce")
    _finish(planks)


def _build_partition(coll, materials):
    ob = _box(
        "partition_upper",
        (-PARTITION_T / 2, PARTITION_T / 2, PARTITION_Y[0], PARTITION_Y[1], spec.Z_SLAB1 - EPS, Z_TOP + 0.005), coll,
    )
    materials.apply(ob, "plaster")
    _finish(ob)
    return ob


def _build_plinth(coll, materials, cutters):
    bm = bmesh.new()
    p = PLINTH_PROUD
    _add_ring(bm, (X0 - p, X1 + p, Y0 - p, Y1 + p), (X0 + PLINTH_BAND, X1 - PLINTH_BAND, Y0 + PLINTH_BAND, Y1 - PLINTH_BAND), -0.05, spec.PLINTH_H)
    ob = _mesh_object("plinth", bm, coll)
    _boolean_subtract(ob, [cutters["plinth_openings"]])
    materials.apply(ob, "concrete")
    _finish(ob)
    return ob


def _build_slabs(coll, materials, cutters):
    ground = _box("slab_ground", (X0I - EPS, X1I + EPS, Y0I - EPS, Y1I + EPS, FLOOR_SLAB_BOTTOM, FLOOR_SLAB_TOP), coll)
    _assign_faces(ground, materials, lambda c, n: "oak_floor" if n.z > 0.9 else "concrete")
    _finish(ground)

    first = _box("slab_first", (X0I - EPS, X1I + EPS, Y0I - EPS, Y1I + EPS, CEILING_Z, spec.Z_SLAB1), coll)
    _boolean_subtract(first, [cutters["stairwell"]])
    well = cutters["stairwell"]["bounds"]

    def rule(c, n):
        if n.z > 0.9:
            return "oak_floor"
        if n.z < -0.9:
            return "plaster"
        return "spruce" if _inside(c, well, 0.01) else "plaster"  # stairwell trimmer shows its timber edge

    _assign_faces(first, materials, rule)
    _finish(first)
    return ground, first


def _build_roof(coll, materials):
    ov = spec.ROOF_OVERHANG
    piv = ROOF_PIVOT
    # structural slab, bisected along the wall lines so the interior ceiling can be plaster
    bm = bmesh.new()
    _add_box(bm, (X0 - ov, X1 + ov, Y0 - ov, Y1 + ov, Z_TOP - 0.001, ROOF_SLAB_TOP))
    for co, no in (((X0I, 0, 0), (1, 0, 0)), ((X1I, 0, 0), (1, 0, 0)), ((0, Y0I, 0), (0, 1, 0)), ((0, Y1I, 0), (0, 1, 0))):
        bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], dist=1e-6, plane_co=co, plane_no=no)
    slab = _mesh_object("roof_slab", bm, coll, origin=piv)

    def rule(c, n):
        if n.z < -0.9 and abs(c.x) < X1I + 0.001 and abs(c.y) < Y1I + 0.001:
            return "plaster"
        return "anthracite"

    _assign_faces(slab, materials, rule)
    _finish(slab)

    membrane = _box(
        "roof_membrane",
        (X0 - ov + 0.01, X1 + ov - 0.01, Y0 - ov + 0.01, Y1 + ov - 0.01, ROOF_SLAB_TOP - 0.01, ROOF_MEMBRANE_TOP), coll, origin=piv,
    )
    materials.apply(membrane, "roof_membrane")
    _finish(membrane)

    bm = bmesh.new()
    fo = FASCIA_OUT
    _add_ring(
        bm, (X0 - fo, X1 + fo, Y0 - fo, Y1 + fo), (X0 - ov + EPS, X1 + ov - EPS, Y0 - ov + EPS, Y1 + ov - EPS),
        Z_TOP + spec.ROOF_T - spec.FASCIA_H, Z_TOP + spec.ROOF_T,
    )
    fascia = _mesh_object("roof_fascia", bm, coll, origin=piv)
    materials.apply(fascia, "anthracite")
    _finish(fascia)
    return slab, membrane, fascia


def _build_box(coll, materials, cutters):
    b = spec.BOX
    shell = _box("box_shell", (b["x"][0], b["x"][1], b["y"][0], b["y"][1], b["z"][0], b["z"][1]), coll)
    _boolean_subtract(shell, [cutters["box_cavity"], cutters["house_core"], cutters["box_window"]])
    _assign_faces(shell, materials, lambda c, n: "spruce" if _inside(c, BOX_CAVITY, 0.01) else "anthracite")
    _finish(shell)
    return shell


def _z_nose(y):
    """Height of the tread-nose line (top of tread k at its nose) as a function of y."""
    return spec.Z_FLOOR + STAIR_RISE + (STAIR_Y_START - y) * STAIR_RISE / STAIR_GOING


def _build_stair(coll, materials):
    x0, x1 = STAIR_X
    # treads
    bm = bmesh.new()
    for k in range(1, STAIR_TREADS + 1):
        yb = STAIR_Y_START - k * STAIR_GOING
        yf = STAIR_Y_START - (k - 1) * STAIR_GOING + NOSING
        zt = spec.Z_FLOOR + k * STAIR_RISE
        _add_box(bm, (x0 + STRINGER_T - 0.01, x1 - STRINGER_T + 0.01, yb, yf, zt - TREAD_T, zt))
    treads = _mesh_object("stair_treads", bm, coll)
    materials.apply(treads, "spruce")
    _finish(treads)

    # two closed strings: a parallelogram following the nose line, 0.30 deep, cut at the floor and the slab
    slope = STAIR_RISE / STAIR_GOING
    drop = STRINGER_D / math.cos(math.atan(slope))
    y_end = STAIR_Y_START + NOSING + 0.02
    z_foot = FLOOR_SLAB_TOP - 0.005  # stands on the screed (the oak finish is laid around it)
    y_floor = STAIR_Y_START - (z_foot + drop - _z_nose(STAIR_Y_START)) / slope
    y_top = STAIR_Y_TOP - 0.005  # 5 mm into the slab edge
    pts = [
        (y_end, _z_nose(y_end)),
        (y_end, z_foot),
        (y_floor, z_foot),
        (y_top, _z_nose(y_top) - drop),
        (y_top, _z_nose(y_top)),
    ]
    bm = bmesh.new()
    _add_prism_yz(bm, pts, x0, x0 + STRINGER_T)
    _add_prism_yz(bm, pts, x1 - STRINGER_T, x1 + EPS)
    strings = _mesh_object("stair_stringers", bm, coll)
    materials.apply(strings, "spruce")
    _finish(strings)

    # handrail on the open side + guard around the stairwell (slim black steel)
    xr = x0 + STRINGER_T / 2
    bm = bmesh.new()
    z_top_rail = spec.Z_SLAB1 + RAIL_H
    y_g1 = STAIRWELL_Y[1]
    for h, r in ((RAIL_H, RAIL_R), (RAIL_H - 0.45, MIDRAIL_R)):
        a = (xr, y_end, _z_nose(y_end) + h)
        c = (xr, STAIR_Y_TOP, _z_nose(STAIR_Y_TOP) + h)
        d = (xr, y_g1, spec.Z_SLAB1 + h)
        e = (x1 + 0.01, y_g1, spec.Z_SLAB1 + h)  # rail fixed into the wall
        _add_tube(bm, a, c, r)
        _add_tube(bm, c, d, r)
        _add_tube(bm, d, e, r)
        _add_sphere(bm, a, r)
        _add_sphere(bm, c, r)
        _add_sphere(bm, d, r)
    for k in (1, 4, 7, 10, 13, 15):
        y = STAIR_Y_START - (k - 1) * STAIR_GOING - 0.03
        zb = _z_nose(y)
        _add_tube(bm, (xr, y, zb - 0.02), (xr, y, zb + RAIL_H - RAIL_R), POST_R)
    for y in (STAIR_Y_TOP + 0.03, 0.45, 1.45, y_g1 - 0.03):
        _add_tube(bm, (xr, y, spec.Z_SLAB1 - 0.02), (xr, y, z_top_rail - RAIL_R), POST_R)
    _add_tube(bm, (x0 + 0.5, y_g1 - 0.03, spec.Z_SLAB1 - 0.02), (x0 + 0.5, y_g1 - 0.03, z_top_rail - RAIL_R), POST_R)
    rail = _mesh_object("stair_handrail", bm, coll)
    materials.apply(rail, "steel_black")
    _finish(rail, width=0.002)
    return treads, strings, rail


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------
def build_house(materials=None, partition=True):
    """Build the house shell; returns the dict of collections (see module doc)."""
    if materials is None:
        materials = StandInMaterials()
    t0 = time.time()
    cols = {k: _scene_collection(k) for k in ("walls", "roof", "box", "openings", "slabs", "stair", "plinth")}
    cutters = _make_cutters(cols["openings"])
    _build_walls(cols["walls"], materials, cutters)
    if partition:
        _build_partition(cols["walls"], materials)
    _build_plinth(cols["plinth"], materials, cutters)
    _build_slabs(cols["slabs"], materials, cutters)
    _build_roof(cols["roof"], materials)
    _build_box(cols["box"], materials, cutters)
    _build_stair(cols["stair"], materials)
    _hide_cutters(cols["openings"])
    print(f"[geometry] house built in {time.time() - t0:.2f} s")
    return cols


# ---------------------------------------------------------------------------
# Stand-in materials (flat Principled with the spec colours) for the standalone test
# ---------------------------------------------------------------------------
class StandInMaterials:
    ROUGH = {
        "anthracite": 0.28, "frame": 0.35, "plaster": 0.7, "spruce": 0.55, "oak_floor": 0.35, "concrete": 0.9,
        "membrane": 0.85, "roof_membrane": 0.9, "steel_black": 0.45, "lawn": 0.9, "gravel": 0.9, "larch": 0.5,
    }
    COLOR_ALIAS = {"lawn": "lawn_a"}

    def __init__(self):
        self._cache = {}

    def get(self, name):
        m = self._cache.get(name)
        if m is not None:
            return m
        m = bpy.data.materials.new(f"standin_{name}")
        m.use_nodes = True
        p = m.node_tree.nodes["Principled BSDF"]
        hexcol = spec.COLORS.get(self.COLOR_ALIAS.get(name, name), "#808080")
        p.inputs["Base Color"].default_value = spec.hex_to_rgb(hexcol)
        p.inputs["Roughness"].default_value = self.ROUGH.get(name, 0.6)
        if name == "steel_black":
            p.inputs["Metallic"].default_value = 1.0
        self._cache[name] = m
        return m

    def apply(self, obj, name):
        obj.data.materials.clear()
        obj.data.materials.append(self.get(name))


# ---------------------------------------------------------------------------
# Standalone test
# ---------------------------------------------------------------------------
def _look_at(ob, target):
    d = Vector(target) - ob.location
    ob.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()


def _test_scene(view, scale, samples, custom=None, facade=None):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.render.threads_mode = "AUTO"
    sc.view_settings.view_transform = "AgX"
    sc.view_settings.look = "AgX - Base Contrast"
    sc.view_settings.exposure = -2.0

    mats = StandInMaterials()
    house = build_house(mats)
    for k, c in house.items():
        print(f"  {k:9s} {len(c.objects)} objects")
    if facade:  # legibility aid only: tint the (black) facade membrane like the named material
        p = mats.get("membrane").node_tree.nodes["Principled BSDF"]
        p.inputs["Base Color"].default_value = spec.hex_to_rgb(spec.COLORS[facade])
        p.inputs["Roughness"].default_value = 0.55

    ground = _box("test_ground", (-60, 60, -60, 60, -0.2, 0.0), sc.collection)
    mats.apply(ground, "lawn")

    w = bpy.data.worlds.new("test_world")
    sc.world = w
    if w.node_tree is None:
        w.use_nodes = True
    nt = w.node_tree
    sky = nt.nodes.new("ShaderNodeTexSky")
    sky.sky_type = "MULTIPLE_SCATTERING"
    sky.sun_elevation = math.radians(spec.LIGHTS["morning"]["elevation"])
    sky.sun_rotation = math.radians(315)  # sun from the front-left (−X, +Y); the sky node's 0° is +Y, clockwise
    sky.sun_intensity = spec.LIGHTS["morning"]["intensity"]
    sky.sun_disc = True
    sky.air_density = 1.0
    sky.aerosol_density = 1.5  # Blender 5 name for the SPEC "dust"
    bg = nt.nodes["Background"]
    nt.links.new(sky.outputs[0], bg.inputs[0])

    cam = bpy.data.cameras.new("test_cam")
    co = bpy.data.objects.new("test_cam", cam)
    sc.collection.objects.link(co)
    sc.camera = co
    cam.sensor_fit = "VERTICAL"
    cam.sensor_height = 24.0
    views = {
        "hero": ((16, 24, 4.6), (-5.4, 0, 2.5), 25, (1440, 900)),
        "interior": ((2.5, -3.7, 1.5), (-1.7, 5.0, 1.15), 47, (1440, 900)),
        "stair": ((-1.5, 3.8, 1.6), (3.2, -0.2, 1.6), 50, (1440, 900)),
        "top": ((25, 25, 19), (-3.4, 0, 1.0), 28, (1440, 900)),
    }
    pos, tgt, fov, size = views.get(view, views["hero"])
    if custom:  # ad-hoc inspection camera: (pos, target, fov)
        pos, tgt, fov = custom
    co.location = pos
    _look_at(co, tgt)
    cam.lens = spec.lens_for_fov(fov)
    if view == "top":  # dollhouse-style check: lift the roof group
        for ob in house["roof"].objects:
            ob.location.x += spec.DOLLHOUSE_ROOF["dx"]
            ob.location.z += spec.DOLLHOUSE_ROOF["dz"]
            ob.rotation_euler.y = math.radians(spec.DOLLHOUSE_ROOF["rot_y_deg"])

    sc.render.resolution_x, sc.render.resolution_y = size
    sc.render.resolution_percentage = scale
    sc.render.filter_size = 1.5
    cy = sc.cycles
    cy.samples = samples
    cy.use_denoising = True
    cy.denoiser = "OPENIMAGEDENOISE"
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

    ap = argparse.ArgumentParser(description="geometry.py standalone test render")
    ap.add_argument("--view", default="hero", choices=["hero", "interior", "stair", "top", "custom"])
    ap.add_argument("--cam", default=None, help="x,y,z of an ad-hoc camera (view=custom)")
    ap.add_argument("--target", default=None, help="x,y,z look-at for the ad-hoc camera")
    ap.add_argument("--fov", type=float, default=30.0, help="vertical fov for the ad-hoc camera")
    ap.add_argument("--name", default=None, help="output name suffix (default: the view)")
    ap.add_argument("--facade", default=None, help="tint the facade membrane with this spec colour (e.g. larch)")
    ap.add_argument("--scale", type=int, default=25)
    ap.add_argument("--samples", type=int, default=32)
    args = ap.parse_args()

    custom = None
    if args.view == "custom":
        custom = (
            tuple(float(v) for v in args.cam.split(",")),
            tuple(float(v) for v in args.target.split(",")),
            args.fov,
        )
    scene = _test_scene(args.view, args.scale, args.samples, custom, args.facade)
    out_dir = os.path.join(_HERE, "_test")
    os.makedirs(out_dir, exist_ok=True)
    out = os.path.join(out_dir, f"geometry_{args.name or args.view}.png")
    scene.render.filepath = out
    scene.render.image_settings.file_format = "PNG"
    t0 = time.time()
    bpy.ops.render.render(write_still=True)
    dt = time.time() - t0
    print(f"[geometry] test render: {out}")
    print(f"[geometry] render time: {dt:.1f} s")
