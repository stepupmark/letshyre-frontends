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
        className="font-display short:sm:text-[2.75rem] text-[2.5rem] leading-[1.05] tracking-tight text-balance outline-none sm:text-5xl"
      >
        {title}
        {accent && (
          <>
            {" "}
            <em className="text-brand-text">{accent}</em>
          </>
        )}
      </h1>
      {lead && (
        <p className="text-pretty text-muted-foreground sm:text-lg">{lead}</p>
      )}
    </div>
  )
}
