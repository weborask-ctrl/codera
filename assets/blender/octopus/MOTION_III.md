# Motion III — standalone character study

19 September 2026. Source: `scripts/finish-octopus-motion.py`.

## Root cause and repair

The narrow stretched strip was caused by an isolated patch of four skin vertices (179524–179527) assigned to ARM_02_23 while their surrounding surface belonged to ARM_03_07/08. In frame 61 of revision 11, a rest edge of about 1.85 mm stretched to 0.5345 m (288 times its rest length). This was a weight ownership error, not evidence that the entire crown needed rebuilding.

The repair detects small connected islands of dominant arm weights and interpolates replacement weights from the surrounding surface. Nine vertices were corrected in total, including smaller islands on other arms. Disconnected tip remnants without a surrounding donor region are intentionally preserved. Mesh coordinates, faces, materials and accepted crown silhouette remain unchanged.

## Motion

- 24 fps, frames 1–289: 12 seconds, four swimming strokes.
- Each stroke retains 1.5 seconds of recovery/opening, 1 second of closing and 0.5 seconds of coast.
- Distal response remains delayed; slight differences between arms preserve coordination.
- Smooth left/right steering, restrained body bank, lateral travel and small rise/descent are layered on the root.
- Mantle ventilation, small eye aiming and siphon aiming accompany the motion.
- Earlier actions remain inside the Blender file as backups. Only Motion III actions are active.

This is an authored demonstration path, not a hydrodynamic simulation or a calibrated animal trajectory. Reef entry needs the final reef geometry and contact choreography; it is not included in this isolated model scene. The web integration should control the travel root separately from the stroke cycle.

## Export and delivery

The dense source model remains a production starting point, not an optimized website asset. The GLB uses separate rig and mantle clips, which must play together. Procedural Blender skin detail and studio lighting need a separate bake/web lighting pass.

## Validation and final local smoothing

Revision 12: 14 sampled poses have finite skin coordinates, normalized weights and identical endpoint bone matrices. The conspicuous stretched strip is absent in the inspected Eevee render. Maximum sampled skin edge length fell from 0.5345 m to about 0.033 m. Smaller discontinuities remain around other overlaps.

`scripts/smooth-octopus-motion-weights.py` addresses these with localized weight diffusion: 146 seed vertices identified from measured strain, 2,011 affected vertices, eight adjacency rings with a fixed outer boundary. No vertex coordinates or faces are changed. A temporary test at frames 1, 37, 61, 145, 217 and 289 reduced maximum edge lengths to 0.027 m or less; no edges exceeded both 10× rest length and 3 cm. This threshold detects major spikes, not all anatomical/intersection problems.

Revision-12 GLB verification: both clips span 12 seconds; rig has 198 varying samplers, mantle has one. Animation data is finite, timestamps strictly increase, and exported first/last values match exactly. Final camera lighting is checked with Eevee; any Workbench motion preview is for silhouette/timing only, not material approval.

## Weight refinement: revision 13

Cloud operation `smooth-motion-13` committed the tested local weight smoothing. Its motion and camera are unchanged from revision 12. `final-motion-render-13` checks the opposite steering/closing pose at frame 217 using the delivery camera and actual Eevee materials. `octopus-motion-final.png` is the resulting 400 px inspection render.

Live browser playback was checked in the 3D Jutsu Animation view: the 12-second timeline advanced and screenshots at different times showed changed arm poses, body position and orientation without the former long strip. Playback was paused after inspection to avoid unnecessary load on the local PC. The browser's portable material is visibly simpler than the Blender procedural material; film-level surface shading remains a separate pass.

`octopus-motion-preview.mp4` is a 320 px Workbench video of the full sequence, sampled at 8 fps for a small review file. The source animation stays at 24 fps. This video demonstrates movement, not final lighting or surface quality.

Revision-13 file hashes (historical; superseded by camera revision 14):

- `codera-octopus-swim.blend`: 72,928,622 bytes; SHA-256 `db58c4cdd7dfdf33d675994dc076c954607785b5e8c19d356527d473c1b1001d`.
- `codera-octopus-swim.glb`: 22,976,320 bytes; SHA-256 `cec60b7c6f2019121b704c9b6871184b978ce9730603078648a82af0e2bbb792`.
- Final GLB header/size and both 12-second clips verified. Python scripts compile.

No website/sea modifications or GitHub push. Reef-contact motion is not yet implemented; no claim of collision-free motion for every future pose.

## Final delivery: revision 14

`scripts/frame-octopus-motion.py` centres the delivery camera over the combined projected bounds of 25 sampled poses. Previously one late pose extended slightly beyond the left frame edge. The new orthographic scale is 2.172072 m, with at least 6.52% margin at every sampled bounding box. Geometry and animation are unchanged from revision 13.

`octopus-motion-centered.png` is the inspected final Eevee render at frame 217. The small Workbench video retains the older revision-13 camera and is only a motion inspection aid. The interactive scene and current Blender/GLB files use the corrected camera.

Current files, size and SHA-256 verified after download:

- Blender: 72,928,622 bytes; `d597914220982c6909b13f9afa9dcd97370ed55b2e4aaa35cde475ea005be596`.
- GLB: 22,976,336 bytes; `5c59cf9fe1517cf9ee66734cde7aae28c032d40ac77abc0249226f287e84d193`.
