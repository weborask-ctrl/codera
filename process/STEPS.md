# CODERA — step contracts

Faithful working transcription of `source/working-document-v0.5.docx` (Steps 1–4),
extended with the step that was executed but never specified (Step 5) and the
step that comes next (Step 6).

**This file is the contract.** The `.docx` in `source/` is the archived human
input; it is not read during work. When a new document version arrives it is
archived there *and* transcribed here in the same pull request.

Every step follows the template in `CODERA_PROCESS.md` §4:
Mission → Inputs → Constraints → Deliverables → Completion gate → Validation.

Status legend: **DONE** (gate passed) · **OPEN** (specified, not started) ·
**DRAFT** (specification incomplete).

| Step | Subject | Status |
| --- | --- | --- |
| 1 | Design intelligence library | DONE |
| 2 | Approved 3D ribbon logo | DONE |
| 3 | Refokus-level spatial study | DONE — folded into the Step 1 library |
| 4 | Audit of the live build | DONE |
| 5 | The /01–/05 experience | DONE — specified retroactively |
| 6 | Content and design of the pages | OPEN — specified, two inputs owed |

---

## STEP 1 — Build the design intelligence library

**Status: DONE.** Gate passed with the limitations recorded in
`CODERA_DESIGN_INTELLIGENCE/COVERAGE_AND_SOURCES.md`.

### Mission

Not to teach one Codera aesthetic. To build a reusable, broad design-intelligence
system applicable to future client work across very different industries,
audiences, moods and commercial goals.

### Inputs

- `https://styles.refero.design` as the primary design-learning source.

### Constraints

- Cover the full breadth of styles available there, not only dark, premium,
  tech or agency aesthetics.
- Learn transferable principles; never copy specific websites, layouts,
  components or identities.
- Do not reduce "good design" to one fashionable look. Do not default to dark
  mode, huge typography, glassmorphism, gradients, 3D, minimalism or brutalism.
- At minimum these directions must be distinguished: dark/cinematic ·
  light/editorial · warm editorial · minimal Swiss · luxury/fashion ·
  architectural/industrial · corporate/institutional · healthcare/clinical ·
  playful/children · ecommerce/product-first · hospitality/sensory ·
  organic/natural · tech/SaaS · brutalist/experimental · high-colour/expressive ·
  soft pastel/friendly · image-led/art-directed · typography-led/editorial.

### Method — four passes

- **A — Broad extraction.** Catalogue-wide coverage; enumerate and inspect every
  accessible entry. Record exactly what could not be covered. Never claim
  exhaustive coverage that was not achieved.
- **B — Taxonomy and clustering.** Group into coherent archetypes; identify
  meaningful differences in tone, layout, typography, colour, spacing, imagery,
  component weight, interaction and content density.
- **C — Deep study.** Strong representatives per archetype, analysed for *why*
  they work.
- **D — Synthesis.** Convert observations into reusable rules, decision
  frameworks, anti-patterns and industry/style mappings.

### What must be learned

Typography (scale relationships, pairing, weight discipline, line length and
height, tracking, responsive sizing, when large type is *not* appropriate) ·
colour (canvas tone, contrast, semantic hierarchy, accent discipline, opacity,
saturation, warmth, emotional effect) · spacing (macro vs micro rhythm, section
density, whitespace, alignment, how spacing changes perceived quality) ·
composition (focal points, balance, asymmetry, grids, layering, object scale,
negative space, flow) · layout patterns · components (navigation, buttons, cards,
forms, metadata, filters, project presentation, commerce, trust elements, CTA) ·
imagery (crops, art direction, masks, texture, illustration, image/text
relationships) · motion (when it improves hierarchy and storytelling, when it
harms readability, pacing, restraint, stillness) · responsive behaviour
(recomposition, not shrinking) · commercial fit (audience, trust requirement,
price position, personality, sector, product type, conversion goal).

### Deliverables

`CODERA_DESIGN_INTELLIGENCE/` with `00_INDEX` · `01_DESIGN_FOUNDATIONS` ·
`02_STYLE_TAXONOMY` · `03_INDUSTRY_STYLE_MATRIX` · `04_TYPOGRAPHY_SYSTEMS` ·
`05_COLOR_SYSTEMS` · `06_LAYOUT_SYSTEMS` · `07_COMPONENT_LANGUAGE` ·
`08_MOTION_AND_SPATIAL_DESIGN` · `09_MOBILE_DESIGN` · `10_DESIGN_ANTI_PATTERNS` ·
`11_CODERA_APPLICATION` · `DESIGN_DECISION_ENGINE` · `COVERAGE_AND_SOURCES` ·
`styles/` (one record per archetype) · `data/`.
Packaged as `CODERA_DESIGN_INTELLIGENCE.zip` with the sources kept in the project.

