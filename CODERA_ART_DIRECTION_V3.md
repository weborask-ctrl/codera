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

## Amendment 2026-08-31 — the worlds go dynamic, the page gains an effect tier

Ondrej's verdict after the Žiara release line: the direction is right, but the
level is not — the main page has too few effects to be "wau representative",
and the concept worlds are static backdrops on the old system. Both change:

**The concept worlds become dynamic 5D mini-sites**, each with its OWN type
family on top of its own palette — the range must now be typographic too:

| World | Family | Motion signature |
| --- | --- | --- |
| Meridián | Fraunces (kept) | pointer-tilt on the bags, the latitude line draws itself, slow warm drift |
| Štatút | Instrument Serif (new) | restrained by contract — staggered index reveal and a slow scanning hairline; its stillness stays the point |
| Vlna | Bricolage Grotesque (new) | pulse on live capacity, arcs draw on entry, energetic reveals |

Each world reads its own scroll progress (`--wp-*` vars from the stage) and
the pointer (`--tx/--ty` on its shell), so interiors move with depth — layers
at different parallax rates, entrances choreographed when the world takes the
frame. All within the standing rules: readability over choreography, native
scroll, reduced motion freezes everything into composed stills.

**The page gains a micro-effect tier**: act statements rise line by line when
they enter; a frost progress hairline tracks the journey at the top edge; the
/01 flat mode gets pointer-following glow. Few, consistent, and each tied to
real state — never decoration for its own sake.

The font cost (+2 families) is accepted consciously against issue #5; the
range argument wins over the kilobytes, and the numbers get re-measured.

## Amendment 2 — 2026-08-31: the concepts become real sites, /03 becomes portals

Ondrej's verdict on the dynamics release: the concept designs sit at half the
main page's level, and /03 reads boring and AI-generated. The fix is
structural, not cosmetic:

1. **Each concept is a full 5D responsive website** at `/koncept/<slug>` — a
   real multi-section scrolling page a visitor can browse: hero, commerce or
   document sections, motion choreography, its own responsive behaviour. The
   LIKED references set the bar and the grammar; the faces and palettes stay
   Codera's own per-world identities (Fraunces / Instrument Serif / Bricolage,
   the ember/oxblood/citrus climates). Every page carries a slim honest ribbon
   back to codera.sk — a concept, never a fake client.
2. **/03 becomes a portal gallery.** The full-bleed sticky stack retires.
   Each project gets an editorial split: the name at poster scale in its own
   face, sector + the reasoning line, and a PORTAL — the concept's live hero
   rendered small in a perspective-tilted frame that answers the pointer.
   Two ways in: „Vstúpiť do konceptu" (the full site) and the case study.
3. The case studies embed the same live hero and link to the full site.

The v2-era `worlds.tsx` retires with the stack; the concept sites own their
sections, and the portals reuse their heroes — one source, no drift.

## Amendment 3 — 2026-08-31: skills, not brands

Ondrej: invented brand names go ("Meridián — už len ten názov je zlý").
Refokus's model applies — the showcase section elevates the SKILLS the sites
contain. Each skill gets a demo page that embodies it:

01 Dizajn · 02 Objednávky · 03 Rezervácie · 04 Animácie & 3D · 05 Výkon

The three built demo sites stay as the first three skills' pages, de-branded
to generic nouns (Pražiareň, Kancelária, Štúdio) — the content demonstrates
the capability, no fictional company pretends to exist. 04 and 05 are marked
V PRÍPRAVE until their sessions build them, one at a time.

/02 becomes a refokus-grammar skills index: numbered rows with the skill at
display scale, commercial one-liners, capability tags, and a live portal
preview of the active row. The top ribbon on demo pages is deleted; a small
corner DEMO · CODERA tag replaces it.

## Amendment 4 — 2026-08-31: Iterácia 0.1 (Ondrej's full pass)

The complete per-section revision, from Ondrej's list, with his four
clarifications folded in:

- **Type**: display voice moves to Fraunces — used MODERN (large, tight,
  confident, no shadow halos), never bookish. All main headings, site-wide.
- **The C is redesigned freely**: a crystalline faceted object in the obsidian
  family — sharp defined edges, unmistakable at first sight. The 2D mark stays
  for flat/brand surfaces; the 3D object is its own thing now.
- **Micro-labels die everywhere**: act eyebrows (01 — ŽIARA, 03 REMESLO…),
  edge rails, ghost CODERA, hero mono annotations, portal tag chips, demo-page
  provenance strips, the Slovakia map. Honesty moves to metadata + the fixed
  DEMO · CODERA corner tag (kept, always visible) + the footer disclaimer.
- **Nav becomes a dynamic island**: floating pill, condenses on scroll; the
  menu ids and a11y contract stay.
- **Orbit choreography**: on the 01→02 pass the stones fly an orbital around
  the C — scrubbed by scroll, interruptible at any point — then settle into
  slow rotation tinted to the 02 atmosphere. Stones must never read flat
  black while turning: rim/env light keeps facets alive.
- **/02 is scroll-driven**: the sticky portal switches demos as the visitor
  scrolls the rows (hover still previews); showcases never just scroll away.
- **/03**: bigger heading pair, obsidian cluster bottom-left, shorter pricing
  copy (the ", nie až v zmluve" clause goes), the process trio enlarged with
  dimensional artifacts (Dizajn first).
