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
