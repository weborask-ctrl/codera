"""Site, light, camera, X-ray stage and rendering for the EcoDomček boards.

SPEC.md is the contract; spec.py holds the numbers. This module owns
everything around the house that geometry/cladding/interior do not build:

    new_scene()                       a clean Cycles scene, CPU, AgX
    build_site(materials, mode)       mode "lawn" (ground, gravel apron,
                                      shrubs, distant tree line) or "studio"
                                      (bone floor for the dollhouse board)
    set_light(state)                  "morning" | "interior" | "table" | "dusk"
    set_camera(board, device)         from spec.CAMERAS, sensor VERTICAL 24 mm
    build_xray(materials)             the exploded wall sample at x = +200
    export_anchors(board, device, p)  {"label": [u, v]}, v from the top
    render(board, device, q, out)     writes the PNG, prints the time

Sun azimuth: Blender's sky node measures sun_rotation clockwise from +Y
(0 = +Y, 90 = +X — verified with a shadow probe), while spec.LIGHTS keeps
the pre-mirror convention of the three.js study. The conversion is
`blender = 180 - spec`, which is applied in exactly one place: SUN_ROT().
"""

import json
import math
import os
import random
import time

import bmesh
import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector

import meshutil
import spec

_HERE = os.path.dirname(os.path.abspath(__file__))

# 2700 K bulb, linear RGB (interior lights are the same warmth everywhere)
WARM = (1.0, 0.72, 0.42)
FLAT_RADIUS = 15.0  # the ground is dead flat this close to the house
GROUND_SIZE = 900.0
GRAVEL = {"x": (1.6, 7.4), "y": (4.4, 11.0), "z": 0.02}


# ---------------------------------------------------------------------------
# small helpers
# ---------------------------------------------------------------------------
def _coll(name):
    c = bpy.data.collections.get(name)
    if c is None:
        c = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(c)
    return c


def _box(bm, b):
    x0, x1, y0, y1, z0, z1 = b
    vs = [bm.verts.new(v) for v in (
        (x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0),
        (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1),
    )]
    for f in ((0, 1, 2, 3), (7, 6, 5, 4), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)):
        bm.faces.new([vs[i] for i in f])
    return bm


def _obj(name, bm, coll, materials=None, mat=None, location=(0.0, 0.0, 0.0), smooth=False, bevel=0.0):
    me = bpy.data.meshes.new(name)
    bm.normal_update()
    if smooth:
        meshutil.smooth_by_angle(bm, 46.0)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    ob.location = location
    coll.objects.link(ob)
    if materials is not None and mat:
        materials.apply(ob, mat)
    if bevel:
        m = ob.modifiers.new("bevel", "BEVEL")
        m.width = bevel
        m.segments = 2
        m.limit_method = "ANGLE"
        m.angle_limit = math.radians(40)
    return ob


def _look_at(ob, target):
    ob.rotation_euler = (Vector(target) - ob.location).to_track_quat("-Z", "Y").to_euler()


def SUN_ROT(state):
    """spec.LIGHTS rotation (pre-mirror) → Blender sky node sun_rotation, radians."""
    return math.radians(180.0 - spec.LIGHTS[state]["rotation"])


# ---------------------------------------------------------------------------
# scene
# ---------------------------------------------------------------------------
def new_scene():
    """A clean Cycles scene with the SPEC's colour management and path settings."""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.render.threads_mode = "AUTO"
    sc.render.filter_size = 1.5
    sc.render.film_transparent = False
    sc.view_settings.view_transform = "AgX"
    # AgX's base look renders architecture milky and near-monochrome (measured
    # 2026-09-04: p1 luma 0.29, mean saturation 0.08). Punchy restores the
    # contrast and chroma the reference photography has.
    sc.view_settings.look = "AgX - Punchy"
    sc.view_settings.exposure = spec.EXPOSURE["hero"]
    cy = sc.cycles
    cy.use_denoising = True
    cy.denoiser = "OPENIMAGEDENOISE"
    cy.denoising_use_gpu = False
    cy.use_light_tree = True
    cy.max_bounces = 8
    cy.diffuse_bounces = 4
    cy.glossy_bounces = 4
    cy.transmission_bounces = 8
    cy.volume_bounces = 0
    cy.caustics_reflective = False
    cy.caustics_refractive = False
    cy.sample_clamp_indirect = 8.0
    cy.blur_glossy = 1.0
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGB"
    sc.render.image_settings.compression = 20
    return sc


