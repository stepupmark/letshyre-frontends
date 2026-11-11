// usage: pnpm blog:new, or pnpm blog:new --title "…" --audience employers --topic hiring
//   [--tags ai,salary] [--slug …]

import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { stdin, stdout } from "node:process"
import { createInterface } from "node:readline/promises"
import { fileURLToPath } from "node:url"
import { parseArgs } from "node:util"
import GithubSlugger from "github-slugger"

import { MIN_TAG_POSTS, TAGS, TOPICS } from "../app/lib/blog/list.ts"
import { AUDIENCES } from "../app/lib/blog/post.ts"
import { readPosts } from "../app/lib/blog/read-posts.ts"
import { BLOG_DIR } from "../app/lib/readiness.ts"

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)))

const { values: args } = parseArgs({
  options: {
    title: { type: "string" },
    audience: { type: "string" },
    topic: { type: "string" },
    tags: { type: "string" },
    slug: { type: "string" },
  },
})

const prompt = createInterface({ input: stdin, output: stdout })

async function ask(
  question: string,
  given: string | undefined,
  choices?: readonly string[]
): Promise<string> {
  let answer = given
  for (;;) {
    if (answer && (!choices || choices.includes(answer))) return answer
    if (answer) console.log(`  Pick one of: ${choices?.join(", ")}`)
    const hint = choices ? ` (${choices.join(" | ")})` : ""
    answer = (await prompt.question(`${question}${hint}: `)).trim()
  }
}

const title = await ask("Title", args.title)
const audience = await ask("Written for", args.audience, AUDIENCES)
const topic = await ask("Topic", args.topic, TOPICS)

async function askTags(given: string | undefined): Promise<string[]> {
  const posts = readPosts(join(ROOT, BLOG_DIR), false).filter(
    (post) => post.lang === "en"
  )
  if (given === undefined)
    console.log(
      `Tags, up to three:\n${TAGS.map((tag) => {
        const n = posts.filter((post) => post.tags.includes(tag)).length
        return `  ${tag} (${n}${n < MIN_TAG_POSTS ? ", no page yet" : ""})`
      }).join("\n")}`
    )
  let answer = given
  for (;;) {
    answer ??= await prompt.question("Tags, comma-separated, or blank: ")
    const tags = answer
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
    const unknown = tags.filter(
      (tag) => !(TAGS as readonly string[]).includes(tag)
    )
    if (!unknown.length && tags.length <= 3) return tags
    console.log(
      unknown.length ? `  Not a tag: ${unknown.join(", ")}` : "  Three at most"
    )
    answer = undefined
  }
}
const tags = await askTags(args.tags)
// six words keep the URL readable; the title can be longer
const suggested = new GithubSlugger()
  .slug(title)
  .split("-")
  .slice(0, 6)
  .join("-")
const slug =
  args.slug ??
  (args.title
    ? suggested
    : (
        await prompt.question(
          `Slug, the URL, fixed once published (${suggested}): `
        )
      ).trim() || suggested)
prompt.close()

const dir = join(ROOT, BLOG_DIR, slug)
if (existsSync(dir)) {
  console.error(`${BLOG_DIR}/${slug} already exists; pick another slug.`)
  process.exit(1)
}

mkdirSync(dir, { recursive: true })
writeFileSync(
  join(dir, "en.mdx"),
  `---
title: ${JSON.stringify(title)}
description: Write one or two sentences for search results and the blog index.
publishedAt: ${new Date().toISOString().slice(0, 10)}
audience: ${audience}
topic: ${topic}
${tags.length ? `tags: [${tags.join(", ")}]\n` : ""}draft: true
---

{/* Open with the answer in two or three sentences: who this is for and what they'll take away. */}

## The first point

{/* One idea per section. Back a number or a claim with a link or a <Stat>. */}

## The second point

## What to do next
`
)

// a placeholder to draw over; blog:check warns until it's the post's own
for (const cover of ["cover.svg", "cover-dark.svg"])
  copyFileSync(join(ROOT, BLOG_DIR, "cover-template.svg"), join(dir, cover))

console.log(`
Created ${BLOG_DIR}/${slug}/en.mdx as a draft, with covers to draw over.
  See it:    pnpm --filter marketing dev, then /en/blogs/${slug}
  Check it:  pnpm --filter marketing blog:check ${slug}
  Publish:   pnpm --filter marketing blog:publish ${slug}
`)
