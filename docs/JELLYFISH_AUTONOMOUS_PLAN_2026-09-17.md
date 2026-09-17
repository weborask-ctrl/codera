# Jellyfish — autonomous workstation pass, 2026-09-17

## Authorization and objective

Marcus requested approximately one hour of autonomous work on the stronger PC: security, reliability, measurements and cinematic-motion improvements, preserving the final page layout, followed by a push and instructions for continuing on his lower-resource machine. This is the authorized implementation contract for the isolated experiment, not a production redesign approval.

Baseline: `a7ab9fa6f7e00d31e9b70305c1529ac9b5c0f684`, branch `design/jellyfish-study-2026-09-16`. Start around 13:24 UTC. The duration is a working envelope; verified work and a usable handoff take priority.

Execution complete: phases 0–3 delivered in code/evidence revision `4752638`; LOCAL gates passed and GitHub CI run `35229531098` is green. The [handoff](JELLYFISH_HANDOFF_2026-09-17.md) is the final result and continuation record. The security phase also applied the narrowly scoped transitive `js-yaml` advisory fix discovered during its online audit. No final production asset or deployed redesign is claimed.

## Phase 0 — documentation discovery (about 8 minutes)

Read AGENTS/CLAUDE, MARCUS_RULES, experiment CONTRACT/README, continuation documents, implementation, test patterns and LIKED Active Theory/Exo Ape records; inspect the approved hero. Confirm the remote branch, hardware, preview and live dependency advisories.

Allowed APIs/patterns established from source and documentation:

- `scene.mjs`: createWorld(container), render(state,time,stage), resize, stats, setQuality, downgrade, dispose. Use these for runtime lifecycle.
- `choreography.mjs`: frames, flattenFrame, journeyAt(y,bounds); portfolio timeline plateau and service/process holds remain behavioral invariants.
- GSAP timeline/ticker and ScrollTrigger already used by main.mjs; one clock, native scroll. New pure camera sampling does not introduce another motion engine.
- Browser pagehide/pageshow/visibilitychange, WebGL context events; Playwright browser/context/page APIs and Chromium's CPU throttling diagnostics.
- Local Next install/upgrade guides and vendor security release: verified Next 16.3.5 accepts current React 19.2.4 and contains patched PostCSS/sharp. Pin matching eslint-config-next.

Baseline findings: focused check and typecheck/build previously passed; Biome rejects two empty contacts; live audit reports Next/PostCSS/sharp vulnerabilities. Page restoration fails to wake ticker/health checks; lazy WebGL misses context-loss handling; static mode retains resources; failed startup can lose its explanation.

## Phase 1 — security and runtime foundation (about 17 minutes)

1. Follow Next's documented manual update pattern, pin Next and ESLint config to 16.3.5 and update the lockfile. Retain compatible React and unrelated dependencies. Verify online audits, not cached/offline audit output.
2. Use the preview server's existing imported business data for escaped accessible contacts, preserving composition and section markers.
3. Consolidate async initialization, failure and restart using the world API. Handle missing libraries, lazy WebGL, context loss, hidden pages, page restoration, health timers and real resource disposal on stop.
4. Keep five normal-flow concepts and conservative defaults. Bound health requests and keep readable content under loading failures.

References: scripts/jellyfish-preview.mjs allowlisted serving and lockfile integrity; main.mjs orchestration; scene.mjs disposal; lib/site-config.ts facts; Next local upgrade/install documentation.

Verification: Biome/typecheck/build, focused checks and browser fault cases, unchanged content structure/prices. Guards: no lint suppression, duplicate facts, extra clock, unbounded canvas or broad automatic dependency upgrade.

## Phase 2 — cinema and repeatable measurements (about 20 minutes)

1. Copy the existing frame schema and improve intro camera approach, oblique bell passage and retreat. Use a pure shape-preserving smooth sampler to eliminate complete stop/start at every camera waypoint while retaining exact portfolio/services/process holds and deterministic reverse seeking. Keep all layout dimensions.
2. Refine pearl proxy shading only if the same geometry and pixel budgets support it. This remains a procedural proxy, not a photorealistic production asset.
3. Add a documented browser-check command: forward/backward positions, portfolio/static sleep, reduced motion, context and library/config faults, anchors, desktop/tablet/narrow phone framing, horizontal overflow, frame pacing and memory caps. Output compact JSON and representative screenshots under ignored test-results.
4. Write a primary-source-backed production-method note comparing authored realtime 3D and reversible prerendered media. Define the first hero-to-portfolio experiment and bounded memory requirements.

References: frames/journeyAt, existing Playwright configuration/measurement scripts, LIKED Active Theory/Exo Ape and Marcus rules; Three AnimationMixer.setTime/GLTFLoader, Khronos glTF, MDN currentTime/requestVideoFrameCallback and W3C WebCodecs.

Verification: compare same scroll positions both directions, camera clearance and hold stability; zero submissions during portfolio/static/hidden states; bounded drawing buffers; screenshot and error review. Identify actual renderer before attributing results to the RTX GPU. Guards: no screenshot scenery, project-to-project travel, raised old-PC defaults, new generated media, or claim of final photographic quality.

## Phase 3 — review, validation and home handoff (about 15 minutes)

Review runtime races, camera continuity, unwanted layout changes and fact drift; correct concrete regressions. Run full npm run verify, focused/browser prototype checks and relevant production Playwright tests. Repeat only checks affected by corrections.

Record measured settings/results, limitations, changes and pending user decisions in docs/JELLYFISH_HANDOFF_2026-09-17.md; update experiment README and continuation entrypoint. Commit verified work, push this working branch, confirm remote SHA and GitHub Actions. Keep LOCAL/CI/PREVIEW/DEVICE distinct.

Home remains: node scripts/jellyfish-preview.mjs, without npm install or Next build. The handoff separates light viewing/decisions from workstation measurements and production assets so discovery need not be repeated.
