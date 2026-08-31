# Codera — redesign progress

> **ARCHIVED 2026-08-31. Historical record — do not update, do not treat as
> current.** Durable knowledge moved to `STATE.md`, open items to GitHub Issues,
> the working rules to `process/CODERA_PROCESS.md`. Kept because the
> phase-by-phase reasoning is worth reading, not because it is still true.

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
- **GSAP is the only animation library.** `framer-motion` and `motion` were
  both removed — the first was an unused duplicate of the second, and the
  second survived only to spring one animated integer.
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

`CountUp` started as the fourth, and ended up replaced entirely
(`components/site/count-up.tsx`). Its behaviour is React Bits'; none of its
code survives. It drove one animated integer with `motion`'s spring, which
meant carrying a ~120 KB library for one number — 30 lines of rAF do the same
job. It also rendered an empty span and filled it from an effect, so anything
that did not run the effect saw "od  €", which is a factual error about price.

**Evaluated and rejected**, with reasons — the bar is "does it improve the
experience", not "is it installed":

- `StaggeredMenu` — its choreography is adopted in `site-nav.tsx` (pre-layers,
  item rise-with-rotate, index fade). The component is not: its panel keeps its
  links in the tab order while closed, has no Escape handling and no focus
  containment, and reaching this site's accessibility floor from there meant
  rewriting it rather than configuring it.
- `GradualBlur` — 296 lines and 13 `any`s for an edge falloff on the pinned
  stages. Dropped on inspection, and then the need went with it: the scenes
  ended up framing their own content, so there was no soft edge left to
  soften. Nothing replaced it.
- `MaskedHeading` — fills headline type with a photograph and sizes itself from
  container width. Fights both the type scale and the colour rule. The
  masked-reveal role is served by the per-line clip the scenes already use.
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
- **Phase 5 — Scene 03 + Scene 04.** The offer as three kinetic words driven
  by the variable width axis, the compact process, the why statement, the
  commercial band and the conversion. The last three old sections are gone.
  23 tests green.
- **Phase 6 — polish + QA.** Cross-browser, responsive and accessibility
  sweeps; the arc geometry fixed at source; two real accessibility defects
  found and fixed; social card and favicon brought onto the new identity;
  dependencies down to 8.

## Current state

The page is five sections and four scenes: `#top` (hero) → `#premena`
(transformation) → `#praca` (work stage) → `#sluzby` (offer) → `#kontakt`
(conversion), plus a small footer.

Kept from the old build, because it was the best thing in the repo:

- `components/site/previews/*` — Konštrukt, Vitalis, Forma and the 2011-era
  Legacy site are **live markup**, container-query sized, no image bytes.
  These are the single most valuable asset in the repo. Reused, not rebuilt.
- `components/site/enquiry-form.tsx` — validated, accessible, covered by
  tests. Restyled, not rewritten.
- `lib/site-config.ts` — the only source of business facts. Nothing invented.
- Accessibility floor in `app/globals.css` (focus ring, reduced motion,
  reduced transparency, contrast) — carried over.

Nothing is left of the old page's layout. The last of the old components —
`reveal.tsx`, `services.tsx`, `contact.tsx`, `projects.tsx` — are deleted; the
GSAP scene system replaced the CSS entrance primitive entirely, and with it
the `<noscript>` shim that existed only to neutralise it.

The page is ~9.5 viewports of scroll, of which the three pins account for
about five. That is a longer *scroll* than the brief's 4–6 viewports, but not
a longer *page*: pinned scroll advances a scene in place rather than moving
past content, so the visitor experiences four scenes. Pin distances were cut
in Phase 4 (work 280%→240%, transformation 150%→130%) and re-checked in
Phase 6.

Dependencies went from 23 to 8. Deleted along the way: 90 unreferenced library
components, the theme provider and its hidden `d` hotkey, `next-themes`,
`framer-motion`, `motion`, `lucide-react`, `tw-animate-css`, `cobe`,
`canvas-confetti`, `react-tweet`, `shiki`, `rough-notation`, two Radix
packages, and the `shadcn` CLI (kept out of the app entirely — its CSS import
brought 629 lines of accordion keyframes this site does not use, and resolving
it through the package's `exports` map was fragile under Turbopack).

## Verified

- **Tests.** 77 passed, 1 skipped, across Chromium, Firefox and WebKit. The
  skip is the keyboard-walk test on WebKit, which does not tab to links unless
  the OS preference is on.
- **Performance** (production build, 1440×900, served uncompressed locally):
  LCP 412 ms, CLS 0, one long task. 660 KB JS, 209 KB fonts, 53 KB CSS, 81 KB
  HTML. Served with brotli in production those drop to roughly a third.
- **Scroll.** No visible jump at any pin boundary — each pinned scene tracks
  scroll 1:1 into the pin and locks. `layout-shift` entries *are* emitted by
  ScrollTrigger's pinning, but every one falls within 500 ms of user input, so
  they are excluded from real CLS.
- **Responsive.** No horizontal overflow and no runtime errors at 320, 375,
  390, 768, 1024, 1440 or 1920.
- **Accessibility.** Every control is keyboard reachable with a visible focus
  ring; nothing focusable is hidden; End reaches the footer through all three
  pins; body and display text clear 4.5:1 on both grounds.

## Known issues

- ~~`siteConfig.url` placeholder~~ — resolved. The site is live on
  `https://www.codera.sk`; the canonical uses the `www` form because that is
  the host Vercel actually serves.
- Fonts are 209 KB — Archivo's width axis roughly doubles the file. It is
  bought deliberately (Scene 03 is built on that axis) but it is the single
  largest asset on the page.
- On a phone the transformation stage is ~360 px wide, so the two sites read as
  an *impression* rather than as legible pages. That is arguably the point
  ("dojem"), but a zoomed crop would land harder.
- `next.config.ts` still ships no CSP (documented, deliberate — a correct one
  for the App Router needs per-request nonces).

## Next phase

None — the redesign is complete. What remains is the launch checklist under
**Known issues**, chiefly the production domain.

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
