# Codera — spatial redesign (spatial-v2)

Living handover file for the Refokus-level spatial rebuild. `master` holds the
live v1 site and stays untouched until this branch passes the preview gate.

---

## Completed

- **Phase 1 — audit + creative architecture.** Measured audit of the live
  build (desktop + throttled mobile, with a calibrated control), jank
  attribution per scene, the full desktop/mobile storyboards, camera map,
  transition matrix, depth/material/lighting direction, technology decision
  and evidence-based performance plan — all below. Brand mark reconstructed
  as a parametric vector system (`scripts/generate-brand-mark.mjs` →
  `public/brand/`), from the approved ribbon-C reference supplied in-task.

## Current phase

Phase 4 complete — the work chapter lives inside the world. The journey is
now A → B → portal → transformation → E1 Konštrukt → E2 Vitalis (paper) →
E3 Forma (warm paper), one pin, one timeline.

### Prototype verdict (measured, production build)

| Kill criterion | Target | Result |
| --- | --- | --- |
| Desktop scrub | ≥55 fps | **16.6 ms median (vsync floor), 1.9% jank** |
| 4× CPU throttle | ≥40 fps | **16.7 ms median, 2.6% jank** |
| Lifecycle | no leaks | triggers 1→1→0 across 6 mount/unmount cycles, heap flat at 12.1 MB, no context-limit warnings |
| Fallback | same content, no canvas | reduced-motion mounts zero canvas, zero pins; SVG mark + full headline + CTAs |

The decisive comparison: at 4× throttle the WebGL world holds the frame-rate
floor with 2.6% jank while the **current live DOM site** drops 60% of frames.
The film architecture (scroll → GSAP timeline → plain numbers → camera, React
nowhere in the frame path) is the right foundation — proceed.

What the prototype established, to reuse verbatim in Phase 3:
- `lib/ribbon-mesh.ts` — the swept, twisted, chevron-cut ribbon built from
  `lib/ribbon-geometry.json` (emitted by the brand generator; one geometry)
- `components/proto/film.ts` — the shared film object + camera states
- the master-timeline pattern in `proto-experience.tsx` (pin + scrub + DOM
  tweens and camera tweens on one clock)
- the tier gate (`webglAvailable` + reduced motion → DOM experience)
- R3F mount/unmount hygiene (geometry/texture/PMREM disposal)

### Phase 3 delivered

- **The world on the homepage** (`components/world/`): persistent canvas,
  ribbon, transformation plane, camera rig, atmosphere — behind the tier
  gate. The DOM tier (reduced motion, no WebGL, <1024px) renders the v1 hero
  and comparison: complete, tested, and what the server sends (LCP + SEO).
- **The intro is autoplayed, not scrolled** (~1.9 s, A→B): commercial
  clarity outranks spatial storytelling, so the headline lands within
  seconds. A scroll during the intro fast-forwards it. Scroll owns the film
  from B: hero hold → portal flight through the chevron opening → settle on
  the dated site → the morph wipes Konštrukt across it. Pin: 320vh.
- **Baked work textures** (`scripts/capture-work-textures.mjs` +
  `/textures` route): the live-markup previews screenshot themselves into
  `public/work/*.jpg` (73–142 KB each), so the previews stay the single
  source of truth for the 3D surfaces. Self-generated — no external imagery
  yet; SOURCES.md starts when photography enters (Phase 4+).
- **Homepage world scrub, measured**: 16.7 ms median at 1× AND 4× CPU
  throttle (the vsync floor), 8–9% frames over 20 ms — against 56–60% for
  the DOM implementation it replaces. LCP unchanged (SSR DOM hero).
- 26/26 Playwright tests green, including a new world test (mount, pin,
  state advance, stale-start regression guard).

### Hard-won findings (do not relearn)

- **`ScrollTrigger.create()` does not re-measure existing triggers, and
  `refresh()` processes them in CREATION order.** The master pin is created
  seconds after the sections below built theirs — without
  `ScrollTrigger.sort()` before `refresh()`, the world’s 2 880 px of pin
  distance is never added to later starts and those sections pin ON TOP of
  the world.
