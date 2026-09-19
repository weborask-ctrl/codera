# Codera octopus — Blender deformation study

Created 2026-09-19 in Blender 5.2 through cloud Blender execution. The local PC did not run the modelling or render workload. Nothing has been integrated into the live site or pushed to GitHub.

## Reproducible source

- `scripts/build-octopus-blender.py`: authored rest curves, arm surfaces, paired suckers, mantle/head, eyes, membranes, initial deformation chains and studio setup.
- `scripts/refine-octopus-blender.py`: continuous skin, transferred weights, smaller eyes, independent siphon/gaze controls and material refinement.
- `scripts/check-octopus-blender.py`: temporary bend/ventilation inspection. Do not save the tested pose over the neutral master.
- `scripts/create-octopus-blender.py`: local command-line wrapper to run both passes and save the final `.blend`, `.glb` and render; requires Blender 5.2.
- `docs/OCTOPUS_MOTION_RESEARCH.md`: sourced research, observations, proposed direction matrix, unresolved reference work.

In a fresh Blender file execute build, then refine and save, or run `blender --background --python scripts/create-octopus-blender.py -- --output assets/blender/octopus` from the repository root. Cloud execution skips the build script's initial render when rebuilding both passes together. Scripts are the source of the procedural geometry; no downloaded animal mesh was used. New mathematical geometry is based on the project's existing authored arm paths and Marcus's frontal composition reference.

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

Committed cloud revision **3**, operation `closed-volumes-rebuild-03`.

- `codera-octopus-rig.blend`: 49,761,109 bytes, Blender source with editable materials, weights and 197 bones.
- `codera-octopus-rig.glb`: 23,225,008 bytes, 16 meshes, one skin, 197 joints, 631,724 triangles. This is too dense to treat as the approved low-budget web asset.
- `octopus-refined-front.png`: actual Eevee render of revision 3.
- The cloud exporter emitted two animation containers covering the rest frame range. All 592 output samplers were checked and are constant. These are not authored swimming or crawling clips.

SHA-256:

```text
blend 4d00ce1324ba216a2d0995a39faa9b973e192a351594726dc4d71c4cfc2ae9a8
glb   4be8122ae8724b1c3756f2802b6f4d2ebc5c0bd227d1237ea008368217b203bc
```

## Verification

Revision 3 numerical deformation query `verify-numerical-03` passed:

- 275,682 skin vertices, **one connected skin component**.
- No unweighted skin vertices; all skin weight sums within 0.0001 of one.
- Mild arm-03 bend and mantle shape-key test moved 56,322 vertices; maximum displacement 0.071 m; all coordinates finite.
- The test was a temporary query and did not change the saved rest pose.
- A combined two-render test exceeded the cloud's 300-second execution limit. Numerical verification was then run independently; the visual check was reduced to one 480 px side render.
- Static front render inspected; no claim of photoreal finish or full-range rig validation.
- `verify-side-render-03` succeeded. Its 480 px side render was inspected: the tested arm stays continuous and its sucker rows follow it. The shoulder transitions and exposed eye shapes still look stylized and need sculpt refinement; this is not final visual approval.
