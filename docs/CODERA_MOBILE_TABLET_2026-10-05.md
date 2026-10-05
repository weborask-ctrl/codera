# Mobile and tablet refinement — approved release

Branch: codex/mobile-tablet. Marcus authorized merge on 2026-10-05; consult the release PR for deployment status. Preserve the original Silver artwork and desktop identity.

## Automatic motion

Normal visits start without a Start button or gesture. MSE remains the existing desktop path; capability detection selects direct progressive MP4 when MSE/AVC is unavailable. Browsers without requestVideoFrameCallback use decoded-frame events, explicitly distinguished from presentation timing. Reduced-motion and deliberate pause/skip still respected. Scroll range uses the stable stage height, avoiding browser-toolbar height changes changing the endpoint.

The progressive MP4 is a stream-copy remux, not a new encode: 1920x1080, 60 fps, 660 frames, 11 seconds. Both files decoded to SHA256 70dec44cfa7d9accba063ccaba242129fd0a9fddb225907361cd0089e6a25390. Progressive bytes: 11205592; file SHA256 4d7fbab131b2a65187796fc1aa57e37f869646861281c737d1f70e46d73f8663. Only one transport is selected; visitors do not download both films.

Remux command: ffmpeg -i journey-balanced-4b593baa7f9b.mp4 -map 0:v:0 -c:v copy -movflags +faststart journey-balanced-progressive.mp4

## Layout

Below 1001px, project cards stay in document flow with unobstructed links and complete screenshots. Portrait hero uses a bounded central image region with a modest centered crop and soft edges, preserving the source film. Tablet section headings and process use one column. Preview controls use two explicit rows; touch links have larger targets. Prices and Care scope unchanged. Existing desktop overlapping cards remain. Montserrat 700 is instantiated from the existing licensed variable file for consistent heading weight; same family and glyphs, not a redesign.

## Validation and limits

Edge: automatic forward/reverse scroll and responsive checks at 320,390,768,844 landscape,1024,1440; forced no-MSE and no-frame-callback paths passed. Windows Playwright WebKit: same six viewport checks and automatic progressive motion passed. Existing functional automatic-motion regression: 12/12 passed. No physical iPhone/Android has been tested; Windows WebKit is not iOS Safari. Firefox executable failed to launch on this host (spawn UNKNOWN), so Firefox compatibility is not certified by this run.

Reference: https://webkit.org/blog/14735/webkit-features-in-safari-17-1/ explains the distinct iPhone ManagedMediaSource API; this candidate deliberately uses ordinary progressive MP4 when the existing MSE API is absent.

### Integrated project cards — approved release, 2026-10-05

Marcus requested a shared Codera-shaped card enclosing each preview and its actions on mobile/tablet only. Implemented warm-paper surface, 40/10/40/40 mobile corners (48/12/48/48 tablet), corresponding inset preview corners, two action rows on phone and one row on tablet. Applies below 1001px and coarse-pointer tablets up to 1366px. Desktop fine-pointer presentation remains unchanged. Validated widths 320,390,768,1024 touch and 1440 desktop, containment and preview dialog. Marcus reviewed the local presentation and subsequently authorized merge.
