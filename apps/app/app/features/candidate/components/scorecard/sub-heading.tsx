import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

export function SubHeading({
  icon: Icon,
  as: Tag = "h3",
  children,
}: {
  icon: LucideIcon
  as?: "h2" | "h3"
  children: ReactNode
}) {
  return (
    <Tag className="flex items-center gap-2 text-sm font-semibold text-balance text-brand-text">
      <span
        aria-hidden="true"
        className="grid size-6 shrink-0 place-items-center rounded-md bg-brand-muted [&_svg]:size-3.5"
      >
        <Icon />
      </span>
      {children}
    </Tag>
  )
}
