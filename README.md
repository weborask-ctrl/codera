# Codera

The Codera studio website. Slovak content, English code and documentation.

It doubles as our portfolio piece, so the standards it is built to are the
standards it advertises: server-rendered, minimal client JavaScript, WCAG 2.2
AA contrast, keyboard operable, reduced-motion aware, readable with scripting
off, and tested in Chromium, Gecko and WebKit.

## Stack

Next.js (App Router) · React · TypeScript · Tailwind CSS v4 · Base UI ·
GSAP + ScrollTrigger · React Bits (vendored and rewritten) · Biome · Playwright.

Nine runtime dependencies. Anything that was not used got removed rather than
left installed.

## Commands

```bash
npm run dev
```

```bash
npm run check
```

```bash
npm run build
```

```bash
npm run test:e2e
```

`test:e2e` builds the app and serves it with `next start` on port 3100, then
runs the suite against that production build — not against `next dev`. Two
reasons: it is the artefact users actually receive, and the dev server watches
the repository root, so files Playwright writes while the suite runs would
retrigger compilation and truncate in-flight RSC streams.

## Structure

```
app/                       route segments, metadata, sitemap, robots, OG image
components/site/           one file per scene, plus the mark and shared bits
components/site/previews/  the concept mini-sites, as live markup
components/react-bits/     vendored React Bits primitives (all rewritten)
components/ui/button.tsx   the one primitive kept from the scaffold
hooks/use-scene.ts         scene registration, scoped cleanup, reduced motion
lib/motion.ts              the single GSAP + ScrollTrigger registration
lib/site-config.ts         nav, contact and legal values — incl. placeholders
tests/                     Playwright suite
```

## The page

Four scenes, five sections, one continuous environment:

| Section    | Scene                                                        |
| ---------- | ------------------------------------------------------------ |
| `#top`     | Identity — the mark opens and frames a live concept          |
| `#premena` | Transformation — a dated site becomes a Codera one           |
| `#praca`   | Work — one pinned stage, three projects, the ground morphs   |
| `#sluzby`  | Offer — three words, one lit at a time on the width axis     |
| `#kontakt` | Conversion — why, price, the closing mark, the form          |

### The mark is the motion language

`components/site/arc.tsx` owns the geometry once: an open C, centre (12,12),
radius 9, with a 90° gap. Everything else derives from it — the nav hover
underline, the index ticks, the rule under the active service word, the handle
that drags the before/after comparison, and the mark that closes at the end of
the page. `app/icon.svg` and the OG image use the same path.

The gap is the idea. An unfinished circle, closed as you reach the end.

### Design system

Tokens live in `app/globals.css`.

- **Colour.** Dark-first: `:root` is the graphite ground. Light chapters are a
  scoped `[data-chapter="paper"]` token override, not a user theme — the
  rhythm belongs to the scene. The chapter also sets `color`, because CSS
  `color` inherits as a *computed* value and re-pointing `--foreground` alone
  would only reach elements that set a colour of their own.
  Codera's chrome is monochrome; saturated colour belongs to the *work*.
- **Type.** Archivo, variable on weight and **width**. The width axis is not
  decoration: the offer scene expands and compresses its words on it, which is
  something no static face can do without distorting letterforms. Geist Mono
  appears at exactly one size, for micro-labels.
- **Motion.** One engine. GSAP and ScrollTrigger, registered once in
  `lib/motion.ts`. No smooth-scroll library — the choreography reads the real
  scroll position and never takes it over.
- **Spacing.** One container (`.container-page`), one rhythm (`.section-pad`).

### Reduced motion is a layout, not a fallback

`useScene` never registers a timeline when `prefers-reduced-motion` is set — no
pinning, no scrubbing, nothing to fail. The scenes have to be readable in that
state, so the DOM's resting state *is* the finished state and motion only ever
animates towards what is already there. The same property makes the page work
with scripting off, and both are covered by tests.

### React Bits

Four primitives are vendored in `components/react-bits/`, and all four were
rewritten rather than configured. The reasons are recorded per file and in
`REDESIGN_PROGRESS.md` — the short version is that `Magnet` re-rendered React
on every mousemove, `ScrollReveal`'s cleanup killed every ScrollTrigger on the
page, `GlareHover` put mouse handlers on a static div, and `CountUp` shipped an
empty span to anything that did not run its effect.

### Concept projects

The three showcase projects (Konštrukt, Vitalis, Forma) are **concepts, not
client work**, and are labelled as such on the page and in the footer. They are
real rendered markup rather than screenshots, so they stay sharp at any density
and cost no image bytes. Each preview sizes itself in `cqw` against its CSS
container, which is why one component renders correctly full-bleed on the work
stage and at 160px inside the hero's phone frame.

## The enquiry form has no backend

`components/site/enquiry-form.tsx` validates on the client and then hands the
composed message to the visitor's own mail client via `mailto:`. It never
claims a message was delivered, because nothing on our side receives one.

To switch to real server-side delivery, replace the `deliver()` function with a
Server Action that posts to a transactional mail provider (Resend, Postmark,
…). The fields, validation, error wiring and status states already match what a
backend would need — nothing else in the component has to change.

## Before launch

The site is live at **https://www.codera.sk**. Vercel holds `www` as the
primary host and 308s the apex onto it, which is why `siteConfig.url` is the
`www` form — a canonical must never name a URL that only redirects.

Outstanding business information, marked `TODO(codera)` in
`components/site/site-footer.tsx`:

- company registration details, once a trade licence or company exists. The
  footer publishes none today: `legal.hasRegisteredEntity` is `false` and there
  is no IČO, DIČ, VAT status or registered office anywhere on the site, because
  inventing them would be a legal problem rather than a cosmetic gap.

Real client work, testimonials and measured results are likewise absent by
design — there are none yet, and the site says so.
