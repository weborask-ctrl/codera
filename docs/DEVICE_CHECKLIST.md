# Real-device validation checklist

The working document (Step 4 §8) forbids inferring mobile quality from desktop
emulation. No machine running Claude has a physical iPhone attached, so this
pass can only be done by a human. Twelve checks, roughly ten minutes.

**Device:** ______________  **iOS:** ______  **Browser:** Safari / Chrome
**URL tested:** ______________  **Who:** ______________  **Date:** __________

Record the result in the GitHub issue labelled `verify` for real-device
validation. `FAIL` with one sentence of description is more useful than a
guessed `PASS`.

| # | Check | What "pass" means | Result |
| --- | --- | --- | --- |
| 1 | Open the menu | Opens on first tap, no delay, no double-tap needed | |
| 2 | Close the menu | Closes by its own control | |
| 3 | Tap outside the menu | Closes; the tap does not fall through to content underneath | |
| 4 | Tap a navigation target | Navigates to the right act and the menu closes | |
| 5 | Scroll lock | The page behind the open menu does not scroll or rubber-band | |
| 6 | Rotate to landscape and back | Layout recomposes, nothing is cut off, scroll position is sane | |
| 7 | Scroll through all five acts | No stuck state, no scroll trap, no dead zone; a swipe always moves something | |
| 8 | Read every headline | Nothing clipped by the viewport, nothing faint, nothing gone before it can be read | |
| 9 | Stop mid-scene and look | The paused frame still reads as a composed screen | |
| 10 | Tap targets | Buttons and links hit on the first attempt; nothing depends on hover | |
| 11 | Enquiry form | Keyboard opens, fields are reachable, validation is readable, submit responds | |
| 12 | Reduced motion (Settings → Accessibility → Motion → Reduce Motion, on) | The page becomes a readable static layout; no pin traps the scroll | |

**Overall verdict:** PASS / FAIL — ____________________________________

**Notes / anything that felt wrong even if it technically passed:**

<br>
<br>

---

If a physical device is genuinely unavailable, the honest report is
`DEVICE: NOT VALIDATED — no hardware available`. It is never replaced by
emulator results, synthetic FPS numbers or screenshots.