# ---------------------------------------------------------------------------
# site
# ---------------------------------------------------------------------------
def _undulation(x, y):
    """Gentle meadow relief; zero inside FLAT_RADIUS so the plinth always sits flush."""
    d = math.hypot(x, y)
    if d <= FLAT_RADIUS:
        return 0.0
    t = min(1.0, (d - FLAT_RADIUS) / 45.0)
    t = t * t * (3 - 2 * t)  # smoothstep
    h = (
        0.55 * math.sin(x * 0.031 + 1.1) * math.cos(y * 0.026 - 0.4)
        + 0.28 * math.sin(x * 0.071 - 2.0) * math.sin(y * 0.058 + 0.9)
        + 0.12 * math.cos(x * 0.14 + y * 0.11)
    )
    return h * t


def _ground(coll, materials, mat, undulate=True, n=90):
    """A GROUND_SIZE square of ground, subdivided so it can carry the relief."""
    bm = bmesh.new()
    step = GROUND_SIZE / n
    half = GROUND_SIZE / 2
    grid = []
    for i in range(n + 1):
        row = []
        for j in range(n + 1):
            x = -half + i * step
            y = -half + j * step
            z = _undulation(x, y) if undulate else 0.0
            row.append(bm.verts.new((x, y, z)))
        grid.append(row)
    for i in range(n):
        for j in range(n):
            bm.faces.new((grid[i][j], grid[i + 1][j], grid[i + 1][j + 1], grid[i][j + 1]))
    return _obj("ground", bm, coll, materials, mat, smooth=undulate)


def _gravel_apron(coll, materials):
    """The arrival surface in front of the entrance; slightly proud of the lawn."""
    g = GRAVEL
    bm = bmesh.new()
    _box(bm, (g["x"][0], g["x"][1], g["y"][0], g["y"][1], -0.06, g["z"]))
    return _obj("gravel_apron", bm, coll, materials, "gravel")


def _foliage_material(name, hex_color, rough=0.82, haze=0.0):
    """Foliage is only ever a distant mass here: matte, noisy, slightly hazed.

    Discrete ellipsoid "trees" were tried on 2026-09-04 and read as low-poly
    lollipops; a continuous ridge with a noisy silhouette reads as a wood line
    at 80–150 m, which is the only distance these are ever seen from.
    """
    m = bpy.data.materials.get(name)
    if m is not None:
        return m
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    p = nt.nodes["Principled BSDF"]
    p.inputs["Roughness"].default_value = rough
    co = nt.nodes.new("ShaderNodeTexCoord")
    n_big = nt.nodes.new("ShaderNodeTexNoise")
    n_big.inputs["Scale"].default_value = 0.6
    n_big.inputs["Detail"].default_value = 6.0
    n_big.inputs["Roughness"].default_value = 0.62
    n_fine = nt.nodes.new("ShaderNodeTexNoise")
    n_fine.inputs["Scale"].default_value = 7.0
    n_fine.inputs["Detail"].default_value = 8.0
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.interpolation = "EASE"
    dark = spec.hex_to_rgb("#20301B")
    lit = spec.hex_to_rgb(hex_color)
    ramp.color_ramp.elements[0].position = 0.30
    ramp.color_ramp.elements[0].color = dark
    ramp.color_ramp.elements[1].position = 0.72
    ramp.color_ramp.elements[1].color = lit
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    mix.inputs[0].default_value = 0.5
    nt.links.new(co.outputs["Object"], n_big.inputs["Vector"])
    nt.links.new(co.outputs["Object"], n_fine.inputs["Vector"])
    nt.links.new(n_big.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], mix.inputs[6])
    mix.inputs[7].default_value = spec.hex_to_rgb("#4C6238")
    nt.links.new(n_fine.outputs["Fac"], mix.inputs[0])
    out = mix.outputs[2]
    if haze > 0.0:  # aerial perspective: the far band sits closer to the sky
        hz = nt.nodes.new("ShaderNodeMix")
        hz.data_type = "RGBA"
        hz.inputs[0].default_value = haze
        nt.links.new(out, hz.inputs[6])
        hz.inputs[7].default_value = spec.hex_to_rgb("#9FB0B4")
        out = hz.outputs[2]
    nt.links.new(out, p.inputs["Base Color"])
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.6
    bump.inputs["Distance"].default_value = 0.5
    nt.links.new(n_fine.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], p.inputs["Normal"])
    return m


