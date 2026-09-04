"""Shared mesh finishing helpers.

`smooth_by_angle` is the important one: Blender's blanket `mesh.shade_smooth()`
interpolates normals across every edge, which turns a glass pane or a cabinet
door into a chrome dome (seen on 2026-09-04 in the first integrated render).
Marking edges sharper than a threshold as sharp is what "Shade Auto Smooth"
does in the UI; doing it on the bmesh avoids one operator call per object.
"""

import math

DEFAULT_ANGLE = 30.0


def smooth_by_angle(bm, angle_deg: float = DEFAULT_ANGLE):
    """Smooth shading everywhere except across edges sharper than `angle_deg`."""
    limit = math.radians(angle_deg)
    for f in bm.faces:
        f.smooth = True
    for e in bm.edges:
        e.smooth = e.calc_face_angle(math.pi) <= limit
    return bm
