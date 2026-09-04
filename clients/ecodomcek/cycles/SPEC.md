# EcoDomček — Cycles scene specification (shared contract for all modules)

Every module in this folder is plain Python run inside Blender-as-a-module
(`python3` with `import bpy`, Blender **5.0.1**, CPU only, 4 cores, 15 GB RAM,
no GPU, no network, no external asset files — everything procedural). The
goal is **photorealistic** archviz renders of the "vzorový dom" (an EcoDomček
timber-frame house) for eight art-direction boards. Realism is the
requirement; a "maquette" or "clay" look is explicitly rejected.

## Coordinates and units

- Metres. **Z up.** Ground plane z = 0. Interior floor finish z = 0.15.
- The house footprint is x ∈ [−4, 4], y ∈ [−5, 5]. **+Y is the garden side**
  (the big glazing, the deck, the cameras). −Y is the back. +X is the
  right-hand side when standing in the garden looking at the house.
- Cameras sit in +Y and look toward −Y. Morning sun comes from the front-left
  (−X, +Y, high).

## The house (dimensions, all fixed — do not redesign)

| Element | Bounds / rule |
| --- | --- |
| Wall thickness | 0.32 (exterior walls are solid boxes; openings are cut with boolean or built from wall pieces — either is fine, but openings must be real holes so interiors are visible through glass) |
| Ground floor | z 0 → 3.15 (slab top of the first floor at 3.15; first-floor slab thickness 0.30, so living-room ceiling at 2.85) |
| Second storey | z 3.15 → 6.30 |
| Flat roof | anthracite slab z 6.30 → 6.64, overhanging 0.18 on every side, with a 0.28-tall fascia band around (x ∈ [−4.2, 4.2], y ∈ [−5.2, 5.2]); a flat roof membrane on top (dark grey), a slight gravel texture is welcome |
| Living-room glazing (front wall, y = 5) | opening x ∈ [−2.7, 1.5], z ∈ [0.15, 2.55]; anthracite frame 0.08 wide, one vertical mullion at x = −0.59; real glass (transmissive, 8 mm, slight green-grey tint) |
| Upper front windows (y = 5) | two: x ∈ [−3.3, −2.3] and x ∈ [−1.4, 0.0], z ∈ [3.9, 5.7]; anthracite frames 0.08, glass recessed 0.10 into the wall |
| Left wall windows (x = −4) | y ∈ [−1.2, 0.6] z ∈ [1.0, 2.5]; y ∈ [−3.4, −2.4] z ∈ [3.9, 5.7]; y ∈ [1.0, 2.0] z ∈ [3.9, 5.7] |
| Cantilever box (Lúčina motif) | anthracite compact-panel volume x ∈ [1.5, 4.7], y ∈ [3.6, 6.3], z ∈ [3.15, 6.28]; it protrudes 1.3 beyond the front wall and 0.7 beyond the right wall; a window on its front face x ∈ [2.2, 4.0], z ∈ [4.1, 5.5] (frame 0.08, glass, a lit spruce interior behind it) |
| Entrance | under the box: anthracite door x ∈ [2.3, 3.4], z ∈ [0.15, 2.35] on the front wall, a slim handle, a 2-step concrete threshold |
| Deck (terrace) | larch boards 0.145 wide, 0.028 thick, 6 mm gaps, running along X; area x ∈ [−4.4, 1.8], y ∈ [5.0, 8.8], top at z = 0.15; anthracite edge board on the +Y edge; the deck sits on a low concrete plinth (z 0 → 0.12) |
| Plinth | 0.25-tall exposed concrete band around the base of the house (z 0 → 0.25), set 0.02 inside the cladding line |
| Cladding | **larch Rhombus profile**: horizontal slats 0.070 high × 0.021 thick with a rhomboid section (front face tilted 15°), 0.010 open gap between slats, on 0.03 vertical battens over a black facade membrane (visible in the gaps). Slats cover every larch wall face, cut cleanly around openings with anthracite reveal boards 0.08 wide. Per-slat colour variation ±6 % lightness, ±3 % hue via Object Info Random |
| Interior, ground floor | open living/dining/kitchen: oak plank floor (0.14 × 1.6 planks, 2 mm gaps); walls and ceiling white plaster (subtle roughness noise); the back wall (y = −5) inside has a full-height spruce plank cladding; kitchen block along the back wall x ∈ [−3.4, −0.2], depth 0.65, height 0.90, white-oak fronts + anthracite worktop, a tall column at x ∈ [−0.2, 0.4]; dining table 1.9 × 0.9 (oak top, black steel legs) at x ∈ [−2.3, −0.4], y ∈ [−1.3, −0.4] with six chairs; a low grey-fabric sofa 2.3 × 0.95 facing the glazing at y ≈ 2.3; coffee table; a wool rug; one black pendant lamp over the table; a spruce open stair along the right wall (x ∈ [2.7, 3.7]) rising toward the back, 15 treads of 0.27 × 0.18; a slim black steel handrail |
| Interior, upper floor | partition wall at x = 0 from y = −5 to 0.4; two bedrooms with beds (mattress + linen, wood base); plaster walls; this floor is seen mainly in the dollhouse board |
| Ground / site | a gently undulating lawn, flat within 15 m of the house (procedural colour + bump, no hair particles — CPU budget); a hazed outer field from 110 m to 430 m; a gravel drive that fans out from the entrance and runs off the plot; a 0.55 m gravel skirt around the plinth; ~2 300 grass blades in tufts where the ground meets the deck, the drive and the plinth; two woodland bands at 330 m and 470 m carrying aerial perspective. Discrete trees were tried and rejected (they read as low-poly lollipops at any distance the camera sees them) |

