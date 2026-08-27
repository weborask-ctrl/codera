/* Polls GitHub Actions for the given SHA on weborask-ctrl/codera and, once
   concluded, prints the Vercel preview URL from the deployments API. Token
   comes from `git credential fill` (never printed). */
import { execSync } from "node:child_process"

const SHA = process.argv[2]
if (!SHA) {
  console.error("usage: node watch-ci-preview.mjs <sha>")
  process.exit(1)
}
const cred = execSync("git credential fill", {
  input: "protocol=https\nhost=github.com\n\n",
  encoding: "utf8",
})
const token = cred.match(/^password=(.+)$/m)?.[1]
const gh = async (path) => {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
  })
  return res.json()
}

const deadline = Date.now() + 25 * 60 * 1000
let ciDone = false
while (Date.now() < deadline) {
  if (!ciDone) {
    const runs = await gh(`/repos/weborask-ctrl/codera/actions/runs?head_sha=${SHA}`)
    const run = runs.workflow_runs?.[0]
    if (run) {
      console.log(`CI: ${run.status} ${run.conclusion ?? ""} (${run.html_url})`)
      if (run.status === "completed") {
        ciDone = true
        if (run.conclusion !== "success") {
          process.exit(2)
        }
      }
    } else {
      console.log("CI: no run yet")
    }
  }
  if (ciDone) {
    const deps = await gh(`/repos/weborask-ctrl/codera/deployments?sha=${SHA}`)
    for (const d of deps ?? []) {
      const statuses = await gh(`/repos/weborask-ctrl/codera/deployments/${d.id}/statuses`)
      const ok = statuses.find?.((s) => s.state === "success" && s.environment_url)
      if (ok) {
        console.log(`PREVIEW: ${ok.environment_url}`)
        process.exit(0)
      }
    }
    console.log("preview: not ready yet")
  }
  await new Promise((r) => setTimeout(r, 45_000))
}
console.log("TIMEOUT")
process.exit(3)
