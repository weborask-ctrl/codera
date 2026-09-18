# Current ocean study - photographic-detail pass

**Approved baseline:** Marcus accepted commit `56c756b` as the visual foundation. Preserve it while developing further layers. His lower-powered PC must not set the project's maximum visual quality; see [the recorded decision](OCEAN_APPROVED_BASELINE.md).

Open http://127.0.0.1:4317/ocean.html with the existing preview server.
This is a live procedural environment, not the reference PNG displayed behind a canvas.

## Current implementation
- `experiments/jellyfish/ocean-shaders.mjs`: shared 22-band asymmetric wave spectrum, analytic gradients and curvature, refraction/Fresnel, water absorption and a 36-sample light volume.
- A 1024-square RGBA16F GPU map is recomputed on each rendered frame. Its height, slopes and approximate thin-lens focusing are reused by the surface and rays. Wave vectors are periodic over 64 world units, preventing a hard wrapping seam. Two extra sampled capillary scales restore fine surface detail; mipmaps reduce distant aliasing.
- Float-target support is checked. Devices without it use the slower inline procedural path.
- Surface sunlight and underwater propagation share the same sun direction. Approximate focusing uses a nominal-depth ray-density Jacobian; this is NOT a fluid simulation or a complete photon/caustics solver.
- A separate half-width/half-height linear HDR volume target computes soft underwater light; the surface stays at the full drawing-buffer resolution. Shader modes are specialized at compilation so unused branches are eliminated.
- 760 sparse world-space particles, camera parallax, depth control, pause, reduced-motion support and hidden-tab suspension.
- Full HD is now the default pixel budget. GPU targets/resources are disposed on non-persisted page exit. Controls can be hidden, and the decorative study label was removed.
- Far-surface contribution fades smoothly to avoid a sharp horizon cutoff.

