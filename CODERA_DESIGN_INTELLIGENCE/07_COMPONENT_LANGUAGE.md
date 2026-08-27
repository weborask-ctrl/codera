# 07 — Component Language

How quality systems speak through components: buttons, navigation,
cards, forms, metadata, commerce and trust elements. The recurring law:
components derive identity from TYPE + RADIUS + BORDER, almost never
from gradients, shadows, or icon noise.

---

## 1. Radius as dialect (the fastest identity decision)

| Radius vocabulary | Reads as | Proof |
| --- | --- | --- |
| 0px only | gallery / brutalist / industrial | Break Maiden, Locomotive, Klim (2px near-sharp) |
| 4–12px closed set | engineered tool | Linear (6/12), Attio (7/10/12), Peak Design (4/8) |
| 16–28px + pills | friendly premium consumer | Apple (28), Atlassian (20/28), Headspace (16 + 800px pills) |
| 50px+ everything | sticker-soft playful | MindMarket (50/63.75), Wealthsimple (100 cards/1600 pills) |

Rules: 2–4 values total; write them down; mixing dialects in one system
is a named "don't" in multiple studies ("do not use border-radius values
outside the defined set").

## 2. Button hierarchy (three tiers, one loud voice)

- **Primary:** exactly one treatment, exactly one color, ideally once
  per viewport. Variants seen: filled accent (Linear lime, Apple blue),
  filled dark neutral (Wealthsimple charcoal pill, ElevenLabs black),
  outlined ghost as primary (BelArosa — the luxury inversion: "never
  create filled colored buttons").
- **Secondary:** ghost/outline in ink; never a second color.
- **Tertiary:** text link with arrow/underline affordance.
- Label craft: tracked utility face (Wealthsimple Sans +0.025em),
  uppercase tracked for luxury/commerce (0.125–0.167em), arrow glyph as
  part of the label (Finn's "never render a CTA without a trailing →").
- One CTA concept per site: same label, same destination, everywhere.

## 3. Navigation components

- Nav is typographic: text links 13–16px, weight 400–500, generous
  hit-areas; the CTA pill is the only loud element.
- Sticky = translucent + blur (desktop) / solid (mobile); border appears
  on scroll, not at rest.
- Menu overlays: full-screen for editorial/immersive (with tab-order and
  focus-trap discipline), dropdown panels for SaaS density; mega-menu
  only when the IA truly needs it.
- Eyebrow/sub-nav rows for deep content sites (BelArosa's category row).

## 4. Cards

- The quality move is LESS card: borderless content separated by
  whitespace (Peak Design: "separate with 24px+ whitespace, not with
  containers"); the image IS the card in editorial/commerce families.
- When chrome is needed: 1px hairline OR surface shift (white on cream,
  carbon on void) — never both plus shadow.
- Padding: 24px standard, 32–48px premium/consumer. Radius per dialect
  (§1).
- Product-screenshot frames: hairline inset border, no outer glow
  (Linear's inset rgb(35,37,42) 0 0 0 1px).

## 5. Forms & inputs

- Visible labels above fields (placeholder-only labeling is an
  anti-pattern everywhere); generous 12–16px vertical padding; radius
  follows the dialect.
- Focus states: border brightening or ring — visible, unambiguous, no
  glow theatrics. Error states specific and kind ("phrased kindly" in
  health; never shouting red walls).
- Luxury/hospitality: forms are concierge conversations — fewer fields,
  bigger type. Health: one question per step. SaaS: inline validation.
- The enquiry form is a TRUST component: what happens next, response
  time, and human contact belong next to the submit.

## 6. Metadata & micro-labels

The most underused quality lever: uppercase tracked eyebrows (CUISINE,
PHILOSOPHY / 0.125–0.167em), stamped micro-labels (0.3em Monosten
class), issue-ID mono chips (Berkeley Mono ENG-2703), floating
plan-position captions. These carry "art direction" at near-zero cost
and structure content without boxes.

## 7. Tags, badges, pills

- Quiet fills (rgba white 5%, pastel chips with dark ink), radius per
  dialect (4px badges in tool systems, 9999px pills in friendly ones).
- Color-coded ONLY with a legend/role (status, category); decorative
  accent colors are barred from semantic duty.
- Trust badges (certifications, security) rendered quiet and grouped —
  never as loud stickers.

## 8. Commerce elements

- Product cards: uniform crops, name weight 600–700, honest tabular
  prices; badge pollution (sale-on-everything) destroys trust.
- Buy box: ONE loud CTA + ghost price/secondary; sticky add-to-cart on
  mobile; variant selectors big and visual.
- Filters: pill chips in a scrollable row (desktop) / bottom sheet
  (mobile).
- Booking (hospitality): style the widget to the brand — a raw
  third-party iframe mid-page is a named failure.

## 9. Trust elements

- Logo strips: uniform grayscale, evenly spaced, no card chrome
  (Linear's #8a8f98 strip).
- Testimonials: serif pull-quote moments ("earned by rarity" — Attio's
  TiemposText) with real names/faces.
- Numbers: tabular, sourced, few. Credentials near the conversion
  point. Legal/registration data accurate or absent — never invented.

## 10. Component QA checklist

Every component ships with: hover, focus-visible, active, disabled,
loading, error, empty, long-content, and RTL/diacritics-safe states;
44px+ touch targets; contrast in both modes; reduced-motion parity for
any animated state. A component library missing states is a mockup, not
a system.
