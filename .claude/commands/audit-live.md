---
description: Run a Step-4-style diagnostic pass against the live site — diagnosis only, no fixes
---

A diagnostic pass in the shape of `CODERA_STEP4_AUDIT.md`. **Diagnose only. Do
not fix anything in this run**, and do not propose a redesign.

Target: `https://www.codera.sk` unless another URL is given as an argument.

Check, at desktop 1440×900 and mobile 375×812:

1. Console errors and failed network requests.
2. Every important text state — faint, clipped, cropped, overlapped, or gone
   before it can be read. Readability overrides choreography.
3. The static-frame test at each act's intended reading moment.
4. Scroll: dead zones, traps, stuck pins, input that does not produce immediate
   response. Wheel and trackpad are different input modes.
5. Interaction baseline: every button, link, CTA, nav item and control actually
   works; nothing depends on hover on touch.
6. Tone: is the dark/light rhythm doing dramaturgical work, or has it drifted
   back to uniform darkness?
7. Anything that reads as a section joined by an effect rather than as one
   authored journey.

Output one finding per line, each marked **CONFIRMED / PARTLY CONFIRMED / NOT
CONFIRMED**, naming the implementation responsible (file and line). Group as
KEEP / REBUILD / REMOVE / VERIFY. End with the validation class of the pass
itself — this is PREVIEW or CI evidence at best, never DEVICE.

If something needs fixing, open an issue or say what it would take. Do not
change code in this run.
