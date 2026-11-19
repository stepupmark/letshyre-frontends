// Records a deploy as a GitHub deployment of the commit that was built. The deploy job's
// environment has `deployment: false`, because GitHub's automatic record carries the workflow's
// commit, which isn't the built one for a nightly rebuild or a rollback. affected.ts reads these.
// usage: node tooling/deploy/record.ts start --app marketing --ref <sha>
//        node tooling/deploy/record.ts finish --id <deployment id> --state success|failure [--url …]
//   env: GITHUB_REPOSITORY, GITHUB_TOKEN; start writes `id=<n>` to GITHUB_OUTPUT

import { appendFileSync } from "node:fs"
import { parseArgs } from "node:util"

import { isAppName } from "./files.ts"

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    app: { type: "string" },
    ref: { type: "string" },
    id: { type: "string" },
    state: { type: "string" },
    url: { type: "string" },
  },
})

const api = `https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/deployments`

async function post<T>(url: string, body: object): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      accept: "application/vnd.github+json",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  })
  if (!response.ok)
    throw new Error(`${url}: ${response.status} ${await response.text()}`)
  return (await response.json()) as T
}

const [command] = positionals
if (command === "start") {
  if (!isAppName(values.app))
    throw new Error("--app must be marketing, app or admin")
  if (!values.ref) throw new Error("--ref is required")
  const { id } = await post<{ id: number }>(api, {
    ref: values.ref,
    environment: `${values.app}-production`,
    auto_merge: false,
    // CI ran in this workflow already; GitHub's own status check would block a rollback
    required_contexts: [],
    production_environment: true,
    description: `${values.app} at ${values.ref.slice(0, 8)}`,
  })
  await post(`${api}/${id}/statuses`, { state: "in_progress" })
  console.log(`deployment ${id} started`)
  if (process.env.GITHUB_OUTPUT)
    appendFileSync(process.env.GITHUB_OUTPUT, `id=${id}\n`)
} else if (command === "finish") {
  if (!values.id) throw new Error("--id is required")
  if (values.state !== "success" && values.state !== "failure")
    throw new Error("--state must be success or failure")
  await post(`${api}/${values.id}/statuses`, {
    state: values.state,
    ...(values.url && { environment_url: values.url }),
  })
  console.log(`deployment ${values.id}: ${values.state}`)
} else {
  throw new Error("usage: record.ts start|finish …")
}
