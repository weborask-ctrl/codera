# Codera — current state

What is live, what was decided, and what must not be relearned. One file, kept
short. Open work does **not** live here — it lives in GitHub Issues.

Last reviewed: 2026-09-05 (Codera City) · Production: `https://www.codera.sk` ·
Open backlog: see Issues.

---

## What is live

**Homepage — „Codera City" (Iterácia 2.0, 2026-09-05).** Ondrej approved a
static concept, then the build: one continuous 5D world — a pastel floating
city at dawn (/01) → the street of demo facades at noon (/02, a sticky walk
past five complete production screenshots) → glass platforms at golden hour
(/03 services + packages) → a dusk skyway with three stations (/04 process:
24 h · 72 h · 0 €) → the night landing hall (/05 contact). On ≥1024px with
motion allowed the world is a fixed stage (`components/city/stage.tsx`): the
seams between acts scrub Seedance camera flights rendered as 32-frame WebP
strips (`public/home/flight`), clouds sweep the seams, the hero and the night
hall are seamless video loops. Under 1024px or reduced motion every act carries
its own plate of the same world with a cloud band. Type: Bricolage Grotesque
800 + Fraunces italic accent; palette ink #0b1a4a, coral, tangerine, mint.
References: activetheory, lusion, zentry, refokus. The Žiara acts, the R3F
world and `ACT_TONES` were removed with it — git remembers.

**Concept demos (unchanged by 2.0):** Observatórium (Animácie & 3D),
Kancelária (Dizajn), Pražiareň (Objednávky), Štúdio (Rezervácie), WordPress.

---

### Previous line — Art Direction v3 „Žiara" (retired from the homepage 2026-09-05)

**Art Direction v3 — „Žiara"** (`CODERA_ART_DIRECTION_V3.md`), derived from the
calibrated reference library (`CODERA_DESIGN_REFERENCES/`, six LIKED records).
One graphite-to-frost atmosphere; the titanium ribbon C is the single lit
object; the /01→/05 journey is one sunrise — tones only ever brighten
(`ACT_TONES` in `components/experience/stage.ts`). Obsidian shards (Ondrej's
idea, AD v3 §Obsidián) drift in the fog as the third element: raw matter that
thins as the light rises.

The homepage is five acts — /01 Identita (dark fog, lit C, shards) ·
/02 Premena (Bilanc before/after, frost seam) · /03 Práca (three concept
worlds) · /04 Ponuka (process + three packages) · /05 Kontakt (ink on frost,
the ribbon closes). Plus three **case-study pages** (`/praca/meridian`,
`/praca/statut`, `/praca/vlna`) — documents, no canvas, readable without JS.

**Type system:** Geist Sans (light weights carry display) + Geist Mono (the
engineering voice: coordinates, annotations). Fraunces loads only for the
concept worlds' interior serif. Archivo retired with v2.

**The offer:** Vizitka od 1 000 € · Firemný web od 1 800 € · 5D web od
3 200 €, declared once in `lib/site-config.ts` (`packages`) and consumed by
the /04 act, the structured data and the tests — drift fails CI.

**The concept worlds:** Meridián (roastery — buy) · Štatút (law practice —
enquire) · Vlna (wellness — book). Each owns its interior palette; the shell
is monochrome frost. All labelled `UKÁŽKOVÝ KONCEPT`, enforced by tests.

The v2 experience (components/world, components/mobile, v2 scenes, retired
previews, /textures) was deleted 2026-08-31 — git remembers.

---

## Architecture decisions

1. **One atmosphere, one sunrise.** Acts differ only in camera and light;
   no act returns to dark. The five-moods failure is structurally impossible.
2. **One geometry.** The parametric mark generator feeds both the SVG assets
   and the GLB — the logo and the cinematic object cannot diverge.
3. **DOM is the floor.** All commercial content is semantic DOM; the canvas is
   enhancement. Flat mode (SSR default, mobile, no-WebGL, reduced motion) is a
   designed experience.
4. **Native scroll, zero pins, no smoothing layer.** The world interpolates;
   input never lags.
5. **Monochrome shell, colour only in the work.** Zero chromatic accent in the
   chrome; each concept world owns its palette, bounded to its frame.
6. **Nothing about the business is invented.** `lib/site-config.ts` is the
   only source of business facts; concepts stay labelled everywhere.
7. **Reduced motion is a layout.** Shards freeze into a composed still; the
   fog stops breathing; nothing disappears.
8. **No visual design without cited references** (CLAUDE.md rule 8) — the
   direction cites LIKED records; invented-from-principles was tried and
   rejected as AI-looking.

---

## Hard-won findings — do not relearn

- **react-hooks v6 immutability:** per-frame mutation never touches
  hook-tracked values. Everything routes through
  `state.scene.getObjectByName()` + `userData` in the frame loop.
- **Slovak low-9 quotes („) paired with straight closers (") terminate JS
  strings.** Use „…“ pairs in Slovak copy inside code.
- **Biome reads `//` in JSX text as a suspicious comment** — wrap engineering
  annotations as string expressions.
- **A compact world is a ~490 px card on a 768 px viewport** — viewport-gated
  (`md:`) chrome inside container-sized components lets elements in that then
  collide. Gate on `compact`, not on the viewport.
- **The element screenshot of a section over a fixed WebGL canvas composites
  black** — capture the viewport, not the element, when the world is behind.
- **shadcn's CSS import** brings unused keyframes and resolves fragilely under
  Turbopack; kept out of the app entirely.

---

## Measured — production build, 2026-08-31 (Žiara, post-cleanup)

Desktop 1440×900, world mode: frame median **16.9 ms** (vsync floor), jank
**0.5 %**; at 4× CPU throttle median 16.6 ms, p95 28.6 ms, jank 4.6 % — the
obsidian shards cost nothing measurable.

Mobile 390 px @ 6× CPU: **LCP 1 804 ms** (< 2.5 s budget; up from v2's
1 164 ms — the LCP element is the hero mark SVG, worth a look if it climbs
further) · **CLS 0**.

Payload, desktop world, uncompressed: JS 1 702 KB (three.js world chunk
included, lazy) · fonts **206 KB** across six files (three families ×
latin/latin-ext; Archivo's exit was offset by Geist's subsets — issue #5 stays
open with these numbers) · CSS 77 KB · GLB 706 KB · HTML 129 KB.

Tests: **26/26** chromium (two known singleton flakes under full parallel load
pass in isolation and with 2 workers).

---

## Validation status — Žiara release line

| Class | Status |
| --- | --- |
| LOCAL | Passed (verify + suite, this file's numbers) |
| CI | Passed — every slice merged green through PRs #14–#18 |
| PREVIEW | Spot-checked per PR on Vercel previews |
| DEVICE | **Not validated.** `docs/DEVICE_CHECKLIST.md` waits for a physical iPhone — issue #2, the release blocker |

---

## Where the rest lives

- Step contracts and their gates: `process/STEPS.md`
- How the work is run: `process/CODERA_PROCESS.md`
- The direction: `CODERA_ART_DIRECTION_V3.md` · references:
  `CODERA_DESIGN_REFERENCES/`
- Asset provenance: `SOURCES.md`
- Open items: GitHub Issues
- Superseded history: `docs/archive/` (v2 direction included)
