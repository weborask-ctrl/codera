# 04 — Typography Systems

How type builds identity and hierarchy across the studied catalogue.
Grounded in 18 deep structural studies + the full-catalogue font census.

---

## 1. The four pairing strategies (choose exactly one)

| Strategy | Formula | Meaning | Studied proof |
| --- | --- | --- | --- |
| Monolith | one family, all sizes | confident modernism | MindMarket (Inter 9→144px), Headspace (Apercu 12→72), Locomotive-adjacent |
| Serif moment | serif display + sans everything else | editorial luxury, human trust | Wealthsimple (Tiempos+The Future), BelArosa (Giovanni+Avenir), Felt (GT Alpina+Atlas) |
| Display voice | characterful display + quiet workhorse | brand personality up top | Break Maiden (Martin+America), Readymag (custom+Graphik), Peak Design (Exposure+Geist+bryant) |
| Utility split | Text cut + Display cut of one superfamily | engineered SaaS polish | Attio (Inter+InterDisplay), Atlassian (Charlie Text+Display), Apple (SF Text+Display) |

Rules that hold across ALL strategies:
- The display face NEVER appears below ~28–32px ("it loses its geometric
  personality and starts to feel like a body font that forgot to be quiet").
- The serif/sans boundary is a hard line — "never mix the serif and sans
  within the same text block."
- A third face is allowed only as METADATA VOICE (mono for IDs, code,
  specs) — never as a second display.

## 2. Scale architecture

- **Choose the body-to-display ratio deliberately:** 3–5× = product/SaaS
  (16→48–80px); 6–10× = editorial statement (16→96–180px). The ratio is a
  personality dial, not an outcome.
- **Documented scales from studies** (usable as starting points):
  - Linear: 13/15/16/20/24/32/48/64/72 — lh 1.5 body → 1.0 display
  - Apple: 10/12/14/17/19/24/28/32/56/80 — tracking tightens as size grows
  - MindMarket: 15/18/20/30/53/81/140 — lh 0.95 at display
  - Wealthsimple: 14/16/18/20/36/56/84
- **Line-height collapses with size:** 1.5–1.6 body → 1.2–1.33 headings →
  1.0–1.14 display → 0.80–0.95 only for editorial statement type.
- **Weight discipline:** quality systems use 2–3 weights. Recurring caps:
  Linear ≤590 (no bold anywhere), single-400 systems (Locomotive,
  14islands, Break Maiden), whisper-display systems (ElevenLabs 300,
  Evernote 300, GT Alpina 300 — "heavier weights feel corporate").

## 3. Tracking rules (the craft tell)

- Negative tracking scales with size: ≈ -0.01em at 20–32px, -0.022em at
  48–72px, up to -0.06em at 140px+. Untracked display type is the most
  common amateur tell in the catalogue.
- Small text tracks the OTHER way: Apple runs -0.037em at 10px captions
  → looser as sizes rise; body often +0.005–0.01em.
- Opposite-direction tracking (display negative / body slightly positive)
  is a deliberate contrast device (ElevenLabs).
- Uppercase ALWAYS gets positive tracking: 0.1–0.17em for editorial
  eyebrows (BelArosa), 0.038–0.057em for condensed commerce labels
  (bryant), up to 0.3em for stamped micro-labels (Monosten, logo
  sub-lines).

## 4. Readability constants (non-negotiable in every family)

- Body 15–16px minimum (18px+ for reading-heavy or older audiences),
  lh ≥1.5, measure 45–75 characters.
- Long copy left-aligned; centered only for short statements ("do not
  center-align long body copy" recurs across studies).
- Muted text stays within AA contrast — grey-on-grey elegance is a
  failure, not a style.
- Tabular figures (tnum) for any column of numbers; numeric feature
  settings for prices/specs (Apple ships "numr").

## 5. Micro-typography as quality signal

- font-feature-settings define identity at the detail level: Linear's
  cv01/ss03/zero on Inter; Attio's ss03; Klim's tnum/ordn. When using
  Inter-class faces, choosing alternates IS a branding decision.
- Hanging punctuation, real quotes, non-breaking spaces before units —
  the catalogue's top systems are typeset, not typed.
- Slovak/CEE note for Codera work: verify diacritics coverage (ď ľ ť ž ô)
  in any display face before committing; several trendy display faces
  ship broken CEE glyphs. Test the LONGEST Slovak strings — Slovak runs
  ~15–20% longer than English and breaks tight heroes.

## 6. Font census (all 1,290 systems)

Top families: Inter (204), Arial/system (89+78+26+24+22), Times (51),
Geist + Geist Mono (68), Roobert (26), DM Sans (21), Helvetica family
(35+), Graphik (15), Aeonik (15), JetBrains Mono (15), Matter (15),
SF Pro (27), PP Neue Montreal (14), Poppins (12), Suisse family (34+),
Founders Grotesk (11), Switzer (11), Söhne (10+), Satoshi (10),
Manrope (10).

Reading: Inter is the water everyone swims in — using it is safe but
identity-neutral; identity comes from the DISPLAY choice, the feature
settings, and the tracking discipline. Mono usage (Geist Mono, JetBrains,
IBM Plex Mono ≈ 70 systems) is the standard "engineering credibility"
garnish.

## 7. Decision procedure

1. Pick the pairing strategy from the table (driven by archetype +
   audience, not preference).
2. Set the body-to-display ratio (product 3–5× / editorial 6–10×).
3. Fix 2–3 weights and write them down as a cap.
4. Derive the tracking curve (negative-with-size + uppercase rules).
5. Verify: Slovak strings, AA contrast, 45–75ch measures, tnum on data.
6. Write the scale into tokens; deviations require editing the tokens,
   not the components.
