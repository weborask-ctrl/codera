# Codera octopus — Blender deformation study

Created 2026-09-19 in Blender 5.2 through cloud Blender execution. The local PC did not run the modelling or render workload. Nothing has been integrated into the live site or pushed to GitHub.

## Reproducible source

- `scripts/build-octopus-blender.py`: authored rest curves, arm surfaces, paired suckers, mantle/head, eyes, membranes, initial deformation chains and studio setup.
- `scripts/refine-octopus-blender.py`: continuous skin, transferred weights, smaller eyes, independent siphon/gaze controls and material refinement.
- `scripts/check-octopus-blender.py`: temporary bend/ventilation inspection. Do not save the tested pose over the neutral master.
- `scripts/blend-octopus-crown.py`: shared fleshy crown and local smoothing of the head/arm transition.
- `scripts/check-octopus-crown-weights.py`: rebind outer arms independently of the crown and check weight sums.
- `scripts/check-octopus-crown-pose.py`: temporary proximal bend and three-quarter render.
- `scripts/create-octopus-blender.py`: local command-line wrapper to run all modelling passes and save the final `.blend`, `.glb` and render; requires Blender 5.2.
- `docs/OCTOPUS_MOTION_RESEARCH.md`: sourced research, observations, proposed direction matrix, unresolved reference work.

In a fresh Blender file execute build, refine, blend-crown and check-crown-weights in that order, then save; or run `blender --background --python scripts/create-octopus-blender.py -- --output assets/blender/octopus` from the repository root. Scripts are the source of the procedural geometry; no downloaded animal mesh was used. New mathematical geometry is based on the project's existing authored arm paths and Marcus's frontal composition reference.

## Scope

This is an editable modelling and deformation foundation, **not a finished photoreal character or finished animation rig**. Each of the eight arms has 24 deform bones. The mantle has a ventilation shape key. Suckers share the adjacent arm weights. Gaze and siphon have independent bones. No locomotion clips have been authored yet.

The final surface is voxel-unified; it does not retain the initial quad loops. The build script preserves the initial surface construction for future retopology. Rest pose arm IDs are spatial proxy indices, not a verified biological L1–R4 mapping.

## Known limitations before production motion

- Full-range bend, twist, stretch and contact tests remain necessary. A mild test does not validate every possible pose.
- No spline/IK animator controls or automatic contact solver yet; direct bone posing is possible.
- Longitudinal stretch needs explicit inverse-square-root cross-section compensation. Dual-quaternion skinning alone does not simulate a muscular hydrostat.
- Tight curls, thin tips, web intersections and the mouth underside need a dedicated anatomy/sculpt pass.
- Large near-camera suckers still need surface refinement and independent contact deformation.
- Procedural Blender skin detail is not baked into the portable GLB. Area lights and world lighting are Blender studio features; the web scene must supply its own lighting.
- The GLB is an interchange preview, not an approved web replacement. Triangle/joint counts, material bake and actual browser FPS need a separate integration pass.

Cloud project: https://higgsfield.ai/3d-jutsu/7a20cd33-574f-4a42-9aa6-e1100fbcdad1

Only a downloaded, verified final revision should be used. Intermediate renders are development evidence, not approved design.

## Downloaded master

Committed cloud revision **6**, operation `surface-weight-transfer-06`. Marcus requested a visibly smooth connection from head to arms; the shared crown volume removes the cut-off cylinder appearance of revision 3. The final arm weights are interpolated from sampled arm surfaces rather than their centre lines, to reduce incorrect ownership at overlaps.

- `codera-octopus-rig.blend`: 47,562,107 bytes, Blender source with editable materials, weights and 197 bones.
- `codera-octopus-rig.glb`: 22,066,416 bytes, 16 meshes, 599,368 triangles. This is too dense to treat as the approved low-budget web asset.
- `octopus-crown-front.png`: actual Eevee render after the geometric crown edit (revision 4); revisions 5 and 6 change weights only and preserve this rest shape.
- Older renders remain as iteration evidence. This static master has no authored swimming or crawling clips; the separate revision-9 swimming study is documented in [SWIM_STUDY.md](SWIM_STUDY.md).

SHA-256:

```text
blend ba29cdf4776cda0cace1f2660e2f683cec32f75545df042a2e815899afe20e38
glb   576ed763ae3bbf934c623510dbc5915e94e81b4a593c19d09ae2e14ef23b2b35
```

## Verification

Current crown pass: 259,518 skin vertices; 160,263 outer-arm vertices rebound; no unweighted vertices and all weight sums normalized. Frontal crown render inspected. Historical revision-3 checks below are retained as development evidence and do not establish full-range validation of the current rig.

`verify-crown-pose-06` passed and its three-quarter render was inspected. The proximal arm bend retains the head/crown connection; the conspicuous stretched flap seen with nearest-centreline binding is reduced after surface-based transfer. All evaluated coordinates are finite. The saved master remains in the rest pose. Thin inter-arm webbing still needs full-range contact/pose validation before production animation.

Revision 3 numerical deformation query `verify-numerical-03` passed:

- 275,682 skin vertices, **one connected skin component**.
- No unweighted skin vertices; all skin weight sums within 0.0001 of one.
- Mild arm-03 bend and mantle shape-key test moved 56,322 vertices; maximum displacement 0.071 m; all coordinates finite.
- The test was a temporary query and did not change the saved rest pose.
- A combined two-render test exceeded the cloud's 300-second execution limit. Numerical verification was then run independently; the visual check was reduced to one 480 px side render.
- Static front render inspected; no claim of photoreal finish or full-range rig validation.
- `verify-side-render-03` succeeded. Its 480 px side render was inspected: the tested arm stays continuous and its sucker rows follow it. The shoulder transitions and exposed eye shapes still look stylized and need sculpt refinement; this is not final visual approval.
