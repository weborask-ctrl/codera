# Codera brand assets

## Source of truth

The authoritative reference is the **approved raster logo supplied by the
client** (folded-ribbon C, satin metal on near-black, with the spaced CODERA
wordmark beneath): `brand/source/01_APPROVED_CODERA_LOGO_REFERENCE.jpg` and
the isolated mark `brand/source/02_CODERA_C_MARK_REFERENCE.png`. The files
here are a clean vector reconstruction of that mark — the raster is a
reference, not a production asset.

The SVGs are **generated, never hand-edited**: `scripts/mark-outline.mjs`
holds the outline measured from the reference (row by row, in a 100-unit
box), `scripts/generate-brand-mark.mjs` renders it as the two SVGs, and
`scripts/compare-brand-mark.mjs` puts the result over the reference and
measures the overlap. Editing the mark means editing the outline, re-running
`npm run brand:mark`, and re-running `npm run brand:compare`.

## What the reference actually is (measured 2026-09-16, issue #6)

- two parallel **45° arms** — the top one thicker (≈ 38 % of the height,
  perpendicular) than the bottom one (≈ 25 %), the way the render's
  perspective left them
- **horizontal terminal cuts** on both arms, not diagonal ones
- a horizontal crease under the top arm at ≈ 26 % of the height; a 45°
  crease along the bottom arm from the counter down to the baseline
- a rounded chevron fold on the left: the outer apex at the left edge at
  ≈ 52 % of the height, the counter's apex at ≈ 30 % of the width
- the fold logic: bright front face (top arm) → grey back face through the
  fold → bright front face (bottom arm), with a bright rim where the front
  face wraps the outer edge, thin at the top and widening downward
- proportions: width ≈ 0.985 × height; the SVG box is square with a
  1.5-unit margin

## What must be preserved

- the silhouette above, a C folded from one flat ribbon
- the right-facing opening whose negative space reads as a chevron
- the fold logic and the two crease shadows
- the horizontal terminals

Experimental transformation of the 3D object is allowed; it must resolve back
to this recognisable mark.

## Files

| File | Use |
| --- | --- |
| `codera-mark.svg` | The C mark, full satin-metal treatment for a dark ground. Standalone, no background. Hero-scale and `/boards`. |
| `codera-mark-mono.svg` | One-colour version, inherits `currentColor` (straps full opacity, back band 45 %, rim as a clipped stroke). Nav (20 px), footer (14 px), paper chapters. Checked legible down to 14 px on both grounds. |

The favicon (`app/icon.svg`) and the Open Graph image use a simpler arc
(`components/site/arc.tsx`), deliberately: at 16 px the folded C is a blob.

## Wordmark and combined logo

The `CODERA` wordmark is deliberately **not** an SVG asset: it stays sharp DOM
text so it remains typographically precise, selectable and responsive. The
combined logo is the composition `mark + wordmark` in the site's `Logo`
component. The three are logically separated: mark (SVG), wordmark (DOM type),
combined (component).

## Fidelity status

Measured against the reference on 2026-09-16 (`npm run brand:compare`,
`docs/MARK_COMPARISON_2026-09-16.jpg`): silhouette overlap 0.972, front-face
overlap 0.701, aspect 0.997 vs 0.985. The previous sweep-based SVG measured
0.741 / 0.533 — it had horizontal arms and diagonal cuts, which the reference
does not. Accepted; the remaining front-face difference is the reference's
satin gradient, which no flat threshold splits cleanly.

## The 3D ribbon

`public/brand/codera-c-ribbon.glb` is still swept from the parametric spine
in `scripts/generate-brand-mark.mjs` (`sweepData()` → `lib/ribbon-geometry.json`
→ `npm run brand:glb`). It is used only by the development route `/logo-lab`;
the ribbon left the homepage on 2026-09-05. If it returns, the sweep must be
re-derived from the measured outline first — the two geometries diverge today
and the SVG is the one that matches the client's mark.
