# 01 — Design Foundations

Transferable principles extracted from a catalogue-wide study of 1,290 real
production design systems (styles.refero.design, August 2026) plus 18 deep
structural studies across every major style family. These are the rules that
held true **across** wildly different aesthetics — from a black-canvas
brutalist portfolio to a cream-paper children's brand. Everything style-
specific lives in `02_STYLE_TAXONOMY.md` and `styles/`.

---

## 1. The first empirical fact: good design is mostly light

Of 1,290 systems in the reference catalogue:

| Color scheme | Count | Share |
| --- | --- | --- |
| light | 876 | **68%** |
| dark | 282 | 22% |
| both (deliberate dark/light alternation) | 132 | 10% |

Dark mode is a *choice with a job* (cinema, product staging, terminal
authority), not a default for "premium". The single most common canvas in
high-quality work is not pure white either — it is **warm off-white**
(#f9f6f2, #fdfcfc, #faf8f5, #f5f1e4, #ebe7e1 recur constantly). Warmth is
the cheapest luxury signal that exists.

## 2. Restraint is the shared grammar of quality

Across every archetype studied, the same discipline appears in different
costumes:

- **One chromatic action color per view.** Linear's acid-lime, Apple's
  #0071e3, Attio's cobalt, Evernote's lime — each system allows exactly one
  loud interactive color, and everything else stays neutral. Systems that
  spread accents across many elements read as cheap regardless of palette.
- **A closed radius vocabulary.** Strong systems use 2–4 radii total and
  never deviate (Linear: 6/12/9999. Apple: 10/28/36/980. 14islands: 4 only.
  Break Maiden: 0 only). Radius consistency is more recognizable than the
  specific values.
- **A closed weight vocabulary.** Many top systems cap at weight 500–590 and
  never use bold (Linear caps at 590; Locomotive and 14islands use a single
  400 everywhere; ElevenLabs' signature is display at 300). Scale carries
  hierarchy; weight is seasoning.
- **Shadows are almost extinct.** The dominant elevation model in 2026-grade
  work is *no shadow*: hairline borders (0.5–1px), surface-color stepping,
  and color inversion. Of 18 deep studies, 15 are deliberately shadowless.
  When shadows exist they are tinted to the brand's dark (Atlassian's navy
  rgba(9,30,66,…), Attio's blue rgba(28,40,64,…)), never neutral black.

## 3. Hierarchy is built from scale ratios, not decoration

- Editorial-grade systems run a **6–10× ratio** between body and display
  (16px body against 96–180px display). SaaS-grade systems run 3–5×
  (16px body against 48–80px display). Choosing that ratio is choosing a
  personality.
- Negative letter-spacing is proportional to size: roughly -0.01em at 20px
  up to -0.06em at 140px. Tight display tracking + generous body
  line-height (1.5+) is the recurring "expensive" combination.
- Line-height collapses as size grows: 1.5 body → 1.1–1.2 headings →
  0.88–1.0 display. Display type set at body line-height reads amateur.

## 4. Whitespace is structure, not absence

Section gaps in studied systems: 64–160px. Element gaps: 8–24px. That
**order-of-magnitude jump** between micro and macro spacing is what makes a
page feel composed. Weak pages have 30–50px everywhere — no rhythm, no
grouping. The BelArosa study said it plainly: "never compress section
padding below 48px; the slow vertical rhythm is what gives the site its
unhurried, luxury pacing."

## 5. One idea per viewport

Apple's page rhythm ("one subject per viewport, generous negative space"),
Linear's "single focal point per screen", Locomotive's one-artwork-per-band:
premium pacing means each screenful makes exactly one point, with one
dominant element. Density is a *choice for utility contexts* (dashboards,
commerce grids) — not the default.

## 6. Imagery does one job per system

Every strong system picks ONE imagery language and refuses the rest:
- product screenshots only (Linear, Attio, Evernote, Felt)
- photography only (Locomotive, BelArosa, Peak Design, Apple)
- illustration only (MindMarket, Headspace mostly)
- sculptural 3D renders only (Wealthsimple)

Mixing photography + illustration + 3D + screenshots in one page is the
fastest way to look template-built. Where photography carries color, the
UI goes monochrome (Break Maiden, Locomotive). Where UI carries color,
imagery is disciplined and neutral.

## 7. Typography pairing logic

Recurring pairings and their meanings:
- **Serif display + sans body** = editorial luxury / trust with warmth
  (Wealthsimple Tiempos + The Future; BelArosa Giovanni + Avenir; Felt
  GT Alpina + Atlas Grotesk). The serif appears ONLY at display sizes —
  "a serif headline signals *this is a moment*."
- **One family for everything** = confident modernism (MindMarket runs
  Inter from 9px to 144px; Headspace runs Apercu 12–72px). Works only
  with strict weight/tracking discipline.
- **Display face + workhorse** = brand voice + neutral carrier
  (Break Maiden Martin + America; Readymag custom display + Graphik).
  The display face must never appear below ~30px.
- **Mono as metadata voice** = engineering credibility in small doses
  (Berkeley Mono for issue IDs, Geist Mono for technical micro-copy).
  Mono for headlines is a costume; mono for metadata is a signal.

Font frequency across all 1,290 systems: Inter dominates (204 systems),
then system stacks, Geist, Roobert, DM Sans, Helvetica-family, Graphik,
Aeonik, PP Neue Montreal, Söhne, Suisse Int'l. Custom faces appear mostly
at display level only.

## 8. Color logic that repeats across families

- **Never pure black text on warm canvases.** Warm systems use warm
  near-blacks (#2c2e2a, #32302f, #2d2c2b, #321004). Pure #000000 text on
  cream reads harsh; cold gray text on cream reads broken.
- **Neutrals carry the system; accents carry meaning.** 6–10 neutrals,
  1 brand action color, 2–4 supporting accents with *named jobs* (category
  eyebrow, success, decorative pop). Accents without jobs get deleted.
- **Decorative accents ≠ functional accents.** MindMarket: "Don't use the
  accent colors as functional states — they are decorative illustration
  accents only." Apple: category eyebrows never become buttons. The
  boundary between decoration and interaction color is strict in every
  quality system.
- **Surface stacks replace elevation.** Dark: #08090a → #0f1011 → #161718
  (Linear). Warm light: #f9f6f2 → #ffffff (Evernote, MindMarket — white IS
  the elevated state on cream). Choosing a canvas below white gives you a
  free elevation level.

## 9. Components are typographic before they are graphic

In the studied systems, buttons/inputs/cards derive identity from type +
radius + border, almost never from gradients/shadows/icons:
- Pills (9999px) signal friendly/editorial; 4–12px signals tool; 0px
  signals gallery/brutalist. Pick one lane.
- Ghost/outlined CTAs are a luxury signal (BelArosa: "never create filled
  colored buttons"); filled dark pills are the confident SaaS default;
  a single filled chromatic button is the conversion-focused default.
- Uppercase + tracked (0.1–0.17em) micro-labels ("eyebrows") are the most
  reused editorial component in the catalogue — cheap to build, instantly
  raises perceived art direction.

## 10. Review order (adopted from the source's own QA checklist)

When judging any screen: **hierarchy first** (what is this screen for,
what is the primary action), **system consistency second** (type scale,
color roles, spacing rhythm, component weight), **states and viewports
third** (mobile, loading, empty, error, hover, long content). Decoration
is judged last. A screen that fails hierarchy cannot be fixed by polish.

## 11. The static-frame test

A strong screen must look intentionally composed **with all animation
paused**. Motion may only amplify a composition that already works — it
must never be the thing holding a weak layout together. (This principle is
expanded in `08_MOTION_AND_SPATIAL_DESIGN.md`.)

## 12. Appropriateness beats attractiveness

The same device flips meaning across contexts: a 153px condensed headline
is confidence on an agency site and malpractice on a health-insurance
form. Every rule above is subordinate to: *industry, audience, price
position, trust requirement, emotional target, content volume, conversion
goal*. That mapping lives in `03_INDUSTRY_STYLE_MATRIX.md` and
`DESIGN_DECISION_ENGINE.md`.
