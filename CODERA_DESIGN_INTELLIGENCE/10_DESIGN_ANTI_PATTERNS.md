# 10 — Design Anti-Patterns

The failure catalogue: what breaks quality across families. Sourced from
the "don't" lists of 18 deep studies, the catalogue-wide patterns, and
the source library's own review guidance (hierarchy → system → states).

---

## 1. Identity anti-patterns

- **Trend-default design:** dark mode / glassmorphism / gradient mesh /
  huge type / 3D chosen as fashion instead of derived from the client
  context. The catalogue's data refutes the biggest one directly: 68%
  of quality systems are LIGHT.
- **Template sameness:** the standard SaaS skeleton with no voice — no
  signature device, no ownable constraint. Quality systems each have ONE
  memorable law ("no filled buttons", "0% colorfulness", "everything is
  a pill", "acid-lime only").
- **Costume mismatch:** luxury grammar on a discount offer, playful
  radii on an institution, brutalism on a trust surface, SaaS hero on a
  restaurant. Appropriateness beats attractiveness.
- **Copied reference:** shipping a recognizable clone of a reference
  site instead of extracting its logic. References inform decisions;
  they are never the deliverable.

## 2. Color anti-patterns

- Accent inflation (every section/department gets a color; rainbow
  semantic states).
- Decorative accents promoted to CTAs (gold buttons — named "don't" in
  the luxury study).
- Pure #000000 text on warm canvases; cold greys on cream; pure white
  body text on pure black (halation).
- Muted text below AA contrast "for elegance".
- Saturated canvas behind saturated components (no white shell).
- 50/50 dark/light striping with no owner mode — indecision, not
  dramaturgy.
- Colored text on colored panels; mid-grey on black cards.

## 3. Typography anti-patterns

- Display face at body sizes; body face blown up as display (oversized
  ≠ editorial without lh/tracking work).
- Untracked display type; uppercase without positive tracking.
- Two display faces fighting; novelty font as UI text.
- Bold-everything emphasis (quality systems cap weights; scale does the
  work).
- Centered long-form copy; measures beyond 75ch; body under 15px.
- Trendy display faces with broken Slovak/CEE diacritics.

## 4. Layout anti-patterns

- Uniform 40px spacing everywhere — no macro/micro jump, no rhythm.
- Density panic: every service/feature above the fold; no zoning.
- Card-grid worship: 3+ column matrices where pairs or bands belong.
- Random asymmetry (offsets with no consistent rule).
- Sections stacked with effects between them pretending to be a
  journey; act breaks unmotivated by content.
- Footer as dumping ground.

## 5. Component anti-patterns

- Chrome stacking: border + shadow + background on one card.
- Placeholder-only form labels; error states that shout or blame.
- Two primary buttons per view; CTA labels that vary per section.
- Sale-badge pollution; trust badges as loud stickers.
- Raw third-party widgets (booking/forms) unstyled mid-brand.
- Missing states (hover/focus/disabled/empty/long-content) — a library
  without states is a mockup.

## 6. Motion anti-patterns

- Motion hiding weak static design (fails the static-frame test).
- Text choreography that never holds readable; copy at low opacity for
  most of its life; text clipped by masks/transforms mid-read.
- Synthetic smooth-scroll layers disguising poor interaction
  architecture; input lag as "cinematic feel".
- Scroll traps: pins that swallow End/Home/scrollbar; 300vh pins with
  one state change.
- Ambient motion in reading zones; autoplay carousels rushing
  comprehension; hover-dependent reveals with no touch path.
- Ignoring prefers-reduced-motion or shipping a broken reduced variant.

## 7. Imagery anti-patterns

- Stock photography in atmosphere-led families (instantly fatal in
  hospitality/luxury/image-led).
- Mixed image grammars in one grid (different light/backdrop/crop).
- Mixed illustration styles in one brand.
- Texture JPEGs (paper/concrete wallpaper) as "craft".
- Center-cropping art-directed images per breakpoint instead of
  composing portrait variants.
- Fake screenshots / exaggerated product mockups.

## 8. Mobile anti-patterns

- Desktop choreography scaled down (pins and scrubs on touch).
- Hover-only information; targets under 44px; thumb-hostile CTAs.
- backdrop-filter menus janking on mid-range hardware; 100vh heroes
  under iOS URL-bar behavior.
- Desktop screenshots shrunk to illegibility.
- "Responsive" meaning shrunk, not re-directed.

## 9. Process anti-patterns

- Declaring done while remote CI is red; treating local screenshots as
  release evidence; conflating local / remote-CI / preview /
  real-device validation tiers.
- Claiming real-device coverage from emulation.
- Skipping the review order: judging decoration before hierarchy,
  system consistency, and states.
- Inventing facts on trust surfaces (fake registrations, fake
  testimonials, invented numbers) — never acceptable.

## 10. The one-question audit

For any screen: *"If I remove the motion, the gradients, and the
effects — is this still an excellent, appropriate, readable
composition?"* If not, the problem is not polish. Fix hierarchy first.