def _ridge(bm, seed, r0, depth, h_lo, h_hi, a0=140.0, a1=400.0, steps=300, rows=5):
    """One band of woodland.

    A three-vertex section (2026-09-04) rendered as a folded paper mountain —
    metres-long flat facets with a hard silhouette. This builds a lumpy canopy
    instead: several rows per section, every vertex jittered in 3D, so the
    surface breaks up into crown-sized bumps and the silhouette is noisy at
    three scales.
    """
    rnd = random.Random(seed)
    ph = [rnd.uniform(0, 6.28) for _ in range(6)]

    def crown(a):
        return (
            0.40 * math.sin(a * 5.3 + ph[2])
            + 0.24 * math.sin(a * 17.1 + ph[3])
            + 0.20 * math.sin(a * 47.0 + ph[4])
            + 0.16 * math.sin(a * 113.0 + ph[5])
        )

    prev = None
    for i in range(steps + 1):
        t = i / steps
        a = math.radians(a0 + (a1 - a0) * t)
        r = r0 + depth * 0.6 * (0.6 * math.sin(a * 3.1 + ph[0]) + 0.3 * math.sin(a * 9.7 + ph[1]))
        h = max(1.5, (h_lo + h_hi) / 2 + (h_hi - h_lo) / 2 * crown(a)) * rnd.uniform(0.94, 1.07)
        ca, sa = math.cos(a), math.sin(a)
        col = []
        for k in range(rows + 1):
            u = k / rows  # 0 = front foot, 1 = back foot, ridge in between
            # a half-ellipse section: tall in the middle, on the ground at both feet
            z = h * math.sin(math.pi * u) ** 0.75
            rr = r + depth * (u - 0.5)
            jitter = rnd.uniform(-0.09, 0.09)
            rr *= 1.0 + jitter * 0.06
            x, y = rr * ca, rr * sa
            x += rnd.uniform(-1.2, 1.2)
            y += rnd.uniform(-1.2, 1.2)
            z = _undulation(x, y) + z * rnd.uniform(0.86, 1.14) - (0.4 if k in (0, rows) else 0.0)
            col.append(bm.verts.new((x, y, z)))
        if prev is not None:
            for k in range(rows):
                bm.faces.new((prev[k], prev[k + 1], col[k + 1], col[k]))
        prev = col
    return bm


def _hazed(name, hex_color, haze, rough=0.85):
    """A flat, aerial-perspective-tinted colour for anything past ~150 m."""
    m = bpy.data.materials.get(name)
    if m is not None:
        return m
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    p = nt.nodes["Principled BSDF"]
    p.inputs["Roughness"].default_value = rough
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 3.0
    noise.inputs["Detail"].default_value = 6.0
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    base = spec.hex_to_rgb(hex_color)
    sky = spec.hex_to_rgb("#A8BAC2")
    ramp.color_ramp.elements[0].color = tuple(base[i] * 0.8 for i in range(3)) + (1.0,)
    ramp.color_ramp.elements[1].color = base
    nt.links.new(noise.outputs["Fac"], ramp.inputs["Fac"])
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    mix.inputs[0].default_value = haze
    nt.links.new(ramp.outputs["Color"], mix.inputs[6])
    mix.inputs[7].default_value = sky
    nt.links.new(mix.outputs[2], p.inputs["Base Color"])
    return m


def _far_ground(coll):
    """A ring of hazed field between the meadow and the woodland, so the plain
    reads as distance rather than as one flat green sheet to the horizon."""
    bm = bmesh.new()
    steps, rings = 96, 5
    r_in, r_out = 110.0, 430.0
    prev = None
    for i in range(steps + 1):
        a = 2 * math.pi * i / steps
        ca, sa = math.cos(a), math.sin(a)
        col = []
        for k in range(rings + 1):
            t = k / rings
            r = r_in + (r_out - r_in) * (t ** 1.6)
            col.append(bm.verts.new((r * ca, r * sa, _undulation(r * ca, r * sa) - 0.05)))
        if prev is not None:
            for k in range(rings):
                bm.faces.new((prev[k], prev[k + 1], col[k + 1], col[k]))
        prev = col
    ob = _obj("far_ground", bm, coll, smooth=True)
    ob.data.materials.append(_hazed("field_far", "#5C6B3C", 0.34))
    return ob