## Materials (procedural, PBR, Principled BSDF)

| Name (materials.get(name)) | Look |
| --- | --- |
| `larch` | oiled Siberian larch: base #C89A5B with grain (stretched noise + wave bands along the slat), knots rare, roughness 0.45–0.6 with grain-driven variation, anisotropy low, bump from grain 0.15; per-object random hue/value via Object Info |
| `larch_deck` | same wood, greyer and rougher (weathered): #B58F62, roughness 0.7 |
| `anthracite` | Fundermax compact panel: #2E2F31, roughness 0.28, slight specular, faint panel-format seams every 1.2 × 2.4 m, tiny surface noise so it is not flat |
| `membrane` | matt black facade membrane behind the slats |
| `glass` | Principled: transmission 1.0, IOR 1.52, roughness 0.02, base colour #E8F0EE, thickness 8 mm (solidify or double plane) |
| `frame` | powder-coated anthracite aluminium: #2A2B2D, roughness 0.35 |
| `plaster` | white plaster #F1EEE8 with fine roughness noise 0.6–0.8 |
| `spruce` | planed spruce #E9D9BD, soft grain, roughness 0.55 |
| `oak_floor` | oak planks #C7A46F with plank-wise variation and 2 mm dark gaps, roughness 0.35 with a satin finish |
| `concrete` | plinth/path: #B9B5AD, roughness 0.9, fine speckle |
| `gravel` | grey gravel #9A968F, strong bump/voronoi speckle |
| `lawn` | grass green #4F6B2E → #7A8F3A variation, strong fine bump, roughness 0.9 |
| `fabric_grey` | sofa #5B5B5E, sheen, roughness 0.95 |
| `linen` | bed linen off-white #EDE7DC |
| `steel_black` | #1A1A1A metal, roughness 0.45 |
| `roof_membrane` | dark grey #3A3B3D, roughness 0.9, gravel speckle |

Hard edges everywhere get a Bevel modifier (width 0.004–0.008, 2 segments)
or a Bevel shader node (0.005) — chamfered edges are the single cheapest
realism cue.

## Light states (environment.set_light(state))

The sky texture's own sun disc is **off** in every state: a bright disc in
the world is sampled too poorly to cast, and the first integrated renders
had no shadows at all. Direct light is a SUN lamp placed on the sky node's
own vector (`environment.sun_vector`), so sky and sun always agree.

`spec.LIGHTS[state]["rotation"]` is the pre-mirror azimuth of the study the
cameras came from; the Blender sky node measures `sun_rotation` clockwise
from +Y, so the conversion is `blender = 180 − spec`, applied once in
`environment.SUN_ROT`.

