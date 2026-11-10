// usage: pnpm blog:translations [slug…]
// Which locales each post is in, and which translations are older than the English they follow.

import { execFileSync } from "node:child_process"
import { existsSync, readdirSync, statSync } from "node:fs"
import { join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { LOCALES } from "@workspace/i18n"

import { BLOG_DIR } from "../app/lib/readiness.ts"

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)))
const blogDir = join(ROOT, BLOG_DIR)

/** When the file last changed in git; an uncommitted file counts as changed now. */
function changedAt(file: string): string {
  const date = execFileSync("git", ["log", "-1", "--format=%cI", "--", file], {
    cwd: ROOT,
    encoding: "utf8",
  }).trim()
  return date || new Date().toISOString()
}

const asked = process.argv.slice(2)
const slugs = asked.length
  ? asked
  : readdirSync(blogDir).filter((name) =>
      statSync(join(blogDir, name)).isDirectory()
    )

for (const slug of slugs) {
  const dir = join(blogDir, slug)
  const english = join(dir, "en.mdx")
  if (!existsSync(english)) {
    console.log(`${slug}: no en.mdx`)
    continue
  }
  const source = changedAt(english)
  const written = LOCALES.filter(
    (lang) => lang !== "en" && existsSync(join(dir, `${lang}.mdx`))
  )
  const stale = written.filter(
    (lang) => changedAt(join(dir, `${lang}.mdx`)) < source
  )
  const missing = LOCALES.filter(
    (lang) => lang !== "en" && !written.includes(lang)
  )

  console.log(
    [
      `${slug}: ${written.length} of ${LOCALES.length - 1} translations`,
      stale.length &&
        `  older than the English, so review: ${stale.join(", ")}`,
      missing.length && `  missing: ${missing.join(", ")}`,
    ]
      .filter(Boolean)
      .join("\n")
  )
}