## Visual references
- Approved generated atmosphere: [reference PNG](design/ocean/approved-atmosphere-reference.png), generated using built-in imagegen earlier in this thread, now preserved in the repo. It is NOT loaded by the scene.
- Inspected real-water photograph: [Monterey Boats](https://www.montereyboats.com/zupload/library/985/-2968-1000x700-0.jpg?ztv=20170627113049). Observations: stronger dark/light surface contrast, fragmented bright sky/sun transmission, and locally concentrated light. External photo was not copied into the project or used as a texture.
- Implementation API reference: [Three.js RenderTarget](https://threejs.org/docs/pages/RenderTarget.html).

## Validation and remaining gap
- Inspected live at an actual 1920 x 1080 drawing buffer, at depth 3 and 12, and during camera travel.
- Before GPU-map optimization: about 7 submitted fps at Full HD. After shared wave map: about 19-20 submitted fps. After separate half-resolution lighting with compile-time specialized shaders: observed 30 submitted fps at Full HD. These are UI-reported observations, not GPU completion timings or a sustained benchmark. The final short observation reaches the 30 fps cap; this is not a sustained frame-pacing certification.
- Pause checked by reading the DOM frame counter twice: unchanged at 364. Resume, travel and control visibility tested.
- Final shader visibly compiled and `data-ready=true`, `data-wave-map=true`, error element empty. An intermediate missing-control exception and earlier GLSL reserved-word error were fixed; historical browser logs can still include them.
- JS syntax checks passed for both modules. Original site is not integrated with this background yet.

The reference match is **not complete**. Current limits:
1. Sky/transmission patches still look flatter than photography at some angles. Secondary water reflections and a better rough-surface optical response are the next material work.
2. Rays have more structure, but focusing is a nominal-depth approximation; reference-quality caustics and scattering are not claimed.
3. The final Full HD check reached 30 submitted fps after separating volume resolution from surface resolution. Sustained timings, GPU completion and stability still need profiling.
4. No physical-phone, 4K, long-duration GPU-memory or temporal-shimmer certification yet.

The sections below preserve earlier iteration history; their counts/defaults are superseded by the current summary above.

---

# Live ocean — iteration 1

## Intent and preview
Marcus approved developing a live, colorful, cinematic underwater environment, not a photograph placed behind the website. This pass isolates the ocean before integrating the jellyfish or changing the main website. Run the existing `scripts/jellyfish-preview.mjs` and open **http://127.0.0.1:4317/ocean.html**.

## Implemented
- World-space procedural wave heightfield intersected by camera rays; multi-scale moving normals.
- Approximate water-to-air refraction, Fresnel reflection and total internal reflection.
- Distance-dependent RGB absorption and colored in-scattering.
- 18-sample procedural light shafts; these are an artistic approximation, NOT physically traced light focused through the waves.
- 420 actual world-space particle points with camera parallax.
- Depth slider, camera passage, pause, reduced-motion initial state, hidden-tab sleep and resolution selection. No photos, videos or image textures.
- Default 850,000 pixel ceiling; optional Full HD and up to 4K drawing buffer. Quality selects resolution, not a guarantee of photographic realism or frame rate.

## Verified here
JavaScript syntax and HTTP serving passed. Live Codex browser displayed the scene and camera-travel control changed state. Observed roughly 25–27 submitted fps at 740 × 646. This is a small-window observation, not a full-screen/GPU benchmark. Shader compiled visibly without the error message. Full HD, 4K, mobile hardware and sustained resource behavior remain unverified.

## Visual assessment and remaining work
The first observed render is colorful and live, but DOES NOT match the photographic reference yet. Wave patterns remain too regular, highlights too broad/flat, and the ray field too stylized. Fine normal variation was subsequently increased; final appearance needs another review.

Priority order:
1. Surface: improve irregular wave spectrum, reflected/refracted sky detail and stable antialiasing. Acceptance: no repeated sine bands or large flat white shapes during camera travel.
2. Lighting: couple shaft intensity to surface focusing, soften integration banding and introduce broad believable directional sunlight. Current shafts are independent artistic modulation.
3. Depth: calibrate cyan-to-cobalt absorption across 2–16 m; judge at desktop aspect ratio alongside the approved reference. Keep water visibly colored, avoid a black void.
4. Sharpness: compare native 1080p against budget rendering; tune fine detail against temporal shimmer. Atmospheric distance softness is intentional; low-resolution pixel softness is not.
5. Performance: measure sustained full-screen frame pacing and browser/GPU memory, add adaptive quality if needed. Do not claim 4K performance based on the selector.
6. Integration: only after background approval, bring in the jellyfish and synchronize the camera/world coordinates with the existing scroll choreography. Preserve ordinary portfolio scrolling and pause rendering there.

Implementation is an economical raycast heightfield plus particle geometry, not a fluid simulation or a complete physically based ocean renderer. No final-quality claim, Git push or deployment is implied.


## Iteration 2 - surface and light
- Replaced the five crossed sine bands with a 12-band directional spectrum with non-matching frequencies and directions. Height, analytic slope and curvature share the same wave definition; surface intersection uses six coarse bands.
- Replaced the approximate critical-angle blend with dielectric Fresnel reflectance. Sky radiance now has directional solar glow and a small sun disk rather than one flat bright color.
- Added screen-derivative filtering of fine wave normals to reduce distant shimmer.
- Light integration projects samples toward the surface and modulates focusing from its curvature. It remains approximate: not a refracted ray-density solution, and not photon-traced caustics.
- Added spatial sampling jitter to reduce fixed integration bands. Water fill was reduced to retain more contrast.
- Live browser: shader compiled after fixing a reserved GLSL identifier; inspected at two camera positions, tested travel and pause controls. Observed 27-28 submitted fps at 740 - 646. JavaScript syntax check passed. No full-screen or physical-phone performance claim.
- Visual verdict: less regular surface and more broken highlights, but still visibly synthetic. Large pale sky patches remain at some angles, distant fine waves can read as stripes, and sunlight is too diffuse. Next work should target those three issues; this is not reference-quality completion.


## Follow-up - irregular surface and directional sunlight
- Bent each wave phase across its direction and included the bend in analytic slope/curvature. Changed spectral spacing to further break repeating bands.
- Reduced broad sky radiance and reserved bright light for directional solar glow and smaller surface highlights.
- Narrowed the underwater light footprint and strengthened curvature-driven focusing. Increased integration to 28 samples and reduced sample jitter after live inspection revealed a distracting grain pattern.
- Reset the FPS measurement window on pause/resume so a long pause is not reported as poor rendering performance.
- Verified live: successful shader compile, no captured console errors, camera-travel control, depth slider at 4 and 10, screenshots at both depths. Observed 28-29 submitted fps in the 740 - 646 preview, not a full-screen benchmark. JavaScript syntax and whitespace checks passed.
- Remaining: pale patches still appear at some camera angles, waves retain a procedural character, light shafts need a more physically convincing focusing solution, and full-resolution temporal stability is unmeasured. The change improves directionality but is not photographic sign-off.
