const FRONTMATTER = /^---(\r?\n)([\s\S]*?)\r?\n---/

/**
 * The post with `draft: true` removed and `publishedAt` set to `date`. Only those lines change, so
 * other fields, comments and line endings stay as the writer left them.
 */
export function publishSource(source: string, date: string): string {
  const match = FRONTMATTER.exec(source)
  if (!match) throw new Error("no frontmatter")
  const [block, eol = "\n", fields = ""] = match
  const lines = fields
    .split(eol)
    .filter((line) => !/^draft:\s*true\s*(#.*)?$/.test(line))
  const at = lines.findIndex((line) => line.startsWith("publishedAt:"))
  if (at === -1) lines.push(`publishedAt: ${date}`)
  else
    lines[at] = (lines[at] ?? "").replace(
      /^publishedAt:\s*[^\s#]*/,
      `publishedAt: ${date}`
    )
  return source.replace(block, `---${eol}${lines.join(eol)}${eol}---`)
}
