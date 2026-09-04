# EcoDomček — redesign strategy and plan

Client: EcoDomček, s.r.o. (`https://ecodomcek.sk`) · Lúčina, okr. Prešov ·
timber-frame houses, roofs, terraces, interiors.
Prepared 2026-09-03 for Codera. Status: **DRAFT — awaits Ondrej's calibration
of the new reference records and the client's answers in §11.**

Inputs: `CONTENT_INVENTORY.md` (every page of the live site, verbatim copy,
assets, facts) · `CODERA_DESIGN_INTELLIGENCE/` (engine, matrix, 04–10, the
organic-natural / industrial-architectural / warm-editorial / image-led /
corporate records) · `CODERA_DESIGN_REFERENCES/records/` (LIKED records +
eight new PENDING records harvested for this brief, listed in §6) · the
client's Matterport reference `my.matterport.com/show/?m=FywajUbFfCk`
("RIVERTON 4831", a Los Angeles new-build listing: living room, kitchen,
bedrooms, bathrooms, garage, dollhouse view — inspected through its public
player metadata and rendered snapshots, see §4.1).

The client's ask, in their words: *the whole site is a 5D design of a house;
on load you see a finished EcoDomček house; scrolling walks you through the
rooms; each room is a sub-page carrying the information that is on the site
today; the movement should feel like the Matterport tour.*

---

## 1. What the current site is (diagnosis, not opinion)

- A 2015 ThemeForest "Constructy" template, lightly localised. Theme residue
  everywhere: English demo page still in the nav, "Luxury House in Bali" alt
  texts, Los Angeles map marker, `lang="en-US"`, identical `<title>` on all
  pages, no meta descriptions, no sitemap, no GDPR page, form posts to `#`.
- The page background is a **stock blueprint-and-crane render**; the quote
  banner is a **stock grid of hard-hat workers**. Neither is EcoDomček.
- The genuinely valuable assets are three: (1) **Roman's voice** — informal,
  funny, first person, a real thesis ("čo je ekologické, je aj ekonomické"),
  a goat testimonial; (2) **real builds with real facts** — 8 projects with
  dates, locations and materials (Rhombus larch + Fundermax, raw Cetris,
  Siberian larch + Lexan, thermo-ash, wood-fibre insulation, hemp, sheep
  wool, boric salt); (3) **real job-site photography** — phone snapshots,
  unstyled, honest. There is no commissioned photography and no finished
  interior series.
- Trust surfaces exist but are scattered: IČO 50619616, register entry,
  D&B "A" 2024 badge, DAIBAU feature, owner's own house lived in since 2008.

Consequence for the design engine (R3): with no commissioned imagery the
image-led and hospitality grammars are **off the table**. That is exactly why
the client's 5D idea is the right one — the modelled house becomes the
commissioned-grade imagery the site does not have, and the phone photos stay
what they are: documentary evidence inside it.

---

## 2. Design DNA

| Field | Value |
| --- | --- |
| Industry | B2C residential construction — prefabricated timber-frame houses (montované drevodomy), diffusion-open envelopes; plus roofs, terraces, gazebos, cladding, interiors, insulation |
| Audience | Families in the Prešov/Košice regions (and cross-border HU) about to make the largest purchase of their lives; 30–50; design-literate enough to want "moderný", conservative enough to distrust timber ("my, konzervatívni Slováci, jej veľmi nedôverujeme"). First contact on a phone, deep research on desktop. Secondary audience: tradespeople (the site recruits) |
| Business model | One turnkey build at a time ("Neberieme viac stavieb naraz"); owner-led crew; free consultation as the funnel entry |
| Primary conversion | **Enquire** — call 0908 704 281, e-mail, or the form; the promise is a free consultation |
| Secondary goals | Prove competence (projects, materials); prove honesty (values, register data); recruit |
| Price positioning | Market / mid. The thesis is that eco is *cheaper* over time. Luxury grammar would read as fraud; discount grammar as risk |
| Trust requirement | **High.** Sets the ceiling on expressiveness: every fact visible, nothing invented, the 3D must never pretend to be a photograph |
| Brand personality (claimed) | ekologický · férový/slušný · dobrá partia (human, funny) |
| Brand personality (projected today) | generic, dated, borrowed |
| Emotional target | First viewport: *"toto je dom, aký by som chcel"* — warmth and desire. At conversion: *"títo ľudia sú poctiví a vedia, čo robia"* — confidence |
| Content | ~12 services, 8 projects (3 houses, 4 terraces/carports, 1 own house), founder narrative, materials, 5 testimonials, blog tiles, contact/legal. Medium volume, thin per room → rooms must merge content, not spread it |
| Assets | Logo (brown/olive roof chevron); phone photos of builds; no plans, no m², no finished-interior series, no portraits. **We must produce the house model** |
| Visual intensity | Medium-high in the world, low in the chrome |
| Interaction intensity | Medium: scroll-driven, one authored path, no free roam |
| Motion | Storytelling tier (08 §1) — justified: the camera explains the product |
| Device priority | Mobile for first contact and the call; desktop for the full walk. Mobile is re-directed (09 §1), not shrunk |
| Technical | Codera stack (Next 16, R3F, GSAP + ScrollTrigger, native scroll, no pins). Small client: no CMS in v1, content in typed config. Mid-range Android budget |
| Accessibility / performance | DOM is the floor; reduced motion is a layout; LCP < 2.5 s on throttled mobile; AA everywhere |

