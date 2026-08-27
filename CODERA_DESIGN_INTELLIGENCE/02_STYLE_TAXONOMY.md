# 02 — Style Taxonomy

Eighteen style archetypes clustered from the full 1,290-entry catalogue
(assignments are multi-label; an entry can belong to several families —
counts below are how many catalogue entries matched each family's
signals). Every archetype has a full record in `styles/`.

The taxonomy deliberately spans far beyond Codera's current dark-tech
comfort zone — that breadth is the point of the library.

| # | Archetype | Catalogue matches | One-line identity | Record |
| --- | --- | --- | --- | --- |
| 1 | Dark / cinematic | 243 | black canvas as a stage; light is scarce and earned | `styles/dark-cinematic.md` |
| 2 | Light / editorial | 355 | magazine logic: type scale IS the design | `styles/light-editorial.md` |
| 3 | Warm editorial | 525 | cream/paper canvas, warm ink, sunlit calm | `styles/warm-editorial.md` |
| 4 | Minimal / Swiss | 285 | grid, restraint, one family, near-zero ornament | `styles/minimal-swiss.md` |
| 5 | Luxury / fashion | 194 | serif moments, ghost buttons, slow rhythm, scarcity | `styles/luxury-fashion.md` |
| 6 | Industrial / architectural | 252 | blueprint and concrete: hard edges, specimen labels | `styles/industrial-architectural.md` |
| 7 | Corporate / institutional | 306 | legible authority; system over expression | `styles/corporate-institutional.md` |
| 8 | Healthcare / clinical | 253 | calm, clean, warm-clinical; trust through softness | `styles/healthcare-clinical.md` |
| 9 | Playful / children | 187 | sticker-soft radii, flat vivid fills, character art | `styles/playful-kids.md` |
| 10 | Ecommerce / product-first | 203 | the product is the hero; UI recedes to a mount | `styles/ecommerce-product.md` |
| 11 | Hospitality / sensory | 337 | atmosphere first: photography, warmth, appetite | `styles/hospitality-sensory.md` |
| 12 | Organic / natural | 213 | earth palettes, botanical imagery, unhurried | `styles/organic-natural.md` |
| 13 | Tech / SaaS | 535 | product screenshots, one accent, engineered chrome | `styles/tech-saas.md` |
| 14 | Brutalist / experimental | 203 | oversized type, raw edges, rules broken on purpose | `styles/brutalist-experimental.md` |
| 15 | High-color / expressive | 299 | saturated color blocks do the separating | `styles/high-color-expressive.md` |
| 16 | Soft pastel / friendly | 208 | low-saturation warmth; approachable, unthreatening | `styles/soft-pastel-friendly.md` |
| 17 | Image-led / art-directed | 117 | photography carries everything; UI goes silent | `styles/image-led.md` |
| 18 | Retro / craft / illustrated | 164 | hand-made texture, period voice, personality | `styles/retro-craft.md` |

(39 catalogue entries matched no family signals — mostly hybrid product
pages; they were reviewed and fold into tech-saas / minimal-swiss hybrids.)

---

## How the families relate

**Canvas axis** (the biggest fork): dark stage (1, parts of 10, 13) ↔
white gallery (2, 4, 14, 17) ↔ warm paper (3, 8, 9, 11, 12, 16).
The catalogue splits 22% / ~30% / ~48% along this axis — warm paper is
the largest territory in quality work.

**Voice axis**: typographic voice (2, 4, 5, 14) ↔ imagery voice
(10, 11, 17) ↔ product voice (13, parts of 10) ↔ illustration voice
(9, 18).

**Temperature axis**: austere (1, 4, 6, 14) ↔ warm-composed (3, 5, 11,
12) ↔ friendly-energetic (9, 15, 16, 18).

## Legal hybrids (seen repeatedly in the catalogue)

Hybrids work when ONE family owns the canvas and the other contributes a
single subsystem:

- **Luxury × fintech** (Wealthsimple): warm-editorial canvas + serif
  display, fintech component discipline. The money subject gains warmth.
- **Cinematic × product** (Apple): dark stage for hero acts, light
  editorial band for detail acts — a three-act page. The template for
  dark/light dramaturgy.
- **Clinical × warm** (Headspace, Finn): healthcare trust + cream canvas
  + pill radii = "warm-clinical", the modern health default.
- **Editorial × SaaS** (Attio, ElevenLabs): quiet SaaS chrome + serif or
  whisper-weight editorial moments = premium without darkness.
- **Brutalist × commerce** (Break Maiden): black gallery + product
  photography carrying all color.

## Hybrids that fail (recurring anti-patterns)

- Two canvases fighting (cream sections + cold-gray sections in one page).
- Display face used at body sizes to "unify" a pairing.
- Playful radii (50px+) on an institutional trust surface.
- Dark-cinematic canvas + dense dashboard content (cinema needs scarcity).
- Accent colors from both parents kept — hybrid pages still get ONE
  action color.

## Using the taxonomy

1. Run `DESIGN_DECISION_ENGINE.md` against the client context — it outputs
   1–2 candidate families, never a personal favorite.
2. Read the family record(s) in `styles/` — each includes business fit,
   poor-fit contexts, failure modes, and combination guidance.
3. Steal the *logic*, never the artifact: records cite real exemplars so
   the reasoning stays inspectable, but palettes/type/tokens must be
   rebuilt for the client. (`data/refero-catalogue.tsv` holds the full
   1,290-entry index for finding more reference points per family.)
