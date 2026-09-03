"""Procedural Cycles material library for the EcoDomček scene (SPEC.md, "Materials").

Public API
    get(name) -> bpy.types.Material          build on first use, cached by name
    apply(obj, name) -> bpy.types.Material   assign to slot 0 of obj.data (append if none)
    names() -> list[str]                     every material name this module can build
    add_bevel(obj, width=0.005, segments=2)  convenience: Bevel modifier on hard edges

Every material is a Principled BSDF fed by procedural textures evaluated in
*object* coordinates (Texture Coordinate → Object), so no UV maps are needed
and scale is true to the metre. Wood grain direction is derived from the
object-space normal: on faces whose normal is ±Y the grain runs along X, on
±X faces along Y — i.e. along the slat on every wall — and on horizontal
surfaces along X (deck boards) or Y (oak floor, OAK_PLANK_AXIS). Per-object
variation (hue / value / grain phase) comes from Object Info → Random, with
an extra per-row term (floor(z / slat pitch)) so joined slat meshes still
vary board by board.

Hard-surface materials chain a ShaderNodeBevel behind the bump so edges read
as chamfered even on plain boxes; set materials.SHADER_BEVEL = False before
the first get() to drop it (cheaper, use a Bevel modifier instead).

Standalone test:  python3 materials.py [name ...]
renders a labelled material-ball sheet to _test/materials_sheet.png.
"""

from __future__ import annotations

import math
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, "/home/user/codera/clients/ecodomcek/cycles")

import bpy  # noqa: E402
import spec  # noqa: E402

# ---- tunables (integrator may override before the first get()) -------------
SHADER_BEVEL = True  # add ShaderNodeBevel to hard-surface materials
BEVEL_SAMPLES = 4
OAK_PLANK_AXIS = "Y"  # planks run toward the glazing (+Y); "X" to flip
SLAT_PITCH = spec.SLAT_H + spec.SLAT_GAP  # 0.080 — per-row variation on walls
DECK_PITCH = spec.DECK["board_w"] + spec.DECK["gap"]  # 0.151
OAK_PLANK = (1.6, 0.14, 0.002)  # length, width, gap (m)
PANEL_FORMAT = (1.2, 2.4)  # Fundermax panel format: along, across (m)

# The 16 names of the SPEC table, in table order, then the extras.
SPEC_NAMES = [
    "larch",
    "larch_deck",
    "anthracite",
    "membrane",
    "glass",
    "frame",
    "plaster",
    "spruce",
    "oak_floor",
    "concrete",
    "gravel",
    "lawn",
    "fabric_grey",
    "linen",
    "steel_black",
    "roof_membrane",
]
EXTRA_NAMES = [
    "studio_floor",  # dollhouse ground (#E8DFCE)
    "spruce_vertical",  # spruce with the grain along Z on walls
    "oak",  # oak without plank gaps (table top)
    "oak_white",  # white-oiled oak (kitchen fronts)
    "wood_fibre",  # x-ray layer 3
    "hemp",  # x-ray layer 4 insulation
    "wool",  # x-ray layer 6 sheep wool
    "gypsum_fibre",  # x-ray layers 5 and 7
]
NAMES = SPEC_NAMES + EXTRA_NAMES

_CACHE: dict[str, bpy.types.Material] = {}


# ---------------------------------------------------------------------------
# public API
# ---------------------------------------------------------------------------
def names() -> list[str]:
    return list(NAMES)


def get(name: str) -> bpy.types.Material:
    """Return the material called `name`, building it on first use."""
    if name not in _BUILDERS:
        raise KeyError(f"materials.get: unknown material {name!r}; known: {', '.join(NAMES)}")
    mat = _CACHE.get(name)
    if mat is not None:
        try:
            if mat.name in bpy.data.materials and bpy.data.materials[mat.name] == mat:
                return mat
        except ReferenceError:
            pass  # datablock was freed (e.g. read_factory_settings) — rebuild
    # reuse a material we built earlier in this .blend (survives a cache reset)
    existing = bpy.data.materials.get(name)
    if existing is not None and existing.get("ecodomcek_material") == name:
        _CACHE[name] = existing
        return existing
    mat = bpy.data.materials.new(name)
    mat["ecodomcek_material"] = name
    b = _B(mat)
    _BUILDERS[name](b)
    _CACHE[name] = mat
    return mat


def apply(obj: bpy.types.Object, name: str) -> bpy.types.Material:
    """Assign material `name` to slot 0 of `obj` (mesh, curve or text)."""
    mat = get(name)
    data = getattr(obj, "data", None)
    if data is None or not hasattr(data, "materials"):
        return mat
    if len(data.materials) == 0:
        data.materials.append(mat)
    else:
        data.materials[0] = mat
    return mat


def add_bevel(obj: bpy.types.Object, width: float = 0.005, segments: int = 2, angle_deg: float = 40.0):
    """Bevel modifier for chamfered hard edges (SPEC: 4–8 mm, 2 segments)."""
    if obj.type != "MESH":
        return None
    mod = obj.modifiers.new("Bevel", "BEVEL")
    mod.width = width
    mod.segments = segments
    mod.limit_method = "ANGLE"
    mod.angle_limit = math.radians(angle_deg)
    mod.harden_normals = True
    mod.use_clamp_overlap = True
    return mod


def rgb(hex_or_name: str, mul: float = 1.0, tint=(1.0, 1.0, 1.0)) -> tuple:
    """sRGB hex (or a spec.COLORS key) → linear RGBA, optionally scaled."""
    h = spec.COLORS.get(hex_or_name, hex_or_name)
    r, g, bl, _ = spec.hex_to_rgb(h)
    return (r * mul * tint[0], g * mul * tint[1], bl * mul * tint[2], 1.0)


# ---------------------------------------------------------------------------
# node-tree builder helpers
# ---------------------------------------------------------------------------
_Socket = bpy.types.NodeSocket


