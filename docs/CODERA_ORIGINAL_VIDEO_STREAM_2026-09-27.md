# Original Silver video: delivery and scroll candidate

**2026-09-27 — original-video release authorized by Marcus (merge and test).** This document preserves the local measurements and their limits. Production integration uses the same selected behavior; PR checks and deployment verification establish availability, not a universal performance guarantee. PR #121 is the superseded rejected experience.

## Preserved content and integrity

Marcus rejected substituting a realtime sculpture for the supplied Silver film. This iteration preserves its camera journey, composition, captions and tunnel fade, together with approved fonts, headings, shapes, pricing and gallery. No pointer parallax was added. Lazy gallery images now use their actual layout slot in the `sizes` hint and low fetch priority; gallery geometry is unchanged.

The camera source is 1920×1080, 24 fps, HEVC 10-bit 4:4:4 MOV. This delivery work preserves the existing interpolated **1080p60 H.264 web reference**, 11 seconds and 660 frames. It does not create native 4K or newly captured detail.

| File | Role | Bytes |
| --- | --- | ---: |
| `.prototype-cache/silver-release/public/motion/metal/journey-scroll-1080.mp4` | Detail reference, CRF 15 / GOP 3 | 50,378,423 |
| `experiments/motion-lab/media/original-stream.mp4` | Same samples in fragmented MP4 | 50,405,743 |

The root checkout has a different, smaller historical export; do not use it as the reference. Reference file SHA-256: `534dbd425c030f1dda75ac60937f363e29e9af1ed0e1a0f11c6aed483c38d1f0`.

Original and remuxed sample payloads both hash to `f60088d67cffaea794ac679739be8947b201737c39a7cbd6101b3de2b16501bb`: 220 fragments and 50,373,431 encoded bytes. This verifies **no re-encoding or compression-detail loss relative to that export**. Verification sources: `experiments/motion-lab/media/original-stream.integrity.json`, `media/detail-reference.json` and `prepare-original-stream.mjs`. The script uses FFmpeg stream copy only when output is missing, then verifies hashes.

## Production integration

The approved local implementation is ported into `experiments/metal/main.mjs`, `native-player.mjs`, `native-stream.mjs`, `native-stream-worker.mjs` and the unchanged lower-page controls in `page-controls.mjs`. `npm run silver:assets` publishes these modules under `/silver/`. It does not publish the lab server, comparison codecs or local diagnostic POST endpoint. The movie is `public/motion/metal/journey-stream-f60088d67cff.mp4` with a one-year immutable header; its payload and file hashes below are unchanged. The original full MP4 remains for historical references.

Run `npm run verify`, then `SILVER_URL=<built-or-deployed-origin> npm run silver:check`. The browser check exercises native worker transport under actual page CSP, the main-thread fallback, presented frames, forward/reverse movement, pause, late skip and unchanged lower controls. Run it after deployment too.

## Measured implementation

The bare preview URL selects native HTML video. A single fetch streams the remux into MediaSource; a dedicated worker owns fetch, parsing and append through `MediaSourceHandle` where supported. Other supported browsers fall back to the same bounded main-thread append logic. Native decoding stays in the browser; frames are not copied into canvas. Compressed SourceBuffer data remains available for reverse scrolling, without a JavaScript decoded-movie bank.

Each complete fragment is appended serially. The 50 Mbit/s worker run used one HTTP response, 220 fragments and a peak JavaScript fragment queue of 372,391 bytes. This is **not total browser/decoder/GPU memory**; those internal allocations were not comprehensively profiled.

Readiness requires a presented first frame plus two seconds of footage buffered from the beginning. The existing entry cover releases into a static hero after four foreground seconds; no full-file Cache Storage write blocks entry. Manual skip/pause remain authoritative. Late readiness activates automatically only at the top, after an explicit start, or in an already expanded journey; otherwise it stays ready but paused. Reduced-motion, touch and no-JS visits default to static. Failure restores the poster.

Native page scrolling remains in control. The 700-svh journey and original control points remain `[0, 2.6 s]`, `[0.38, 5.7 s]`, `[0.67, 9.5 s]`, `[1, 13.5 s]`, with a 2.583333-second source offset. The local controller replaces the GSAP video driver with requestAnimationFrame and a 0.16-second damping constant. The selected native player has **no fixed film-speed cap once buffered**. Wheel events are not delayed or blocked.

When the download is incomplete and the camera approaches the buffered frontier, forward film speed is limited by available headroom: `(buffer end − current film time − one frame) / 0.75`. This gradually slows the camera before exhausting the buffer; completed transfers and reverse motion use normal damping without an arbitrary speed ceiling. It is an explicit continuity-versus-camera-lag tradeoff, not faster delivery. Text follows the displayed film. Page scrolling remains unrestricted, so a visitor can still leave the hero before the camera catches up.

