---
description: Screenshot the five acts across devices from a running dev server
---

Capture the current visual state so a change can be judged on the frame, not on
a description.

1. Make sure a dev server is running on port 3000 (`.claude/launch.json`
   defines `codera-dev`). Start it through the preview tooling, never with a
   raw background shell.
2. `npm run capture -- <output-dir>` — writes `01-hero`, `02-premena`,
   `03-work`, `04-offer`, `05-resolution` at tablet (768×1024) and mobile
   (390×844).
3. Put the output directory in the session scratchpad, not in the repository.
4. Look at every frame before reporting. Judge them against the static-frame
   test: paused, does each still read as a composed screen? Is any text faint,
   clipped or cut by the viewport?

Report what you actually see, including anything that looks wrong but was not
what you were asked to check. Attach the frames that matter.
