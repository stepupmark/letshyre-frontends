// Fails when a shadcn component in packages/ui no longer matches the registry.
// Those files are CLI-owned: change them with `shadcn add --overwrite`, never by hand.

import { execFileSync } from "node:child_process"
import { readdirSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const UI = resolve(dirname(fileURLToPath(import.meta.url)), "../packages/ui")

const components = readdirSync(resolve(UI, "src/components"))
  .filter((f) => f.endsWith(".tsx"))
  .map((f) => f.slice(0, -4))

if (components.length === 0) {
  console.log("ui-drift: no components installed")
  process.exit(0)
}

const cli = resolve(UI, "node_modules/shadcn/dist/index.js")
const output = execFileSync(
  process.execPath,
  [cli, "add", ...components, "--diff"],
  { cwd: UI, encoding: "utf8" }
)

const drifted = [...output.matchAll(/^\S+\s+(\S+)\s+\(overwrite\)/gm)].map(
  (m) => m[1]
)

if (drifted.length > 0) {
  console.error(
    `ui-drift: ${drifted.length} file(s) differ from the shadcn registry:\n  ${drifted.join("\n  ")}`
  )
  process.exit(1)
}

console.log(`ui-drift: ${components.length} component(s) match the registry`)
