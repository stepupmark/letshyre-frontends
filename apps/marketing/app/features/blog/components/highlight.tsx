const escape = (word: string) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

export function Highlight({
  text,
  words = [],
}: {
  text: string
  words?: readonly string[]
}) {
  if (words.length === 0) return text
  const parts = text.split(new RegExp(`(${words.map(escape).join("|")})`, "gi"))
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="rounded-xs bg-brand-muted text-inherit">
        {part}
      </mark>
    ) : (
      part
    )
  )
}
