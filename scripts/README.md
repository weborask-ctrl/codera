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
| `capture-work-textures.mjs` | `npm run capture:textures -- <dir>` | The `/textures` material studies. |

## Measurement

| Script | npm | What it does |
| --- | --- | --- |
| `measure-experience.mjs` | `npm run measure -- <url>` | Frame pacing through the whole journey under CPU throttle, plus mobile LCP. Run against a **production** server (`npm run build && npm run start -- --port 3300`), never against dev. |
| `probe-lcp.mjs` | `npm run probe:lcp -- <url>` | LCP and CLS for one URL. |
| `probe-mobile.mjs` | `npm run probe:mobile -- <url>` | Mobile-specific probe: overflow, tier decision, scroll behaviour. |
| `smoke-preview.mjs` | `npm run smoke -- <url> [dir]` | Smoke test a preview or production URL: status, hydration, canvas presence, screenshots. |

## Superseded — delete in a follow-up pull request

Kept only until it is confirmed nothing depends on them. They duplicate the
scripts above or served a single past task:
`capture-v3.mjs`, `capture-v4.mjs`, `probe-premena.mjs`, `probe-premena2.mjs`,
`shot-offer.mjs` (a single screenshot of the offer section, taken once against
production), `watch-ci-preview.mjs` (replaced by `gh run watch` and
`/release-check`).
