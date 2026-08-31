# CODERA 3D LOGO — CREATION BRIEF

## Objective

Create a production-quality 3D model of the approved Codera **C ribbon mark** from the supplied reference images.

This is a brand reconstruction task, not a logo redesign.

The output will be used in a high-end interactive website with Three.js / React Three Fiber, so the model must be recognizable, lightweight enough for realtime use, and visually faithful to the approved mark.

## Authoritative references

1. `01_APPROVED_CODERA_LOGO_REFERENCE.jpg`
   - authoritative overall brand reference
   - includes the approved C mark, metallic treatment and CODERA wordmark

2. `02_CODERA_C_MARK_REFERENCE.png`
   - crop of the approved C mark
   - use this to study the geometry, overlap, twist and silhouette

If anything in this brief conflicts with the images, preserve the approved visual identity shown in the images.

## Non-negotiable geometry

The mark is NOT a flat C extruded into 3D.

It is a continuous folded ribbon / strip forming a C.

Preserve:

- the approved overall C silhouette from the front
- the wide top terminal extending toward the upper right
- the wide lower terminal extending toward the lower right
- the rounded left-side sweep
- the characteristic central ribbon twist / fold
- clearly readable front and reverse ribbon surfaces
- the overlap logic visible in the approved mark
- the negative inner space of the C
- the visual balance and proportions of the approved logo

Do not:
- replace it with a generic C
- simply extrude the 2D silhouette
- make it look like a thick solid letter
- round or simplify away the ribbon twist
- invent extra folds
- materially change the opening, terminals or proportions

## Construction approach

Build it as a true ribbon surface.

Preferred approach:
1. establish the ribbon centre path / curve,
2. sweep a strip of controlled width along that path,
3. introduce the required spatial rotation/twist of the strip,
4. shape the top and bottom terminals to match the approved reference,
5. refine the front-view silhouette until it closely matches the approved mark,
6. add only enough physical thickness to make the ribbon believable in oblique views.

The front orthographic view should read almost identically to the approved logo.

The 3D value should become apparent when the camera moves around it.

## Material direction

Create a neutral premium metallic material suitable as a base asset.

Target:
- satin silver / titanium
- restrained metallic reflection
- subtle roughness variation
- soft edge highlights
- clean PBR response

Avoid:
- gold
- rainbow chrome
- neon
- strong color tint
- excessive bloom baked into the asset

Lighting and final look-dev will be handled by the website, so do not bake dramatic lighting into textures.

## Topology / realtime requirements

The asset is intended for realtime web rendering.

Requirements:
- clean topology
- no unnecessary internal geometry
- no duplicate overlapping meshes
- no excessive subdivision
- reasonable polygon count
- correct normals
- centred origin
- sensible scale
- transforms applied
- no hidden cameras/lights/helpers in final export unless explicitly needed
- use PBR-compatible materials
- avoid large embedded textures unless absolutely necessary

Prefer geometry/material definition over baked raster detail.

## Deliverables

Create:

- `codera-c-ribbon.glb` — primary production asset
- `codera-c-ribbon.blend` or source file if your environment supports it
- `codera-c-ribbon-front.png` — orthographic/front validation render
- `codera-c-ribbon-oblique.png` — 3/4 validation render

If Blender is unavailable, create the model using another reliable 3D workflow and still export GLB.

## Validation gate — DO NOT SKIP

Before treating the model as finished:

### Front-view identity test
Compare the orthographic front render directly against the supplied C reference.

Ask:
- Is the silhouette unmistakably the same Codera C?
- Are the top and bottom terminals correct?
- Is the central twist visible in the correct place?
- Does the negative space match?
- Does it still look like a ribbon rather than an extruded letter?

If not, continue modelling.

### Oblique-view test
The 3/4 render must show:
- real ribbon depth
- believable fold/twist
- front/back surface relationship
- no broken geometry
- no unnatural thick extrusion

### Website suitability test
The GLB must:
- load successfully,
- be suitable for Three.js / React Three Fiber,
- allow material replacement,
- allow rotation / deformation / animation without obvious topology problems.

## Important

Do not use or reproduce any previously generated Codera 3D files unless they are explicitly supplied in this package. Earlier rough extruded interpretations are rejected.

The attached approved logo images are the source of truth.

## Final reporting

When finished, report:
- modelling method used,
- approximate polygon/triangle count,
- object/mesh names,
- material names,
- GLB file size,
- any compromises made,
- whether front-view identity was manually checked against the supplied reference.
