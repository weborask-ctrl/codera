# CODERA — Step 4 Audit: Current Design and Interaction Failures

Diagnostic audit of the live build (https://www.codera.sk, master
`ee246fa`, 2026-08-27) against the working document's Step 4 claims.
Verification methods: live DOM/behavior probes on production (desktop
1440×900 and mobile 375×812 emulation), source inspection, texture
review, and the design-intelligence library as the quality standard.
**No redesign performed — this document is diagnosis only.**

Legend per finding: status **CONFIRMED / PARTLY CONFIRMED / NOT
CONFIRMED**, with the responsible implementation named.

---

## 1. /02 Transformation scene — CONFIRMED

- The scene shows a floating plane carrying a full screenshot of a
  fake 2011-era website (`public/work/legacy.jpg`: blue gradient
  header, left menu column, visit counter, "Optimalizované pre
  rozlíšenie 1024×768") that wipes to the redesigned counterpart
  (`konstrukt.jpg`). It is literally the before/after floating-window
  trope, rendered in WebGL (components/world/ribbon-world.tsx →
  `TransformPlane`, textures baked by scripts/capture-work-textures.mjs).
- The "redesigned" side shown inside /02 is the Konštrukt concept —
  itself below standard (see §2), so the transformation currently
  demonstrates weak→mediocre.
- Responsible: `components/world/film.ts` (PLANE), `ribbon-world.tsx`
  (TransformPlane shader), `world-experience.tsx` timeline 6.4–9.2
  (data-premena-* copy), `public/work/legacy*.jpg`.

## 2. /03 Selected work quality — CONFIRMED (with nuance)

- Reviewed all three concept textures at full resolution:
  - **Konštrukt** (`konstrukt.jpg`): dark canvas + orange CTA — the
    same dark-tech family as the Codera shell (range failure), with
    grey placeholder rectangles where photography should be. Against
    the library's industry matrix, construction wants
    industrial/light + real material imagery.
  - **Vitalis** (`vitalis.jpg`): correct family (light warm-clinical,
    teal, booking widget) — direction is right, execution shallow.
  - **Forma** (`forma.jpg`): correct family (warm serif editorial) —
    direction right, execution shallow.
- Nuance: the doc's "each looks like a weaker Codera" holds fully only
  for Konštrukt; Vitalis and Forma do differentiate by family. The
  shared failure is **execution depth**: not a single photograph,
  illustration, or art-directed asset exists across all three — every
  concept is a lone type-and-UI hero frame. That is 5/10 against the
  9/10 shell and violates the library's "one imagery grammar per
  brand" minimum (each brand currently has zero).
- Responsible: `app/textures/page.tsx` (concept compositions),
  baked to `public/work/*.jpg`; presented by `ProjectPlane` +
  work-chapter DOM metadata in `world-experience.tsx`.

## 3. Mobile navigation — CONFIRMED, release-blocking, root cause found

Live production test (375×812 emulation, JS-driven interaction, rAF
active):

- aria-expanded toggles, scroll-lock engages, Escape closes — the
  STATE machine works.
- **The open panel never arrives on screen.** The menu panel animates
  `translateX` 750.7px → settles at **+375.3px = exactly one viewport
  width off-screen right**. All six menu links rest at x≈395 on a
  375px-wide viewport. A finger cannot tap any of them; to a user the
  menu "opens" (button state flips, page locks) but nothing visibly
  appears — matching the reported "not reliably functional".
- **Root cause (verified by matching measured values):** the panel
  keeps the Tailwind class `translate-x-full`
  (`components/site/site-nav.tsx:349`) — computed as a +375.33px
  transform — while the GSAP open animation tweens `xPercent: 100 → 0`
  (`site-nav.tsx:185–197`). GSAP parses the class's computed transform
  as a fixed px offset and animates only its own percent component:
  open = 375.33 + 0 = one full width off-screen; the pre-open set
  (`xPercent: 100`) gives the measured 750.67 start. Two stacked
  translation channels; the class is never removed.
- Scope: every viewport <1024px (the trigger is `lg:hidden`); desktop
  uses inline nav links and is unaffected. Likely broken on production
  since launch.
- Why tests missed it: the Playwright immersive-menu test asserts
  focus/tab-order and aria state — none of which depend on horizontal
  position. A "link is inside the viewport when open" assertion did
  not exist.
- Responsible: `components/site/site-nav.tsx` (class at :349 + tweens
  at :163–221).

## 4. Text failures inside 5D/spatial states — CONFIRMED

Live scroll-walk (13 sampled positions, effective-opacity scan of
in-viewport text):

- Work chapter metadata ("Codera — koncept Konštrukt", "01 —
  Stavebníctvo", project descriptions) measurably HELD at partial
  opacity (0.02–0.85 band) at scroll fractions 0.16–0.32 — important
  copy living in a dimmed state rather than ENTER → READABLE HOLD →
  EXIT.
- Transformation captions ("Typický firemný web") likewise dimmed
  mid-lifecycle at frac 0.24.
- Offer rows: non-active services are held at opacity 0.32 by design
  (`app/globals.css` `[data-service] [data-offer-row]` selectors) —
  three of four service descriptions are sub-legible at any moment in
  the services chapter (fracs 0.56–0.64).
- Hero lines fully readable at rest (state b) — the entrance is fine;
  the failures concentrate in the work + offer chapters.
- No viewport-edge clipping was detected in the sampled states
  (the doc's "cut by viewport edges" clause: NOT CONFIRMED on desktop
  at 1440×900 — remains open for other aspect ratios).
- Responsible: master timeline opacity choreography in
  `world-experience.tsx` (work meta + premena blocks), offer dimming
  CSS in `app/globals.css`.

## 5. Scroll responsiveness / input fidelity — CONFIRMED (architectural)

Measured/inspected:

- Master timeline: **`pin: true, end: "+=860%"`, `scrub: 0.5`**
  (`world-experience.tsx:171–173`) — an 8,640px pin-spacer at 900px
  viewport; every scroll input is smoothed through a ~0.5s catch-up,
  which is precisely the "delayed, disconnected" feel named in the
  document. No Lenis/synthetic scroll (good — native physics kept).
- Intro hijack: scrolling during the 1.9s intro only accelerates it
  (`intro.timeScale(3.5)`, :154) — input is deferred, not honored,
  for up to ~0.5–1s after load.
- Benchmark contrast (Step 3 findings, library 08 §8): the Refokus
  productions studied ship ZERO pin-spacers — persistent world +
  native scroll + scrubbed media; single-viewport beats. The Codera
  860% single-pin architecture is the structural outlier and the root
  of the heaviness complaint; scrub-value tuning alone would be the
  cosmetic smoothing the document forbids treating as a fix.
- Responsible: master-timeline architecture in `world-experience.tsx`.

## 6. Functional interaction baseline — PARTLY CONFIRMED

- Desktop: CTA labels/hrefs unified (one concept → #dopyt), form
  validation, skip-link, keyboard reachability, End-key scroll escape
  — all covered and passing in the 25-test Playwright suite (local +
  CI green on `ee246fa`).
- Mobile: the menu failure (§3) IS the baseline failure — primary
  navigation is unusable by touch. Slider/deck controls pass
  structural + keyboard tests.
- Verdict: desktop baseline healthy; mobile blocked by §3.

## 7. Tonal / color problem — CONFIRMED

- Live tone-zone walk: the light "paper" chapter registers only around
  scroll fractions ~0.40–0.48 (~8–15% of the journey); everything else
  sits in graphite→warm-graphite. One brief light window inside an
  otherwise continuously dark experience — the "emotionally monotone"
  claim holds quantitatively.
- The library's evidence (68% of 1,290 quality systems are light;
  the Apple/Wealthsimple act-structure; Refokus's two-of-three light
  worlds) plus the prescribed direction is already codified in
  `CODERA_DESIGN_INTELLIGENCE/11_CODERA_APPLICATION.md` — a scripted
  dark/light dramaturgy with light acts carrying conversion.
- Responsible: `TONES` lerp in `ribbon-world.tsx` + `toneZone`
  placement in the master timeline.

## 8. QA / release integrity — CONFIRMED (process), partially remediated

- Historical fact: the spatial release was declared done while remote
  CI was red (merge `84b4707` failed CI; the first "fix" `55055d6`
  did not actually contain its changes and also failed). Remediated
  this morning: `ee246fa` — remote CI **green**; the real cause was
  environment-dependent (CI Firefox has no WebGL → dom tier) plus
  unverified scripted edits.
- Standing rule adopted (also written into the library's anti-patterns
  §9): completion claims must distinguish local / remote-CI / preview
  / real-device validation.
- **Real iPhone/Safari validation: NOT PERFORMED — no physical device
  is available to this environment.** Emulation (viewport + touch
  translation) is explicitly not claimed as device validation. A
  user-run checklist is required before any future mobile sign-off:
  menu open/tap/close/orientation, scroll through all chapters, deck
  swipe, slider drag, form entry with keyboard open, End-of-page
  reachability, Safari URL-bar collapse behavior.

## 9. Experience length / section-like structure — PARTLY CONFIRMED

- Desktop journey measured: **11.7 viewports** total (10,526px at
  900px vp; 8,640px inside the single pin). State walk: b→c→d→e1→e2→
  e3→f→g across the pin; the resolution state g alone holds the last
  ~20% (2.3 viewports) with little visual change; state d (premena)
  spans ~15%.
- Mobile journey: ~6.2 viewports, unpinned, swipe-native — already
  aligned with the document's direction.
- Structure verdict: the world IS persistent (one canvas, one brand
  object — not stacked sections), but scroll economy underperforms
  the benchmark's ~1 beat per viewport: g's long tail and d's long
  premena hold are the main dead zones. Counting DOM chapters, the
  experience still reads as hero → premena → work → offer → resolution
  blocks INSIDE one pin rather than continuously transforming acts.
- Future 01/02/03/04/05 content structure: intentionally NOT designed
  here (per the document, it will be specified in a later step).

---

# KEEP / REBUILD / REMOVE / VERIFY

## KEEP
- Parametric brand mark pipeline (2D SVGs + 3D ribbon from one
  definition; new production GLB from Step 2).
- One-persistent-world architecture: single canvas, film state object,
  camera-pose Rig, tone-lerp machinery, per-tier code splitting,
  SSR-mobile-first tiering.
- Native scroll (no Lenis) and the capability-tier system.
- Mobile experience's swipe-native, unpinned direction (6.2 viewports,
  IO-driven chapters).
- Test infrastructure: 25-test suite, WebGL-aware tier branching,
  CODERA_NO_WEBGL local repro, green remote CI.
- Typographic voice (wordmark discipline, tracked micro-labels) as the
  base for the next direction.

## REBUILD
- **Mobile menu open/close animation** (`site-nav.tsx`): single
  translation channel, on-screen assertion added to tests; also toggle
  `aria-hidden` on the panel. (Release-blocker — first in line when
  implementation resumes.)
- **/02 transformation concept**: replace the floating old-site window
  with a transformation native to the world (per the doc, concept
  replacement — not a restyle); the premena copy choreography with
  readable holds.
- **/03 portfolio concepts**: re-design all three through the
  DESIGN_DECISION_ENGINE to Codera-level execution — distinct
  families with real art direction (imagery grammar per brand;
  Konštrukt moves to industrial-light).
- **Scroll architecture**: replace the single 860% pin + 0.5 scrub
  with benchmark-grade economy (shorter or no pins, ~1 beat per
  viewport, immediate input mapping, g-tail compressed, intro
  non-blocking).
- **Text state choreography**: every important copy block gets
  ENTER → FULL HOLD → EXIT; offer rows re-choreographed so the active
  row's siblings stay legible (≥ ~0.6) or hide entirely.
- **Tonal dramaturgy**: scripted dark/light act structure per
  11_CODERA_APPLICATION.md (light acts carry premena-resolution,
  offer and conversion; dark acts carry opening and immersion).

## REMOVE
- The 2010-era fake-legacy screenshot as a hero visual
  (`legacy*.jpg` in its current storytelling role).
- The intro scroll-hijack behavior (input deferral during autoplay).
- The permanent 0.32-opacity hold on non-active offer rows.
- Dead scroll: state g's 2.3-viewport tail at current length.

## VERIFY (open items that need evidence before/after future changes)
- Real iPhone/Safari pass (user-run checklist above) — cannot be
  validated from this environment.
- Text clipping at non-16:9 aspect ratios (ultrawide, short laptops,
  iPad portrait world-tier at ≥1024px).
- Menu behavior after rebuild across orientation change + focus
  return (extend Playwright with position-based assertions).
- Performance re-measurement after scroll-architecture rebuild
  (frame pacing at 4× CPU, LCP/CLS on throttled mobile).
- Whether `scrub: 0.5` remnants remain anywhere after rebuild.

---

**STOP.** Per the working document's Step 4 completion gate, this
audit ends the current instruction set: failures verified and
documented; no future-layout (01–05) design and no implementation
work has been started. Next steps await the document's later
versions.
