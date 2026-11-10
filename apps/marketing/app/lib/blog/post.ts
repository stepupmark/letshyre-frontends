// Node loads this through react-router.config.ts, so no Vite-only imports. Pages import list.ts.

import { createProcessor } from "@mdx-js/mdx"
import { isLocale, type Locale } from "@workspace/i18n"
import GithubSlugger from "github-slugger"
import remarkFrontmatter from "remark-frontmatter"
import remarkGfm from "remark-gfm"
import { parse as parseYaml } from "yaml"
import { z } from "zod"

import { AUTHORS } from "./authors.ts"
import { TOPICS, visiblePosts } from "./list.ts"

export type { Topic } from "./list.ts"

const AUDIENCES = ["employers", "candidates", "everyone"] as const

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const frontmatterSchema = z
  .strictObject({
    title: z.string().min(1),
    metaTitle: z.string().min(1).optional(),
    description: z.string().min(1),
    publishedAt: z.iso.date(),
    updatedAt: z.iso.date().optional(),
    audience: z.enum(AUDIENCES),
    topic: z.enum(TOPICS),
    author: z
      .string()
      .refine((id) => id in AUTHORS, "isn't in app/lib/blog/authors.ts")
      .optional(),
    series: z
      .string()
      .regex(SLUG, "isn't a lowercase-hyphenated id")
      .optional(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
  })
  .refine((post) => !post.updatedAt || post.updatedAt >= post.publishedAt, {
    message: "updatedAt is before publishedAt",
    path: ["updatedAt"],
  })

export interface Heading {
  id: string
  text: string
}

/** A study cited by a `<Stat>` has a title; a link in the text has the words that link it. */
export interface Source {
  url: string
  title?: string
  linkText?: string
}

export type Post = z.output<typeof frontmatterSchema> & {
  slug: string
  lang: Locale
  minutes: number
  headings: Heading[]
  /** Every external link and study, in reading order, numbered by its place here. */
  sources: Source[]
  /** Has a `<Feature>`, so it skips the mid-post call to action. */
  promoted: boolean
  /** `<slug>/cover.svg`, and `cover-dark.svg` if drawn. */
  cover?: { src: string; srcDark?: string }
  /** Set on staging builds for a draft or a post that isn't due yet. */
  preview?: true
}

/** What a card shows, and all that index pages and search get. */
export type PostSummary = Pick<
  Post,
  | "slug"
  | "title"
  | "description"
  | "topic"
  | "publishedAt"
  | "updatedAt"
  | "minutes"
  | "draft"
  | "cover"
  | "preview"
>

const FILE = /([^/\\]+)[/\\]([^/\\]+)\.mdx$/
// Segments under /blogs that belong to the blog's own pages, now or later.
const RESERVED_SLUGS = ["topics", "page", "authors", "feed"]
const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/

interface Node {
  type: string
  name?: string | null
  value?: string
  depth?: number
  url?: string
  identifier?: string
  attributes?: { name?: string; value?: unknown }[]
  children?: Node[]
}

// the compiler's own parser, so headings and links match what the page renders
const processor = createProcessor({
  remarkPlugins: [remarkFrontmatter, remarkGfm],
})

const TEXT = new Set(["text", "inlineCode", "code"])

const textOf = (node: Node): string =>
  TEXT.has(node.type)
    ? (node.value ?? "")
    : (node.children ?? []).map(textOf).join("")

function walk(node: Node, visit: (node: Node) => void) {
  visit(node)
  node.children?.forEach((child) => {
    walk(child, visit)
  })
}

const contains = (node: Node, name: string): boolean =>
  node.name === name ||
  (node.children ?? []).some((child) => contains(child, name))

function readingMinutes(tree: Node, lang: Locale): number {
  const parts: string[] = []
  walk(tree, (node) => {
    if (TEXT.has(node.type)) parts.push(node.value ?? "")
  })
  let words = 0
  for (const segment of new Intl.Segmenter(lang, {
    granularity: "word",
  }).segment(parts.join(" "))) {
    if (segment.isWordLike) words++
  }
  return Math.max(1, Math.round(words / 200))
}

/** The h2s, with the ids rehype-slug gives them; every level is slugged so duplicates count alike. */
function headingsOf(tree: Node): Heading[] {
  const slugger = new GithubSlugger()
  const headings: Heading[] = []
  walk(tree, (node) => {
    if (node.type !== "heading") return
    const text = textOf(node)
    const id = slugger.slug(text)
    if (node.depth === 2) headings.push({ id, text })
  })
  return headings
}

const tidy = (text: string) => text.replace(/\s+/g, " ").trim()

const attr = (node: Node, name: string) => {
  const value = node.attributes?.find((a) => a.name === name)?.value
  return typeof value === "string" ? value : undefined
}

function sourcesOf(tree: Node): Source[] {
  const definitions = new Map<string, string>()
  walk(tree, (node) => {
    if (node.type === "definition" && node.identifier && node.url)
      definitions.set(node.identifier, node.url)
  })

  const sources = new Map<string, Source>()
  const add = (source: Source) => {
    if (source.url.startsWith("https://") && !sources.has(source.url))
      sources.set(source.url, source)
  }
  walk(tree, (node) => {
    if (node.type === "link" && node.url)
      add({ url: node.url, linkText: tidy(textOf(node)) })
    else if (node.type === "linkReference" && node.identifier) {
      const url = definitions.get(node.identifier)
      if (url) add({ url, linkText: tidy(textOf(node)) })
    } else if (node.name === "Stat") {
      const url = attr(node, "source")
      if (url) add({ url, title: attr(node, "cite") })
    }
  })
  return [...sources.values()]
}

/** Reads `<slug>/<lang>.mdx`; throws with the file name so a bad post fails the build. */
export function parsePost(file: string, source: string): Post {
  const [, slug = "", lang = ""] = FILE.exec(file) ?? []
  const fail = (reason: string): never => {
    throw new Error(`${file}: ${reason}`)
  }
  if (!SLUG.test(slug)) fail(`"${slug}" isn't a lowercase-hyphenated slug`)
  if (RESERVED_SLUGS.includes(slug)) fail(`"${slug}" is a reserved slug`)
  if (!isLocale(lang)) fail(`"${lang}" isn't a locale`)

  const match = FRONTMATTER.exec(source)
  if (!match) return fail("no frontmatter")
  const result = frontmatterSchema.safeParse(parseYaml(match[1] ?? ""))
  if (!result.success) return fail(z.prettifyError(result.error))

  const tree = processor.parse(source.slice(match[0].length)) as Node
  return {
    ...result.data,
    slug,
    lang: lang as Locale,
    minutes: readingMinutes(tree, lang as Locale),
    headings: headingsOf(tree),
    sources: sourcesOf(tree),
    promoted: contains(tree, "Feature"),
  }
}

/** Every post file, as `[path, source]`, parsed; drafts and future posts only when `previews`. */
export const parsePosts = (
  files: readonly (readonly [string, string])[],
  previews: boolean
): Post[] =>
  visiblePosts(
    files.map(([file, source]) => parsePost(file, source)),
    previews
  )