---

## 3. Decision-engine run

**R1** trust high → shortlist {corporate, warm-editorial, minimal-swiss}; expressive
families only as bounded devices. **R3** no commissioned imagery → image-led and
hospitality off; redirect to a type-led canvas with the model as the one imagery
grammar. **R8** content-medium/thin per room → forbid minimalism-as-emptiness;
structure little content richly (annotation, spec rows, statement type).
**R10** matrix row *Construction / building*: default industrial-architectural +
corporate trust layer; differentiator **warm-editorial storytelling of craft**;
avoid playful, pastel, dark-cinematic gloom. The organic-natural record fits
(eco-building is in its list) and its greenwash warning does not apply — the
materials are real and named.

**Derived direction: warm-editorial canvas (the paper the house stands on),
with ONE bounded industrial-architectural subsystem — technical annotation
(mono labels, dimension lines, the wall section drawing).** Organic-natural
supplies the palette logic (earth, wood, moss, one warm needle); corporate
supplies the trust components (register data, form-as-trust-component).
Cinema is light: two of three Refokus benchmark productions and the two most
relevant LIKED records (Igloo, Lusion) run pale worlds (08 §12). The single
dark act is the dusk at the end.

The four probes:

- **Swap probe.** A scroll-through-a-house could be sold to any drevodom
  company. What makes it EcoDomček's: the house is *their* Lúčina build
  (larch Rhombus + anthracite Fundermax), the wall section lists *their*
  materials, the photos are *their* job sites, the copy is Roman's. The
  signature constraint (below) is the guard.
- **Opposite probe.** A sober industrial-corporate site would carry the trust
  and cost a third. It would not answer the distrust of timber, which is the
  actual sales problem — the walk through a diffusion-open wall does. Keep the
  derivation; keep the corporate trust layer inside it.
- **Pause probe.** Motion off: a wooden architectural model of a house on
  warm paper, mono annotations at plan positions, one light-weight headline,
  one green button. Compelling as a still. Pass.
- **Grandmother / CFO probe.** Phone number and IČO reachable from every
  room; nothing on the page is invented; the model is visibly a model.

### The one-page brief

