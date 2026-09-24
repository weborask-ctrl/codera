# Simple typography and tunnel fade — 2026-09-24

Marcus requested a simpler, unified typographic voice inspired by coca-cola.com
and explicitly authorized merge. TCCC Unity is bespoke to Coca-Cola; no public
web licence was identified. Following the proposed alternative and the renewed
instruction to proceed, this release uses **Montserrat**, not TCCC Unity.

## Typography

- Montserrat is limited to h1/h2/h3 headings. Geist is restored for body copy,
  controls, numbers and card content with their original sizes and spacing. All headline lines share weight 700 and
  normal style; emphasis no longer changes weight or letter spacing.
- Hero size is roughly 107px at 1440×900, compared with 153px previously.
  Section titles are roughly 69px, with 1.12 line height and -0.025em tracking.
  Responsive sizes preserve readable, prominent headings on narrow screens.
- Content, 499/699 prices, aligned offer rows, the time group, complete preview
  images, neutral glass and existing shape language are preserved. The separate
  approved SVG wordmark is unchanged. Narrow-screen prices fit their cards.
- Montserrat is an **implemented candidate awaiting Marcus's visual evaluation**,
  not yet a permanent font rule for every Codera project. Confirm it in the
  bible only after that evaluation. The standing direction is simplicity and
  consistency, not imitation of another brand's proprietary assets.

The WOFF2 contains weights 400–700, Latin and Central European characters,
punctuation, euros and UI arrows; 60,752 bytes. Source: Google Fonts Montserrat,
SIL OFL 1.1, bundled in app/fonts/Montserrat-OFL.txt and served with the font.
Generator: scripts/build-silver-font.mjs. Source TTF SHA-256:
`0f7b311b2f3279e4eef9b2f968bcdbab6e28f4daeb1f049f4f278a902bcd82f7`.

References:
- https://www.brody-associates.com/work/tccc-unity
- https://github.com/google/fonts/tree/main/ofl/montserrat

## Fade before the tunnel

The source abruptly changes viewpoint at approximately 6 seconds of the
original film. The previous 22% warm overlay peaked after that change. A warm
shadow now fades in before it (progress 0.33–0.407), holds opaque through 0.425,
then reveals the tunnel by 0.55. Opacity follows the decoded media frame, so
it reverses with native scrolling and remains aligned during slow seeks.
The fade affects only the film; text stays sharp. No new video encoding,
resolution reduction, additional decoder or pointer motion.

Validation includes targeted forward/reverse cut coverage, viewport text and
price bounds, complete preview frames, centered time group, expanded pricing
alignment, production build and the existing production motion/recovery suite.
