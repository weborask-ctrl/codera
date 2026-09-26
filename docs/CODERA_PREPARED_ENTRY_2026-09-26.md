**Historical delivery record:** current entry and prefetch rules are in [Fast entry](CODERA_FAST_ENTRY_2026-09-26.md). The approved high-detail payload remains unchanged.

# Prepared Codera entry — 2026-09-26

**Quality settings and timeouts superseded:** see [Motion detail correction](CODERA_MOTION_DETAIL_2026-09-26.md). The prepared-entry architecture below remains current; the 25 MB encode and 30-second limit are historical.

## Prepared entry and scroll video — original decision, 2026-09-26

Marcus requested restoring fully prepared playback, with video preparation BEFORE revealing the website. This explicitly supersedes the fragmented streaming of PR #115 and the previous blanket ban on a full-download gate. Do not return to a visible finished homepage waiting for video, or to network-dependent fragment seeking, without a new user decision.

A small synchronous head script displays a Codera cover before first paint for ordinary desktop entry. Use the existing sharp SVG wordmark, dark background and truthful progress. Hide the page visually and mark its content inert during preparation. Download the complete compressed video, create a local Blob, decode the first image and await fonts before a 500 ms reveal. Subsequent seeks keep one outstanding decode and wait for presentation; text and the existing tunnel fade follow the presented image. No mouse parallax or lower-page redesign.

Delivery: journey-prepared-v2.mp4, 25,059,756 bytes, 1920×1080, 60 fps, 11 seconds, H.264/yuv420p, CRF 18, six-frame GOP, no B frames, slow encoder preset, same processed master and CAS sharpening. This is a new lossy encode, NOT byte-identical remux: master-reference SSIM 0.984221 versus 0.988539 for the 50 MB delivery. A representative detailed frame was visually compared. Preserve source resolution; never claim newly recovered or native 4K detail.

Cache the prepared compressed asset in the browser Cache Storage (one named Codera cache; versioned media URL), with ordinary fetch fallback when storage is unavailable or full. Measured local Edge entry at 10 Mbit/s / 60 ms: ~22.2 seconds cold, 0.685 seconds cached. Cold preparation duration still depends on bandwidth. A static-entry button becomes available after eight seconds; a 30-second independent watchdog, download error or missing scripts releases the cover. Skipping keeps motion off until explicitly requested and prepared. Touch, reduced-motion, no-JS and deep-link entries retain the immediate static page. Do not start an incompletely loaded movie as a fallback.

After preparation, forward/reverse seeks passed with the network disconnected. An eight-second forward/reverse run plus settling presented 474 frames: median 16.7 ms, p95 16.9 ms, maximum 100.4 ms; decode p95 3.1 ms. These are measured results on the available Edge/Windows machine, not a promise of zero dropped frames on every device. Verify startup AND presented-frame timing; do not report only a warm nominal 60 fps number.

Sources: experiments/metal/entry.js and entry.css, main.mjs, lib/silver-render.mjs (head assets only). Generation: scripts/metal-prepared-media.mjs. Verification: scripts/metal-entry-check.mjs and scripts/metal-check.mjs. See docs/CODERA_PREPARED_ENTRY_2026-09-26.md. Pending legal/footer drafts remain excluded.

## Verification

Production build and entry tests pass: cover before reveal, real video bytes, inert background, blocked native wheel during preparation, 1080p decode, forward/reverse/endpoints without network, cached revisit, manual static entry, download failure, reduced motion, touch and no JavaScript. The hero content, typography, offers and footer stay unchanged.
