# Codera Art Direction v2 — "Zlievareň" (The Foundry)

Redesign direction built from INDIVIDUAL design records of
styles.refero.design (23 newly fetched + 18 from the Step-1 study; 9
read in full this session, the rest via structured extracts). This
document is the contract for the implementation and the source of the
final reference report.

## The verdict on v1 (own critique, accepted)

The shipped Step-5 experience is architecturally right and visually
underfed: act canvases are empty fields with small floating cards; the
"worlds" are wireframes; /02 is a mockup in a void; whitespace reads
as missing design, not composition. The references below are all
RICHER per viewport while remaining disciplined. That is the gap.

## Core concept

**Codera je zlievareň — the interface is a monochrome editorial
gallery floating on molten metal.** One liquid light-media gesture
(the foundry glow) recurs at the opening and the resolution; the
projects are three full-bleed PAINT WORLDS; every section sits on a
material canvas, never on emptiness; hairline rules and hard tonal
band changes replace floating cards.

## Reference → extraction → transformation map

| Individual record (read fully) | Extracted idea | Codera transformation |
| --- | --- | --- |
| **monopo saigon** (monopo.vn) — "liquid iridescence behind editorial silence" | ONE chromatic liquid-media gesture per page behind a strictly monochrome interface; patient motion `cubic-bezier(0.19,1,0.22,1)` 0.8–1.25 s; rotating circular scroll badge; binary radius (0 ↔ pill) | The **molten-titanium atmosphere**: champagne→amber→oxblood liquid gradient media behind the hero C and again in /05 — in our metal palette, not their green. Their motion curve becomes the global entrance/transition curve. Rotating „SCROLL" badge in the hero |
| **OHZI** (ohzi.io) — "a glowing cube suspended in a dark gallery" | The 3D object owns ALL color; grayscale skeletal chrome; **reflective wet floor** under the object sells the space | The C gets a mirrored-clone floor reflection in the world; hero chrome stays achromatic so the metal + molten glow carry the color |
| **The1** (the1.amsterdam) — "building-scale typography on painted concrete" | Four paint colors as **full-bleed identity blocks** ("the color block IS the card"); concrete canvas as material; type walls at lh 0.70; hairline rules as section breaks; conversational „question + pill" CTA pairs | /03 worlds become full-bleed paint worlds (concrete / sage / olive), never cards floating on tone; /04 and /05 get question+pill CTAs; hairline rules replace empty gaps between acts |
| **Peggy** (peggy.com) — "monochrome art gallery on a winter morning" | Canvas color doubling as the border color; pill-masked imagery signals "art object"; a single ornamental gesture | Canvas-as-hairline tokens; the one ornament rule guards against decoration creep |
| **Martin Laxenaire** — "kinetic poster crashing through liquid color waves" | Binary type scale (whisper OR roar); display text **crashing through** the color field; scroll-% pill in nav | Hero wordmark at poster scale overlapping the C and the molten field; /03 Konštrukt type-wall collides with the blueprint mural |
| **Mercury** (mercury.com) — "alpine banking at blue hour" | Frosted-glass nav on scroll; graphite one-step card lift; intermediate weight as voice | The nav gets a backdrop-blur frost once scrolled (also fixes the v1 collision issue); Vitalis booking panel floats as glass |
| **Klim / Break Maiden / Readymag / Apple / Wealthsimple / BelArosa** (Step-1 full reads) | band-stacked exhibition rooms; black gallery + work carries color; solid color panels instead of shadows; three-act dark→light; serif-moment luxury | Act structure & tonal dramaturgy retained from Step 5; now executed with material canvases |

