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

Precise CSS lives in `experiments/metal/signature.css`; inspect the **last effective rule** and the rendered viewport before quoting a token. Earlier rules in `style.css` or `refinement.css` can be overridden later in the cascade. The current type source is also documented in `docs/CODERA_UNIFIED_TYPE.md`; its final headings-only correction supersedes its earlier full-type proposal.

## Motion site: what the existing engine actually does

**Source and delivery.** The provided source is a continuous **1920×1080, 24 fps** HEVC 10-bit 4:4:4 MOV. The web version is **1920×1080, 60 fps H.264**, made with offline frame interpolation, about 33.5 MB. It is not native 4K and extra sharpening cannot recover detail absent from the source. The opening poster is a separate sharp image. The film and fonts load from Codera's own domain. See `docs/CODERA_SILVER_FINISH.md` for the media comparison.

**Scroll architecture.** The `journey` section occupies about **700 svh** when motion is enabled and contains a sticky, one-viewport stage. Normal browser scroll remains in control. GSAP ScrollTrigger maps scroll progress to target film time. Current control points in the source timeline: `[0, 2.6 s]`, `[0.38, 5.7 s]`, `[0.67, 9.5 s]`, `[1, 13.5 s]`; the trimmed delivery file has a `2.583333 s` source-time offset. `scrub: 0.55` smooths progress. These values describe today's film, not reusable constants for every motion site.

**Decoding and text.** JavaScript seeks the video to the latest requested frame. It allows **one outstanding seek**, discards obsolete intermediate demands and does not keep a decoded-frame bank in RAM. The three text beats and film fade follow the **presented decoded frame** via `requestVideoFrameCallback` where available, with a seeked fallback. Forward and reverse scroll therefore keep copy aligned with the actual picture, even if a seek is slow. A warm shadow fades in before the source viewpoint change around 6 seconds, briefly covers it, then reveals the gold tunnel; text stays native and sharp. The video does not react to pointer movement.

**Failure and accessible paths.** A static poster and readable opening exist before JS or video. Reduced-motion and small coarse-pointer visits default to a compact static version; visitors can explicitly start motion. Pause/resume is available. Loading and seeking have bounded recovery; returning to a tab can resume. On mobile, video is not downloaded until motion is requested. Only the visible text beat is in the reading/focus order. Keep the page usable if GSAP, media or decoding fails.

**Motion-site design rule.** Plan a connected camera journey with clear start, progression, change of view and settled ending; define what text belongs to each visual hold before producing the clip. Video, typography, content and scroll path form one story. Do not claim a hard cut was “seamless” merely because an overlay hides it. Render screenshots at full useful resolution, keep scroll responsive on an 8 GB machine, and test real seeks rather than trusting the nominal 60 fps file rate. For a new film, measure source detail and decode cost before choosing export settings.

## Approved motion release — 2026-09-26

Marcus reported stutter even on faster computers and authorized a local fix preserving quality. A cold-load test at 10 Mbit/s and 60 ms latency showed network-driven seeking stalls: about 24 presented frames during an 8-second forward/reverse scroll plus settling. Smooth browser scrolling did not imply smooth video.

The approved correction replaces 12-frame GOP delivery with 3-frame GOP H.264, still 1920×1080, 60 fps, 11 seconds, CRF 15 and the same sharpening. Size rises from 33,549,435 to 50,378,423 bytes. It downloads the complete compressed clip once, then seeks a Blob URL; CSP allows `blob:` for media. It does not retain an unbounded decoded image sequence. The next seek waits for frame presentation (with a bounded callback fallback), and accessibility attributes update only when the visible text beat changes.

The initial page remains a short readable poster composition with download progress. Only a prepared clip activates the 700-svh story. If the visitor has already scrolled down, loading does not insert a long scene above them; returning to the top activates it. Touch and reduced-motion remain opt-in. This trades initial preparation time and additional transfer bytes for smooth, network-independent seeking; it is not instant playback on a slow connection.

The equivalent slow-network run after preparation presented 454 frames, median interval 16.7 ms, 95th percentile 33.4 ms. This is a local Edge benchmark, not proof of 60 fps on every device. Master-reference SSIM slightly improved (0.987852 → 0.988539); this supports retained image quality, not byte-identical or newly invented detail. See `docs/CODERA_SCROLL_PERFORMANCE_2026-09-26.md` in the Silver release checkout for checks and limitations. Marcus explicitly authorized merging this motion-only release and bible on 2026-09-26; legal/footer drafts remain excluded. Verify deployment against this release before claiming it is live.

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
