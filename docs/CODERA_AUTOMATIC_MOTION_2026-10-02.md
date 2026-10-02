# Automatic Silver motion — 2026-10-02

## Authorized change and acceptance

Marcus explicitly rejected long preparation and the mandatory “Spustiť animáciu” workaround. He now authorizes a modest compression/size tradeoff while preserving a sharp image, the supplied film and its original camera journey. This supersedes the earlier byte-identical delivery requirement for this iteration; it does not authorize replacing the artwork or reducing the site to a visibly pixelated export.

Scope: compare 1080p60 AVC exports against the existing detail reference; choose by actual decoded-frame comparison and native forward/reverse timings. Reserve the approved scroll geometry from the first layout, automatically activate ordinary visits including coarse-pointer devices, separate automatic loader escape from a deliberate skip, and respect reduced-motion/manual pause. Preserve all typography, content, lower sections and commercial controls.

Acceptance: first actual frame + measured buffered startup; no normal-path start click; stable journey geometry on late readiness; bounded usable static entry if the network is slow; real cold5/10Mbps media pacing and warm actual-frame intervals; error/reduced-motion/no-JS paths. Emulated touch and headless browser results do not certify every physical device.

## Release validation status

**Current implementation / locally validated release.** Local `npm run verify` passed lint, TypeScript and the optimized production build. Automatic-motion acceptance passed 15/15 checks. A 1440×900 browser review confirmed the selected 1080p original film, preserved composition/copy, no horizontal overflow and no reported page errors.

**Remote CI, preview, merge and deployment:** pending verification. The implementation and measurements below do not assert public deployment; add the final PR/deployment evidence here when confirmed.

## Selected media

The selected file is `/motion/metal/journey-balanced-4b593baa7f9b.mp4`, with its adjacent `.integrity.json`. Selection followed measurement and visual review, not a claim of byte-identical quality. The previous 50 MB export remains a historical detail reference.

The new export retains the supplied artwork, camera journey, 1920×1080 dimensions, 60 fps web cadence, 660 frames and 11-second duration. It is H.264 High level 4.2 (`avc1.64002a`), CRF 22, GOP 12, no B frames, with 55 MP4 fragments. It was encoded directly from the existing interpolated master, rather than re-encoding the previous 50 MB delivery file. The master itself derives from a 24 fps original; this is not native 4K or native captured 60 fps.

| Candidate | File bytes | Bytes through ≥1 s | Bytes through ≥1.6 s | Bytes through ≥2 s | SSIM | PSNR dB |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| CRF 20 / GOP 12 | 15,411,888 | 1,421,185 | 2,199,149 | 2,668,896 | 0.986792 | 45.547802 |
| CRF 21 / GOP 24 | 11,877,269 | 1,163,592 (1.2 s) | 1,542,134 | 1,886,033 | 0.985528 | 45.027168 |
| **Selected: CRF 22 / GOP 12** | **11,212,401** | **987,981** | **1,536,534** | **1,872,326** | **0.984927** | **44.663563** |

The selected candidate is **77.76% smaller** than the deployed 50,405,743-byte stream. Its current 1.6-second startup buffer comprises the first eight complete fragments and needs **1,536,534 media bytes**, excluding HTTP and other page resources. The table also retains one- and two-second byte counts for comparison. These byte counts are not measured load times. GOP 12 gives a random seek at most twelve coded pictures to reach a target inside one GOP; actual native seek timing must still be measured, especially in reverse. The initial one-second candidate was increased to **1.6 seconds** after cold-scroll testing exposed excessive source-position lag. This additional headroom still cannot guarantee unrestricted traversal before the rest arrives; final timing evidence is recorded separately.

SSIM and PSNR compare all 660 decoded frames against the 50,378,423-byte CRF 15/GOP 3 web detail reference. They do not compare against a lossless camera original and are not percentages of retained perceived quality. Native-pixel crops at 0 s, 2.5 s and 3.5 s cover the opening, metal close-up and tunnel. Review found a modest reduction of the finest brushed-metal microtexture; highlighted edges, composition and tunnel detail remained readable without conspicuous block breakup in the inspected crops. This is the explicitly authorized quality/size compromise, not unchanged fidelity.

Runtime uses `initialBufferSeconds: 1.6`, a presented first frame, the existing native video/MediaSource transport and scroll-controlled camera. Ordinary desktop and touch visits activate automatically; no mandatory “Spustiť animáciu” click is part of the normal path. Reduced-motion preference, deliberate skip, manual pause and media failure remain separate accessible states. Automatic loader escape is not a user decision to disable animation. The scroll geometry is reserved before late readiness so activation does not unexpectedly lengthen the page. Local browser acceptance is recorded below; deployment evidence belongs in the release-status block.

## Reproduce and verify the export

