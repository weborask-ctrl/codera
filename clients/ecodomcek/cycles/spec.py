"""Shared constants for the EcoDomček Cycles scene. See SPEC.md — the prose
there is the contract; these are the same numbers as Python."""

import math

# ---- house envelope (metres, Z up, +Y = garden) --------------------------
WALL_T = 0.32
X0, X1 = -4.0, 4.0
Y0, Y1 = -5.0, 5.0
Z_GROUND = 0.0
Z_FLOOR = 0.15  # interior floor finish
Z_SLAB1 = 3.15  # top of the first-floor slab
SLAB_T = 0.30
Z_TOP = 6.30  # top of the second storey (underside of the roof slab)
ROOF_T = 0.34
ROOF_OVERHANG = 0.18
FASCIA_H = 0.28

# living-room glazing on the front wall (y = Y1)
GLAZING = {"x": (-2.7, 1.5), "z": (0.15, 2.55), "mullion_x": -0.59, "frame": 0.08}
# upper front windows (y = Y1)
FRONT_WINDOWS = [{"x": (-3.3, -2.3), "z": (3.9, 5.7)}, {"x": (-1.4, 0.0), "z": (3.9, 5.7)}]
# left wall windows (x = X0), given in y
LEFT_WINDOWS = [
    {"y": (-1.2, 0.6), "z": (1.0, 2.5)},
    {"y": (-3.4, -2.4), "z": (3.9, 5.7)},
    {"y": (1.0, 2.0), "z": (3.9, 5.7)},
]
WINDOW_FRAME = 0.08
WINDOW_RECESS = 0.10

# cantilever box
BOX = {"x": (1.5, 4.7), "y": (3.6, 6.3), "z": (3.15, 6.28)}
BOX_WINDOW = {"x": (2.2, 4.0), "z": (4.1, 5.5)}

# entrance door on the front wall under the box
DOOR = {"x": (2.3, 3.4), "z": (0.15, 2.35)}

# deck
DECK = {"x": (-4.4, 1.8), "y": (5.0, 8.8), "top": 0.15, "board_w": 0.145, "board_t": 0.028, "gap": 0.006}
PLINTH_H = 0.25

# cladding (Rhombus)
SLAT_H = 0.070
SLAT_T = 0.021
SLAT_GAP = 0.010
SLAT_TILT_DEG = 15.0
BATTEN_T = 0.03
REVEAL_W = 0.08

# interior
KITCHEN = {"x": (-3.4, -0.2), "depth": 0.65, "h": 0.90, "column_x": (-0.2, 0.4)}
TABLE = {"x": (-2.3, -0.4), "y": (-1.3, -0.4), "h": 0.75}
SOFA = {"w": 2.3, "d": 0.95, "y": 2.3, "x_center": -1.25}
STAIR = {"x": (2.7, 3.7), "treads": 15, "tread": 0.27, "rise": 0.18, "y_start": 3.2}
PARTITION_X = 0.0

# ---- materials (sRGB hex) -------------------------------------------------
COLORS = {
    "larch": "#C89A5B",
    "larch_deck": "#B58F62",
    "anthracite": "#2E2F31",
    "frame": "#2A2B2D",
    "glass": "#E8F0EE",
    "plaster": "#F1EEE8",
    "spruce": "#E9D9BD",
    "oak_floor": "#C7A46F",
    "concrete": "#B9B5AD",
    "gravel": "#9A968F",
    "lawn_a": "#4F6B2E",
    "lawn_b": "#7A8F3A",
    "fabric_grey": "#5B5B5E",
    "linen": "#EDE7DC",
    "steel_black": "#1A1A1A",
    "roof_membrane": "#3A3B3D",
    "membrane": "#0E0E0E",
    "studio_floor": "#E8DFCE",
    "wood_fibre": "#B89A5C",
    "hemp": "#CDB98A",
    "wool": "#E6DCC8",
    "gypsum_fibre": "#D8D2C7",
}


def hex_to_rgb(h: str):
    """sRGB hex → linear RGB tuple (Blender colour sockets are linear)."""
    h = h.lstrip("#")
    r, g, b = (int(h[i : i + 2], 16) / 255 for i in (0, 2, 4))

    def lin(c):
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

    return (lin(r), lin(g), lin(b), 1.0)


