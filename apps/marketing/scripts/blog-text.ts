import { parsePost, type Post } from "../app/lib/blog/post.ts"
import type { Issue } from "./blog-lint.ts"
import { lineOf, type Node, textOf, walk } from "./mdx-tree.ts"

// words that make a post read as generated; the style guide says what to write instead
const TELLS =
  /\b(delve|tapestry|game-changer|cutting-edge|seamless(?:ly)?|revolutioni[sz]e|unlock(?:s|ing)? the|in today's|fast-paced world|it's important to note|in conclusion|embark|elevate your|leverag(?:e|es|ed|ing)|empower(?:s|ed|ing)?|crucial|pivotal|the (?:hiring|job|talent) landscape)\b/i
const BRAND = /\b(?:Letshyre|LetsHire|Lets Hyre|letshyre)\b(?!\.ai)/
const LONG_SENTENCE = 35
const LONG_PARAGRAPH = 6
// a revision this size is more than a typo fix
const REVISED_LINES = 5

// fine once, but repeated they make every post sound alike (docs/blog-style.md, Voice)
const HABITS = [
  {
    name: '"actually"',
    pattern: /\bactually\b/gi,
    allowed: 2,
    fix: "keep it only where it marks a real contrast",
  },
  {
    name: "the \"isn't X. It's Y\" turn",
    pattern:
      /\b(?:isn't|aren't|wasn't|weren't|not)\b[^.!?]{3,80}\.\s+(?:It's|They're|That's)\b/g,
    allowed: 1,
    fix: "say the second half on its own",
  },
  {
    name: '", exactly."',
    pattern: /, exactly\./g,
    allowed: 0,
    fix: "say what was or wasn't wrong",
  },
] as const

// a word in italics or code is mentioned, not used, so the filler check skips it
const usedTextOf = (node: Node): string =>
  node.type === "emphasis" || node.type === "inlineCode"
    ? ""
    : node.type === "text"
      ? (node.value ?? "")
      : (node.children ?? []).map(usedTextOf).join("")

const sentencesOf = (text: string) =>
  text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?]["”’)]?)\s+/)
    .filter(Boolean)

const bodyLines = (source: string) =>
  source
    .replace(/^---\r?\n[\s\S]*?\r?\n---/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

/** Lines of `after`'s body that aren't in `before`'s. */
function changedLines(before: string, after: string) {
  const old = new Map<string, number>()
  for (const line of bodyLines(before)) old.set(line, (old.get(line) ?? 0) + 1)
  let changed = 0
  for (const line of bodyLines(after)) {
    const left = old.get(line) ?? 0
    if (left) old.set(line, left - 1)
    else changed++
  }
  return changed
}

export /** The voice rules from docs/blog-style.md, on each paragraph's and heading's whole text. */
function textIssues(tree: Node): Issue[] {
  const issues: Issue[] = []
  const habits = HABITS.map((habit) => ({
    ...habit,
    count: 0,
    line: undefined as number | undefined,
  }))
  let opened = false
  walk(tree, (node) => {
    if (node.type !== "paragraph" && node.type !== "heading") return
    const text = textOf(node)
    const add = (level: Issue["level"], message: string) =>
      issues.push({ level, message, line: lineOf(node) })
    for (const habit of habits) {
      habit.count += usedTextOf(node).match(habit.pattern)?.length ?? 0
      if (habit.count > habit.allowed) habit.line ??= lineOf(node)
    }
    const tell = TELLS.exec(usedTextOf(node))
    if (tell)
      add("warning", `"${tell[0]}" reads as filler; say the specific thing`)
    const brand = BRAND.exec(text)
    if (brand) add("warning", `write "LetsHyre", not "${brand[0]}"`)
    if (text.includes("—"))
      add(
        "warning",
        "the blog doesn't use em dashes; use a comma or a full stop"
      )
    if (node.type === "heading") return
    const sentences = sentencesOf(text)
    if (!opened && sentences[0]?.endsWith("?"))
      add("suggestion", "the post opens on a question; open on what happened")
    opened = true
    for (const sentence of sentences) {
      const words = sentence.split(" ").length
      if (words > LONG_SENTENCE)
        add("warning", `a ${words}-word sentence; split it`)
    }
    if (sentences.length > LONG_PARAGRAPH)
      add(
        "warning",
        `a ${sentences.length}-sentence paragraph; three or four read best`
      )
  })
  for (const { name, fix, count, line } of habits)
    if (line)
      issues.push({
        level: "suggestion",
        message: `${name} ${count === 1 ? "once" : `${count} times`}; ${fix}`,
        line,
      })
  return issues
}

export function revisionIssues(
  file: string,
  source: string,
  post: Post,
  before: string | undefined
): Issue[] {
  if (!before || post.draft) return []
  let old: Post
  try {
    old = parsePost(file, before)
  } catch {
    return []
  }
  const changed = changedLines(before, source)
  if (old.draft || old.updatedAt !== post.updatedAt || changed <= REVISED_LINES)
    return []
  return [
    {
      level: "suggestion",
      message: `${changed} lines of the post changed; if it's a real revision, set updatedAt to today`,
    },
  ]
}
