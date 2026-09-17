# Workstation evidence — 2026-09-17

Actual browser captures of the isolated prototype, not generated scene artwork. Six JPEGs total approximately 625 KiB: they can be viewed at home without starting the 3D scene. The procedural animal remains a proxy, not an approved final production asset.

| Capture | What to inspect |
| --- | --- |
| [Desktop hero](hero-1440.jpg) | Existing 1440 × 900 composition and pearl proxy |
| [Oblique bell pass](intro-oblique-1440.jpg) | Actual close camera pass beside the same organism |
| [Portfolio handoff](portfolio-entry-1440.jpg) | Return to ordinary-flow project content |
| [Top-view/process hold](top-view-1440.jpg) | Same organism from above, reading composition retained |
| [Phone hero](hero-390.jpg) | 390 × 844 CSS viewport, DPR 3 capture; not a real phone |
| [Phone contact](contact-390.jpg) | Readable real contact information and restrained background |

Screenshots preserve real browser output; no photographic enhancement was applied. Source captures are JPEG quality 80. Small drawing-buffer edges are visible at high zoom because the original low-resource rendering caps remain unchanged.

- [Final functional report](functional-report.json): **21/21 groups passed**, including six viewport sizes, actual WebGL context loss and simulated lifecycle/failure cases.
- [Measured performance report](performance-report.json): the preceding **19/19 groups plus four 18-second performance profiles**. The final two cases and narrow-screen/control refinements were added afterward; camera/shader/frame-scheduling code is identical across those runs.

The source harness is `scripts/jellyfish-browser.mjs`. Raw local outputs stay ignored under `test-results`; these selected small artifacts are deliberately committed for transfer. Limits and the full application/security gates are in [the handoff](../JELLYFISH_HANDOFF_2026-09-17.md).
