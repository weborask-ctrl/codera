---
description: Run the full local gate (Biome, TypeScript, production build) and report a verdict
---

Run the local validation gate for this repository and report honestly.

1. `npm run check` — Biome. If it fails, show the failing rules and offer
   `npm run check:fix` for the autofixable ones.
2. `npm run typecheck` — TypeScript.
3. `npm run build` — production build.
4. Only if all three pass and the change is behavioural: `npm run test:e2e`.

Then report in this exact shape:

```
LOCAL: PASS | FAIL
  biome      ok / N errors
  typecheck  ok / N errors
  build      ok / failed
  e2e        ok / N failed / skipped (reason)
commit: <sha>
```

Rules:
- This is LOCAL validation only. Never call it a release, and never imply CI.
- Do not "fix" a failure by disabling a rule or skipping a test without saying
  so explicitly and explaining why.
- If something fails, diagnose the cause before proposing a change.