Each style record defines: name/archetype · emotional tone · typical audience and
business fit · poor-fit contexts · canvas behaviour · colour logic · typography
logic · spacing and density · layout principles · imagery direction · component
language · motion behaviour · mobile adaptation · strengths · failure modes ·
how to combine it with other styles without losing coherence.

### The Design Decision Engine

A framework that forces the visual direction to be derived from client and
business context rather than personal preference. Before choosing a style,
evaluate: industry · audience · price positioning · brand personality · product
or service · trust requirements · emotional target · content type and volume ·
asset availability · primary conversion goal · device and interaction context ·
technical constraints.

### Permanent deep design rules — binding on every later step

1. Never default to a fashionable aesthetic. Style is derived from industry,
   audience, positioning, emotional objective, content and commercial goal.
2. Design taste means knowing what is *appropriate*, not only what looks good.
3. A design system is a coherent set of decisions about typography, scale,
   spacing, composition, hierarchy, imagery, interaction, motion, tone and
   restraint — not a collection of colours and components.
4. Motion must support composition and hierarchy, never hide weak static design.
5. A strong screen must still look intentionally composed with all animation
   paused.
6. Do not copy a reference. Extract the logic and adapt it to the new context.

### Codera-specific outcome

Apply the library to Codera without locking it into full dark. Use a deliberate
dynamic contrast system: dark graphite / black-titanium where cinematic depth
helps · light or warm-light states for relief, clarity, freshness and rhythm ·
project-specific colour where the work benefits · controlled dark/light
transitions as dramaturgy · a limited accent strategy rather than constant
monochrome darkness.

### Completion gate

- [x] Coverage broad, not biased toward Codera's current dark aesthetic
- [x] Major visual style families represented in the taxonomy
- [x] Typography, colour, layout, composition, spacing, components, imagery,
      motion, responsive behaviour and commercial fit all documented
- [x] The decision engine can distinguish e.g. a construction company from a
      children's ecommerce site
- [x] The library explains when a style is *inappropriate*
- [x] The Codera recommendation includes a deliberate dark/light rhythm
- [x] Reusable for future client projects
- [x] Source synthesised into principles, not copied
- [x] `CODERA_DESIGN_INTELLIGENCE.zip` produced, sources retained
- [x] Limitations honestly reported

---

## STEP 2 — Create the approved Codera 3D ribbon logo

**Status: DONE.** Deliverables in `CODERA_3D_LOGO_DELIVERABLES/`.

### Mission

A faithful, production-quality 3D asset of the approved Codera C ribbon mark,
suitable for realtime Three.js / React Three Fiber use.

### Inputs — mandatory

- `brand/source/` — the creation pack: `01_APPROVED_CODERA_LOGO_REFERENCE.jpg`,
  `02_CODERA_C_MARK_REFERENCE.png`, `README_CREATE_3D_LOGO.md`, `MANIFEST.txt`.
- Read `README_CREATE_3D_LOGO.md` completely before modelling.
- If the pack is missing, inaccessible, corrupted or lacks the approved
  references: **STOP and request the correct package.** Never improvise the mark
  from memory.

### Constraints

- The mark is a real folded / twisted ribbon forming a C. It is **not** a flat C
  extruded into depth.
- No previously rejected GLB/OBJ or earlier extruded-C interpretation may be
  used as a fallback.
- Preserve the approved silhouette, opening, top and bottom terminals, fold
  logic, central twist and brand recognition.
- The front orthographic render must closely match the approved 2D mark.
- The oblique render must reveal believable ribbon depth and front/back surface
  relationships.
- Optimised for realtime: clean geometry and normals, replaceable materials.
- A model that merely resembles a generic metallic C does not pass.

### Deliverables

Production GLB · source file where the environment allows it · front validation
render · 3/4 oblique validation render · technical report with geometry and
polycount, materials, file size and any compromises.

### Completion gate

Do not integrate into the live experience until: the front-view identity has been
compared against the approved reference · the 3/4 view proves real ribbon
construction · the GLB passes realtime-web suitability checks.

### Carried debt

The final side-by-side fidelity pass of the parametric reconstruction against the
approved raster is still open — tracked as a backlog item, not as a note in a
progress file.

