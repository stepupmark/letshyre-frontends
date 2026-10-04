import type { ReactNode } from "react"

type Block =
  | { type: "heading" | "p"; text: string }
  | { type: "code"; text: string }
  | { type: "ul" | "ol"; items: string[] }

const FENCE = /^\s*```/
const HEADING = /^\s*#{1,6}\s+(.*)$/
const BULLET = /^\s*[-*]\s+/
const NUMBERED = /^\s*\d+\.\s+/

// the subset coding questions use; rendered as elements, never as HTML
function parse(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n")
  const blocks: Block[] = []
  let i = 0
  const take = (test: RegExp) => {
    const items: string[] = []
    while (i < lines.length && test.test(lines[i] ?? ""))
      items.push((lines[i++] ?? "").replace(test, ""))
    return items
  }

  while (i < lines.length) {
    const line = lines[i] ?? ""
    if (FENCE.test(line)) {
      const code: string[] = []
      i++
      while (i < lines.length && !FENCE.test(lines[i] ?? ""))
        code.push(lines[i++] ?? "")
      i++
      blocks.push({ type: "code", text: code.join("\n") })
    } else if (HEADING.test(line)) {
      blocks.push({ type: "heading", text: HEADING.exec(line)?.[1] ?? "" })
      i++
    } else if (BULLET.test(line)) {
      blocks.push({ type: "ul", items: take(BULLET) })
    } else if (NUMBERED.test(line)) {
      blocks.push({ type: "ol", items: take(NUMBERED) })
    } else if (!line.trim()) {
      i++
    } else {
      const para: string[] = []
      while (
        i < lines.length &&
        (lines[i] ?? "").trim() &&
        ![FENCE, HEADING, BULLET, NUMBERED].some((re) =>
          re.test(lines[i] ?? "")
        )
      )
        para.push(lines[i++] ?? "")
      blocks.push({ type: "p", text: para.join("\n") })
    }
  }
  return blocks
}

function inline(text: string): ReactNode[] {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*|\n)/g).map((part, i) => {
    if (part === "\n") return <br key={i} />
    if (part.startsWith("`") && part.endsWith("`") && part.length > 1)
      return (
        <code
          key={i}
          className="rounded-sm bg-muted px-1 py-0.5 font-mono text-[0.9em]"
        >
          {part.slice(1, -1)}
        </code>
      )
    if (part.startsWith("**") && part.endsWith("**") && part.length > 3)
      return <strong key={i}>{part.slice(2, -2)}</strong>
    return part
  })
}

/** A question's Markdown: headings, lists, code and inline code. */
export function QuestionText({ markdown }: { markdown: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-3 text-sm/relaxed">
      {parse(markdown).map((block, i) => {
        switch (block.type) {
          case "heading":
            return (
              <p key={i} className="font-medium">
                {inline(block.text)}
              </p>
            )
          case "code":
            return (
              <pre
                key={i}
                className="overflow-x-auto rounded-md bg-muted px-4 py-3 font-mono text-[0.8125rem] leading-relaxed"
              >
                <code>{block.text}</code>
              </pre>
            )
          case "ul":
          case "ol": {
            const List = block.type
            return (
              <List
                key={i}
                className={
                  block.type === "ul"
                    ? "flex list-disc flex-col gap-1 ps-5"
                    : "flex list-decimal flex-col gap-1 ps-5"
                }
              >
                {block.items.map((item, j) => (
                  <li key={j}>{inline(item)}</li>
                ))}
              </List>
            )
          }
          default:
            return <p key={i}>{inline(block.text)}</p>
        }
      })}
    </div>
  )
}
