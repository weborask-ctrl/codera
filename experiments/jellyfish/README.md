# Codera — spatial jellyfish prototype

**Current octopus experiment (2026-09-19):** open `/dive.html` on the same preview server. It now uses the animated Blender model in the approved ocean. See [integration and measured limits](../../docs/OCTOPUS_WEB_INTEGRATION.md). Resource figures below describe the older jellyfish page, not this denser Blender character.

**Marine Film I (2026-09-19):** the dive now loads a separate Blender library for fish, shells, kelp and corals. Inspect the actual exported assets at `/marine-look.html`. [Sources, reproduction and remaining visual work](../../docs/MARINE_FILM_I.md).

## Run on another PC

Requires Node 22.18+ or 24 LTS. From the repository root:

```sh
node scripts/jellyfish-preview.mjs
```

Open http://127.0.0.1:4317. Stop the server with Ctrl+C. `npm run prototype:jellyfish` is the equivalent shortcut when npm is present. No full npm install or Next build is needed. First launch downloads the exact Three.js and GSAP archives from package-lock.json, checks their SHA-512 integrity, and extracts only the browser files into the ignored `.prototype-cache/jellyfish` directory. Later starts use this cache. Public project screenshots and actual Codera font files are served directly from the repository. No generated mockup PNG is loaded by the prototype.

## What to inspect

Start at the hero and scroll. The camera approaches the bell, passes beside it and pulls away. All five portfolio examples form ONE ordinary document-flow section; camera time and WebGL rendering pause there. After the portfolio, scroll resumes the corridor passage, macro approach, large pullback, ascent to a top view, and return to the contact profile. Scroll backward to reverse the journey. Menu anchors also work without completing the journey first.

The 2026-09-17 pass adds continuous camera interpolation through travelling waypoints and a more explicit oblique bell pass, while preserving exact portfolio, service and process holds. The pearl shader is a conservative refinement of the same proxy. Final page layout and the deferred typography/section-label decisions remain unchanged. Cinematic approval and one production-quality hero-to-portfolio segment are still pending; see [the workstation handoff](../../docs/JELLYFISH_HANDOFF_2026-09-17.md) and [production-method brief](../../docs/JELLYFISH_PRODUCTION_METHOD_2026-09-17.md).

The procedural jellyfish is a temporary model for testing spatial choreography. It is not the final photographic creature, and the simple mineral geometry is spatial blocking. This experiment does not yet prove seamless production video, final 4K quality, touch-device frame pacing, or final art direction.

Controls at the bottom: **Zastaviť 3D** removes the long transition spacers, releases the renderer and leaves a static readable layout. **Výkon** shows submitted frame rate, canvas resolution, geometry count and latest free system memory. **Vyvážený** raises the pixel budget, not the frame limit. `?motion=reduce` starts statically without changing OS preferences; the actual `prefers-reduced-motion` setting is also respected. The home PC should start with the default **Úsporný** setting; use the static URL if needed. All content and contacts are available without JavaScript or WebGL.

## Resource policy

- One renderer and one GSAP ticker, 30 fps ceiling during movement, about 7–8 submitted frames/s during idle breathing.
- Default drawing-buffer budget 850,000 pixels, DPR 1 maximum, balanced 1,500,000 pixels.
- Around 28,500 triangles for the animal scene after refinement; no shadow maps, postprocessing, HDR maps, render-target transmission, physics or downloaded model.
- Zero WebGL submissions through portfolio, paused ticker on a hidden page, automatic resolution downgrade on sustained long intervals.
- Periodic local memory check while active; below 750 MB free RAM, switch to the static layout. This is a safeguard, not a guarantee against OS or GPU failure.
- CPU submission timing in diagnostics is NOT GPU timing. Idle frame rate is deliberately reduced and should not be interpreted as peak capability.

## Source files

- `choreography.mjs`: camera, look target, object and environment keyframes; pure scroll-to-time mapping and bounded pose sampling with explicit reading holds.
- `scene.mjs`: actual procedural geometry, material and one renderer.
- `main.mjs`: GSAP orchestration, native scrolling, lazy scene startup, restart, page restoration and safeguards.
- `index.html`, `style.css`: real selectable text, actual fonts and normal portfolio flow.
- `CONTRACT.md`: user-approved implementation scope.

The preview server renders prices, contacts, people and response times from `lib/site-config.ts` into the HTML, so they survive JavaScript/library failures. The existing 0 EUR nonbinding-proposal statement is preserved from `components/city/sections.tsx`. The actual email is **kontakt@codera.sk**, not the English-spelled address in the earlier generated image.

Library sources: https://threejs.org/docs/ (MIT) and https://gsap.com/docs/v3/Plugins/ScrollTrigger/ (GSAP standard license, https://gsap.com/standard-license/). Libraries remain pinned by the repository lockfile and are not vendored into git.

## Repeatable checks and current validation

With the preview running, `node scripts/jellyfish-check.mjs` runs the lightweight mathematical/HTTP checks without a full application build. The opt-in `npm run prototype:jellyfish:browser` adds automated browser failure cases, navigation and lifecycle checks, viewport screenshots and frame-submission measurements. It requires installed development dependencies and Playwright Chromium (`npm ci`, `npx playwright install chromium`); output is ignored under `test-results/jellyfish`. Neither is required to view the prototype on the home PC.

The 2026-09-17 workstation pass updates Next and its matching ESLint package to 16.3.5 in this branch. Production tests passed 102/102 across three browser engines; online full and production dependency audits reported zero vulnerabilities at check time. [The handoff](../../docs/JELLYFISH_HANDOFF_2026-09-17.md) records final full-verify, focused/browser prototype, hardware, commit/push and CI evidence without conflating these classes. Production Codera City remains separate and unmerged. No new images or videos were generated in this pass.

## Historical validation, 2026-09-16

Focused check: `node scripts/jellyfish-check.mjs` passed. It checks the portfolio pause, deterministic reversal, meaningful near/far range, exactly five projects, served dependencies/assets, path traversal boundaries, and preview-server resource use. JavaScript syntax checks passed.

Browser checked in the Codex in-app browser on this Windows PC, at 1280×720 and a 390×844 viewport override. Inspected hero, macro approach, portfolio, corridor, services and contact. No console errors observed. Static toggle and removal of transition spacers checked. The mobile hero was adjusted after finding overlap between the animal and text. This is viewport testing, not real-phone validation.

Measured machine: Intel Core i5-6500, 4 cores, 7.88 GiB RAM. Approximately 2.4–2.5 GB free system RAM during checks. Preview server about 66–85 MB resident. One browser scene used 15 draw calls before the corridor; portfolio diagnostics reported zero submitted frames. Overall browser/GPU memory and sustained 30 fps are not established by these measurements.

At that historical checkpoint, the full `npm run verify` gate was unavailable because npm and node_modules were absent. Those original-PC limits are not the status of the later workstation pass: use the current handoff above for validation and remote synchronization. No production deployment or merge is implied by either checkpoint.