def _tree_line(coll):
    """Two woodland bands behind the plot: the horizon, and the depth cue."""
    near = bmesh.new()
    _ridge(near, 20260904, r0=330.0, depth=60.0, h_lo=13.0, h_hi=22.0)
    ob = _obj("tree_line_near", near, coll, smooth=True)
    ob.data.materials.append(_foliage_material("foliage_near_band", "#3D4F30", haze=0.46))
    far = bmesh.new()
    _ridge(far, 771, r0=470.0, depth=70.0, h_lo=14.0, h_hi=24.0, a0=120.0, a1=420.0)
    ob2 = _obj("tree_line_far", far, coll, smooth=True)
    ob2.data.materials.append(_foliage_material("foliage_far_band", "#4A5A42", haze=0.72))
    return 2


def _gravel_skirt(coll, materials):
    """A 0.55 m gravel margin around the plinth: the building meets the ground."""
    w = 0.55
    x0, x1 = spec.X0 - w, spec.X1 + w
    y0, y1 = spec.Y0 - w, spec.Y1 + w
    bm = bmesh.new()
    for b in (
        (x0, x1, y0, spec.Y0, -0.05, 0.03),
        (x0, x1, spec.Y1, y1, -0.05, 0.03),
        (x0, spec.X0, spec.Y0, spec.Y1, -0.05, 0.03),
        (spec.X1, x1, spec.Y0, spec.Y1, -0.05, 0.03),
    ):
        _box(bm, b)
    return _obj("gravel_skirt", bm, coll, materials, "gravel")

def build_site(materials, mode="lawn"):
    """Everything under and behind the house. mode: "lawn" | "studio"."""
    t0 = time.time()
    coll = _coll("site")
    if mode == "studio":
        _ground(coll, materials, "studio_floor", undulate=False, n=2)
        print(f"[environment] studio site in {time.time() - t0:.2f} s")
        return coll
    _ground(coll, materials, "lawn")
    _far_ground(coll)
    _gravel_apron(coll, materials)
    _gravel_skirt(coll, materials)
    n = _tree_line(coll)
    print(f"[environment] lawn site ({n} woodland bands) in {time.time() - t0:.2f} s")
    return coll


# ---------------------------------------------------------------------------
# light
# ---------------------------------------------------------------------------
def _sky(state):
    sc = bpy.context.scene
    cfg = spec.LIGHTS[state]
    w = bpy.data.worlds.get("world") or bpy.data.worlds.new("world")
    sc.world = w
    w.use_nodes = True
    nt = w.node_tree
    for nd in list(nt.nodes):
        nt.nodes.remove(nd)
    sky = nt.nodes.new("ShaderNodeTexSky")
    sky.sky_type = "MULTIPLE_SCATTERING"
    # The disc stays off: a bright disc in the world is sampled badly (the first
    # renders had no cast shadows at all), so the direct light is a SUN lamp on
    # exactly the sky's own vector — see _sun().
    sky.sun_disc = False
    sky.sun_elevation = math.radians(cfg["elevation"])
    sky.sun_rotation = SUN_ROT(state)
    sky.sun_intensity = cfg["intensity"]
    sky.altitude = 300.0
    sky.air_density = 1.0
    sky.aerosol_density = 4.0 if state == "table" else 1.5
    sky.ozone_density = 1.0
    color = _clouds(nt, sky, state)
    bg = nt.nodes.new("ShaderNodeBackground")
    bg.inputs["Strength"].default_value = cfg["world"]
    out = nt.nodes.new("ShaderNodeOutputWorld")
    nt.links.new(color, bg.inputs[0])
    nt.links.new(bg.outputs[0], out.inputs[0])
    return sky



CLOUD = {
    "morning": {"scale": 0.55, "cover": 0.50, "soft": 0.26, "gain": 3.2},
    "interior": {"scale": 0.55, "cover": 0.50, "soft": 0.26, "gain": 3.2},
    "table": {"scale": 1.2, "cover": 0.30, "soft": 0.55, "gain": 1.6},
    "dusk": {"scale": 0.45, "cover": 0.44, "soft": 0.30, "gain": 2.2},
}


