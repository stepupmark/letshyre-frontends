// Decides what the Deploy workflow builds: which apps, at which commit.
// usage (in Actions): node tooling/deploy/affected.ts
//   env: GITHUB_EVENT_NAME, GITHUB_SHA, GITHUB_REPOSITORY, GITHUB_TOKEN, INPUT_APP (dispatch only)
// Writes `include=[{"app":"marketing","ref":"<sha>"}, …]` to GITHUB_OUTPUT.

import { execFileSync } from "node:child_process"
import { appendFileSync } from "node:fs"

import { APPS, type AppName, isAppName } from "./files.ts"

// shared code, the toolchain and the deploy itself change every app's output
const SHARED = [
  "packages/",
  "tooling/csp.ts",
  "tooling/deploy/",
  ".github/workflows/deploy.yml",
  "package.json",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  "turbo.json",
  ".nvmrc",
]

/** Whether a change to these paths can change what `app` serves. */
export const affects = (app: AppName, paths: readonly string[]) =>
  paths.some(
    (path) =>
      path.startsWith(`apps/${app}/`) ||
      SHARED.some((shared) =>
        shared.endsWith("/") ? path.startsWith(shared) : path === shared
      )
  )

interface Target {
  app: AppName
  ref: string
}

// record.ts writes these with the commit that was built, marked success once its files are live
async function lastDeployedSha(app: AppName): Promise<string | null> {
  const api = `https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}`
  const headers = {
    authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    accept: "application/vnd.github+json",
  }
  const get = async <T>(url: string) => {
    const response = await fetch(url, { headers })
    if (!response.ok) throw new Error(`${url}: ${response.status}`)
    return (await response.json()) as T
  }
  const deployments = await get<{ sha: string; statuses_url: string }[]>(
    `${api}/deployments?environment=${app}-production&per_page=30`
  )
  for (const deployment of deployments) {
    const [latest] = await get<{ state: string }[]>(
      `${deployment.statuses_url}?per_page=1`
    )
    if (latest?.state === "success") return deployment.sha
  }
  return null
}

const changedSince = (sha: string): string[] | null => {
  try {
    return execFileSync("git", ["diff", "--name-only", sha, "HEAD"], {
      encoding: "utf8",
    })
      .split("\n")
      .filter(Boolean)
  } catch {
    // the deployed commit isn't in this history (a rewritten branch): treat everything as changed
    return null
  }
}

async function targets(): Promise<Target[]> {
  const head = process.env.GITHUB_SHA
  if (!head) throw new Error("GITHUB_SHA is not set")

  switch (process.env.GITHUB_EVENT_NAME) {
    case "workflow_dispatch": {
      const input = process.env.INPUT_APP ?? "all"
      const apps = input === "all" ? APPS : [input]
      return apps.filter(isAppName).map((app) => ({ app, ref: head }))
    }
    case "schedule": {
      // rebuild what's live so future-dated posts appear; never ship a commit CI hasn't passed
      const sha = await lastDeployedSha("marketing")
      return sha ? [{ app: "marketing", ref: sha }] : []
    }
    default: {
      const result: Target[] = []
      for (const app of APPS) {
        const sha = await lastDeployedSha(app)
        const paths = sha ? changedSince(sha) : null
        if (!paths || affects(app, paths)) result.push({ app, ref: head })
      }
      return result
    }
  }
}

if (import.meta.main) {
  const include = await targets()
  console.log(
    include.length
      ? include.map((t) => `${t.app} @ ${t.ref.slice(0, 8)}`).join("\n")
      : "nothing to deploy"
  )
  if (process.env.GITHUB_OUTPUT)
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      `include=${JSON.stringify(include)}\n`
    )
}
