# Motion regression stabilization — 2026-09-26

## Riešenie: rejected release

Marcus reported severe stuttering after PR #120. That release activated an 11-second film with only 0.4 seconds buffered. Its own cold-sweep test recorded a 4.4-second image hold, and production needed 113.6 seconds to fill the film. Calling the 6.4-second page entry a successful motion fix was incorrect: normal scrolling could repeatedly outrun the buffer. The user explicitly rejected this behavior. Do not treat that release or its warm 60-fps figures as an approved baseline.

## Postup: remove network dependence from active motion

Return to one completely prepared local Blob before activating scroll animation. Keep the original approved 50,378,423-byte H.264 file, resolution, 60 fps, sharpening, story and caption/fade timing. No quality reduction or new encode is part of this stabilization. Do not load the progressive MSE module or start a camera journey from a partly downloaded film.

Avoid restoring a minute-long blocking cover. Offer immediate static entry after 1.5 seconds and automatically release the cover after four foreground seconds. An uncached visitor may therefore get the sharp compact static hero. The complete video continues preparing in the background. When ready, the existing motion button can start it; do not automatically lengthen the page after the static escape or override a pause. Reduced-motion, touch and no-JS retain their static defaults.

Reuse complete caches: prefer the existing full-file cache. If all 221 initialization/fragment entries from PR #120 are present, read them in source order and assemble one complete Blob before use. Incomplete fragment caches must not enable motion. This avoids requiring another 50 MB download for visitors who already have all fragments. Keep compressed data, not a decoded bitmap bank.

## Vypracovanie: measured evidence

- Local Edge, prior complete fragment cache, all MP4/M4S network requests blocked: active motion after 0.756 seconds. The eight-second full forward/reverse sweep plus settling presented 470 frames; median 16.7 ms / p95 16.9 ms, longest interval 83.5 ms. No multi-second network starvation. This is a measured run, not a zero-dropped-frame guarantee on every device.
- Cold full-file preparation at 10 Mbit/s/60 ms still takes about 43 seconds. Static entry was available after about two seconds via the button; the visitor is not forced to wait for motion. A full-file cached revisit measured 0.766 seconds. Offline forward/reverse/endpoints passed once explicitly activated after preparation.
- Existing motion regressions verify captions, reverse fades, pause/resume, delayed readiness, portfolio, hidden-tab recovery, no-JS, reduced motion and touch. The dedicated entry suite also checks automatic static escape and that incomplete video never activates.

This is a stability correction, **not a claim that fast first entry with immediate full motion has been solved**. That combined requirement remains open. Any future alternative stays local until continuous scrolling from a cold entry is acceptably smooth at the target connection and machine. Distant-jump tests, byte hashes and warm rendering alone are insufficient; multi-second freezes are a release failure, not a minor caveat.

Current runtime: `experiments/metal/main.mjs`, `entry.js`, `scripts/silver-assets.mjs`. Tests: `scripts/metal-stable-entry-check.mjs`, `metal-cache-recovery-check.mjs`, `metal-check.mjs`. Historical `stream-ahead.mjs` is not loaded. No layout, font, pricing, project-frame or legal/footer changes.
