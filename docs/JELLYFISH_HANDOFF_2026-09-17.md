# Jellyfish workstation handoff — 2026-09-17

## Result and scope

The isolated prototype has smoother, reversible camera travel, a restrained pearl-material refinement, reliable start/stop and failure handling, and repeatable browser/performance checks. The existing page composition is preserved. All five portfolio examples remain one ordinary-scroll block, with the camera and renderer asleep there. No production homepage redesign, merge or deployment was performed.

Working branch: `design/jellyfish-study-2026-09-16`. Starting commit: `a7ab9fa6f7e00d31e9b70305c1529ac9b5c0f684`. The [autonomous plan](JELLYFISH_AUTONOMOUS_PLAN_2026-09-17.md) is the scope contract. Final commit, push and CI evidence are recorded below after the gates finish.

## What changed

- **Camera:** one GSAP playhead samples a bounded, continuously differentiable path. Travelling waypoints no longer force a complete stop; the intro includes an oblique pass beside the bell and a retreat. Reading holds remain deliberate stops. Reverse seeking returns the same camera pose.
- **Proxy material:** broader, softer pearl highlights, corrected outward bell faces and anti-aliased fine vein detail. No additional geometry, texture downloads, postprocessing or increased default pixel budget.
- **Lifecycle:** starting 3D is lazy and retryable; stopping disposes geometry, materials, renderer and context. Failed or lost WebGL, missing libraries and low memory retain readable content. Hidden-page and page-restoration handlers control rendering and health checks. Static and portfolio states sleep the GSAP ticker as well as avoiding draw submissions.
- **Frame pacing:** removed a redundant per-frame gate that could discard valid 30 Hz ticks. Sustained poor frame intervals now trigger bounded degradation and ultimately static mode.
- **Content resilience:** the local preview renders the offer, contacts, founders and response times directly from `lib/site-config.ts`, with escaped HTML. These no longer depend on a successful client-side fetch or JavaScript. No business facts changed.
- **Security:** Next and `eslint-config-next` pinned to **16.3.5**, with the corresponding patched bundled dependencies; vulnerable transitive `js-yaml` updated to **4.3.2**. React remains **19.2.4**. Online full and production-only audits returned zero known vulnerabilities at check time. This patches the working branch, not the currently deployed site.
- **Future work:** a [production-method brief](JELLYFISH_PRODUCTION_METHOD_2026-09-17.md) defines one authored organism/camera master, a first hero-to-portfolio test segment, realtime versus prerender comparison, and bounded decode memory. It is a prepared method, not a completed photorealistic asset.