| state | Sky | Sun lamp | Practicals |
| --- | --- | --- | --- |
| `morning` | elevation 24°, spec rotation −70° (Blender 250°: the sun is behind-left of the house), world strength 0.55, aerosol 1.5 | SUN 34 W/m², angle 0.9° | none |
| `interior` | elevation 26°, spec rotation −158° (Blender 338°: through the front glazing), world 0.8 | SUN 34 W/m² | pendant bulb 40 W, a bounce fill 70 W and a wall wash 40 W standing in for the room's own bounce |
| `table` (dollhouse) | elevation 45°, hazy (aerosol 4.0), world 1.0 | SUN 9 W/m², angle 6° + a 14 m key at 6 000 W | none |
| `dusk` | elevation −7°, world 1.15 | none | ceiling practicals: living 5× 190 W, hall 90 W, box and both bedrooms 45 W each, hall upper 45 W, pendant on. Mid-height sources were tried first and read as glowing balls through the windows |

Both daylight states also carry:

- a **cumulus layer** in the world shader (`environment._clouds`) — noise
  projected onto a cloud plane along the view ray, brightened toward white
  and faded out in the last few degrees above the horizon. The clean sky
  gradient of the bare sky node is the loudest "this is CG" cue in an
  exterior;
- a **cloud-shadow plane** 340 m up (`environment._cloud_shadow`), visible to
  shadow rays only, so the same noise breaks the meadow up the way cloud
  shadow does in a photograph.

View transform **AgX**, look **"AgX - Punchy"**. Base Contrast measured at
p1 luma 0.29 and mean saturation 0.08 on the first exterior — milky and
almost monochrome. Exposure is per board (`spec.EXPOSURE`), because a sunlit
exterior, a room lit through one wall and a dusk shot whose subject is the
light inside cannot share one stop. Film filter 1.5 px.

## Cameras (environment.set_camera(board, device))

Sensor fit VERTICAL, sensor height 24 mm. `fov` below is the **vertical**
field of view in degrees: lens = 12 / tan(fov/2). Slight depth of field
(f/8, focus on the house) on exteriors; f/4 on the interior; none on the
X-ray.

`spec.CAMERAS` is authoritative; the table is the reading of it. Camera x was
negated on 2026-09-03 (Blender's handedness mirrors the three.js study the
poses came from), and the exteriors were rebuilt on 2026-09-04 at **eye
level with a lens shift** (`spec.SHIFT`): a level camera keeps verticals
parallel, which is how architecture is photographed, and a camera at 4.4 m
looking down reads as a model on a table. Where a board appears in
`spec.SHIFT`, `set_camera` aims level and the look-at z is ignored.

| board | device | position (x, y, z) | look-at | fov | shift |
| --- | --- | --- | --- | --- | --- |
| hero | desktop 1440×900 | (−18.5, 28.5, 1.85) | (6.2, 0, ·) | 25 | 0.17 |
| hero | mobile 780×1688 | (−15.5, 23.5, 1.70) | (4.4, 0, ·) | 42 | 0.06 |
| living | desktop | (−2.5, −3.7, 1.5) | (1.7, 5.0, 1.15) | 47 | — |
| living | mobile | (2.7, −4.0, 1.55) | (−1.5, 5.0, 1.05) | 52 | — |
| xray | desktop | (195.1, 4.3, 2.45) | (200.2, −0.35, 1.35) | 33 | — |
| dollhouse | desktop | (−25, 25, 19) | (7.4, −1.2, 1.6) | 27 | — |
| dusk | desktop | (−14.5, 23, 1.8) | (3.8, 0, ·) | 26 | 0.17 |
| dusk | mobile | (−16, 29, 1.75) | (4.4, 0, ·) | 40 | 0.10 |

The house must occupy the **right ~55 %** of desktop frames (copy sits in the
left five columns) except `living`, where the copy sits right and the
glazing left. On mobile the house sits in the upper 55 %; the copy sits on
the ground/lawn area below.

## X-ray stage (board `xray`)

A separate collection far from the house (x offset +200): a 1.2 × 2.4 wall
sample exploded into 7 layers along −Y with 0.44 gaps, on a light concrete
floor under the morning sky: (1) larch Rhombus slats, (2) three vertical
battens (ventilated gap), (3) wood-fibre board 60 mm (tan, fibrous), (4)
timber frame 160 mm with hemp/wood-fibre insulation between studs (three
studs, fibrous fill), (5) gypsum-fibre board 15 mm (grey-beige), (6)
installation layer 50 mm with sheep wool (off-white fibrous) and two
horizontal battens, (7) interior gypsum-fibre board 12.5 mm (painted white).
Camera (204.6, 6.4, 3.1) → (199.0, −0.1, 1.0), fov 30. Labels are added in
the DOM from projected anchors (top edge of each layer, x = +0.6 from the
sample centre).

