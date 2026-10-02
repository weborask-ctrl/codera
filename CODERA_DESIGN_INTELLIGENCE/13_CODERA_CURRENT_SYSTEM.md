# Codera bible — current website and reusable method

Last reconciled with the Silver website code: **2026-10-02**. The **current automatic-motion implementation is locally validated**, with 15/15 acceptance checks and the production verification command passed. Merge, remote checks and deployment evidence are tracked in [PR #131](https://github.com/weborask-ctrl/codera/pull/131); this document describes the checked-in implementation. Marcus now explicitly authorizes a modest compression/size compromise and rejects a mandatory “Spustiť animáciu” step for ordinary visits. Preserve the supplied Silver film, camera journey and approved page. The preceding release was PR #129's 2026-09-27 original-video stream; its unchanged 50 MB delivery is historical context, not the new performance target. Current source is `experiments/metal/main.mjs`, `entry.js` and the native MediaSource modules. Controlled tests do not certify every device. This is the entry point for Codera work; Codera's font and palette are not universal client templates.

## Release validation status

- **LOCAL passed:** `npm run verify` (lint, types, production build), 15/15 automatic-motion checks, and a 1440×900 browser review confirming the selected 1080p film with no horizontal overflow or reported page errors.
- **REMOTE CI / PREVIEW / MERGE / DEPLOYMENT:** consult the validation evidence and merge status in [PR #131](https://github.com/weborask-ctrl/codera/pull/131). Local architecture documentation alone is not proof of a particular public deployment; verify its served module and media hash when inspecting production.

## Read this first

1. Read this file, then `MARCUS_RULES.md` and `12_VISUAL_SIGNATURE.md`.
2. For Codera website work, inspect the **current checkout and rendered site**. The live Silver source is `app/route.ts` → `lib/silver-render.mjs` → `experiments/metal/index.html`, `style.css`, `refinement.css`, `signature.css`, `main.mjs`; facts and offers come from `lib/site-config.ts`. The project has older design branches and documents that describe superseded sites. A rule in an old study is not evidence of the current build.
3. For a new client, run `DESIGN_DECISION_ENGINE.md` before choosing a style; use `01`–`10` and the relevant `styles/` record. Derive that client's signature from their brand and product.
4. If this document disagrees with a newer explicit user instruction, follow the user and update this document after implementation. If code and this document disagree, report the drift and verify which state was approved. Never silently rewrite the site to match old prose.

## Status vocabulary

| Status | Meaning |
| --- | --- |
| **Standing rule** | Marcus's direction for Codera work and final client-site quality. |
| **Current Codera implementation** | In the live Silver design; preserve when editing this site unless Marcus changes it. |
| **Candidate** | A choice used on Codera that has not been mandated for every future project. |
| **Local candidate** | Implemented for local evaluation; not deployed or accepted merely because checks pass. |
| **Historical** | Earlier direction or study; useful background, not a current command. |

## What Codera is building

Codera designs and develops clear, fast company websites with a recognizable character. The site must prove two abilities at once: we can build a strong motion experience, and we can give each client a distinct visual identity. The user should quickly understand the offer and reach a project enquiry. The work itself must stay more legible than the effects around it.

**Current public story, in order:**

1. **Home `/`:** a dark, scroll-controlled cinematic opening; full, sharp project previews; professional and motion offers; WordPress work; studio process; contact form and large Codera wordmark.
2. **Five live demos `/ukazky/…`:** `animacie-3d` (Observatórium), `dizajn` (Kancelária), `objednavky` (Pražiareň), `rezervacie` (Štúdio), `wordpress` (WordPress). They are **concept demonstrations**, not claims of completed client commissions. Each should look like its own brand. `app/ukazky/[slug]/page.tsx` and `lib/skills.ts` define the demo routes; `lib/silver-render.mjs` supplies the home previews.
3. **Commercial offer:** `Profesionálny web` from **499 €**, `Motion web` from **699 €**; WordPress changes priced after consultation. `lib/site-config.ts` is the source for prices, scope, 72-hour first-proposal figure and contacts. Do not invent client results, registration details or terms.
4. **Contact:** the Silver homepage form prepares a `mailto:` draft; the visitor sends it from their email program. A separate older `/v3` page has another form and is not the primary Codera experience.

The homepage is the only URL in the current sitemap. The demos carry `noindex`; internal study routes `/v3`, `/boards`, `/directions` and `/logo-lab` are legacy or development surfaces, not new service pages. Do not promote a planned landing page as if it already exists.

**Legal pages:** local draft work exists for privacy and collaboration terms, with clearly marked missing facts. It is not approved public copy. Confirm the actual business identity, email provider, retention, demo storage and commercial terms before publishing. See `docs/CODERA_PRIVACY_AUDIT_2026-09-24.md` where the draft is present.

## Visual grammar of the current Codera site

| Element | Current decision and reason | Boundary |
| --- | --- | --- |
| **Shape signature** | A generous curved sweep with one precise, tighter terminal, derived from the open C ribbon. Repeat this relation in section transitions, offer surfaces, preview frames and contact, while letting plain controls stay plain. | A rounded rectangle everywhere is not the signature. Do not change the approved mark to fit UI geometry. |
| **Corners** | CSS `corner-shape: superellipse(1.35)` on selected surfaces with explicit `border-radius` fallback. Common desktop large-surface fallback is about `48px 12px 48px 48px`; mobile about `30px 8px 30px 30px`. Broad section corners scale with the viewport (up to about 130px). Inner preview corners use the same family and the outer frame adds a consistent inset. | `superellipse(1.35)` is the CSS corner-shape parameter, **not** the mathematical Lamé exponent or the golden ratio. Keep a readable fallback for browsers without support. Don't decorate every button or input with large curves. |
| **Golden ratio** | Main section compositions use approximately **1.618:1** for heading and explanatory-copy columns on desktop where both columns have real content. On mobile, use one column. | It is a guide for proportion and visual balance, not a mandate to size every card, margin, image or font by φ. Judge actual content and optical alignment. |
| **Typography** | **Montserrat for h1/h2/h3 only** on current Codera pages; same clean, bold treatment across both lines of a headline. **Geist for body copy, cards, prices, the `72 hodín` unit/group, navigation, buttons, form labels and controls.** The SVG Codera wordmark remains a separate approved asset. Self-hosted WOFF2 files support Slovak diacritics. | A heading-font request never changes bubble/card copy or numerical UI. No proprietary Apple or Coca-Cola font reuse. Montserrat is current Codera practice, not a compulsory font for client brands. |
| **Scale and clarity** | Hero headline is the largest; section titles remain prominent. Text is rendered as native text at its intended size, without bitmap headings, blur, shadow or transform scaling that softens it. Supporting copy stays readable and aligned with the headline column. | No small decorative section labels, numbered eyebrows, corner metadata or tag strings such as “Koncept · Animácie”. Ordinary form labels and navigation may stay functional size. |
| **Palette** | Dark graphite opening and darker service/contact acts; light, warm-paper work and studio acts. Section corner cutouts reveal the **previous section's color**, avoiding black slivers. Warm gold is a restrained material accent, not a reason to paint all CTAs gold. | The work previews have their own client palettes; do not tint the Codera glass frame five different colors. |
| **Work previews** | Five complete, sharp screenshots in one neutral translucent frame treatment. Outer and inner curves relate; inset is equal on all four sides. `object-fit: contain` keeps the full composition visible. Cards stack compactly on scroll and have accessible live/open actions. | Do not crop the sites to make card art look dramatic; no mismatched inner/outer radii or excessive empty sides. |
| **Offers and process** | Two offers align by title, audience, price, details and CTA, including expanded details. `72` and `hodín` sit together and are optically centered as one group. Process and contact continue the same visual language. | Don't add a gratuitous third “premium” tier, invented urgency, or tiny type to fit more copy. |

**Approved desktop refinement — 2026-09-26:** keep both original pricing summaries in their own cards. Activating either opens or closes both package contents together; preserve aligned rows and native keyboard access. Desktop project cards share a 24 px sticky edge for complete reverse overlap, and all frames use the same slightly brighter neutral glass. Mobile/tablet refinement remains a separate next step.

Precise CSS lives in `experiments/metal/signature.css`; inspect the **last effective rule** and the rendered viewport before quoting a token. Earlier rules in `style.css` or `refinement.css` can be overridden later in the cascade. The current type source is also documented in `docs/CODERA_UNIFIED_TYPE.md`; its final headings-only correction supersedes its earlier full-type proposal.

## Current automatic-motion implementation — 2026-10-02

**Locally validated release implementation.** Marcus explicitly permits a modest fidelity/size tradeoff for faster automatic motion. This supersedes the previous byte-identical/no-re-encoding constraint for this iteration; it never permits different artwork, a different camera journey or conspicuous pixelation.

The selected `/motion/metal/journey-balanced-4b593baa7f9b.mp4` is **11,212,401 bytes**, versus the previous 50,405,743-byte stream: **77.76% smaller**, still **1920×1080, 60 fps, 660 frames and 11 seconds**. H.264 High level 4.2 / CRF 22 / GOP 12 is encoded from the existing interpolated master with the same trim and detail filter. It is not native 4K. Compared with the earlier CRF 15 web reference, all-frame SSIM is 0.984927 and PSNR 44.663563 dB; native-pixel comparison shows a modest loss of the finest metal microtexture. Do not describe that compromise as identical fidelity. The adjacent integrity manifest identifies the selected file; the older 50 MB assets remain historical references.

Normal desktop and touch visits start automatically after a presented frame and **1.6 seconds of buffered source footage**; no mandatory start click. Those first eight fragments require 1,536,534 media bytes, not a promised 1.6-second network wait. The earlier one-second buffer was increased after cold-scroll testing exposed excessive source-position lag. Preserve native scroll, one outstanding seek, actual-frame captions/fade and buffer-aware pacing. Reserve the approved journey geometry before media readiness, distinguish automatic cover timeout from deliberate skip, and keep reduced-motion, manual pause, no-JS and error paths usable. Automatic readiness must not override the user's deliberate choice. Controlled local acceptance passed; production-network and physical-device performance remain to be verified.

Local headless Edge acceptance used actual HTTP byte pacing for **video only**, with fresh contexts and unthrottled page resources. At 5/10 Mbit/s, video readiness was 2.785/1.538 s and page entry 2.825/1.587 s; real frame-interval p95 was 33.5 ms. Maxima were 66.9 ms at 5 Mbit/s and 150.5 ms on one reverse interval at 10 Mbit/s. Raw scroll-to-film lag reached 1.421 source seconds at 5 Mbit/s versus 0.155 at 10; do not relabel it as wall-clock latency or hide it behind filtered-target lag. At 2 Mbit/s, the page became usable at 4.065 s and motion started automatically at 6.440 s with stable geometry; continuous 2 Mbit/s scrolling was not tested. The earlier one-second candidate failed cold lag acceptance and a deep-link case; the final 1.6-second candidate passed all 15 checks with no uncaught JS/CSP errors. These are local media-pacing measurements, not production or universal smoothness certification.

Read [Automatic Silver motion](../docs/CODERA_AUTOMATIC_MOTION_2026-10-02.md) for the authorization, comparison table, reproducible encoder command, integrity, runtime contract and subsequent release results. Other page sections, typography, offers and artwork remain approved and unchanged.

## Historical Silver engine before PR #129

This section describes Silver before the 2026-09-27 streaming release. Its whole-Blob delivery, GSAP driver and manual touch entry are historical behavior, not instructions for the current automatic-motion implementation.

**Source and delivery.** The provided source is a continuous **1920×1080, 24 fps** HEVC 10-bit 4:4:4 MOV. The web version is **1920×1080, 60 fps H.264**, made with offline frame interpolation, about 50.4 MB, prepared completely as one local Blob before motion can activate. It is not native 4K and extra sharpening cannot recover detail absent from the source. The opening poster is a separate sharp image. The film and fonts load from Codera's own domain. See `docs/CODERA_SILVER_FINISH.md` for the media comparison.

**Scroll architecture.** The `journey` section occupies about **700 svh** when motion is enabled and contains a sticky, one-viewport stage. Normal browser scroll remains in control. GSAP ScrollTrigger maps scroll progress to target film time. Current control points in the source timeline: `[0, 2.6 s]`, `[0.38, 5.7 s]`, `[0.67, 9.5 s]`, `[1, 13.5 s]`; the trimmed delivery file has a `2.583333 s` source-time offset. `scrub: 0.55` smooths progress. These values describe today's film, not reusable constants for every motion site.

**Decoding and text.** JavaScript seeks the video to the latest requested frame. It allows **one outstanding seek**, discards obsolete intermediate demands and does not keep a decoded-frame bank in RAM. The three text beats and film fade follow the **presented decoded frame** via `requestVideoFrameCallback` where available, with a seeked fallback. Forward and reverse scroll therefore keep copy aligned with the actual picture, even if a seek is slow. A warm shadow fades in before the source viewpoint change around 6 seconds, briefly covers it, then reveals the gold tunnel; text stays native and sharp. The video does not react to pointer movement.

**Failure and accessible paths.** A static poster and readable opening exist before JS or video. Reduced-motion and small coarse-pointer visits default to a compact static version; visitors can explicitly start motion. Pause/resume is available. Loading and seeking have bounded recovery; returning to a tab can resume. On mobile, video is not downloaded until motion is requested. Only the visible text beat is in the reading/focus order. Keep the page usable if GSAP, media or decoding fails.

**Motion-site design rule.** Plan a connected camera journey with clear start, progression, change of view and settled ending; define what text belongs to each visual hold before producing the clip. Video, typography, content and scroll path form one story. Do not claim a hard cut was “seamless” merely because an overlay hides it. Render screenshots at full useful resolution, keep scroll responsive on an 8 GB machine, and test real seeks rather than trusting the nominal 60 fps file rate. For a new film, measure source detail and decode cost before choosing export settings.

## Historical PR #121 motion — rejected experience, 2026-09-26

Marcus rejected PR #120 for severe stuttering and later rejected PR #121 for poor quality, long loading and continued stuttering. Neither release is an approved experience. The later worker/AV1 candidate also received a stuttering report and is now historical; see `docs/CODERA_MOTION_LAB_2026-09-26.md`. The paragraphs below describe deployed behavior, not an accepted target or standing requirement for future implementations. The 0.4-second opening buffer could not support arbitrary scrolling while the rest of the film downloaded. Its own cold-sweep test had a 4.4-second hold; reporting fast entry and warm frame rates did not establish a working motion experience. That progressive strategy is not an approved baseline.

The deployed implementation activates animation only from a complete local Blob of the 50,378,423-byte CRF 15/GOP 3 1080p60 detail reference. It prefers its full-file Cache Storage entry; when all 221 old fragment entries exist, it assembles those in source order into a complete Blob. It does not animate a partial cache. Active seeking has no media network dependency and retains one outstanding decode, decoded-frame captions, reverse fades and native scroll.

The entry cover offers static entry after 1.5 seconds and automatically releases after four foreground seconds. Thus an uncached visitor can get the sharp compact static hero while the full video prepares in the background. When ready, the existing motion button can start it. Static escape and manual pause must never be overridden by late readiness; do not suddenly extend the page. Touch/reduced-motion/no-JS remain static by default.

A complete prior-fragment cache tested with media network blocked activated in 0.756 seconds; its eight-second forward/reverse sweep presented 470 frames, median/p95 intervals 16.7/16.9 ms and longest interval 83.5 ms. Cold complete preparation still takes about 43 seconds at 10 Mbit/s; visitors are not forced to wait for it. These are local measurements, not universal promises.

Fast first entry with immediate, sharp, smooth full motion remains unresolved. PR #121 was intended as a stability correction but was also rejected by Marcus. Keep future delivery experiments local until representative continuous cold scrolling passes; multi-second holds are release failures, even if startup and warm tests pass. Full explanation: `docs/CODERA_MOTION_STABILITY_2026-09-26.md`. Runtime: main.mjs and entry.js; no progressive module import. Tests: metal-stable-entry-check.mjs, metal-cache-recovery-check.mjs and metal-check.mjs.

## Rejected realtime study — 2026-09-27

`experiments/silver-realtime` on port 4341 is a **rejected** authored WebGL2 replacement. Marcus did not want a substitute for his supplied video; creating it consumed effort outside the intended task. Do not merge it, continue its development, or treat its different artwork as a successful optimization. Work exclusively with the supplied film. Historical measurements remain in `docs/CODERA_REALTIME_STUDY_2026-09-27.md` for traceability, not as acceptance evidence. The earlier AV1 experiment on port 4340 remains unaccepted; that port now serves the original-video candidate below.

The completed headless check recorded 2.09 s cold scene readiness and 2.55 s visible entry at simulated 10 Mbit/s, with 807 KB of completed transfers by readiness. Functional forward/reverse, pause, idle-stop and static recovery checks passed. Physical foreground smoothness and real background-tab return remain unverified; the separate headed runs did not establish a passing desktop result. These numbers describe a simplified new sculpture, not the original movie delivered at equivalent artwork quality. Preserve that distinction in future comparisons.

## Historical original-video streaming release — PR #129, 2026-09-27

**PR #129 was merged and deployed on 2026-09-27.** Its 50 MB fidelity-preserving delivery and late-readiness start button were subsequently rejected as too slow on 2026-10-02. Preserve this release record as history; the automatic-motion implementation above is the current development target. The production build copies `experiments/metal/main.mjs`, `page-controls.mjs`, `native-player.mjs`, `native-stream.mjs` and `native-stream-worker.mjs` through `scripts/silver-assets.mjs` into `/silver/`. It preserves approved copy, fonts, curves, previews, pricing and the supplied film. Native HTML video uses one fetch into fragmented MP4 MediaSource and worker transport via MediaSourceHandle where supported, with main-thread MediaSource fallback. No experimental query switches or local audit endpoints are published.

The 50,405,743-byte remux contains the **same encoded samples** as the 50,378,423-byte detail reference: 1920×1080, 60 fps, 660 frames. `public/motion/metal/journey-stream-f60088d67cff.integrity.json` verifies matching payload hashes. There is no re-encoding or detail reduction relative to that web export; it is not native 4K.

Readiness requires a presented frame and two seconds of buffered source footage. Native scrolling remains responsive; seeks are coalesced and buffer-aware, with 0.16-second damping and no fixed native film-speed cap once buffered. When an unfinished download is close to the camera position, forward film motion slows according to buffered headroom; this adds camera lag rather than blocking page scroll. Copy/fade follow the presented picture. Offstage/hidden work pauses, a footer-to-top return resets its target, and late readiness respects static escape and page position. The four-second cover can release into the static hero.

On i5-6500 / HD 530 / 8 GB, the final cold 50 Mbit/s headless Edge run reached readiness in 2.606 seconds, with 7.8 ms native seek p95, 19.4 ms frame interval p95 and 167.4 ms longest interval after entry. At 20 Mbit/s the initial 918.5 ms network-related picture pause was removed in a repeat with buffer-aware pacing; raw scroll-to-film position lag reached 0.550 source seconds during a normal sweep. Aggressive 50 Mbit/s wheel bursts reached 1.522 source seconds of raw story-position lag. An intermediate fixed speed cap had caused a 7.7005-second gap and was removed. Decoder lag against the filtered target must never be reported as full wheel-to-picture responsiveness. This is a continuity/lag tradeoff, not faster networking. The unchanged full file needs at least 40.3 seconds to transfer at 10 Mbit/s. Real foreground, pacing, slow-network and cross-browser acceptance remain necessary; no universal guarantee follows.

Read [Original-video streaming evaluation](../docs/CODERA_ORIGINAL_VIDEO_STREAM_2026-09-27.md) for integrity, reproduction, functional checks and negative results. The published movie uses `/motion/metal/journey-stream-f60088d67cff.mp4`, an immutable content-versioned asset. Do not restore the old full-Blob entry barrier, claim universal smoothness or superiority over Oryzo, or silently reduce compression fidelity. Release verification uses `scripts/silver-stream-check.mjs`; historical Blob tests do not describe the current controller.

## Standing rules for any final Codera-built site

- Begin with business and audience context. Choose visual language from the client, not from a fashionable effect or the Codera palette. Use `DESIGN_DECISION_ENGINE.md`.
- Define one recognizable signature that persists through hero, work/product, offer/process and contact. Test it without the logo and with motion paused. Match type, shape, layout, imagery and movement to the same idea.
- Make main headings large and clear. Never ship decorative micro-labels or numbered eyebrows. Keep functional text legible on desktop and mobile.
- Treat photos, screenshots and video as real content: high quality, correctly licensed, uncropped when the user needs to inspect them, with honest descriptions. Preserve brand-specific palettes inside Codera's neutral showcase frame.
- Use motion to reveal or explain. Keep meaningful text holds, native scroll response, reduced-motion and failure paths. Avoid pointer parallax unless specifically requested; Marcus removed it from this site.
- Keep commercial claims factual. A concept is a concept; an entry price is a starting price; “first proposal in 72 hours” is not “finished site in 72 hours”. Never fabricate clients, awards, legal identity or numerical results.
- Review the actual complete browser page, including lower sections, dialogs, 320–390 px phones and desktop. Check optical alignment, rounded edges, full previews, focus, performance and the absence of overflow.
- For Codera work, communicate and implement in Marcus's order: **riešenie → postup → vypracovanie**. Capture the resulting decision here after it is accepted.

## Do not inherit these older prescriptions

`11_CODERA_APPLICATION.md` describes an earlier Ribbon Chamber and names tracked uppercase micro-labels, a ribbon hero object, and a layout whose commercial content was all light. Those are **historical**, not instructions for the current Silver site. The 2026-09-24 headings-only correction supersedes the earlier “Geist for every heading” stage and the brief mistaken “Montserrat for everything” stage. `12_VISUAL_SIGNATURE.md` contains both a proposal history and later implementation notes; use the current status above to resolve chronology.

## Update this bible when work changes

Before changing a rule, find its explicit user decision and the actual implementation. Update this file, the relevant detailed design record and `00_INDEX.md` in the same task. State whether the new decision applies to Codera itself or to all client work. Replace superseded instructions instead of adding a contradictory note at the bottom. Verify technical numbers in code or media metadata; avoid promoting an estimate to a promise. A future AI should be able to read this file alone to know the current system and then follow the linked implementation sources.

### Motion quality release rule — updated 2026-10-02

Never silently reduce compression fidelity to shorten loading. **Marcus explicitly authorized a modest, measured compression compromise on 2026-10-02**, superseding the earlier requirement for the exact 50 MB encoded samples in this iteration. Preserve the supplied artwork, camera journey and useful 1080p detail; compare identical decoded frames and report texture loss honestly. Resolution alone is insufficient: verify viewport/DPR, native forward/reverse frame presentation and cold-network behavior. Normal entry must activate automatically; reduced-motion, deliberate skip and manual pause remain respected. Previous 50 MB, full-Blob and PR #129 measurements are historical evidence, not guarantees for the new asset. A smaller file or passing warm test alone does not establish smooth cold scrolling or performance on every device. Current record: [Automatic Silver motion](../docs/CODERA_AUTOMATIC_MOTION_2026-10-02.md). Historical records: `docs/CODERA_MOTION_STABILITY_2026-09-26.md` and `docs/CODERA_MOTION_DETAIL_2026-09-26.md`.
