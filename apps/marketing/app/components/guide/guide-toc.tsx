import { ChevronDownIcon } from "lucide-react"

export interface TocGroup {
  title?: string
  items: readonly { anchor: string; label: string }[]
}

function TocLink({
  anchor,
  active,
  children,
}: {
  anchor: string
  active?: string
  children: string
}) {
  return (
    <a
      href={`#${anchor}`}
      aria-current={anchor === active ? "location" : undefined}
      className="block rounded-md px-2 py-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none aria-[current=location]:bg-brand/10 aria-[current=location]:font-medium aria-[current=location]:text-foreground"
    >
      {children}
    </a>
  )
}

export function TocLinks({
  groups,
  active,
}: {
  groups: readonly TocGroup[]
  active?: string
}) {
  return (
    <ul className="flex flex-col gap-3 text-sm">
      {groups.map((group, i) => (
        <li key={group.title ?? i}>
          {group.title && (
            <p className="px-2 pb-1 text-xs font-medium text-muted-foreground">
              {group.title}
            </p>
          )}
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => (
              <li key={item.anchor}>
                <TocLink anchor={item.anchor} active={active}>
                  {item.label}
                </TocLink>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  )
}

/** "On this page" for long guides: a sticky list on large screens, a disclosure on small ones. */
export function GuideToc({
  label,
  groups,
  active,
}: {
  label: string
  groups: readonly TocGroup[]
  active?: string
}) {
  return (
    <div className="lg:sticky lg:top-24 lg:self-start">
      <nav aria-label={label} className="lg:hidden">
        <details className="group rounded-xl border">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-xl p-4 text-sm font-medium focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none [&::-webkit-details-marker]:hidden">
            {label}
            <ChevronDownIcon
              aria-hidden
              className="size-4 text-muted-foreground transition-transform group-open:rotate-180"
            />
          </summary>
          <div className="border-t p-2">
            <TocLinks groups={groups} active={active} />
          </div>
        </details>
      </nav>
      <nav aria-label={label} className="hidden lg:block">
        <p className="px-2 text-sm font-medium">{label}</p>
        <div className="mt-3">
          <TocLinks groups={groups} active={active} />
        </div>
      </nav>
    </div>
  )
}