Only one seek is outstanding; newer targets replace obsolete requests. Unbuffered targets wait instead of repeatedly seeking to unavailable media. Captions/fade follow actual `requestVideoFrameCallback` reports, not synthetic `seeked` presentation claims. Offstage/hidden work pauses. A large offstage return, such as footer to top, resets to the current target so it does not spend seconds rewinding. Continuous visible reverse scrolling remains paced.

**Filtered-target lag** in the measurements means decoder/presentation delay against that paced target. It excludes the intentional catch-up between an abrupt wheel jump and the requested story position. Do not present it as total wheel-to-picture latency.

## Findings and rejected alternatives

- Direct native HTTP was fast warm, but cold seeks depended on missing network ranges. At 50 Mbit/s entry was 0.605 seconds while p95 seek duration reached 159.4 ms and p95 target lag 0.404 seconds. Fast entry alone hid poor scrolling. Controlled streaming removes per-seek HTTP range behavior, not the need to download bytes.
- Whole-file preparation and cache persistence put the transfer ahead of motion. A static escape keeps the page usable; it does not make full motion instantly ready.
- Earlier scheduling gates and redundant animation-frame dispatch delayed requests. The native adapter now pumps the latest target directly and coalesces outstanding work. Nominal video fps cannot measure this overhead.
- GPU-backed frame retention/canvas copying and software codec variants had their own decode/copy costs. A worker by itself is not proof of better performance.
- The alternative WebCodecs worker coupled compressed prefetch to a small decoded-frame cache. Separating two seconds of compressed lookahead improved its cold behavior, but does not make its smaller AV1 encode reference-identical.
- Main-thread MSE had a 284.6 ms animation-frame interval and 337.3 ms seek outlier. The later worker-transport run improved those values. Garbage collection was a hypothesis, **not a confirmed cause**.
- Live Vercel range requests to the 50 MB asset returned MISS and later HIT. It is not proven uncacheable. CDN caching cannot remove first-visit last-mile transfer; a general response-size limit is not proof of a static-file caching failure.

## Measured results

Intel Core i5-6500, Intel HD 530, 8 GB RAM; Edge with native video decode enabled. **Headless controlled runs**, cache disabled, simulated throughput and 60 ms latency, 1280×650. Browser benchmarks ran sequentially. A row is an observed run, not cross-device certification.

| Delivery/test | Ready / entry | Native seek p95 / max | Frame interval p95 | Filtered-target lag p95 / max |
| --- | --- | --- | --- | --- |
| Direct native HTTP, cold 50 Mbit/s, paced bursts | 0.550 / 0.605 s | 159.4 / 258.2 ms | 168.6 ms | 404.4 / 520.9 ms |
| Main-thread MSE, cold 50 Mbit/s, paced bursts | 2.793 / 2.904 s | 9.4 / 337.3 ms | 19.0 ms | 29.6 / 171.8 ms |
| Worker MSE, cold 50 Mbit/s, paced bursts, before buffer pacing | 3.208 / 3.234 s | 8.0 / 34.9 ms | 18.0 ms | 24.8 / 71.3 ms |
| **Worker MSE, cold 50 Mbit/s, wheel bursts, final** | **2.606 / 2.674 s** | **7.8 / 116.4 ms** | **19.4 ms** | **37.6 / 114.2 ms** |
| Worker MSE, cold 20 Mbit/s, full sweeps, before buffer pacing | 5.620 / 5.792 s | 6.1 / 41.3 ms | 33.7 ms | 8.2 / 330.9 ms |
| Worker MSE, cold 20 Mbit/s, full sweeps, final | 5.158 / 5.309 s | 5.9 / 42.6 ms | 34.0 ms | 8.0 / 24.0 ms |

In the initial 50 Mbit/s worker run all 683 seeks completed without JavaScript/media errors. Page RAF was 16.9 ms p95 and 33.5 ms maximum. Excluding preparation (both timestamps at least 100 ms after entry), its 680 frame intervals were 18.0 ms p95 and 49.7 ms maximum. Raw history maximum 1992.2 ms includes the first frame held while the opening buffer loads; it is not an active-scroll stall or instantaneous-entry evidence.

An intermediate version retained a fixed 1.35-source-second/second camera cap. Aggressive wheel bursts produced **7.0005 source seconds p95 and 7.7005 source seconds maximum raw story-position lag**, despite small filtered-target lag. That exposed an inadequate metric and the fixed native cap was removed. This intermediate report is preserved as `stream-mseworker-original-cold50-low-speed-cap.json`; it is not the selected behavior.

