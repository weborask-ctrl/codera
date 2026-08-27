# 09 — Mobile Design

How composition CHANGES on mobile rather than merely shrinking —
the recurring patterns across the catalogue plus hard-won platform
constraints.

---

## 1. The core principle: re-direction, not reduction

Mobile is a different medium: portrait, thumb-driven, glanceable,
hardware-diverse. Every studied family has a mobile GRAMMAR of its own:

- Editorial: display type clamps (180→44–64px) but keeps its dominance
  ratio; pairs become stacks; full-bleed stays full-bleed.
- Commerce: 2-col grids, sticky add-to-cart, filters in bottom sheets,
  galleries swipeable.
- Luxury/hospitality: the SLOW RHYTHM survives (do not compress gaps
  below ~48px); booking one-thumb; photography art-directed for 4:5.
- SaaS: screenshots re-cropped for mobile (a desktop dashboard at 350px
  is illegible — crop to the relevant panel).
- Spatial/cinematic: pins and scroll-scrub DO NOT TRANSLATE — mobile
  gets a swipe-native, unpinned re-direction of the same story, not a
  scaled-down desktop choreography.

## 2. Touch mechanics (non-negotiable)

- Targets ≥44×44px with 8px+ separation; primary actions in the thumb
  zone (bottom half); destructive actions OUT of it.
- No hover-dependent information anywhere — every hover affordance has
  a tap/scroll equivalent.
- Distinct input modes tested separately: tap, swipe, momentum scroll,
  long-press; scroll-snapping gentle (proximity over mandatory where
  content varies).
- Fixed bars: ONE top + at most one bottom; combined ≤ ~25% viewport;
  respect safe-area insets.

## 3. Navigation on mobile

- The menu must be boringly reliable: open, close, tap-outside, target
  activation, scroll-lock, orientation change, focus return — all
  tested as TOUCH interactions, not as a resized desktop viewport.
- Solid backgrounds over backdrop-filter (blur is a jank source on
  mid-range hardware); simple slide/fade; links big and separated.
- Tap-to-call/tap-to-email as first-class actions for service brands.

## 4. Typography & spacing adaptation

- Body NEVER below 16px (also prevents iOS zoom-on-focus); line-height
  may loosen slightly; measures 45–65ch.
- Display clamps via fluid type (clamp()) with the tracking curve
  re-checked at the clamped size — tracking tuned for 140px is wrong at
  48px.
- Section gaps compress proportionally (roughly half of desktop) but
  the macro/micro JUMP must survive — rhythm is the thing to preserve.
- Slovak/CEE: longer words break sooner — test real copy, allow
  hyphenation on narrow columns, never let a hero headline overflow.

## 5. Performance reality (the hidden design constraint)

- Mobile hardware spread is 10×; budget for the mid-range Android and
  the 3-year-old iPhone, not the demo device.
- Images: srcset with genuine small variants (720w class), lazy-load
  below fold, aspect-ratio boxes against CLS.
- Kill on mobile: heavy WebGL (tier down to stills/video), continuous
  font-variation animation, large blurs/backdrop-filters, scroll-linked
  JS doing layout work.
- LCP <2.5s on throttled mid-range; CLS ~0; input delay imperceptible.
  A beautiful page that takes 4s to show its headline has failed
  commercially.

## 6. iOS Safari specifics (recurring traps)

- 100vh lies (URL bar) — use svh/dvh units; test the collapse/expand.
- position:fixed + keyboard = chaos — prefer sticky within scrollers;
  re-test forms with keyboard open.
- Rubber-band overscroll interacts with pinned/snapped sections; ensure
  no scroll-trap at page ends.
- backdrop-filter and mix-blend-mode: costly and buggy — prefer solid
  fills on mobile.
- **Real-device validation is a distinct QA tier:** emulation and
  desktop-responsive mode do NOT count as iPhone/Safari validation.
  When a real device is unavailable, say so explicitly and ship a
  user-validation checklist instead of claiming coverage.

## 7. Mobile-first ordering of content

The mobile page IS the content hierarchy with nowhere to hide: lead
with the promise, one idea per screen-height, CTAs recurring at
decision points (not fixed-nagging), trust elements before the form,
footer complete but collapsed. If the mobile order feels wrong, the
desktop order was wrong too — mobile just exposed it.

## 8. Mobile QA checklist

□ Menu: open/close/outside-tap/activate/scroll-lock/orientation/focus
□ All targets ≥44px; primary actions thumb-reachable
□ No hover-only information; swipe affordances visible
□ Body ≥16px; heroes don't overflow with real Slovak copy
□ svh units; keyboard-open forms usable; no end-of-page scroll traps
□ LCP/CLS/jank measured under throttle; images served in small variants
□ Real-device pass done — or its absence explicitly reported
