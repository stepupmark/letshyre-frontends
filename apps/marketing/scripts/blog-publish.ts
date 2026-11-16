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
// UTC, as the build reads it; the time orders posts published on the same day
const now = new Date().toISOString()
const today = now.slice(0, 10)
const date = flags.on ?? now.slice(0, 16)
if (
  flags.on &&
  (!/^\d{4}-\d{2}-\d{2}$/.test(flags.on) || Number.isNaN(Date.parse(flags.on)))
)
  fail(`--on ${flags.on} isn't a YYYY-MM-DD date`)
const day = date.slice(0, 10)
const localDay = new Date().toLocaleDateString("en-CA")

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
const later = day > today ? ", with the first build on or after it" : ""
const calendar =
  !flags.on && localDay !== day
    ? `\n  That's ${localDay} on your calendar; the site goes by UTC.`
    : ""
console.log(`
${slug} publishes on ${day} (UTC)${later}.${calendar}
  Commit:  git add ${files} && git commit -m "feat(marketing): publish ${slug}"
  Then open a PR with the blog post template.
`)