```
CLIENT:            EcoDomček, s.r.o.
PRIMARY FAMILY:    warm-editorial (canvas, type, rhythm)
SECONDARY DEVICE:  industrial-architectural annotation — mono labels,
                   dimension lines, the wall-section drawing. Nothing else
                   from that family (no black gallery, no building-scale
                   condensed type).
SIGNATURE          "Only two kinds of image exist: the model and our own
CONSTRAINT:        job-site photographs." No stock, ever. No render that
                   pretends to be a photograph — the house is visibly a
                   crafted wooden model.
CANVAS:            warm bone paper (#F3EDE2 class) is the world's ground
                   and sky; the house's own materials carry the chroma
                   (larch, anthracite, moss). Light owns ~85 % of the
                   journey; ONE dark act — dusk at /kontakt, windows lit —
                   motivated by the story (the day of the walk ends;
                   the house becomes a home).
TYPE STRATEGY:     display voice + quiet workhorse + mono metadata.
                   Display at weight 300–400, never bold (Raus, Scale,
                   Exo Ape); body 16–18 px / 1.5; mono only for
                   annotations and data (Igloo, 70Materia). One serif
                   moment for human voices only: Roman's story and the
                   testimonials (Refokus two-voice). Candidates, all to be
                   checked for ď ľ ť ž ô before commitment: display
                   Instrument Sans or Manrope 300; mono IBM Plex Mono;
                   serif moment Instrument Serif. Not Geist — that is
                   Codera's own voice.
ACCENT ECONOMY:    action colour = the logo's olive, refined to moss
                   (#5F7A2B class) — every CTA, link, focus, and the
                   active room chip; nowhere else. Supporting accents
                   with jobs: larch (#C9A063 class) = material only, never
                   UI; anthracite (#2E2F31) = material and the dark act's
                   ink; window-light amber (#F2C46D) = the dusk act only.
                   Warm ink #2B2520 for all text; #000 forbidden.
RADIUS DIALECT:    {0, 6, 999}. Images and panels 0 (planks, not pebbles);
                   buttons and inputs 6; the floor-plan room chips 999.
IMAGERY LANGUAGE:  (1) the house model — one material story: oiled larch,
                   anthracite panels, pale spruce interiors, glass;
                   (2) job-site photographs, edge-to-edge, 1 px ink
                   hairline, captioned in mono like plates (MANNA,
                   Aspelin Reitan). Never mixed in one frame.
MOTION TIER:       storytelling. Scroll drives the camera along one
                   authored path; each room is a held shot; feedback
                   instant; ambience only outdoors (leaves, a slow cloud)
                   and paused off-viewport.
MOBILE DIRECTION:  re-directed: a vertical deck of room stills with the
                   same copy, floor-plan chips as the nav, tap-to-call in
                   the thumb zone. No camera scrub on touch.
FORBIDDEN:         the stock blueprint/crane and hard-hat imagery; a dark
                   whole-page theme; glass cards, gradient blobs, bento
                   grids; photoreal renders sold as photos; Lenis-class
                   smoothing; 300 vh pins; hover-only information; luxury
                   austerity (price mismatch); gold.
```

---

## 4. The concept: „Prejdite si dom, ktorý by sme vám postavili"

The test in 08 §10 — *name what the camera movement explains* — has a clean
answer here: **the house is the product, and walking through it explains, room
by room, what EcoDomček builds and how.** Every room hosts the content that
naturally lives there, so the existing site's pages become rooms instead of
menu items.

### 4.1 What we take from Matterport, and what we refuse

