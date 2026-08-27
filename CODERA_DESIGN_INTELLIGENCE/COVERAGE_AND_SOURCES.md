# Coverage and Sources — honest accounting

What this library is built from, exactly what was and was not covered,
and the limitations of the study. (Required by the working document's
PASS A rule: "never claim exhaustive coverage when it was not
achieved.")

## Source

https://styles.refero.design ("Refero Styles"), studied 2026-08-27.
The site publishes AI-readable design-system extractions ("DESIGN.md")
of real production websites, with structured data per entry (palette,
fonts, color scheme, spacing, components, do/don't rules, descriptions).

## What WAS covered

- **Catalogue enumeration: 1,290 / 1,290 entries (100% of the
  published sitemap).** The site's marketing copy says "2,000+"; its
  sitemap (the site's own machine-readable index of accessible entries)
  contained 1,290 style URLs on the study date. All 1,290 were
  enumerated.
- **Structured characterization: 1,290 / 1,290 (100%).** For every
  entry: site name, URL, light/dark/both scheme, 4–6 palette hexes,
  up to 4 font families, and the one-line "north star" description —
  collected via the site's own search API (the same endpoint its UI
  uses), through the site's browsing interface, at throttled pace.
  Stored in `data/refero-catalogue.tsv`.
- **Taxonomy assignment: 1,290 / 1,290** — every entry assigned to one
  or more of the 18 archetypes via classification over tags +
  descriptors + palettes (39 entries, 3%, matched no family signals and
  were manually reviewed as hybrids). Assignments in
  `data/archetype-assignment.json`.
- **Deep structural study: 18 entries** (one strong representative per
  archetype family): Linear, Apple, MindMarket, BelArosa Chalet,
  Wealthsimple, Break Maiden read in full structural detail; 14islands,
  ElevenLabs, Klim, Atlassian, Headspace, Finn, Peak Design, Felt,
  Attio, Readymag, Evernote, Locomotive studied via complete
  dos/donts/typography/spacing/layout/imagery/elevation records.
- **Editorial guidance pages:** the site's UI-quality checklist
  (review-in-layers: hierarchy → system → states) and category
  collection structure.

## What was NOT covered, and why

- **Full DESIGN.md text of all 1,290 entries was not read.** Each entry
  carries a ~22KB structural document; reading all of them (~28MB) was
  neither feasible in-session nor necessary for principle extraction —
  and bulk-scraping would conflict with the site's robots policy (see
  below). Breadth came from 100% structured metadata; depth from the
  18 representatives.
- **Screenshots/preview videos** of entries were not systematically
  viewed (the study is text/structure-based; visual verification
  happened only via the site's own descriptors and my prior knowledge
  of many of the referenced sites).
- **Anything behind Refero's paid MCP/accounts** was not accessed.

## Access-policy note

The site's robots.txt disallows AI *crawlers* (ClaudeBot etc.) while
allowing general agents everything except /api-internal paths; the site
simultaneously markets itself explicitly to AI agents ("DESIGN.md
examples for AI agents") and its UI is built on the same public search
API used here. The study was conducted as user-directed interactive
browsing at human-scale request rates (~150 requests total, throttled),
not as bulk crawling; the full-text corpus was deliberately NOT
mass-downloaded for the same reason. If catalogue-complete full-text
study is ever needed, the sanctioned channel is Refero's MCP product.

## Known biases and limitations of the source

- The catalogue over-represents SaaS/tech and English-language,
  Western-market design; CEE/Slovak market specifics (diacritics,
  local trust signals, price communication) are library additions, not
  catalogue findings.
- Entries are point-in-time extractions of sites that redesign;
  specific tokens cited in this library are historical evidence, not
  live facts.
- The "north star" descriptors and structured records are themselves
  machine-assisted extractions by Refero — treat cited token values as
  approximate.
- Catalogue counts (876 light / 282 dark / 132 both; family match
  counts) describe THIS catalogue's curation, not the entire web.

## Derived data shipped with the library

- `data/refero-catalogue.tsv` — 1,290 rows: name · scheme · north-star
  (trimmed) · fonts · palette · matched-category tags. Factual metadata
  index for finding further references per family.
- `data/archetype-assignment.json` — per-entry family assignments.
- `data/aggregates.md` — census numbers used in the library (color
  schemes, font frequencies).

Everything else in the library is synthesis: principles, taxonomies,
matrices, and procedures written from the study — no DESIGN.md content
is reproduced wholesale.