- **/04**: the crystal C fully visible in the section's own colour (dark
  graphite variant on frost), calm orbiting frost stones, bigger next-steps,
  and a contrasting ink footer band.

## Amendment 5 — 2026-09-01: the paper intro

Ondrej's load animation: a strip of paper travels along the top edge, and at
the right it curls into the C — the brand story told literally, because the
mark IS a folded strip. The formed C lifts into its 5D presence, tints a
gentle blue, and hands off to the real ribbon beneath.

Graffiti-C craft rules folded in (his reference request): the C stays OPEN on
the right — closing it reads as an O; a bold dark OUTLINE keyline under the
body stroke makes it read; the DROP SHADOW is a hard dark copy offset
bottom-left (light from top-right), not a blur. Layered build: shadow →
outline → body.

Rules: plays once per session, ~2.6 s, never blocks input (pointer-events
none, content visible beneath); reduced motion skips it entirely; the real C
holds back (world opacity gate + flat-img CSS) until the handoff so the mark
never doubles. GSAP timeline — the sanctioned engine — with overlapping
tweens for the smoothness Ondrej asked for by name.

## Amendment 6 — 2026-09-01: Iterácia 0.2 / 01

Ondrej's hero pass: the paper intro is CUT (it did not land — deleted, not
parked). The C keeps its approved shape but must read SYMMETRIC — the hero
camera straightens toward frontal and the sway drops to a breath. Descenders
(g, j, p) were being clipped by the line-rise masks site-wide — the masks get
descender room. The island slims down and loses the act pill. The headline
separates from the C with a quiet fog scrim on the text side, never a text
outline. Obsidians gain top-left homes; the 01→02 orbital spins calmer — one
clean sweep, no pointer wobble mid-flight.

## Amendment 7 — 2026-09-01: the asteroid C

Ondrej's next hero move: the C ASSEMBLES from the meteorites themselves on
load — smooth, staggered, 5D — on the RIGHT side, with the copy on the left
and no overlap. On scroll the letter BREAKS APART and the stones become the
background asteroids of the next act; the break is scrubbed by scroll, so
reversing the wheel reassembles the letter. The hero ground lightens to a
mid graphite-grey with black-grey stones; the ribbon GLB leaves the hero and
survives only as the /04 bookend. The line-rise masks gain more descender
room after the g-clip resurfaced. Flat mode (no WebGL) keeps the 2D mark —
an assembly without the world would be a fake.

## Amendment 8 — 2026-09-01: Iterácia 0.3 — typography IS the hero

After five image mockups (glass C, particle C, anamorphic C, monolith, stone
gate, full carved C, live-work plate), Ondrej picked TYPOGRAFIA AKO HERO
("3 jednoznačne najkrajšia"): the letterform leaves /01 entirely. The
headline is the main element — Fraunces at display scale (~11.4vw, capped by
svh so the fold always holds three lines + support), broken as "Vaša firma
je / lepšia, *než ukazuje* / váš web." with the accent in TRUE italic
(Fraunces italic loads now; a faux oblique at this size reads as a bug)
[refokus: type at display scale; exoape: confidence through lightness].

The obsidian stones stay VISIBLE, as themselves: a hanging constellation —
three boulder anchors right of centre, the rest scattered into real depth,
a few deep far-left for balance. No letter slots in the hero; on scroll the
field disperses into the background asteroids (scrubbed, reversible). The
/04 bookend C assembly is untouched — the letter now lives only where the
journey resolves. Flat mode drops the 2D mark too: typography carries /01
everywhere.

## Amendment 9 — 2026-09-01: Iterácia 0.4 — /02 as a pure index

Ondrej's pass on the skills index: the rows lose their numbers and their
support lines — ONE intro paragraph under the section heading serves the
whole list; below it, only titles. The titles grow to display scale and a
heavier cut (Fraunces ~520) so the index reads as typography, not as a
table [refokus]. The portal answers the POINTER as well as scroll: a
hovered row takes the portal immediately and keeps it until the pointer
leaves the index. The case-study link surfaces only on the active row.

The two unbuilt skills get honest provisional teaser panels inside the
portal frame (Animácie & 3D: dark orbital sketch; Výkon: the 0,4 s metric
with load bars) — labelled UKÁŽKA V PRÍPRAVE, never a dead link, each to
be replaced by its real demo in its own session. The dashed placeholder
is gone.

## Amendment 10 — 2026-09-01: Iterácia 0.5 — /03, the forge

Ondrej's list for the services act, plus the strongest narrative beat of
the journey: /03 is where raw capability becomes product, so the stones
FORGE THE MARK there. Bottom-left, scrubbed by scroll: the stones line the
C, then sink into a smooth extruded letter as it sets — a crossfade morph,
not a vertex morph (reversible by construction, and it reads as casting,
not melting). The set letter is FLAT INK (unlit material): the mark is
graphic, and the studio softbox must not silver it.

DOM changes: the act heading joins the display league and loses its
support line; the three discipline rows grow heavier (Fraunces ~520) with
slightly stronger body text; the isometric specimens answer the hand —
plates fan apart on hover, the stack tilts with the pointer, and a quiet
pulsing dot invites the pass-over. Pricing cards lead with the two facts a
visitor scans for: the package name in serif and the price at display
weight; everything else drops to footnote weight.