- **A pinned trigger re-parents its element into the pin-spacer.** If a
  server-rendered fallback scene creates its pin and is then swapped out by
  the post-hydration tier decision, React unmounts a node whose parent
  changed → removeChild crash. `useScene` now defers all setup by one rAF
  so the swap decision always lands first.
- **react-hooks v6 immutability**: per-frame mutation must never touch a
  hook-tracked value. Route it through `state.scene.getObjectByName()` in
  the frame callback — same pattern for mesh rotation, uniforms, lights.

### Phase 4 delivered

- **Three project states in the world.** The morphed transformation surface
  IS Konštrukt’s presentation (no cut); Vitalis and Forma hang deeper along
  the arc as angled planes, revealed on approach, faded on departure. Camera
  states E1–E3 computed from angular framing (plane ≈ frame-right 33–100%,
  metadata column on clean air left).
- **The atmosphere carries the ground rhythm**: fog + background lerp
  graphite → paper → warm paper as one colour, so depth reads as air. The
  stage is a ; the chapter flip lands between metadata
  blocks, and the fixed nav inverts through the existing v1 mechanism — one
  system, not two.
- **DOM per project**: index, sector, name, one commercial proof line,
  disciplines,  badge. The  anchor is a marker at the work
  chapter’s scroll offset inside the pin.
- **Tiers**: the DOM tier now carries the full v1 sequence (hero,
  comparison, pinned work stage) — that is what phones get until Phase 6.
- Pin: 560% (~6.6 viewports of scroll for scenes 01–03). Full-journey scrub:
  **16.7/16.8 ms median at 1×/4×, 4.5/6.3% jank**. 26/26 tests, including
  the world walk e1→e2→e3 with the paper-chapter flip.

## Next phase

**Phase 5 — offer + resolution.** The world returns toward the ribbon: the
strand composition for STRATÉGIA / DIZAJN / VÝVOJ, the quiet price, the
reassembled C, final CTA and the conversion block. Replaces v1 SceneOffer on
the world tier; the ribbon’s return closes the continuity loop (it has been
behind the camera through the work chapter — deliberate, noted).

---

## AUDIT — measured, not assumed

Harness: Playwright Chromium, production build, CPU-throttled to proxy
mid-range (4×) and low-end (6×) Android. Control = the 404 page in the same
harness, which holds **16.6 ms** frames — that is the floor, so anything above
it is the page's own cost.

| Scenario | median frame | p95 | janky (>20 ms) |
| --- | --- | --- | --- |
| control (no scenes), 4× | 16.6 ms | 18.7 ms | 0.9% |
| homepage desktop, 1× | 20.4 ms | 26.7 ms | 54% |
| homepage mobile, 4× | 22.4 ms | 47.3 ms | 60% |
| homepage mobile, 6× | 23.6 ms | 104.7 ms | 56% |

Attribution (mobile 4×, per scene):

| Scene | janky | root cause |
| --- | --- | --- |
| `#top` hero | 2% | fine |
| `#premena` | 12% | pin engagement, acceptable |
| `#praca` | **49%** | chapter-morph transitions on ~every element + full-viewport `clip-path` curtains over live markup |
| `#sluzby` | **67%** | **scrubbed `font-variation-settings`** — the width-axis tween re-rasterises glyphs every frame |
| `#kontakt` | 0% | fine |

Disabling grain (`mix-blend-mode: overlay`), chapter-morph transitions and the
nav `backdrop-filter` cuts full-page jank 56% → 38% on its own.

Other findings: page is 11.7 viewports on desktop, 13 on mobile (brief target:
4–6 / 3–4); LCP mobile 6× is 2.25 s (at the budget edge); desktop and mobile
are the same implementation, differing only by media queries — exactly what
the brief calls out.

### KEEP

- Design tokens, Archivo/Geist type system, graphite/paper palette
- `enquiry-form.tsx` (validated, accessible, tested), footer, `site-config.ts`
- SEO/structured data, accessibility floor, Playwright infrastructure
- The transformation *mechanism* (range-input comparison — 12% jank, earns its keep)
- The dark → light → dark ground rhythm driven by the work