---

## STEP 3 — Study Refokus-level spatial and interaction design

**Status: DONE, with no standalone artefact.** The findings were folded into
`CODERA_DESIGN_INTELLIGENCE/08_MOTION_AND_SPATIAL_DESIGN.md` and into the
storyboards and camera maps now archived in
`docs/archive/SPATIAL_REDESIGN_PROGRESS.md`. Recorded explicitly so the step is
not left ambiguous.

### Mission

Study high-end spatial creative development with Refokus as the execution
benchmark: spatial storytelling, camera choreography, scene continuity,
interaction hierarchy, pacing, stillness, depth, lighting, material behaviour,
and how 2D typography synchronises with 3D motion.

### Constraints

- Do not copy a Refokus project; extract adaptable principles.
- Pay special attention to impact *without* excessive scrolling.
- Study how scenes transition without feeling like stacked website sections.
- Study how motion supports rather than competes with readability.
- Study how dark and light states create rhythm and emotional contrast.

### Deliverable

Extension of the reusable library, especially its motion and spatial guidance.

### Completion gate

After Step 3, proceed only to the Step 4 audit. No layout redesign, no 01–05
content structure, no implementation.

---

## STEP 4 — Audit the current design and interaction failures

**Status: DONE.** Output: `CODERA_STEP4_AUDIT.md` — diagnosis only.

### Mission

Verify the failures below against the live build before redesigning anything.

### The nine claims to verify

1. **/02 transformation scene.** The floating old-site window is a dated
   2010–2012 trope and must not survive. Do not keep, restyle or cosmetically
   polish it — replace the concept and the transition. The redesigned site shown
   inside /02 was also too weak; a transformation scene cannot demonstrate a
   mediocre redesign. The replacement must feel native to the spatial world, not
   like a before/after widget inserted into it.
2. **/03 selected work.** The concepts do not match the quality Codera claims.
   A 9/10 studio cannot show 5/10 portfolio concepts. Each concept must be
   redesigned to Codera's own art-direction standard using the Step 1 library,
   each with its own appropriate direction — proving range across industries,
   palettes, typography, density and imagery.
3. **Mobile navigation.** Unreliable navigation is a release-blocking defect.
   Test as a real touch interface: open, close, tap outside, target activation,
   scroll lock, orientation change, focus behaviour, return to content.
4. **Text inside spatial states.** Text that is faint, clipped, cropped,
   overlapped or exits before it can be read is a fundamental design failure.
   Readability always overrides choreography. Every important text state needs
   ENTER → FULLY READABLE HOLD → EXIT. No copy hovering at low opacity for most
   of its life. No headline cut by viewport, mask, container, transform or 3D
   layer unless the crop is deliberate and still comprehensible. Every major
   state must pass the static-frame test.
5. **Scroll responsiveness.** Heavy, delayed, disconnected input is a structural
   problem, not a cosmetic one. **Do not add Lenis, Locomotive Scroll,
   ScrollSmoother or any synthetic smooth-scroll layer** to disguise it. The
   world may interpolate smoothly; input must feel immediate. Wheel, trackpad,
   touch, swipe and tap are distinct input modes and are tested separately.
   Target: input → immediate visual response → controlled cinematic motion. More
   experience per unit of scroll.
6. **Functional baseline.** All buttons, links, CTAs, nav items, controls,
   sliders and swipe targets functional. Latency, stuck states, scroll traps,
   accidental overlays, dead click areas and non-responsive controls are release
   blockers. Mobile logic must not depend on hover.
7. **Tone and colour.** Uniform darkness reads as gloomy and monotone. Premium is
   not permanent black. Introduce deliberate lightness — warm white, mineral
   light, pale silver, project colour — and use dark/light contrast as
   dramaturgy.
8. **QA and release integrity.** The project was once declared finished while
   remote CI was red; that is a process failure. Local screenshots and local
   Playwright results never equal release readiness. Real iPhone Safari
   behaviour must not be inferred from emulation. Completion claims must
   distinguish LOCAL / CI / PREVIEW / DEVICE validation.
9. **Length and section-like structure.** Too much scrolling for too little
   progression; the experience still reads as sections joined by effects rather
   than one authored journey. Increase visual and narrative change per unit of
   scroll.

### Deliverable

A concise audit grouped KEEP / REBUILD / REMOVE / VERIFY, each finding marked
CONFIRMED / PARTLY CONFIRMED / NOT CONFIRMED, naming the implementation
responsible.