class _B:
    """Thin wrapper over a material node tree: every helper returns sockets."""

    def __init__(self, mat: bpy.types.Material):
        self.mat = mat
        self.nt = mat.node_tree
        self.nodes = self.nt.nodes
        self.links = self.nt.links
        for n in list(self.nodes):
            self.nodes.remove(n)
        self._count = 0
        self._coord = None
        self._objinfo = None

    # -- generic -----------------------------------------------------------
    def node(self, kind: str, **attrs):
        n = self.nodes.new(kind)
        for k, v in attrs.items():
            setattr(n, k, v)
        # cosmetic layout so the tree is inspectable in the editor
        n.location = ((self._count % 14) * 220, -(self._count // 14) * 260)
        self._count += 1
        return n

    def set(self, node, key, value):
        sock = node.inputs[key]
        if isinstance(value, _Socket):
            self.links.new(value, sock)
        else:
            sock.default_value = value

    # -- scalar math -------------------------------------------------------
    def math(self, op: str, a, b=0.0, c=0.0, clamp: bool = False):
        n = self.node("ShaderNodeMath", operation=op, use_clamp=clamp)
        self.set(n, 0, a)
        self.set(n, 1, b)
        self.set(n, 2, c)
        return n.outputs[0]

    def add(self, a, b):
        return self.math("ADD", a, b)

    def sub(self, a, b):
        return self.math("SUBTRACT", a, b)

    def mul(self, a, b):
        return self.math("MULTIPLY", a, b)

    def madd(self, a, b, c):
        """a * b + c"""
        return self.math("MULTIPLY_ADD", a, b, c)

    def frac(self, a):
        return self.math("FRACT", a)

    def floor(self, a):
        return self.math("FLOOR", a)

    def absv(self, a):
        return self.math("ABSOLUTE", a)

    def gt(self, a, b):
        return self.math("GREATER_THAN", a, b)

    def maxv(self, a, b):
        return self.math("MAXIMUM", a, b)

    def clamp01(self, a):
        return self.math("ADD", a, 0.0, clamp=True)

    def mapr(self, v, a0, a1, b0, b1, interp: str = "LINEAR", clamp: bool = True):
        n = self.node("ShaderNodeMapRange", interpolation_type=interp, clamp=clamp)
        self.set(n, 0, v)
        self.set(n, 1, a0)
        self.set(n, 2, a1)
        self.set(n, 3, b0)
        self.set(n, 4, b1)
        return n.outputs[0]

    def smooth(self, v, e0, e1, lo=0.0, hi=1.0):
        return self.mapr(v, e0, e1, lo, hi, "SMOOTHSTEP")

    def centred(self, v, amount):
        """(v - 0.5) * 2 * amount  — turn a 0..1 texture into ± amount."""
        return self.madd(v, 2.0 * amount, -amount)

    def mixf(self, fac, a, b):
        n = self.node("ShaderNodeMix", data_type="FLOAT", clamp_factor=True)
        self.set(n, 0, fac)
        self.set(n, 2, a)
        self.set(n, 3, b)
        return n.outputs[0]

    # -- colour --------------------------------------------------------------
    def mixc(self, fac, a, b, blend: str = "MIX"):
        n = self.node("ShaderNodeMix", data_type="RGBA", blend_type=blend, clamp_factor=True)
        self.set(n, 0, fac)
        self.set(n, 6, a)
        self.set(n, 7, b)
        return n.outputs[2]

    def ramp(self, fac, stops, interp: str = "LINEAR"):
        n = self.node("ShaderNodeValToRGB")
        cr = n.color_ramp
        cr.interpolation = interp
        while len(cr.elements) > 1:
            cr.elements.remove(cr.elements[-1])
        first = True
        for pos, col in stops:
            el = cr.elements[0] if first else cr.elements.new(pos)
            el.position = pos
            el.color = col if len(col) == 4 else (*col, 1.0)
            first = False
        self.set(n, 0, fac)
        return n.outputs[0]

    def hsv(self, color, hue=0.5, sat=1.0, val=1.0):
        n = self.node("ShaderNodeHueSaturation")
        self.set(n, "Hue", hue)
        self.set(n, "Saturation", sat)
        self.set(n, "Value", val)
        self.set(n, "Color", color)
        return n.outputs[0]

    def scale_color(self, color, factor):
        """color * factor (factor may be a socket)."""
        n = self.node("ShaderNodeMix", data_type="RGBA", blend_type="MULTIPLY", clamp_factor=True)
        self.set(n, 0, 1.0)
        self.set(n, 6, color)
        if isinstance(factor, _Socket):
            grey = self.combine(factor, factor, factor)
            self.links.new(grey, n.inputs[7])
        else:
            self.set(n, 7, (factor, factor, factor, 1.0))
        return n.outputs[2]

    # -- vectors -------------------------------------------------------------
    def combine(self, x, y, z):
        n = self.node("ShaderNodeCombineXYZ")
        self.set(n, 0, x)
        self.set(n, 1, y)
        self.set(n, 2, z)
        return n.outputs[0]

    def separate(self, vec):
        n = self.node("ShaderNodeSeparateXYZ")
        self.set(n, 0, vec)
        return n.outputs[0], n.outputs[1], n.outputs[2]

    def vmath(self, op, a, b=None, scale=None):
        n = self.node("ShaderNodeVectorMath", operation=op)
        self.set(n, 0, a)
        if b is not None:
            self.set(n, 1, b)
        if scale is not None:
            self.set(n, 3, scale)
        return n.outputs[0] if op not in ("LENGTH", "DOT_PRODUCT", "DISTANCE") else n.outputs[1]

    def vscale(self, vec, s):
        return self.vmath("SCALE", vec, scale=s)

    # -- coordinates -----------------------------------------------------------
    def coord(self):
        if self._coord is None:
            self._coord = self.node("ShaderNodeTexCoord")
        return self._coord

    def obj_co(self):
        return self.coord().outputs["Object"]

    def obj_normal(self):
        return self.coord().outputs["Normal"]

    def objinfo(self):
        if self._objinfo is None:
            self._objinfo = self.node("ShaderNodeObjectInfo")
        return self._objinfo

    def rand(self):
        return self.objinfo().outputs["Random"]

    def rand_k(self, k: float):
        """A second, decorrelated per-object random in 0..1."""
        return self.frac(self.madd(self.rand(), k, 0.37))

    def whitenoise1(self, w):
        n = self.node("ShaderNodeTexWhiteNoise", noise_dimensions="1D")
        self.set(n, "W", w)
        return n.outputs["Value"]

    # -- textures (return the node; use .outputs[...]) -----------------------------
    def noise(self, vec, scale, detail=2.0, rough=0.5, lac=2.0, distortion=0.0, ntype="FBM", dims="3D"):
        n = self.node("ShaderNodeTexNoise", noise_dimensions=dims, noise_type=ntype, normalize=True)
        self.set(n, "Vector", vec)
        self.set(n, "Scale", scale)
        self.set(n, "Detail", detail)
        self.set(n, "Roughness", rough)
        self.set(n, "Lacunarity", lac)
        self.set(n, "Distortion", distortion)
        return n

    def noisef(self, *a, **k):
        return self.noise(*a, **k).outputs["Factor"]

    def voronoi(self, vec, scale, feature="F1", dims="3D", randomness=1.0, smoothness=0.0, detail=0.0):
        n = self.node("ShaderNodeTexVoronoi", voronoi_dimensions=dims, feature=feature, normalize=False)
        self.set(n, "Vector", vec)
        self.set(n, "Scale", scale)
        self.set(n, "Detail", detail)
        self.set(n, "Randomness", randomness)
        if feature == "SMOOTH_F1":
            self.set(n, "Smoothness", smoothness)
        return n

    def wave(self, vec, scale, distortion=0.0, detail=2.0, dscale=1.0, drough=0.5, direction="Y", profile="SIN", wtype="BANDS", phase=0.0):
        n = self.node("ShaderNodeTexWave", wave_type=wtype, bands_direction=direction, wave_profile=profile)
        self.set(n, "Vector", vec)
        self.set(n, "Scale", scale)
        self.set(n, "Distortion", distortion)
        self.set(n, "Detail", detail)
        self.set(n, "Detail Scale", dscale)
        self.set(n, "Detail Roughness", drough)
        self.set(n, "Phase Offset", phase)
        return n

    def brick(self, vec, width, height, mortar, smooth=0.2, offset=0.0, offset_freq=2, squash=1.0, bias=0.0):
        n = self.node("ShaderNodeTexBrick", offset=offset, offset_frequency=offset_freq, squash=squash, squash_frequency=2)
        self.set(n, "Vector", vec)
        self.set(n, "Color1", (0.0, 0.0, 0.0, 1.0))
        self.set(n, "Color2", (1.0, 1.0, 1.0, 1.0))
        self.set(n, "Mortar", (0.0, 0.0, 0.0, 1.0))
        self.set(n, "Scale", 1.0)
        self.set(n, "Mortar Size", mortar)
        self.set(n, "Mortar Smooth", smooth)
        self.set(n, "Bias", bias)
        self.set(n, "Brick Width", width)
        self.set(n, "Row Height", height)
        return n

    # -- shading ---------------------------------------------------------------
    def bump(self, height, strength, distance, normal=None, invert=False):
        n = self.node("ShaderNodeBump", invert=invert)
        self.set(n, "Strength", strength)
        self.set(n, "Distance", distance)
        self.set(n, "Height", height)
        if normal is not None:
            self.set(n, "Normal", normal)
        return n.outputs[0]

    def bevel(self, normal=None, radius=0.004):
        if not SHADER_BEVEL or radius <= 0:
            return normal
        n = self.node("ShaderNodeBevel", samples=BEVEL_SAMPLES)
        self.set(n, "Radius", radius)
        if normal is not None:
            self.set(n, "Normal", normal)
        return n.outputs[0]

    def principled(self, base, rough, normal=None, spec_level=0.5, metallic=0.0, coat=0.0, coat_rough=0.1, sheen=0.0, sheen_rough=0.5, sheen_tint=None, transmission=0.0, ior=1.45, aniso=0.0, tangent=None, spec_tint=None):
        n = self.node("ShaderNodeBsdfPrincipled")
        self.set(n, "Base Color", base)
        self.set(n, "Roughness", rough)
        self.set(n, "Specular IOR Level", spec_level)
        self.set(n, "Metallic", metallic)
        self.set(n, "IOR", ior)
        self.set(n, "Transmission Weight", transmission)
        self.set(n, "Coat Weight", coat)
        self.set(n, "Coat Roughness", coat_rough)
        self.set(n, "Sheen Weight", sheen)
        self.set(n, "Sheen Roughness", sheen_rough)
        if sheen_tint is not None:
            self.set(n, "Sheen Tint", sheen_tint)
        if spec_tint is not None:
            self.set(n, "Specular Tint", spec_tint)
        self.set(n, "Anisotropic", aniso)
        if tangent is not None:
            self.set(n, "Tangent", tangent)
        if normal is not None:
            self.set(n, "Normal", normal)
        return n

    def output(self, shader):
        out = self.node("ShaderNodeOutputMaterial")
        self.links.new(shader, out.inputs["Surface"])
        return out

    def finish(self, principled_node):
        return self.output(principled_node.outputs[0])


# ---------------------------------------------------------------------------
# shared building blocks
# ---------------------------------------------------------------------------
def _axes(b: _B, orientation: str):
    """Return (along, across, depth, (x, y, z)) scalar sockets in object space.

    orientation:
      wall           along = X on ±Y faces, Y on ±X faces; across = Z
      wall_vertical  along = Z; across = the wall's horizontal axis
      flat_x         along = X, across = Y (deck boards)
      flat_y         along = Y, across = X (oak floor)
      panel          like wall, but horizontal faces use across = the other axis
    """
    x, y, z = b.separate(b.obj_co())
    if orientation == "flat_x":
        return x, y, z, (x, y, z)
    if orientation == "flat_y":
        return y, x, z, (x, y, z)
    nx, ny, nz = b.separate(b.obj_normal())
    side = b.gt(b.absv(nx), b.absv(ny))  # 1 on ±X faces
    h_along = b.mixf(side, x, y)
    h_other = b.mixf(side, y, x)
    if orientation == "wall":
        return h_along, z, h_other, (x, y, z)
    if orientation == "wall_vertical":
        return z, h_along, h_other, (x, y, z)
    if orientation == "panel":
        flat = b.gt(b.absv(nz), 0.7)
        across = b.mixf(flat, z, h_other)
        depth = b.mixf(flat, h_other, z)
        return h_along, across, depth, (x, y, z)
    raise ValueError(orientation)


def _wood(
    b: _B,
    along,
    across,
    depth,
    rand,
    *,
    base,
    dark=0.6,
    light=1.18,
    ring_period=0.0055,
    ring_distort=4.0,
    ring_weight=0.55,
    fine_weight=0.30,
    fine_scale=6.0,
    fine_stretch=18.0,
    knot_prob=0.0,
    knot_color=None,
    rough=(0.45, 0.60),
    hue_var=0.03,
    val_var=0.06,
    row=None,
    row_var=0.04,
):
    """Generic wood: returns (color, roughness, height) sockets.

    Rings: a saw-profile wave across the board, distorted at low frequency so
    the latewood lines wander (flat-sawn look). Fine streaks: noise stretched
    along the board. Pores: very fine isotropic noise. Optional knots: rare
    voronoi cells become a dark ellipse with a ring, and the ring lines bend
    around them.
    """
    r = rand
    r2 = b.frac(b.madd(r, 13.7, 0.31))
    r3 = b.frac(b.madd(r, 29.3, 0.71))
    al = b.madd(r, 5.13, along)
    ac = b.madd(r2, 0.77, across)
    dp = b.madd(r3, 0.33, depth)

    knot = None
    ac_w = ac
    if knot_prob > 0.0:
        ka, kb = 2.0, 12.0  # cell 0.5 m along × 0.083 m across
        kvec = b.combine(b.mul(al, ka), b.mul(ac, kb), 0.0)
        kv = b.voronoi(kvec, 1.0, "F1", dims="2D", randomness=1.0)
        px, py, _ = b.separate(kv.outputs["Position"])
        dx = b.math("DIVIDE", b.sub(px, b.mul(al, ka)), ka)
        dy = b.math("DIVIDE", b.sub(py, b.mul(ac, kb)), kb)
        d = b.vmath("LENGTH", b.combine(dx, dy, 0.0))
        cr, cg, _ = b.separate(kv.outputs["Color"])
        present = b.gt(cr, 1.0 - knot_prob)
        radius = b.madd(cg, 0.008, 0.007)  # 7–15 mm
        core = b.smooth(d, b.mul(radius, 0.7), radius, 1.0, 0.0)
        inner = b.smooth(d, radius, b.mul(radius, 1.55), 1.0, 0.0)
        ring = b.mul(b.sub(inner, core), 0.5)
        knot = b.mul(present, b.add(b.mul(core, 0.92), ring))
        bend = b.mul(present, b.smooth(d, radius, b.mul(radius, 5.0), 1.0, 0.0))
        ac_w = b.madd(bend, 0.02, ac)

    wv = b.combine(b.mul(al, 0.12), ac_w, b.mul(dp, 0.5))
    rings = b.wave(wv, 1.0 / ring_period, distortion=ring_distort, detail=3.0, dscale=0.06, drough=0.6, direction="Y", profile="SAW")
    ring_l = b.ramp(rings.outputs["Factor"], [(0.0, (0.92,) * 3), (0.55, (0.8,) * 3), (0.82, (0.25,) * 3), (1.0, (0.1,) * 3)])
    ring_l = b.separate(ring_l)[0]

    fv = b.combine(al, b.mul(ac, fine_stretch), b.mul(dp, fine_stretch * 0.35))
    fine = b.noisef(fv, fine_scale, detail=4.0, rough=0.55)
    pores = b.noisef(b.combine(al, ac, dp), 900.0, detail=1.0)

    grain = b.add(0.5, b.centred(ring_l, ring_weight * 0.5))
    grain = b.add(grain, b.centred(fine, fine_weight * 1.25))
    grain = b.clamp01(b.add(grain, b.centred(pores, 0.05)))
    color = b.ramp(grain, [(0.0, rgb(base, dark)), (0.5, rgb(base)), (1.0, rgb(base, light))])
    if knot is not None:
        kc = knot_color if knot_color is not None else rgb(base, 0.32, (1.0, 0.85, 0.7))
        color = b.mixc(knot, color, kc)

    hue = b.add(0.5, b.centred(r, hue_var))
    val = b.add(1.0, b.centred(r2, val_var))
    if row is not None:
        rr = b.whitenoise1(b.floor(row))
        val = b.mul(val, b.add(1.0, b.centred(rr, row_var)))
    color = b.hsv(color, hue, 1.0, val)

    lo, hi = rough
    roughness = b.madd(ring_l, hi - lo, lo)  # earlywood (light) rougher, latewood shinier
    roughness = b.add(roughness, b.centred(pores, 0.03))
    if knot is not None:
        roughness = b.madd(knot, 0.15, roughness)

    height = b.add(b.mul(ring_l, 0.5), b.mul(fine, 0.35))
    height = b.add(height, b.mul(pores, 0.15))
    if knot is not None:
        height = b.sub(height, b.mul(knot, 0.4))
    return color, roughness, height


# ---------------------------------------------------------------------------
# the materials
# ---------------------------------------------------------------------------
def _larch(b: _B):
    along, across, depth, _ = _axes(b, "wall")
    row = b.math("DIVIDE", across, SLAT_PITCH)
    color, rough, height = _wood(
        b, along, across, depth, b.rand(),
        base="larch", dark=0.62, light=1.16, ring_period=0.0055, ring_distort=4.0,
        knot_prob=0.12, rough=(0.45, 0.60), hue_var=0.03, val_var=0.06, row=row, row_var=0.05,
    )
    n = b.bump(height, 0.15, 0.004)
    n = b.bevel(n, 0.003)
    tangent = b.node("ShaderNodeTangent", direction_type="RADIAL", axis="Z")
    p = b.principled(color, rough, n, spec_level=0.5, coat=0.18, coat_rough=0.35, aniso=0.1, tangent=tangent.outputs[0])
    b.finish(p)


def _larch_deck(b: _B):
    along, across, depth, (x, y, z) = _axes(b, "flat_x")
    row = b.math("DIVIDE", across, DECK_PITCH)
    color, rough, height = _wood(
        b, along, across, depth, b.rand(),
        base="larch_deck", dark=0.6, light=1.15, ring_period=0.006, ring_distort=4.5,
        knot_prob=0.10, rough=(0.62, 0.78), hue_var=0.02, val_var=0.06, row=row, row_var=0.05,
    )
    # weathering: patchy silver-grey bloom, stronger on some boards
    wx = b.noisef(b.combine(b.mul(x, 0.6), b.mul(y, 2.0), z), 1.6, detail=3.0, rough=0.6)
    weather = b.smooth(wx, 0.42, 0.68, 0.0, 1.0)
    weather = b.mul(weather, b.madd(b.rand_k(7.7), 0.4, 0.25))
    silver = (0.30, 0.29, 0.27, 1.0)
    color = b.mixc(weather, color, silver)
    rough = b.madd(weather, 0.1, rough)
    height = b.add(height, b.mul(b.noisef(b.combine(x, b.mul(y, 25.0), z), 4.0, detail=3.0), 0.5))
    n = b.bump(height, 0.3, 0.004)
    n = b.bevel(n, 0.003)
    p = b.principled(color, rough, n, spec_level=0.45, coat=0.03, coat_rough=0.5)
    b.finish(p)


def _spruce_common(b: _B, orientation: str):
    along, across, depth, _ = _axes(b, orientation)
    color, rough, height = _wood(
        b, along, across, depth, b.rand(),
        base="spruce", dark=0.8, light=1.1, ring_period=0.0045, ring_distort=3.0, ring_weight=0.45,
        fine_weight=0.25, knot_prob=0.05, knot_color=rgb("spruce", 0.5, (1.0, 0.8, 0.62)),
        rough=(0.5, 0.6), hue_var=0.012, val_var=0.04, row=None,
    )
    n = b.bump(height, 0.08, 0.003)
    n = b.bevel(n, 0.003)
    p = b.principled(color, rough, n, spec_level=0.45, coat=0.04, coat_rough=0.5)
    b.finish(p)


def _spruce(b: _B):
    _spruce_common(b, "wall")


def _spruce_vertical(b: _B):
    _spruce_common(b, "wall_vertical")


def _oak_floor(b: _B):
    along, across, depth, _ = _axes(b, "flat_y" if OAK_PLANK_AXIS == "Y" else "flat_x")
    L, W, G = OAK_PLANK
    pitch = W + G
    row = b.floor(b.math("DIVIDE", across, pitch))
    stagger = b.mul(b.whitenoise1(row), L)  # random end-joint offset per row
    bv = b.combine(b.add(along, stagger), across, 0.0)
    br = b.brick(bv, L, pitch, G, smooth=0.3)
    gap = br.outputs["Fac"]
    prand, _, _ = b.separate(br.outputs["Color"])
    prand = b.frac(b.add(prand, b.mul(b.rand(), 0.37)))
    color, rough, height = _wood(
        b, along, across, depth, prand,
        base="oak_floor", dark=0.62, light=1.15, ring_period=0.0045, ring_distort=5.0, ring_weight=0.5,
        fine_weight=0.4, fine_scale=5.0, fine_stretch=16.0, knot_prob=0.05, rough=(0.30, 0.40),
        hue_var=0.02, val_var=0.09,
    )
    color = b.mixc(gap, color, (0.012, 0.009, 0.006, 1.0))
    rough = b.mixf(gap, rough, 0.75)
    height = b.sub(b.mul(height, 0.25), gap)
    n = b.bump(height, 0.5, 0.003)
    p = b.principled(color, rough, n, spec_level=0.5, coat=0.3, coat_rough=0.25)
    b.finish(p)


def _oak(b: _B):
    along, across, depth, _ = _axes(b, "flat_y")
    color, rough, height = _wood(
        b, along, across, depth, b.rand(),
        base="oak_floor", dark=0.65, light=1.14, ring_period=0.0045, ring_distort=5.0, ring_weight=0.5,
        fine_weight=0.4, fine_scale=5.0, fine_stretch=16.0, knot_prob=0.03, rough=(0.32, 0.42),
        hue_var=0.015, val_var=0.05,
    )
    n = b.bump(height, 0.1, 0.003)
    n = b.bevel(n, 0.003)
    p = b.principled(color, rough, n, spec_level=0.5, coat=0.25, coat_rough=0.3)
    b.finish(p)


def _oak_white(b: _B):
    along, across, depth, _ = _axes(b, "wall_vertical")
    color, rough, height = _wood(
        b, along, across, depth, b.rand(),
        base="#E3D6C0", dark=0.78, light=1.06, ring_period=0.0045, ring_distort=5.0, ring_weight=0.45,
        fine_weight=0.35, fine_scale=5.0, fine_stretch=16.0, knot_prob=0.0, rough=(0.38, 0.48),
        hue_var=0.01, val_var=0.03,
    )
    n = b.bump(height, 0.08, 0.003)
    n = b.bevel(n, 0.003)
    p = b.principled(color, rough, n, spec_level=0.45, coat=0.15, coat_rough=0.35)
    b.finish(p)


def _anthracite(b: _B):
    along, across, depth, (x, y, z) = _axes(b, "panel")
    co = b.obj_co()
    pa, pc = PANEL_FORMAT

    def seam(t, period, half_w=0.0015, soft=0.001):
        u = b.frac(b.math("DIVIDE", t, period))
        dist = b.mul(b.sub(0.5, b.absv(b.sub(u, 0.5))), period)
        return b.smooth(dist, half_w, half_w + soft, 1.0, 0.0)

    s = b.maxv(seam(along, pa), seam(across, pc))
    micro = b.noisef(co, 800.0, detail=2.0)
    wavy = b.noisef(co, 1.3, detail=2.0)
    smudge = b.noisef(co, 5.0, detail=3.0, rough=0.6)
    color = b.scale_color(rgb("anthracite"), b.add(1.0, b.centred(wavy, 0.05)))
    color = b.mixc(s, color, rgb("anthracite", 0.35))
    rough = b.add(0.28, b.centred(micro, 0.03))
    rough = b.add(rough, b.centred(smudge, 0.025))
    rough = b.madd(s, 0.25, rough)
    n = b.bump(wavy, 0.12, 0.02)  # slight waviness of the reflections
    n = b.bump(b.sub(b.mul(micro, 0.3), s), 0.35, 0.002, normal=n)
    n = b.bevel(n, 0.004)
    p = b.principled(color, rough, n, spec_level=0.55, coat=0.05, coat_rough=0.3)
    b.finish(p)


def _membrane(b: _B):
    co = b.obj_co()
    weave = b.add(b.wave(co, 1200.0, direction="X").outputs["Factor"], b.wave(co, 1200.0, direction="Z").outputs["Factor"])
    n1 = b.noisef(co, 40.0, detail=3.0)
    rough = b.add(0.85, b.centred(n1, 0.05))
    n = b.bump(b.mul(weave, 0.5), 0.1, 0.001)
    p = b.principled(rgb("membrane"), rough, n, spec_level=0.3)
    b.finish(p)


def _glass(b: _B):
    p = b.principled(rgb("glass"), 0.02, None, spec_level=0.5, transmission=1.0, ior=1.52)
    # caustics are off: let shadow rays pass so sunlight reaches the interior
    lp = b.node("ShaderNodeLightPath")
    tr = b.node("ShaderNodeBsdfTransparent")
    mix = b.node("ShaderNodeMixShader")
    b.set(mix, 0, lp.outputs["Is Shadow Ray"])
    b.links.new(p.outputs[0], mix.inputs[1])
    b.links.new(tr.outputs[0], mix.inputs[2])
    b.output(mix.outputs[0])


def _frame(b: _B):
    co = b.obj_co()
    peel = b.noisef(co, 500.0, detail=3.0, rough=0.55)
    slow = b.noisef(co, 3.0, detail=2.0)
    rough = b.add(0.35, b.centred(peel, 0.04))
    rough = b.add(rough, b.centred(slow, 0.02))
    color = b.scale_color(rgb("frame"), b.add(1.0, b.centred(slow, 0.03)))
    n = b.bump(peel, 0.12, 0.001)
    n = b.bevel(n, 0.003)
    p = b.principled(color, rough, n, spec_level=0.5, coat=0.08, coat_rough=0.3)
    b.finish(p)


def _plaster(b: _B):
    co = b.obj_co()
    fine = b.noisef(co, 350.0, detail=3.0, rough=0.6)
    mid = b.noisef(co, 45.0, detail=2.0)
    low = b.noisef(co, 1.2, detail=2.0)
    rough = b.add(0.7, b.centred(mid, 0.1))
    rough = b.add(rough, b.centred(fine, 0.04))
    color = b.scale_color(rgb("plaster"), b.add(1.0, b.centred(low, 0.02)))
    height = b.add(b.mul(fine, 0.7), b.mul(mid, 0.3))
    n = b.bump(height, 0.12, 0.002)
    n = b.bevel(n, 0.004)
    p = b.principled(color, rough, n, spec_level=0.35)
    b.finish(p)


def _concrete(b: _B):
    co = b.obj_co()
    low = b.noisef(co, 0.9, detail=3.0)
    stain_n = b.noisef(co, 2.2, detail=4.0, rough=0.7)
    stain = b.smooth(stain_n, 0.52, 0.72, 0.0, 0.6)
    speck = b.noisef(co, 500.0, detail=3.0, rough=0.6)
    pores_v = b.voronoi(co, 220.0, "F1")
    pr, _, _ = b.separate(pores_v.outputs["Color"])
    pores = b.mul(b.gt(pr, 0.72), b.smooth(pores_v.outputs["Distance"], 0.07, 0.16, 1.0, 0.0))
    color = b.scale_color(rgb("concrete"), b.add(1.0, b.centred(low, 0.06)))
    color = b.mixc(stain, color, rgb("concrete", 0.78, (1.0, 0.96, 0.9)))
    color = b.scale_color(color, b.add(1.0, b.centred(speck, 0.07)))
    color = b.mixc(pores, color, rgb("concrete", 0.45))
    rough = b.add(0.9, b.centred(speck, 0.05))
    rough = b.sub(rough, b.mul(stain, 0.08))
    height = b.sub(b.add(b.mul(speck, 0.6), b.mul(low, 0.2)), b.mul(pores, 0.6))
    n = b.bump(height, 0.3, 0.003)
    n = b.bevel(n, 0.006)
    p = b.principled(color, rough, n, spec_level=0.35)
    b.finish(p)


def _gravel(b: _B):
    co = b.obj_co()
    v1 = b.voronoi(co, 110.0, "SMOOTH_F1", smoothness=0.25)
    e1 = b.voronoi(co, 110.0, "DISTANCE_TO_EDGE")
    v2 = b.voronoi(b.vmath("ADD", co, (0.37, 0.11, 0.0)), 260.0, "F1")
    dome = b.mapr(v1.outputs["Distance"], 0.0, 0.62, 1.0, 0.0)
    crack = b.smooth(e1.outputs["Distance"], 0.0, 0.05, 0.0, 1.0)
    dome2 = b.mapr(v2.outputs["Distance"], 0.0, 0.6, 1.0, 0.0)
    cr, cg, cb = b.separate(v1.outputs["Color"])
    stone = b.ramp(cr, [(0.0, rgb("#6E6A63")), (0.45, rgb("gravel")), (0.8, rgb("#B9B4AC")), (1.0, rgb("#CFC9BF"))])
    stone = b.hsv(stone, b.add(0.5, b.centred(cg, 0.03)), 1.0, 1.0)
    speck = b.noisef(co, 900.0, detail=2.0)
    dust = b.noisef(co, 1.5, detail=3.0)
    shade = b.madd(crack, 0.5, 0.5)
    shade = b.mul(shade, b.madd(dome, 0.25, 0.8))
    shade = b.mul(shade, b.add(1.0, b.centred(speck, 0.06)))
    shade = b.mul(shade, b.add(1.0, b.centred(dust, 0.06)))
    color = b.scale_color(stone, shade)
    rough = b.add(0.82, b.centred(cb, 0.08))
    rough = b.add(rough, b.centred(speck, 0.04))
    height = b.add(b.mul(b.mul(dome, crack), 0.75), b.mul(dome2, 0.25))
    height = b.add(height, b.mul(speck, 0.06))
    n = b.bump(height, 1.0, 0.008)
    p = b.principled(color, rough, n, spec_level=0.4)
    b.finish(p)


def _lawn(b: _B):
    co = b.obj_co()
    patch = b.noisef(co, 0.35, detail=3.0, rough=0.6)
    clump = b.noisef(co, 5.0, detail=3.0, rough=0.55)
    dry_n = b.noisef(b.vmath("ADD", co, (11.0, 3.0, 0.0)), 1.3, detail=3.0)
    blade = b.noisef(co, 260.0, detail=5.0, rough=0.65, lac=2.3)
    edge = b.voronoi(co, 380.0, "DISTANCE_TO_EDGE")
    thin = b.smooth(edge.outputs["Distance"], 0.0, 0.025, 1.0, 0.0)  # 1 on the cell edges
    color = b.mixc(b.smooth(patch, 0.35, 0.65), rgb("lawn_a"), rgb("lawn_b"))
    color = b.scale_color(color, b.madd(clump, 0.3, 0.85))
    color = b.mixc(b.smooth(dry_n, 0.58, 0.78, 0.0, 0.4), color, rgb("#A29A55"))
    soil = b.smooth(blade, 0.30, 0.48, 0.6, 0.0)
    color = b.mixc(soil, color, rgb("#34301A"))
    color = b.mixc(b.mul(thin, 0.35), color, rgb("#2C2C16"))
    color = b.scale_color(color, b.add(1.0, b.centred(blade, 0.18)))
    rough = b.sub(0.9, b.mul(b.smooth(blade, 0.5, 0.8), 0.15))
    height = b.add(b.mul(blade, 0.85), b.mul(clump, 0.25))
    height = b.sub(height, b.mul(thin, 0.4))
    n = b.bump(height, 0.9, 0.006)
    p = b.principled(color, rough, n, spec_level=0.3, sheen=0.35, sheen_rough=0.6, sheen_tint=(0.75, 0.85, 0.5, 1.0))
    b.finish(p)


def _fabric(b: _B, base, sheen, weave_scale, wrinkle_scale, wrinkle_dist, rough_base, var):
    co = b.obj_co()
    w1 = b.wave(co, weave_scale, direction="X").outputs["Factor"]
    w2 = b.wave(co, weave_scale, direction="Y").outputs["Factor"]
    w3 = b.wave(co, weave_scale, direction="Z").outputs["Factor"]
    weave = b.mul(b.add(b.add(w1, w2), w3), 0.333)
    heather = b.noisef(co, 25.0, detail=3.0)
    wrinkle = b.noisef(co, wrinkle_scale, detail=3.0, rough=0.55, distortion=0.8)
    color = b.scale_color(rgb(base), b.add(1.0, b.centred(heather, var)))
    rough = b.add(rough_base, b.centred(heather, 0.03))
    n = b.bump(wrinkle, 0.35, wrinkle_dist)
    n = b.bump(weave, 0.25, 0.0008, normal=n)
    p = b.principled(color, rough, n, spec_level=0.25, sheen=sheen, sheen_rough=0.55, sheen_tint=(1.0, 1.0, 1.0, 1.0))
    b.finish(p)


def _fabric_grey(b: _B):
    _fabric(b, "fabric_grey", 0.6, 700.0, 3.0, 0.012, 0.95, 0.06)


def _linen(b: _B):
    _fabric(b, "linen", 0.5, 600.0, 7.0, 0.02, 0.88, 0.025)


def _steel_black(b: _B):
    x, y, z = b.separate(b.obj_co())
    brushed = b.noisef(b.combine(b.mul(x, 3.0), b.mul(y, 3.0), b.mul(z, 60.0)), 20.0, detail=3.0)
    slow = b.noisef(b.obj_co(), 4.0, detail=2.0)
    rough = b.add(0.45, b.centred(brushed, 0.05))
    rough = b.add(rough, b.centred(slow, 0.03))
    n = b.bump(brushed, 0.05, 0.001)
    n = b.bevel(n, 0.003)
    p = b.principled(rgb("steel_black"), rough, n, spec_level=0.5, metallic=0.85)
    b.finish(p)


def _roof_membrane(b: _B):
    co = b.obj_co()
    v = b.voronoi(co, 140.0, "F1")
    dome = b.mapr(v.outputs["Distance"], 0.0, 0.6, 1.0, 0.0)
    cr, _, _ = b.separate(v.outputs["Color"])
    puddle = b.noisef(co, 0.8, detail=3.0)
    speck = b.noisef(co, 700.0, detail=2.0)
    color = b.scale_color(rgb("roof_membrane"), b.madd(cr, 0.2, 0.9))
    color = b.scale_color(color, b.add(1.0, b.centred(puddle, 0.06)))
    color = b.scale_color(color, b.add(1.0, b.centred(speck, 0.05)))
    rough = b.add(0.9, b.centred(cr, 0.05))
    height = b.add(b.mul(dome, 0.8), b.mul(speck, 0.2))
    n = b.bump(height, 0.4, 0.003)
    p = b.principled(color, rough, n, spec_level=0.3)
    b.finish(p)


def _studio_floor(b: _B):
    co = b.obj_co()
    fine = b.noisef(co, 300.0, detail=2.0)
    low = b.noisef(co, 0.6, detail=2.0)
    color = b.scale_color(rgb("studio_floor"), b.add(1.0, b.centred(low, 0.012)))
    rough = b.add(0.55, b.centred(fine, 0.03))
    n = b.bump(fine, 0.03, 0.001)
    p = b.principled(color, rough, n, spec_level=0.4)
    b.finish(p)


def _wood_fibre(b: _B):
    co = b.obj_co()
    x, y, z = b.separate(co)
    fibre = b.noisef(b.combine(b.mul(x, 8.0), b.mul(y, 8.0), b.mul(z, 1.0)), 60.0, detail=5.0, rough=0.65)
    fluff = b.noisef(co, 350.0, detail=4.0, rough=0.6)
    low = b.noisef(co, 3.0, detail=3.0)
    color = b.scale_color(rgb("wood_fibre"), b.add(1.0, b.centred(low, 0.1)))
    color = b.scale_color(color, b.add(1.0, b.centred(fibre, 0.16)))
    color = b.scale_color(color, b.add(1.0, b.centred(fluff, 0.08)))
    rough = b.add(0.92, b.centred(fluff, 0.05))
    height = b.add(b.mul(fibre, 0.6), b.mul(fluff, 0.4))
    n = b.bump(height, 0.5, 0.003)
    n = b.bevel(n, 0.004)
    p = b.principled(color, rough, n, spec_level=0.3, sheen=0.2)
    b.finish(p)


def _fibrous(b: _B, base, var, tint):
    co = b.obj_co()
    x, y, z = b.separate(co)
    fluff = b.noisef(co, 45.0, detail=6.0, rough=0.7, distortion=1.5)
    strands = b.noisef(b.combine(b.mul(x, 1.0), b.mul(y, 1.0), b.mul(z, 18.0)), 30.0, detail=4.0, rough=0.6)
    curl = b.voronoi(co, 420.0, "DISTANCE_TO_EDGE")
    curl_l = b.smooth(curl.outputs["Distance"], 0.0, 0.03, 1.0, 0.0)
    low = b.noisef(co, 2.0, detail=3.0)
    color = b.scale_color(rgb(base), b.add(1.0, b.centred(low, var)))
    color = b.mixc(b.smooth(low, 0.55, 0.75, 0.0, 0.35), color, rgb(base, 0.9, tint))
    color = b.scale_color(color, b.add(1.0, b.centred(fluff, 0.14)))
    color = b.scale_color(color, b.sub(1.0, b.mul(curl_l, 0.12)))
    rough = 0.95
    height = b.add(b.mul(fluff, 0.7), b.mul(strands, 0.3))
    height = b.sub(height, b.mul(curl_l, 0.15))
    n = b.bump(height, 0.8, 0.012)
    p = b.principled(color, rough, n, spec_level=0.2, sheen=0.8, sheen_rough=0.6)
    b.finish(p)


def _hemp(b: _B):
    _fibrous(b, "hemp", 0.12, (0.9, 0.95, 0.75))


def _wool(b: _B):
    _fibrous(b, "wool", 0.06, (1.0, 0.97, 0.9))


def _gypsum_fibre(b: _B):
    co = b.obj_co()
    x, y, z = b.separate(co)
    speck = b.noisef(co, 600.0, detail=3.0)
    fibre = b.noisef(b.combine(b.mul(x, 6.0), b.mul(y, 6.0), z), 80.0, detail=3.0)
    low = b.noisef(co, 2.0, detail=2.0)
    color = b.scale_color(rgb("gypsum_fibre"), b.add(1.0, b.centred(low, 0.03)))
    color = b.scale_color(color, b.add(1.0, b.centred(speck, 0.06)))
    color = b.scale_color(color, b.add(1.0, b.centred(fibre, 0.04)))
    rough = b.add(0.85, b.centred(speck, 0.04))
    height = b.add(b.mul(speck, 0.7), b.mul(fibre, 0.3))
    n = b.bump(height, 0.15, 0.001)
    n = b.bevel(n, 0.003)
    p = b.principled(color, rough, n, spec_level=0.35)
    b.finish(p)


_BUILDERS = {
    "larch": _larch,
    "larch_deck": _larch_deck,
    "anthracite": _anthracite,
    "membrane": _membrane,
    "glass": _glass,
    "frame": _frame,
    "plaster": _plaster,
    "spruce": _spruce,
    "oak_floor": _oak_floor,
    "concrete": _concrete,
    "gravel": _gravel,
    "lawn": _lawn,
    "fabric_grey": _fabric_grey,
    "linen": _linen,
    "steel_black": _steel_black,
    "roof_membrane": _roof_membrane,
    "studio_floor": _studio_floor,
    "spruce_vertical": _spruce_vertical,
    "oak": _oak,
    "oak_white": _oak_white,
    "wood_fibre": _wood_fibre,
    "hemp": _hemp,
    "wool": _wool,
    "gypsum_fibre": _gypsum_fibre,
}


# ---------------------------------------------------------------------------
# standalone test: material-ball sheet
# ---------------------------------------------------------------------------
_HERE = os.path.dirname(os.path.abspath(__file__))
_TEST_DIR = os.path.join(_HERE, "_test")
# materials better shown on a flat tile than on a cube
_FLAT = {"oak_floor", "lawn", "gravel", "concrete", "roof_membrane", "studio_floor", "larch_deck", "oak"}


def _test_scene(names_to_show, cols):
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.render.threads_mode = "AUTO"
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - Base Contrast"
    scene.view_settings.exposure = 0.0
    scene.render.filter_size = 1.5
    scene.cycles.use_light_tree = True
    scene.cycles.max_bounces = 8
    scene.cycles.glossy_bounces = 4
    scene.cycles.transmission_bounces = 8
    scene.cycles.caustics_reflective = False
    scene.cycles.caustics_refractive = False
    scene.cycles.sample_clamp_indirect = 8.0

    # world: morning-ish sky (sun front-left of a +Y camera)
    world = bpy.data.worlds.new("test_world")
    scene.world = world
    wn = world.node_tree.nodes
    wl = world.node_tree.links
    for n in list(wn):
        wn.remove(n)
    sky = wn.new("ShaderNodeTexSky")
    sky.sky_type = "MULTIPLE_SCATTERING"
    sky.sun_disc = True
    sky.sun_elevation = math.radians(38.0)
    sky.sun_rotation = math.radians(spec.LIGHTS["morning"]["rotation"])
    sky.sun_intensity = 0.4
    sky.altitude = 300.0
    sky.air_density = 1.0
    sky.aerosol_density = 1.5
    bg = wn.new("ShaderNodeBackground")
    bg.inputs["Strength"].default_value = 1.0
    out = wn.new("ShaderNodeOutputWorld")
    wl.new(sky.outputs[0], bg.inputs[0])
    wl.new(bg.outputs[0], out.inputs[0])

    # ground: mid-grey, matte
    bpy.ops.mesh.primitive_plane_add(size=60.0, location=(0, 0, 0))
    ground = bpy.context.active_object
    ground.name = "ground"
    gm = bpy.data.materials.new("test_ground")
    gp = gm.node_tree.nodes["Principled BSDF"]
    gp.inputs["Base Color"].default_value = (0.20, 0.20, 0.20, 1.0)
    gp.inputs["Roughness"].default_value = 0.85
    gp.inputs["Specular IOR Level"].default_value = 0.3
    ground.data.materials.append(gm)

    label_mat = bpy.data.materials.new("test_label")
    lp = label_mat.node_tree.nodes["Principled BSDF"]
    lp.inputs["Base Color"].default_value = (0.9, 0.9, 0.9, 1.0)
    lp.inputs["Roughness"].default_value = 0.8

    pitch = 1.0
    rows = math.ceil(len(names_to_show) / cols)
    for i, name in enumerate(names_to_show):
        c, r = i % cols, i // cols
        # camera sits at +Y looking -Y: camera-right is -X, far is -Y
        cx = -(c - (cols - 1) / 2) * pitch
        cy = (r - (rows - 1) / 2) * pitch
        if name in _FLAT:
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(cx, cy + 0.02, 0.025))
            ob = bpy.context.active_object
            ob.scale = (0.44, 0.40, 0.025)
            bpy.ops.object.transform_apply(scale=True)
            bev = add_bevel(ob, 0.006, 3)
            sphere_loc = (cx - 0.24, cy - 0.20, 0.05 + 0.12)
            sr = 0.12
        else:
            bpy.ops.mesh.primitive_cube_add(size=0.46, location=(cx + 0.06, cy + 0.05, 0.23))
            ob = bpy.context.active_object
            ob.rotation_euler = (0.0, 0.0, math.radians(-14.0))
            bev = add_bevel(ob, 0.012, 4)
            sphere_loc = (cx - 0.30, cy - 0.28, 0.13)
            sr = 0.13
        bev.harden_normals = True
        for poly in ob.data.polygons:
            poly.use_smooth = True
        ob.name = f"cube_{name}"
        apply(ob, name)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=sr, segments=48, ring_count=24, location=sphere_loc)
        sp = bpy.context.active_object
        sp.name = f"ball_{name}"
        for poly in sp.data.polygons:
            poly.use_smooth = True
        apply(sp, name)
        # label, lying flat, readable from the +Y camera
        cu = bpy.data.curves.new(f"lbl_{name}", "FONT")
        cu.body = f"{i + 1:02d} {name}"
        cu.size = 0.09
        cu.align_x = "CENTER"
        cu.extrude = 0.001
        tob = bpy.data.objects.new(cu.name, cu)
        scene.collection.objects.link(tob)
        tob.location = (cx, cy + 0.40, 0.002)
        tob.rotation_euler = (0.0, 0.0, math.pi)
        tob.data.materials.append(label_mat)

    # camera: +Y, elevated, looking at the grid centre
    width = cols * pitch
    depth = rows * pitch
    fov = 30.0
    cam_data = bpy.data.cameras.new("test_cam")
    cam_data.sensor_fit = "VERTICAL"
    cam_data.sensor_height = 24.0
    cam_data.lens = spec.lens_for_fov(fov)
    cam = bpy.data.objects.new("test_cam", cam_data)
    scene.collection.objects.link(cam)
    scene.camera = cam
    aspect = 1.6
    hfov = 2 * math.atan(aspect * math.tan(math.radians(fov) / 2))
    dist = max((width * 0.55) / math.tan(hfov / 2), (depth * 0.85) / math.tan(math.radians(fov) / 2))
    elev = math.radians(40.0)
    target = (0.0, 0.0, 0.12)
    cam.location = (0.0, target[1] + dist * math.cos(elev), target[2] + dist * math.sin(elev))
    direction = (target[0] - cam.location[0], target[1] - cam.location[1], target[2] - cam.location[2])
    import mathutils

    cam.rotation_euler = mathutils.Vector(direction).to_track_quat("-Z", "Y").to_euler()
    return scene


