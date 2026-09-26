# Motion detail correction — 2026-09-26

## Riešenie: diagnosis

Marcus reported that the earlier local film looked sharper than production and explicitly prioritized detail over cold-load duration, while retaining smooth scrolling. A same-viewport Edge audit of the current localhost:4337 and www.codera.sk found identical 1920×1080 video, 1425×900 CSS video box at a 1440×900 viewport, DPR 1, object-fit cover, no CSS filter, no video/camera transform and zoom 1. The production MP4 and local prepared-v2 file have identical SHA-256 `22dcbec1a92751a1d38de66079317a802a7da56f435c0405ce5d2df555250c85`. Hosting is not recompressing it. The historical localhost:4327 was no longer running, so its remembered appearance cannot be directly measured.

The known quality change was PR #117's smaller encode: 25,059,756 bytes, CRF 18, GOP 6, replacing the earlier 50,378,423-byte CRF 15/GOP 3 export. Resolution did not change; compression did. Earlier master-reference measurements were SSIM 0.984221 and 0.988539 respectively. Those are historical measurements, not a claim of twice the sharpness. Same-time decoded-frame comparisons show a modest detail improvement; inherent source softness remains.

## Postup: preserve the working engine

Restore the already committed `journey-scroll-1080.mp4` bytes without another transcode. Keep 1920×1080, 60 fps, 11 seconds, CAS 0.55, original story offsets and fades. This is interpolated from a 1080p24 source, not native 4K. Do not upscale merely to claim a larger resolution, add browser sharpening filters or change the composition to fake sharpness.

Keep full compressed-video preparation before reveal, Blob seeking, one outstanding decode, presentation-driven captions, native scrolling and no pointer parallax. The media URL changes, preventing reuse of the 25 MB cache entry. Allow 90 seconds for the larger download and 95 seconds for independent loader fail-open. Keep the existing eight-second static-entry option. A stalled or failed download must not start a half-loaded animation. Reduced motion, touch and no-JS remain immediate static entries.

## Vypracovanie: verification

Controlled local Edge at 1440×900, eight-second forward/reverse scroll plus settling:

| Delivery | Presented frames | Median / p95 frame interval | p95 decoder time |
| --- | ---: | --- | --- |
| 25 MB prepared-v2 | 434 | 16.7 / 17.0 ms | 3.4 ms |
| Restored 50 MB detail | 466 | 16.7 / 16.9 ms | 2.5 ms |

These individual runs show no measured regression, not a guarantee for every device; isolated scheduling pauses occurred in both runs. The shorter GOP reduces random-access decoding work despite the larger transfer.

Entry test at 10 Mbit/s and 60 ms latency: 42.747 seconds cold, 0.691 seconds cached. Forward/reverse/endpoints passed with the network offline after preparation. Skip, failed download, touch, reduced motion and no-JS checks passed. Browser-frame comparisons inspected at identical timestamps; no geometry or lower-page edits.

Reproduce entry checks with `node scripts/metal-entry-check.mjs` and the current production-like local server. `scripts/metal-prepared-media.mjs` now documents the selected CRF 15/GOP 3 generation settings. Use the existing committed media for this release; generation is not a deployment dependency.

## Codera rule

Treat resolution, compression fidelity, displayed pixel density and seek latency as separate requirements. Compare identical decoded timestamps at the same viewport and DPR. Never silently trade an approved detail level for fewer bytes. Any smaller replacement must pass visual comparison and a cold-entry plus forward/reverse performance check; document the trade-off. A larger asset is acceptable here because Marcus explicitly approved longer preparation. Keep layout, typography, projects, pricing and legal drafts outside this correction.

CI also exposed a portfolio-test race: programmatic scrolling ran while main was still inert under the entry cover, before the long motion layout settled. The test now awaits interactive main before scrolling and retains ordinary pointer-hit checks. A delayed-download reproduction at 1280×720 passed preview opening, Escape and focus return. No portfolio production code changed.
