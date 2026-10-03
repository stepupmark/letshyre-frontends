/** Splits `a <tag>b</tag> c` around the first `<tag>`, or returns `null` when it isn't there. */
export function splitTag(
  text: string,
  tag: string
): { before: string; inner: string; after: string } | null {
  const match = new RegExp(`<${tag}>(.*?)</${tag}>`).exec(text)
  if (!match) return null
  return {
    before: text.slice(0, match.index),
    inner: match[1] ?? "",
    after: text.slice(match.index + match[0].length),
  }
}
