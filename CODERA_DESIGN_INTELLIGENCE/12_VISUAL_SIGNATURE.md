# 12 — Visual signature and character

Recorded 2026-09-23 after Marcus reviewed the Silver prototype live. This file adds an execution gate to the existing signature-constraint rule in `DESIGN_DECISION_ENGINE.md`; it does not prescribe one aesthetic for all Codera clients.

## The standing principle

**A Codera-built website must have an intentional, recognizable identity across its entire journey. Shape, typography and motion must reinforce the same idea while keeping the content simple and readable.**

Marcus's requirement is established: the sections after the current video need more character, life and roundness. Apple and adidas are his references for the level of identity and finish. They are not an instruction to reproduce branded stripes, proprietary type, product marketing layouts or logos.

Keep this distinction clear:

- Reusable Codera standard: confident composition, deliberate shape language, readable type, precise feedback, coherent behavior across the whole page.
- Client-specific identity: the particular font, silhouette, color, material and motion vocabulary selected for that brand.

## Diagnosis of the current Silver site

Live review of the offer section shows a repeated grammar of straight divisions, rectangular fields, headings and prices. Geist/Fraunces adds editorial contrast, but the silver film's material character does not continue into the useful page content. A different agency name could replace Codera while leaving much of this section unchanged.

This is a design assessment. The functional checks and readable type are still valuable; they simply do not demonstrate a distinctive brand on their own.

## Proposed Codera motif — design hypothesis, not final approval

**A rounded sweep with a precise cut.**

Source: the approved C ribbon already combines a rounded left sweep, open negative space, angled terminals and a fold. See `brand/source/README_CREATE_3D_LOGO.md`. Develop the page grammar from those relationships without stretching or redesigning the mark.

The proposed relationship is generous, soft volume paired with one decisive edge. It should feel composed and tactile. A rounded rectangle alone is not the signature; consistency between its proportion, opening, edge and movement is what needs testing.

### Shape

- Use broad curves on selected major surfaces, with one controlled straight/angled termination where it serves the composition.
- First study values, not approved tokens: 24px for contained surfaces, 48px for large stages, a capsule only for compact actions; proportional curves for genuinely large compositions. Do not scatter arbitrary radii across the page.
- Keep photographs and full-page previews complete inside their frames; signature clipping must not remove project content.
- Preserve plain, direct form controls and readable service comparisons. Not every object needs the signature treatment.

### Typography

- Retain the approved wordmark, large hierarchy and the currently liked fonts as the baseline.
- Test a more substantial, rounded grotesque on one lower-page headline before replacing the type system. A font change is successful only if it strengthens the same identity at desktop and mobile sizes, including Slovak diacritics.
- A possible local comparison font is the already available Bricolage Grotesque; it is a test candidate, not a new standard. Never claim the proposal is a bespoke typeface.
- Reduce reliance on the identical sans-serif-plus-italic headline pattern in every section. Reserve the expressive voice for deliberate moments.

### Movement

- Derive transitions from the same idea: opening, unfolding and settling. Every movement should reveal content, establish a relation or confirm an action.
- Start with short feedback (roughly 180–280ms) and restrained scene reveals (roughly 450–650ms), then tune by observation. These are study ranges, not approval of fixed timings.
- Keep text readable at rest and throughout meaningful holds. No bouncing copy, perpetual floating ornaments or mandatory pointer effects on touch devices.
- Use CSS/SVG and the existing GSAP engine where sufficient. Do not introduce new video generation, extra WebGL scenes or a competing scroll engine just to create character.

## How the hypothesis would change this page

| Area | Concrete study | Guardrail |
| --- | --- | --- |
| Work | A generous rounded presentation surface with a consistent opening/action detail; expand into the existing complete preview. | Keep the full sharp screenshot visible; each project retains its own aesthetic. |
| Services | Compose the offer as tangible, spacious surfaces with large names and prices, using the same curve/termination. Feedback on the detail control feels like opening the surface. | All prices and audiences remain comparable; no artificially privileged package or card effects that disturb reading. |
| Process | Show a real idea-to-design-to-web progression using the studio's own artifacts, linked by one continuous visual gesture. | Avoid three generic icon cards, fabricated client results and decorative motion unrelated to the process. |
| Contact | One generous, welcoming composition with the same curved edge and action behavior, resolving into the retained oversized CODERA wordmark. | Inputs and the next action remain immediately understandable. |

