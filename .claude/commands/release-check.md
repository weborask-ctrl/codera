---
description: Check the remote CI run and the live site, and report the validation classes reached
---

Establish what is actually true about the current state of the remote, not what
is hoped.

1. `gh run list --limit 5` — find the run for the current HEAD commit.
2. If it is still in progress, wait for it (`gh run watch`) rather than guessing.
3. If it failed: `gh run view <id> --log-failed`, identify the failing job and
   step, and name the root cause.
4. Check production: `curl -s -o /dev/null -w "%{http_code} %{time_total}s" https://www.codera.sk`
5. If a preview URL exists for the branch, check that too.

Report in this exact shape:

```
LOCAL:   PASS / FAIL / not run
CI:      PASS / FAIL / running — run <id>, <url>
PREVIEW: PASS / FAIL / n/a — <url>
DEVICE:  NOT VALIDATED — <reason>   (unless a human reported otherwise)
```

Rules:
- Never report CI as green without a run ID.
- A green local run is not a green CI run. Say which one you have.
- Never claim DEVICE validation. Only a human with hardware can supply it; hand
  over `docs/DEVICE_CHECKLIST.md` instead.
