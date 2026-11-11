// usage: pnpm blog:publish <slug> [--on YYYY-MM-DD] [--no-image]
// Checks the post, takes it out of draft with its publish date, and draws its share image.

import { execFileSync } from "node:child_process"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { parseArgs } from "node:util"

import { BLOG_DIR } from "../app/lib/readiness.ts"
import { publishSource } from "./frontmatter.ts"
import { drawShareImages } from "./share-images.ts"

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)))

const {
  values: flags,
  positionals: [slug],
} = parseArgs({
  allowPositionals: true,
  options: { on: { type: "string" }, "no-image": { type: "boolean" } },
})

function fail(message: string): never {
  console.error(message)
  process.exit(1)
}

if (!slug) fail("usage: pnpm blog:publish <slug> [--on YYYY-MM-DD]")
const file = join(ROOT, BLOG_DIR, slug, "en.mdx")
if (!existsSync(file)) fail(`${relative(ROOT, file)} doesn't exist`)
// the writer's own calendar day, not UTC's
const date = flags.on ?? new Date().toLocaleDateString("en-CA")
if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)))
  fail(`--on ${date} isn't a YYYY-MM-DD date`)

try {
  execFileSync(process.execPath, ["scripts/blog-check.ts", slug], {
    cwd: ROOT,
    stdio: "inherit",
  })
} catch {
  fail("\nFix the errors above, then publish again.")
}

writeFileSync(file, publishSource(readFileSync(file, "utf8"), date))
if (!flags["no-image"]) await drawShareImages([slug])

const files = relative(ROOT, join(ROOT, BLOG_DIR, slug)).replaceAll("\\", "/")
console.log(`
${slug} publishes on ${date}${date > new Date().toISOString().slice(0, 10) ? ", with the first deploy on or after it" : ""}.
  Commit:  git add ${files} && git commit -m "feat(marketing): publish ${slug}"
  Then open a PR with the blog post template.
`)
