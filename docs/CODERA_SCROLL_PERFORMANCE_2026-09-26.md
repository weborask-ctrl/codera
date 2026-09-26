# Scroll performance — 2026-09-26

Status: tested locally and explicitly approved for merge on 2026-09-26, limited to motion and bible documentation. Deployment must be verified after merge. The legal/footer drafts in this checkout predate this change and remain pending.

## Riešenie

The existing 1080p60 clip used 12-frame GOPs. Native `currentTime` seeking also made fresh network range requests during cold scrolling. In a local Edge test limited to 10 Mbit/s, 60 ms latency, the browser rendered its ordinary scroll at ~60 Hz but video frames arrived ~368 ms apart (median). This reproduces stuttering independently of overall computer speed.

Prepare the compressed clip completely before entering the long motion scene; seek a Blob URL with no media network dependency thereafter. Use 3-frame GOP delivery to reduce random-access decode cost. Preserve resolution, frame rate, film timing, CAS strength and CRF. Wait for actual video presentation before issuing another seek; update beat accessibility only on a beat change.

## Postup and measured alternatives

| Variant | Bytes | Warm frame interval median / p95 | Decode p95 |
| --- | ---: | --- | --- |
| Original, GOP 12 | 33,549,435 | 16.7 / 33.4 ms | 8 ms |
| Independent frames, GOP 1 | 62,578,998 | 16.7 / 16.9 ms | 1.4 ms |
| Selected GOP 3 + presentation scheduling | 50,378,423 | 16.7 / 16.9 ms | 2.5 ms |

All variants: 1920×1080, 60 fps, 11 seconds. Selected export comes from the existing interpolated master, not a second lossy encode of the web clip. Encoder settings: libx264 medium, yuv420p, CRF 15, GOP/keyint 3, no B frames, scene-cut disabled, faststart; CAS 0.55. Source capture was 1080p24; interpolation does not create native 60-fps capture or 4K detail.

Cold-network comparison uses the same forward/reverse 8-second trajectory plus 900 ms settling at 1440×900. Original: 24 presented frames, p95 interval 802.7 ms, p95 target/image gap 1.66 s. Final, **after preparation**: 454 presented frames, p95 interval 33.4 ms, p95 gap 0.0083 s. Final median frame interval 16.7 ms. This is one controlled local run, not a cross-device performance guarantee. Headless Edge on the available Windows machine; no physical Safari/iPhone certification.

Preparation time is outside those scroll measurements. About 50 MB must download before the long scene starts (roughly 40 seconds of payload transfer at 10 Mbit/s, faster on better connections/cache). The page is fully usable meanwhile: no full-screen loading gate, no scroll lock, no extended inert 700-svh poster. Loading progress uses the existing motion-control area. If the visitor reaches the work section first, preparation preserves that position and activates the story only after returning to the top. This behavior is intentional.

## Quality

Both exports compared against the same trimmed, CAS-processed interpolated master across 660 frames: original SSIM 0.987852, selected GOP 3 SSIM 0.988539. Original vs selected SSIM 0.990481. They are not pixel-identical; the new encoding preserves dimensions, frame count and visual treatment, and the objective comparison does not show an aggregate quality loss. Inspected the tunnel detail and rendered page screenshot; no added crop, blur or downscale. The generated source still has its original softness/motion blur.

## Vypracovanie

- `experiments/metal/main.mjs`: bounded full-download preparation, progress, compressed Blob source, no layout insertion after the visitor passes the intro, presentation-paced seeks, beat-change accessibility updates, retries and static fallback.
- `public/motion/metal/journey-scroll-1080.mp4`: selected 3-frame GOP export.
- `scripts/metal-smooth-media.py`: reproducible GOP settings for subsequent builds.
- `proxy.ts`: media CSP permits same-origin assets and Blob media; script/connect policies unchanged.
- `scripts/metal-check.mjs`: updated lifecycle assertions reflect prepared media. In particular, a distant forward/reverse seek succeeds with all subsequent MP4 network access blocked and only one media download.

The loader holds compressed chunks during preparation and a compressed Blob afterwards, plus the browser's normal decoder surfaces. It does not claim a precise total RAM budget; no hundreds-of-frames bitmap cache. The 180-second download deadline gives a retryable static fallback. Hidden-tab and late-loading paths remain usable. A real-device check on Marcus's target computer remains valuable before deployment.

## Validation

Production build and TypeScript passed. Targeted Biome passed. Browser suite passed: forward/reverse intermediate frames, fade cut coverage, full previews, pause without jump, 320px layout, touch and reduced-motion opt-in, no-JS, failed download retry, late-loading layout stability, hidden-tab behavior and absent/stalled frame callbacks. Additional malformed-media recovery is checked separately. No production changes were made.

Supporting local measurements are in `../silver-polish/benchmark-*.json` relative to this release checkout, with original/candidate media retained there for comparison. The reusable bible distinguishes this approved motion release from the September 24 baseline.
