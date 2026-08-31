# CODERA — how we work

The operating manual for this repository. `STEPS.md` says *what* is to be built;
this file says *how* the work is run, gated and declared finished.

Written 2026-08-31, after a review of the repository, its GitHub history and its
documents found seven process gaps. Each section below closes one of them.

---

## 1. Sources of truth

Nothing is authoritative unless it lives here.

| Subject | Source of truth |
| --- | --- |
| What to build, step by step | `process/STEPS.md` |
| How work is run | this file |
| Original human input, archived | `process/source/working-document-v0.5.docx` |
| Design knowledge, reusable | `CODERA_DESIGN_INTELLIGENCE/` |
| Visual contract for the current site | `CODERA_ART_DIRECTION_V2.md` |
| The brand mark | `brand/source/` (approved references) → `CODERA_3D_LOGO_DELIVERABLES/` (built asset) |
| Current state of the product | `STATE.md` |
| Everything still open | GitHub Issues |
| Rules Claude must follow | `CLAUDE.md` |
| Superseded history | `docs/archive/` |

Two consequences, both deliberate:

- **A `.docx` is an input, never a contract.** It arrives, gets archived under
  `process/source/`, and is transcribed into `STEPS.md` in the same pull request.
  Word files cannot be diffed, grepped or reviewed line by line; the markdown
  can.
- **Progress files are not a backlog.** `docs/archive/REDESIGN_PROGRESS.md` and
  `docs/archive/SPATIAL_REDESIGN_PROGRESS.md` both ended their lives claiming
  "Next phase: None" while still listing open items. Open items now live in
  Issues, where they have a state and cannot be quietly forgotten.

---

## 2. Who does what

| Context | Job | May it change `app/`, `components/`? |
| --- | --- | --- |
| **Design session** (this kind of chat) | Write and revise step specifications, art direction, process. Produce the contract. | No |
| **Implementation session** | Execute an approved step contract. | Yes |
| **Human (Ondrej)** | Approve step specifications, run real-device validation, decide anything commercial or legal. | — |

An implementation session that finds the specification wrong stops and says so.
It does not improvise the contract, and it does not widen scope on its own.

---

## 3. Branches, gates, and the rule that keeps `master` green

Two red CI runs landed directly on `master` on 2026-08-28, both caused by a lint
error that takes five seconds to catch locally. Three layers now stand in the
way, each cheaper than the one after it.

**Layer 1 — local.**

```
npm run verify      # biome + typecheck + build
```

**Layer 2 — pre-push hook.** `.githooks/pre-push` runs Biome and TypeScript
(~10 s) and refuses the push if either fails. Enabled once per clone:

```
git config core.hooksPath .githooks
```

**Layer 3 — CI.** `.github/workflows/ci.yml` runs on **every branch**, not only
on `master`, and is split so feedback is fast:

| Job | Contents | Runs on | Duration |
| --- | --- | --- | --- |
| `fast` | Biome → typecheck → production build | every push, every PR | ~1 min |
| `e2e` | Playwright + report artefact | PRs and `master` | ~4 min |

**Branch model.** `master` is production and is protected. Work happens on
`feat/*`, `design/*`, `fix/*`, `content/*`, `chore/*` and reaches `master` only
through a pull request — even for a single author. The PR is where the evidence
of validation lives (§6); that is its purpose, not ceremony.

**Merged branches are deleted immediately**, locally and on the remote. A stale
merged branch is a trap for whoever branches from it next.

---

## 4. The life of a step

No implementation begins without a written step contract. Step 5 was built
without one; the site turned out well and the process was still wrong, because
there was nothing to measure the completion gate against.

**Template** — every step in `STEPS.md` has these six parts:

```
1. Mission            what must be achieved, in one sentence
2. Inputs             which files are the source of truth, and where they are
3. Constraints        what is forbidden, stated explicitly
4. Deliverables       the concrete files that exist when the step is done
5. Completion gate    a measurable checklist, not an impression
6. Validation classes which of LOCAL / CI / PREVIEW / DEVICE are required
```

**Sequence.** Design session drafts the step → human approves → the contract is
merged into `STEPS.md` → an implementation session executes it → the gate is
checked item by item in the pull request → the step is marked DONE with the date.

