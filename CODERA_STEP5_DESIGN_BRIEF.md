# Step 5 — Design Brief (Phase A output)

The DESIGN_DECISION_ENGINE run for Codera's own /01–/05 experience,
per Step 5 §0–§1. Every board and implementation decision traces back
to this brief; deviations require editing the brief first.

## Engine intake (the twelve)

1. **Industry:** creative web studio (agency selling design+development).
2. **Audience:** Slovak SMB owners/managers whose business outgrew its
   web presence; secondary: design-literate peers who validate quality.
   Mobile-heavy first visits; decision on desktop.
3. **Price positioning:** accessible premium ("od 699 €") — premium
   craft signals WITHOUT luxury scarcity theater.
4. **Brand personality:** claimed — precise, cinematic, modern-Slovak;
   projected today — dark, heavy, monotone (audit §7).
5. **Product:** websites — the portfolio concepts ARE the imagery; the
   site itself is the primary proof artifact.
6. **Trust requirements:** medium-high (SMB money, no established
   brand) → honest labels ("Ukážkový koncept"), real contact, working
   everything; no invented facts.
7. **Emotional target:** first viewport = "this studio operates on
   another level" (credible awe); at conversion = ease + confidence.
8. **Content:** short Slovak copy (exists), three portfolio concepts,
   one 3D brand object (Step 2 GLB), no photography budget.
9. **Assets:** parametric ribbon (SVG+GLB), type system (Archivo var.
   width + Geist Mono), token system with act re-pointing. No stock,
   no photos — concept imagery must be built (type/SVG/material
   compositions), per library rule: one imagery grammar per brand.
10. **Conversion goal:** enquiry ("Začať projekt" → #dopyt), single
    CTA concept site-wide.
11. **Device context:** desktop = spatial 5D foundation; tablet =
    touch-first hybrid; mobile = separate cinematic edit (Step 5 §2.6).
12. **Constraints:** Next 16 + GSAP/ScrollTrigger + R3F stack stays;
    no Lenis; CI + preview gates; tier system stays.

## Derivation (rules applied)

- R6 (portfolio/creative seller): the WORK is the hero — shell must
  not outshout its cases → achromatic shell, color arrives with work.
- Matrix row "Agencies/studios": light-editorial or dark-cinematic,
  "the work decides"; differentiator = spatial storytelling → keep 5D
  as the differentiator, fuse dark-cinematic ACT with warm-editorial
  body (11_CODERA_APPLICATION).
- 05 §5 dramaturgy: one mode owns (~60%), other punctuates; acts
  motivated by content. Inversion of current site: LIGHT owns the
  journey; dark is the opening act + accents.
- 08 §8–§13 (Refokus findings): fixed persistent canvas + native DOM
  scroll + section-progress interpolation; no master pin; ~1 beat per
  viewport; DOM text over the world; light worlds are proven.

## THE BRIEF

**CLIENT:** Codera (self)
**PRIMARY FAMILY:** dark-cinematic act structure fused onto a
warm-editorial body — "titanium object in a paper studio".
**SECONDARY DEVICE:** per-project style worlds inside /03 (industrial /
warm-clinical / expressive-editorial), bounded to their acts.

**SIGNATURE CONSTRAINT (the ownable law):**
1. *Codera's chrome is achromatic* — graphite ink, paper, mineral
   greys. Chroma enters only through (a) the ribbon's warm metal as
   MATERIAL (never as button fill — the BelArosa gold rule) and
   (b) the projects' own palettes inside /03.
2. *Nothing fades to black* — every act transforms the previous act's
   material (Step 5 §2.1 continuity model). No blank separators.

**CANVAS / TONAL SCRIPT (the acts):**
- /01 deep graphite `oklch(0.155)` with mineral light revealing the C
  — the ONLY dark-dominant act.
- /01→/02 the camera passes the C's opening; the world brightens
  THROUGH the pass — dark opens into light (§3 transition).
- /02 light-dominant: mineral paper `oklch(0.96–0.97 warm)`; the
  transformation is staged on light.
- /03 three project climates, each bounded: Konštrukt pale concrete
  (industrial-light), Vitalis warm cream + teal, Forma bone + oxide
  editorial. Light-based all three; the shell's graphite returns only
  as ink.
- /04 calm warm paper — the relief act, stillness tier.
- /05 balanced resolution: warm paper ground, titanium C, graphite
  ink; premium-bright ending (never a return to gloom).
Ratio outcome: ~1 dark act of ~6 → the site becomes light-owned with
a cinematic dark opening. ≥2 meaningful light states ✓ (02, 04, 05 +
two light projects).

**TYPE STRATEGY:** keep Archivo variable (width axis = the voice) +
Geist Mono as metadata voice. Display ratio: editorial 6–7×
(16px body → clamp mega ~104–128px) on /01 and /05 statements; SaaS
3–4× inside informational acts. Weight cap 600. Tracking curve per
04 §3 (negative with size; uppercase eyebrows +0.12–0.16em). Slovak
strings tested at longest forms.

**ACCENT ECONOMY:** zero chromatic UI accent. CTA = ink/paper
inversion pill (dark pill on light acts, paper pill on dark act),
one shape, one label ("Začať projekt"). Focus rings ink. Metal
gradient reserved for the ribbon + micro brand moments. Project
palettes live only inside their /03 stage.

**RADIUS DIALECT:** closed set {2px inputs/hairline chips, 10px
cards/frames, 9999px pill CTA}. Nothing else.

**IMAGERY LANGUAGE:** built compositions, one grammar per project
world (Konštrukt: blueprint/material linework + structural grids;
Vitalis: soft UI panels + calm color fields; Forma: editorial
type-as-image + oxide color plates). The Codera shell itself uses NO
imagery — the ribbon and typography are the shell's only visual
material (image-led logic: UI silent, work loud).

**MOTION TIER MAP (Step 5 §2.5):**
- Tier 1 signature (max 4): (1) /01 C reveal + pass-through,
  (2) /02 perception transformation, (3) /03 world-to-world project
  transition, (4) /04→/05 strands-rejoin-into-C resolution.
- Tier 2 transitions: act boundaries (tone lerp, camera cuts).
- Tier 3 micro: CTA hover fill, link underlines, form focus.
- Tier 4 stillness: /04 entire act; /02 after-state hold; /05 end.
- Scroll: native, no master pin; fixed canvas interpolates from
  section progress (scrub-free mapping, smoothing only inside the
  world's interpolation, never on input). Short local pin allowed
  ONLY if /02's morph needs it (≤120vh, to be validated in prototype).

**FORBIDDEN (project-specific):** master pins and >0.15s input→
response gaps; Lenis-class layers; text below 0.85 effective opacity
during its hold; fade-to-black transitions; browser-chrome mockups
floating in space; luxury scarcity theater (we sell from 699 €, not
exclusivity); dark-mode default anywhere outside /01; placeholder
grey blocks in portfolio worlds.

**LENGTH BUDGET:** desktop ≤ ~8 viewports total (audit: 11.7 today);
mobile ≤ ~6.5, unpinned; every viewport = one beat (08 §11).

**DEVICE EDITS:** desktop = full spatial; tablet = same acts, no
pointer logic, shortened reveals, natural scroll; mobile = "premium
trailer": static/lightweight C, immediate headline+CTA, swipe-native
projects, tap-switch transformation, compact conversion.