def _clouds(nt, sky, state):
    """A cumulus layer over the sky texture.

    The plain sky node renders a perfectly clean gradient, which is the single
    loudest "this is CG" cue in an exterior. The layer is a noise field
    projected onto a plane 1 km up along the view ray, brightened toward the
    sun and faded out at the horizon; it is shading, not geometry, so it costs
    nothing and still lights the scene through the world.
    """
    cfg = CLOUD[state]
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(geo.outputs["Incoming"], sep.inputs[0])
    # scale = 1 / max(z, 0.06): project the view ray onto the cloud plane
    zc = nt.nodes.new("ShaderNodeMath")
    zc.operation = "MAXIMUM"
    zc.inputs[1].default_value = 0.06
    nt.links.new(sep.outputs["Z"], zc.inputs[0])
    inv = nt.nodes.new("ShaderNodeMath")
    inv.operation = "DIVIDE"
    inv.inputs[0].default_value = 1.0
    nt.links.new(zc.outputs[0], inv.inputs[1])
    proj = nt.nodes.new("ShaderNodeVectorMath")
    proj.operation = "SCALE"
    nt.links.new(geo.outputs["Incoming"], proj.inputs[0])
    nt.links.new(inv.outputs[0], proj.inputs["Scale"])
    map_ = nt.nodes.new("ShaderNodeMapping")
    map_.inputs["Scale"].default_value = (cfg["scale"], cfg["scale"], cfg["scale"])
    map_.inputs["Location"].default_value = (3.2, -1.4, 0.0)
    nt.links.new(proj.outputs[0], map_.inputs["Vector"])
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 1.6
    noise.inputs["Detail"].default_value = 9.0
    noise.inputs["Roughness"].default_value = 0.58
    noise.inputs["Lacunarity"].default_value = 2.1
    nt.links.new(map_.outputs[0], noise.inputs["Vector"])
    mask = nt.nodes.new("ShaderNodeMapRange")
    mask.inputs["From Min"].default_value = cfg["cover"]
    mask.inputs["From Max"].default_value = cfg["cover"] + cfg["soft"]
    mask.clamp = True
    nt.links.new(noise.outputs["Fac"], mask.inputs["Value"])
    # fade the layer out at the horizon so the band does not stack into a wall
    hor = nt.nodes.new("ShaderNodeMapRange")
    hor.inputs["From Min"].default_value = 0.006
    hor.inputs["From Max"].default_value = 0.085
    hor.clamp = True
    nt.links.new(sep.outputs["Z"], hor.inputs["Value"])
    fac = nt.nodes.new("ShaderNodeMath")
    fac.operation = "MULTIPLY"
    nt.links.new(mask.outputs[0], fac.inputs[0])
    nt.links.new(hor.outputs[0], fac.inputs[1])
    # cloud colour: a bright body of its own, shaded by a second noise octave so
    # the undersides read. Deriving it from the sky colour (first attempt) made
    # the layer disappear near the horizon, where the sky is already bright.
    body = nt.nodes.new("ShaderNodeRGB")
    body.outputs[0].default_value = (
        (1.0, 0.985, 0.955, 1.0) if state != "dusk" else (0.62, 0.40, 0.34, 1.0)
    )
    shade = nt.nodes.new("ShaderNodeMapRange")
    shade.inputs["From Min"].default_value = 0.25
    shade.inputs["From Max"].default_value = 0.80
    shade.inputs["To Min"].default_value = 0.45 * cfg["gain"]
    shade.inputs["To Max"].default_value = 1.15 * cfg["gain"]
    shade.clamp = True
    nt.links.new(noise.outputs["Fac"], shade.inputs["Value"])
    lit = nt.nodes.new("ShaderNodeVectorMath")
    lit.operation = "SCALE"
    nt.links.new(body.outputs[0], lit.inputs[0])
    nt.links.new(shade.outputs[0], lit.inputs["Scale"])
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    nt.links.new(fac.outputs[0], mix.inputs[0])
    nt.links.new(sky.outputs[0], mix.inputs[6])
    nt.links.new(lit.outputs[0], mix.inputs[7])
    return mix.outputs[2]


SUN_ENERGY = {"morning": 34.0, "interior": 34.0, "table": 9.0, "dusk": 0.0}
SUN_ANGLE_DEG = {"morning": 0.9, "interior": 0.9, "table": 6.0, "dusk": 2.0}


def sun_vector(state):
    """Unit vector towards the sun, matching the sky node's own convention."""
    cfg = spec.LIGHTS[state]
    e = math.radians(cfg["elevation"])
    a = SUN_ROT(state)
    return Vector((math.sin(a) * math.cos(e), math.cos(a) * math.cos(e), math.sin(e)))


def _sun(coll, state):
    """The directional light. Without it the sky alone renders as overcast."""
    energy = SUN_ENERGY[state] * spec.LIGHTS[state]["intensity"]
    if energy <= 0.0:
        return None
    d = bpy.data.lights.new(f"sun_{state}", "SUN")
    d.energy = energy
    d.angle = math.radians(SUN_ANGLE_DEG[state])
    d.color = (1.0, 0.94, 0.86) if state != "table" else (1.0, 0.98, 0.95)
    ob = bpy.data.objects.new(f"sun_{state}", d)
    coll.objects.link(ob)
    v = sun_vector(state)
    ob.location = v * 60.0
    ob.rotation_euler = v.to_track_quat("Z", "Y").to_euler()
    return ob


