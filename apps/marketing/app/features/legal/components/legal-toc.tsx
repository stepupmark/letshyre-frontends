import type { TocEntry } from "../lib/legal-doc"

export function LegalToc({
  entries,
  active,
}: {
  entries: TocEntry[]
  active?: string
}) {
  return (
    <ol className="flex flex-col gap-1 text-sm">
      {entries.map((entry) => (
        <li key={entry.id}>
          <a
            href={`#${entry.id}`}
            aria-current={entry.id === active ? "location" : undefined}
            className="block border-s-2 border-transparent py-1 ps-3 text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none aria-[current=location]:border-foreground aria-[current=location]:font-medium aria-[current=location]:text-foreground"
          >
            {entry.title}
          </a>
        </li>
      ))}
    </ol>
  )
}
