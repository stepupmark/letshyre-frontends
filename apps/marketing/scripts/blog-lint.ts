import { compile, createProcessor } from "@mdx-js/mdx"
import remarkFrontmatter from "remark-frontmatter"
import remarkGfm from "remark-gfm"

import { MIN_TAG_POSTS } from "../app/lib/blog/list.ts"
import { parsePost, type Post } from "../app/lib/blog/post.ts"
import { remarkGuard } from "../app/lib/blog/remark-guard.ts"
import { revisionIssues, textIssues } from "./blog-text.ts"
import { attr, lineOf, type Node, textOf, walk } from "./mdx-tree.ts"

export interface Issue {
  level: "error" | "warning" | "suggestion"
  message: string
  line?: number
}

export interface Image {
  width: number
  height: number
  bytes: number
}

export interface LintContext {
  /** Every path the site prerenders, as `/<lang>/…`. */
  paths: ReadonlySet<string>
  /** An image beside the post, by file name; undefined if it isn't there. */
  image: (name: string) => Image | undefined
  /** Whether a file sits beside the post. */
  has: (name: string) => boolean
  /** Glossary entries in the post's locale, by every name they go by. */
  terms?: readonly { id: string; names: readonly string[] }[]
  /** The other posts in the post's locale. */
  posts?: readonly { path: string; title: string; tags: readonly string[] }[]
  /** The file as it is on the base branch, to spot revisions that need `updatedAt`. */
  before?: string
  /** Files beside the post that are still `cover-template.svg` unchanged. */
  placeholders?: readonly string[]
}

export const TEMPLATE_DESCRIPTION =
  "Write one or two sentences for search results and the blog index."

const PHOTO_BYTES = 500 * 1024
const RASTER = /\.(png|jpe?g|webp)$/i
const MAX_POST_SUGGESTIONS = 3

const processor = createProcessor({
  remarkPlugins: [remarkFrontmatter, remarkGfm],
})

const imports = (tree: Node) => {
  const found = new Map<string, string>()
  walk(tree, (node) => {
    if (node.type !== "mdxjsEsm") return
    for (const m of (node.value ?? "").matchAll(
      /import (\w+) from "\.\/([^"]+)"/g
    ))
      found.set(m[1] ?? "", m[2] ?? "")
  })
  return found
}

function frontmatterIssues(post: Post, ctx: LintContext): Issue[] {
  const issues: Issue[] = []
  const warn = (message: string) => issues.push({ level: "warning", message })
  if (post.description === TEMPLATE_DESCRIPTION)
    issues.push({
      level: "error",
      message: "description is still the template's; write the post's own",
    })
  else if (post.description.length < 70 || post.description.length > 160)
    warn(
      `description is ${post.description.length} characters; search shows 70 to 160 best`
    )
  if ((post.metaTitle ?? post.title).length > 70)
    warn("title is over 70 characters; add a shorter metaTitle for search")
  if (!ctx.has("cover.svg"))
    warn("no cover.svg; the card shows the topic icon (README: Cover)")
  for (const name of ctx.placeholders ?? [])
    warn(`${name} is still the template; draw the post's own (README: Cover)`)
  if (!ctx.has("og.jpg"))
    warn("no og.jpg; shares use the blog's image (README: Share image)")
  if (post.minutes > 3 && post.headings.length < 3)
    warn(
      `a ${post.minutes}-minute post with under three ## sections is hard to scan`
    )
  return issues
}

