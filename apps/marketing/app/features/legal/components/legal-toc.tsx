import type { TocEntry } from "../lib/legal-doc"

export function LegalToc({
  entries,
  active,
}: {
  entries: TocEntry[]
  active?: string
}) {
  return (
    <ol className="flex flex-col gap-0.5 text-sm">
      {entries.map((entry) => (
        <li key={entry.id}>
          <a
            href={`#${entry.id}`}
            aria-current={entry.id === active ? "location" : undefined}
            className="block rounded-e-md border-s-2 border-border py-1.5 ps-3 pe-2 text-muted-foreground outline-none hover:border-brand/40 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=location]:border-brand aria-[current=location]:font-medium aria-[current=location]:text-primary"
          >
            {entry.title}
          </a>
          {entry.children.length > 0 && (
            <ol className="flex flex-col border-s-2 border-border">
              {entry.children.map((child) => (
                <li key={child.id}>
                  <a
                    href={`#${child.id}`}
                    className="block rounded-e-md py-1 ps-6 pe-2 text-xs text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {child.title}
                  </a>
                </li>
              ))}
            </ol>
          )}
        </li>
      ))}
    </ol>
  )
}
