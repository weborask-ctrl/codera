# 06 — Layout Systems

Composition and page-architecture patterns across the catalogue: what
structures exist, what each communicates, and when to use which.

---

## 1. The page-model decision (before any section design)

| Model | Description | Communicates | Proof |
| --- | --- | --- | --- |
| Contained | max-width 1200–1440px centered, full-bleed background bands | product confidence, order | Linear (1200), Wealthsimple, Attio (1440), Atlassian |
| Full-bleed editorial | no container; type and images touch edges | gallery, statement | 14islands, Locomotive, Klim, Break Maiden |
| Band-stacked | full-width color/mood bands as "rooms" | narrative, rhythm | Apple, BelArosa, Felt, Finn |
| Hybrid | contained content + full-bleed act-break bands | the practical default | most quality SaaS/commerce |

Max-width census from studies: 1200px is the modal choice; 1280–1440px
for image/product-heavy; none for editorial statements.

## 2. Section rhythm = the page's dramaturgy

- Sections are ACTS: each makes one point, with one dominant element
  ("one subject per viewport" — Apple; "single focal point per screen" —
  Linear).
- Rhythm devices, in order of strength: color-mode flip (dark↔light) >
  canvas tint shift (cream↔taupe) > full-bleed image band > hairline
  rule > pure whitespace. Pick ONE as the page's main divider grammar.
- Macro gaps 64–160px; the JUMP between macro and micro spacing (8–24px)
  creates the perceived composition. Uniform 40px everywhere = template.
- Alternation patterns that work: text-left/media-right flipping per
  section (Linear); dark→dark→light three-act (Apple); band color
  rotation with a white shell (Readymag, Finn).

## 3. Hero grammars (the seven that recur)

1. **Statement hero** — oversized headline + small support text,
   asymmetric (Break Maiden 153px left / paragraph right).
2. **Product stage** — centered artifact on dark, text bottom-left
   (Apple).
3. **Centered stack** — eyebrow → headline → sub → CTAs → screenshot
   card (Attio, Evernote; the SaaS standard).
4. **Split 50/50** — text block / full-bleed image (Peak Design, Finn,
   BelArosa's cuisine sections).
5. **Full-bleed image** — 100vh photography, floating nav, caption
   corner (Locomotive).
6. **Wall of work** — masonry of projects edge-to-edge (Readymag).
7. **Band hero** — deep color field + centered serif + flanking insets
   (BelArosa, Felt).

The hero must answer "what is this and why should I care" in the FIRST
viewport — commercial clarity outranks composition in every commercial
context.

## 4. Grid discipline

- Case studies/portfolio: PAIRS (2-col), "never a 3+ column matrix"
  (14islands); irregular 3-col magazine-cut only for gallery contexts
  (Break Maiden's deliberately uneven columns).
- Product commerce: uniform 3–4-col grids, identical crops, 24–32px
  gutters — uniformity is the luxury there.
- Feature rows: 3-col with top hairline rules, no card chrome
  (Wealthsimple's "the hairline at the top is the only chrome").
- Asymmetry is designed: offsets follow a consistent rule (same offset
  axis per row), never random placement.

## 5. Density zoning

Quality pages zone density instead of averaging it: breathe OUTSIDE
(sections, margins), dense INSIDE (cards, tables, product frames).
Editorial families ban density on the raw canvas — data goes into framed
light panels (Felt's map panels on moss). Utility contexts (pricing,
specs, menus) get their own denser rhythm and are set like print cards.

## 6. Composition devices worth stealing

- Floating metadata at plan-positions around a centered image
  (museum-catalogue framing — Locomotive).
- Eyebrow → headline → body → CTA as the atomic editorial cell
  (BelArosa, Wealthsimple, Apple all run it).
- Elements crossing band boundaries (illustration bleeding from hero
  into next section — MindMarket) to stitch acts together.
- The white-shell principle: loud blocks separated by quiet ground so
  each lands (Readymag).
- One full-bleed act-break per page minimum on long pages — endless
  contained sections read as a template.

## 7. Navigation models

- Thin typographic top bar (editorial/gallery families).
- Contained bar with pill CTA (SaaS standard; Linear/Attio).
- Floating pill bar over canvas (MindMarket's white pill; friendly
  brands).
- Pill-radius full-width bar (Apple's 980px signature).
- Sticky behavior: translucent+blur on scroll is the premium default;
  solid on mobile (backdrop-filter cost). Sub-nav rows for deep sites
  (BelArosa's category row).

## 8. Footer

The catalogue's footers are either: dense link directories on the brand
canvas (SaaS/corporate), giant wordmark statements (editorial/brutalist
— the footer AS final act), or warm closing bands in an accent
(MindMarket's yellow). The footer is the page's last act — design it as
one, not as a dumping ground.

## 9. Scroll economy

A page earns its length by CHANGE per viewport: every ~100vh of scroll
must deliver a new act, new mode, or new information class. If two
consecutive viewports feel the same, cut or merge. Pinned/scrub
sequences borrow scroll — they must repay it with change (see
08_MOTION_AND_SPATIAL_DESIGN). "The user should experience more while
scrolling less."