def _area(coll, name, loc, target, energy, size, color=WARM, shape="SQUARE", size_y=None):
    d = bpy.data.lights.new(name, "AREA")
    d.energy = energy
    d.color = color
    d.shape = shape
    d.size = size
    if size_y is not None:
        d.size_y = size_y
    ob = bpy.data.objects.new(name, d)
    coll.objects.link(ob)
    ob.location = loc
    _look_at(ob, target)
    ob.visible_camera = False  # the lamp lights the room, it is not in the shot
    return ob


def _point(coll, name, loc, energy, radius=0.25, color=WARM):
    """An omnidirectional practical: fills a room far more evenly than an area
    light aimed at the floor, which is what the first dusk renders did."""
    d = bpy.data.lights.new(name, "POINT")
    d.energy = energy
    d.color = color
    d.shadow_soft_size = radius
    ob = bpy.data.objects.new(name, d)
    coll.objects.link(ob)
    ob.location = loc
    ob.visible_camera = False
    return ob


def set_light(state):
    """Sky + practical lights for one of the four SPEC light states."""
    cfg = spec.LIGHTS[state]
    _sky(state)
    coll = _coll("lights")
    for ob in list(coll.objects):
        bpy.data.objects.remove(ob, do_unlink=True)
    _sun(coll, state)

    if state == "table":
        # dollhouse: one big soft key so the model reads as an object on a table
        _area(coll, "table_key", (-9.0, 12.0, 16.0), (0, 0, 3.0), 6000.0, 14.0, color=(1.0, 0.97, 0.93))
        return coll

    if state == "interior":
        # daylight dominates; the pendant is an accent, plus a soft bounce fill
        px, py = -1.35, -0.85
        _area(coll, "pendant_bulb", (px, py, 1.72), (px, py, 0.75), 40.0, 0.09, shape="DISK")
        _area(coll, "bounce_fill", (-0.6, -3.6, 2.35), (-1.0, 1.6, 0.8), 70.0, 2.6, color=(1.0, 0.90, 0.78))
        _area(coll, "wall_wash", (-3.2, 0.4, 2.60), (-1.2, 2.6, 1.0), 40.0, 1.8, color=(0.98, 0.94, 0.90))
        return coll

    if state == "dusk":
        # every room lit; the deck is lit by the living room only
        for i, (x, y) in enumerate(((-2.6, 3.3), (-2.6, -1.4), (0.9, 3.3), (0.9, -1.4), (-3.0, -4.0))):
            _point(coll, f"living_{i}", (x, y, 2.55), 160.0)
        # the pendant's own bulb is an emissive mesh (interior.set_pendant); a
        # second lamp inside the shade rendered as a glowing ball
        _point(coll, "hall_ground", (2.85, 3.2, 2.4), 90.0)
        _point(coll, "box_room", (3.0, 5.0, 5.0), 80.0, radius=0.45)
        _point(coll, "upper_a", (-1.9, 1.6, 5.0), 80.0, radius=0.45)
        _point(coll, "upper_b", (-1.9, -2.6, 5.0), 80.0, radius=0.45)
        _point(coll, "hall_upper", (2.8, 0.0, 5.2), 45.0)
        return coll

    return coll  # "morning": the sky is the whole rig


# ---------------------------------------------------------------------------
# camera
# ---------------------------------------------------------------------------
def set_camera(board, device):
    sc = bpy.context.scene
    pos, tgt, fov, fstop = spec.CAMERAS[(board, device)]
    cam = bpy.data.cameras.get("cam") or bpy.data.cameras.new("cam")
    ob = bpy.data.objects.get("cam")
    if ob is None:
        ob = bpy.data.objects.new("cam", cam)
        sc.collection.objects.link(ob)
    sc.camera = ob
    cam.sensor_fit = "VERTICAL"
    cam.sensor_height = 24.0
    cam.lens = spec.lens_for_fov(fov)
    cam.clip_end = 600.0
    ob.location = pos
    _look_at(ob, tgt)
    focus = (Vector(tgt) - Vector(pos)).length
    cam.dof.use_dof = fstop > 0
    cam.dof.focus_distance = focus
    cam.dof.aperture_fstop = fstop if fstop > 0 else 8.0
    sc.render.resolution_x, sc.render.resolution_y = spec.SIZES[device]
    sc.view_settings.exposure = spec.EXPOSURE.get(board, -2.05)
    print(f"[environment] camera {board}-{device}: lens {cam.lens:.1f} mm, focus {focus:.1f} m, f/{cam.dof.aperture_fstop}")
    return ob


