# CODERA DESIGN INTELLIGENCE

A reusable design-intelligence library for Codera client work across
industries, audiences, moods, and commercial goals. Built 2026-08-27
from a catalogue-wide study of 1,290 production design systems
(styles.refero.design) — 100% enumerated and characterized, 18 deep
structural studies, synthesized into principles (never copies).

**For the current Codera website, read `13_CODERA_CURRENT_SYSTEM.md` first.**
It distinguishes the deployed Silver baseline, local changes and historical
studies. For any new client project, run `DESIGN_DECISION_ENGINE.md`
first — it derives a style direction from the client context and
outputs a one-page design brief. Then read the chosen family's record
in `styles/` and the relevant system files (04–09). `10` is the audit
companion; `03` is the industry prior.

**Current motion work — 2026-10-02:** Marcus authorized a modest compression/size
compromise for faster automatic motion and rejected a mandatory start button.
The current locally validated implementation preserves the supplied Silver film at 1080p60 in
an 11.2 MB H.264 stream, activates normal desktop/touch visits automatically,
and respects reduced-motion/manual pause. Local acceptance passed 15/15 checks;
remote CI, merge and deployment evidence are tracked in
[PR #131](https://github.com/weborask-ctrl/codera/pull/131). PR #129 is the preceding release. Earlier full-Blob and
byte-identical 50 MB rules are historical, superseded for this iteration.
Read [the current bible](13_CODERA_CURRENT_SYSTEM.md) and
[Automatic Silver motion](../docs/CODERA_AUTOMATIC_MOTION_2026-10-02.md)
for media comparisons, reproduction, limits and subsequent release evidence.

## Files

| File | What it holds |
| --- | --- |
| `00_INDEX.md` | this map |
| `13_CODERA_CURRENT_SYSTEM.md` | current Codera bible: pages, fonts, corners, golden-ratio use, scroll video and reusable rules |
| `01_DESIGN_FOUNDATIONS.md` | cross-family principles: the light-majority fact, restraint grammar, scale ratios, whitespace, imagery discipline, review order |
| `02_STYLE_TAXONOMY.md` | the 18 archetypes, their axes, legal and failing hybrids |
| `03_INDUSTRY_STYLE_MATRIX.md` | industry → default / differentiator / avoid mapping + the construction-vs-kids calibration |
| `04_TYPOGRAPHY_SYSTEMS.md` | pairing strategies, scale architecture, tracking rules, font census, Slovak/CEE checks |
| `05_COLOR_SYSTEMS.md` | canvas logic, accent economy, neutral ladders, shadowless elevation, dark/light dramaturgy |
| `06_LAYOUT_SYSTEMS.md` | page models, section dramaturgy, hero grammars, grids, density zoning, scroll economy |
| `07_COMPONENT_LANGUAGE.md` | radius dialects, button hierarchy, nav, cards, forms, metadata, commerce, trust |
| `08_MOTION_AND_SPATIAL_DESIGN.md` | motion purpose hierarchy, static-frame law, scroll-driven storytelling, spatial/3D rules *(to be extended by the Step 3 Refokus study)* |
| `09_MOBILE_DESIGN.md` | re-direction over reduction, touch mechanics, iOS traps, performance reality, validation tiers |
| `10_DESIGN_ANTI_PATTERNS.md` | the failure catalogue across identity, color, type, layout, components, motion, imagery, mobile, process |
| `11_CODERA_APPLICATION.md` | the Codera-specific outcome: dynamic dark/light contrast system, portfolio-as-range-proof |
| `DESIGN_DECISION_ENGINE.md` | the mandatory context→direction procedure with probes and the brief template |
| `COVERAGE_AND_SOURCES.md` | honest accounting of what was and wasn't studied |

## Style archetype records (`styles/`)

dark-cinematic · light-editorial · warm-editorial · minimal-swiss ·
luxury-fashion · industrial-architectural · corporate-institutional ·
healthcare-clinical · playful-kids · ecommerce-product ·
hospitality-sensory · organic-natural · tech-saas ·
brutalist-experimental · high-color-expressive · soft-pastel-friendly ·
image-led · retro-craft

Each record: emotional tone, audience/business fit, poor-fit contexts,
canvas behavior, color logic, typography logic, spacing/density,
layout/composition, imagery direction, component language, motion
behavior, mobile adaptation, strengths, failure modes, combination
guidance.

## Data (`data/`)

- `refero-catalogue.tsv` — the full 1,290-entry factual index (name,
  scheme, descriptor, fonts, palette, category tags) for finding more
  references per family
- `archetype-assignment.json` — per-entry family assignments
- `aggregates.md` — the census numbers cited throughout

## Standing laws (short form)

1. Style is DERIVED from context, never defaulted from fashion.
2. One action color; supporting accents have named jobs.
3. Closed radius and weight vocabularies, written down.
4. Whitespace jump (macro≫micro) creates composition.
5. One imagery grammar per brand.
6. Motion never rescues weak static design; text always gets a
   readable hold.
7. Mobile is re-directed, not shrunk.
8. Appropriateness beats attractiveness; extract logic, never copy.

Historical release: [PR #129 original-film streaming](../docs/CODERA_ORIGINAL_VIDEO_STREAM_2026-09-27.md), merged 2026-09-27, preserved encoded samples. Current implementation: [Automatic Silver motion — 2026-10-02](../docs/CODERA_AUTOMATIC_MOTION_2026-10-02.md), with an explicitly authorized compression compromise, 15/15 local checks passed; release evidence is tracked in PR #131.

- [Mobile/tablet refinement and automatic video compatibility](../docs/CODERA_MOBILE_TABLET_2026-10-05.md) — approved 2026-10-05; validation limits included.
