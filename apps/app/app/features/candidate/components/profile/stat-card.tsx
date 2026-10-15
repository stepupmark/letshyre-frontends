import type { LucideIcon } from "lucide-react"

export function StatCard({
  icon: Icon,
  label,
  value,
  delay = 0,
}: {
  icon: LucideIcon
  label: string
  value: string
  delay?: number
}) {
  return (
    <div
      className="settle flex h-full flex-col items-start gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-muted text-brand-text sm:size-12 [&_svg]:size-5"
      >
        <Icon />
      </span>
      <dl className="flex min-w-0 flex-col gap-0.5">
        <dt className="text-sm text-muted-foreground">{label}</dt>
        <dd dir="ltr" className="text-lg font-semibold tabular-nums sm:text-xl">
          {value}
        </dd>
      </dl>
    </div>
  )
}