# ---------------------------------------------------------------------------
# X-ray stage
# ---------------------------------------------------------------------------
XRAY_W = spec.XRAY_SAMPLE["w"]
XRAY_H = spec.XRAY_SAMPLE["h"]
XRAY_Z0 = 0.10
XRAY_Y_START = 1.55


def _xray_slab(coll, materials, name, y0, y1, mat, x0=None, x1=None, z0=None, z1=None, bevel=0.004):
    x = spec.XRAY_OFFSET
    bm = bmesh.new()
    _box(bm, (
        x0 if x0 is not None else x - XRAY_W / 2,
        x1 if x1 is not None else x + XRAY_W / 2,
        y0, y1,
        z0 if z0 is not None else XRAY_Z0,
        z1 if z1 is not None else XRAY_Z0 + XRAY_H,
    ))
    return _obj(name, bm, coll, materials, mat, bevel=bevel)


def build_xray(materials):
    """The exploded wall sample at x = +200. Returns {layer_id: anchor (x,y,z)}."""
    t0 = time.time()
    coll = _coll("xray")
    x = spec.XRAY_OFFSET
    xl, xr = x - XRAY_W / 2, x + XRAY_W / 2
    zt = XRAY_Z0 + XRAY_H
    stud_x = (xl + 0.09, x, xr - 0.09)
    anchors = {}
    cursor = XRAY_Y_START
    for key, _label, t in spec.XRAY_LAYERS:
        y1, y0 = cursor, cursor - t
        if key == "layer1":  # rhombus slats, 15° tilt, along X
            pitch = spec.SLAT_H * math.cos(math.radians(spec.SLAT_TILT_DEG)) + spec.SLAT_GAP
            n = int(XRAY_H / pitch)
            bm = bmesh.new()
            rot = math.radians(spec.SLAT_TILT_DEG)
            ca, sa = math.cos(rot), math.sin(rot)
            yc = (y0 + y1) / 2
            for i in range(n):
                zc = XRAY_Z0 + pitch * (i + 0.5)
                verts = []
                for sy, sz in ((-spec.SLAT_T / 2, -spec.SLAT_H / 2), (spec.SLAT_T / 2, -spec.SLAT_H / 2),
                               (spec.SLAT_T / 2, spec.SLAT_H / 2), (-spec.SLAT_T / 2, spec.SLAT_H / 2)):
                    verts.append((yc + sy * ca - sz * sa, zc + sy * sa + sz * ca))
                ring = [[bm.verts.new((px, vy, vz)) for vy, vz in verts] for px in (xl, xr)]
                bm.faces.new(ring[0])
                bm.faces.new(list(reversed(ring[1])))
                for k in range(4):
                    bm.faces.new((ring[0][k], ring[0][(k + 1) % 4], ring[1][(k + 1) % 4], ring[1][k]))
            _obj("xray_slats", bm, coll, materials, "larch", bevel=0.002)
        elif key == "layer2":  # ventilated gap: three vertical battens only
            for i, sx in enumerate(stud_x):
                _xray_slab(coll, materials, f"xray_batten_{i}", y0, y1, "spruce_vertical", x0=sx - 0.03, x1=sx + 0.03)
        elif key == "layer3":
            _xray_slab(coll, materials, "xray_woodfibre", y0, y1, "wood_fibre")
        elif key == "layer4":  # frame + insulation
            for i, sx in enumerate(stud_x):
                _xray_slab(coll, materials, f"xray_stud_{i}", y0, y1, "spruce_vertical", x0=sx - 0.03, x1=sx + 0.03)
            _xray_slab(coll, materials, "xray_plate_bot", y0, y1, "spruce", z1=XRAY_Z0 + 0.06)
            _xray_slab(coll, materials, "xray_plate_top", y0, y1, "spruce", z0=zt - 0.06)
            bays = ((xl, stud_x[0] - 0.03), (stud_x[0] + 0.03, stud_x[1] - 0.03),
                    (stud_x[1] + 0.03, stud_x[2] - 0.03), (stud_x[2] + 0.03, xr))
            for i, (bx0, bx1) in enumerate(bays):
                if bx1 - bx0 < 0.02:
                    continue
                _xray_slab(coll, materials, f"xray_insul_{i}", y0 + 0.004, y1 - 0.004, "hemp",
                           x0=bx0, x1=bx1, z0=XRAY_Z0 + 0.06, z1=zt - 0.06, bevel=0.0)
        elif key == "layer5":
            _xray_slab(coll, materials, "xray_gf_out", y0, y1, "gypsum_fibre")
        elif key == "layer6":  # installation layer: wool + two horizontal battens
            _xray_slab(coll, materials, "xray_wool", y0 + 0.004, y1 - 0.004, "wool", bevel=0.0)
            for i, zc in enumerate((XRAY_Z0 + 0.55, XRAY_Z0 + 1.75)):
                _xray_slab(coll, materials, f"xray_hbatten_{i}", y0, y1, "spruce", z0=zc - 0.03, z1=zc + 0.03)
        else:
            _xray_slab(coll, materials, "xray_gf_in", y0, y1, "plaster")
        anchors[key] = (xl, (y0 + y1) / 2, zt)
        cursor = y0 - spec.XRAY_GAP

    bm = bmesh.new()
    _box(bm, (x - 150, x + 150, cursor - 150, XRAY_Y_START + 150, -0.4, 0.0))
    _obj("xray_floor", bm, coll, materials, "concrete")
    print(f"[environment] x-ray stage ({len(spec.XRAY_LAYERS)} layers) in {time.time() - t0:.2f} s")
    return anchors


