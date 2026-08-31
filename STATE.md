# Codera — current state

What is live, what was decided, and what must not be relearned. One file, kept
short. Open work does **not** live here — it lives in GitHub Issues.

Last reviewed: 2026-08-31 · Release: **Codera 1.0** · Production:
`https://www.codera.sk` · Open backlog: see Issues.

---

## What is live

The homepage is one authored journey in five acts — `#top` (/01 Identita) →
`#premena` (/02 Premena) → `#praca` (/03 Práca) → `#sluzby` (/04 Ponuka) →
`#kontakt` (/05 Kontakt) — plus a small footer. Around 9.5 viewports of scroll,
of which three pins account for roughly five: a pinned scene advances in place,
so the visitor experiences four scenes rather than a longer page.

Visual contract: `CODERA_ART_DIRECTION_V2.md` ("Zlievareň"). Experience
contract: `CODERA_STEP5_ARCHITECTURE.md`. Brief: `CODERA_STEP5_DESIGN_BRIEF.md`.

Three rendering tiers, decided after hydration and never exposed to the user:
the WebGL world (desktop), the separately authored mobile experience, and a
designed DOM tier for wide/no-WebGL/reduced-motion visitors — the last is a
designed experience, not a fallback apology.

The most valuable assets in the repository, all reused rather than rebuilt:

- `components/site/previews/*` — Konštrukt, Vitalis, Forma and the 2011-era
  Legacy site as **live markup**, container-query sized, zero image bytes.
- `components/site/enquiry-form.tsx` — validated, accessible, test-covered.
- `lib/site-config.ts` — the only source of business facts. Nothing invented.
- The accessibility floor in `app/globals.css`.

Dependencies went from 23 to 8 during the rebuild.

---

## Architecture decisions

1. **One world, one timeline.** A single persistent canvas and one master
   scrubbed ScrollTrigger; DOM and camera read the same clock.
2. **One geometry.** The parametric mark generator feeds both the SVG assets and
   the 3D sweep — the logo and the cinematic object cannot diverge.
3. **DOM is the floor.** All commercial content is semantic DOM; the canvas is
   enhancement.
4. **GSAP is the only animator.** R3F is a renderer, not a second engine.
5. **Mobile is authored separately** — different structure, different interaction
   language, shared brand and copy.
6. **Monochrome chrome, colour only in the work.**
7. **Previews stay live markup**, never screenshots; photography is composed
   around them.
8. **Nothing about the business is invented.** Concepts stay labelled `Koncept`.
9. **Reduced motion is a layout, not a fallback** — pinned scenes are never
   registered when the preference is set, so nothing can trap the scroll.

---

## Hard-won findings — do not relearn

- **`ScrollTrigger.create()` does not re-measure existing triggers, and
  `refresh()` processes them in creation order.** Without `ScrollTrigger.sort()`
  before `refresh()`, the master pin's 2 880 px of pin distance never reaches
  later starts and those sections pin on top of the world.
- **A pinned trigger re-parents its element into the pin-spacer.** If a
  server-rendered fallback scene creates its pin and is then swapped out by the
  post-hydration tier decision, React unmounts a node whose parent changed →
  `removeChild` crash. `useScene` defers all setup by one rAF so the swap
  decision always lands first.
- **react-hooks v6 immutability:** per-frame mutation must never touch a
  hook-tracked value. Route it through `state.scene.getObjectByName()` in the
  frame callback — the same pattern for mesh rotation, uniforms and lights.
- **shadcn's CSS import** brings 629 lines of accordion keyframes this site does
  not use, and resolving it through the package `exports` map is fragile under
  Turbopack. The CLI is kept out of the app entirely.

---

## Measured

Production build, 1440×900, served uncompressed locally:
LCP 412 ms · CLS 0 · one long task · 660 KB JS · 209 KB fonts · 53 KB CSS ·
81 KB HTML. Brotli in production cuts these to roughly a third.

Mobile at 6× CPU throttle, 390 px: LCP 1 164 ms · CLS 0 · scroll jank 10.3%.
Mobile JS floor ≈ 705 KB raw ≈ 210 KB brotli (framework + Next runtime + GSAP,
which every tier needs). three.js is correctly lazy — the 887 KB world chunk
downloads only on the world tier, after hydration; mobile never sees it.

Tests: 77 passed, 1 skipped across Chromium, Firefox and WebKit. The skip is the
keyboard-walk test on WebKit, which does not tab to links unless the OS
preference is on.

No horizontal overflow and no runtime errors at 320, 375, 390, 768, 1024, 1440
or 1920. Every control is keyboard reachable with a visible focus ring; body and
display text clear 4.5:1 on both grounds.

`layout-shift` entries *are* emitted by ScrollTrigger's pinning, but each falls
within 500 ms of user input and is therefore excluded from real CLS.

---

## Validation status of this release

| Class | Status |
| --- | --- |
| LOCAL | Passed |
| CI | Passed — run `33141177009`, green |
| PREVIEW | Passed |
| DEVICE | **Not validated.** No physical iPhone available to the machine that built this. See `docs/DEVICE_CHECKLIST.md`. |

---

## Where the rest lives

- Step contracts and their gates: `process/STEPS.md`
- How the work is run: `process/CODERA_PROCESS.md`
- Open items: GitHub Issues
- Superseded phase-by-phase history: `docs/archive/`
