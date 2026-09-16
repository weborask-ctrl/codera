# Continue Codera on another PC

Updated 2026-09-17. Branch: `design/jellyfish-study-2026-09-16`.
The prototype, nine archived concept images, original generation prompts and Marcus's heading rules were pushed to this branch through commit `649f829`. The production `master` branch was not changed.

## Setup

Install Git and Node 24 LTS. Clone the actual working branch:

```sh
git clone --branch design/jellyfish-study-2026-09-16 https://github.com/weborask-ctrl/codera.git
cd codera
node scripts/jellyfish-preview.mjs
```

Open http://127.0.0.1:4317. Add the cloned folder as a local project in Codex on the new PC. If the repository is already cloned, save any local edits first, then fetch and switch to this branch instead of cloning over it.

The standalone preview needs no full npm install. For full application checks on the more powerful PC, install the locked dependencies with `npm ci`, then run `npm run verify`. Full validation was unavailable on the original PC. Focused prototype and browser checks passed; see the experiment README. A pushed branch is not a verified production release.

## Resume context

Marcus runs Codera with Peter. Speak Slovak. He positively evaluated the procedural prototype as a useful foundation, not as an approved final visual. His reference ambition is oryzo.ai; do not promise equal quality or 100% fidelity without evidence.

One natural jellyfish must drive the entire spatial story. Scroll controls actual approach, retreat, camera orbit, viewpoint and environmental changes. The rejected eight generated compositions put an organism near content but did not design the motion. Retain these images as style studies only. The five existing portfolio concepts form one ordinary-scroll section with no camera animation between individual examples. Resume the spatial journey after the portfolio. Preserve the other agreed transition ideas.

Never return to the C/logo centerpiece, membrane or ammonite directions. Keep cinematic pearl material, restrained charcoal/petrol/champagne colors, Bricolage Grotesque 800 and Fraunces italic. Large prominent headings are mandatory. Final designs must remove small numbered section captions and equivalent micro-headings. Marcus explicitly deferred that typography cleanup at the current prototype stage.

## Next work

1. Establish the new PC's actual capabilities and run the existing prototype before changing it.
2. Refine and agree the camera choreography using the lightweight model.
3. Produce ONE convincing final-quality hero-to-portfolio segment before authoring the rest. A rigged jellyfish or Higgsfield video may be evaluated; no video generation has been commissioned or executed yet. Generated video identity consistency and reversible scroll seeking need testing.
4. Extend an approved production method to the remaining transitions, then refine typography and content.
5. Complete responsive, performance and full application checks before deployment.

The previous rough estimate was 2–3 weeks of focused work with stable direction and usable production assets. It is an estimate, not a deadline or guarantee; reassess after the first final-quality segment.

## Read first

- `AGENTS.md`, `CLAUDE.md`, `CODERA_DESIGN_INTELLIGENCE/MARCUS_RULES.md`
- `experiments/jellyfish/CONTRACT.md` and `experiments/jellyfish/README.md`
- `docs/design/jellyfish-study-2026-09-16/README.md` and `PROMPTS.md`
- `STATE.md` for the distinction between production and the isolated experiment.

This document transfers decisions and the working state, not the original chat transcript. Git does not migrate the application's chat history, credentials or local running servers.

## Suggested first message

> Pokračujeme v redizajne Codery s medúzou na výkonnejšom PC. Prečítaj docs/CONTINUE_ON_ANOTHER_PC.md a dokumenty, na ktoré odkazuje. Najprv over vetvu a spusti existujúci prototyp. Zachovaj dohodnutý smer; nové obrázky ani video zatiaľ negeneruj.
