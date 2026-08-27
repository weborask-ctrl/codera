# Design Decision Engine

The mandatory procedure that derives a visual direction from CLIENT AND
BUSINESS CONTEXT, never from default aesthetic preference. Run it
before any moodboard, any palette, any layout. Output: a one-page
DESIGN BRIEF with a primary family, a signature constraint, and the
token-level consequences.

---

## Phase 1 — Context intake (answer ALL twelve; no skipping)

1. **Industry** — sector and sub-sector (a chalet ≠ a hostel).
2. **Audience** — who decides, who uses, age/design-literacy/device mix;
   dual audiences flagged (child+parent, patient+doctor, user+buyer).
3. **Price positioning** — discount / market / premium / luxury. Design
   must match the price or it reads as fraud in either direction.
4. **Brand personality** — 3 adjectives the client claims + 3 the
   current material actually projects (the gap is the work).
5. **Product/service** — physical, digital, service, place; can it be
   photographed, screenshotted, or must it be illustrated?
6. **Trust requirements** — low (snack brand) → maximal (health,
   finance). Sets the ceiling on expressiveness.
7. **Emotional target** — the ONE feeling at first viewport (desire,
   calm, awe, appetite, confidence, joy) and the feeling at conversion
   (they differ; design the arc).
8. **Content type & volume** — words, images, data, video available
   TODAY (not promised). Editorial families die without imagery;
   density needs structure.
9. **Image/asset availability** — commissioned photography? budget for
   it? If no and none: image-led and hospitality grammars are OFF the
   table regardless of fit.
10. **Primary conversion goal** — buy, book, enquire, sign up, read,
    donate — and its urgency profile.
11. **Device/interaction context** — mobile share, desk vs. on-the-go,
    old-hardware exposure, accessibility obligations.
12. **Technical constraints** — stack, performance budget, CMS/authors,
    maintenance reality (a 3-person client can't feed a masonry wall of
    work).

## Phase 2 — Derivation rules (mechanical, in order)

R1. Trust ≥ high → shortlist from {healthcare, corporate, minimal-swiss,
    warm-editorial}; expressive families only as bounded devices.
R2. Luxury price → {luxury, warm-editorial, image-led}; forbid density,
    urgency furniture, and filled-accent shouting. Discount price →
    forbid luxury grammar (it reads dishonest).
R3. Sensory product (food/place/fabric) → photography-led families; no
    commissioned imagery → REDIRECT to type-led families and say why.
R4. Children in audience → {playful, pastel}; child+parent → playful
    surface + calm trust layer for the deciding parent.
R5. Software product → tech-saas chassis; then choose its pole (quiet
    white / warm paper / dark instrument) from personality + audience.
R6. Portfolio/creative seller → the WORK is the hero: {editorial,
    image-led, brutalist}; the site must not outshout its own cases.
7.  Emotional target maps canvas: calm→warm paper; awe→dark stage;
    appetite→warm + hot accents; competence→white/swiss; joy→playful.
R8. Content-thin → forbid minimalism-as-emptiness; choose families that
    structure little content richly (band-stacked, statement type).
    Content-heavy → families with density zoning (swiss, corporate,
    SaaS).
R9. Old-hardware / low-bandwidth audience → forbid WebGL-dependent
    directions; cap motion tier.
R10. Cross-check the shortlist against 03_INDUSTRY_STYLE_MATRIX
    (default / differentiator / avoid). A differentiator pick requires
    naming the execution risk and the client's appetite for it.

## Phase 3 — The four probes (kill weak picks before committing)

- **Swap probe:** put the shortlisted style on the client's WORST
  competitor. Still fits? Then it's generic to the category — find the
  signature constraint that makes it theirs.
- **Opposite probe:** sketch one screen in the opposite family. If it
  arguably serves the goals better, the derivation was preference in
  disguise — re-run Phase 2.
- **Pause probe:** describe the homepage with all motion/effects
  removed. If the description isn't compelling, the direction leans on
  decoration.
- **Grandmother/CFO probe:** the least design-literate stakeholder must
  still read trust and clarity; the most cynical one must find nothing
  to object to on factual surfaces.

## Phase 4 — Output: the one-page design brief

```
CLIENT:            …
PRIMARY FAMILY:    … (from 02_STYLE_TAXONOMY)
SECONDARY DEVICE:  … (one bounded borrow, or "none")
SIGNATURE          one ownable constraint, stated as a law
CONSTRAINT:        (e.g. "no filled buttons", "0% chrome color",
                   "everything is a pill", "serif only at moments")
CANVAS:            temperature + hex class + dark/light dramaturgy
                   (which mode owns, where acts break, what motivates)
TYPE STRATEGY:     pairing strategy + ratio + weight cap (04)
ACCENT ECONOMY:    action color + supporting accents WITH JOBS (05)
RADIUS DIALECT:    the closed set (07)
IMAGERY LANGUAGE:  the ONE grammar + sourcing plan (available today)
MOTION TIER:       feedback-only / +reveals / +storytelling (08)
MOBILE DIRECTION:  what re-directs, not shrinks (09)
FORBIDDEN:         3–5 explicit anti-patterns for THIS project (10)
```

## Phase 5 — Self-audit before presenting

□ Could I defend every line from context answers, not taste?
□ Does the brief distinguish this client from my last three projects?
□ Construction-vs-kids test: would this engine, run on an opposite
  brief, produce an opposite design?
□ Is at least one "avoid" listed that I personally like? (If every
  forbidden item is something I dislike anyway, preference leaked in.)
□ Is the poor-fit section of the chosen family's record acknowledged?

## Standing laws (apply regardless of derivation)

- Never default to dark, minimal, glass, gradient, huge type, or 3D as
  fashion. Style is derived, or it is wrong.
- Taste = knowing what looks good AND what is appropriate.
- A design system is a coherent set of DECISIONS (type, scale, spacing,
  composition, hierarchy, imagery, motion, tone, restraint) — not a
  colors-and-components dump.
- Motion supports composition and hierarchy; it never disguises weak
  static design. Every screen passes the paused-frame test.
- Extract logic from references; never copy the reference.
