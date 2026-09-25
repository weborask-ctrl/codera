# Silver local refinement — 2026-09-24

Scope: Marcus requested smoother and sharper scroll media, subtle mouse depth,
consistent heading/copy alignment, Codera-shaped tinted portfolio frames and
optically centred “72”. Work only in the local preview; no merge or deployment.

Source: `assets/motion-tests/codera-metal/review-01/silver-camera-journey.mov`:
1920×1080, 24 fps, HEVC 10-bit 4:4:4. Higher native detail requires a better
source. Do not describe the interpolation/sharpening as native 4K or as new
captured detail.

Delivery candidate: offline optical-flow interpolation to 60 fps, mild unsharp
plus contrast-adaptive sharpening, H.264 1080p/60, short GOP, no B frames and
fast-start metadata. Trim unused handles: 2.583333 seconds in source equals
zero in delivery; deliver 11 seconds. Keep narrative timestamps in original
source coordinates. One native video decoder; no full decoded image bank.

Use `scripts/metal-smooth-media.py --ffmpeg PATH` to prepare media.
`--reuse-interpolated` reuses the expensive intermediate for export adjustments.
The intermediate in `.prototype-cache/silver-polish/` is not a website delivery asset.

The final camera wrapper is stationary: Marcus explicitly removed mouse-driven
depth before release. Frame requests are quantized to the delivery frame rate. Native scroll retains the
600-viewport-percent journey distance; response scrub is 0.55 seconds.

Portfolio frames use one neutral liquid-glass finish and the same asymmetric
silhouette. All four sides have equal padding; screenshots have matching
rounded inner corners. Functional links sit outside the glass frame. Dialogs
use the same neutral finish. Section headings share equal columns and identical
supporting-copy start positions. “72 hodín” is one optically centred inline group.
Headings are larger, especially the hero, and remain native DOM text sized
through font-size rather than scaled raster layers.

Validation: `scripts/metal-polish-check.mjs` checks layout, complete previews,
pointer behaviour and an A/B count of actually presented frames. Existing
`scripts/metal-check.mjs` covers video recovery, accessibility and interaction.
Browser emulation is not physical-device validation. Results are stored in
`test-results/silver-polish/`.

Measured local A/B in Edge, 1440×900, the same 1800px scroll over four seconds:
66 distinct presented frames with the 24 fps media; 96 with the 60 fps media
(45% increase). Mean seek completion: 13 ms versus 10 ms. This is a measured
local comparison, not a promise of 60 displayed fps on every device/network.
Final delivery is 33,549,435 bytes; the previous 24 fps file was 24,311,665 bytes.
The size increase is a deliberate local quality tradeoff and must be reviewed
before any later production release. Current work is not deployed.

Follow-up scheduling refinement, same 60 fps media and same local Edge scroll:
98 distinct presented frames before versus 162 after removing redundant RAF
waits from GSAP updates and seek completion. The p95 presentation gap fell from
66.9 ms to 33.6 ms. One outstanding seek remains enforced. Media bytes and
resolution are unchanged. Results: `test-results/silver-polish/scheduling-comparison.json`.
Final validation passed all 38 motion/interaction checks and layout assertions
at six viewport sizes, including equal glass padding and centred inline time.

Release authorized by Marcus on 2026-09-24, superseding the original local-only
scope. Both offers share five grid rows on desktop, including expanded details.
Mouse movement never transforms the film.