### Completion gate

STOP after documenting. No redesign of the 01–05 layout, no implementation. An
issue is not fixed because a local screenshot looks acceptable.

---

## STEP 5 — The /01–/05 experience

**Status: DONE. Specification written retroactively on 2026-08-31.**

This step was executed without a written contract — the working document stops at
Step 4. The specification below is reconstructed from what was actually produced,
so that the record is complete and Step 6 has a template to follow. It is
recorded as a process defect, not as a precedent: see `CODERA_PROCESS.md` §4.

### Mission

Turn the audit into one authored spatial journey across five acts —
/01 Identita · /02 Premena · /03 Práca · /04 Ponuka · /05 Kontakt — that proves
Codera's own standard.

### Inputs

`CODERA_STEP4_AUDIT.md` · the Step 1 library and its decision engine · the
Step 2 GLB.

### Phases as executed

| Phase | Output |
| --- | --- |
| A | `CODERA_STEP5_DESIGN_BRIEF.md` — decision-engine intake, the twelve inputs |
| B | Composition boards (`app/boards/page.tsx`), 7 states × 3 devices |
| C–E | `CODERA_STEP5_ARCHITECTURE.md` — board validation, transition map, device interaction map |
| F–G | Experience prototype |
| H–N | Implementation on the homepage |
| — | `CODERA_ART_DIRECTION_V2.md` — "Zlievareň", the reference-driven visual pass |

### Constraints

All Step 1 permanent rules, plus: one motion engine (GSAP + ScrollTrigger, no
second framework, no scroll hijacking) · monochrome chrome, colour only in the
work · previews stay live markup, never screenshots · nothing about the business
is invented — no testimonials, clients, metrics, awards or registration data,
and concepts stay labelled `Koncept` · reduced motion is a layout, not a
fallback.

### Completion gate

Preview gate passed · remote CI green · production serving `www.codera.sk` ·
real-device validation explicitly **not** claimed.

---

## STEP 6 — Content and design of the pages

**Status: OPEN.** Specified 2026-08-31. Two inputs still owed by Ondrej (§9)
before implementation may begin.

### 1. Mission

Make the site sell. Step 5 proved Codera can build; Step 6 must make a Slovak
SMB owner understand within one screen what they get, believe it, and start an
enquiry — without inventing a single fact about the business.

### 2. Inputs

`CODERA_STEP5_DESIGN_BRIEF.md` (the intake and the tonal script stand — this
step changes *what is said*, not the art direction) · `CODERA_STEP5_ARCHITECTURE.md`
(the transition and device maps) · `CODERA_ART_DIRECTION_V2.md` ·
`CODERA_DESIGN_INTELLIGENCE/03_INDUSTRY_STYLE_MATRIX.md` and
`DESIGN_DECISION_ENGINE.md` (one engine run per concept world) ·
`lib/site-config.ts` (the only source of business facts).

### 3. Decisions taken 2026-08-31

| Question | Decision |
| --- | --- |
| Site structure | One page **plus case-study pages** — the five-act journey stays a single URL; each concept gains its own route |
| Portfolio concepts | **New industries.** The current three (construction GC, private clinic, interior studio) are replaced |
| Offer presentation | **Three packages with prices**, anchored on the existing "od 699 €" |
| Trust material | **Nothing new** — no legal entity, no completed client work, no testimonials. Trust must be carried by craft, transparency and process alone |

The last one is the hard constraint of this step: every trust device must be
true today. No client logos, no "50+ projektov", no invented years of
experience, no stock portraits.

### 4. Constraints

Standing and binding, not to be re-litigated: Step 1 "Permanent deep design
rules" · Step 4 §4 readability (ENTER → HOLD → EXIT, static-frame test) · §5 no
synthetic smooth-scroll layer · §7 dark/light dramaturgy · all Step 5
constraints (one motion engine, monochrome chrome, live-markup previews, nothing
invented, reduced motion as layout).

New to this step:

- **Length budget holds.** Desktop ≤ ~8 viewports, mobile ≤ ~6.5. New content
  displaces old content; it does not extend the page.
- **Case-study pages are documents, not journeys.** No pinned scenes, no
  canvas. They are read, printed and linked. The spatial experience lives on
  the home page only.
- **Every concept keeps its own climate**, bounded to its own world, per the
  Step 5 accent economy. The shell stays achromatic.
- **Previews stay live markup.** The new worlds are built the way the current
  ones are — container-query sized components, no image bytes for the UI
  itself.
