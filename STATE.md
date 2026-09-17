# Codera — current state

What is live, what was decided, and what must not be relearned. One file, kept
short. Open work does **not** live here — it lives in GitHub Issues.

Last reviewed: 2026-09-17 (isolated jellyfish workstation pass; production Iterácia 4.11 unchanged) · Production: `https://www.codera.sk` ·
Open backlog: see Issues.

---

## What is live

### Isolated jellyfish experiment (Marcus, 2026-09-16)

Marcus authorized a lightweight scroll-controlled spatial prototype after rejecting generated per-section images as a motion solution. Work is in `experiments/jellyfish`, launched with `node scripts/jellyfish-preview.mjs` without a full npm install; it does not replace the production homepage. One procedural jellyfish, camera near/far/orbit changes, changing spaces, and a normal-scroll portfolio block with all five concepts. No animation between individual examples. The autonomous 2026-09-17 workstation pass adds smoother bounded camera travel, an oblique bell passage, conservative pearl shading, renderer disposal/restart, resilient static content and repeatable browser checks. Existing low-PC budgets and final page layout remain; small numbered labels are still deferred to final refinement. Next/ESLint 16.3.5 is a working-branch security patch, not a production release. Earlier generated images remain style studies, not motion frames; no new media was generated. Cinematic approval and one final-quality hero-to-portfolio production segment remain pending. Read `docs/JELLYFISH_HANDOFF_2026-09-17.md` for final validation/push evidence and home-PC continuation, and `docs/JELLYFISH_PRODUCTION_METHOD_2026-09-17.md` for the first asset experiment.

**Homepage — „Codera City" (Iterácia 2.0, 2026-09-05).** Ondrej approved a
static concept, then the build: one continuous 5D world — a pastel floating
city at dawn (/01) → the street of demo facades at noon (/02, a sticky walk
past five complete production screenshots) → glass platforms at golden hour
(/03 services + packages) → a dusk skyway with three stations (/04 process:
24 h · 72 h · 0 €) → the night landing hall (/05 contact). On ≥1024px with
motion allowed the world is a fixed stage (`components/city/stage.tsx`): the
seams between acts scrub Seedance camera flights rendered as 32-frame WebP
strips (`public/home/flight`), clouds sweep the seams, the hero and the night
hall are seamless video loops. Since 3.7/4.2 the seams are cloud passages
in depth: four alpha plates (far cluster, two mid, a near tower cut from a
4K render) come toward the camera and part, a haze and a bloom of the hour
carry the middle, the camera banks ~1.3°, every scene keeps its own act
drift across the seam (no scale pop), and the arriving scene is composited
a beat early. Seams are 90 svh (4.4; 150 svh made the passages 43 % of
the scroll). Since 4.5 the four seams are four different beats in the same
world (`PASSAGE_KIND` in the stage): t1 the arrival through clouds (three
plates since 4.6, the street plate resident from the first frame), t2 a
12 % camera pan with a dissolve (4.6: two plates butted side by side showed
their junction — a horizontal bar cannot hide a vertical edge; 4.10: the
glass sky-bridge that crossed in front went — Ondrej: "prechod s tou čiarou
nechcem"), t3 a pane of city glass growing past the camera, t4 the hour
turning with the camera still. The flat edition dresses its veil with the
same four. 4.10 put t1 on a GPU diet after "ešte to seká" in Chrome: idle
plates are parked as a dot (composited, filling nothing) instead of blended
at 0.001, the unused bank plate is gone, 2× cloud files only from 1600 px,
the hero's drifting clouds and blend-mode glint thin out over the first
fifth of the passage, the arriving still is held at 0.002 through the
passage (its texture used to drop and re-upload mid-move), the hero is held
only on the way back, haze and bloom are exactly 0 outside their bells, and
a page whose sentinel trips (a quarter of frames over 34 ms) runs t1 as
the plate-free light passage — decided at the seam, never mid-move. Touch
screens promote no live-city groups and draw no glint. The flat edit's
passage is its own choreography since 4.11 (`PASSAGE_CLOUDS_FLAT`): a
plate that covers the camera shows its magnified interior, and with no
scene swap to hide there is no white-out to cover it — on a 13" iPad it
read as a glowing blur — so the tower rises beside the camera and the
cluster drifts above, the haze and bloom run at 0.62 / 0.55 of the
stage's, the plates carry no filter, 2× files come from 768 px, and the
act plates' cloud band is an alpha cutout composited normally (it was a 13
KB opaque render screen-blended). /04 runs full width with 1.4× stations. Under 1024px or reduced motion every act carries
its own plate of the same world with a cloud band. Type: Bricolage Grotesque
800 + Fraunces italic accent; palette ink #0b1a4a, coral, tangerine, mint.
Fonts are self-hosted and subsetted since 4.7 (`app/fonts`, built by
`npm run fonts`): 197 KB in five files on the homepage instead of 390 KB in
ten, same outlines, Fraunces with its optical-size axis kept. Since 4.8
every page renders per request behind a nonce Content Security Policy
(`proxy.ts`, functions in fra1): +50 ms of first byte warm, a quarter second
cold, for a policy under which only our own scripts run.
References: activetheory, lusion, zentry, refokus. The Žiara acts, the R3F
world and `ACT_TONES` were removed with it — git remembers.