Security references: [Next security release](https://nextjs.org/blog/august-2026-security-release), [Next 16.3.5](https://github.com/vercel/next.js/releases/tag/v16.3.5), [js-yaml advisory](https://github.com/nodeca/js-yaml/security/advisories/GHSA-2883-xcg3-v3hh).

## Layout preservation

Before/after measurements in the same 1798 × 1216 browser viewport were identical (rounded CSS pixels):

| Section | Document top | Height |
| --- | ---: | ---: |
| Hero | 0 | 4,013 |
| Five-project portfolio | 4,013 | 6,342 |
| Services | 13,395 | 1,216 |
| Process | 16,435 | 1,216 |
| Contact | 19,232 | 1,338 |

Total document height: **20,569 px** before and after. Headings, section order, offer columns, project order and normal portfolio scrolling were retained. Functional safeguards contain long contacts/diagnostics/failure messages; at widths up to 360 px, tighter header spacing keeps the existing navigation legible on one line. Prototype control targets have a 24 px minimum. No content section was rearranged. Removal of numbered micro-labels remains deferred as previously requested.

## Verification and measurements

- Production application: **102/102 Playwright tests passed**, 34 each in Chromium, Firefox and WebKit, with one worker and no retries; approximately 4.5 minutes. A fresh Next 16.3.5 production build was used.
- Focused prototype check: passed, including **8,001 sampled poses**, finite/bounded channels, exact waypoints/holds, deterministic reversal, continuous velocity, camera clearance, five-project count, dependency serving and path traversal rejection.
- Camera minimum sampled distance to the bell origin: **2.230 world units**; to the look target: **2.264**. These are mathematical safety checks, not a full tentacle/surface collision proof.
- Audits: `npm audit --omit=dev --json --offline=false` and `npm audit --json --offline=false`, both against the live registry with a workspace cache: **0 vulnerabilities**. Offline/cache-only audit output was not accepted as evidence.
- Prototype browser checks: **21/21 groups passed** in Chromium 151.0.7922.34. Coverage: forward/reverse journey, zero portfolio frames and sleeping ticker, restart cycles, four direct anchors, reduced motion, real WebGL context loss/retry, no JavaScript/WebGL, missing GSAP/ScrollTrigger/Three, unavailable business/health APIs, a timed-out health request, low memory, keyboard skip/control access, lifecycle handlers, and six viewport sizes (320, 390, 768, 1440, 1798 and 1920 px wide).
- Lifecycle pagehide/pageshow/visibility regression tests use synthetic events. They test our handlers, not actual browser bfcache eligibility. WebGL context loss was exercised through the browser's loss extension.
- `npm run verify`: **passed** on the final code checkpoint (Biome, TypeScript and the production build, 16 routes). Biome reported 14 informational style suggestions, no failing diagnostics. Six JavaScript module syntax checks and `git diff --check` also passed. Final synchronization evidence follows below.

Workstation: Intel Core i3-9100F (4 cores), approximately 15.94 GiB system RAM, NVIDIA RTX 3060 (12 GiB). Only roughly 2–3 GiB system memory was free during parts of the pass, so builds and browser measurements were sequenced. Chromium identified the actual RTX 3060 through ANGLE/D3D11, not a software renderer.

The prototype still caps its default drawing buffer at 850,000 pixels, DPR 1 and 30 submitted frames/s; balanced quality is capped at 1,500,000 pixels. Idle breathing intentionally submits fewer frames. Frame-submission intervals and JavaScript heap measurements are not GPU completion time or total browser/GPU memory. CPU throttling and viewport emulation do not certify a physical phone or the home PC.

Each performance profile scrolls the intro, the post-portfolio journey and its reverse for approximately 18 seconds. The measured DOM counter changes only after an actual WebGL submission; it is not a blind requestAnimationFrame benchmark.

| Viewport | CPU throttle | Submissions | Median interval | p95 interval | Intervals over 50 ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1440 × 900 | 1× | 541 | 33.3 ms | 34.3 ms | 2 |
| 1920 × 1080 | 1× | 541 | 33.3 ms | 34.4 ms | 0 |
| 1440 × 900 | 4× | 540 | 33.5 ms | 35.4 ms | 0 |
| 390 × 844 | 4× | 542 | 33.4 ms | 35.5 ms | 0 |

All four stayed near the deliberate **30 fps** ceiling without lowering resolution or stopping. Reported JavaScript heap was 10 MiB for each. One 52 ms main-thread long task occurred in the first profile; the other profiles recorded none. Buffers remained 1166 × 728, 1229 × 691, 1166 × 728 and 390 × 844 respectively. These are single controlled runs, not broad hardware certification or proof of improvement against an equally measured baseline.

The compact [evidence folder](jellyfish-evidence-2026-09-17/README.md) contains actual screenshots and the two original JSON reports. The measured run includes 19 functional groups plus four performance profiles; the later final run includes all 21 functional groups after the narrow-header/control/test additions. The scene, camera and frame-scheduling code did not change between those runs.

## Continue at home — no full install required

Use [the transfer instructions](CONTINUE_ON_ANOTHER_PC.md) to clone or safely update the working branch without overwriting local edits. From its root:

```sh
node scripts/jellyfish-preview.mjs
```

Open `http://127.0.0.1:4317`. Node 24 LTS is the documented setup. Only the pinned Three.js/GSAP browser files are downloaded on first launch; later launches use the ignored cache. No Next build, full npm install or GPU asset generation is required to inspect the prototype.

Keep **Úsporný** quality at home. If necessary, open `http://127.0.0.1:4317/?motion=reduce`, or use **Zastaviť 3D**. Content stays available and the renderer is released. A static preview is also useful for copy/offer review.

Useful home work: review the intro approach/oblique pass/retreat, reverse the scroll, assess how the reading pauses feel, and decide the final organism/material direction. Business copy and final typography decisions are lightweight. None of those decisions was silently treated as final approval in this pass.

Workstation work that remains: author the production-quality jellyfish master; render and compare one 6–8 second desktop/portrait passage; measure reversible video seeking versus constrained realtime 3D; then validate the successful candidate on the home PC and a physical phone. Do not render every transition or preload a 4K image sequence before that first segment passes.

## Repeat only the relevant checks

With the lightweight preview running:

```sh
node scripts/jellyfish-check.mjs
```

For the full workstation checks (development dependencies and Playwright browsers required):

```sh
npm ci
npm run verify
npx playwright install chromium firefox webkit
npm run test:e2e -- --workers=1
npm run prototype:jellyfish:browser
```

The prototype browser harness saves its report and images under ignored `test-results/jellyfish`. The production suite and prototype harness are separate. Do not rerun the heavy suite merely to read this report or view the unchanged prototype.

## Validation classes and repository delivery

- **LOCAL:** full verification, 102 production tests, focused checks and 21 prototype browser groups passed on the final code tree. The delivery record below identifies its committed revision.
- **CI:** pending the push for this pass; [branch Actions](https://github.com/weborask-ctrl/codera/actions?query=branch%3Adesign%2Fjellyfish-study-2026-09-16). Branch pushes run the fast gate; the existing workflow reserves CI E2E for PRs/master.
- **PREVIEW:** local standalone preview inspected, but no new hosted deployment was created or validated.
- **DEVICE:** not validated on a physical phone or the home PC. That remains user/device work.

No new AI images or videos were generated or paid for. The procedural animal is still a camera/interaction proxy, not a final photographic or 4K creature. The handoff carries project decisions and evidence, not the original chat transcript, credentials, npm cache or local servers.
