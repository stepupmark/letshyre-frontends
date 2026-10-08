import { readdirSync, readFileSync } from "node:fs"
import { gzipSync } from "node:zlib"
import { CLIENT_DIR } from "./security-headers.mjs"

// JS a page adds on top of the app shell (entry + root), which every page loads
const BUDGET_KB = 150

const manifestFile = readdirSync(`${CLIENT_DIR}assets`).find((file) =>
  /^manifest-.*\.js$/.test(file)
)
const manifest = JSON.parse(
  readFileSync(`${CLIENT_DIR}assets/${manifestFile}`, "utf8")
    .replace(/^window\.__reactRouterManifest=/, "")
    .replace(/;$/, "")
)

const sizes = new Map()
function gzipKb(file) {
  if (!sizes.has(file))
    sizes.set(
      file,
      gzipSync(readFileSync(`${CLIENT_DIR}${file.slice(1)}`)).length / 1024
    )
  return sizes.get(file)
}

function chunks(route) {
  const modules = Object.entries(route)
    .filter(
      ([key, value]) => key.endsWith("Module") && typeof value === "string"
    )
    .map(([, value]) => value)
  return [route.module, ...modules, ...(route.imports ?? [])]
}

const { routes } = manifest
const parents = new Set(Object.values(routes).map((route) => route.parentId))
const shell = new Set([
  manifest.entry.module,
  ...manifest.entry.imports,
  ...chunks(routes.root),
])
const sum = (files) => [...files].reduce((kb, file) => kb + gzipKb(file), 0)
console.log(`  app shell ${sum(shell).toFixed(1)} KB\n`)

const rows = Object.values(routes)
  .filter((route) => !parents.has(route.id))
  .map((leaf) => {
    const files = new Set()
    for (let route = leaf; route; route = routes[route.parentId])
      chunks(route).forEach((file) => shell.has(file) || files.add(file))
    return { route: leaf.id.replace(/^routes\//, ""), kb: sum(files) }
  })
  .sort((a, b) => b.kb - a.kb)

for (const { route, kb } of rows)
  console.log(
    `${kb > BUDGET_KB ? "✗" : "✓"} ${kb.toFixed(1).padStart(6)} KB  ${route}`
  )

const over = rows.filter((row) => row.kb > BUDGET_KB)
if (over.length) {
  console.error(
    `\n${over.length} route(s) over the ${BUDGET_KB} KB gzip budget`
  )
  process.exit(1)
}
