# Marcus — standing design rules

Recorded directly from Marcus on 2026-09-16. Apply to every website we design together, including Codera and client projects. Carry this file into future project instructions. These explicit preferences override conflicting visual-reference patterns or older aesthetic guidance.

## Headings and section labels

- Every heading must be beautiful, large, prominent and clearly readable. Preserve a deliberate hierarchy and responsive fit; do not make headings small, faint or incidental.
- Never ship small editorial section labels, eyebrow headings or decorative numbered captions such as `06 / Something`, `02 / Selected work`, or equivalent unnumbered micro-headings in the final design. Merely removing the number while retaining the tiny label does not satisfy this rule.
- During final design refinement, remove these auxiliary labels and modestly increase the actual headings where needed. The real heading must identify the section on its own.
- This does not require enlarging ordinary body text, functional form labels or navigation into headings.
- Temporary section markers may be used in an early prototype to track completeness. Their presence is not approval for the final website.

## Current jellyfish prototype — timing constraint

Marcus explicitly requested that we DO NOT make these visual changes at the current prototype stage. Record the rule now; apply it during later final-design refinement. No current prototype HTML, CSS, typography or labels should be changed solely to enforce this new rule yet.

## Final design review

Check each page on desktop and mobile: actual headings are prominent and readable; no small decorative section labels or numeric chapter captions remain; responsive headings neither clip nor obscure the content.

## Recognizable character throughout the page — 2026-09-23

Marcus's feedback on the Silver prototype: the video is now acceptable, but the following sections still lack character and life. His Apple/adidas references express the desired strength of identity and execution, not a request to copy either brand. He explicitly called for more roundness and a defining element that may come from typography, shape or their combination.

- A polished hero and large headings do not complete the design. Portfolio, offer, process and contact must share a recognizable visual language.
- Define a brand-specific visual signature before polishing more generic sections: one dominant device, with consistent shape, type and interaction rules. It must work when the page is static and the logo is absent.
- Apply it through composition and useful interactions, not a separate ornamental layer. Increasing font sizes or rounding every existing box is not sufficient evidence of character.
- Preserve clarity, large readable headings and restrained content. No small decorative captions, numbered eyebrows or added visual clutter.
- Show the design in a real browser. Evaluate the lower-page sequence and a mobile composition, not only an isolated hero screenshot or passing functional tests.
- For client projects, derive the signature from that client's identity. Codera's standard of execution is reusable; its exact shapes and fonts are not a mandatory template for every client.

The specific proposal “rounded sweep with a precise cut,” derived from Codera's existing C ribbon, is an assistant design hypothesis, not yet a user-approved final motif. Its test and applications are recorded in [12_VISUAL_SIGNATURE.md](12_VISUAL_SIGNATURE.md). The existing logo must not be redesigned to fit the proposal.

### Subsequent implementation direction — 2026-09-23

Marcus authorized applying that motif to the current Codera Silver website. This is authorization for an implemented study, not a claim the first result is the permanent brand standard. Natural pacing across the entire page is the primary criterion: give the film more scroll travel, soften the passage into the gold tunnel, and use compact overlapping project presentations rather than an excessively long gallery. Preserve native scroll control and complete previews.

For subsequent work, communicate and execute in three phases: **riešenie → postup → vypracovanie** (solution → procedure → implementation).

## Decorative metadata — explicit reinforcement, 2026-09-24

Never add small corner captions such as “Koncept · Animácie”, category tags or decorative metadata above/around project previews in any Codera or client project. This is the same standing ban on micro-labels, not a separate exception. When a factual qualifier is necessary (for example that work is a studio concept), state it once in normal readable section copy. Review the actual rendered DOM and screenshot, including project cards, before shipping.

## Composition and Silver refinement — 2026-09-24

Marcus requested consistent alignment and visual weight between the heading and supporting-copy columns throughout Codera. Matching fonts alone is insufficient. The portfolio must use a generous outer frame in Codera's shape language; preserve the complete screenshot inside it. Refine video smoothness, source detail and restrained pointer depth together, while keeping text stable and the 8 GB target machine usable. This iteration is explicitly **local only, no merge or deployment** until requested.

### Follow-up direction — 2026-09-24

- Use one consistent neutral liquid-glass colour across all portfolio frames, superseding the earlier per-project tint study.
- Keep equal spacing on all four sides between the glass frame and preview. Preview corners must share the same rounded shape language and consistent radii across projects.
- Keep “72” and “hodín” next to each other, with the entire group optically centred in its panel; this supersedes centring the number separately.
- Enlarge all principal headings, with the strongest increase in the hero. Render sharp native text at its intended size, without bitmap text or scaling used to fake a larger font.
- Further scroll smoothing must preserve the current media quality.

### Release correction — 2026-09-24

Marcus removed the pointer-driven camera effect: keep the film stationary under mouse movement. Align both pricing offers by heading, audience, price, details and action rows, including when details expand. He explicitly authorized merging the accumulated Silver refinement, superseding the local-only constraint for this release.

## Approved Silver finish — 2026-09-24

Marcus selected typography C: one Geist voice, no repeated italic headline treatment. A and B are rejected. Apple is a reference for precision, not permission to redistribute SF Pro. Use restrained superellipse geometry with a rounded fallback and 1.618:1 heading/copy proportions where the real content benefits; mobile stays single-column. Preserve the approved content, video story, palette, complete framed previews and 499/699 pricing. Implementation and merge were explicitly authorized. Detailed decisions and media limits: docs/CODERA_SILVER_FINISH.md.

## Simpler typography candidate — 2026-09-24

Marcus requested one simple, consistent typographic voice inspired by Coca-Cola.com, with no contrasting headline-line styles. This supersedes the previous maximal heading scale: keep headings prominent, but use calmer sizes, consistent bold weight and natural spacing. Montserrat is the implemented, openly licensed alternative to bespoke TCCC Unity for this release. It is a candidate awaiting Marcus's visual evaluation, not an approved permanent font for the Codera bible. Preserve the existing logo and SVG wordmark. See docs/CODERA_UNIFIED_TYPE.md. Merge was explicitly requested.
