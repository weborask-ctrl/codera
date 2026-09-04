# EcoDomček — Art direction (draft 1)

Companion to `PLAN.md` §3 (the one-page brief) and §6 (the reference map).
This document turns the brief into tokens and held frames. It is a draft
until two things happen: Ondrej calibrates the eight PENDING records named
below, and the boards in `boards/` pass his static-frame review. Written
2026-09-03 with those records treated as *working* references, on Ondrej's
instruction to proceed.

References this direction is traced to — LIKED: `igloo`, `refokus`, `exoape`,
`cowboy`, `lusion`, `basement` · PENDING (working): `raus`, `aspelin-reitan`,
`70materia`, `planpoint`, `moving-parts`, `scale`, `lightship`, `manna`.
Archetype records: `organic-natural`, `warm-editorial`,
`industrial-architectural` (annotation subsystem only).

---

## 1. The idea in one sentence

**A crafted wooden model of an EcoDomček house stands on warm paper; you walk
through it by scrolling; every room is a page; the only images are the model
and their own job-site photographs.**

**Revision 2026-09-03 (Ondrej):** the house is rendered **photorealistically**
— the "visibly a model / maquette" language of draft 1 is withdrawn; it read
as dated, not as honest. Honesty is carried by the `Vzorový dom` label, not
by the render style. Production imagery is offline path-traced (Blender
Cycles) from a proper model with PBR materials, physical sky and a
furnished interior; real-time WebGL is reserved for the interactive beats
(the wall X-ray, the roof lift). The boards in `boards/render/` are Cycles
renders composited under the same DOM layer (`npm run capture:ecodomcek --
--render`); the three.js study in `scene.js` remains only as the camera/
composition reference.

## 2. Canvas and colour

One temperature: warm. Paper is the ground and the sky of the world; the
house's materials carry the chroma; one green needle does every action.

### 2.1 Ladder (UI roles)

