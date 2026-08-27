# 08 — Motion and Spatial Design

When motion improves hierarchy and storytelling, when it harms
readability, and how spatial/3D experiences stay usable. This file will
be EXTENDED by the Refokus-level study (Step 3 of the working document);
the principles below are the catalogue-derived baseline.

---

## 1. The hierarchy of motion purposes (spend budget top-down)

1. **Feedback** — press states, focus, loading. Must be instant
   (<150ms). Non-negotiable in every family.
2. **Orientation** — transitions that explain where things went (drawer
   slides, shared-element continuity, page acts connecting). Repays its
   cost in comprehension.
3. **Reveal** — content entering as you reach it (fade/rise once per
   element, 300–600ms). Cheap, effective, easily overdone.
4. **Storytelling** — scroll-driven sequences, scene changes, spatial
   choreography. The most expensive tier: earns its place only when the
   STORY needs sequencing, not when a section needs spice.
5. **Ambience** — idle drift, floats, gradients breathing. Near-zero
   information; use homeopathically, mostly in hero acts.

## 2. The two laws every studied family agrees on

- **The static-frame test:** pause any moment — the composition and
  typography must still look excellent. "A strong screen should still
  look intentionally composed if all animation is paused." Motion may
  amplify a composition that already works; it must never hold a weak
  layout together.
- **Readability overrides choreography:** every important text state
  needs ENTER → FULLY READABLE HOLD → EXIT. Text that lives at low
  opacity, exits before reading speed allows, or gets clipped by masks/
  transforms mid-read is a design failure, not a motion style.

## 3. Motion dialects by family (from the studies)

- Dark-cinematic: slow, damped, camera-like; motion reveals LIGHT.
- Editorial/image-led: reveal-and-settle; page-turn tempo; image
  unmasking; "print doesn't move much."
- Swiss/industrial: instant, mechanical; things click into place;
  150–250ms, no springs.
- Luxury/hospitality: crossfades and drift; ghost-button fill-ins;
  "motion never bounces; it settles."
- SaaS: product demos animate INSIDE frames; micro-feedback everywhere;
  skeletons over spinners.
- Playful/expressive: springs, pops, beat-like block choreography — but
  interaction feedback stays sober and instant.

## 4. Scroll-driven storytelling (the spatial baseline)

- **Input fidelity is sacred:** user input → immediate visual response →
  controlled cinematic settle. Wheel, trackpad, touch, and keyboard are
  DISTINCT input modes and must each feel native. Synthetic smooth-
  scroll layers (Lenis-class) that delay response to disguise weak
  architecture are an anti-pattern — smoothness belongs in the
  INTERPOLATION of the world, never in a lag between finger and effect.
- **Scroll economy:** pinned/scrub sequences borrow the user's scroll
  budget and must repay it with change — a pin that consumes 300vh must
  deliver at least three distinct states. Experience-per-scroll-unit is
  the metric; "the user should experience more while scrolling less."
- **Escape hatches always:** End/Home keys, scrollbar dragging, anchor
  links must never be trapped by a pin. A pin that swallows scroll is a
  release blocker, not a style.
- **Sections vs. journey:** stacked sections connected by effects read
  as a template; ONE persistent world with narrative states reads as
  authored. The difference is continuity of objects (things transform
  rather than swap) and continuity of camera (moves motivated by story
  beats, not by section boundaries).

## 5. Spatial/3D-specific rules

- The 3D object must be BRAND, not decoration — one hero object with
  narrative roles beats particle soups.
- 2D typography and 3D motion synchronize: text belongs to the DOM
  (crisp, selectable, accessible) and is choreographed WITH the world,
  never rendered inside it (except deliberate texture moments).
- Camera grammar: each state = a held composition (a "shot"); moves
  between shots are transitions, not the content. Compose every held
  shot like a static poster (rule of thirds, negative space, focal
  hierarchy).
- Lighting/material tone shifts (dark→paper→warm) are act breaks —
  the same dramaturgy as §5 of 05_COLOR_SYSTEMS, executed in-world.
- Depth cues over gimmicks: parallax layers, fog, scale — used to
  clarify WHAT IS IMPORTANT, not to demonstrate WebGL.

## 6. Performance & accessibility constants

- 60fps or degrade gracefully: capability-tier the experience (full
  world / static composition / mobile-native) rather than shipping jank.
- prefers-reduced-motion: full parity of information and composition —
  the reduced experience is a designed artifact, not a broken one.
- No autoplaying motion that loops forever in reading zones; ambience
  pauses off-viewport.
- Main-thread discipline: scroll handlers passive, animations on
  transform/opacity, layout thrash forbidden; motion never blocks input.

## 7. Motion QA checklist

□ Static-frame test passes at every scroll position
□ Every text state has a readable hold; nothing clipped mid-read
□ Input feels immediate on wheel, trackpad, touch, keyboard separately
□ End/Home/scrollbar/anchors work through every pin
□ Reduced-motion variant reviewed as a first-class design
□ Experience-per-scroll audit: no viewport of dead scroll
□ FPS verified under CPU throttle on real mid-range hardware