The final 50 Mbit/s run reached readiness in 2.606 seconds and completed all 613 submitted seeks without reported errors. Frame interval p95 was 19.4 ms, with **167.4 ms maximum after entry**; page RAF was 16.9 ms p95 and 83.6 ms maximum. Native seek maximum was 116.4 ms. These outliers remain relevant beside the improved startup. During aggressive wheel bursts, **raw scrollbar-to-picture position lag was 1.287 source seconds p95 and 1.522 source seconds maximum**. This remains distinct from the smaller filtered-target lag and is not wall-clock input latency. Buffer-aware pacing was active in 94 RAF samples. The one fetch delivered the same file and peak queued bytes were 422,088.

**Before buffer-aware pacing, the 20 Mbit/s run paused the picture for 918.5 ms near the end of forward traversal because the download was unfinished.** The target was about 13.497 source seconds and the shown frame about 13.166 seconds. Page RAF stayed responsive (16.9 ms p95, 20.2 ms maximum), demonstrating why page-frame timing alone is insufficient.

With buffer-aware pacing and no fixed native speed cap, the final 20 Mbit/s test removed that end-of-forward freeze. Page RAF was 16.9 ms p95 and 18.8 ms maximum; the largest frame interval after entry was 167.7 ms during final easing from frame 2 to frame 1 at the beginning, rather than the previous network starvation. The largest interval near the forward endpoint was 83.6 ms between frames 645 and 646. Buffer pacing was active in 160 RAF samples. The raw scroll target was ahead of the displayed film by **0.251 source seconds p95 and 0.550 source seconds maximum**; these are film-position differences, not wall-clock input latency. The filtered-target metric must not hide that tradeoff.

Both 20 Mbit/s runs require manual test activation after the four-second static escape; the entry figures do not describe an automatic override of a visitor's static choice. The final run received all 50,405,743 bytes, appended 220 fragments and peaked at 361,302 queued bytes. The slower story sweep also changes frame-interval distribution, so compare movement patterns as well as percentiles.

Reports are in `.prototype-cache/motion-diagnosis-2026-09-27/`: `stream-mseworker-original-cold50-sw-low-single-paced-headless.json`, `stream-mseworker-original-cold20-sw-low-single-normal-headless.json` and corresponding comparisons. Earlier runs are preserved as `stream-mseworker-original-cold50-before-buffer-pacing.json` and `stream-mseworker-original-cold20-before-buffer-pacing.json`. In native-video reports, `summary.decode` measures seek duration, not isolated codec execution; `summary.draw` contains rVFC intervals, not canvas draw cost.

A compact durable record with integrity hashes, benchmark summaries, raw-report hashes and functional results is preserved in [the measurement summary](measurements/2026-09-27-original-stream-summary.json).

## Limits and acceptance

The preserved 50.4 MB film needs at least **40.3 seconds at 10 Mbit/s**, 20.2 seconds at 20 Mbit/s or 8.1 seconds at 50 Mbit/s to transfer completely, before overhead. Streaming enables earlier entry; it cannot guarantee arbitrary traversal ahead of a slow download. The high-bitrate opening needs roughly 12 MB for two seconds of source footage. A slow connection can still reach static fallback or outrun the buffer.

The 17,261,275-byte AV1/CRF 14 comparison is smaller but not sample-identical. SSIM against the processed master was 0.986426 versus 0.988539 for the H.264 reference, and matched crops showed some fine-texture smoothing. Native AV1 on HD 530 had slower seeking. A 53,931,405-byte HEVC trial did not solve size. These remain comparisons, not quality defaults. Maximum unchanged detail, unrestricted scrolling, zero waiting and every possible device/connection cannot all be guaranteed here.

The final default functional suite, rerun after buffer-aware pacing, recorded **12 passed, 0 failed, 1 skipped**: original content/styles, actual frame changes, pause/resume, offstage work stopping, footer-to-top recovery, both pricing disclosures, full previews and static paths. The skipped test is a real hidden-tab transition: headless Edge did not report `document.hidden=true`; no synthetic event was used as proof. Media integrity verification and module syntax checks passed.

The in-app preview showed the original film and layout, but sometimes RAF throttled to approximately one second despite reported focus/visibility. Such a run is inconclusive for physical foreground smoothness. Before production, test real foreground Edge/Chrome and Safari/fallback, genuinely hidden-tab returns, matched-frame sharpness at the actual viewport/DPR, slow cold networks and physical mobile/tablet devices. Neither universal smoothness nor superiority over Oryzo is established.

The tables above describe local evaluation on the recorded machine, before deployment. Local lab files under `experiments/motion-lab` and `.prototype-cache` are workstation artifacts, not production dependencies. Release commands are in [scripts/README.md](../scripts/README.md). Preserve failures/outliers and compare continuous cold scrolling, not only startup or warm playback. Actual release verification is recorded in `docs/CODERA_STREAM_RELEASE_2026-09-27.md`.
