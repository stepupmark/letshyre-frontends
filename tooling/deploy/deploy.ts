// Uploads one app's build to its bucket and refreshes CloudFront (docs/deployment.md §5).
// usage: node tooling/deploy/deploy.ts --app marketing [--dry-run] [--offline] [--adopt]
//   env: BUCKET, DISTRIBUTION_ID, CSP_MODE (report-only, the default, or enforce),
//        DEPLOY_COMMIT (the commit the build came from), AWS credentials and region
//   --dry-run   reads the bucket, prints the plan, changes nothing; in Actions it also writes
//               `needed=true|false`: whether the files or the live commit would change
//   --offline   with --dry-run: no AWS at all, plans against an empty bucket
//   --adopt     take over a bucket that has files but no deploy manifest yet

import { appendFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { parseArgs } from "node:util"

import { type CspMode, readBuild } from "./build.ts"
import { isAppName } from "./files.ts"
import {
  checkBucket,
  claimManifest,
  type DeployPlan,
  planDeploy,
} from "./plan.ts"

const ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)))

const { values } = parseArgs({
  options: {
    app: { type: "string" },
    "dry-run": { type: "boolean", default: false },
    offline: { type: "boolean", default: false },
    adopt: { type: "boolean", default: false },
  },
})
const app = values.app
if (!isAppName(app)) throw new Error("--app must be marketing, app or admin")
const dryRun = values["dry-run"]
if (values.offline && !dryRun) throw new Error("--offline needs --dry-run")

const required = (name: string) => {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not set`)
  return value
}
const isCspMode = (value: string): value is CspMode =>
  value === "report-only" || value === "enforce"
// an unset GitHub variable arrives as an empty string
const cspMode = process.env.CSP_MODE || "report-only"
if (!isCspMode(cspMode))
  throw new Error("CSP_MODE must be report-only or enforce")

// every setting is read before the bucket is touched, so a missing one can't strand a half deploy
const bucket = values.offline ? "(offline)" : required("BUCKET")
const distributionId = dryRun ? "" : required("DISTRIBUTION_ID")
const commit = process.env.DEPLOY_COMMIT || "unknown"

const local = readBuild(app, join(ROOT, "apps", app, "build"), cspMode)

const aws = values.offline ? undefined : await import("./aws.ts")
const [remote, previous] = aws
  ? await Promise.all([aws.listBucket(bucket), aws.readManifest(bucket)])
  : [[], null]
checkBucket(app, previous, remote, { adopt: values.adopt })
const plan = planDeploy(app, local, remote, previous, { commit })

const uploads = plan.phases.flat()
const summary = (p: DeployPlan) =>
  [
    `${app} → ${bucket}${dryRun ? " (dry run)" : ""}`,
    `${local.length} files in the build, ${remote.length} in the bucket`,
    `upload ${uploads.length}, remove ${p.remove.length}, prune ${p.prune.length} old assets`,
    p.changed ? "invalidate /*" : "nothing changed, no invalidation",
  ].join("\n")

console.log(summary(plan))
if (dryRun) {
  for (const file of uploads) console.log(`  + ${file.key}`)
  for (const key of plan.remove) console.log(`  - ${key}`)
  for (const key of plan.prune) console.log(`  x ${key}`)
  // the workflow records a deployment only when this ships something new
  const needed = plan.changed || previous?.commit !== commit
  if (process.env.GITHUB_OUTPUT)
    appendFileSync(process.env.GITHUB_OUTPUT, `needed=${String(needed)}\n`)
  process.exit(0)
}
if (!aws) throw new Error("unreachable: AWS is only skipped offline")

// a first deploy that fails partway leaves a bucket the next run still recognises as this app's
if (!previous) await aws.writeManifest(bucket, claimManifest(app, commit))
// each phase lands completely before the next one starts
for (const phase of plan.phases) await aws.upload(bucket, phase)
await aws.remove(bucket, plan.remove)
if (plan.changed) {
  const id = await aws.invalidateAll(distributionId)
  console.log(`invalidation ${id} complete`)
}
await aws.remove(bucket, plan.prune)
await aws.writeManifest(bucket, plan.manifest)

if (process.env.GITHUB_STEP_SUMMARY)
  appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    `### Deploy\n\n\`\`\`\n${summary(plan)}\n\`\`\`\n`
  )
