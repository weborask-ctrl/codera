# Original Silver stream release — 2026-09-27

Marcus explicitly requested merge and testing after reviewing the local native-video implementation. This release preserves the supplied film and approved page; it ports only delivery, seek scheduling and related resource hints. The current branch is codex/silver-native-stream, based on a0477e4 of master. PR/CI/deployment status is the authority for whether it is public.

## Production integration

The homepage uses native video with worker MediaSourceHandle transport where available and a bounded main-thread MediaSource fallback. One fetch feeds unchanged encoded samples into a fragmented container. The published asset is /motion/metal/journey-stream-f60088d67cff.mp4 (50,405,743 bytes). Its SHA-256 is 9ae694d90bce8facb440cf4c6da9c8c587e463caddbb3ef4218c6cca32470a29. The build verifies the manifest before publishing. Only this immutable, content-versioned movie receives a one-year cache header. Original source/export files remain for traceability.

Production modules live in experiments/metal and are copied by scripts/silver-assets.mjs into /silver. No local server, diagnostic POST endpoint, replacement sculpture, comparison codec or query-based engine switch is shipped. Homepage GSAP/ScrollTrigger script loads are removed; unrelated demo routes remain intact. The existing page nonce policy is unchanged. Worker execution and fallback both passed under that policy.

## Validation before merge

- npm run verify: Biome, TypeScript and optimized Next build passed. Existing nonblocking CSS warnings remain.
- Production browser check: 14 passed, 0 failed, 0 skipped. Tests actual presented 1080p frames, forward/reverse movement, one complete fetch, pause/resume, offstage/top return, offers, full previews, static paths, explicit simulated worker-unavailable fallback, delayed entry skip, JS errors and CSP violations.
- Compact evidence: [local production report](measurements/2026-09-27-stream-release-local.json).
- A Chromium motion regression is included in tests/homepage.spec.ts so remote CI covers the production build as well as existing cross-browser page tests.
- Source/header/content checks and the same portable browser script must also pass on the deployed origin after merge.

Use SILVER_URL=https://www.codera.sk with npm run silver:check. Physical-device certification is not implied. The detailed cold-network measurements and pacing tradeoffs remain in [the original-film evaluation](CODERA_ORIGINAL_VIDEO_STREAM_2026-09-27.md). The four-second static escape and manual choice are preserved; network-bound playback cannot promise immediate arbitrary traversal on every connection.
