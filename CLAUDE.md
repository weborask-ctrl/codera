# CLAUDE.md

Read this before touching anything. It is short on purpose; the long form is in
`process/CODERA_PROCESS.md`.

## What this is

The website of Codera, a Slovak creative web studio. The site is its own primary
proof artefact, so its execution standard is the product. Live on
`https://www.codera.sk`. Site copy is Slovak; code, comments and documentation
are English.

## Stack

Next 16.2.6 (App Router) · React 19.2.4 · Tailwind 4 · GSAP + ScrollTrigger ·
React Three Fiber + three · Biome 2.5.9 · Playwright · TypeScript.

**Next 16 has breaking changes against your training data.** Read the relevant
guide in `node_modules/next/dist/docs/` before writing App Router code — see
`AGENTS.md`.

## Where the truth is

| Question | File |
| --- | --- |
| What am I supposed to build? | `process/STEPS.md` |
| How is work run and gated? | `process/CODERA_PROCESS.md` |
| What is live, what was decided? | `STATE.md` |
| What is still open? | GitHub Issues |
| How should it look? | `CODERA_ART_DIRECTION_V2.md` |
| How does the experience behave? | `CODERA_STEP5_ARCHITECTURE.md` |
| Design knowledge for any project | `CODERA_DESIGN_INTELLIGENCE/` |
| The brand mark | `brand/source/` → `CODERA_3D_LOGO_DELIVERABLES/` |

## Commands

```
npm run verify      # the gate: biome + typecheck + build
npm run check:fix   # biome, autofix
npm run test:e2e    # playwright
npm run capture     # screenshots across devices
npm run smoke       # smoke test a preview or production URL
```

Slash commands: `/verify`, `/release-check`, `/capture`, `/audit-live`.

## Non-negotiable

1. **No synthetic smooth-scroll layer.** No Lenis, Locomotive Scroll,
   ScrollSmoother. The world may interpolate; user input must feel immediate.
2. **Readability overrides choreography.** Every important text state needs
   ENTER → FULLY READABLE HOLD → EXIT. No copy living at low opacity. Every
   major state passes the static-frame test: paused, it must still look composed.
3. **Nothing about the business is invented.** No testimonials, clients,
   metrics, awards, IČO/DIČ. Portfolio concepts stay labelled `Koncept`.
   `lib/site-config.ts` is the only source of business facts.
4. **One motion engine** — GSAP + ScrollTrigger. R3F renders; it does not
   animate.
5. **Reduced motion is a layout, not a fallback.**
6. **Style is derived from context**, never from a default aesthetic. Not
   permanently dark: dark/light contrast is dramaturgy.
7. **A step never starts without its contract** in `process/STEPS.md`.

## Declaring things done

Four validation classes, never interchangeable. Always name the strongest one
actually achieved:

| Class | Evidence required |
| --- | --- |
| LOCAL | commit SHA, `npm run verify` green |
| CI | run ID of a green GitHub Actions run |
| PREVIEW | the deployed URL that was checked |
| DEVICE | device, OS, who checked, when |

A local screenshot is not a release. A green local run is not a green CI run.
Emulation is never real-device validation. `NOT VALIDATED — reason: …` is an
acceptable answer; silence is not.

## Working rules

- Branch (`feat/*`, `fix/*`, `design/*`, `content/*`, `chore/*`), never commit to
  `master`. Every change reaches `master` through a pull request.
- Run `npm run verify` before pushing. The pre-push hook will run the fast half
  anyway.
- A one-off script either becomes an entry in `package.json` and
  `scripts/README.md` in the same PR, or it is deleted.
- Do not restyle or cosmetically polish something the audit told you to replace.
- If the specification is wrong, stop and say so. Do not improvise the contract.
