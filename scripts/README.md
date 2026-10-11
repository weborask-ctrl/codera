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

## Silver homepage

- `npm run silver:assets` copies the reviewed browser source and self-hosted assets into ignored `public/silver`, and verifies the selected video integrity. Runs automatically before build.
- `npm run silver:check` runs **`silver-auto-check.mjs` against a local production build only**, defaulting to `http://127.0.0.1:4342/`. Set `SILVER_URL` to another loopback production URL; remote URLs are rejected. The script forwards the real HTML/modules/CSP through a local HTTP proxy (default port 4343), pacing the actual media response consumed by the worker. Cold scenarios use fresh contexts and no-store video. Page, scripts, fonts and images remain **unthrottled**, so the result is a controlled media-transfer test, not a fully throttled whole-page network benchmark.
- `npm run silver:check -- --functional-only` runs entry, accessibility, controls and recovery checks. `--performance-only` runs the cold-media/warm-frame scenarios. Omit both for the complete suite; use `--headed` for a visible test browser. `SILVER_CHECK_FILTER` is a case-insensitive regular expression matching check names; filtered runs are partial evidence, not a full pass. `SILVER_AUTO_REPORT` chooses the JSON report path (default `test-results/silver-auto/report.json`). Set `SILVER_PROXY_PORT` if port 4343 is occupied. On Windows the default browser channel is Edge; `BROWSER_CHANNEL` can override it.
- `METAL_URL=<url> npm run silver:layout` captures six viewport sizes and checks stack geometry and overflow. Run after Playwright (which clears test-results).
- `METAL_URL=<url> node scripts/metal-polish-check.mjs --layout-only` is the older six-size layout probe for glass spacing, stationary film under mouse input and pricing rows. Edge is required. Its standalone media-comparison mode and `metal-smooth-media.py` describe the earlier refinement export, not the selected compressed release asset.

For the selected 1080p60 export, exact encoder parameters, quality comparisons and acceptance limits, read [Automatic Silver motion](../docs/CODERA_AUTOMATIC_MOTION_2026-10-02.md). Actual-frame intervals, source-position lag, readiness and page entry are distinct measurements; a nominal 60 fps file or passing warm sweep does not prove smooth cold scrolling on every device.

**Historical PR #129 probe:** `node scripts/silver-stream-check.mjs` is retained only for the old 50 MB `journey-stream-f60088d67cff.mp4` release and its manual late-entry contract. It is **not** the current `npm run silver:check` and must not be used to certify the automatic compressed-media candidate. Against a checkout serving that historical release, `SILVER_URL` chooses its origin, `SILVER_REPORT` chooses its report, and `SILVER_READY_TIMEOUT_MS` / `SILVER_DOWNLOAD_TIMEOUT_MS` / `SILVER_SUITE_TIMEOUT_MS` override its 45000 / 60000 / 240000 ms budgets. Those timeout variables do not configure the current automatic-entry harness. The older `metal-check.mjs` and Blob/cache-recovery scripts likewise expect superseded diagnostic contracts.
