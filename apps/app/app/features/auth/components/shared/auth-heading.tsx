import type { ReactNode } from "react"

export function AuthHeading({
  title,
  accent,
  lead,
}: {
  title: string
  accent?: string
  lead?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <h1
        tabIndex={-1}
        className="text-[1.75rem]/tight font-semibold tracking-tight text-balance outline-none sm:text-[2rem]/tight"
      >
        {title}
        {accent && (
          <>
            {" "}
            <span className="text-brand-text">{accent}</span>
          </>
        )}
      </h1>
      {lead && <p className="text-pretty text-muted-foreground">{lead}</p>}
    </div>
  )
}