Subsequent implementation authorized on 2026-09-23: the Silver prototype now applies the curve/terminal study to compact stacking work cards, service surfaces, the proposal panel and contact form. The existing typefaces and logo remain. Process content stays factual; no client-process artifacts have been fabricated. Exact tokens remain subject to visual refinement, rather than automatically becoming permanent brand rules.

## Required review before adopting a signature

1. **No-logo check:** hide the name and mark. Identify at least three concrete shared decisions across hero, offer and contact. “Clean” or “premium” does not count as a decision.
2. **Swap check:** compare against a generic agency section. State what belongs to this brand and why it follows from its identity or product.
3. **Static check:** pause everything. The composition still has character and clear reading order.
4. **Purpose check:** every shape or effect frames content, communicates a relationship, or provides feedback. Remove unexplained ornaments.
5. **Small-screen check:** curves, typography and behavior retain their character without clipping text, cropping work or shrinking labels into microtype.
6. **Sequence check:** review work → services → process → contact in the actual browser. Vary composition while retaining the same visual language.
7. **Performance check:** measure the selected implementation on the target hardware; character must not depend on a powerful development machine.

The first practical trial should cover two adjacent lower-page sections at desktop and mobile sizes. Compare it against the current version before propagating exact shape/font tokens throughout the site. This review is a design-quality gate, not an additional permission requirement for work the user already authorized.

## Sources and precedence

- Marcus's explicit feedback in this conversation, 2026-09-23: source of the standing requirement.
- Approved Codera ribbon geometry: `brand/source/README_CREATE_3D_LOGO.md`.
- Existing rules: `MARCUS_RULES.md`, `07_COMPONENT_LANGUAGE.md`, `08_MOTION_AND_SPATIAL_DESIGN.md`, `10_DESIGN_ANTI_PATTERNS.md`, `DESIGN_DECISION_ENGINE.md`.
- User-named reference sites checked: https://www.apple.com/ and https://www.adidas.com/us. Their current content is not evidence for any specific radius or font token above; those remain proposed study values.

The current user-approved Silver direction and standing Marcus rules supersede conflicting historical prescriptions in older application documents. In particular, tracked uppercase micro-labels are not part of the current direction.

## Approved Silver finish — 2026-09-24

Marcus selected typography C: one Geist voice, no repeated italic headline treatment. A and B are rejected. Apple is a reference for precision, not permission to redistribute SF Pro. Use restrained superellipse geometry with a rounded fallback and 1.618:1 heading/copy proportions where the real content benefits; mobile stays single-column. Preserve the approved content, video story, palette, complete framed previews and 499/699 pricing. Implementation and merge were explicitly authorized. Detailed decisions and media limits: docs/CODERA_SILVER_FINISH.md.

## Simpler typography candidate — 2026-09-24

Marcus requested one simple, consistent typographic voice inspired by Coca-Cola.com, with no contrasting headline-line styles. This supersedes the previous maximal heading scale: keep headings prominent, but use calmer sizes, consistent bold weight and natural spacing. Montserrat is the implemented, openly licensed alternative to bespoke TCCC Unity for this release. It is a candidate awaiting Marcus's visual evaluation, not an approved permanent font for the Codera bible. Preserve the existing logo and SVG wordmark. See docs/CODERA_UNIFIED_TYPE.md. Merge was explicitly requested.

## Headings-only correction — 2026-09-24

Marcus clarified that the new Montserrat typography applies ONLY to headings. Keep Geist and the previous sizes/spacing for card copy, prices, 72 hodín, navigation, buttons, forms and supporting paragraphs. Do not propagate a requested heading-font change to body text or card content. The new heading treatment remains a candidate pending visual evaluation; the tunnel fade remains approved.
