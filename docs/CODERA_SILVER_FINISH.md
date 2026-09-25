# Silver: precise typography and curves — 2026-09-24

Marcus approved implementation and merge of the refinement plan. Preserve the
existing story, copy, prices, palette, stacked complete previews and SVG wordmark.

## Implemented decisions

- Direction C: Geist throughout, including emphasized headline lines and the
  time unit. Main headings use weight 600, secondary lines 500. Hero tracking
  changes from -0.067em to -0.042em, with -0.035em on the second line. Native
  text remains unfiltered; no bitmap or transform scaling supplies font size.
- Main section heading/copy columns use 1.618:1 on desktop and a single column
  on mobile. Tablet heading sizes and the narrow pricing title are tuned to
  their actual available space. Existing aligned pricing subgrid is retained.
- Compared CSS superellipse(1.35) and superellipse(1.65). The quieter 1.35
  preserves more of the approved roundness and precise terminal. It applies
  to section backgrounds, offer/proposal/contact surfaces and both preview
  frame layers. Existing border radii remain the fallback. No animated masks
  or additional rendering library. This is CSS's curvature parameter, not
  the mathematical Lamé exponent. Reference: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/superellipse
- The single neutral glass treatment uses less opaque highlights, 8px instead
  of 12px backdrop blur and a lighter outer shadow. Preview imagery itself
  has no blur. Equal four-sided padding and complete images remain intact.

## Media audit and decision

The provided MOV is 1920×1080, 24fps HEVC 10-bit 4:4:4. The existing web
delivery is 1920×1080, 60fps H.264, generated using offline interpolation.
Three representative positions (opening, tunnel, ending) were compared with
the source and two trial exports from the existing interpolated master.

| Export | CAS | CRF | Bytes |
| --- | ---: | ---: | ---: |
| Existing delivery | 0.55 | 15 | 33,549,435 |
| Gentler trial | 0.30 | 13 | 43,068,431 |
| Stronger trial | 0.70 | 13 | 49,487,265 |

Browser comparison includes DPR 1 and 2. The trials mostly alter local edge
contrast and add transfer weight (28% and 48%); they do not resolve the soft
texture already present in the generated source. Retain the existing media,
poster, seek scheduling, scroll travel and captions. No claim of newly
recovered detail or native 4K. Local candidate exports are not published.

## Validation

- Production build, TypeScript and Biome pass; the existing 14 style warnings
  and one informational message remain.
- Six viewport sizes: 1440×900, 1078×646, 768×900, 390×844, 320×568 and
  844×390. Check live text bounds, uniform font, complete previews, equal
  frame gaps, centered time group, modal controls and pricing rows including
  independently expanded details.
- 37 production browser checks cover actual intermediate frames, forward and
  reverse seeking, slow range requests, pause/recovery, no mouse movement,
  reduced motion, touch opt-in, no-JS content and no desktop JS errors.
- Visual review covers hero, portfolio, offers, process and contact on desktop
  and narrow mobile widths. Tests run on the available Windows machine with
  browser viewport/touch emulation; these are not physical iPhone tests.

Review artifacts stay local in test-results/silver-finish and
.prototype-cache/silver-polish. The implementation adds no runtime dependency.