## Dollhouse (board `dollhouse`)

The roof group lifted +3.2 in z and +1.2 in x, rotated −3° around Y; the
upper floor visible with its partition and beds; ground material becomes a
bone-coloured studio floor (#E8DFCE) instead of lawn; light state `table`.

## Annotation anchors (environment.export_anchors(board, device, path))

Write JSON `{ "label-id": [u, v] }` with u, v ∈ [0, 1] from
`bpy_extras.object_utils.world_to_camera_view` (v measured from the top).
Anchors: `hero`: `vzorovy` at (4.2, 5.2, 6.64) [roof top front-right corner];
`dollhouse`: `vzorovy` at the lifted roof's front-right corner, `fasada` at
(−4.0, 2.0, 1.6); `xray`: `layer1`…`layer7` at the top edge of each layer.

## Render settings (environment.render(board, device, quality, out_path))

| quality | resolution | samples | denoise |
| --- | --- | --- | --- |
| `test` | 25 % of board size | 32 | OpenImageDenoise |
| `preview` | 50 % | 96 | OIDN |
| `final` | 100 % | 384 (exteriors) / 512 (interior, dusk) | OIDN, adaptive sampling on |

Exposure comes from `spec.EXPOSURE[board]`, applied by `set_camera`.

Cycles CPU, light tree on, path guiding off, max bounces 8 / glossy 4 /
transmission 8, caustics off, clamp indirect 8. Print the render time.

## Module interfaces (all files in this folder; `import spec` for the constants)

- `spec.py` — the numbers above as Python constants (dimensions, colours,
  cameras, shifts, exposures, light states). Written by the integrator.
- `meshutil.py` — `smooth_by_angle(bm, deg)`. Blender's blanket
  `mesh.shade_smooth()` interpolates normals across every edge, which turned
  each glass pane into a chrome dome; every module shades by angle instead.
- `materials.py` — `get(name) -> bpy.types.Material` (creates on first use,
  cached by name); `apply(obj, name)`.
- `geometry.py` — `build_house(materials) -> dict` of collections
  `{ "walls", "roof" (a collection that can be moved as a group), "box",
  "openings", "slabs", "stair", "plinth" }`. Openings are real holes.
- `cladding.py` — `clad(house, materials)`: generates Rhombus slats on every
  larch face (respecting openings), battens, membrane, reveal boards,
  window/door frames and glass, the deck, the concrete threshold.
- `interior.py` — `furnish(house, materials)`: everything in the interior
  rows above, plus the upper-floor beds and partition.
- `environment.py` — `new_scene()`, `build_site(materials, mode)` (mode
  `lawn` | `studio`), `set_light(state)`, `set_camera(board, device)`,
  `export_anchors(board, device, path, extra=None)`,
  `render(board, device, quality, out_path)`, `build_xray(materials)`
  (returns the layer anchors). `export_anchors` updates the view layer first:
  the camera's `matrix_world` is stale straight after `set_camera` and every
  projection lands off-frame without it.
- `build.py` — CLI: `python3 build.py --board hero --device desktop
  --quality preview [--out path]`; assembles everything, renders, exports
  anchors next to the PNG. Also `--all` to loop all eight boards.

## Test protocol for every module

Each module must run standalone as `python3 <module>.py` and render a
`test`-quality PNG of its own output to `clients/ecodomcek/cycles/_test/`
(create it), printing the path and render time. Keep each test render under
~60 s. Blender 5 API notes: `bpy.ops.wm.read_factory_settings(use_empty=True)`
to start clean; sky types are `MULTIPLE_SCATTERING` (use this),
`SINGLE_SCATTERING`, `PREETHAM`, `HOSEK_WILKIE`; the Principled BSDF socket
names are "Base Color", "Roughness", "IOR", "Transmission Weight",
"Coat Weight", "Sheen Weight", "Emission Color", "Emission Strength",
"Normal"; ColorRamp node is `ShaderNodeValToRGB`; mix colours with
`ShaderNodeMix` (`data_type='RGBA'`, inputs 6/7, output 2); use
`ShaderNodeBevel` for cheap chamfers; boolean via `object.modifiers.new(...,
'BOOLEAN')` with `solver='EXACT'` then `bpy.ops.object.modifier_apply`
(select + set active first). Use `bpy.context.view_layer.objects.active`.
Set `scene.cycles.device='CPU'`, `scene.render.threads_mode='AUTO'`.
