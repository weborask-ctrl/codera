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

- `lib/motion/gsap.ts` — registers ScrollTrigger exactly once, exports `gsap`.
- `hooks/use-scene.ts` — wraps `gsap.context()` scoped to a ref, auto-cleans
  timelines and triggers, and short-circuits under `prefers-reduced-motion` by
  jumping every timeline to its end state.
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
Installed set (chosen for role, not for count):

| Component | Role |
| --- | --- |
| `MaskedHeading` | Masked reveal for the four scene statements only |
| `Magnet` | Primary CTAs — small, premium travel |
| `GlareHover` | Specular response on the project stage |
| `GradualBlur` | Edge falloff on pinned stages |
| `StaggeredMenu` | Immersive navigation |
| `CountUp` | Commercial numbers near the decision |
| `ScrollReveal` | The single scrubbed word-level statement |

Deliberately **not** installed: `Ribbons` (ogl cursor-trail — reads as a demo
toy, and the arc language is authored SVG instead), `ScrollStack` (pulls
Lenis), `SpecularButton` / `Threads` / `Lightfall` (ogl per instance),
`MetallicPaint` (its liquid-metal pass is heavier and less controllable than
an authored SVG specular sweep on the real mark).

---

## Completed

- **Phase 1 — audit + architecture.** Repository, dependencies, component
  architecture, `components.json`, React Bits registry, concept content and
  Playwright suite all inspected. Architecture above decided.

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

Dead weight identified for removal: **90 of 93 files in `components/ui` and
`components/magicui` are unreferenced** (only `ui/button` is used by site
code). Removing them drops `cobe`, `canvas-confetti`, `react-tweet`, `shiki`,
`@shikijs/transformers`, `rough-notation`, `@radix-ui/react-accordion` and
`@radix-ui/react-icons`.

## Next phase

**Phase 2 — design system + hero.** Palette to dark-first graphite, display
typeface, navigation, Scene 01 composition, arc interaction, first transition.

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