- **Honest labelling survives.** Concepts stay labelled `Koncept` on the home
  page, in the case study, in the metadata and in the OG image.

### 5. The concept worlds — proposed

The three replacements are chosen so that each proves a different **commercial
mechanic**, not merely a different palette. Range in mechanics is what an SMB
buyer actually reads; range in colour is what a peer reads. This set does both.

| # | Sector | Direction (matrix row) | Mechanic proven | Primary conversion |
| --- | --- | --- | --- | --- |
| 01 | Coffee roastery with a shop | warm-editorial + retro-craft, ecommerce discipline | Product grid, variants, cart, packaging art direction | Buy |
| 02 | Law or accounting practice | corporate-institutional + heritage editorial serif | Density, document-heavy IA, restraint, trust-first hierarchy | Enquire |
| 03 | Fitness or wellness studio | high-colour-expressive + soft-pastel pole | Schedule, membership tiers, mobile-first booking | Book |

Why this set: it is maximally distant from the studio's own achromatic
editorial shell and from each other (warm craft · institutional restraint ·
expressive energy); none of the three needs photography that does not exist —
packaging, documents and schedules are drawable as type, vector and colour;
and all three are real Slovak SMB segments that pay for a website.

Each world requires its own DESIGN_DECISION_ENGINE run recorded in its case
study. A world that reads as "Codera in another colour" fails the step.

**Names are content work**, decided during phase A. The existing names
(Konštrukt, Vitalis, Forma) retire with their sectors.

### 6. Phases

| Phase | Output |
| --- | --- |
| **A — Narrative and copy** | The five acts rewritten: what each says, its single job, its length budget. Slovak voice, headline grammar, longest-form Slovak strings tested. One beat per viewport. |
| **B — Offer** | The three packages: names, scope lines, from-prices, what is explicitly *not* included. Plus the honest-trust inventory: what may be claimed today and how it is worded. |
| **C — Concept worlds** | One engine run per sector, then the three worlds built as live markup, replacing the current three. |
| **D — Case-study pages** | Route, layout and content model for `/praca/<slug>`; one page per concept. |
| **E — Imagery** | Selection and `SOURCES.md` with a licence line per file — CC0 or purchased only. Closes issue #7. |
| **F — Implementation** | Home page acts and the new route, behind the standing constraints. |
| **G — Validation** | Boards reviewed, static-frame test per state, device checklist, CI and preview. |

Phases A and B are design-session work and produce documents. C onward is
implementation and needs its own pull requests.

### 7. Deliverables

- `CODERA_STEP6_CONTENT.md` — the narrative, the copy deck, the offer, the
  trust inventory (phases A–B)
- Three engine runs, one per concept world, inside their case studies
- Three rebuilt preview components under `components/site/previews/`
- `app/praca/[slug]/page.tsx` and its content model
- `SOURCES.md`
- `lib/site-config.ts` extended with the package structure — real values only
- Updated `STATE.md`

### 8. Completion gate

- [ ] Every claim on the page is true today; nothing is invented
- [ ] Each of the three worlds passes its own engine run and reads as its own
      studio's work, not as Codera recoloured
- [ ] Each world proves a different commercial mechanic (buy / enquire / book)
- [ ] Every text state passes the static-frame test at its reading moment
- [ ] Length budget respected: desktop ≤ ~8 viewports, mobile ≤ ~6.5
- [ ] Case-study pages readable with no canvas, no pins, and with scripting off
- [ ] Prices consistent between `lib/site-config.ts`, the offer act and the
      case studies — one source, no drift
- [ ] `SOURCES.md` accounts for every image file
- [ ] Concepts labelled `Koncept` everywhere they appear, metadata included
- [ ] Mobile navigation and the enquiry path retested end to end

### 9. Validation classes

LOCAL + CI + PREVIEW required. **DEVICE required** — this step changes the
conversion path, and issue #2 must be closed against the finished page, not
against the current one.

### 10. Inputs still owed by Ondrej

Implementation of phase B is blocked until these exist. Nothing else is
blocked; phases A, C and D can start immediately.

1. **The three package prices and scopes.** The structure is proposed; the
   numbers are a commercial decision and may not be invented. Anchor: the
   existing `od 699 €` must remain the entry point of the cheapest package.
2. **Confirmation of the three sectors** in §5, or a substitution. If one is
   replaced, its mechanic must be replaced too — the set must still prove buy,
   enquire and book.
