import { compile, createProcessor } from "@mdx-js/mdx"
import remarkFrontmatter from "remark-frontmatter"
import remarkGfm from "remark-gfm"

import { parsePost, type Post } from "../app/lib/blog/post.ts"
import { remarkGuard } from "../app/lib/blog/remark-guard.ts"

export interface Issue {
  level: "error" | "warning"
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
}

interface Node {
  type: string
  name?: string | null
  value?: string
  depth?: number
  url?: string
  position?: { start: { line: number } }
  attributes?: { name?: string; value?: unknown }[]
  children?: Node[]
}

export const TEMPLATE_DESCRIPTION =
  "Write one or two sentences for search results and the blog index."

// words that make a post read as generated; the style guide says what to write instead
const TELLS =
  /\b(delve|tapestry|game-changer|cutting-edge|seamless(?:ly)?|revolutioni[sz]e|unlock(?:s|ing)? the|in today's|fast-paced world|it's important to note|in conclusion|embark|elevate your)\b/i
const BRAND = /\b(?:Letshyre|LetsHire|Lets Hyre|letshyre)\b(?!\.ai)/
const LONG_SENTENCE = 35
const PHOTO_BYTES = 500 * 1024
const RASTER = /\.(png|jpe?g|webp)$/i

const processor = createProcessor({
  remarkPlugins: [remarkFrontmatter, remarkGfm],
})

function walk(node: Node, visit: (node: Node) => void) {
  visit(node)
  node.children?.forEach((child) => {
    walk(child, visit)
  })
}

const lineOf = (node: Node) => node.position?.start.line

const attr = (node: Node, name: string): string | undefined => {
  const value = node.attributes?.find((a) => a.name === name)?.value
  if (typeof value === "string") return value
  if (value && typeof value === "object" && "value" in value)
    return String(value.value)
  return undefined
}

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
  if (!ctx.has("og.jpg"))
    warn("no og.jpg; shares use the blog's image (README: Share image)")
  if (post.minutes > 3 && post.headings.length < 3)
    warn(
      `a ${post.minutes}-minute post with under three ## sections is hard to scan`
    )
  return issues
}

function bodyIssues(tree: Node, ctx: LintContext): Issue[] {
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

    if (node.type === "text" && node.value) {
      const tell = TELLS.exec(node.value)
      if (tell)
        add(
          "warning",
          node,
          `"${tell[0]}" reads as filler; say the specific thing`
        )
      const brand = BRAND.exec(node.value)
      if (brand) add("warning", node, `write "LetsHyre", not "${brand[0]}"`)
      if (node.value.includes("—"))
        add(
          "warning",
          node,
          "the blog doesn't use em dashes; use a comma or a full stop"
        )
      for (const sentence of node.value.split(/(?<=[.!?])\s+/))
        if (sentence.split(/\s+/).length > LONG_SENTENCE)
          add(
            "warning",
            node,
            `a ${sentence.split(/\s+/).length}-word sentence; split it`
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

  try {
    await compile(source, {
      remarkPlugins: [remarkFrontmatter, remarkGfm, remarkGuard],
    })
  } catch (error) {
    const { message, line } = error as { message: string; line?: number }
    return [{ level: "error", message, line }]
  }

  const tree = processor.parse(source) as Node
  return [...frontmatterIssues(post, ctx), ...bodyIssues(tree, ctx)].sort(
    (a, b) => (a.level === b.level ? 0 : a.level === "error" ? -1 : 1)
  )
}
