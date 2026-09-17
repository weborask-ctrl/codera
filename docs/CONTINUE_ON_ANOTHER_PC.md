# Continue Codera on another PC

Updated 2026-09-17. Branch: `design/jellyfish-study-2026-09-16`.
The autonomous workstation pass extends the lightweight prototype with smoother camera travel, resource cleanup, failure recovery and repeatable checks. The nine earlier concept images and generation prompts remain archived style studies. See [the 2026-09-17 handoff](JELLYFISH_HANDOFF_2026-09-17.md) for the exact pushed commit and final validation evidence. These are working-branch changes; the production Codera City homepage has not been replaced or deployed from this experiment.

## Setup

Install Git and Node 24 LTS. Clone the actual working branch:

```sh
git clone --branch design/jellyfish-study-2026-09-16 https://github.com/weborask-ctrl/codera.git
cd codera
node scripts/jellyfish-preview.mjs
```

Open http://127.0.0.1:4317. Add the cloned folder as a local project in Codex on the new PC. If the repository is already cloned, save any local edits first, then fetch and switch to this branch instead of cloning over it.

The standalone preview needs no full npm install or Next build. Its first launch downloads only the lockfile-pinned Three.js and GSAP browser files; later starts reuse the small local cache. On the weaker home PC, start with the default **Úsporný** setting. If needed, use `http://127.0.0.1:4317/?motion=reduce` for a readable static page, then enable 3D explicitly when ready. Stopping 3D now releases the renderer; all five examples, prices and contacts remain available.

The workstation pass patched Next and its matching ESLint package to 16.3.5 on this working branch. The production test suite passed 102/102 across its three browser engines, and online full/production dependency audits reported zero vulnerabilities at the time of the check. Consult the handoff for the final full-verify, prototype-browser and GitHub synchronization results; these are separate gates, not an assertion that this branch is deployed.

Full checks belong on the workstation: `npm ci`, then `npm run verify`. The new opt-in `npm run prototype:jellyfish:browser` needs the development dependencies and Playwright Chromium installed (`npx playwright install chromium`), with the standalone preview already running. It writes a JSON report and screenshots under ignored `test-results/jellyfish`. It is unnecessary for simply reviewing the prototype at home.

## Resume context

Marcus runs Codera with Peter. Speak Slovak. He positively evaluated the procedural prototype as a useful foundation, not as an approved final visual. His reference ambition is oryzo.ai; do not promise equal quality or 100% fidelity without evidence.

One natural jellyfish must drive the entire spatial story. Scroll controls actual approach, retreat, camera orbit, viewpoint and environmental changes. The rejected eight generated compositions put an organism near content but did not design the motion. Retain these images as style studies only. The five existing portfolio concepts form one ordinary-scroll section with no camera animation between individual examples. Resume the spatial journey after the portfolio. Preserve the other agreed transition ideas.

Never return to the C/logo centerpiece, membrane or ammonite directions. Keep cinematic pearl material, restrained charcoal/petrol/champagne colors, Bricolage Grotesque 800 and Fraunces italic. Large prominent headings are mandatory. Final designs must remove small numbered section captions and equivalent micro-headings. Marcus explicitly deferred that typography cleanup at the current prototype stage.

## Next work

1. Read the handoff and run the existing preview on the home PC. Check the updated approach, oblique pass beside the bell, retreat and backward scroll; the camera now carries velocity through travelling waypoints and still stops for the portfolio and reading holds.
2. Agree the cinematic pace and composition using this lightweight model. Final page layout, heading hierarchy and deferred removal of small numbered labels remain user decisions; this pass did not apply that final redesign.
3. Follow [the production-method brief](JELLYFISH_PRODUCTION_METHOD_2026-09-17.md) to author and evaluate ONE convincing final-quality hero-to-portfolio segment. Compare one rigged master and a prerender from the same master before extending the journey. No new images or videos were generated or paid for in the workstation pass; no final rig exists yet.
4. Validate the chosen candidate on the home PC and a physical phone. Viewport/CPU emulation and workstation measurements do not prove performance on those devices. Extend only a successful production method to the remaining major transitions, then refine final typography and content.
5. Complete the separate release gates and review before any merge or deployment.

## Read first

- `AGENTS.md`, `CLAUDE.md`, `CODERA_DESIGN_INTELLIGENCE/MARCUS_RULES.md`
- `experiments/jellyfish/CONTRACT.md` and `experiments/jellyfish/README.md`
- [Workstation handoff](JELLYFISH_HANDOFF_2026-09-17.md), [authorized plan](JELLYFISH_AUTONOMOUS_PLAN_2026-09-17.md) and [production-method brief](JELLYFISH_PRODUCTION_METHOD_2026-09-17.md)
- `docs/design/jellyfish-study-2026-09-16/README.md` and `PROMPTS.md`
- `STATE.md` for the distinction between production and the isolated experiment.

This document transfers decisions and the working state, not the original chat transcript. Git does not migrate the application's chat history, credentials or local running servers.

## Suggested first message

> Pokračujeme doma na slabšom PC v Codere s medúzou. Prečítaj docs/CONTINUE_ON_ANOTHER_PC.md a docs/JELLYFISH_HANDOFF_2026-09-17.md. Over vetvu a spusti existujúci ľahký prototyp; zopakuj iba kontroly potrebné pre aktuálnu zmenu. Prejdeme kameru a rozhodnutia vyžadujúce môj názor. Zachovaj finálne rozloženie; nové obrázky ani video zatiaľ negeneruj.
