import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

const isEmpty = (value: ReactNode) =>
  value == null || value === false || value === ""

/** One labelled fact in a `<dl>`, with an icon tile. */
export function FactRow({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon
  label: string
  children: ReactNode
}) {
  // the icon lives inside <dt> because a <dl> row may only hold dt and dd
  return (
    <div className="relative flex min-w-0 flex-col gap-0.5 ps-11">
      <dt className="text-xs text-muted-foreground">
        <span
          aria-hidden="true"
          className="absolute inset-s-0 top-0 grid size-8 place-items-center rounded-lg bg-muted [&_svg]:size-4"
        >
          <Icon />
        </span>
        {label}
      </dt>
      <dd className="min-w-0 text-sm font-medium text-pretty wrap-break-word">
        {isEmpty(children) ? "—" : children}
      </dd>
    </div>
  )
}