### IMPROVE

- Transformation framing: crop into the hero region of each site so the
  comparison is legible at phone width, not an impression
- Ground morph: same idea, cheaper implementation (see performance plan)
- Navigation: visually unchanged, becomes state-aware of the world

### REMOVE

- Scrubbed `font-variation-settings` (the 67% scene) — axis changes only on
  discrete state changes, desktop only
- `mix-blend-mode` grain overlay and mobile `backdrop-filter`
- The blanket `chapter-morph` transition selector
- Mobile pinning entirely — no pinned scene ships on mobile

### REBUILD

- Hero → spatial entry (Signature 01)
- Work presentation → spatial planes on desktop / swipe deck on mobile
- Offer → strand composition (Signature-adjacent, quiet)
- Page architecture → one persistent world, one master timeline (desktop)

---

## CREATIVE CONCEPT — "The Ribbon Chamber"

One persistent world: the Codera ribbon at architectural scale in a graphite
atmosphere. **Scroll is the film's timeline; the camera is the narrator.**
The ribbon is the connective tissue — hero object, portal, path between
projects, the strands of the offer, and finally the reassembled C.

Conceptual line under everything: *a better digital presence transforms how a
company is perceived* — enacted by the world itself: the visitor enters
through the mark, watches a weak site become a strong one, travels past proof,
and leaves through the completed mark.

Brand geometry: the 3D ribbon is swept from the **same parametric definition**
as the static SVG (`scripts/generate-brand-mark.mjs` — spine, width, twist
windows, terminal cuts). The cinematic object and the logo are one geometry.

---

## DESKTOP STORYBOARD + CAMERA MAP

World units: C centred at origin, 10 units tall. FOV 35 throughout (no FOV
animation — it reads as zoom, not movement). Camera path is a scrubbed master
timeline; easing comes from path parameterisation, tweens inside a scrub are
`none`. Master runway: **~420 vh pinned + ~100 vh normal-flow conversion ≈
5.2 perceived viewports** (from 11.7).

| State | Scroll | Camera (pos → target) | Ribbon | DOM | Lighting |
| --- | --- | --- | --- | --- | --- |
| **A — Surface** | 0–8% | (2.2, 1.4, 1.1) → (1.6, 1.2, 0). Millimetres from the top strap; frame is abstract satin metal | Fills frame, slow specular sweep | Nav only; a whisper label | Low-key, single moving sweep |
| **B — Reveal** *(Signature 01)* | 8–22% | Pull back along a curve threading the twist → (0.4, 0.2, 14) → origin. Form resolves into the full C, right of centre | Complete, hero object | Headline enters as the pull-back settles: *Vaša firma je lepšia, než ukazuje váš web.* + CTA `Začať projekt`, secondary `Pozrieť prácu` | Key rises, left rim |
| **C — Portal** | 22–34% | Dolly toward the opening, (2.6, 0, 6.5) → (3.2, −0.4, 0); the chevron opening becomes the frame | The opening = doorway | Headline exits up with slight blur; label *02 — Premena* | Directional raking builds |
| **D — Transformation** *(Signature 02)* | 34–46% | Through the opening, hold on the plane at z −6 | Slides to frame edge, stays visible | *Rovnaká firma. Úplne iný dojem.* + the comparison affordance | Raking light across the plane |
| **E1/E2/E3 — Work** *(Signature 03)* | 46–70% | Lateral track past three planes on an arc: (−2, 0, −8) / (−6, 1, −12) / (−10, 2, −16), ~55° framing | The path connecting the stations | Per project: index, name, sector, one proof line, `Koncept` | Graphite → paper → warm paper: fog + background + key lerp per project |
| **F — Offer** | 70–84% | Rise to (−6, 4.5, −4) → (−6, 1.5, −12) | Unfolds into three parallel strands | STRATÉGIA / DIZAJN / VÝVOJ docked to the strands; one active at a time, one line each; quiet price late in the state | Active strand carries emissive accent |
| **G — Resolution** *(Signature 04)* | 84–100% | Settle to (0.2, 0.1, 12) → origin, motion slowing | Strands re-merge; **the C completes** | *Váš ďalší web nemusí vyzerať ako všetky ostatné.* + CTA | Single soft frontal key |
| **— Conversion** | after pin | Canvas parks as backdrop | Static completed C | Facts (od 699 €, 72 h, 24 h), form, minimal footer — normal flow | Held |