def _render(scene, out_path, base=(4096, 2560), scale=25, samples=32):
    scene.render.resolution_x, scene.render.resolution_y = base
    scene.render.resolution_percentage = scale
    scene.cycles.samples = samples
    scene.cycles.use_adaptive_sampling = True
    scene.cycles.use_denoising = True
    scene.cycles.denoiser = "OPENIMAGEDENOISE"
    scene.cycles.denoising_use_gpu = False
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGB"
    scene.render.filepath = out_path
    t0 = time.time()
    bpy.ops.render.render(write_still=True)
    return time.time() - t0


if __name__ == "__main__":
    os.makedirs(_TEST_DIR, exist_ok=True)
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    show = args if args else NAMES
    unknown = [n for n in show if n not in _BUILDERS]
    if unknown:
        raise SystemExit(f"unknown material(s): {unknown}")
    bpy.ops.wm.read_factory_settings(use_empty=True)
    _CACHE.clear()
    cols = 6 if len(show) > 8 else min(len(show), 4)
    scene = _test_scene(show, cols)
    if len(show) == len(NAMES):
        out = os.path.join(_TEST_DIR, "materials_sheet.png")
    else:
        out = os.path.join(_TEST_DIR, "materials_" + "_".join(show)[:60] + ".png")
    scale = 25 if len(show) > 8 else 25
    base = (4096, 2560) if len(show) > 8 else (3200, 2000)
    seconds = _render(scene, out, base=base, scale=scale)
    print(f"materials test render: {out}  ({seconds:.1f} s, {len(show)} materials)")
