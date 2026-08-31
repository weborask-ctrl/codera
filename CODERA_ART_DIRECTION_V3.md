# Codera Art Direction v3 — „Žiara"

The Step 7 direction, derived exclusively from the six LIKED records of the
2026-08-31 calibration (`CODERA_DESIGN_REFERENCES/`): lusion · activetheory ·
refokus · exoape · igloo · basement. Every decision below cites its records.
This document replaces `CODERA_ART_DIRECTION_V2.md` ("Zlievareň"), which is
archived, and it is the contract for the Step 7 implementation: deviations
require editing this file first.

## What the calibration actually said

Six sites were chosen; fourteen were not. The common denominator of the six is
**not darkness** — igloo is luminous frost and lusion's chrome is lavender-
white. What they share:

1. **One committed world per site.** No act-by-act material changes; "sections"
   are camera positions and light changes inside a single environment
   [igloo, activetheory, exoape]. This is the direct answer to "pôsobí rozbito"
   — v2 gave every act its own canvas and paid for it.
2. **A real 3D protagonist**, not decoration: an object or environment with
   believable material behaviour that the whole page is ABOUT
   [lusion, igloo, zentry-not-liked confirms it's not the genre but the craft].
3. **Light is the drama.** The glow inside igloo's ice, exoape's dusk,
   lusion's lit stage — emotion comes from illumination, not from palette.
4. **Type does the branding**, in two temperaments: huge and LIGHT for poetry
   [exoape], dense and engineered for credibility [basement, igloo].
5. **Monochrome shell, colour only in the work** [refokus] — which v2 already
   held, and the calibration confirms it survives into v3.

## The concept

**Codera je žiara v hmle — one graphite-to-frost atmosphere in which the
titanium ribbon C is the single lit object, and the journey from /01 to /05 is
one camera move through that atmosphere as the light rises.**

The site opens in deep graphite fog with the ribbon glowing from within
[igloo's inner glow + exoape's dusk]. Scrolling does not change rooms — it
moves the camera and RAISES THE LIGHT: the fog thins, the world brightens
toward frost-white, and the final act stands in full luminous clarity. Dark to
light is therefore not a sequence of themes but a single sunrise — the
dramaturgy rule of the working document satisfied by construction, and the
"five moods" failure made structurally impossible.

## Palette

Monochrome atmosphere, sampled from the liked records' grounds:

| Token | Value | Role |
| --- | --- | --- |
| `--zh-deep` | `#0E0F13` | /01 fog, the darkest point [exoape ground, activetheory] |
| `--zh-graphite` | `#17181D` | dark surfaces, ink on light grounds |
| `--zh-mist` | `#8B909A` | mid-fog, annotation grey [igloo mist] |
| `--zh-frost` | `#EDF0F3` | risen-light ground of late acts [igloo frost] |
| `--zh-white` | `#FAFBFC` | full clarity, /05 |
| `--zh-glow` | `#DCE6EE` (cool) → `#E8DECE` (warm) | the ribbon's inner light; temperature shifts warm as the day rises |

**No chromatic accent in the shell — none.** The only colour on the site lives
inside the three concept worlds (Meridián ember, Štatút oxblood, Vlna citrus),
which stay exactly as built [refokus: colour only in the work]. The CTA is an
ink/frost inversion pill, never a coloured fill.

## Typography

The v2 complaint was semibold-everywhere Archivo. The records' answer has two
temperaments, so v3 has exactly two:

- **Display — light, enormous, tight.** Weight 300–350 at `clamp` sizes up to
  ~9vw, tracking −0.02em, generous leading over the world [exoape: confidence
  through lightness]. Used for the act statements only.
- **Engineering — mono annotations.** Geist Mono stays, promoted from footnote
  to signature texture: coordinates, measurements, `//` comments, act indices,
  laid over the world like an engineer's drawing [igloo]. The existing
  `PREŠOV · 49.00° N` line was already this voice — v3 makes it systemic.

Family: **Geist Sans** (via `next/font/google`) for display and body — light
weights for statements, regular for body; it pairs natively with Geist Mono
and reads engineered-modern [basement runs on Geist]. Archivo and its width
axis retire with v2; Fraunces retires from the shell (it survives inside the
Meridián world, which owns its own grammar). One family + one mono is the
whole system — fewer voices than v2, each with a real job.

## The world (5D)

- **One environment:** volumetric fog over a subtle ground plane; the ribbon C
  as the only object, lit from within [igloo]. No stage swaps, no material
  changes between acts.
- **Camera per act, light per act:** /01 close on the ribbon in deep fog ·
  /02 the camera passes the opening, light lifts one stop · /03 the fog thins,
  the three work planes hang in mist-light, each with its own interior colour
  · /04 near-frost calm, the world recedes to a shallow relief · /05 full
  clarity, the ribbon closes, warm-tinted glow.
- **DOM floats over the world at full opacity** [exoape]; text never dips
  below readable during its hold (Step 4 §4 stands).
- **Stage blocks** where a contained exhibit is needed (the /02 before/after):
  a darker framed volume set INTO the atmosphere, lusion-style, instead of a
  floating plane in a void.
- **Density rhythm:** vast light statements alternate with dense engineered
  passages — annotated craft artifacts, measured performance figures, the
  packages grid [basement's wow rhythm]. Codera's density is craft artifacts,
  never fake logos.
- Native scroll, no synthetic smoothing, input → immediate response — all
  standing rules hold [lusion's latency bar].

## Obsidián — the third element

Added 2026-08-31 on Ondrej's idea, recorded before implementation: the world's
colours read as a stone — chrome-black **obsidian** — and the wow layer is
floating fractured shards of it, dynamic on scroll. The idea fits the direction
exactly, and it completes the material story: the world had atmosphere (fog)
and light (the glow); obsidian gives it **matter**.

**The narrative job** (motion must never be decoration): the shards are the raw
material and the ribbon is the crafted form. /01 opens with sharp scattered
shards drifting in the fog; as the light rises they thin and settle; by /05
almost nothing is left but the closed ribbon in full clarity — raw web, refined
into shape. That is Codera's offer told in matter.

**The rules that keep it wow instead of kitsch:**

1. Few and large — 6–8 shards, never confetti [lusion: objects with weight].
2. Monochrome obsidian only: black glass body, chrome-like frost speculars from
   the environment; zero chroma, per the shell law.
3. Distributed in real depth for parallax; the big ones live behind the ribbon.
4. Motion is slow drift + slow rotation, scroll-linked; the pointer adds a
   subtle magnetic tilt [lusion]. Nothing bounces, nothing spins fast.
5. Shards never cross text during its hold — placement is biased away from the
   copy zones, and their presence fades in text-dense acts.
6. Reduced motion: the shards freeze into a composed still — a layout, not a
   fallback. They do not disappear.
7. World tier only; flat mode keeps the CSS fog (a static shard would read as
   a pasted sticker without the live light).

## Motion tiers

Tier 1 signature (unchanged count, re-aimed): the light itself rising across
the journey · the /02 pass-through · /03 world-to-world light shifts · /05
ribbon closing. Tier 2: slow dissolves, never wipes [exoape]. Tier 3 micro:
pointer-reactive ribbon material [lusion], magnetic CTA. Tier 4 stillness: /04
whole act. Reduced motion: the sunrise becomes five static light states — a
layout, not a fallback.

## Failure answers (the four complaints, named)

| Complaint | v3 answer | Records |
| --- | --- | --- |
| Málo wow | One luminous 3D protagonist + vast light type ↔ dense engineering rhythm | igloo, exoape, basement |
| Zlé farby | Monochrome fog-to-frost atmosphere; light replaces palette as the emotion carrier | igloo, exoape |
| Zlá typografia | Two temperaments: light display + mono engineering; Archivo retires | exoape, igloo, basement |
| Pôsobí rozbito | One environment; acts are camera + light only | igloo, activetheory |

## What survives from v2 unchanged

The C ribbon geometry and its parametric source · the Step 6 copy deck verbatim
· the three concept worlds' interiors · the packages and every commercial fact
· monochrome-shell/colour-in-work law · all process constraints (no Lenis,
readability over choreography, reduced-motion-as-layout, nothing invented).