The transformation surface: the legacy site and concept sites are **baked
textures** (screenshots of our own live-markup previews, generated at build
time) on WebGL planes — crisp metadata stays DOM. The full semantic content of
every project and the offer also exists as real DOM (it *is* the
reduced-motion/no-WebGL experience), so SEO and accessibility never depend on
the canvas.

### Transition matrix

| From → To | Persistent element | Transformation |
| --- | --- | --- |
| A → B | ribbon (same mesh, same shot) | camera pull-back resolves form |
| B → C | ribbon + camera continuity | opening grows into a frame |
| C → D | the plane (already visible through the opening) | camera passes through; plane morphs weak → strong |
| D → E1 | **the morphed plane is Konštrukt's surface** — no swap | metadata docks alongside |
| E1 → E2 → E3 | ribbon path + environment | lateral dolly; lighting crossfades per project |
| E3 → F | ribbon | planes fold into it; strands separate from the same geometry |
| F → G | strands | re-merge into the completed C |
| G → conversion | the completed C | canvas parks; page becomes ordinary flow |

No state resets. Every arrow names what carries over.

### Depth system

- **Far**: atmosphere — per-state fog colour, gradient environment, 2–3 dim
  silhouette planes. Near-static.
- **Mid**: project planes, environment geometry. Moderate.
- **Near**: the ribbon. Strongest movement.
- **DOM foreground**: type, labels, CTA, nav — always sharp, synchronised to
  the same master timeline; pointer adds ±2° camera sway and DOM
  micro-parallax via the existing `usePointerField` (fine pointers only).

### Materials & lighting

Ribbon: `MeshPhysicalMaterial` — base `#2a2a2c`, metalness 0.85, roughness
0.32 **with a procedural roughness map** (subtle brushed variation along the
band, small canvas texture — the "designed, not primitive" difference),
clearcoat 0.25, env intensity ~0.7, anisotropy 0.6 along the band on capable
devices only. Slight thickness + bevel so edges catch real specular.
Environment: `RoomEnvironment` → PMREM (zero asset bytes, no HDR download).
Tone mapping ACES. **No post-processing package** — no bloom, no neon.

Lighting rig per state (single lerped rig, never per-object lights): key
directional + soft fill + env intensity + fog/background colour. Offer-strand
accents are emissive, not lights.

---

## MOBILE STORYBOARD — separately directed

Principle: desktop is an interactive film; mobile is the trailer. Same brand,
story, work, offer. **No pinned scenes, no scroll hijack, no full WebGL
world.** ~4.2 screens to CTA.

| Stage | Screen | Direction |
| --- | --- | --- |
| **M1 — Hero** | 1 | Headline + CTA visible immediately. The mark large, in the new SVG treatment, with a masked light-sweep (CSS, compositor-only). Tier-A devices may upgrade to a single lightweight 3D ribbon (one mesh, DPR ≤1.5, no env animation) — measured, not assumed |
| **M2 — Premena** | ~1 | The v1 comparison kept (it profiles at 12%) but **unpinned** — drag/tap only, cropped into the hero region of each site so both are legible at 390 px |
| **M3 — Práca** | ~1.2 | **Swipe deck**: horizontal scroll-snap, one project ≈ 85 vw, baked screenshot + DOM metadata. Ground tone still follows the active card (cheap: root attribute + scoped transition). No WebGL |
| **M4 — Ponuka + CTA** | ~1 | The three words as a static stack — active state on scroll-into-view, **no width-axis animation on mobile**. Facts, form, footer |

Touch language: scroll = story, swipe = projects, tap = action. Nothing
depends on hover.

### Device capability tiers (automatic, never exposed)

Signals: `prefers-reduced-motion`, `deviceMemory`, `hardwareConcurrency`,
WebGL renderer string, `saveData`.

