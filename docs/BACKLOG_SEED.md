# Backlog seed

The open items found in the two archived progress files on 2026-08-31, ready to
be opened as GitHub Issues. **This file is temporary**: once the issues exist,
it is deleted and the backlog lives only in Issues.

---

### 1. Real-device validation on a physical iPhone — `blocker` `verify`

The current release has never been checked on real hardware; the working
document (Step 4 §8) forbids inferring mobile quality from emulation. No machine
running Claude has a device attached, so only a human can close this.

*Acceptance:* `docs/DEVICE_CHECKLIST.md` completed, all twelve checks recorded,
result pasted here. *Validation:* DEVICE.

---

### 2. Content Security Policy — `debt`

`next.config.ts` ships no CSP. A correct one for the App Router needs
per-request nonces, i.e. `middleware.ts` with `strict-dynamic`. Documented as
deliberate in the old progress file, which is where it went to sleep.

*Acceptance:* CSP served in production; no console violations; the GSAP/R3F
inline paths still work. *Validation:* CI + PREVIEW.

---

### 3. Company registration details in the footer — `legal` (blocked)

`legal.hasRegisteredEntity` is `false`; no IČO, DIČ, VAT status or registered
office appears anywhere, because inventing them would be a legal problem.
Blocked on the legal entity existing.

*Acceptance:* real values in `lib/site-config.ts` and the footer, or a recorded
decision to stay unregistered. *Validation:* LOCAL.

---

### 4. Font payload — 209 KB — `debt`

Archivo's width axis roughly doubles the file. The axis is used deliberately
(the offer scene animates on it), but fonts are the single largest asset on the
page.

*Acceptance:* subset to the used range, or ship static instances for the widths
actually rendered; before/after numbers recorded; the offer scene unchanged to
the eye. *Validation:* LOCAL + PREVIEW.

---

### 5. Fidelity pass of the mark against the approved raster — `verify`

The parametric reconstruction has never been placed side by side with
`brand/source/02_CODERA_C_MARK_REFERENCE.png` at the same scale. Step 2's gate
requires exactly that comparison.

*Acceptance:* one comparison image in the PR, verdict recorded, geometry
adjusted or explicitly accepted. *Validation:* LOCAL.

---

### 6. Imagery selection and `SOURCES.md` — `content`

Photography for atmosphere and project texture was never chosen. Licensing must
be recorded per file (CC0 or purchased only).

*Acceptance:* images chosen, `SOURCES.md` created with a licence line per file.
*Validation:* LOCAL + PREVIEW. Belongs to Step 6.

---

### 7. /02 legibility on a phone — `design`

At roughly 360 px the two sites read as an impression rather than as pages.
Arguably the point ("dojem"), but a zoomed crop would land harder.

*Acceptance:* a decision, taken against a captured frame — either a crop variant
shipped, or the current treatment recorded as intentional in `STATE.md`.
*Validation:* PREVIEW + DEVICE.

---

### 8. Delete the superseded scripts — `debt`

`capture-v3`, `capture-v4`, `probe-premena`, `probe-premena2`,
`watch-ci-preview` are duplicates or single-task leftovers; see
`scripts/README.md`.

*Acceptance:* removed, `scripts/README.md` section deleted. *Validation:* LOCAL.
