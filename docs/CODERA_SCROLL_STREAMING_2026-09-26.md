**Historical delivery record:** current entry and prefetch rules are in [Fast entry](CODERA_FAST_ENTRY_2026-09-26.md). The approved high-detail payload remains unchanged.

# Progressive scroll delivery — 2026-09-26

## Motion delivery correction — 2026-09-26

**Rejected approach:** PR #114 downloaded the complete 50.4 MB clip before activating motion. Marcus reported an unacceptable wait. Do not restore this gate or describe post-download frame rates as the complete visitor experience.

The replacement uses Media Source Extensions with 220 independently decodable 50 ms fragments, remuxed from the approved H.264 clip without re-encoding. Resolution remains 1920×1080 at 60 fps. The encoded video SHA-256 matches the original exactly. The opening needs about 267 KB, not 50 MB. Fetch the current fragment first and a bounded neighbourhood in the direction of travel; idle visitors do not download the whole movie. Complete the small in-flight fragment rather than repeatedly cancelling it on wheel events. While missing data arrives, retain the nearest buffered image and synchronize captions with the image actually shown.

Browsers without compatible MSE and failed fragment loads use native progressive MP4, also without a full-download gate. Touch/reduced-motion remain opt-in; delayed initialization must not move a visitor already reading the portfolio. Preserve native scroll, the existing story/fade and no mouse parallax. The compressed media buffer is bounded by this finite 11-second clip; no decoded image bank.

Local cold-cache Edge test at 10 Mbit/s / 60 ms: startup 1.35 seconds and 266,588 bytes. An aggressive eight-second forward/reverse sweep on that slow connection presented 67 frames, p95 interval 284.5 ms, longest gap 334.5 ms. Fast local delivery: 404 presented frames, median 16.7 ms, p95 33.6 ms. These are measurements, not a universal 60 fps promise. On slow networks, a cold rapid sweep can still outrun available media. Do not solve that by secretly lowering resolution or gating the entire page.

Implementation: experiments/metal/stream.mjs and main.mjs; generation: scripts/metal-stream-media.mjs; checks: scripts/metal-stream-check.mjs and scripts/metal-check.mjs. See docs/CODERA_SCROLL_STREAMING_2026-09-26.md. This correction affects motion delivery only; legal/footer drafts remain excluded.

## Validation

The complete motion regression suite passes. Startup, idle transfer, cold distant seeks, both endpoints, reverse scroll, missing MSE and failed fragment fallback are covered by the dedicated stream check. All encoded video packets match SHA-256 f60088d67cffaea794ac679739be8947b201737c39a7cbd6101b3de2b16501bb after remux. No image resizing, recompression or detail generation is involved. MSE model: https://developer.mozilla.org/en-US/docs/Web/API/SourceBuffer/appendBuffer
