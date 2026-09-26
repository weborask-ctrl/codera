# Codera bible — current website and reusable method

Last reconciled with the Silver website code: **2026-09-26**. The previous baseline below is the 2026-09-24 site; the approved 2026-09-26 motion release is documented separately. This is the entry point for any AI or designer working on Codera. It records implementation, Marcus's decisions and principles for new client projects. Codera's own font, curves and video are not a universal client template.

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

## Motion site: what the existing engine actually does

**Source and delivery.** The provided source is a continuous **1920×1080, 24 fps** HEVC 10-bit 4:4:4 MOV. The web version is **1920×1080, 60 fps H.264**, made with offline frame interpolation, about 25.1 MB in the current prepared-entry delivery. It is not native 4K and extra sharpening cannot recover detail absent from the source. The opening poster is a separate sharp image. The film and fonts load from Codera's own domain. See `docs/CODERA_SILVER_FINISH.md` for the media comparison.

**Scroll architecture.** The `journey` section occupies about **700 svh** when motion is enabled and contains a sticky, one-viewport stage. Normal browser scroll remains in control. GSAP ScrollTrigger maps scroll progress to target film time. Current control points in the source timeline: `[0, 2.6 s]`, `[0.38, 5.7 s]`, `[0.67, 9.5 s]`, `[1, 13.5 s]`; the trimmed delivery file has a `2.583333 s` source-time offset. `scrub: 0.55` smooths progress. These values describe today's film, not reusable constants for every motion site.

**Decoding and text.** JavaScript seeks the video to the latest requested frame. It allows **one outstanding seek**, discards obsolete intermediate demands and does not keep a decoded-frame bank in RAM. The three text beats and film fade follow the **presented decoded frame** via `requestVideoFrameCallback` where available, with a seeked fallback. Forward and reverse scroll therefore keep copy aligned with the actual picture, even if a seek is slow. A warm shadow fades in before the source viewpoint change around 6 seconds, briefly covers it, then reveals the gold tunnel; text stays native and sharp. The video does not react to pointer movement.

**Failure and accessible paths.** A static poster and readable opening exist before JS or video. Reduced-motion and small coarse-pointer visits default to a compact static version; visitors can explicitly start motion. Pause/resume is available. Loading and seeking have bounded recovery; returning to a tab can resume. On mobile, video is not downloaded until motion is requested. Only the visible text beat is in the reading/focus order. Keep the page usable if GSAP, media or decoding fails.

**Motion-site design rule.** Plan a connected camera journey with clear start, progression, change of view and settled ending; define what text belongs to each visual hold before producing the clip. Video, typography, content and scroll path form one story. Do not claim a hard cut was “seamless” merely because an overlay hides it. Render screenshots at full useful resolution, keep scroll responsive on an 8 GB machine, and test real seeks rather than trusting the nominal 60 fps file rate. For a new film, measure source detail and decode cost before choosing export settings.

## Prepared entry and scroll video — current decision, 2026-09-26

Marcus requested restoring fully prepared playback, with video preparation BEFORE revealing the website. This explicitly supersedes the fragmented streaming of PR #115 and the previous blanket ban on a full-download gate. Do not return to a visible finished homepage waiting for video, or to network-dependent fragment seeking, without a new user decision.

A small synchronous head script displays a Codera cover before first paint for ordinary desktop entry. Use the existing sharp SVG wordmark, dark background and truthful progress. Hide the page visually and mark its content inert during preparation. Download the complete compressed video, create a local Blob, decode the first image and await fonts before a 500 ms reveal. Subsequent seeks keep one outstanding decode and wait for presentation; text and the existing tunnel fade follow the presented image. No mouse parallax or lower-page redesign.

Delivery: journey-prepared-v2.mp4, 25,059,756 bytes, 1920×1080, 60 fps, 11 seconds, H.264/yuv420p, CRF 18, six-frame GOP, no B frames, slow encoder preset, same processed master and CAS sharpening. This is a new lossy encode, NOT byte-identical remux: master-reference SSIM 0.984221 versus 0.988539 for the 50 MB delivery. A representative detailed frame was visually compared. Preserve source resolution; never claim newly recovered or native 4K detail.

Cache the prepared compressed asset in the browser Cache Storage (one named Codera cache; versioned media URL), with ordinary fetch fallback when storage is unavailable or full. Measured local Edge entry at 10 Mbit/s / 60 ms: ~22.2 seconds cold, 0.685 seconds cached. Cold preparation duration still depends on bandwidth. A static-entry button becomes available after eight seconds; a 30-second independent watchdog, download error or missing scripts releases the cover. Skipping keeps motion off until explicitly requested and prepared. Touch, reduced-motion, no-JS and deep-link entries retain the immediate static page. Do not start an incompletely loaded movie as a fallback.

After preparation, forward/reverse seeks passed with the network disconnected. An eight-second forward/reverse run plus settling presented 474 frames: median 16.7 ms, p95 16.9 ms, maximum 100.4 ms; decode p95 3.1 ms. These are measured results on the available Edge/Windows machine, not a promise of zero dropped frames on every device. Verify startup AND presented-frame timing; do not report only a warm nominal 60 fps number.

Sources: experiments/metal/entry.js and entry.css, main.mjs, lib/silver-render.mjs (head assets only). Generation: scripts/metal-prepared-media.mjs. Verification: scripts/metal-entry-check.mjs and scripts/metal-check.mjs. See docs/CODERA_PREPARED_ENTRY_2026-09-26.md. Pending legal/footer drafts remain excluded.

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
