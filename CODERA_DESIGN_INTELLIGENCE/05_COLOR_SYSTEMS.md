# 05 — Color Systems

How quality systems build palettes: canvas logic, accent discipline,
semantic hierarchy, and dark/light dramaturgy. Grounded in the 1,290-entry
census (876 light / 282 dark / 132 both) and 18 deep studies.

---

## 1. Canvas first — the single biggest decision

The canvas sets the emotional baseline before any component exists:

| Canvas | Hexes seen | Emotional read | Families |
| --- | --- | --- | --- |
| Warm paper | #fdfcfc #f9f6f2 #faf8f5 #f5f1e4 #ebe7e1 | composed warmth, premium calm | warm-editorial, luxury, wellness |
| Pure white gallery | #ffffff #f2f2f2 | curated silence | editorial, image-led, swiss |
| Cool clinical | #f5f5f7 #f7f7fa + sky washes | provider-grade trust | healthcare, corporate |
| Near-black instrument | #08090a #0c0c0c #101010 | precision drama | dark-cinematic, devtools |
| Deep brand world | #314218 moss, #193741 slate, #3a3525 bronze | ownable atmosphere | organic, hospitality, luxury dark acts |

Rules:
- **Warm canvases demand warm inks** (#2c2e2a #32302f #2d2c2b #321004) —
  pure #000000 text on cream is a recurring named "don't".
- **A canvas below white buys a free elevation level**: white cards on
  cream elevate with ZERO shadows (Evernote, MindMarket, Headspace).
- **Never pure white on "warm" systems** — "always #fdfcfc eggshell" —
  and never warm cream inside a cool clinical system. One temperature.

## 2. The accent economy

The strictest shared law in the catalogue:

1. **ONE chromatic action color** owns every primary CTA/link/focus
   (Linear #e4f222, Apple #0071e3, Attio #266df0, Evernote #94e130,
   Headspace #0061ef "exclusively for the single highest-priority action
   per view").
2. **Supporting accents get NAMED JOBS** and are barred from promotion:
   Apple's orange = category eyebrows only; MindMarket's blue/coral/
   yellow = "decorative illustration accents only"; BelArosa's gold =
   "never a CTA fill, hover state, or interactive surface."
3. **Decorative ≠ functional** — the boundary is explicit in every
   quality system, and crossing it (gold buttons, rainbow states) is the
   most cited failure mode.
4. Several elite systems run **zero accents** (Locomotive, Break Maiden,
   14islands: "0% colorfulness is a deliberate, ownable constraint") —
   photography carries chroma.

## 3. Neutral ladders (the real workhorse)

Quality systems publish 6–10 neutrals with role names, e.g. Linear's
dark ladder: #08090a canvas → #0f1011 card → #161718 elevated → #23252a
border → #383b3f border-high → #62666d muted → #8a8f98 tertiary →
#d0d6e0 secondary-text → #e5e5e6 → #ffffff heading. Light systems mirror
this (Wealthsimple: #fcfcfc → #faf8f5 → #f1f0f0 → #e4e2e1 → #686664 →
#32302f). Build the ladder FIRST; components consume ladder roles, never
raw hexes.

## 4. Elevation through color, not shadow

15 of 18 deep studies are deliberately shadowless. The three elevation
grammars:
- **Surface stepping** (dark: void→carbon→obsidian; green: moss→fern→
  lichen — Felt's "elevation through color stepping, not shadow stacks").
- **Canvas/card temperature shift** (cream→white).
- **Color inversion as depth** (dark panel on light page = the deepest
  "elevation" available — Atlassian, Apple).
When shadows exist: brand-tinted (navy rgba(9,30,66), blue rgba(28,40,64))
at 0.04–0.10 opacity, or the playful solid-offset "sticker shadow."

## 5. Dark/light dramaturgy (the both-mode playbook)

The 132 "both" systems — and the best pages generally — treat dark and
light as ACTS, not themes:

- **Apple's three acts:** dark hero (drama) → dark features (immersion) →
  light detail band (clarity, specs, purchase). "Never break this cadence."
- **Wealthsimple:** warm-light body with ONE bronze-dark hero panel as
  the staging moment.
- **BelArosa:** parchment body, slate full-bleed bands as atmosphere
  breaks.
- **Rule of proportion:** one mode OWNS the page (60–80%); the other
  punctuates. 50/50 alternation reads as indecision.
- **The transition is content-motivated** (a product reveal, a mood
  chapter), never random section striping.
- Emotional physics: dark→light lands as RELIEF/clarity (put conversion
  and facts there); light→dark lands as IMMERSION/focus (put drama and
  staging there). A bright act after a dark sequence "creates more impact
  than adding another dark effect."

## 6. Saturation strategy by family

- Luxury: colorfulness ≤5% (BelArosa's stated number).
- Editorial/image-led: 0% chrome; photography = 100% of chroma.
- SaaS: 1 accent at full saturation, everything else neutral.
- Expressive: 3–5 saturated hues as ROOMS with a white shell between.
- Pastel: saturation lives in surfaces (washes), never in text; one deep
  anchor gives spine.
- Food/hospitality: warmth allowed to run hot (appetite palette).

## 7. Accessibility constants

- Body text AA (4.5:1) minimum in every family, including muted text —
  "muted" is a role, not permission to fail contrast.
- Dark-mode: avoid pure-white body on pure-black (halation) — off-whites
  #d0d6e0/#f0f0fa class; and check OLED dimming for greys under #8a8f98.
- Text-on-color: white or near-black only ("never colored text on colored
  panels"); check both themes when tokens re-point.
- Semantic states keep their meaning without color (icons/labels too) —
  color-blind-safe by construction.

## 8. Building a client palette (procedure)

1. Pick canvas temperature from archetype + audience (§1).
2. Build the 6–10-step neutral ladder with role names.
3. Choose ONE action color; write down its exclusivity rule.
4. Add supporting accents ONLY with named jobs; bar them from promotion.
5. Decide the elevation grammar (stepping / temperature / inversion).
6. Script the dark/light dramaturgy: which mode owns, where the acts
   break, what motivates each transition.
7. Validate: AA everywhere, both themes, OLED, print/grey-scale test
   (hierarchy must survive without chroma).
