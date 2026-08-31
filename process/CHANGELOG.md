# Process changelog

Every change to how the work is run is recorded here, with its reason.

## 2026-08-31 — Step 6 specified

The first step to be written before it is built rather than after. Four
decisions were taken with Ondrej: the site gains case-study pages while the
home page stays one journey; the three concept worlds are replaced with new
sectors; the offer becomes three priced packages; and nothing new is true about
the business, so every trust device must be carried by craft and transparency
alone. Two inputs remain owed — the package prices, which are commercial and may
not be invented, and confirmation of the three sectors.

## 2026-08-31 — v0.6: the process moves into the repository

Triggered by a review of the repository, its GitHub history and its documents,
which found seven gaps. What changed:

- **The contract is now versioned.** `working-document-v0.5.docx` was archived
  under `process/source/` and transcribed into `process/STEPS.md`. The logo
  creation pack — the source of truth for the brand mark, previously untracked —
  moved into `brand/source/`. Neither was in git before; a disk failure would
  have taken both the project's brief and its identity.
- **Steps 3 and 5 were written down.** Step 3 produced no standalone artefact
  and Step 5 was executed with no specification at all, because the working
  document stops at Step 4. Both are now recorded, Step 5 reconstructed from
  what was actually built. Step 6 exists as a draft to be filled in before any
  content work starts.
- **A six-part step template** is now mandatory: Mission, Inputs, Constraints,
  Deliverables, Completion gate, Validation classes.
- **CI runs on every branch**, split into a fast gate (~1 min: Biome, typecheck,
  build) and Playwright on PRs and `master`. Previously it ran on pushes to
  `master` and one long-dead feature branch, so mistakes were discovered on the
  production branch — twice, on 2026-08-28, both times a lint error catchable
  locally in seconds.
- **`npm run verify` and a pre-push hook** were added so that class of failure
  cannot reach the remote at all.
- **`master` becomes protected and work moves to pull requests**, even for a
  single author — the PR is where validation evidence lives.
- **One `STATE.md` replaced two progress files.** Both claimed "Next phase: None"
  while still listing open items. The durable knowledge moved to `STATE.md`, the
  open items to GitHub Issues, the phase-by-phase history to `docs/archive/`.
- **The four validation classes are enforced** by a pull request template rather
  than by memory.
- **`CLAUDE.md`, `.claude/settings.json`, four slash commands and `.mcp.json`**
  put the working rules where every session reads them.
- **Script triage.** Fifteen ad-hoc capture and probe scripts, none reachable
  from `package.json`, one untracked. The useful ones now have npm entries and a
  `scripts/README.md`; the duplicates were deleted.

Deliberately **not** done: this repository was not marked as a GitHub template.
It carries Codera's own art direction, copy and mark; a template must not hand
those to a client project. The reusable parts belong in `codera-starter` and
`codera-design-intelligence` instead — see `CODERA_PROCESS.md` §8.

## 2026-08-27 — v0.5

Working document issued, defining Steps 1–4 and deliberately leaving the final
01/02/03/04/05 content structure for a later revision. Archived at
`process/source/working-document-v0.5.docx`.
