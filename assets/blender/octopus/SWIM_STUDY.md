# First swim cycle

19 September 2026. Work in progress on the accepted crown geometry.

`scripts/animate-octopus-swim.py` adds a three-second in-place cycle in Blender 5.2. The original static master remains in `codera-octopus-rig.blend`; the animation is saved separately as `codera-octopus-swim.blend` and `.glb`.

## Authored motion

- 24 fps, frames 1–73; the last frame duplicates the first for a periodic seam.
- Recovery/opening: 36 frames (1.5 seconds).
- Power/closing: 24 frames (1 second).
- Coast: 12 frames (0.5 seconds).
- Eight arm chains converge toward a streaming direction with delayed distal response. Small differences between arms preserve a common propulsion phase.
- Mantle shape and follow-through animate independently of the arm rotations.
- No scale animation on arms; this test focuses on bending, twist and timing.

The timing ratio follows the reference phase breakdown in `docs/OCTOPUS_MOTION_RESEARCH.md`, but absolute duration and pose amplitudes are artistic choices for this larger character. This is not motion capture or a fluid simulation.

## Scope and verification

This is an in-place animation study. Travel paths, turns, reef contacts and entering the den are later layers. The existing website and approved sea have not been changed. The high-detail interchange model is not yet optimized for the weaker PC's real-time web budget.

Animation starts from inspected cloud revision 8, which included newer scene edits than the locally downloaded revision 6; the scene was not rebuilt over those changes. Existing object transforms, lights and materials were preserved.

## Delivered revision 9

Operation `first-swim-cycle-09` succeeded. Query `verify-swim-power-09` sampled six poses and rendered frame 61 in Eevee at 480 px. All bone matrices at frame 73 exactly match frame 1 (maximum difference 0). The rendered closed pose keeps the crown connected, but thin stretched inter-arm surfaces remain visible and need weight/sculpt refinement. This is a first motion study, not final anatomical or cinematic approval.

The GLB header and byte length were checked: two animation clips, each with 73 samples over 0–3 seconds. `OCTOPUS_RIG` contains skeletal motion; `Octopus | continuous deforming skin` contains mantle morph weights. A viewer/integration must play both concurrently for the complete effect; selecting only the rig clip still shows the swimming arms. Browser FPS and simultaneous clip playback have not been verified.

- `codera-octopus-swim.blend`: 51,890,859 bytes; SHA-256 `bb143ced28694b7c9c13aa8375106df8ddeb3d9def46041d7caec422016c52f4`.
- `codera-octopus-swim.glb`: 22,291,404 bytes; SHA-256 `87120c0714b6d06f28544f513413717b2f5f1fbe49f02f0ae9add6737c5d7454`.
- `octopus-swim-power.png`: actual cloud render of the closing pose, visually inspected.

No website integration or GitHub push performed.

## Refinement: revision 10

`scripts/refine-octopus-swim.py` preserves the first actions inside the Blender file and creates Swim II actions. It repairs cross-arm influences on 2,613 outer skin vertices with a smooth transition outside the crown. Closing strength is reduced from 0.79 to 0.70, proximal influence is gentler, the streaming directions spread further apart and distal delay increases from 0.055 to 0.085 cycles. Twist amplitude is slightly reduced.

`verify-refined-swim-10` checked frames 1, 19, 37, 49, 61 and 73: all evaluated skin coordinates finite, weights normalized, endpoint bone matrix difference zero. The actual Eevee closing-pose render was inspected. Arms spread more clearly and the large stretched patches are reduced, but a thin residual strip at an arm overlap remains. Full animation playback/contact validation remains outstanding; this is not a claim that the fused crossing topology has been completely repaired.

GLB still contains two 3-second clips (skeletal and mantle morph). Both should run together. Dense geometry and procedural material portability limitations remain unchanged.

Revision 9 hashes above are historical; current files are updated with the refined study. Previous files remain recoverable from local commit `221ae71`.

### Current downloaded files: revision 11

Revision 11 changes only the delivery camera to an orthographic 2.8 m framing for the wider silhouette; the revision-10 geometry and motion remain identical.

- Blender: 56,202,967 bytes; SHA-256 `14410fdaabd41efc95e3a1d8b8e47347375a320af2da1504b1378eb67fc895b8`.
- GLB: 22,293,524 bytes; SHA-256 `7293bbfca3c31c7646fe0d416f6f6e70c264c361e544881420d48f45cabfad4c`.
- GLB byte length/header verified, 591 rig channels plus one mantle morph channel.
- `render-delivery-swim-11`: 400 px Eevee render inspected at frame 61; full silhouette fits the delivery camera. Thin overlap strip remains visible and is not considered fixed.