**A step is never marked DONE while its gate has an unchecked box.** If one
cannot be met, it becomes an Issue and the step records that explicitly.

---

## 5. The backlog

GitHub Issues, with these labels:

| Label | Meaning |
| --- | --- |
| `blocker` | Cannot release with this open |
| `verify` | Something is believed done but has not been proven |
| `debt` | A deliberate compromise with a written plan to repay it |
| `design` | An open art-direction or composition decision |
| `content` | Copy, imagery, portfolio material |
| `legal` | Blocked on the real world (registration, contracts, licences) |

Every issue states its **acceptance criteria** and its **required validation
class**. An issue is closed by a merged pull request that references it, never
by an opinion.

`STATE.md` holds the durable knowledge: what is live, the architectural
decisions, and the hard-won findings that must not be relearned. It may say
"nothing open" only when the backlog is genuinely empty; otherwise it names the
count.

---

## 6. What "done" means

The working document (Step 4 §8) requires four classes of validation to be kept
apart. They are not interchangeable, and the strongest available one is always
named:

| Class | Meaning | Evidence |
| --- | --- | --- |
| **LOCAL** | `npm run verify` passed on this machine | commit SHA |
| **CI** | The remote GitHub Actions run is green | run ID and link |
| **PREVIEW** | Checked on a deployed preview URL | the URL |
| **DEVICE** | Checked on real hardware by a human | device, OS, who, when |

Rules:

- Never write "done", "hotovo", "released" or "fixed" without naming the class.
- A local screenshot never substitutes for a green remote run. If CI cannot be
  reached, that limitation is reported instead of being treated as success.
- Real iPhone / Safari behaviour is never inferred from emulation. When no
  device is available, say so and hand over `docs/DEVICE_CHECKLIST.md`.
- `NOT VALIDATED — reason: …` is an acceptable answer. A blank field is not.

`.github/pull_request_template.md` enforces this at the only place where it
matters.

---

## 7. Commands

| Command | Purpose |
| --- | --- |
| `npm run verify` | The full local gate: Biome, TypeScript, production build |
| `npm run check` / `check:fix` | Biome only |
| `npm run typecheck` | TypeScript only |
| `npm run test:e2e` | Playwright |
| `npm run capture` | Screenshots across devices (`scripts/capture-devices.mjs`) |
| `npm run measure` | Experience/performance measurement |
| `npm run smoke` | Smoke test against a preview or production URL |
| `npm run brand:glb` | Rebuild the ribbon GLB from source parameters |

Claude has these as slash commands in `.claude/commands/`: `/verify`,
`/release-check`, `/capture`, `/audit-live`.

**Rule for one-off scripts.** A script written during a task either becomes a
documented entry in `package.json` and `scripts/README.md` in the same pull
request, or it is deleted. Nothing is kept "for later" — git remembers.

---

## 8. Reuse across client projects

The design intelligence library is the most valuable reusable asset in this
repository and it must not stay locked inside the studio's own website.

| Repository | Contents | Why separate |
| --- | --- | --- |
| `codera` (this one) | The studio's own site | It is a portfolio piece, not a skeleton |
| `codera-starter` | Next + Tailwind + Biome + Playwright + CI + `.claude/` + an empty `process/` | A template must not carry another brand's identity |
| `codera-design-intelligence` | The library and its decision engine | Reused per client, own lifecycle |

This repository is therefore **not** marked as a GitHub template. Marking it
would hand every client project Codera's own art direction, copy and mark.

---

## 9. Non-negotiables

The short version lives in `CLAUDE.md`, where every session reads it. The
authority for all of them is `STEPS.md`:

1. No synthetic smooth-scroll layer — no Lenis, Locomotive, ScrollSmoother.
2. Readability overrides choreography, always.
3. Nothing about the business is invented: no testimonials, clients, metrics,
   awards or registration numbers. Concepts stay labelled `Koncept`.
4. One motion engine: GSAP + ScrollTrigger.
5. Reduced motion is a layout, not a fallback.
6. Style is derived from the client's context, never from a default aesthetic.
7. A step never starts without its contract; a claim never ships without its
   validation class.