function bodyIssues(
  tree: Node,
  ctx: Pick<LintContext, "paths" | "image">
): Issue[] {
  const issues: Issue[] = []
  const add = (level: Issue["level"], node: Node, message: string) =>
    issues.push({ level, message, line: lineOf(node) })
  const images = imports(tree)
  let depth = 1

  walk(tree, (node) => {
    if (node.type === "heading" && node.depth) {
      if (node.depth === 1)
        add(
          "error",
          node,
          "use ## for sections; the title is the page's only #"
        )
      else if (node.depth > depth + 1)
        add(
          "error",
          node,
          `#${"#".repeat(depth)} jumps to ${"#".repeat(node.depth)}; don't skip a level`
        )
      depth = node.depth
    }

    if (node.type === "link" && node.url?.startsWith("/")) {
      const path = node.url.replace(/[?#].*$/, "").replace(/\/$/, "")
      if (!ctx.paths.has(path))
        add("error", node, `${node.url} isn't a page on the site`)
    }

    if (node.name === "Figure") {
      const alt = attr(node, "alt") ?? ""
      if (
        /\.(svg|png|jpe?g|webp)$/i.test(alt) ||
        /^(image|img|picture|chart|figure|screenshot)\s*\d*$/i.test(alt)
      )
        add("error", node, `alt "${alt}" should say what the image shows`)
      const file = images.get(attr(node, "src") ?? "")
      const image = file ? ctx.image(file) : undefined
      const width = Number(attr(node, "width"))
      const height = Number(attr(node, "height"))
      if (image && Math.abs(width / height - image.width / image.height) > 0.02)
        add(
          "error",
          node,
          `width and height (${width} × ${height}) don't match ${file} (${image.width} × ${image.height})`
        )
    }
  })

  for (const file of new Set(images.values())) {
    const image = RASTER.test(file) ? ctx.image(file) : undefined
    if (image && image.bytes > PHOTO_BYTES)
      issues.push({
        level: "warning",
        message: `${file} is ${Math.round(image.bytes / 1024)} kB; keep photos under 500 kB`,
      })
  }
  return issues
}

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

/** Glossary words the post uses without a `<Term>`, and posts on its tags it doesn't link yet. */
function linkSuggestions(post: Post, tree: Node, ctx: LintContext): Issue[] {
  const texts: string[] = []
  const links = new Set<string>()
  walk(tree, (node) => {
    if (node.type === "text" && node.value) texts.push(node.value)
    if (node.type === "link" && node.url?.startsWith("/"))
      links.add(node.url.replace(/[?#].*$/, "").replace(/\/$/, ""))
  })
  const text = texts.join(" ")
  const issues: Issue[] = []

  for (const term of ctx.terms ?? []) {
    if (post.terms.includes(term.id)) continue
    const name = term.names.find((n) =>
      new RegExp(
        `(?<![\\p{L}\\p{N}])${escape(n)}(?![\\p{L}\\p{N}])`,
        "iu"
      ).test(text)
    )
    if (name)
      issues.push({
        level: "suggestion",
        message: `mentions "${name}"; wrap the first one in <Term id="${term.id}"> so readers can look it up`,
      })
  }

  const related = (ctx.posts ?? [])
    .map((other) => ({
      ...other,
      shared: other.tags.filter((tag) => (post.tags as string[]).includes(tag)),
    }))
    .filter((other) => other.shared.length > 0 && !links.has(other.path))
    .sort((a, b) => b.shared.length - a.shared.length)
    .slice(0, MAX_POST_SUGGESTIONS)
  for (const other of related)
    issues.push({
      level: "suggestion",
      message: `"${other.title}" (${other.path}) is also tagged ${other.shared.join(", ")}; link it where it helps the reader`,
    })

  if (!post.draft)
    for (const tag of post.tags) {
      const count =
        1 + (ctx.posts ?? []).filter((other) => other.tags.includes(tag)).length
      if (count === MIN_TAG_POSTS - 1)
        issues.push({
          level: "suggestion",
          message: `${tag} has ${count} posts; one more gives it a page`,
        })
    }
  return issues
}

const RANK = { error: 0, warning: 1, suggestion: 2 } as const

async function compileIssue(source: string): Promise<Issue | undefined> {
  try {
    await compile(source, {
      remarkPlugins: [remarkFrontmatter, remarkGfm, remarkGuard],
    })
    return undefined
  } catch (error) {
    const { message, line } = error as { message: string; line?: number }
    return { level: "error", message, line }
  }
}

/** Everything wrong with one post file, worst first; the build would fail on the errors. */
export async function lintPost(
  file: string,
  source: string,
  ctx: LintContext
): Promise<Issue[]> {
  let post: Post
  try {
    post = parsePost(file, source)
  } catch (error) {
    return [
      {
        level: "error",
        message: (error as Error).message.replace(`${file}: `, ""),
      },
    ]
  }

  const failed = await compileIssue(source)
  if (failed) return [failed]

  const tree = processor.parse(source) as Node
  return [
    ...frontmatterIssues(post, ctx),
    ...bodyIssues(tree, ctx),
    ...textIssues(tree),
    ...revisionIssues(file, source, post, ctx.before),
    ...linkSuggestions(post, tree, ctx),
  ].sort((a, b) => RANK[a.level] - RANK[b.level])
}

/**
 * A glossary entry's or topic guide's body, by the same rules as a post's; the build checks its
 * frontmatter. `short` is an entry's hover text, which its page shows above the body.
 */
export async function lintBody(
  source: string,
  paths: ReadonlySet<string>,
  short?: string
): Promise<Issue[]> {
  const failed = await compileIssue(source)
  if (failed) return [failed]
  const tree = processor.parse(source) as Node
  const first = tree.children?.find((node) => node.type === "paragraph")
  const tidy = (text: string) => text.replace(/\s+/g, " ").trim().toLowerCase()
  const repeats = short && first && tidy(textOf(first)).startsWith(tidy(short))
  return [
    ...bodyIssues(tree, { paths, image: () => undefined }),
    ...textIssues(tree),
    ...(repeats
      ? [
          {
            level: "warning" as const,
            message:
              "the body opens with the short definition, so the page shows it twice",
            line: lineOf(first),
          },
        ]
      : []),
  ].sort((a, b) => RANK[a.level] - RANK[b.level])
}
