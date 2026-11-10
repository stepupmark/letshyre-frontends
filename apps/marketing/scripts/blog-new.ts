// usage: pnpm blog:new, or pnpm blog:new --title "…" --audience employers --topic hiring [--slug …]

import { existsSync, mkdirSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { stdin, stdout } from "node:process"
import { createInterface } from "node:readline/promises"
import { fileURLToPath } from "node:url"
import { parseArgs } from "node:util"
import GithubSlugger from "github-slugger"

import { TOPICS } from "../app/lib/blog/list.ts"
import { AUDIENCES } from "../app/lib/blog/post.ts"
import { BLOG_DIR } from "../app/lib/readiness.ts"

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)))

const { values: args } = parseArgs({
  options: {
    title: { type: "string" },
    audience: { type: "string" },
    topic: { type: "string" },
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
draft: true
---

{/* Open with the answer in two or three sentences: who this is for and what they'll take away. */}

## The first point

{/* One idea per section. Back a number or a claim with a link or a <Stat>. */}

## The second point

## What to do next
`
)

console.log(`
Created ${BLOG_DIR}/${slug}/en.mdx as a draft.
  See it:    pnpm --filter marketing dev, then /en/blogs/${slug}
  Check it:  pnpm --filter marketing blog:check ${slug}
  Publish:   remove draft: true and set publishedAt
`)