# ---- light states ----------------------------------------------------------
LIGHTS = {
    # The exterior cameras look at the front (+Y) and left (−X) walls. A sun in
    # that same quadrant lights both flatly and hides its own shadow behind the
    # house (rendered 2026-09-04), so the sun sits well round to +X: the front
    # facade takes a raking light that reveals the Rhombus relief, the left wall
    # falls into shade, and the cantilever box casts onto the facade below it.
    "morning": {"elevation": 17, "rotation": -62, "intensity": 1.0, "world": 0.40, "interior": False},
    "interior": {"elevation": 26, "rotation": -158, "intensity": 1.0, "world": 0.8, "interior": "accent"},
    "table": {"elevation": 45, "rotation": 200, "intensity": 0.55, "world": 1.5, "interior": False},
    "dusk": {"elevation": -7, "rotation": 30, "intensity": 0.0, "world": 1.15, "interior": "all"},
}
BOARD_LIGHT = {"hero": "morning", "living": "interior", "xray": "morning", "dollhouse": "table", "dusk": "dusk"}
BOARD_SITE = {"hero": "lawn", "living": "lawn", "xray": "lawn", "dollhouse": "studio", "dusk": "lawn"}

# ---- cameras (position, look-at, vertical fov°) ---------------------------
XRAY_OFFSET = 200.0
# NOTE (2026-09-03): Blender's camera handedness mirrors the three.js study
# these poses were derived from, so x is negated on every house camera to keep
# the compositions (house RIGHT of the copy on desktop exteriors, glazing LEFT
# in the living room). From the garden the cameras now see the front (+Y) and
# the LEFT (−X) wall; the cantilever box sits at the far right end of the front.
CAMERAS = {
    ("hero", "desktop"): ((-18.5, 28.5, 1.85), (6.2, 0, 0), 25, 8.0),
    ("hero", "mobile"): ((-15.5, 23.5, 1.70), (4.4, 0, 0), 42, 8.0),
    ("living", "desktop"): ((-2.5, -3.7, 1.5), (1.7, 5.0, 1.15), 47, 4.0),
    ("living", "mobile"): ((2.7, -4.0, 1.55), (-1.5, 5.0, 1.05), 52, 4.0),
    ("xray", "desktop"): ((XRAY_OFFSET - 5.6, 5.4, 3.15), (XRAY_OFFSET + 0.5, -0.55, 0.55), 31, 0.0),
    ("dollhouse", "desktop"): ((-31, 31, 23), (8.6, -1.6, 0.4), 25, 11.0),
    ("dusk", "desktop"): ((-14.5, 23, 1.8), (3.8, 0, 0), 26, 8.0),
    ("dusk", "mobile"): ((-16, 29, 1.75), (4.4, 0, 0), 40, 8.0),
}
# Architectural photography keeps verticals parallel: for these boards the
# camera is level and the frame is raised with a lens shift instead of being
# tilted up. shift_y is in sensor units; the look-at z is ignored when a board
# appears here (environment.set_camera aims level).
SHIFT = {
    ("hero", "desktop"): 0.17,
    ("hero", "mobile"): -0.15,
    ("dusk", "desktop"): 0.17,
    ("dusk", "mobile"): 0.10,
}
SIZES = {"desktop": (1440, 900), "mobile": (780, 1688)}
EXPOSURE = {"hero": -1.55, "living": -0.35, "xray": -3.25, "dollhouse": -1.85, "dusk": -0.35}
QUALITY = {
    "test": {"scale": 25, "samples": 32},
    "preview": {"scale": 50, "samples": 96},
    "final": {"scale": 100, "samples": 384},
}
FINAL_SAMPLES_HEAVY = 512  # living, dusk


def lens_for_fov(fov_deg: float, sensor_h: float = 24.0) -> float:
    return (sensor_h / 2) / math.tan(math.radians(fov_deg) / 2)


# ---- annotation anchors (world coordinates) --------------------------------
ANCHORS = {
    "hero": {"vzorovy": (-4.2, 5.2, 6.64)},
    "dollhouse": {"vzorovy": (-4.2 + 1.2, 5.2, 6.64 + 3.2), "fasada": (4.0, 2.0, 1.6)},
}
DOLLHOUSE_ROOF = {"dz": 3.2, "dx": 1.2, "rot_y_deg": -3.0}

# ---- x-ray layers (outside → inside), thickness in metres ----------------
XRAY_LAYERS = [
    ("layer1", "Smrekovcový obklad Rhombus", 0.021),
    ("layer2", "Odvetraná medzera", 0.030),
    ("layer3", "Drevovláknitá doska", 0.060),
    ("layer4", "Nosný rám + izolácia", 0.160),
    ("layer5", "Sadrovláknitá doska", 0.015),
    ("layer6", "Inštalačná vrstva · ovčia vlna", 0.050),
    ("layer7", "Sadrovláknitá doska", 0.0125),
]
XRAY_GAP = 0.44
XRAY_SAMPLE = {"w": 1.2, "h": 2.4}
