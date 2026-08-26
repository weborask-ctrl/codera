# Codera — redesign progress

Living handover file. Keep it short. One section per heading, nothing else.

---

## Creative direction

**"Otvorený oblúk" — the open arc.**

The Codera mark is an open C: an arc with a gap in it. That gap is the whole
idea — an unfinished circle the site closes as you scroll. One stroke persists
across all four scenes and changes job each time:

| Scene | What the arc does |
| --- | --- |
| 01 Identita | Draws itself, holds the composition, reacts to the pointer |
| 02 Premena  | Widens into a **mask** that wipes the dated site away and uncovers the Codera one |
| 02B Práca   | Becomes the **progress track** of the pinned project stage |
| 03 Ponuka   | Becomes the rule under the active service word |
| 04 Záver    | Closes back into the complete C |

**Colour rule (the authored decision):** Codera's own chrome is monochrome —
near-black, graphite, warm off-white, dark metallic silver. *Colour belongs to
the work.* The only saturated colour on the page comes from the client concept
previews (Konštrukt amber, Vitalis teal, Forma terracotta). This kills every
purple-AI-gradient cliché at the root and makes the project stage detonate.
One low-chroma warm signal token survives for focus rings and active states.

Dark → light → dark rhythm is driven by the work itself: the pinned project
stage morphs its ground per project, so the contrast shift is motivated
instead of decorative.

---

## Scene architecture

Four scenes, ~5 viewport lengths, continuous — scenes transform into each
other, they do not end and restart.

- **SCENE 01 — IDENTITA** (dark). Full-viewport composition, no dead
  whitespace. Kinetic headline + arc mark + a cropped strip of live interface
  fragments. Keeps the existing headline (`Vaša firma je lepšia, než ukazuje
  váš web.`) — commercially strong, brief says do not discard casually.
  Primary CTA `Začať projekt` (magnetic), secondary `Pozrieť prácu`.
- **SCENE 02 — PREMENA + PRÁCA**. 02A: scroll-scrubbed arc mask sweeps the
  2011-era site away and reveals the Konštrukt concept; the existing
  accessible range-input divider stays as the interactive affordance
  afterwards. 02B: one pinned project stage, three states
  (Konštrukt → Vitalis → Forma), ground tone morphing per project.
- **SCENE 03 — PONUKA** (light editorial → graphite). `STRATÉGIA / DIZAJN /
  VÝVOJ` as one large composition, one active at a time, inactive words drop
  to outline. Compact 4-step process folded in. Why-Codera statement. Price
  band (`od 699 €`) placed near the decision, never in the hero.
- **SCENE 04 — ZÁVER** (dark cinematic). Arc reassembles into the full C.
  `Váš ďalší web nemusí vyzerať ako všetky ostatné.` Magnetic CTA into the
  existing enquiry form. Minimal contact strip, no large footer.

---

## Motion architecture

One orchestration layer. **GSAP + ScrollTrigger**, and nothing else.

- `lib/motion.ts` — registers ScrollTrigger exactly once, exports `gsap`.
- `hooks/use-scene.ts` — wraps `gsap.context()` scoped to a ref, auto-cleans
  timelines and triggers, and under `prefers-reduced-motion` never registers
  them at all. The DOM resting state is the finished state, so motion only
  ever animates *towards* what is already there.
- **No smooth-scroll hijack.** Native scroll only — no Lenis. That rules out
  React Bits `ScrollStack` as a component; its *mechanics* are reimplemented
  with ScrollTrigger pinning and a completely different visual design.
- `motion` (v13) stays for discrete UI transitions and the React Bits parts
  that need it. `framer-motion` is removed — nothing imports it and it is the
  same codebase as `motion`.
- Reduced motion: pinning and scrubbing are not registered at all, so every
  pinned scene degrades to ordinary stacked flow with all content present.

---

## React Bits

Registry naming is `{Name}-{TS|JS}-{TW|CSS}`; this project takes `-TS-TW`.
Installed into `components/react-bits/`, all substantially rewritten:

| Component | Role | What changed |
| --- | --- | --- |
| `Magnet` | Primary CTAs | Rewritten off React state — it rendered React on *every mousemove*. Now ref + rAF, damped, and the listener is skipped entirely when disabled |
| `GlareHover` | Specular sweep on work surfaces | Rewritten as CSS-only: its mouse handlers sat on a static div (a11y failure) and never reached keyboard users. Now `:hover`/`:focus-within`; the glare rides the metal ramp instead of white |
| `ScrollReveal` | The one scrubbed statement | **Fixed a page-breaking bug**: its cleanup ran `ScrollTrigger.getAll().forEach(kill)`, so unmounting it would unpin every other scene on the page. Now scoped to its own `gsap.context`. Added a reduced-motion path; dropped the rotation |
| `CountUp` | Commercial numbers | Wired in Phase 5 |