**Concept demos:** Observatórium (Animácie & 3D), Kancelária (Dizajn),
Pražiareň (Objednávky), Štúdio (Rezervácie), WordPress. Since Iterácia 4.0
(2026-09-12) two of them are working systems, not gestures: Štúdio books
for real in the browser (sheet → card checks or pay at the studio →
confirmation, .ics and Google Calendar that work, e-mail/SMS previews,
cancellation that frees the seat, a waitlist, the owner view with CSV;
`components/concepts/vlna-booking.tsx`), and WordPress is a real editor
(content, look, sections, dishes, posts, a WooCommerce cart, language,
publish with revisions, phone preview, click-to-edit, persistence, an
EN version of the whole site pre-filled by a bakery dictionary and editable
by hand (`wordpress-translate.ts`, Iterácia 4.1);
`components/concepts/wordpress-editor.tsx`) whose close keeps the visitor's
own site alive, and whose hero edits the bakery site by itself (ghost
cursor + editor card, six steps, then hands over; `wordpress-hero-demo.tsx`,
Iterácia 4.2). Each demo is its own chunk (`demo-switch.tsx`).

**Audit and remediation (2026-09-14).** `docs/AUDIT_2026-09-14.md` is the
live diagnostic pass after 4.2; Iterácia 4.3 closed its whole REBUILD list
(issues #80–#88): phone seams never cover act copy, the WordPress close is
composed for phones, /03 type passes contrast, demos are a third of their
weight on phones, dev routes are noindexed, the Žiara case studies
(`/praca/*`) are retired with redirects, touch targets are 44 px, the two
founders are named in the contact hall. **The enquiry form delivers
server-side through `app/actions/enquiry.ts` once `RESEND_API_KEY` is set
in Vercel; until then it falls back to the visitor's mail client and says
so.** Seams shortened in 4.4; `docs/PASSAGES_PROPOSAL_2026-09-14.md` holds
ten passages beyond clouds; Ondrej picked the recommended set and 4.5 built it. The demos themselves stay client-side and say so; guarded by
`tests/demos.spec.ts`.

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
the ribbon closes). Its three case-study pages (`/praca/*`) were retired on
2026-09-14 and redirect to the demos.

**Type system:** Geist Sans (light weights carry display) + Geist Mono (the
engineering voice: coordinates, annotations). Fraunces loads only for the
concept worlds' interior serif. Archivo retired with v2.

**The offer (reset 2026-09-07):** Vizitka od 700 € · Firemný web od 1 200 € ·
5D web od 2 500 € · Úpravy WordPressu (cena podľa rozsahu), declared once in
`lib/site-config.ts` (`packages`, `wordpressService`) and consumed by
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
2. **The mark is measured, not imagined.** Since 4.9 the SVGs come from an
   outline measured off the approved raster (`scripts/mark-outline.mjs`,
   silhouette overlap 0.972, `npm run brand:compare`). The parametric sweep
   that once fed both SVG and GLB matched at 0.741 and now feeds only the
   `/logo-lab` GLB; if the ribbon returns to the site, re-derive it from the
   outline first.
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
- **A Server Component that dynamically imports Client Components is not
  code split** (Next 16 docs) — the switch that picks a demo must itself be
  a Client Component, or every demo ships every other demo.
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