| Token | Hex | Role |
| --- | --- | --- |
| `--paper` | `#F3EDE2` | Canvas, world ground and sky (day acts) |
| `--paper-2` | `#E8DFCE` | Recessed band, plate mats, the table in the dollhouse act |
| `--snow` | `#FFFFFF` | Elevated panel (contact panel, minimap card) — the free elevation level, no shadow |
| `--hairline` | `#D9CDB8` | 1 px rules, plate borders on paper, dividers |
| `--ink` | `#2B2520` | All text and icon strokes on paper. `#000000` is forbidden |
| `--ink-2` | `#6B615A` | Secondary text (AA on paper: 5.2 : 1) |
| `--moss` | `#4E6B21` | **The action colour.** CTA fill, links, focus ring, the active room chip. Nowhere else. (Derived from the logo's olive `#7A9635`, deepened until it passes AA as text on paper: 5.0 : 1) |
| `--dusk` | `#1B2430` | The single dark act (/kontakt): sky and ground |
| `--dusk-2` | `#26303F` | Elevated surface inside the dusk act |
| `--amber` | `#F2C46D` | Window light in the dusk act only. Never UI |

### 2.2 Materials (world only, never UI)

| Material | Hex class | Where |
| --- | --- | --- |
| Larch, oiled (Rhombus profile) | `#C89A5B`, plank variance `#B5834A`–`#D8B07A` | Facade, deck |
| Anthracite compact panel (Fundermax) | `#2E2F31` | Facade panels, window frames, roof edge |
| Spruce, planed | `#E9D9BD` | Interior walls, ceilings, stair |
| Glass | `#7A8C96` at 35 % | Windows, the terrace roof |
| Wood-fibre insulation | `#B89A5C` | X-ray act layer |
| Hemp / sheep wool | `#CDB98A` / `#E6DCC8` | X-ray act layers |
| Gypsum-fibre board | `#D8D2C7` | X-ray act layer |

Light arc across the journey (PLAN §4.4): morning (warm key from the left,
long soft shadows) → interior daylight (the paper reads as the room's own
light) → table light (a hard raking key on the dollhouse; the model must read
as an object) → dusk (`--dusk` sky, windows in `--amber`). Tones only move
forward.

### 2.3 Elevation

Shadowless UI (05 §4). Elevation by temperature: paper → snow. The only
shadows on the page are the model's own, in the world.

## 3. Typography

Strategy: **display voice + quiet workhorse + mono metadata + one serif
moment** (04 §1). Three families, three jobs, no overlap.

| Face | Job | Sizes | Weight | Tracking |
| --- | --- | --- | --- | --- |
| **Instrument Sans** | Display and body. Display at 400 (500 only for the wordmark and buttons). Never 600+ | 17 body · 20 lead · 28 · 40 · 64 · 96 display | 400 / 500 | display −0.02em → −0.035em at 96; body 0 |
| **IBM Plex Mono** | Annotation and data: room index (`02 / TERASA`), material labels, dimensions, plate captions, chips | 12 · 13 | 400 / 500 | +0.06em, uppercase for labels; tnum on |
| **Instrument Serif** (italic) | The human voice only: Roman's story headline, testimonials | 28 · 40 | 400 | 0 |

Rules: body 17 px / 1.55, measure ≤ 68 ch, left-aligned always. Display
line-height 1.0 at 64–96, 1.1 at 40. Uppercase only in mono, always tracked.
The serif never appears in a text block with the sans. All three ship
`latin-ext`; the boards render ď ľ ť ž ô with these exact files
(`boards/fonts/`) — verify again in the production pipeline.

Scale: 12 · 13 · 15 · 17 · 20 · 28 · 40 · 64 · 96. Mobile display clamps
96 → 56, 64 → 40.

## 4. Spacing and shape

Spacing: 4 · 8 · 12 · 16 · 24 · 40 · 64 · 96 · 144. Macro gaps (between
acts) 96–144; micro gaps (inside a text cell) 8–16. The jump is the rhythm
(01 §4).

Radius dialect `{0, 6, 999}`: images, plates, panels and the world 0;
buttons and inputs 6; the floor-plan room chips 999. Nothing else.

Page model: **full-bleed world, contained text**. Text columns sit on a
12-column grid, max 1360 px, 40 px gutters; a room's copy occupies columns
1–5 or 8–12, never centred, so the model keeps the other half of the frame.

## 5. Components

- **Nav**: wordmark left (the existing chevron mark + `ECODOMČEK`, 500),
  centre: mono room index `02 / TERASA` that updates per room, right: phone
  as a text link + `Bezplatná konzultácia` button (moss fill, paper text,
  6 px). Transparent over the world; a paper band appears only on scroll in
  the document pages.
- **Floor-plan minimap** (bottom-left, desktop): a snow card with a 1 px
  ink outline drawing of the plan, rooms as mono chips (999); the active
  chip is moss-filled. Click scrolls. On mobile it becomes a horizontal chip
  rail above the thumb zone.
- **Room copy cell**: mono eyebrow → display headline → lead → body → one
  text link with `→`. The atomic editorial cell (06 §6).
- **Plate**: a job-site photograph edge-to-edge in its box, 1 px `--ink`
  hairline, mono caption below (`LÚČINA · 2022–2024 · RHOMBUS + FUNDERMAX`).
  Rows of 2–3, never a masonry.
- **Annotation**: mono label + 1 px leader + 4 px dot, positioned from a
  projected 3D anchor. Only in the X-ray act and the dollhouse.
- **Spec table** (Strechy): hairline rows, mono values, no card.
- **Contact panel**: snow card on the dusk world; visible labels above
  fields; the "what happens next" sentence beside submit; phone and mail as
  links above the form, not hidden below it.
- **Buttons**: primary = moss fill / paper text; secondary = 1 px ink outline;
  tertiary = text + `→`. One primary per viewport; the label is always
  `Bezplatná konzultácia`.

## 6. Imagery

Two grammars, never in one frame:

1. **The model.** Plank-scale wood grain, hard-edged joinery, a single key
   light per act, contact shadows, no bloom, no fog indoors. Interiors
   furnished with simple spruce volumes (a table, a bench, a bed) so rooms
   read as rooms without staging.
2. **Their photographs.** Phone snapshots from the sites, presented as
   plates. No colour grading beyond a consistent warm white balance; no
   crops that hide the mess of a building site — the mess is the proof.

Forbidden: stock, renders sold as photos, illustration, icons beyond the
minimap drawing.

## 7. Motion

Storytelling tier, one engine (GSAP + ScrollTrigger), native scroll, no
pins. Scroll → camera spline; each room a held pose with a plateau. World
damping ≤ 120 ms; DOM values raw. Text: ENTER once (IO) → hold → EXIT.
Feedback ≤ 150 ms. Ambience only outdoors (a slow cloud shadow crossing the
facade), paused off-viewport. The X-ray act is the one sticky region
(200 svh, three states). Reduced motion = the floor-plan layout: an
orthographic plan with the current room marked, same copy, no flight.

## 8. Mobile direction

Not shrunk: a vertical deck of per-room stills (rendered from the same
scene at build time) with the room copy under each, the chip rail as nav,
`Zavolať` in the thumb zone on every room. Display 56 max, body 17. Plates
in single column, captions kept. The X-ray act becomes a tap-through of the
three states. No WebGL on touch in v1.

## 9. Held frames (the boards)

`boards/` composites the DOM layer (the tokens above) over a Cycles plate from
`cycles/`, and captures:

| Board | Device | What it must prove |
| --- | --- | --- |
| 01 Príjazd | desktop, mobile | First viewport answers "what is this, why care": house + headline + CTA + benefit band; the model reads as crafted wood |
| 03 Obývačka | desktop, mobile | A room can hold a full copy cell and two plates without the world losing the frame |
| 04 Röntgen | desktop | The annotation subsystem: exploded wall, mono labels, one signal colour, still on paper |
| 07 Dollhouse | desktop | The model as an object on a table; real projects as plates; density of real content |
| 08 Súmrak | desktop, mobile | The one dark act: amber windows, snow contact panel, facts on light |

Each capture is judged in the review order (hierarchy → system → states)
and against the references side by side before anything is built.

### 9.1 Draft 1 — review (2026-09-03, four capture iterations)

Captures in `boards/out/`. Iterations 1–3 fixed: the house too close in
every frame (headline over the anthracite box), an unlit interior with a
point-light blob, colliding X-ray labels, minimap over the benefit band and
the register line, an unstyled wordmark link, a wrapped submit button, the
mobile hero and living copy sitting on dark geometry.

Static-frame test, per board:

| Board | Hierarchy | System | Verdict |
| --- | --- | --- | --- |
| 01 Príjazd desktop | eyebrow → headline → lead → CTA read in order; house on the right, one label | tokens hold; one green; mono only in labels | **passes** as a still |
| 01 Príjazd mobile | house upper half, copy on the paper ground, call in the thumb zone | — | passes |
| 03 Obývačka desktop | copy over the spruce lining, window left, sun patch on the floor, two plates | — | passes; the interior is the weakest material moment (see below) |
| 03 Obývačka mobile | headline over floor; the dark kitchen block still touches "hreje." | — | **not yet** — needs a furniture-free camera or a lower copy block |
| 04 Technológia | seven layers readable, labels cascade with leaders, one signal colour | — | passes |
| 07 Realizácie | roof lifted, model reads as an object on the table, three real plates | the facade label crosses the model | passes with one label to move |
| 08 Kontakt desktop/mobile | amber windows, snow panel, register line on light | — | passes |

Side by side with the references that informed them (Igloo's object-in-
environment, Lightship's product on cream, 70Materia's image-then-text,
Planpoint/Moving Parts' one-ink blueprint, Exo Ape's dusk): the composition
and the type discipline are competitive; the **model's material finish is
not** — the Rhombus bevel does not read at this scale, the anthracite
surfaces go flat black without an environment, and the interior is bare.
That is a content-production gap (PLAN §5.3: the Blender model with real
grain, bevelled profiles, baked bounce light, a lived-in interior), not a
composition gap, and it is why the boards are a study rather than a look
to build from.

Not validated: every capture is a headless SwiftShader render of a
procedural stand-in; no real device has seen these frames. Class: LOCAL.

### 9.2 Draft 2 — the plates are rendered, not modelled (2026-09-04)

Draft 1's verdict from Ondrej was blunt and correct: *"prečo to vyzerá ako z
roku 2010? malo ostré, málo realistické."* The maquette language was withdrawn
(§ revision note above) and the boards' world is now a **Blender Cycles scene**
(`cycles/`, `cycles/SPEC.md`): the same house, built from the same dimensions,
rendered offline at 1440×900 / 384 samples and composited under the identical
DOM layer. The annotation subsystem is unchanged — it now reads its anchors
from `world_to_camera_view` instead of a three.js projection.

What the switch actually changed, beyond the renderer:

| Draft 1 (three.js) | Draft 2 (Cycles) | Why |
| --- | --- | --- |
| flat-shaded blocks, no GI | path-traced, 8 bounces, real bevels | the Rhombus profile now casts its own shadow line, which is the whole point of that cladding |
| one hemisphere light | a SUN lamp on the sky node's own vector, sky as ambient, a procedural cumulus layer and a shadow-only cloud plane | a clean sky gradient and a shadowless facade were the two loudest CG cues |
| camera at 4.4 m looking down | **eye level, level camera, lens shift** (`spec.SHIFT`) | parallel verticals: how architecture is photographed. A camera that looks down reads as a model on a table |
| bare lawn plane to the horizon | meadow → hazed far field → two woodland bands at 330 m and 470 m; grass tufts where the ground meets built things | discrete trees were tried twice and read as low-poly lollipops; a distant mass with aerial perspective does not |
| empty facade | downpipe, gravel drive, gravel skirt, threshold | a building with no familiar object on it has no scale |

Reference traceability for the new decisions, all from records read in full:

| Decision | Records | What was taken | How it was adapted |
| --- | --- | --- | --- |
| Photoreal plate under a paper DOM, not a stylised world | `manna`, `aspelin-reitan` | full-bleed photography carrying the page while the UI stays hairlines and captions | our "photograph" is a render, and it is labelled `Vzorový dom · koncept, nie realizácia` wherever it appears |
| Eye-level, level, shifted camera | `manna`, `lightship` | the product/building sits *in* a landscape at human height, not above it | a 25° lens at 37 m, house in the right five columns, drive entering bottom-left |
| Morning key from behind-left, one facade lit, one in shade | `aspelin-reitan` | photographic light doing the modelling, no fill flattening | the sun sits round to the west so the raking light reveals the Rhombus relief and the shadow rakes into the copy field |
| Mono annotation over the render | `igloo`, `planpoint`, `moving-parts` | mono type as technical annotation — leaders, one signal colour, an engineer's drawing over a rendered world | one green, labels in the sky above the model, leaders dropped to projected anchors |
| The X-ray layer cascade | `planpoint`, `70materia` | one ink, one pen, one highlighter; image-then-text | seven real material layers, each with its own procedural material, labels cascading in the clear third of the frame |
| The paper veil behind copy that lands on the render | `aspelin-reitan`, `raus` | cream-on-cream layering as the depth device, never a drop shadow | a gradient of the page's own paper with a hairline where it starts, used on the living board and on mobile |
| The dusk act | `exoape` | warm photographic dark, type over the world, never flat black | one board only; the house goes to silhouette, the windows carry 2700 K practicals, the contact panel is snow |

Static-frame test on the eight composited boards (1440×900 / 780×1688,
plates at 384 spp, interiors and dusk at 512):

| Board | Reads as | Verdict |
| --- | --- | --- |
| 01 Príjazd desktop | headline on the sky, house in the right five columns, drive entering bottom-left, one concept label at the roofline, benefit band on the meadow | **passes** |
| 01 Príjazd mobile | house above the horizon, copy on the paper veil over the meadow, call in the thumb zone | passes |
| 03 Obývačka desktop | room left, copy on a paper veil right, sun on the oak floor, the deck and meadow visible through the glazing | passes |
| 03 Obývačka mobile | sofa and glazing top, the sun patch as the copy field | passes |
| 04 Technológia | seven layers on a bone ground, mono labels on paper chips cascading with leaders, one green on the load-bearing layer | **passes** — this is the board draft 1 failed twice |
| 07 Realizácie | model as an object on a warm ground, roof lifted, one concept label, three real projects as plates | passes |
| 08 Kontakt desktop/mobile | house in silhouette with warm rooms, snow panel, register line | **passes** |

Weakest surfaces, named rather than hidden: the meadow is still the least
convincing material in every exterior; the woodland band is a distant mass,
not trees; the model is cleaner than any built house (no weathering, no
dirt, no downpipe stains); and the interior's window view is a stop or two
brighter than a photograph would hold.

Not validated: every plate is a headless CPU render and every board is a
headless Chromium capture. No real device has seen these frames. Class: LOCAL.

### 9.3 What Ondrej decides

1. The direction itself — bone paper, larch and moss, whisper display,
   mono annotation, dusk close — against the LIKED bar.
2. The eight PENDING records (verdicts in `CODERA_DESIGN_REFERENCES/records/`).
3. Whether the photoreal plate is now at the level the reference set sets —
   and where it still is not (the honest list is in §9.2 and in the delivery
   note: the meadow is the weakest surface, the interior's window view blows
   out, and the model is cleaner than any built house ever is).
4. The room set: nine rooms is the ceiling; Terasa, O nás and Strechy have
   no boards yet and may merge.

## 10. Range check against Codera's own worlds

Codera: graphite → frost, titanium ribbon, Geist. Meridián: bone/umber/
ember, drawn packaging. Štatút: stone, serif documents. Vlna: chalk/teal/
citrus. **EcoDomček: bone paper, larch and moss, a wooden model, Instrument
Sans + Plex Mono, a dusk close.** Remove the logos and the four remain
distinct in climate, object, type and density.
