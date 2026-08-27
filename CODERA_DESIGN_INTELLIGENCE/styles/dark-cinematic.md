# Dark / Cinematic

**Archetype:** black canvas as a stage — light, color, and content are
scarce resources spent deliberately. Studied exemplars: Linear ("midnight
precision instrument"), SpaceX, Netflix, North Kingdom, Apple's dark acts,
Twingate, Resend.

**Emotional tone:** authority, focus, drama, technical mastery, night.
At its best it feels like mission control or a film title sequence; at its
worst like a gamer peripheral store.

**Typical audience / business fit:** developer tools, infrastructure,
security, aerospace/automotive, entertainment, creative studios showing
motion/3D work, premium hardware staging. Buyers who value precision and
power. Works when the product itself glows (screenshots, renders, film).

**Poor-fit contexts:** healthcare, children, local services, government,
food (appetite dies on black), price-sensitive retail, any audience
reading long text for minutes at a time, brands whose content is scarce —
darkness amplifies emptiness.

**Canvas / background behavior:** near-black, not black: #08090a, #0c0c0c,
#101010, #0e100f (true #000000 is reserved for photography stages, e.g.
Apple/Break Maiden). Surface stack rises in 2–4 steps (#08090a → #0f1011 →
#161718 → #23252a). Full-bleed; gradients only as one atmospheric floor,
never on components.

**Color logic:** monochrome grey ladder for 95% of the UI; ONE electric
accent with a single job (Linear's #e4f222 = the only chromatic action;
Twingate's violet+chartreuse = status LEDs). Supporting accents live only
in tags/badges. Body text never pure white — #d0d6e0-class off-whites;
muted text in the #62666d–#8a8f98 band.

**Typography logic:** tight-tracked sans (Inter/Geist class), weights
capped ~400–590 — no heavy bold; scale does the shouting. Display 48–72px,
lh 1.0, ls -0.022em. Mono for technical metadata only. Serif only if the
brand is cinematic-editorial (A24 class).

**Spacing / density:** section gaps 96px+, element gaps 8–12px, card
padding 24px, max-width 1080–1200px. Low density — one focal point per
screen; darkness needs emptiness to read as cinema.

**Layout / composition:** single-column narrative flow; hero = oversized
left-aligned statement + one product artifact; alternating text/media
bands; no 3+ column grids in the narrative sections. Content floats in
negative space rather than filling it.

**Imagery direction:** the product IS the imagery (screenshots in hairline-
border frames, renders, film stills). Photography high-contrast, dramatic,
often desaturated. No stock, no lifestyle-in-daylight. Logos in neutral
grey strips.

**Component language:** hairline borders (0.5–1px) instead of shadows;
radii small and closed (2–12px); ghost buttons + one filled accent CTA;
pills only for tags. Inputs near-invisible (rgba white 2–8%). Elevation =
surface stepping, never glow (glow is the genre's kitsch trap).

**Motion behavior:** slow, damped, deliberate — camera-like easing, long
fades, parallax restraint. Motion may reveal light (a beam, a highlight
sweep) but the resting state must hold the composition. Fast bouncy
springs break the genre.

**Mobile adaptation:** collapse to single column early; raise text
contrast a step (small light-on-dark text degrades on OLED dimming);
replace heavy WebGL/video staging with stills; keep the accent scarce.
Dark UIs hide fingerprints of bad spacing less — check rhythm explicitly.

**Strengths:** instant drama; product screenshots glow; brand accent gets
maximum contrast; premium-technical positioning; great stage for 3D.

**Failure modes / common mistakes:** monotone gloom across a whole site
(no light relief act); grey-on-grey text below AA contrast; glow/neon
overuse; darkness hiding weak hierarchy; long-form reading on black;
using dark to *seem* premium while content stays thin; every section
same-dark so nothing is dramatic.

**Combination guidance:** strongest as the DARK ACT of an alternating
composition (Apple's dark→dark→light three-act structure) — pair with
light-editorial or warm-editorial relief bands; the contrast is the
dramaturgy. Combines with tech-saas (dark hero → light docs), image-led
(photography carries color), brutalist (shared austerity). Never combine
with pastel-friendly or playful-kids surfaces.
