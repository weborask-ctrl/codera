# Step 5 — Experience Architecture (Phases C–E)

Companion to `CODERA_STEP5_DESIGN_BRIEF.md`. Records the board
validation (C), the /01–/05 transition map (D), and the device
interaction map (E). The prototype (F) and implementation (H–J) follow
this document; changes here first.

---

## C. Board validation (static design review)

Boards: `app/boards/page.tsx`, captures in the session scratchpad
(`board-shots/`, 7 states × 3 devices). Reviewed against the library's
review order (hierarchy → system → states) and Step 5 acceptance
criteria:

- **/01** hierarchy: eyebrow → statement → CTA reads in <3 s; C
  recognizable, cropped right per statement-hero grammar (06 §3.1);
  single dark act with mineral light — cinematic, not gloomy; CTA
  present in first paint. PASS.
- **/02** before credible-contemporary (bootstrap-generic, not 2011);
  fold seam = the brand's crease motif doing the wipe; after-state
  fully readable with offset clear of the fold; no browser chrome.
  Light-dominant act ✓. PASS (mobile = stacked chip + surface).
- **/03a/b/c** three genuinely different families (industrial-light /
  warm-clinical / expressive-editorial per 03_MATRIX rows construction,
  healthcare, interior studio); each has real art direction (linework +
  material bands / booking panel / colour plates + index) — zero grey
  placeholders; honest "Ukážkový koncept" label on every stage. Range
  rule PASS.
- **/04** calm typographic rows, no cards/icons, price quiet, one
  claim per discipline. Decision-gate removal applied (strand SVG cut
  — motion will carry the metaphor instead). PASS.
- **/05** ending composition: C + statement + CTA + e-mail alternative
  + one-line footer. Premium-bright, no gloom. PASS.

Board deltas to carry into implementation: /01 headline may overlap
the C more at ≥1440; /03 stages gain per-project secondary beats
(scroll reveal inside stage) at implementation, boards stay the held
frames.

## D. Transition map

World model: ONE fixed canvas (ribbon GLB + tone environment) behind
naturally-scrolling DOM. No master pin. Camera/tone = continuous
function of document scroll with ≤120 ms critically-damped smoothing
(world-side only; input mapping is direct). Sticky regions replace
pinning (native scroll physics, cannot trap keys).

Desktop scroll budget ≈ 7.8 viewports:
`/01 100svh · T1 zone 60svh · /02 sticky 180svh · /03 sticky-stack
300svh · /04 100svh · /05 100svh + footer`

| # | Transition | Tier | Mechanism |
| --- | --- | --- | --- |
| T0 | load → /01 | 2 | 1.2 s C reveal (material light sweep); non-blocking — CTA and scroll active from first frame; scroll during reveal simply proceeds |
| T1 | /01→/02 | **1** | camera pushes toward/through the C opening; scene tone lerps graphite→paper across the zone; /01 statement exits up; ribbon leaves frame as its crease line hands off to /02's fold seam |
| T2 | /02 before→after | **1** | sticky surface inside 180svh region; fold-seam clip-path sweeps with section progress; final 25% of region = full-readable AFTER hold |
| T3 | /02→/03a | 2 | the after-surface CARD is the shared element: same silhouette persists, content crossfades to Konštrukt while tone shifts paper→concrete |
| T4 | /03a→b→c | **1** | sticky-stack: next stage slides over the previous (which recedes with slight parallax/scale); stage tone crossfades (concrete→cream→bone) |
| T5 | /03c→/04 | 2 | Forma's surface settles into the paper ground; tone calms to warm paper; three thin strands draw in above the offer rows |
| T6 | /04→/05 | **1** | strands converge to frontal C pose (the GLB's front = the logo, by construction); camera slows to rest; statement enters; stillness |

Tier-1 count: 4 ✓ (T1, T2, T4, T6). Nothing fades to black; every
boundary transforms existing material (brief's continuity law).

Text choreography rule (all states): entrances fire once via
IntersectionObserver (enter → settle at opacity 1); exits only after
the hold zone; NO scroll-scrubbed opacity on copy. /04 rows: active
row emphasized by weight/marker — inactive rows stay ≥0.85 (audit
REMOVE item executed).

## E. Interaction map

**Desktop:** wheel/trackpad = native scroll (zero synthetic layers);
keyboard End/Home/arrows natural (sticky cannot trap); pointer =
subtle key-light/orientation influence in /01 only (≤3°, lerped,
no layout effect); CTA/anchors instant; form drawer: focus-trap,
Escape, backdrop click, data preserved on close.

**Tablet (768–1023):** mobile-plus edit — no hover dependencies, no
pointer light; /02 tap-or-scroll fold; /03 swipeable stages with
tap targets ≥44px; orientation-change safe (svh units, re-measure
on resize).

**Mobile (<768):** premium-trailer edit — /01 static C + immediate
headline/CTA; /02 stacked before-chip + after (tap "PREDTÝM/POTOM"
switch as enhancement); /03 full-width swipe deck, scroll-snap
proximity, no horizontal trap (deck scrolls natively, page scroll
unaffected); /04 stacked rows; /05 headline+CTA+compact panel+mail;
no pins, no cursor logic, IO-driven tone flips (existing machinery).

**Menu (all <1024):** REBUILD per audit §3 — single translation
channel (GSAP owns transform; the Tailwind `translate-x-full` class
goes), `aria-hidden` toggled with state, links must land on-screen;
Playwright gains position assertions (link.x within viewport when
open).

**Contact:** /05 primary CTA reveals compact panel (name/e-mail/
message, validation preserved); direct e-mail link alongside; mobile
keyboard-safe (panel scrolls, no fixed-height traps).

## F-plan (prototype scope)

The riskiest mechanics, built first on a dev route (`/v3`):
1. T2 sticky fold (input fidelity of clip-path scrub on native scroll),
2. T3 shared-card handoff across two sticky regions,
3. T1 world pass-through driven scrub-free from scroll (camera +
   tone lerp with ≤120 ms damping),
validated with the wheel/trackpad/keyboard latency probe before any
further build (G).
