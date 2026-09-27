**REJECTED BY USER FOR SEVERE STUTTERING.** Superseded by [Motion stability correction](CODERA_MOTION_STABILITY_2026-09-26.md). Fast startup did not make continuous cold scrolling acceptable.

# Short prepared entry with full background prefetch — 2026-09-26

## Riešenie

Marcus rejected the 71.5-second measured live full-download gate and authorized a short prepared opening with background loading, preserving the current sharp video. This supersedes the full-film-before-reveal requirement in PRs #117/#119. It does not authorize reducing resolution or compression fidelity.

Oryzo was inspected at https://oryzo.ai/ in Edge at 1440×900 with 10 Mbit/s/60 ms emulation. Its resource snapshot showed six canvases, model `.buf` files and WebP textures; the two DOM videos belonged to the wearable gallery. It is not an equivalent 50 MB scroll-video implementation. The inspection was a resource snapshot, not a measured Oryzo time-to-interactive or a claim of equal architectures.

## Postup

Reuse the existing 220 × 50 ms H.264 fragments, with the same 1920×1080/60 frame payload as the approved 50 MB film. Prepare eight opening fragments (0.4 seconds of video) before reveal; the source opening maps this to initial scroll travel. Continue prefetching the entire finite film in six concurrent workers, including while the visitor reads the opening. Prioritize the latest requested position and adjacent frames. Append to MediaSource serially; do not cancel requests on every wheel event or keep decoded image banks.

This differs from rejected PR #115, which fetched one request at a time and stopped after a small neighbourhood. The new engine keeps fetching the entire film and stores fragments in versioned Cache Storage for repeat visits. Successful downloads remain usable if cache writes fail.

## Vypracovanie and validation

- Encoded H.264 payload SHA-256: `f60088d67cffaea794ac679739be8947b201737c39a7cbd6101b3de2b16501bb`, identical for the original MP4 and all fragments concatenated by payload. `node scripts/metal-stream-integrity.mjs` verifies this. No resize, transcode or quality reduction.
- Local Edge cold entry at 10 Mbit/s/60 ms: 3.516–3.661 seconds, 2,255,236 bytes received, 4% buffered at activation. Previous full gate at the same profile: 42.747 seconds. Cached top-of-page entry: 0.628 seconds.
- Immediate distant jumps at that network profile settled in 1.854–2.389 seconds. While a requested region is missing, keep the actual last sharp image and its matching text; never seek into unbuffered data or hop between buffer edges. Native scroll remains free.
- An intentionally extreme eight-second cold full forward/reverse sweep can outrun the connection: a ~4.4-second image hold occurred. This is a real limitation, not 60-fps cold playback. Do not hide it by quoting only warm measurements or promise zero waits on arbitrary networks.
- After background preparation: 456 presented frames in the existing eight-second forward/reverse benchmark plus settling, median 16.7 ms / p95 17.2 ms frame interval, p95 decode 4.9 ms. Isolated scheduling pauses occurred; this is one local Windows/Edge measurement, not universal certification.
- Completed-buffer forward/reverse/endpoints passed with network disconnected. Cached entry, missing MSE, failed segments, static skip, failed media, reduced motion, touch and no-JS passed. Layout and body content are unchanged.

The cover now offers static entry at three seconds and fails open after twelve visible seconds. Hidden-tab time does not consume the entry watchdog. Unsupported MSE or failed fragments release the cover immediately and retain the existing high-quality full-Blob path in the background. Late readiness must preserve the position of a visitor already in the portfolio. Manual pause/skip wins over later media events.

## Current implementation and rules

Runtime: `experiments/metal/stream-ahead.mjs`, `main.mjs`, `entry.js`; `scripts/silver-assets.mjs` emits the new module. Tests: `scripts/metal-ahead-check.mjs`, `metal-stream-integrity.mjs`, `metal-check.mjs`. The old entry/stream test commands delegate to the current suite. The old `stream.mjs` is historical and not loaded.

Do not bring back a full-50-MB blocking cover or the demand-only serial fragment loader. Measure initial entry, a cold distant jump, a rapid cold sweep, cached entry and warm forward/reverse presentation separately. Faster entry does not remove bandwidth limits; any claim about cold smoothness must include the test trajectory and network profile. Preserve current source fidelity, captions tied to decoded frames, one outstanding seek and no pointer parallax.
