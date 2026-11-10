import type { ReactNode } from "react"

export function Quote({
  by,
  role,
  children,
}: {
  by: string
  role?: string
  children: ReactNode
}) {
  return (
    <figure className="my-2 flex flex-col gap-4 rounded-xl border p-6 print:break-inside-avoid">
      <blockquote className="flex flex-col gap-3 text-lg text-pretty text-foreground">
        {children}
      </blockquote>
      <figcaption className="flex flex-col text-sm">
        <span className="font-medium text-foreground">{by}</span>
        {role && <span className="text-muted-foreground">{role}</span>}
      </figcaption>
    </figure>
  )
}