# ---------------------------------------------------------------------------
# anchors + render
# ---------------------------------------------------------------------------
def export_anchors(board, device, path, extra=None):
    """Project the board's annotation anchors to normalised [u, v], v from the top."""
    sc = bpy.context.scene
    # the camera's matrix_world is stale until the depsgraph catches up with the
    # rotation set in set_camera — without this the projections are nonsense
    bpy.context.view_layer.update()
    cam = sc.camera
    src = dict(spec.ANCHORS.get(board, {}))
    if extra:
        src.update(extra)
    out = {}
    for key, world in src.items():
        u, v, _d = world_to_camera_view(sc, cam, Vector(world))
        out[key] = [round(u, 5), round(1.0 - v, 5)]
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
    print(f"[environment] anchors → {path}: {out}")
    return out


def render(board, device, quality, out_path):
    sc = bpy.context.scene
    q = spec.QUALITY[quality]
    samples = q["samples"]
    if quality == "final" and board in ("living", "dusk"):
        samples = spec.FINAL_SAMPLES_HEAVY
    sc.render.resolution_percentage = q["scale"]
    sc.cycles.samples = samples
    sc.cycles.use_adaptive_sampling = quality == "final"
    sc.cycles.adaptive_threshold = 0.01
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    sc.render.filepath = out_path
    w = sc.render.resolution_x * q["scale"] // 100
    h = sc.render.resolution_y * q["scale"] // 100
    print(f"[environment] rendering {board}-{device} {w}×{h} @ {samples} spp …")
    t0 = time.time()
    bpy.ops.render.render(write_still=True)
    dt = time.time() - t0
    print(f"[environment] {out_path} in {dt:.1f} s")
    return dt


# ---------------------------------------------------------------------------
# standalone test: the site and the x-ray stage on their own
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import argparse

    import materials

    ap = argparse.ArgumentParser(description="environment.py standalone test render")
    ap.add_argument("--view", default="site", choices=["site", "xray", "studio"])
    ap.add_argument("--scale", type=int, default=spec.QUALITY["test"]["scale"])
    ap.add_argument("--samples", type=int, default=spec.QUALITY["test"]["samples"])
    args = ap.parse_args()

    new_scene()
    out_dir = os.path.join(_HERE, "_test")
    if args.view == "xray":
        layer_anchors = build_xray(materials)
        set_light("morning")
        set_camera("xray", "desktop")
        export_anchors("xray", "desktop", os.path.join(out_dir, "env_xray.anchors.json"), extra=layer_anchors)
    else:
        build_site(materials, "studio" if args.view == "studio" else "lawn")
        set_light("table" if args.view == "studio" else "morning")
        set_camera("hero", "desktop")
    sc = bpy.context.scene
    sc.render.resolution_percentage = args.scale
    sc.cycles.samples = args.samples
    os.makedirs(out_dir, exist_ok=True)
    sc.render.filepath = os.path.join(out_dir, f"env_{args.view}.png")
    t0 = time.time()
    bpy.ops.render.render(write_still=True)
    print(f"[environment] test render: {sc.render.filepath} in {time.time() - t0:.1f} s")