Input master: `.prototype-cache/silver-polish/interpolated-master-1080.mp4`.

- Master SHA-256: `c0c557f723674bbe9c15780cda5601902f81124e43779c579891e1769c57a2b5`
- Detail-reference SHA-256: `534dbd425c030f1dda75ac60937f363e29e9af1ed0e1a0f11c6aed483c38d1f0`
- Selected output SHA-256: `4b593baa7f9b62720c07736918ca8a6c4938b9d16f607a4cd9a5b096deb9f903`

Run with FFmpeg 7.1 / libx264 from the repository containing the master. The filename is the selected asset name; codec/muxer version changes can change the output hash.

```text
ffmpeg -hide_banner -y -ss 2.583333 -threads 2 -i .prototype-cache/silver-polish/interpolated-master-1080.mp4 -t 11 -an -vf cas=strength=0.55 -c:v libx264 -preset medium -crf 22 -g 12 -keyint_min 12 -sc_threshold 0 -bf 0 -pix_fmt yuv420p -profile:v high -level:v 4.2 -threads 2 -filter_threads 2 -movflags +frag_keyframe+empty_moov+default_base_moof journey-balanced-4b593baa7f9b.mp4
```

The trim offset, existing detail filter and frame cadence match the historical web reference. No spatial downscaling or new generative video was used. Encodes ran sequentially with two codec/filter threads.

Local workstation evidence is retained under `.prototype-cache/silver-auto-2026-10-02/`: `encode_candidates.py`, exact `encode-parameters.json`, `measure_candidates.py`, all-frame metric logs, `summary.json`, fragment boundaries in `measurements.json`, full-resolution decoded frames and `quality-native-pixels.png`. These ignored local files are inspection artifacts; they are not assumed to exist in a fresh production checkout. The published integrity manifest and this command preserve the release's verifiable media identity and parameters.

## Local acceptance results — final 1.6-second buffer

**15/15 checks passed**, with zero uncaught page errors and zero CSP violations. This establishes local acceptance of the implementation; public release status is tracked separately above. The [compact measurement record](measurements/2026-10-02-silver-automatic.json) preserves check names, metric summaries, the failed earlier candidate and test limitations.

The optimized local production page was exercised in headless Edge through an actual HTTP proxy. Only video bytes were paced, in 16 KiB chunks with 60 ms additional media latency; HTML, scripts, fonts and images were unthrottled. Each cold run used a fresh browser context and no-store video, including the real worker fetch. The 5 and 10 Mbit/s runs began a 14-second forward and 14-second reverse sweep immediately after automatic activation. The warm sweep ran after complete buffering. Intervals count unique `requestVideoFrameCallback` media presentations, not repeated filtered controller targets.

| Scenario | Video ready | Page usable | Frame interval p95 | Longest frame interval | Max raw scroll-to-film lag |
| --- | ---: | ---: | ---: | ---: | ---: |
| Cold 5 Mbit/s video | 2.785 s | 2.825 s | 33.5 ms | 66.9 ms | 1.421 source s |
| Cold 10 Mbit/s video | 1.538 s | 1.587 s | 33.5 ms | 150.5 ms | 0.155 source s |
| Fully buffered | — | — | 33.5 ms | 66.9 ms | 0.172 source s |
| Cold 2 Mbit/s video, startup only | 6.427 s | 4.065 s | Not tested | Not tested | Not tested |

At 2 Mbit/s the cover released first; motion then activated automatically at **6.440 s** without a start click or geometry change. This scenario does not establish continuous cold-scroll smoothness at 2 Mbit/s. At 5 Mbit/s buffer-aware pacing kept pictures moving while the film could trail the raw scrollbar by 1.421 seconds of **source-film position**; that is not wall-clock input latency. The 150.5 ms maximum at 10 Mbit/s was a brief reverse interval; the longest hold with material outstanding frame demand was 33.5 ms. These values do not justify a constant-60-fps or every-device claim.

Functional acceptance covered ordinary desktop and emulated touch automatic entry, explicit pause/resume, delayed automatic readiness, deliberate static skip, offstage readiness and return, reduced motion, no-JS entry, media error/retry, main-thread MediaSource capability fallback, missing controller recovery, deep-link download avoidance and CSP/error checks. The normal path required no start click. Emulated touch is not physical iPhone/Android acceptance.

### Failed earlier one-second candidate

The retained `initial-1s-buffer.json` run failed the cold 5 Mbit/s raw scroll-to-film lag limit at **1.956903 source seconds**. It also caught a separate deep-link preparation regression. The buffer was increased to 1.6 seconds and deep-link preparation corrected; the final complete run above passed both. The initial run's faster entry is not presented as successful overall performance, and the final result remains a compromise between startup, compression detail and cold-network camera lag.
