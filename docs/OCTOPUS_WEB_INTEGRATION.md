# Blender octopus in the underwater prototype

19 September 2026. Local experiment only; no production deploy or GitHub push.

## Open and reproduce

Run `node scripts/jellyfish-preview.mjs`, then open `http://127.0.0.1:4317/dive.html`.
The server downloads only allowlisted Three.js files from the locked npm tarball, verifies the package SHA-512, and caches them in `.prototype-cache`. It serves the existing revision-14 `assets/blender/octopus/codera-octopus-swim.glb` at the single explicit `/octopus-swim.glb` endpoint; Blender sources are not exposed.

## Integration

- `experiments/jellyfish/octopus-blender.mjs` imports the actual skinned Blender character and plays both skeletal and mantle clips through an AnimationMixer.
- Studio cameras/lights remain out of the web scene. Blender demonstration root tracks are excluded so the existing reversible scroll path owns world placement and heading.
- The skeleton retains its stroke, delayed arm motion, mantle ventilation, eyes and siphon animation. Near the den, bone rotations blend continuously toward a cached folded pose. This uses quaternion blending rather than interpolating cyclic animation times, which would jump at a loop boundary.
- The accepted ocean shader is unchanged. The character receives separate underwater lights, distance fog and a portable procedural copper skin material. This approximates the source material; it is not a baked match to the Blender render.
- The reef depth buffer occludes the character at the end of the existing path. No opacity fade or shrink-to-zero is used. Accurate sucker/rock contact and a purpose-built reef-entry clip remain future work.
- Mobile placement and scale were adjusted so the hero's arms stay inside a 390 px viewport. Existing typography, ordinary portfolio scrolling and standalone look-development pages are preserved.

## Verification

- Live in-app browser: Blender asset loaded; no console warnings/errors after complete dependency setup.
- Hero, descent (progress ~0.43), den entry (~0.85), hidden endpoint and ordinary portfolio section visually checked. Return to hero restores the same scroll-controlled world placement.
- Observed submitted-frame rate: approximately 28–30 fps at the working setting (555 × 484 buffer in the default pane; 292 × 633 in a 390 × 844 viewport). This is not GPU completion timing or a high-resolution performance guarantee.
- Mobile viewport: no horizontal document overflow and no clipped hero arm tips after adjustment.
- Pause: rendered-frame counter stayed exactly 887 across separate observations, then resumed successfully.
- `node scripts/jellyfish-check.mjs` passed its existing journey/content/server checks. Additional HTTP checks passed for the GLB, loader and both utility dependencies; Blender source and traversal paths remained inaccessible.
- Modified modules passed Node syntax checks and `git diff --check`.
- One preview server left running on 4317; temporary 4318 server stopped. Server RAM observed at 73 MB, about 1.6 GB free system RAM.

## Remaining limits

The current master GLB is 22,976,336 bytes and roughly 599k triangles. It works in this measured low-resolution prototype, but a production LOD, compressed transfer and material bake are still needed. Reduced-motion code keeps a fixed pose and pause/hidden-tab handling is retained; OS-level reduced-motion emulation was not separately exercised in this session. Final reef contact and high-resolution/mobile-device performance are not validated.
