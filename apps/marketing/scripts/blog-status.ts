// usage: pnpm blog:status
// What an editor checks before planning posts: drafts, scheduled posts, thin topics and tags, and
// each post's translations.

import { execFileSync } from "node:child_process"
import { existsSync, readdirSync, statSync } from "node:fs"
import { join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { LOCALES } from "@workspace/i18n"

import { isLive, MIN_TAG_POSTS, TAGS, TOPICS } from "../app/lib/blog/list.ts"
import { readPosts } from "../app/lib/blog/read-posts.ts"
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

const english = readPosts(blogDir, true).filter((post) => post.lang === "en")
const live = english.filter((post) => isLive(post))
const section = (title: string, lines: readonly string[]) => {
  console.log(`\n${title}`)
  console.log(
    lines.length ? lines.map((line) => `  ${line}`).join("\n") : "  none"
  )
}

section(
  "Drafts",
  english.filter((post) => post.draft).map((post) => post.slug)
)
section(
  "Scheduled",
  english
    .filter((post) => !post.draft && !isLive(post))
    .map((post) => `${post.publishedAt}  ${post.slug}`)
)
section(
  "Topics, live posts",
  TOPICS.map((topic) => {
    const n = live.filter((post) => post.topic === topic).length
    return `${topic.padEnd(14)} ${n}${n < 2 ? "  thin" : ""}`
  })
)
section(
  "Tags, live posts",
  TAGS.map((tag) => {
    const n = live.filter((post) => post.tags.includes(tag)).length
    return `${tag.padEnd(14)} ${n}${n < MIN_TAG_POSTS ? `  needs ${MIN_TAG_POSTS - n} more for a page` : ""}`
  })
)

const slugs = readdirSync(blogDir).filter((name) =>
  statSync(join(blogDir, name)).isDirectory()
)
const untranslated: string[] = []
const translations = slugs.flatMap((slug) => {
  const dir = join(blogDir, slug)
  if (!existsSync(join(dir, "en.mdx"))) return [`${slug}: no en.mdx`]
  const written = LOCALES.filter(
    (lang) => lang !== "en" && existsSync(join(dir, `${lang}.mdx`))
  )
  if (!written.length) {
    untranslated.push(slug)
    return []
  }
  const source = changedAt(join(dir, "en.mdx"))
  const stale = written.filter(
    (lang) => changedAt(join(dir, `${lang}.mdx`)) < source
  )
  return [
    `${slug}: ${written.length} of ${LOCALES.length - 1}${stale.length ? `, older than the English: ${stale.join(", ")}` : ""}`,
  ]
})
section("Translations", [
  ...translations,
  ...(untranslated.length
    ? [`English only (${untranslated.length}): ${untranslated.join(", ")}`]
    : []),
])
