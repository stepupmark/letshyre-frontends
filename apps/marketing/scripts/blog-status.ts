// usage: pnpm blog:status
// What an editor checks before planning posts: drafts, scheduled posts, thin topics and tags, the
// phrases and closings posts share, and each post's translations.

import { execFileSync } from "node:child_process"
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { createProcessor } from "@mdx-js/mdx"
import { LOCALES } from "@workspace/i18n"
import remarkFrontmatter from "remark-frontmatter"

import { isLive, MIN_TAG_POSTS, TAGS, TOPICS } from "../app/lib/blog/list.ts"
import { readPosts } from "../app/lib/blog/read-posts.ts"
import { BLOG_DIR } from "../app/lib/readiness.ts"
import { type Node, textOf, walk } from "./mdx-tree.ts"

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

// tuned on the November 2026 posts: the shared pitch endings overlap by a fifth or more
const SHARED_CLOSING = 0.2
const HOUSE_PHRASE_WORDS = 5
const HOUSE_PHRASE_POSTS = 3

const phrases = (text: string, size: number) => {
  const words = text.toLowerCase().match(/[\p{L}\p{N}']+/gu) ?? []
  return new Set(
    words.slice(size - 1).map((_, i) => words.slice(i, i + size).join(" "))
  )
}
const processor = createProcessor({ remarkPlugins: [remarkFrontmatter] })
const prose = english
  .filter((post) => !post.draft)
  .map((post) => {
    const tree = processor.parse(
      readFileSync(join(blogDir, post.slug, "en.mdx"), "utf8")
    ) as Node
    const paragraphs: string[] = []
    walk(tree, (node) => {
      if (node.type === "paragraph") paragraphs.push(textOf(node))
    })
    const closing = (tree.children ?? []).findLast(
      (node) => node.type === "paragraph"
    )
    return {
      slug: post.slug,
      body: phrases(paragraphs.join(" "), HOUSE_PHRASE_WORDS),
      closing: phrases(closing ? textOf(closing) : "", 3),
    }
  })

const usedIn = new Map<string, number>()
for (const { body } of prose)
  for (const phrase of body) usedIn.set(phrase, (usedIn.get(phrase) ?? 0) + 1)
section(
  `Phrases in ${HOUSE_PHRASE_POSTS} or more posts`,
  [...usedIn]
    .filter(([, n]) => n >= HOUSE_PHRASE_POSTS)
    .sort((a, b) => b[1] - a[1])
    .map(([phrase, n]) => `${n}  ${phrase}`)
)
section(
  "Closing paragraphs that read alike",
  prose.flatMap((a, i) =>
    prose.slice(i + 1).flatMap((b) => {
      const shared = [...a.closing].filter((p) => b.closing.has(p)).length
      const share = shared / Math.min(a.closing.size, b.closing.size)
      return share >= SHARED_CLOSING
        ? [`${Math.round(share * 100)}%  ${a.slug}, ${b.slug}`]
        : []
    })
  )
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