Extract-level influences (records consulted via structured extracts):
**Hyperstudio** (dot-matrix graphics, hairline-carved dark, compass-gold
accents → Konštrukt mural + dark-act language), **North Kingdom**
(wordmark sharing a baseline with the 3D emblem → hero wordmark/C
relationship), **Auros** (same-hue surface stack, particle atmosphere →
Vitalis depth + pass-zone particles), **ORYZO AI** (warm-cream text on
warm darkness, 100 vh museum pacing → /01 materiality), **Superhuman**
(parchment + wine CTA + glass UI cards over imagery → BILANC after
state), **VISIONNAIRE** (hard 50/50 split, tracked uppercase → /02
full-viewport split), **Navigate** (full-bleed color bands as sections,
floating pill nav → /04 band construction), **AREA 17** (monochrome +
one electric strike between full-bleed media blocks), **Limón**
(black-olive + single lemon accent, stencil tracking → Forma's
candlelit gallery), **Studio HEED** (micro-label gallery signage →
Forma index), **Cursor** (ember only on text links; tightening
tracking curve), **Axelar** (node-dot category accents), **Lamanna**
(hard color-band rhythm; solid-offset display shadow), **Fly.io**
(all neutrals share the brand hue family), **Air** (glass forms over
atmospheric photography).

## The act script v2

- **/01 ODLIATOK (dark, molten):** graphite canvas + liquid
  molten-metal media field; C with floor reflection; CODERA wordmark
  at poster scale behind the statement; rotating scroll badge; nav
  achromatic. NO flat empty graphite.
- **/02 PREMENA (full-viewport wipe):** the ENTIRE viewport is the
  surface — left world = believable average site (cool gray-blue,
  bootstrap-grade), right world = BILANC redesigned to
  Superhuman/Wealthsimple grade (parchment, bottle-green ink, serif
  moments, glass stat cards, wine-dark CTA). The metal seam wipes
  across 100 vw on scroll; statement holds after completion.
- **/03 THREE PAINT WORLDS (full-bleed each):**
  - **KONŠTRUKT** — painted concrete world: #d8d7d2 material canvas,
    condensed type-wall (Archivo width-axis, lh 0.8), full-height
    blueprint mural (dot-matrix + axonometry + dimension labels),
    steel material bands, amber signal accents, dense spec strip.
  - **VITALIS** — sage clinic at dawn: #e7efe9 sage canvas, deep-teal
    ink, breathing gradient orbs, glass booking panel, pill geometry,
    trust chips. Rounded humanist voice.
  - **FORMA** — candlelit gallery (the journey's second dark act):
    #201a15 warm-olive canvas, serif italic display (Fraunces),
    material plates (oxide/ochre/forest) as color-block composition,
    micro-label project index, one rust accent.
- **/04 REMESLO (structured warm band):** full-bleed warm-paper band;
  left sticky title, right three discipline rows with poster numerals;
  strand hairlines drawing in; price + question-pill CTA pair.
- **/05 LIATIE (molten bookend):** molten media returns low-key behind
  the frontal C; statement; question+pill conversational close;
  compact footer. Ends in material, not blank paper.

## Global systems

- **Palette:** interface achromatic (graphite ink / paper) + metal
  material; chroma lives ONLY in (a) molten media, (b) the three
  project worlds, (c) BILANC-after. Unchanged law, now visible.
- **Type:** Archivo (width axis as the industrial voice; poster scale
  lh 0.78–0.9 walls) + Geist Mono (labels) + **Fraunces** (Forma world
  + BILANC serif moments only).
- **Radius:** binary — 0 px surfaces, 9999 px pills (monopo law).
  10 px only on floating glass panels.
- **Motion:** entrance/transition curve `cubic-bezier(0.19,1,0.22,1)`,
  0.8–1.1 s; scrub mappings stay raw/native; stillness kept in /04.
- **Rules not gaps:** consecutive sections separated by 1 px hairlines
  or hard band changes; no >20 svh of unpainted canvas anywhere.
- **Nav:** frost-glass after scroll; act-adaptive ink stays.

## Quality gate for this redesign

Every act screenshot is compared against its governing references
(monopo/OHZI for /01, VISIONNAIRE/Superhuman for /02, The1/Hyperstudio/
Auros/Limón for /03, Navigate/The1 for /04, monopo for /05). If the
reference frame is clearly better art-directed, iterate before moving
on. Final report includes this comparison honestly.