- **Tier A** (capable desktop): full world.
- **Tier B** (modest desktop / strong phone): world with anisotropy off,
  DPR ≤1.5, silhouette layers dropped.
- **Tier C** (weak device / reduced motion / no WebGL): the DOM experience —
  which is complete, content-identical, and designed, not a stub.

Tablet (768/1024): decided by pointer, not width — hover-capable 1024
landscape gets desktop Tier B; touch tablets get **mobile-plus** (the swipe
deck with two cards visible, hero at tablet scale). Audited in Phase 7.

---

## TECHNOLOGY PLAN — the gate

**Question: can the existing stack fake the camera?** No — states C/D/E need
real perspective (travelling *through* an opening, planes at depth with a
moving eye), object permanence across states, and material response to light.
CSS 3D transforms cannot share one consistent projection with lit materials.

**Decision: WebGL on desktop is justified.** Additions, exact and final:
`three`, `@react-three/fiber`, `@react-three/drei` (used only for
environment/PMREM helpers), `@gsap/react`. GSAP + ScrollTrigger remain the
only motion engine — R3F renders; it does not animate. **No lenis, no
postprocessing, no physics, nothing else.** Estimated cost ≈ 200 KB gz,
**lazy-loaded after first paint**: the hero headline + SVG mark are the LCP
and render instantly; the canvas fades in when ready. Mobile never loads
three.js below Tier A.

Budgets: ≤120 draw calls, one canvas for the whole page, DPR ≤1.75, textures
≤2048², ribbon ≈12 k tris, zero React state writes inside the frame loop
(GSAP writes camera/uniforms directly).

**Prototype kill criteria (Phase 2, before any full build):** scrubbed
camera+ribbon+DOM sync holds ≥55 fps on desktop and ≥40 fps at 4× throttle
in the harness; mount/unmount leaks nothing (context, geometries, triggers);
the SVG fallback renders the same content. Fail → the architecture is
redesigned before proceeding, per the brief.

---

## PERFORMANCE PLAN — from the evidence

1. **Never scrub a variable-font axis.** Width changes happen on state
   changes, tweened once, desktop only. (Kills the 67% scene.)
2. **No `mix-blend-mode` grain over animating content; no mobile
   `backdrop-filter`.** Grain becomes a pre-multiplied low-opacity tile; the
   mobile nav goes solid. (Worth ~18 points alone.)
3. **Chapter-morph shrinks to root-level `background-color`/`color` with
   explicit inheriting tokens** — never a `:is(everything)` transition.
4. **No full-viewport `clip-path` curtains over live markup on mobile** — the
   swipe deck replaces them.
5. Targets: LCP < 2.5 s on 6× throttle, INP < 200 ms, CLS < 0.1, and the
   existing harness re-run at every phase gate with the 16.6 ms control as
   reference. No hiding content post-measurement.
6. Cleanup contract as in v1: every trigger/timeline/observer/GL resource
   scoped and reverted (`useScene` pattern extends to the canvas world).

---

## Architecture decisions

1. **One world, one timeline.** A single persistent canvas + one master
   scrubbed ScrollTrigger; DOM and camera read the same clock.
2. **One geometry.** The parametric mark generator feeds both the SVG assets
   and the 3D sweep; the logo and the cinematic object cannot diverge.
3. **DOM is the floor.** All commercial content is semantic DOM; the canvas
   is enhancement. Tier C is a designed experience, not a fallback apology.
4. **GSAP stays the only animator.** R3F is a renderer.
5. **Mobile is authored separately** — different structure, different
   interaction language, shared brand and copy.
6. Nothing about the business is invented; concepts stay labelled `Koncept`.

## Known issues

- The mark reconstruction awaits a final side-by-side fidelity pass against
  the approved raster (Phase 2, together with the 3D build).
- Imagery (photography for atmosphere/project texture) not yet selected;
  chosen in Phase 4 with `SOURCES.md` created alongside.
- v1's footer registration TODO carries over (no invented IČO/DIČ).

## Performance findings

See AUDIT above — kept here as the running log for later phases.
