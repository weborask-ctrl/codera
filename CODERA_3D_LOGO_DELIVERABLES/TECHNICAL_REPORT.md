# Codera C Ribbon — 3D Asset Technical Report

Deliverable set for Step 2 of the working document (v0.5), built
2026-08-27 from `CODERA_3D_LOGO_CREATION_PACK` (README read in full
before modelling; both reference images studied).

## Files

| File | Purpose |
| --- | --- |
| `codera-c-ribbon.glb` | primary production asset (glTF 2.0 binary) |
| `codera-c-ribbon-source.mjs` | parametric source (script-based workflow; Blender not available in this environment — README's alternative-workflow clause applied). Canonical copy lives at `scripts/build-ribbon-glb.mjs`; re-running it regenerates the GLB deterministically. |
| `codera-c-ribbon-front.png` | orthographic front validation render |
| `codera-c-ribbon-oblique.png` | 3/4 perspective validation render |

## Modelling method

True ribbon construction, not an extrusion:

1. **Centre path**: the approved mark's parametric spine (Catmull-Rom
   through 11 control points) — the exact 2D geometry approved for the
   brand (same definition that emits the production SVGs), so the 2D and
   3D marks cannot drift apart.
2. **Strip sweep**: a strip of half-width 12.4 (logo units) swept along
   the spine; per-column terminal trimming places the end rows exactly
   on the approved diagonal cut planes (top-right and bottom-right
   terminals).
3. **Fold/twist**: the two approved crease planes split the strip into
   top strap → folded band → bottom strap. Straps float at z = +5; the
   band dives to z = −17 between the creases with an ease-out profile
   whose tip is rounded over 1.5 units (visually crisp fold, normal-
   continuous surface), plus a differential width-wise tilt (9 units)
   that turns the band's face away from a frontal key light — the
   front/back tonal flip of the approved mark. Z never alters the XY
   footprint, so the front orthographic silhouette equals the approved
   2D mark by construction.
4. **Mesh**: crease-aligned sampling — every width-column places grid
   rows exactly on both fold lines (no quads straddle a fold), 340×20
   mid-surface grid, exact analytic height-field normals, ±0.6-unit
   thickness offset along local normals, rail walls and diagonal end
   caps closing the solid.
5. **Export**: hand-assembled glTF 2.0 binary (positions, normals,
   indices, PBR material), centred origin, transforms applied, no
   cameras/lights/helpers, no textures.

## Numbers

- Triangles: **28,640** — Vertices: **15,770** (realtime-suitable)
- GLB size: **723 KB** (no textures; geometry + material only)
- Bounding box: 0.894 × 0.980 × 0.27 units (height ≈ 0.98, centred)
- Object/mesh name: `codera-c-ribbon` (scene `codera-c-ribbon-scene`)
- Material name: `codera-satin-titanium` — pbrMetallicRoughness,
  baseColor (0.82, 0.825, 0.835), metallic 0.55, roughness 0.55;
  replaceable (standard glTF PBR slot, no baked lighting).

## Validation performed

- **Front-view identity test** — manually compared
  `codera-c-ribbon-front.png` against `02_CODERA_C_MARK_REFERENCE.png`:
  silhouette is the approved C (identical parametric construction);
  wide upper-right and lower-right diagonal terminals ✓; rounded left
  sweep ✓; central fold/turn-over in the approved crease positions with
  readable front (bright) vs reverse (grey) surfaces ✓; negative inner
  space and right-facing chevron opening ✓; reads as folded ribbon, not
  an extruded letter ✓.
- **Oblique-view test** — `codera-c-ribbon-oblique.png`: real ribbon
  depth (straps forward, band curving back), believable paper-thin
  folds with visible thickness at the crease, front/back surface
  relationship, no broken geometry, no thick extrusion.
- **Website suitability** — the validation renders were produced by
  loading the GLB with Three.js `GLTFLoader` (r-series bundled with the
  project) inside the site's own dev environment (`/logo-lab` bakery
  page): loads cleanly, material override tested (envMapIntensity),
  regular indexed topology suitable for rotation/deformation.

## Compromises / notes

- No Blender in the environment → parametric script workflow (explicitly
  permitted by the README). The "source file" is therefore code, which
  is arguably stronger for this brand: the 2D SVGs and the 3D GLB come
  from one definition.
- The fold is geometrically a sharp-but-rounded crease (1.5-unit tip
  radius) rather than an ideal zero-radius crease — intentional, both
  for realistic paper behaviour and artifact-free shading.
- The bowl's tonal gradient in the front render is produced by the
  band's real 3D orientation under a frontal studio light (as in the
  reference photograph); final look-dev (lights/env) belongs to the
  website per the README, so the asset itself bakes nothing.
- The 2D mark's soft overlap shadows (strap over band) are represented
  physically by the fold connection instead of a fake overlap — the
  approved visual reading (bright→grey→bright with crisp diagonal
  creases) is preserved.
- Validation renders were made on the environment's lab page at
  1100×1100; they are look-dev previews, not brand-final imagery.
