# scripts/

Development utilities. Every script here must be reachable from `package.json`
and described below. A one-off written during a task either earns an entry in
the same pull request, or it is deleted — git remembers it either way.

## Brand

| Script | npm | What it does |
| --- | --- | --- |
| `generate-brand-mark.mjs` | `npm run brand:mark` | Parametric reconstruction of the C ribbon → SVG assets in `public/brand/`. The single geometry source, shared with the 3D sweep. |
| `build-ribbon-glb.mjs` | `npm run brand:glb` | Builds the production GLB from the same parameters → `CODERA_3D_LOGO_DELIVERABLES/`. Approved references live in `brand/source/`. |

## Capture

Require a dev server on port 3000 (`.claude/launch.json` → `codera-dev`). Pass
an output directory; keep it out of the repository.

| Script | npm | What it does |
| --- | --- | --- |
| `capture-devices.mjs` | `npm run capture -- <dir>` | The five acts at tablet 768×1024 and mobile 390×844. |
| `capture-boards.mjs` | `npm run capture:boards -- <dir>` | The Step 5 composition boards from `/boards`. |
| `clients/ecodomcek/boards/capture.mjs` | `npm run capture:ecodomcek [filter] [-- --render]` | The EcoDomček art direction boards → `clients/ecodomcek/boards/out/`. `--render` composites the Cycles plates from `boards/render/` under the DOM (this is the current form); without it the three.js study is used. Serves the folder itself; no dev server, no network. |
| `clients/ecodomcek/cycles/build.py` | `python3 clients/ecodomcek/cycles/build.py --all --quality final` | Renders the eight board plates with Blender-as-a-module (Cycles, CPU) into `clients/ecodomcek/boards/render/`, with an `.anchors.json` of projected annotation points beside each. `--quality test` (25 %, ~8 s) for iteration. See `cycles/SPEC.md`. |

## References

| Script | npm | What it does |
| --- | --- | --- |
| `harvest-references.mjs` | `node scripts/harvest-references.mjs [slug ...]` | Dissects reference sites into `CODERA_DESIGN_REFERENCES/` — shots at reading moments plus measured facts. Reusable for client projects. |

## Measurement

| Script | npm | What it does |
| --- | --- | --- |
| `measure-experience.mjs` | `npm run measure -- <url>` | Frame pacing through the whole journey under CPU throttle, plus mobile LCP. Run against a **production** server (`npm run build && npm run start -- --port 3300`), never against dev. |
| `probe-lcp.mjs` | `npm run probe:lcp -- <url>` | LCP and CLS for one URL. |
| `probe-mobile.mjs` | `npm run probe:mobile -- <url>` | Mobile-specific probe: overflow, tier decision, scroll behaviour. |
| `smoke-preview.mjs` | `npm run smoke -- <url> [dir]` | Smoke test a preview or production URL: status, hydration, canvas presence, screenshots. |

The superseded scripts (`capture-v3`, `capture-v4`, `probe-premena`,
`probe-premena2`, `shot-offer`, `watch-ci-preview`, `capture-work-textures`)
were deleted with the v2 experience on 2026-08-31 — git remembers them.