---

# Refokus-level findings (Step 3 study, 2026-08-27)

Structural study of the execution benchmark: refokus.com and three of
its shipped productions (Arqitel, Cula, Heimdall Power) — DOM/behavior
inspection plus Refokus's own case-study narratives. Principles
extracted, not copied.

## 8. The benchmark's actual architecture (measured, not assumed)

Across all three productions: **zero GSAP pin-spacers**. The cinematic
feel is built WITHOUT pinning:

- **Arqitel** (dark navy, the most cinematic): ONE persistent canvas in
  a fixed wrapper behind ~10 single-viewport DOM sections scrolling
  natively over it. No Lenis — NATIVE scroll. GSAP+ScrollTrigger only
  scrub the world.
- **Cula** (near-white canvas!): today ships its "3D world" as FIVE
  pre-rendered videos inside a CSS-sticky choreography — no GSAP at
  all on the page, 7 sticky sections, Geist/Inter, light editorial UI.
- **Heimdall Power** (light-grey canvas): Lenis present, two small
  WebGL canvases as accents, fixed-element choreography, still no
  pinning.

Lesson: pinning is ONE tool, not the genre. The benchmark achieves
"scroll owns the film" with fixed/sticky layers + scrubbed media, which
keeps native scroll physics — and therefore input fidelity — intact by
construction. Long pinned timelines (hundreds of vh) are the exception
in top-tier work, not the norm.

## 9. The pre-rendered secret (from Refokus's own case study)

Arqitel: graphics "initially created in C4D, were rendered as a high
performing video and we linked the playback to the scrolling trigger,
creating a sense of control while maintaining a fast loading
experience." The flagship "WebGL" site is scroll-scrubbed VIDEO.

Principles:
- Cinema quality is a CONTENT-PRODUCTION problem (C4D/offline render),
  not a runtime problem. Runtime realtime 3D is reserved for what must
  respond (a hero object reacting to pointer, material/light state
  changes) — Heimdall's small orb canvases, not whole worlds.
- Scrubbed video ≈ perfect input fidelity (scroll position = frame) +
  deterministic quality on every device + trivial mobile fallback.
- Hybrid recipe: realtime hero object (brand, interactive) + scrubbed
  or ambient video for expensive scenery + DOM for all text. Cula's
  history shows the evolution: launched as ThreeJS world ("primary
  challenge was to maintain smooth textures and shadows while
  optimizing performance"), now serves pre-rendered videos — the
  performance battle ends in baking.

## 10. Story-first spatial justification

Cula's world exists because the PRODUCT is a process: "a comprehensive
3D world depicting each step, with a camera moving through each" — the
camera journey IS the explanation of biochar → data → certificate.
Arqitel's goal: "reduce the complexity of their industry… tell what
they do in a single page."

Test for any spatial concept: name what the camera movement EXPLAINS.
If the journey doesn't map to a real narrative (process, product,
transformation), it's decoration and will read as such. Spatial
storytelling is justified by content structure, never by capability.

## 11. Scroll economy at the benchmark

- Single-viewport acts: Arqitel = ~10 sections of exactly ~100vh each
  over one continuous world — every viewport of scroll delivers one
  complete beat (statement + world state). No dead scroll, no
  300vh-per-state pins.
- "The site's scrolling allows the user to feel in control of the
  experience" — control-feel is the stated design goal; the scrub maps
  1:1 to scroll with the world interpolating underneath.
- Impact-without-scrolling techniques: single-page architecture
  (everything in one page, sections = chapters); in-place state
  changes (the world transforms while scroll cost stays ~1 viewport
  per beat); camera cuts between acts rather than long travel.

## 12. Light worlds

Two of three benchmark productions run LIGHT canvases (Cula #fcfdfe,
Heimdall #d9d9d9) with 3D/cinematic content on them. Cinematic ≠ dark:
a pale world with dramatic objects and shadows reads premium-technical
and keeps text effortlessly readable — direct evidence for the
dark/light dramaturgy thesis (05 §5) inside the spatial genre itself.

## 13. Typography over the world

DOM text scrolls OVER the fixed world in all three productions (never
rendered into the canvas): crisp, selectable, SEO-visible, and its
scroll behavior is native — the world is the only interpolated layer.
Text belongs to the page; the world belongs to the camera. Sync happens
through shared scroll progress, not through embedding.

## 14. Updated spatial checklist (benchmark-calibrated)

□ Can the spatial concept be told as "the camera explains X"?
□ Is native scroll physics preserved (no synthetic lag between input
  and response)? Pinning minimized or absent?
□ Is each narrative beat ≈ one viewport of scroll?
□ Is expensive scenery baked (video/textures) rather than fought at
  runtime? Is realtime 3D reserved for the responsive hero?
□ Does text live in DOM with ENTER → HOLD → EXIT choreography?
□ Has a light-canvas act been considered before defaulting to dark?
□ Static-frame test at every beat; reduced-motion and mobile get
  re-directed experiences, not scaled-down choreography.
