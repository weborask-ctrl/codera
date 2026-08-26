# Codera brand assets

## Source of truth

The authoritative reference is the **approved raster logo supplied by the
client** (folded-ribbon C, satin metal on near-black, with the spaced CODERA
wordmark beneath). The files here are a clean vector reconstruction of that
mark — the raster itself is a reference, not a production asset, and was not
committed to the repository.

The reconstruction is **parametric**: `scripts/generate-brand-mark.mjs` holds
the geometry as a centreline spline + band width + two crease planes + two
terminal cuts, and emits both SVGs. Editing the mark means editing those
parameters and re-running the script — never hand-editing the emitted path
data. The same parameters are the source geometry for the 3D ribbon, so the
spatial object and the static mark can never drift apart.

## What must be preserved

- overall silhouette — a C built from a folded flat ribbon
- the characteristic right-facing opening whose negative space reads as a chevron
- the fold logic: bright front face → grey back face through the left curve → bright front face
- the two diagonal crease lines and the crease shadows
- the two diagonally-cut terminals
- proportions (≈ 1 : 1.05, band ≈ 26% of height)

Experimental transformation of the 3D object is allowed; it must resolve back
to this recognisable mark.

## Files

| File | Use |
| --- | --- |
| `codera-mark.svg` | The C mark, full satin-metal treatment. Standalone, no background. Hero-scale and OG usage. |
| `codera-mark-mono.svg` | One-colour version, inherits `currentColor` (straps full opacity, back band 45%). Nav, footer, favicon-scale, paper chapters. |

## Wordmark and combined logo

The `CODERA` wordmark is deliberately **not** an SVG asset: per the brand
direction it stays sharp DOM text — Archivo, semibold, wide tracking,
uppercase — so it remains typographically precise, selectable and responsive.
The combined logo is the composition `mark + wordmark` in the site's `Logo`
component. The three are logically separated: mark (SVG), wordmark (DOM type),
combined (component).

## Fidelity status

The reconstruction matches the approved mark in structure, fold logic,
terminals and proportion. A final side-by-side fidelity pass against the
raster happens in Phase 2, when the identical parameters are built as the 3D
ribbon and both can be tuned together.