The reference is a photogrammetry tour of a Los Angeles new-build townhome
(48 scan points, `fast_transitions` on, dollhouse and floor plan enabled, a
16-stop highlight reel, autoplay off). Verified from the model's public player
metadata and its rendered snapshots; the live WebGL viewer itself could not be
driven from this session (`NOT VALIDATED — reason:` the egress proxy resets the
browser's TLS handshake), so the transition timings below are Matterport's
standard behaviour, not measurements of this model. Visually the house is a
white developer spec — no timber, no natural materials — so under the studio's
rule it is an **interaction reference only**, never a look reference.

Its mechanics, translated:

| Matterport mechanic | On ecodomcek.sk |
| --- | --- |
| Click a floor ring → the camera **dollies through the mesh** to the next scan point while panoramas crossfade (≈0.7 s eased with fast transitions); walls slide past with true parallax — this is the signature feel | **Take the dolly, refuse the easing.** Scroll = dolly along an authored spline between held shots; the shots are composed, the dolly is the transition, not the content (08 §5). The eased click-move cannot be reproduced on scroll without a smoothing layer, which is banned — the camera scrubs directly and any settle lives in the world's ≤ 120 ms damping |
| Highlight reel + guided tour (16 fixed poses visited in order, a slow pan at each) | **Take as the narrative spine.** The reel is already ENTER → HOLD → EXIT; each highlight is a room with copy in its hold |
| Drag to look around freely | **Refuse.** Free look destroys composed shots and readable text. Replace with ≤ 3° pointer parallax on desktop, lerped, no layout effect |
| Dollhouse view (the whole house as a cut-open model) | **Take, as an act.** It becomes /realizacie — the camera pulls out, the roof lifts, and the model turns into the index of real projects |
| Floor-plan view | **Take twice.** (1) As navigation: a small plan in the corner is the site's minimap — rooms are chips; a tap scrolls (native `scrollTo`) to that room's zone. It is the visible answer to "how do I get to Kontakt". (2) As the **reduced-motion layout**: an orthographic plan with the current room marked, same rooms, same copy, no flight — a designed layout, not a fallback |
| Dollhouse on a black void | **Refuse the void.** The pull-out keeps garden, terrain and sky; black reads as a tool |
| Mattertags (hotspots with info) | **Take, in DOM.** Each room's content is DOM text over the world; deep content (a project, the job ad) opens as a document page |
| Photogrammetry realism, textured meshes | **Refuse.** Runtime photoreal interiors are the battle Cula lost (08 §9). The house is a **crafted wooden architectural model** — oiled larch, anthracite, pale spruce, honest and lighter to render |
| Loading screen and "play" gate | **Refuse.** CTA and scroll live from the first frame (Codera T0 rule); the finished house is the first paint (a still), the world hydrates behind it |
| Tool chrome (mode buttons, measure, VR, share) | **Refuse.** None of it belongs on a marketing page |
| Sound | Refuse |

### 4.2 The route: rooms → sub-pages

One persistent world, one camera path, one sunrise-to-dusk light arc (the
Igloo principle: acts are camera positions and light changes, nothing else).
Each room is a URL segment so that the "sub-pages" the client asked for exist
as real routes, share the world, and can be linked directly — the same model
as Codera's /01–/05. Documents (a project, a blog post, legal) live outside
the world and are readable without JS.

| # | Room / camera | Route | Carries (from the inventory) | Beat |
| --- | --- | --- | --- | --- |
| 0 | **Príjazd** — the finished house from the garden, morning light | `/` | Headline, one promise, the primary CTA (Bezplatná konzultácia), a benefit band at the fold bottom (Cowboy grammar): *ekologické · ekonomické · na kľúč · od 2007* | 100 svh. The model house (§5.3): the Matterport layout re-skinned in larch Rhombus + Fundermax anthracite, labelled `Vzorový dom` |
| 1 | **Terasa** — camera lands on the deck, roof overhang above | `/terasa` | Terasy, altánky, prestrešenia. Rákoš (larch + Lexan), Chrastné (glass roof), Dúbrava (thermo-ash) as plates | 100 svh |
| 2 | **Vstup** — the door opens; the hall | `/o-nas` | Kto sme: Roman's story (serif moment), the motto, the four values (100 % VY / 100 % MY, slušnosť, poriadok), D&B badge, DAIBAU | 100–150 svh |
| 3 | **Obývačka** — the main room, the big window | `/drevodomy` | Drevodomy na kľúč: the offer — climate comfort, build speed (Beniakovce: exactly one year), from foundations to kolaudácia; the three house projects as plates | 100 svh |
| 4 | **Stena — röntgen** — the camera stops at the wall; it opens | `/technologia` | "Tech": the diffusion-open wall exploded into layers with mono labels — drevovláknitá izolácia, konope, ovčia vlna, minerálna vlna bez formaldehydov, boritá soľ, veľkoplošné dosky. The one place density is welcome | **sticky 200 svh, three states:** wall closed → layers fanned out → labelled. The signature beat |
| 5 | **Poschodie** — up the stairs, the gallery | `/interiery` | Interiéry, sadrokartón, obklady (tatranský, rhombus, thermo), maľovanie, renovácie. The line about the swing from the first floor stays | 100 svh |
| 6 | **Strecha** — camera rises through the roof space to the ridge | `/strechy` | Strechy (sedlová, valbová, pultová; krytiny incl. zelená), zatepľovanie — as a quiet spec table | 100 svh |
| 7 | **Dollhouse** — pull-out; the roof lifts; the house becomes a model on the table | `/realizacie` | All 8 projects as a full-bleed plate grid (Nathan Riley / MANNA rows): title, place, year, materials; each opens `/realizacie/<slug>` | 150 svh |
| 8 | **Súmrak** — back in the garden; the light has gone; the windows are lit | `/kontakt` | „Postavíme Vám domček … Domov si už z neho spravíte sami." Contact panel on paper over the dusk world: phone (tel:), e-mail, the form with "what happens next"; IČO, DPH, register, address as the last, quiet band | 100 svh + footer |

Documents outside the world: `/realizacie/<slug>` (8), `/blog/<slug>` (the
job ad and the boric-salt piece are worth keeping; the rest are tiles without
articles today), `/ochrana-osobnych-udajov`. The "Hľadáme pracantov" ad gets
a link from the footer and from /o-nas — recruiting is a stated goal.

Scroll budget ≈ 11–12 viewports. Every viewport delivers a new room, a new
light or a new information class (06 §9). No dead scroll: the Tech pin is the
only region that borrows more than a viewport and it repays with three states.

### 4.3 Text choreography

The Codera rule, unchanged: every room's copy fires ENTER once (IO), holds
at full opacity for the room's hold zone, exits after it. No scroll-scrubbed
opacity on text. Display type at light weight floats over the world (Exo
Ape) and stays selectable DOM (08 §13). Annotations (mono) are DOM too,
positioned from projected 3D anchors — the Igloo measurement-line texture,
kept to the Tech act and the dollhouse.

### 4.4 Colour dramaturgy in-world

Morning (Príjazd → Terasa) → interior daylight (Vstup → Strecha; the paper
ground becomes the interior's pale spruce) → table light (Dollhouse; the
model on bone paper, hard raking light so the maquette reads as an object —
Lusion's stage grammar without the dark box) → dusk (Kontakt; slate-blue
sky, amber windows). Tones only move forward; nothing returns to a previous
light. Light-to-dark lands as immersion at the exact moment we want the
emotional close; the contact panel itself stays paper so the facts and the
form sit on light (05 §5).

---

## 5. Engine and rendering

### 5.1 Scroll model

Reuse Codera's `components/experience/stage.ts` model: one mutable stage
updated from **native scroll**, zone progress as pure functions of scrollY
against measured `data-zone` elements, sticky regions instead of pins,
world-side critically-damped smoothing ≤ 120 ms on camera and tone only.
GSAP + ScrollTrigger is the only motion engine; R3F renders and does not
animate on its own clock. End/Home/scrollbar/anchors always work. This is
the architecture the audit and Step 5 already validated; it is not
re-derived here.

Camera: a Catmull-Rom spline through 9 authored poses (one per room, plus
the pull-out). Scroll progress → parametric position on the spline; each
room's hold zone maps to a plateau on the curve so the shot is *held*, not
merely passed. Floor-plan chips call `scrollTo` with GSAP's scroll plugin
(≤ 900 ms, native scroll underneath, never a trap).

### 5.2 Rendering tiers (the decision, and why)

Three ways to put the house on the page were weighed against 08 §8–9:

| Option | For | Against |
| --- | --- | --- |
| A. Real-time photoreal GLB | Full interactivity | Interior realism at 60 fps on mid-range hardware is the fight Cula abandoned; heavy textures; the uncanny "stock render" look breaks the signature constraint |
| B. Pre-rendered scroll-scrubbed frame sequence (Arqitel recipe) | Deterministic quality, trivial mobile fallback, perfect input fidelity | No pointer response, no branching (the floor-plan jump becomes a seek, acceptable), 40–80 MB of frames for a full walk, every content change is a re-render |
| **C. Real-time stylised model (chosen)** | A *wooden architectural model* is honest (a model, not a fake photo), brand-true (wood is the material), light (flat-ish materials, baked AO/lightmaps, ~100–150 k triangles, KTX2 textures ≤ 6 MB, GLB ≤ 4 MB), interactive where it matters (the wall opening, the roof lift, pointer parallax, windows lighting up) | Needs disciplined art direction so "stylised" reads as crafted, not cheap; still needs a capability tier for weak devices |

Tiering (08 §6): **full world** (desktop and capable tablets with WebGL2)
→ **stills tier** (per-room renders captured from the same scene at build
time, the way Codera captures its world textures; used on mobile, no-WebGL,
`prefers-reduced-motion`, and as the SSR first paint everywhere) → **document
tier** (no JS: the same DOM content, readable). The stills tier is a designed
layout, not a fallback: the mobile edit is a vertical deck of these stills
with the room copy, and it must pass the static-frame test on its own.

### 5.3 Content production (the part that is not code)

**Decision (Ondrej, 2026-09-03): the model is built from the Matterport
house** (`RIVERTON 4831`, §4.1). Assumption under which this is done, to be
confirmed by the client: the Matterport house supplies the **spatial
skeleton only** — footprint, three levels (street-level garage with the
internal stair, living/dining/kitchen level, bedroom level), room sequence
and proportions, reconstructed from the 16 snapshots and the dollhouse
render (no plans exist for it; dimensions are estimated from the scans, so
the model is a proportional study, not a survey). Everything visible is
**re-skinned as an EcoDomček build**: larch Rhombus facade with Fundermax
anthracite panels, spruce interiors, timber-frame details at openings, a
larch deck added on the garden side (the LA house has none; EcoDomček builds
terraces), the diffusion-open wall build-up for the X-ray act. The white
drywall spec, the LA staging and the epoxy garage are not carried over.

Because EcoDomček did not build this house, it is presented as **`Vzorový
dom`** — a concept of what they would build — and never as a realised
project; the eight real projects stay in `/realizacie` with their own
photographs. If the client wants a real build modelled instead, the
skeleton swaps for the Lúčina plans and nothing else in this plan changes.

The house model is content, produced offline (Blender): geometry as above,
materials from the real spec (larch Rhombus, Fundermax anthracite,
spruce, glass), lighting baked per act (morning, interior, table, dusk),
the wall-section as a separate, exploded asset with real layer thicknesses
from the client (§11 q. 2).
Exported GLB + KTX2; per-room stills rendered at 2× for the tiers; the
dollhouse pose rendered once for the /realizacie ground. This is the
biggest single line of effort in the project and it sits **above** the 5D
package baseline in `lib/site-config.ts` — scope and price it explicitly.

---

## 6. Reference map (traceability per scene)

Ondrej's LIKED records from `CODERA_DESIGN_REFERENCES/records/` are the
calibrated bar. The eight records below marked **PENDING** were harvested for
this brief from styles.refero.design (their DESIGN.md text was read in full,
not the index line) and need his verdict before the art direction is written;
they are candidates, not references (README rule).

| Scene | Records | Idea extracted | Adapted how | Why it fits |
| --- | --- | --- | --- | --- |
| World model, all acts | `igloo` (LIKED) · `refokus` (LIKED) + 08 §8–13 (Arqitel/Cula) | One environment; acts = camera + light only; mono annotations as the precision layer; fixed canvas under native-scrolling 100 vh DOM beats; bake expensive scenery | Igloo's frost becomes bone paper and wood; annotations restricted to Tech and dollhouse; no sound, no crypto tone | Coherence answer for a 9-room journey; native input fidelity by construction |
| /príjazd hero | `cowboy` (LIKED) · `exoape` (LIKED) · `lightship` (PENDING) | Full-bleed subject + one big headline + immediate CTA + benefit band at the fold bottom; light-weight display floating over the world; headline split to opposite viewport edges for tension | Video → the model; benefit band carries the four real claims; dusk warmth reserved for the last act | Commercial clarity in the first viewport (06 §3) without a dark hero |
| Rooms as sections | `70materia` (PENDING) · `aspelin-reitan` (PENDING) · `co-projects` (PENDING) | "The UI is the mount, never the artwork"; one line of type over a full-bleed subject; gallery-room rhythm with hairline rules and one statement per room | The subject is the model, not a photo; hairlines and 1 px plate borders; 100–120 px gaps compressed to 56–64 on mobile | Image-first pacing for a site whose image is the house |
| Job-site photographs | `manna` (PENDING) · `aspelin-reitan` (PENDING) · `ashton-bespoke` (PENDING) | Photographs as plates: 1 px ink hairline, mono caption 10 px below, contact-sheet rows of 2–3; documentary craftsman mood, not catalogue | Phone photos are honest by nature; the plate treatment makes their roughness read as documentation | Solves "no commissioned photography" without hiding the real work |
| /technologia wall X-ray | `planpoint` (PENDING) · `moving-parts` (PENDING) · `igloo` (LIKED) · `lusion` (LIKED) | Blueprint-on-paper register: one ink, one signal colour; measurement lines and coordinates over the object; a 3D exhibit set INTO calm chrome | Layers with real thicknesses; labels in Slovak material names; the exhibit sits on paper, not in a dark box | The act that answers the distrust of timber with evidence |
| /o-nas voice | `refokus` (LIKED) · `raus` (PENDING) | Two voices: grotesque structure + serif for human moments; whisper-weight 300 display, "the category is the headline" meta labels | Serif only for Roman's story and testimonials; meta labels (`HODNOTY 01`) in mono | Keeps Roman's voice as a design element instead of flattening it |
| /realizacie dollhouse | `nathan-riley` (PENDING) · `manna` (PENDING) · `basement` (LIKED) · Matterport dollhouse | Full-bleed grid of real work as the page; density of REAL content as credibility; the house as an object on a table | 8 projects, every cell verifiable (place, year, materials); the model under raking light; no logo wall | Real density is the only density this client has — use all of it |
| /kontakt dusk | `exoape` (LIKED) · `belarosa-chalet` (PENDING) · `scale` (PENDING) | Dusk warmth over a photographic world; one dark band with a parchment panel; dark → light rhythm | The house lit from inside; the panel carries phone, mail, form, "what happens next"; register data as the closing band | Emotional close + facts on light |
| Colour system | `felt` (PENDING) · `raus` (PENDING) · `organic-natural` archetype | Earth palette with ONE warm needle; elevation by surface stepping, no shadows; green used rarely so it counts | The needle is the logo's olive, refined; larch and anthracite are materials, not UI | Real eco brand: the grammar is earned |
| Mobile | 09 §1 · `raus` (PENDING) · `cowboy` (LIKED) | Spatial/cinematic pins do not translate — a swipe-native re-direction; stills as content objects; sticky primary action | Room stills deck, floor-plan chips, tap-to-call | The phone is where the call happens |

Anti-taste to keep in view: `activetheory` (LIKED) shows the ceiling of
"instrument" restraint — its commercial illegibility is the failure mode a
construction client cannot afford; `zentry` (LIKED) shows object-and-type
energy that is right for Codera's own demo and wrong for a trust-first
family purchase.

---

## 7. Range check

Would this look related to Codera's site or to the concept worlds after the
logos are removed? Codera: graphite-to-frost monochrome, titanium ribbon,
Geist. Meridián: bone/umber/ember, serif, drawn packaging. Štatút: stone,
serif, documents. Vlna: chalk/teal/citrus, wide grotesque. **EcoDomček:**
bone paper, larch and moss, a wooden model, light grotesque + mono
annotation, dusk close. Distinct in climate, type voice, object and density.
The one shared ancestor is the scroll engine, which is the studio's
craft, not its look.

---

## 8. Plan

Gates follow `process/CODERA_PROCESS.md`; validation classes as in CLAUDE.md.
The build lives in its own repository from `codera-starter` (process §8) —
this repo only holds the brief, the inventory and the reference records.

| Phase | Work | Deliverable | Gate |
| --- | --- | --- | --- |
| **0 · Brief** | This document; answers to §11; collect plans, original photos, a portrait of Roman and the crew, all facts confirmed (register data, D&B, DAIBAU link) | Signed-off brief + asset drop | Client sign-off |
| **1 · Calibration** | Ondrej marks the eight PENDING records; harvest shots for the LIKED ones (`scripts/harvest-references.mjs` — the headless browser is blocked by the session proxy today, so run locally); fill "what we take / refuse" | Records with verdicts | ≥ 5 LIKED among the new set, or a second harvest |
| **2 · Art direction + boards** — *draft 1 done 2026-09-03; **draft 2 done 2026-09-04**: the three.js maquette was rejected as unrealistic and replaced by photoreal Blender Cycles plates (`cycles/`), composited under the same DOM layer. On Ondrej's instruction ahead of phase 1; gate open* | `ART_DIRECTION.md` citing record IDs; static boards: desktop Príjazd / Obývačka / Tech X-ray / Dollhouse / Kontakt; mobile Príjazd / a room / Kontakt; type candidates tested with the longest Slovak strings and diacritics | Boards + AD doc | Static-frame test; side-by-side with the references; Ondrej's pass |
| **3 · Model production** — *the Blender scene exists (`cycles/`, procedural, CPU-only) and produces the board plates; what remains is the runtime export* | Reuse the Cycles scene: bake its lighting to the real-time model, GLB + KTX2 export, per-room stills, dollhouse plate. Where a room is a held frame rather than a live camera, the Cycles plate ships as the image and no geometry is exported at all | `public/house/*.glb` or plates, stills | Budgets met (≤ 4 MB GLB, ≤ 6 MB textures, ≤ 150 k tris); stills pass the frame test |
| **4 · Prototype** (riskiest first, on a dev route) | Spline camera on native scroll with the ≤ 120 ms world damping; Tech sticky region with three states; floor-plan `scrollTo`; roof-lift for the dollhouse; wheel/trackpad/keyboard latency probe (`scripts/measure-experience.mjs`) | `/lab` route | Input fidelity probe green; 60 fps on a throttled mid-range profile or the tier drops |
| **5 · Build** | Routes per room + documents; `lib/site-config.ts` as the only source of facts; SEO (per-page titles/descriptions, `lang="sk"`, sitemap, OG); GDPR page; form handler with a real destination; redirects from `work1.html …` to `/realizacie/<slug>` | The site on a preview URL | `npm run verify` green; Playwright: every room reachable by chips, keyboard and URL; facts drift test |
| **6 · Content** | Copy per room in Roman's voice, typos fixed (list in `CONTENT_INVENTORY.md` §5), ENTER/HOLD/EXIT hold lengths set from reading speed; project pages with materials and dates; alt text for every plate | Content in config | Every text state passes the readable-hold rule |
| **7 · Validation** | LOCAL → CI → PREVIEW → DEVICE (iPhone Safari and a mid-range Android, real hands); reduced-motion layout reviewed as a first-class design; LCP/CLS under throttle; AA on every ground | Validation report naming the class reached | DEVICE class, or an explicit `NOT VALIDATED — reason` |
| **8 · Launch** | Domain switch, redirects live, analytics with consent, `/kontakt` form tested end to end | Live site | Smoke on production (`npm run smoke`) |

Order is strict where it matters: 1 before 2, 2 before 3, 3 and 4 in
parallel, nothing in 5 before 4's gate.

---

## 9. What goes wrong, and the answer

| Risk | Answer |
| --- | --- |
| The model reads as a cheap game asset | The maquette language is a decision, not a shortcut: real wood grain at plank scale, hard-edged joinery, a raking key light, no bloom, no fog inside. Board it in phase 2 before a single polygon |
| Rooms have too little content and the walk feels empty | Merge (Terasa carries three services; Poschodie carries five). If a room still cannot fill a viewport, cut the room — 9 is a ceiling, not a target |
| Mobile jank | Stills tier from the start; the full world never ships to touch in v1 |
| The client sends the Matterport link expecting free roam | §4.1 says why not, in one table. Show the floor-plan chips as the answer to "can I go where I want" |
| Copy loses Roman's voice in "professional" rewriting | The voice is a design asset; edits fix typos and structure, not tone. The goat stays |
| Anything gets invented for effect (m², energy class, prices, testimonials) | Forbidden by the studio rule; the site publishes what the register, the badge and the projects actually say |

---

## 10. Out of scope for v1

CMS, an English version, a configurator ("build your house"), 360° photo
panoramas, WebGL on touch devices, a blog engine (two articles ship as
documents; the rest were tiles without content).

---

## 11. Questions for the client (answers gate phase 2)

1. **Which house do we model?** — *Decided 2026-09-03: the Matterport house,
   as a re-skinned `Vzorový dom` (§5.3).* Client to confirm they are happy
   that the walkthrough house is a concept, not one of their builds.
2. The real wall build-up with layer thicknesses (for the X-ray act) and,
   if they exist, plans of any EcoDomček house — used to check that the
   model's proportions (room heights, window sizes, wall thickness) match
   what they actually build.
3. Finished-interior photographs of any project, if they exist; originals
   of all job-site photos at full resolution.
4. A portrait of Roman and the crew, taken on site (we can brief it).
5. Confirm all facts in `CONTENT_INVENTORY.md` §3.1; confirm the D&B badge
   year and the DAIBAU article are current.
6. Where should the form deliver (e-mail)? Who answers, and how fast — that
   sentence goes next to the submit button.
7. Keep the current logo, or refine the mark within the same geometry?
8. Is recruiting still active? If yes, the job ad becomes a proper page.
9. Which services actually get requested (to order the rooms by demand, not
   by the old menu).
10. Budget confirmation for the model production line (§5.3), separate from
    the 5D package baseline.
