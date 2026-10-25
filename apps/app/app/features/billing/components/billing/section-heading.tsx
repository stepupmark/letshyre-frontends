import type { ReactNode } from "react"

export function SectionHeading({
  id,
  title,
  lead,
}: {
  id: string
  title: ReactNode
  lead: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <h2
        id={id}
        className="text-lg font-semibold tracking-tight text-balance text-brand-text"
      >
        {title}
      </h2>
      <p className="text-sm text-pretty text-muted-foreground">{lead}</p>
    </div>
  )
}
