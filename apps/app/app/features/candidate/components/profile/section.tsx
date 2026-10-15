import { cn } from "@workspace/ui/lib/utils"
import type { LucideIcon } from "lucide-react"
import { useId, type ReactNode } from "react"

/** A titled part of a profile; `boxed` gives it its own border, for side panels. */
export function Section({
  title,
  icon: Icon,
  action,
  boxed = false,
  delay = 0,
  children,
}: {
  title: string
  icon: LucideIcon
  action?: ReactNode
  boxed?: boolean
  /** ms, to stagger sections as the page settles */
  delay?: number
  children: ReactNode
}) {
  const id = useId()
  return (
    <section
      aria-labelledby={id}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "settle flex flex-col gap-4",
        boxed && "rounded-xl border p-4 sm:p-5"
      )}
    >
      <div className="flex min-h-8 items-center justify-between gap-3">
        <h2
          id={id}
          className="flex items-center gap-2 text-base font-semibold text-balance text-brand-text"
        >
          <Icon aria-hidden="true" className="size-4 shrink-0" />
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}
