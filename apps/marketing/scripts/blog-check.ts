// usage: pnpm blog:check [slug…] [--links] [--ci]
// --links also asks each external source whether it still answers; --ci prints GitHub annotations.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { parseArgs } from "node:util"

import { namesOf } from "../app/lib/blog/glossary.ts"
import { postPath } from "../app/lib/blog/paths.ts"
import { parsePost } from "../app/lib/blog/post.ts"
import { readGuides, readPosts, readTerms } from "../app/lib/blog/read-posts.ts"
import {
  BLOG_DIR,
  checkTerms,
  GLOSSARY_DIR,
  GUIDES_DIR,
  readyPaths,
} from "../app/lib/readiness.ts"
import { type Image, type Issue, lintPost } from "./blog-lint.ts"

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)))
const REPO = resolve(ROOT, "../..")

const { values: flags, positionals: slugs } = parseArgs({
  allowPositionals: true,
  options: { links: { type: "boolean" }, ci: { type: "boolean" } },
})

function svgSize(text: string) {
  const box = /viewBox="[\d.-]+[\s,]+[\d.-]+[\s,]+([\d.]+)[\s,]+([\d.]+)"/.exec(
    text
  )
  const width = /\swidth="([\d.]+)"/.exec(text)?.[1] ?? box?.[1]
  const height = /\sheight="([\d.]+)"/.exec(text)?.[1] ?? box?.[2]
  return width && height
    ? { width: Number(width), height: Number(height) }
    : undefined
}

function rasterSize(data: Buffer) {
  if (data.readUInt32BE(0) === 0x89504e47)
    return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) }
  if (data[0] === 0xff && data[1] === 0xd8) {
    let at = 2
    while (at < data.length) {
      const marker = data[at + 1] ?? 0
      // SOF0 to SOF15 carry the size, except the DHT, JPG and DAC markers
      if (
        marker >= 0xc0 &&
        marker <= 0xcf &&
        ![0xc4, 0xc8, 0xcc].includes(marker)
      )
        return {
          height: data.readUInt16BE(at + 5),
          width: data.readUInt16BE(at + 7),
        }
      at += 2 + data.readUInt16BE(at + 2)
    }
  }
  return undefined
}

function readImage(path: string): Image | undefined {
  if (!existsSync(path)) return undefined
  const data = readFileSync(path)
  const size = path.endsWith(".svg")
    ? svgSize(data.toString("utf8"))
    : rasterSize(data)
  return size && { ...size, bytes: data.length }
}

async function deadLinks(urls: readonly string[]) {
  const dead: string[] = []
  await Promise.all(
    urls.map(async (url) => {
      try {
        let response = await fetch(url, {
          method: "HEAD",
          signal: AbortSignal.timeout(10_000),
        })
        // some sites refuse HEAD but serve the page
        if (response.status >= 400)
          response = await fetch(url, { signal: AbortSignal.timeout(10_000) })
        if (response.status >= 400)
          dead.push(`${url} answers ${response.status}`)
      } catch {
        dead.push(`${url} didn't answer`)
      }
    })
  )
  return dead
}

const blogDir = join(ROOT, BLOG_DIR)
const folders = slugs.length
  ? slugs
  : readdirSync(blogDir).filter((name) =>
      statSync(join(blogDir, name)).isDirectory()
    )
const paths = new Set(readyPaths(ROOT, true))
const allPosts = readPosts(blogDir, true)
const terms = readTerms(join(ROOT, GLOSSARY_DIR))
let errors = 0
let warnings = 0
let suggestions = 0

try {
  checkTerms(allPosts, terms)
  const slugsByLang = new Set(allPosts.map((p) => `${p.lang}/${p.slug}`))
  for (const guide of readGuides(join(ROOT, GUIDES_DIR)))
    for (const slug of guide.reading)
      if (!slugsByLang.has(`${guide.lang}/${slug}`))
        throw new Error(
          `${GUIDES_DIR}/${guide.topic}/${guide.lang}.mdx: reading lists "${slug}", which has no ${guide.lang} post`
        )
} catch (error) {
  console.log(`error  ${(error as Error).message}`)
  errors++
}

for (const slug of folders) {
  const dir = join(blogDir, slug)
  if (!existsSync(dir)) {
    console.error(`${BLOG_DIR}/${slug} doesn't exist`)
    errors++
    continue
  }
  for (const name of readdirSync(dir).filter((file) => file.endsWith(".mdx"))) {
    const file = join(dir, name)
    const source = readFileSync(file, "utf8")
    const issues: Issue[] = await lintPost(file, source, {
      paths,
      image: (image) => readImage(join(dir, image)),
      has: (other) => existsSync(join(dir, other)),
      terms: terms
        .filter((term) => name === `${term.lang}.mdx`)
        .map((term) => ({ id: term.id, names: namesOf(term) })),
      posts: allPosts
        .filter((p) => name === `${p.lang}.mdx` && p.slug !== slug)
        .map((p) => ({
          path: `/${p.lang}${postPath(p.slug)}`,
          title: p.title,
          tags: p.tags,
        })),
    })
    if (flags.links && !issues.some((issue) => issue.level === "error")) {
      const urls = parsePost(file, source).sources.map((source) => source.url)
      for (const message of await deadLinks(urls))
        issues.push({ level: "warning", message })
    }

    for (const { level, message, line } of issues) {
      if (level === "error") errors++
      else if (level === "warning") warnings++
      else suggestions++
      if (flags.ci)
        console.log(
          `::${level === "suggestion" ? "notice" : level} file=${relative(REPO, file).replaceAll("\\", "/")}${line ? `,line=${line}` : ""}::${message}`
        )
      else
        console.log(
          `${relative(ROOT, file)}${line ? `:${line}` : ""}  ${level.padEnd(10)}  ${message}`
        )
    }
  }
}

console.log(
  errors || warnings || suggestions
    ? `\n${errors} errors, ${warnings} warnings, ${suggestions} suggestions. Fix the errors before merging; the rest are for the writer and reviewer.`
    : "All posts pass."
)
process.exitCode = errors ? 1 : 0
