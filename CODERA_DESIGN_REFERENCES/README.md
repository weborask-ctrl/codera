# CODERA_DESIGN_REFERENCES — the concrete-reference library

Created 2026-08-31 after the Step 7 direction boards were rejected as
"AI-looking". The verdict exposed the gap this library closes: the Step 1
library (`CODERA_DESIGN_INTELLIGENCE/`) holds distilled *principles*, and
principles alone reproduce generic taste. What was missing is a library of
**concrete, named, dissected reference sites** — and, critically, **Ondrej's
verdict on each one**, because taste cannot be scraped; it has to be pointed
at real things and confirmed.

## The rule (mirrored in CLAUDE.md)

**No visual design work starts without loading records from this library, and
every design PR names the records that drove its decisions.** A design that
cannot cite its references is presumed generic and is not built.

## The pipeline

```
1. HARVEST      Browse the source galleries. For each candidate site:
                screenshots at its reading moments (stored in shots/),
                computed-style probes (real font stacks, sampled palette),
                scroll-beat inventory. One MD record per site in records/.

2. CALIBRATE    Ondrej reviews a numbered contact sheet of the candidates
                and marks each LIKED / REJECTED, ideally with one word why.
                This is the step that fixes "you don't know what we want".
                A record without a verdict is a candidate, not a reference.

3. DIRECT       The art direction is derived ONLY from LIKED records. Every
                decision in the direction document cites record IDs. REJECTED
                records stay in the library as documented anti-taste.

4. BUILD        Implementation loads the direction document plus the records
                it cites. The review compares built frames against the
                reference screenshots side by side.

5. GROW         Every future client project adds its harvest here. Records
                are dated; a site that redesigns gets a new record, never an
                edit of the old one.
```

## Sources

| Source | What it is | Access |
| --- | --- | --- |
| godly.website | Curated modern web design, strong 3D/WebGL section — the closest match to the "5D" genre | Free, browseable |
| awwwards.com | SOTD/Annual winners, filterable by Three.js/WebGL/GSAP | Free to browse |
| refero.design | The Step 1 source; structured per-site design data | MCP configured, **awaits authorization** — optional, subscription |
| lusion.co · activetheory.net · refokus.com | The benchmark studios themselves | Free |
| threejs.org showcase | Canonical WebGL work | Free |
| curated.design · dark.design · minimal.gallery | Secondary sweeps for specific moods | Free |

No gallery ships MD files; the records here are our own dissection, which is
where the value is. Screenshots are captured by us for internal study.

## Record schema — `records/<slug>.md`

```markdown
---
id: <slug>
url: <live url>
captured: <date>
tags: [5d, webgl, light-world, ...]
verdict: PENDING | LIKED | REJECTED
verdict-note: <Ondrej's words, verbatim>
---

## Shots
shots/<slug>-01.png … (reading moments, desktop; mobile where it matters)

## Measured
- Palette: sampled hex values with their roles (ground / ink / accent)
- Type: real families from computed styles; display size, weights, tracking
- Layout: grid, density, viewport beats
- Motion inventory: per scroll beat — what moves, what holds, input latency feel
- 5D staging: camera, depth, materials, light; what is DOM vs canvas

## Why it works
<analysis — the logic, not the pixels>

## What we take / what we refuse
<transferable decisions; and what would NOT fit Codera>
```

## Relationship to the Step 1 library

`CODERA_DESIGN_INTELLIGENCE/` stays — it answers "what is appropriate for
which client". This library answers "what does excellent actually look like,
concretely, and which of it does Ondrej respond to". Directions need both:
the engine picks the family, the records set the bar.
