# scripts/

Development utilities. Every script here must be reachable from `package.json`
and described below. A one-off written during a task either earns an entry in
the same pull request, or it is deleted — git remembers it either way.

## Brand

| Script | npm | What it does |
| --- | --- | --- |
| `generate-brand-mark.mjs` | `npm run brand:mark` | Renders the two SVGs in `public/brand/` from `mark-outline.mjs` (the outline measured from the approved raster, issue #6) and writes `lib/ribbon-geometry.json` from the older parametric sweep, which only the `/logo-lab` GLB still uses. |
| `compare-brand-mark.mjs` | `npm run brand:compare -- [dir]` | The SVG over `brand/source/02_CODERA_C_MARK_REFERENCE.png` at the same scale: silhouette and front-face overlap (IoU), optionally the side-by-side image for the pull request. Last: 0.972 / 0.701. |
| `build-ribbon-glb.mjs` | `npm run brand:glb` | Builds the GLB from the sweep → `CODERA_3D_LOGO_DELIVERABLES/`. Lab only; the sweep does not match the reference as well as the outline does. |

## Capture

Require a dev server on port 3000 (`.claude/launch.json` → `codera-dev`). Pass
an output directory; keep it out of the repository.

| Script | npm | What it does |
| --- | --- | --- |
| `capture-devices.mjs` | `npm run capture -- <dir>` | The five acts at tablet 768×1024 and mobile 390×844. |
| `capture-boards.mjs` | `npm run capture:boards -- <dir>` | The Step 5 composition boards from `/boards`. |

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

## `npm run fonts` — `build-fonts.mjs`

Builds `app/fonts/*.woff2` from the google/fonts variable sources with harfbuzz (`subset-font`): weights pinned or narrowed to what the site renders, Fraunces keeping its optical-size axis, Bricolage instanced where Google's static 800 sat, one file per face over Basic Latin + Latin-1 + Latin Extended-A. Re-run after changing which weights the site uses; commit the outputs. Sources are fetched into the OS temp dir, never committed.