**Evaluated and rejected**, with reasons — the bar is "does it improve the
experience", not "is it installed":

- `StaggeredMenu` — its choreography is adopted in `site-nav.tsx` (pre-layers,
  item rise-with-rotate, index fade). The component is not: its panel keeps its
  links in the tab order while closed, has no Escape handling and no focus
  containment, and reaching this site's accessibility floor from there meant
  rewriting it rather than configuring it.
- `GradualBlur` — 296 lines and 13 `any`s for an effect that is ~25 lines of
  stacked `backdrop-filter`. Technique adopted, component dropped.
- `MaskedHeading` — fills headline type with a photograph and sizes itself from
  container width. Fights both the type scale and the colour rule. The
  masked-reveal role is served by the `.reveal-wipe` clip primitive.
- `Ribbons` (ogl cursor-trail — reads as a demo toy, and the arc language is
  authored SVG instead), `ScrollStack` (pulls Lenis), `SpecularButton` /
  `Threads` / `Lightfall` (a WebGL context each), `MetallicPaint` (heavier and
  less controllable than an authored SVG specular on the real mark).

---

## Completed

- **Phase 1 — audit + architecture.** Repository, dependencies, component
  architecture, `components.json`, React Bits registry, concept content and
  Playwright suite all inspected. Architecture above decided.
- **Phase 2 — design system + Scene 01.** Dark-first token layer; Archivo
  variable display type (width axis, `latin-ext`); the arc component family;
  navigation (desktop bar + immersive menu); Scene 01 built and verified at
  390 / 1440 / 1920. `next-themes` removed — there is no user theme any more.
  90 unreferenced library components deleted and 10 dependencies dropped.
  Build, typecheck, biome, eslint and 18 Playwright tests all green.
- **Phase 3 — scroll choreography + Scene 02A.** The Scene 01 to Scene 02
  handoff (the hero mark dissolves as the next frame opens from a slit at its
  own centre), and the scroll-driven transformation. 20 tests green.
- **Phase 4 — Scene 02B, selected work.** One pinned stage, three states.
  The ground morphs with the project (graphite → paper → warm paper) and the
  navigation bar inverts with it. 21 tests green.

## Current state

Production site is intact and untouched. Existing strengths being kept:

- `components/site/previews/*` — Konštrukt, Vitalis, Forma and the 2011-era
  Legacy site are **live markup**, container-query sized, no image bytes.
  These are the single most valuable asset in the repo. Reused, not rebuilt.
- `components/site/enquiry-form.tsx` — validated, accessible, covered by
  tests. Restyled, not rewritten.
- `lib/site-config.ts` — the only source of business facts. Nothing invented.
- Accessibility floor in `app/globals.css` (focus ring, reduced motion,
  reduced transparency, contrast) — carried over.

Still standing from the old page, and due for replacement in Phase 5:
`services.tsx`, `contact.tsx` and `site-footer.tsx`. They render correctly on
the new ground because they were already token-based — but they are the old
card-and-list design, not the scene architecture.

Page length is currently ~10.5 viewports of scroll. Pinned scenes consume
scroll without adding perceived page length (the visitor sees four scenes),
but Phase 6 should still check the pin distances feel right rather than long.

Deleted in Phase 2: 90 unreferenced library components, the theme provider and
its hidden `d` hotkey, and the old header/hero/offer/process/team/quality/
transformation sections. Dependencies went from 23 to 13.

## Next phase

**Phase 5 — Offer + conversion.** Scene 03 (Stratégia / Dizajn / Vývoj as one
composition, compact process, the commercial band) and Scene 04 (the arc
closing, final CTA, contact). Replaces the last three old sections.

## Known issues

- `siteConfig.url` is still the RFC 2606 placeholder `codera.example`. Every
  canonical/OG/sitemap URL derives from it. Not a redesign problem — flagged.
- `next.config.ts` ships no CSP (documented, deliberate).

## Architectural decisions

1. **Monochrome chrome, colour only in the work.** See creative direction.
2. **One motion engine.** GSAP + ScrollTrigger; no second animation framework,
   no scroll hijacking.
3. **Previews stay live markup.** Photography is composed *around* them
   (masked, graded, parallaxed), never used as a screenshot of them.
4. **Nothing about the business is invented.** No testimonials, clients,
   metrics, awards or company registration. Concepts stay labelled `Koncept`.
5. **Reduced motion is a layout, not a fallback.** Pinned scenes are never
   registered when the preference is set, so nothing can trap the scroll.
