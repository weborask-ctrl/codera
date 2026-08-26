# Codera

The Codera studio website. Slovak content, English code and documentation.

It doubles as our portfolio piece, so the standards it is built to are the
standards it advertises: server-rendered, minimal client JavaScript, WCAG 2.2
AA contrast, keyboard operable, reduced-motion aware, and tested in Chromium,
Gecko and WebKit.

## Stack

Next.js (App Router) · React · TypeScript · Tailwind CSS v4 · shadcn/ui on the
Luma preset · Base UI · Magic UI · Biome · Playwright.

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
app/                    route segments, metadata, sitemap, robots, OG image
components/site/        every section of the homepage, plus shared primitives
components/site/previews/  the concept mini-sites rendered inside device frames
components/ui/          shadcn + Magic UI components (Biome does not lint these)
lib/site-config.ts      nav, contact and legal values — including placeholders
tests/                  Playwright suite
```

### Design system

Tokens live in `app/globals.css`:

- **Colour** — light-first neutrals with one blue accent (`--brand`). Every
  foreground/background pairing clears WCAG AA; `--ink` is the single deep
  chapter surface and stays constant in both themes.
- **Type** — fluid `clamp()` display sizes, fixed 17px/1.55 body at every
  viewport. Tracking tightens as size grows.
- **Spacing** — one container (`.container-page`) and one vertical rhythm
  (`.section-pad`), so no section re-invents its gutters.
- **Motion** — `.reveal` scroll entrances driven by a single shared
  IntersectionObserver, plus one clip-path wipe on the closing headline.
  Everything is disabled under `prefers-reduced-motion`.

### Concept projects

The three showcase projects (Konštrukt, Vitalis, Forma) are **concepts, not
client work**, and are labelled as such on the page and in the footer. They are
real rendered markup inside device frames rather than screenshots, so they stay
sharp at any density and cost no image bytes. Each preview sizes itself in
`cqw` against its frame's CSS container, which is why one component renders
correctly at 1100px in the hero and at 340px in a project card.

## The enquiry form has no backend

`components/site/enquiry-form.tsx` validates on the client and then hands the
composed message to the visitor's own mail client via `mailto:`. It never
claims a message was delivered, because nothing on our side receives one.

To switch to real server-side delivery, replace the `deliver()` function with a
Server Action that posts to a transactional mail provider (Resend, Postmark,
…). The fields, validation, error wiring and status states already match what a
backend would need — nothing else in the component has to change.

## Before launch

Outstanding business information, all marked `TODO(codera)` in
`lib/site-config.ts` and `components/site/site-footer.tsx`:

- the production domain (`siteConfig.url` is currently a placeholder,
  `www.codera.example` — deliberately not a guess at the real `.sk`/`.com`/`.eu`
  domain)
- company registration details, once a trade licence or company exists. The
  footer deliberately publishes none today: `legal.hasRegisteredEntity` is
  `false` and there is no IČO, DIČ, VAT status or registered office anywhere on
  the site, because inventing them would be a legal problem rather than a
  cosmetic gap.

### Mark

`components/site/logo.tsx` (the wordmark), `app/icon.svg` (the favicon) and
`components/site/codera-motif.tsx` (the small recurring `Chevron`/`IndexMark`
motif and the process timeline's track) share one idea: an open geometric
ring — a "C", built from an SVG arc rather than a font glyph — for the logo,
and a forward-pointing chevron for everything that repeats. Neither borrows
its shape from the studio's earlier name, whose mark was a literal stylised
"W".

Real client work, testimonials and measured results are likewise absent by
design. `components/site/projects.tsx` types each entry with a `kind` of
`concept` or `case-study`, so a real case study can join the array and render
alongside the concepts without touching the layout.
