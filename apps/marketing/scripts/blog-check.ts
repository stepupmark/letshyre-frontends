// usage: pnpm blog:check [slug…] [--links] [--ci] [--base <ref>] [--watch]
// --links asks each external source whether it still answers; --ci prints GitHub annotations;
// --base compares published posts with that ref to ask for updatedAt; --watch reruns on save.

import { execFileSync } from "node:child_process"
import { existsSync, readdirSync, readFileSync, statSync, watch } from "node:fs"
import { join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { parseArgs } from "node:util"

import { namesOf, parseTerm } from "../app/lib/blog/glossary.ts"
import { postPath } from "../app/lib/blog/paths.ts"
import { parsePost } from "../app/lib/blog/post.ts"
import {
  readGuides,
  readPosts,
  readSeries,
  readTerms,
} from "../app/lib/blog/read-posts.ts"
import {
  BLOG_DIR,
  checkTerms,
  GLOSSARY_DIR,
  GUIDES_DIR,
  readyPaths,
  SERIES_DIR,
} from "../app/lib/readiness.ts"
import { type Image, type Issue, lintBody, lintPost } from "./blog-lint.ts"

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)))
const REPO = resolve(ROOT, "../..")

const { values: flags, positionals: slugs } = parseArgs({
  allowPositionals: true,
  options: {
    links: { type: "boolean" },
    ci: { type: "boolean" },
    base: { type: "string" },
    watch: { type: "boolean" },
  },
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
const template = readFileSync(join(blogDir, "cover-template.svg"))

const placeholdersIn = (dir: string) =>
  ["cover.svg", "cover-dark.svg"].filter(
    (name) =>
      existsSync(join(dir, name)) &&
      readFileSync(join(dir, name)).equals(template)
  )

const mdxIn = (dir: string) =>
  existsSync(dir)
    ? readdirSync(dir)
        .filter((name) => statSync(join(dir, name)).isDirectory())
        .flatMap((name) =>
          readdirSync(join(dir, name))
            .filter((file) => file.endsWith(".mdx"))
            .map((file) => join(dir, name, file))
        )
    : []

/** The file on the base branch, or undefined when it's new there. */
function atBase(file: string): string | undefined {
  if (!flags.base) return undefined
  try {
    return execFileSync(
      "git",
      ["show", `${flags.base}:${relative(REPO, file).replaceAll("\\", "/")}`],
      { cwd: REPO, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
    )
  } catch {
    return undefined
  }
}

async function check() {
  const folders = slugs.length
    ? slugs
    : readdirSync(blogDir).filter((name) =>
        statSync(join(blogDir, name)).isDirectory()
      )
  const paths = new Set(readyPaths(ROOT, true))
  const allPosts = readPosts(blogDir, true)
  const terms = readTerms(join(ROOT, GLOSSARY_DIR))
  const count = { error: 0, warning: 0, suggestion: 0 }

  const report = (file: string, issues: readonly Issue[]) => {
    for (const { level, message, line } of issues) {
      count[level]++
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

  try {
    checkTerms(allPosts, terms)
    const slugsByLang = new Set(allPosts.map((p) => `${p.lang}/${p.slug}`))
    for (const guide of readGuides(join(ROOT, GUIDES_DIR)))
      for (const slug of guide.reading)
        if (!slugsByLang.has(`${guide.lang}/${slug}`))
          throw new Error(
            `${GUIDES_DIR}/${guide.topic}/${guide.lang}.mdx: reading lists "${slug}", which has no ${guide.lang} post`
          )
    for (const series of readSeries(join(ROOT, SERIES_DIR)))
      for (const slug of series.posts)
        if (!slugsByLang.has(`${series.lang}/${slug}`))
          throw new Error(
            `${SERIES_DIR}/${series.id}/${series.lang}.mdx: posts lists "${slug}", which has no ${series.lang} post`
          )
  } catch (error) {
    console.log(`error  ${(error as Error).message}`)
    count.error++
  }

  for (const slug of folders) {
    const dir = join(blogDir, slug)
    if (!existsSync(dir)) {
      console.error(`${BLOG_DIR}/${slug} doesn't exist`)
      count.error++
      continue
    }
    for (const name of readdirSync(dir).filter((f) => f.endsWith(".mdx"))) {
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
        before: atBase(file),
        placeholders: placeholdersIn(dir),
      })
      if (flags.links && !issues.some((issue) => issue.level === "error")) {
        const urls = parsePost(file, source).sources.map((s) => s.url)
        for (const message of await deadLinks(urls))
          issues.push({ level: "warning", message })
      }
      report(file, issues)
    }
  }

  // entries and guides belong to no post, so they're checked when every post is
  if (!slugs.length) {
    for (const file of mdxIn(join(ROOT, GLOSSARY_DIR))) {
      const source = readFileSync(file, "utf8")
      let short: string | undefined
      try {
        short = parseTerm(file, source).short
      } catch (error) {
        report(file, [{ level: "error", message: (error as Error).message }])
        continue
      }
      report(file, await lintBody(source, paths, short))
    }
    for (const file of mdxIn(join(ROOT, GUIDES_DIR)))
      report(file, await lintBody(readFileSync(file, "utf8"), paths))
  }

  const { error, warning, suggestion } = count
  console.log(
    error || warning || suggestion
      ? `\n${error} errors, ${warning} warnings, ${suggestion} suggestions. Fix the errors before merging; the rest are for the writer and reviewer.`
      : "All posts pass."
  )
  return error
}

if (flags.watch) {
  const dirs = slugs.length
    ? slugs.map((slug) => join(blogDir, slug))
    : [join(ROOT, "content")]
  let timer: ReturnType<typeof setTimeout> | undefined
  const rerun = () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      console.clear()
      void check()
    }, 200)
  }
  for (const dir of dirs) watch(dir, { recursive: true }, rerun)
  await check()
  console.log("\nWatching for changes; Ctrl+C to stop.")
} else {
  process.exitCode = (await check()) ? 1 : 0
}
