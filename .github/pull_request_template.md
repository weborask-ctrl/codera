## What and why

<!-- One paragraph. What changed, and which step or issue it serves. -->

Closes #

## Validation

Fill in the evidence, not a tick. `NOT VALIDATED — reason: …` is an acceptable
answer; a blank field is not. See `process/CODERA_PROCESS.md` §6.

- [ ] **LOCAL** — `npm run verify` green · commit:
- [ ] **CI** — run ID and link:
- [ ] **PREVIEW** — URL checked:
- [ ] **DEVICE** — device, OS, who, when: <!-- or: NOT VALIDATED — no hardware -->

## Step contract

- [ ] This PR changes no step contract
- [ ] This PR executes a step — which, and which gate items it completes:
- [ ] This PR changes `process/` — `CHANGELOG.md` updated

## Checks

- [ ] Nothing about the business is invented (no testimonials, clients, metrics,
      awards, registration data); concepts stay labelled `Koncept`
- [ ] No synthetic smooth-scroll layer added
- [ ] Every new text state passes the static-frame test
- [ ] Any one-off script added is documented in `scripts/README.md`, or deleted
- [ ] Reduced motion still yields a readable static layout
