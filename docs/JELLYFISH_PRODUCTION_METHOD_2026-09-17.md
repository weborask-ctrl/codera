# Jellyfish production method — 2026-09-17

## Decision prepared by this pass

Keep the lightweight real-time prototype as the camera and interaction reference. Build one authored jellyfish master with one continuous camera path before choosing the final delivery format. Compare a constrained real-time export with a prerender of the **same first passage**, then choose using the home PC and a physical phone. This is a proposed production method; no final rig, photographic animation, 4K master or media benchmark was produced in this pass.

Visual sources: the approved `docs/design/jellyfish-study-2026-09-16/00-hero.png`, `CODERA_DESIGN_REFERENCES/records/activetheory.md` (one continuous world) and `exoape.md` (legible content and negative space). Marcus's current typography/layout constraints override older reference notes. Existing HTML positions and section dimensions remain the reference, not generated section screenshots.

## Camera reference now available

`experiments/jellyfish/choreography.mjs` contains the authored world coordinates and `sampleFrame(at, out = {})`. The sampler is pure; a single GSAP playhead supplies time. Cubic interpolation preserves the waypoints, prevents individual channels overshooting and carries velocity through travelling waypoints. Deliberate stops have zero tangents.

| Timeline position | Spatial purpose |
| --- | --- |
| 0 | Established hero; original camera and composition |
| 0.5 → 1.05 | Approach the same animal; increasing scale |
| 1.35 | Oblique pass beside the outer bell |
| 1.75 → 2.15 | Retreat into the dark portfolio handoff |
| 2.15 | All five projects scroll normally; world time and rendering pause |
| 2.7 → 4.25 | Mineral passage and a second close approach |
| 5.2 → 5.8 | Wide composition; services reading hold |
| 6.65 → 7.1 | Ascent/top view; process reading hold |
| 8 | Return to the original profile for contact |

These numbers are normalized journey coordinates, **not the prescribed duration of a film**. Body breathing still uses the existing GSAP render clock; deterministic camera reversal does not claim pixel-identical organism breathing at different wall-clock times.

The procedural material now uses restrained ivory/pearl light, a broad highlight, outward bell winding and reduced subpixel vein detail. It remains a transparent approximation: no true subsurface scattering, refraction or cinematic simulation. Geometry, resolution ceilings and 30 fps cap are unchanged.

## Two delivery candidates

| Candidate | Advantage for this journey | Work/risk to measure |
| --- | --- | --- |
| Authored GLB with baked deformation | Independent camera, responsive framing and absolute pose seeking | Transparent layer cost, rig/texture memory, likeness to approved hero |
| Prerendered segment from the same master | Rich offline lighting and material detail | Seek latency in both directions, decode memory, downloads, separate portrait framing |

glTF supports joint skinning and morph-target animation. That permits baking bell contraction and controlled trailing motion before export; it does not make the original DCC material automatically portable. [Khronos glTF 2.0](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#animations)

For the real-time candidate, load with `GLTFLoader.loadAsync(url)`, activate the intended clip and sample it with `AnimationMixer.setTime(seconds)` under the existing GSAP clock. Keep `mixer.timeScale = 1`: it scales the argument to `setTime`. Do not add an independently accumulating `mixer.update(delta)` loop for scroll choreography. [Three GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html), [Three AnimationMixer](https://threejs.org/docs/pages/AnimationMixer.html)

For video, changing `video.currentTime` requests a seek; reading it is not evidence that the requested frame was presented. Feature-detect `requestVideoFrameCallback` and log its `mediaTime` against the requested scroll time. Coalesce stale requests during fast reversal; retain the last decoded frame while the latest request completes. [Media seeking](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/currentTime), [Presented-frame callbacks](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/requestVideoFrameCallback)

If ordinary video seeking cannot pass the first-segment gate, evaluate a bounded WebCodecs decode window. Check `VideoDecoder.isConfigSupported`, cap queued work with `decodeQueueSize`, and call `VideoFrame.close()` when a frame is evicted. Unsupported configurations retain a static layout. This requires container demuxing and keyframe management; it is an additional engineering choice, not a free performance fix. [W3C WebCodecs](https://www.w3.org/TR/webcodecs/)

## First production segment — concrete handoff

1. Author one recognizable organism from the approved hero: stable bell silhouette, pearl material, inner ruffled arms and long fine trailing strands. Lock its identity in front, side and top stills. Export a compact rigged candidate and keep the editable source master.
2. Transfer the 0 → 2.15 camera/target path and organism transforms above. Author a 6–8 second evaluation shot, then remap it to scroll. Produce desktop and portrait compositions against the existing DOM safe areas. No text or project panels are baked into media.
3. Render only this segment first: 1080p desktop and a portrait rendition. Compare short keyframe intervals (for example 1, 6 and 12 frames at 30 fps); record encoded bytes and measured seek latency. Render 4K only if the lower-resolution candidate passes and the visible gain justifies its cost.
4. Use the same forward/reverse scroll trace for both candidates, including abrupt direction changes and direct jumps. Measure requested-to-presented latency, visible missed frames, peak browser memory, load bytes and render/decode work during portfolio and hidden-tab holds. CPU submission time alone does not prove GPU speed.
5. On the home PC, start with the existing 850,000-pixel/DPR-1/30-fps budget. Proposed acceptance targets: no loss of readable content, zero background work during the portfolio/hidden state, no persistent memory growth after five cycles, and p95 requested-to-presented latency under 100 ms. These are targets to validate, not achieved measurements. A physical phone remains a separate gate.

Keep decoded images bounded. Arithmetic for one **RGBA8 copy**, excluding browser/decoder/GPU overhead:

| Resolution | One frame | 180 resident frames | 12-frame window |
| --- | --- | --- | --- |
| 1920 × 1080 | 7.91 MiB | 1.39 GiB | 94.92 MiB |
| 3840 × 2160 | 31.64 MiB | 5.56 GiB | 379.69 MiB |

Calculated as width × height × 4 bytes. Compressed network size is not resident decoded memory. Actual video decoder storage may use another pixel format; measure it separately. Do not preload a whole 4K image sequence on the 8 GB machine.

## What can continue at home

Run `node scripts/jellyfish-preview.mjs` with the existing small dependency cache; full Next installation/build is unnecessary. Review camera pace and the oblique close pass, then decide whether the approved hero's anatomical and material character is preserved in the future master. Business copy and final typography/layout decisions remain light work. Asset authoring, offline rendering and comparative decode measurements belong on the workstation.

The current pass validates camera mathematics separately from the release gates: 8,001 sampled poses stayed finite, minimum camera-to-bell-origin distance was 2.230 world units, and minimum camera-to-look-target distance was 2.264. Those distances are not full surface/tentacle collision certification. The accompanying handoff records browser screenshots, performance results and LOCAL/CI status; final material quality and real-device performance remain unvalidated.
